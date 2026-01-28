'use client';

import { useState, useEffect } from 'react';
import { Package, Plus, Search, Wrench, User, Phone, Smartphone, CheckCircle, Clock, Save, X, Trash2 } from 'lucide-react';

export default function RepairPage() {
    const [repairs, setRepairs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedRepair, setSelectedRepair] = useState(null); // For detail view
    const [localLaborCost, setLocalLaborCost] = useState(0); // Optimization
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Create Form State
    const [newRepair, setNewRepair] = useState({
        customerName: '', contact: '', deviceDetails: '', issueDescription: '',
        image: '', estimatedCost: '', partsSummary: ''
    });
    const [imageMode, setImageMode] = useState('url'); // 'url' | 'upload'

    // Parts Search State (for adding parts to repair)
    const [partQuery, setPartQuery] = useState('');
    const [partResults, setPartResults] = useState([]);

    // File Handler
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setNewRepair(prev => ({ ...prev, image: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const fetchRepairs = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/repairs');
            if (res.ok) setRepairs(await res.json());
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => {
        fetchRepairs();
    }, []);

    // Create Repair
    const handleCreate = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const res = await fetch('/api/repairs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newRepair),
            });
            if (res.ok) {
                setShowCreateModal(false);
                setNewRepair({
                    customerName: '', contact: '', deviceDetails: '', issueDescription: '',
                    image: '', estimatedCost: '', partsSummary: ''
                });
                setImageMode('url');
                fetchRepairs();
            } else {
                alert('Failed to create repair');
            }
        } catch (e) { alert('Failed to create'); }
        finally { setIsSubmitting(false); }
    };

    // ... (rest of searchParts, addPartToRepair, updateRepair - existing code) ...
    // Note: I will only replace the top part and then the modal part.
    // Wait, replacing a huge chunk is risky if I miss the middle functions.
    // I should use partial replace or check line numbers carefully.
    // The previous tool call output showed me the file up to line 297.
    // I can see the structure.
    // I will replace the top state definition first.

    // ... SKIP ... (I will start replacement at line 12 where Form State is defined)


    // Add Part Logic
    const searchParts = async (q) => {
        setPartQuery(q);
        if (q.length < 2) { setPartResults([]); return; }
        try {
            const res = await fetch(`/api/products?q=${q}`);
            const data = await res.json();
            setPartResults(data);
        } catch (e) { }
    };

    const addPartToRepair = async (product) => {
        if (!confirm(`Add ${product.name} to this repair? Stock will be deducted.`)) return;
        try {
            const res = await fetch(`/api/repairs/${selectedRepair._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'addPart', partId: product._id }),
            });
            if (res.ok) {
                const updated = await res.json();
                setSelectedRepair(updated);
                fetchRepairs(); // Refresh list to update status/previews
                setPartQuery('');
                setPartResults([]);
            } else {
                alert('Failed to add part (maybe out of stock?)');
            }
        } catch (e) { alert('Error adding part'); }
    };

    // Update Status / Labor
    const updateRepair = async (action, payload) => {
        try {
            const res = await fetch(`/api/repairs/${selectedRepair._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action, ...payload }),
            });
            if (res.ok) {
                const updated = await res.json();
                setSelectedRepair(updated);
                fetchRepairs();
            }
        } catch (e) { console.error(e); }
    };

    return (
        <div className="min-h-[calc(100vh-100px)] relative">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <Wrench className="w-6 h-6 text-blue-600" /> บริการรับซ่อม
                </h1>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 shadow-lg shadow-blue-500/30"
                >
                    <Plus className="w-5 h-5" /> งานซ่อมใหม่
                </button>
            </div>

            {/* Repairs List */}
            {loading ? <div className="text-gray-500 text-center mt-10">กำลังโหลดข้อมูล...</div> : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {repairs.length === 0 ? (
                        <div className="col-span-full text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                            <Wrench className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500 font-medium">ไม่มีรายการซ่อมในขณะนี้</p>
                        </div>
                    ) : (
                        repairs.map(repair => (
                            <div
                                key={repair._id}
                                onClick={() => {
                                    setSelectedRepair(repair);
                                    setLocalLaborCost(repair.laborCost || 0);
                                }}
                                className="bg-white p-4 rounded-xl border border-gray-100 hover:shadow-md transition-shadow cursor-pointer relative overflow-hidden flex gap-3"
                            >
                                <div className={`absolute top-0 right-0 px-3 py-1 text-xs font-bold rounded-bl-xl z-10 ${repair.status === 'Completed' ? 'bg-green-100 text-green-700' :
                                    repair.status === 'Cancelled' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                                    }`}>
                                    {repair.status}
                                </div>

                                {repair.image ? (
                                    <div className="w-20 h-20 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden mt-6">
                                        <img src={repair.image} alt="Repair" className="w-full h-full object-cover" />
                                    </div>
                                ) : (
                                    <div className="w-20 h-20 bg-gray-50 rounded-lg flex-shrink-0 flex items-center justify-center text-gray-300 mt-6">
                                        <Wrench className="w-8 h-8" />
                                    </div>
                                )}

                                <div className="flex-1 min-w-0 pt-6"> {/* Padding top to avoid overlap with status badge */}
                                    <h3 className="font-bold text-gray-900 mb-1 truncate text-sm">
                                        <span className="text-gray-500 font-normal mr-1">อุปกรณ์:</span>
                                        {repair.deviceDetails}
                                    </h3>
                                    <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                                        <span className="font-bold mr-1">อาการ:</span>
                                        {repair.issueDescription || '-'}
                                    </p>

                                    <div className="text-xs text-gray-500 mb-2 flex flex-wrap items-center gap-1">
                                        <User className="w-3 h-3" />
                                        <span className="font-medium text-gray-700">{repair.customerName}</span>
                                        <span className="text-gray-400">| {repair.contact}</span>
                                    </div>

                                    <div className="flex justify-between items-end border-t border-gray-50 pt-2">
                                        <div className="text-[10px] text-gray-400">
                                            #{repair._id.slice(-6)}
                                        </div>
                                        <div className="font-bold text-blue-600 text-sm">฿{repair.totalCost.toLocaleString()}</div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6">
                        <h2 className="text-xl font-bold mb-4 text-gray-900">รับซ่อม</h2>
                        <form onSubmit={handleCreate} className="space-y-4 text-gray-900">
                            <div>
                                <label className="block text-sm font-bold mb-1 text-gray-900">ชื่อลูกค้า</label>
                                <input className="w-full border p-2 rounded-lg text-black placeholder:text-gray-400" required
                                    value={newRepair.customerName} onChange={e => setNewRepair({ ...newRepair, customerName: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold mb-1 text-gray-900">ข้อมูลติดต่อ</label>
                                    <input className="w-full border p-2 rounded-lg text-black placeholder:text-gray-400" required placeholder="Phone / Email"
                                        value={newRepair.contact} onChange={e => setNewRepair({ ...newRepair, contact: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold mb-1 text-gray-900">ราคาซ่อม (ประมาณการ)</label>
                                    <input type="number" className="w-full border p-2 rounded-lg text-black placeholder:text-gray-400" placeholder="฿"
                                        value={newRepair.estimatedCost} onChange={e => setNewRepair({ ...newRepair, estimatedCost: e.target.value })} />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold mb-1 text-gray-900">ชื่ออุปกรณ์ / รุ่น</label>
                                <input className="w-full border p-2 rounded-lg text-black placeholder:text-gray-400" required placeholder="e.g. iPhone 13, Notebook Dell"
                                    value={newRepair.deviceDetails} onChange={e => setNewRepair({ ...newRepair, deviceDetails: e.target.value })} />
                            </div>

                            <div>
                                <label className="block text-sm font-bold mb-1 text-gray-900">รายละเอียดชิ้นส่วน (มีในสต็อก / ไม่มีในสต็อก)</label>
                                <input className="w-full border p-2 rounded-lg text-black placeholder:text-gray-400" placeholder="e.g. ใช้อะไหล่อะไรไปบ้างหรือไม่ใช้"
                                    value={newRepair.partsSummary} onChange={e => setNewRepair({ ...newRepair, partsSummary: e.target.value })} />
                            </div>

                            {/* Image Input */}
                            <div>
                                <label className="block text-sm font-bold mb-1 text-gray-900">รูปภาพ</label>
                                <div className="flex gap-2 mb-2">
                                    <button type="button" onClick={() => setImageMode('url')} className={`flex-1 py-1 text-xs rounded-md font-medium ${imageMode === 'url' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}>URL Link</button>
                                    <button type="button" onClick={() => setImageMode('upload')} className={`flex-1 py-1 text-xs rounded-md font-medium ${imageMode === 'upload' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}>Upload File</button>
                                </div>
                                {imageMode === 'url' ? (
                                    <input type="text" placeholder="https://..." className="w-full border p-2 rounded-lg text-black placeholder:text-gray-400"
                                        value={newRepair.image} onChange={(e) => setNewRepair({ ...newRepair, image: e.target.value })} />
                                ) : (
                                    <input type="file" accept="image/*" className="w-full text-sm text-gray-500" onChange={handleFileChange} />
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-bold mb-1 text-gray-900">อาการเสีย / ปัญหา</label>
                                <textarea className="w-full border p-2 rounded-lg h-24 text-black placeholder:text-gray-400" placeholder="ระบุอาการเสียอย่างละเอียด..."
                                    value={newRepair.issueDescription} onChange={e => setNewRepair({ ...newRepair, issueDescription: e.target.value })} />
                            </div>
                            <div className="flex gap-2 pt-2">
                                <button type="button" onClick={() => setShowCreateModal(false)} disabled={isSubmitting} className="flex-1 bg-gray-100 py-2 rounded-lg font-bold text-gray-700 hover:bg-gray-200 disabled:opacity-50">ยกเลิก</button>
                                <button type="submit" disabled={isSubmitting} className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                                    {isSubmitting ? (
                                        <>
                                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            กำลังบันทึก...
                                        </>
                                    ) : 'Create Job'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Detail / Manage Modal */}
            {selectedRepair && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto flex flex-col">
                        <div className="p-6 border-b flex justify-between items-start">
                            <div>
                                <div className="text-sm text-gray-400 mb-1">ใบแจ้งซ่อม #{selectedRepair._id.slice(-6)}</div>
                                <h2 className="text-2xl font-bold text-gray-900">{selectedRepair.deviceDetails}</h2>
                                <p className="text-gray-500 text-sm mt-1">{selectedRepair.customerName} • {selectedRepair.contact}</p>
                            </div>
                            <button onClick={() => setSelectedRepair(null)}><X className="w-6 h-6 text-gray-400" /></button>
                        </div>

                        <div className="p-6 space-y-8 flex-1 overflow-y-auto">

                            {/* Job Info */}
                            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex gap-4">
                                {selectedRepair.image && (
                                    <div className="w-24 h-24 bg-white rounded-lg border border-gray-200 overflow-hidden flex-shrink-0">
                                        <img src={selectedRepair.image} alt="Repair" className="w-full h-full object-cover" />
                                    </div>
                                )}
                                <div className="flex-1 space-y-1">
                                    <div className="text-sm">
                                        <span className="font-bold text-gray-500">ราคาประเมิน: </span>
                                        <span className="font-bold text-gray-900">฿{(selectedRepair.estimatedCost || 0).toLocaleString()}</span>
                                    </div>
                                    <div className="text-sm">
                                        <span className="font-bold text-gray-500">ต้องใช้อะไหล่: </span>
                                        <span className="text-gray-700">{selectedRepair.partsSummary || '-'}</span>
                                    </div>
                                    <div className="text-sm">
                                        <span className="font-bold text-gray-500">อาการเสีย: </span>
                                        <span className="text-gray-700 line-clamp-2">{selectedRepair.issueDescription}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Status Control */}
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-gray-900">สถานะ:</span>
                                <select
                                    className="border rounded-lg p-2 font-bold text-black"
                                    value={selectedRepair.status || 'Received'}
                                    onChange={(e) => updateRepair('updateStatus', { status: e.target.value })}
                                >
                                    <option value="Received">ได้รับเรื่องแล้ว</option>
                                    <option value="In Progress">กำลังดำเนินการ</option>
                                    <option value="Waiting for Parts">รออะไหล่</option>
                                    <option value="Completed">เสร็จสิ้น</option>
                                    <option value="Cancelled">ยกเลิก</option>
                                </select>
                            </div>

                            {/* Parts Section */}
                            <div>
                                <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                                    <Package className="w-4 h-4" /> อะไหล่ที่ใช้
                                </h3>
                                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                                    {!selectedRepair.parts || selectedRepair.parts.length === 0 ? (
                                        <div className="text-sm text-gray-400 italic">ยังไม่ได้เพิ่มอะไหล่</div>
                                    ) : (
                                        selectedRepair.parts.map((part, idx) => (
                                            <div key={idx} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-0 text-sm">
                                                <span className="text-black">{part.name}</span>
                                                <span className="font-bold text-black">฿{(part.price || 0).toLocaleString()}</span>
                                            </div>
                                        ))
                                    )}

                                    {/* Add Part Search */}
                                    <div className="mt-4 relative">
                                        <label className="text-xs font-bold text-gray-500 mb-1 block">เพิ่มอะไหล่จากสต็อก (ตัดสต็อกอัตโนมัติ)</label>
                                        <div className="flex gap-2">
                                            <div className="relative flex-1">
                                                <Search className="absolute left-3 top-2 w-4 h-4 text-gray-400" />
                                                <input
                                                    className="w-full border rounded-lg pl-9 pr-2 py-1.5 text-sm text-black"
                                                    placeholder="ค้นหาอะไหล่ (เช่น หน้าจอ)..."
                                                    value={partQuery}
                                                    onChange={(e) => searchParts(e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        {/* Dropdown Results */}
                                        {partResults.length > 0 && (
                                            <div className="absolute top-full left-0 right-0 bg-white shadow-xl rounded-xl border mt-2 z-10 max-h-40 overflow-y-auto">
                                                {partResults.map(p => (
                                                    <div
                                                        key={p._id}
                                                        onClick={() => addPartToRepair(p)}
                                                        className="p-2 hover:bg-blue-50 cursor-pointer flex justify-between text-sm"
                                                    >
                                                        <span className="text-black">{p.name}</span>
                                                        <span className="font-bold text-blue-600">฿{p.price}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Labor Section */}
                            <div>
                                <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                                    <User className="w-4 h-4" /> ค่าแรง
                                </h3>
                                <div className="flex gap-2 items-center">
                                    <input
                                        type="number"
                                        className="border rounded-lg p-2 w-32 font-bold text-black"
                                        value={localLaborCost}
                                        onChange={(e) => setLocalLaborCost(Number(e.target.value))}
                                    />
                                    <span className="text-gray-500 text-sm">บาท</span>
                                    {localLaborCost !== (selectedRepair.laborCost || 0) && (
                                        <button
                                            onClick={() => updateRepair('updateLabor', { laborCost: localLaborCost })}
                                            className="ml-2 bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 shadow-md transition-all flex items-center gap-1 text-xs font-bold"
                                        >
                                            <Save className="w-4 h-4" /> บันทึก
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Footer Totals */}
                        <div className="p-6 border-t bg-gray-50 rounded-b-2xl">
                            <div className="space-y-2 mb-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">ค่าอะไหล่</span>
                                    <span className="font-bold text-gray-900">฿{(selectedRepair.parts?.reduce((sum, part) => sum + (part.price * (part.qty || 1)), 0) || 0).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">ค่าแรง</span>
                                    <span className="font-bold text-gray-900">฿{(selectedRepair.laborCost || 0).toLocaleString()}</span>
                                </div>
                            </div>
                            <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                                <div className="text-gray-500 font-bold">รวมทั้งสิ้น</div>
                                <div className="text-3xl font-black text-blue-600">฿{(selectedRepair.totalCost || 0).toLocaleString()}</div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
