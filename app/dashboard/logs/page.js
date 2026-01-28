'use client';

import { useState, useEffect } from 'react';
import { History, Package, Clock, User as UserIcon } from 'lucide-react';

export default function LogsPage() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const res = await fetch('/api/logs');
                if (res.ok) {
                    const data = await res.json();
                    setLogs(data);
                }
            } catch (error) {
                console.error('Failed to fetch logs');
            } finally {
                setLoading(false);
            }
        };

        fetchLogs();
    }, []);

    const getActionColor = (action) => {
        switch (action) {
            case 'ADD': return 'text-green-600 bg-green-100';
            case 'SELL': return 'text-orange-600 bg-orange-100';
            case 'DELETE': return 'text-red-600 bg-red-100';
            case 'EDIT': return 'text-blue-600 bg-blue-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">กำลังโหลดประวัติ...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-3">
                <History className="w-8 h-8 text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-800">ประวัติการใช้งานระบบ</h1>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {logs.length === 0 ? (
                    <div className="p-12 text-center text-gray-400">
                        ยังไม่มีประวัติการใช้งาน
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {logs.map((log) => (
                            <div key={log._id} className="p-4 hover:bg-gray-50 transition-colors flex items-start space-x-4">
                                <div className={`mt-1 w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${getActionColor(log.action)}`}>
                                    <span className="text-xs font-bold">{log.action}</span>
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <p className="text-sm font-medium text-gray-900">
                                            {log.productName}
                                            {log.qtyChange !== 0 && (
                                                <span className={`ml-2 ${log.qtyChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                    {log.qtyChange > 0 ? '+' : ''}{log.qtyChange}
                                                </span>
                                            )}
                                        </p>
                                        <div className="flex items-center text-xs text-gray-400">
                                            <Clock className="w-3 h-3 mr-1" />
                                            {new Date(log.createdAt).toLocaleString()}
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-500 truncate flex items-center">
                                        <UserIcon className="w-3 h-3 mr-1" />
                                        <span className="font-medium text-gray-700 mr-2">{log.user}</span>
                                        — {log.details}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
