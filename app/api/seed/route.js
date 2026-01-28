import dbConnect from '@/lib/db';
import User from '@/models/User';
import Product from '@/models/Product';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        await dbConnect();

        // Check if admin exists
        const existingAdmin = await User.findOne({ role: 'admin' });
        if (existingAdmin) {
            return NextResponse.json({ message: 'Admin already exists', username: existingAdmin.username });
        }

        const hashedPassword = await bcrypt.hash('1234', 10);

        const admin = await User.create({
            username: 'admin',
            password: hashedPassword,
            role: 'admin'
        });

        // Seed Products if empty
        const productCount = await Product.countDocuments();
        if (productCount === 0) {
            await Product.create([
                { name: 'iPhone 15 Pro', brand: 'Apple', price: 42900, stock: 10, image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&q=80&w=2070' },
                { name: 'Samsung S24 Ultra', brand: 'Samsung', price: 46900, stock: 8, image: 'https://images.unsplash.com/photo-1706149390084-722129d332e9?auto=format&fit=crop&q=80&w=2070' },
                { name: 'MacBook Air M2', brand: 'Apple', price: 34900, stock: 5, image: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&q=80&w=2070' },
                { name: 'Sony WH-1000XM5', brand: 'Sony', price: 10900, stock: 15, image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&q=80&w=1976' },
                { name: 'iPad Air 5', brand: 'Apple', price: 23900, stock: 12, image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&q=80&w=2030' },
            ]);
            console.log('Sample products created');
        }

        return NextResponse.json({ message: 'Admin created successfully', username: admin.username, password: '1234' });
    } catch (error) {
        console.error('Seed error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
