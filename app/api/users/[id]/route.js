import dbConnect from '@/lib/db';
import User from '@/models/User';
import { verifyToken } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';

const checkAdmin = (req) => {
    const token = req.cookies.get('token')?.value;
    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'admin') {
        return null;
    }
    return decoded;
};

export async function PUT(req, { params }) {
    try {
        await dbConnect();
        const resolvedParams = await params;

        if (!checkAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

        const body = await req.json();
        const { password, role } = body;

        const user = await User.findById(resolvedParams.id);
        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        if (password) {
            user.password = await bcrypt.hash(password, 10);
        }
        if (role) {
            user.role = role;
        }

        await user.save();

        return NextResponse.json({
            _id: user._id,
            username: user.username,
            role: user.role
        });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    try {
        await dbConnect();
        const resolvedParams = await params;

        const admin = checkAdmin(req);
        if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

        // Prevent deleting self (optional but good practice)
        if (resolvedParams.id === admin.userId) {
            return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 });
        }

        await User.findByIdAndDelete(resolvedParams.id);
        return NextResponse.json({ message: 'User deleted' });

    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
    }
}
