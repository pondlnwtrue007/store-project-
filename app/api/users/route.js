import dbConnect from '@/lib/db';
import User from '@/models/User';
import { verifyToken } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';

// Middleware to check Admin role
const checkAdmin = (req) => {
    const token = req.cookies.get('token')?.value;
    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'admin') {
        return null;
    }
    return decoded;
};

// GET: List all users
export async function GET(req) {
    try {
        await dbConnect();
        const admin = checkAdmin(req);
        if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

        const users = await User.find({}, '-password').sort({ createdAt: -1 }); // Exclude password
        return NextResponse.json(users);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }
}

// POST: Create new user
export async function POST(req) {
    try {
        await dbConnect();
        const admin = checkAdmin(req);
        if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

        const body = await req.json();
        const { username, password, role } = body;

        if (!username || !password) {
            return NextResponse.json({ error: 'Username and password required' }, { status: 400 });
        }

        const existing = await User.findOne({ username });
        if (existing) {
            return NextResponse.json({ error: 'Username already exists' }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({
            username,
            password: hashedPassword,
            role: role || 'user'
        });

        return NextResponse.json({
            _id: newUser._id,
            username: newUser.username,
            role: newUser.role,
            createdAt: newUser.createdAt
        }, { status: 201 });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
    }
}
