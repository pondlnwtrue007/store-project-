import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import Log from '@/models/Log';
import { verifyToken } from '@/lib/auth';
import { NextResponse } from 'next/server';

// GET: List all products (with search)
export async function GET(req) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const q = searchParams.get('q');

        let query = {};
        if (q) {
            query = {
                $or: [
                    { name: { $regex: q, $options: 'i' } },
                    { brand: { $regex: q, $options: 'i' } },
                ]
            };
        }

        const products = await Product.find(query).sort({ createdAt: -1 });
        return NextResponse.json(products);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
    }
}

// POST: Create new product
export async function POST(req) {
    try {
        await dbConnect();

        // Auth Check
        const token = req.cookies.get('token')?.value;
        const decoded = verifyToken(token);
        if (!decoded) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { name, brand, price, stock, image } = body;

        if (!name || !price) {
            return NextResponse.json({ error: 'Name and Price are required' }, { status: 400 });
        }

        const product = await Product.create({
            name,
            brand,
            price: Number(price),
            stock: Number(stock) || 0,
            image
        });

        // Log the creation
        await Log.create({
            action: 'ADD',
            user: decoded.username,
            productName: product.name,
            qtyChange: product.stock,
            details: 'Initial stock'
        });

        return NextResponse.json(product, { status: 201 });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
    }
}
