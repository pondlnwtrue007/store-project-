import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import Log from '@/models/Log';
import { verifyToken } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function POST(req) {
    try {
        await dbConnect();

        // Auth Check (Any logged in user can sell)
        const token = req.cookies.get('token')?.value;
        const decoded = verifyToken(token);
        if (!decoded) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { items } = await req.json(); // items: [{ productId, name, qty, price }]

        if (!items || !Array.isArray(items) || items.length === 0) {
            return NextResponse.json({ error: 'No items in cart' }, { status: 400 });
        }

        // Process transactions sequentially to ensure stock accuracy
        const results = [];
        const errors = [];

        for (const item of items) {
            const product = await Product.findById(item.productId);
            if (!product) {
                errors.push(`Product ${item.name} not found`);
                continue;
            }

            if (product.stock < item.qty) {
                errors.push(`Not enough stock for ${product.name} (Available: ${product.stock})`);
                continue;
            }

            // Deduct stock
            product.stock -= item.qty;
            await product.save();

            // Create Sale Log
            await Log.create({
                action: 'SELL',
                user: decoded.username,
                productName: product.name,
                qtyChange: -item.qty, // Negative for reduction
                details: `POS Sale: ${item.qty} units @ ฿${item.price} (Cost: ฿${product.price})`
            });

            results.push(product.name);
        }

        if (errors.length > 0 && results.length === 0) {
            return NextResponse.json({ error: errors.join(', ') }, { status: 400 });
        }

        return NextResponse.json({
            message: 'Checkout successful',
            processed: results,
            errors: errors.length > 0 ? errors : null
        });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Checkout failed' }, { status: 500 });
    }
}
