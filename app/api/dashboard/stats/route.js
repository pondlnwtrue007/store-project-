import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import Log from '@/models/Log';
import { verifyToken } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET(req) {
    try {
        await dbConnect();
        const token = req.cookies.get('token')?.value;
        if (!verifyToken(token)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 1. Total Products
        const totalProducts = await Product.countDocuments();

        // 2. Low Stock (e.g., less than 5)
        const lowStock = await Product.countDocuments({ stock: { $lt: 5 } });

        // 3. Sales & Profit Today
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const salesLogs = await Log.find({
            action: 'SELL',
            createdAt: { $gte: startOfDay }
        });

        const itemsSoldToday = salesLogs.reduce((acc, log) => acc + Math.abs(log.qtyChange), 0);

        // Calculate Total Profit (All time or Today? Let's do Today for consistency with the card, or maybe All Time for a "Total Profit" metric. 
        // User asked for "profit column at the top" implies a quick stat. Let's provide "Profit Today".
        const profitToday = salesLogs.reduce((acc, log) => acc + (log.profit || 0), 0);

        // 4. Top Selling Items (All Time)
        // Aggregation pipeline to group by productName and sum stock reduction
        const topSelling = await Log.aggregate([
            { $match: { action: 'SELL' } },
            { $group: { _id: '$productName', totalSold: { $sum: { $abs: '$qtyChange' } } } },
            { $sort: { totalSold: -1 } },
            { $limit: 5 }
        ]);

        return NextResponse.json({
            totalProducts,
            lowStock,
            itemsSoldToday,
            profitToday,
            topSelling: topSelling.map(item => ({ name: item._id, sold: item.totalSold }))
        });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
