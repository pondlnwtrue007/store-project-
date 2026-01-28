import dbConnect from '@/lib/db';
import User from '@/models/User';
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

        return NextResponse.json({ message: 'Admin created successfully', username: admin.username, password: '1234' });
    } catch (error) {
        console.error('Seed error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
