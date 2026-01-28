'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Package, ShoppingCart, PlusCircle, TrendingUp, AlertTriangle } from 'lucide-react';

export default function DashboardPage() {
    const [stats, setStats] = useState({ totalProducts: 0, lowStock: 0, itemsSoldToday: 0 });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch('/api/dashboard/stats');
                if (res.ok) {
                    const data = await res.json();
                    setStats(data);
                }
            } catch (error) {
                console.error('Failed to fetch stats');
            }
        };
        fetchStats();
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">ภาพรวมร้านค้า</h1>
                <span className="text-sm text-gray-500">วันนี้: {new Date().toLocaleDateString('th-TH', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            </div>

            {/* Stats Cards - Vertical friendly */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-500 text-xs font-medium uppercase">ยอดขาย (ชิ้น)</span>
                        <TrendingUp className="w-4 h-4 text-green-500" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{stats.itemsSoldToday}</div>
                    <div className="text-xs text-green-600 flex items-center mt-1">
                        วันนี้
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-500 text-xs font-medium uppercase">สินค้าทั้งหมด</span>
                        <Package className="w-4 h-4 text-blue-500" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{stats.totalProducts}</div>
                    <div className="text-xs text-gray-400 mt-1">ในสต็อก</div>
                </div>

                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 col-span-2 lg:col-span-1">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-500 text-xs font-medium uppercase">สินค้าใกล้หมด</span>
                        <AlertTriangle className="w-4 h-4 text-orange-500" />
                    </div>
                    <div className="text-2xl font-bold text-orange-600">{stats.lowStock}</div>
                    <div className="text-xs text-gray-400 mt-1">รายการที่ต้องดูแล</div>
                </div>

                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 col-span-2 lg:col-span-1">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-500 text-xs font-medium uppercase">กำไรวันนี้</span>
                        <TrendingUp className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="text-2xl font-bold text-emerald-600">฿{(stats.profitToday || 0).toLocaleString()}</div>
                    <div className="text-xs text-gray-400 mt-1">กำไรสุทธิ</div>
                </div>
            </div>

            {/* Main Action Grid - The "Hub" */}
            <h2 className="text-lg font-semibold text-gray-800 mt-8">เมนูด่วน</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Stock Button */}
                <Link href="/dashboard/stock" className="group relative overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg shadow-blue-500/20 transition-transform hover:scale-[1.02] active:scale-95">
                    <div className="relative z-10 flex flex-col h-full justify-between min-h-[140px]">
                        <Package className="w-10 h-10 opacity-80" />
                        <div>
                            <h3 className="text-xl font-bold">สต็อกสินค้า</h3>
                            <p className="text-blue-100 text-sm">จัดการคลังสินค้า</p>
                        </div>
                    </div>
                    <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-4 translate-y-4">
                        <Package className="w-32 h-32" />
                    </div>
                </Link>

                {/* Quick Add Button */}
                <Link href="/dashboard/stock?action=add" className="group relative overflow-hidden bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg shadow-emerald-500/20 transition-transform hover:scale-[1.02] active:scale-95 text-left">
                    <div className="relative z-10 flex flex-col h-full justify-between min-h-[140px]">
                        <PlusCircle className="w-10 h-10 opacity-80" />
                        <div>
                            <h3 className="text-xl font-bold">เพิ่มสินค้าด่วน</h3>
                            <p className="text-emerald-100 text-sm">เพิ่มรายการใหม่</p>
                        </div>
                    </div>
                    <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-4 translate-y-4">
                        <PlusCircle className="w-32 h-32" />
                    </div>
                </Link>

                {/* POS / Sell Button */}
                <Link href="/dashboard/pos" className="group relative overflow-hidden bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg shadow-purple-500/20 transition-transform hover:scale-[1.02] active:scale-95">
                    <div className="relative z-10 flex flex-col h-full justify-between min-h-[140px]">
                        <ShoppingCart className="w-10 h-10 opacity-80" />
                        <div>
                            <h3 className="text-xl font-bold">ขายหน้าร้าน (POS)</h3>
                            <p className="text-purple-100 text-sm">คิดเงินและขาย</p>
                        </div>
                    </div>
                    <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-4 translate-y-4">
                        <ShoppingCart className="w-32 h-32" />
                    </div>
                </Link>

                {/* Repair Service Button */}
                <Link href="/dashboard/repairs" className="group relative overflow-hidden bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg shadow-orange-500/20 transition-transform hover:scale-[1.02] active:scale-95">
                    <div className="relative z-10 flex flex-col h-full justify-between min-h-[140px]">
                        <div className="flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-80"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" /></svg>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold">บริการรับซ่อม</h3>
                            <p className="text-orange-100 text-sm">งานซ่อมบำรุง</p>
                        </div>
                    </div>
                    <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-4 translate-y-4">
                        <svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" /></svg>
                    </div>
                </Link>
            </div>

            {/* Top Selling Helper */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mt-6">
                <h3 className="font-semibold text-gray-800 mb-4">สินค้าขายดี (ตลอดกาล)</h3>
                <div className="space-y-4">
                    {stats.topSelling && stats.topSelling.length > 0 ? (
                        stats.topSelling.map((item, i) => (
                            <div key={i} className="flex items-center justify-between border-b border-gray-50 last:border-0 pb-2 last:pb-0">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center font-bold text-sm">
                                        #{i + 1}
                                    </div>
                                    <div>
                                        <div className="font-medium text-gray-900">{item.name}</div>
                                        <div className="text-xs text-gray-400">ขายแล้ว {item.sold} ชิ้น</div>
                                    </div>
                                </div>
                                <div className="text-sm font-bold text-gray-900">{item.sold} ชิ้น</div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center text-gray-400 py-4 text-sm">ยังไม่มีข้อมูลการขาย</div>
                    )}
                </div>
            </div>
        </div>
    );
}
