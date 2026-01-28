import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import Log from '@/models/Log';
import { verifyToken } from '@/lib/auth';
import { NextResponse } from 'next/server';

// PUT: Update product
export async function PUT(req, { params }) {
    try {
        await dbConnect();
        const resolvedParams = await params;

        // Auth Check
        const token = req.cookies.get('token')?.value;
        const decoded = verifyToken(token);
        if (!decoded) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { name, brand, price, stock, image } = body;

        const product = await Product.findById(resolvedParams.id);
        if (!product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        // Calculate stock difference for logging
        const oldStock = product.stock;
        const newStock = Number(stock);
        const diff = newStock - oldStock;

        // Update fields
        product.name = name || product.name;
        product.brand = brand || product.brand;
        product.price = Number(price);
        product.stock = newStock;
        product.image = image || product.image;

        await product.save();

        // Log if stock changed
        if (diff !== 0) {
            await Log.create({
                action: diff > 0 ? 'ADD' : 'SELL', // Simplification: negative edit handled as sell/adjustment
                user: decoded.username,
                productName: product.name,
                qtyChange: diff,
                details: 'Stock update via edit'
            });
        } else if (name !== product.name || Number(price) !== product.price) {
            // Log detail update if needed, currently only logging stock movements per requirements mostly
            await Log.create({
                action: 'EDIT',
                user: decoded.username,
                productName: product.name,
                qtyChange: 0,
                details: 'Updated details'
            });
        }

        return NextResponse.json(product);

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
    }
}

// DELETE: Remove product
export async function DELETE(req, { params }) {
    try {
        await dbConnect();
        const resolvedParams = await params;

        // Auth Check
        const token = req.cookies.get('token')?.value;
        const decoded = verifyToken(token);
        if (!decoded) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const product = await Product.findByIdAndDelete(resolvedParams.id);
        if (!product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        await Log.create({
            action: 'DELETE',
            user: decoded.username,
            productName: product.name,
            qtyChange: -product.stock,
            details: 'Product deleted'
        });

        return NextResponse.json({ message: 'Product deleted' });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
    }
}
