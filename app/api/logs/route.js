import dbConnect from '@/lib/db';
import Log from '@/models/Log';
import { verifyToken } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET(req) {
    try {
        await dbConnect();

        // Auth Check
        const token = req.cookies.get('token')?.value;
        const decoded = verifyToken(token);
        if (!decoded || decoded.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const limit = searchParams.get('limit') || 50;

        const logs = await Log.find({})
            .sort({ createdAt: -1 })
            .limit(Number(limit));

        return NextResponse.json(logs);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 });
    }
}
