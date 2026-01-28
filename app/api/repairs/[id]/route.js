import dbConnect from '@/lib/db';
import Repair from '@/models/Repair';
import Product from '@/models/Product';
import Log from '@/models/Log';
import { verifyToken } from '@/lib/auth';
import { NextResponse } from 'next/server';

// GET Single Repair
export async function GET(req, { params }) {
    try {
        await dbConnect();
        const repair = await Repair.findById(params.id);
        if (!repair) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        return NextResponse.json(repair);
    } catch (error) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

// PUT Update Repair (Status, Details, Add Part)
export async function PUT(req, { params }) {
    try {
        await dbConnect();
        const token = req.cookies.get('token')?.value;
        const decoded = verifyToken(token);
        if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await req.json();
        const { action, partId, laborCost, status } = body;

        const repair = await Repair.findById(params.id);
        if (!repair) return NextResponse.json({ error: 'Not found' }, { status: 404 });

        // Logic for specific actions
        if (action === 'addPart') {
            const product = await Product.findById(partId);
            if (!product) return NextResponse.json({ error: 'Part not found' }, { status: 404 });
            if (product.stock < 1) return NextResponse.json({ error: 'Out of stock' }, { status: 400 });

            // Deduct Stock
            product.stock -= 1;
            await product.save();

            // Log usage
            await Log.create({
                action: 'SELL', // Or 'USE' ? Let's stick to SELL for stock reduction logic consistency or 'EDIT'
                user: decoded.username,
                productName: product.name,
                qtyChange: -1,
                details: `Used in Repair #${repair._id.toString().slice(-6)}`
            });

            // Add to Repair
            repair.parts.push({
                productId: product._id,
                name: product.name,
                price: product.price, // Locking in cost price? Or selling price? usually cost + markup. Let's use product price as cost basis.
                qty: 1
            });
            await repair.save();

        } else if (action === 'updateLabor') {
            repair.laborCost = laborCost;
            await repair.save();

        } else if (action === 'updateStatus') {
            repair.status = status;
            // If completed, maybe log revenue? sticking to simple status for now.
            if (status === 'Completed') {
                // Could log 'Service Revenue' here if we had a separate model, otherwise just keeping record.
            }
            await repair.save();
        } else {
            // Generic update (e.g. details)
            Object.assign(repair, body);
            await repair.save();
        }

        return NextResponse.json(repair);

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Update failed' }, { status: 500 });
    }
}

// DELETE Repair
export async function DELETE(req, { params }) {
    try {
        await dbConnect();
        // verify admin? or just allowed
        await Repair.findByIdAndDelete(params.id);
        return NextResponse.json({ message: 'Deleted' });
    } catch (error) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
