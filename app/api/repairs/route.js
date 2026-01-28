import dbConnect from '@/lib/db';
import Repair from '@/models/Repair';
import { verifyToken } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET(req) {
    try {
        await dbConnect();
        const token = req.cookies.get('token')?.value;
        const decoded = verifyToken(token);
        if (!decoded) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const repairs = await Repair.find({}).sort({ createdAt: -1 });
        return NextResponse.json(repairs);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to fetch repairs' }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        await dbConnect();
        const token = req.cookies.get('token')?.value;
        const decoded = verifyToken(token);
        if (!decoded) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();

        const repair = await Repair.create({
            ...body,
            technician: decoded.username,
            status: 'Received'
        });

        return NextResponse.json(repair, { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to create repair' }, { status: 500 });
    }
}
