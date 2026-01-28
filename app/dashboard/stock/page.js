'use client';

import { useState, useEffect, Suspense } from 'react';
import { Plus, Search, Edit2, Trash2, X, Package, Tag, Ban } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';

// Main Content Component
function StockContent() {
    const searchParams = useSearchParams();
    const router = useRouter();  // Optional, if we want to clear param
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState('');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentProduct, setCurrentProduct] = useState(null); // null = create mode
    const [imageMode, setImageMode] = useState('url'); // 'url' | 'upload'
    const [formData, setFormData] = useState({
        name: '', brand: '', price: '', stock: '', image: ''
    });

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, image: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    // Fetch Products
    const fetchProducts = async (q = '') => {
        setLoading(true);
        try {
            const res = await fetch(`/api/products?q=${q}`);
            const data = await res.json();
            setProducts(data);
        } catch (error) {
            console.error('Failed to fetch products');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const action = searchParams.get('action');
        if (action === 'add') {
            // Open modal after small delay to ensure state ready or just immediately
            openModal();
            // Optional: remove param so refresh doesn't reopen, but maybe user wants that. 
            // Let's leave it for now or replace URL.
            // router.replace('/dashboard/stock', { scroll: false });
        }
    }, [searchParams]);

    useEffect(() => {
        fetchProducts(query);
    }, [query]);

    // Handle Modal
    const openModal = (product = null) => {
        setCurrentProduct(product);
        if (product) {
            setFormData({
                name: product.name,
                brand: product.brand || '',
                price: product.price,
                stock: product.stock,
                image: product.image || ''
            });
        } else {
            setFormData({ name: '', brand: '', price: '', stock: '', image: '' });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentProduct(null);
    };

    // CRUD Operations
    const handleSubmit = async (e) => {
        e.preventDefault();
        const method = currentProduct ? 'PUT' : 'POST';
        const url = currentProduct ? `/api/products/${currentProduct._id}` : '/api/products';

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                closeModal();
                fetchProducts(query); // Refresh list
            } else {
                alert('Operation failed');
            }
        } catch (error) {
            console.error(error);
            alert('Error submitting form');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('คุณแน่ใจหรือไม่ที่จะลบสินค้านี้?')) return;

        try {
            const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchProducts(query);
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="relative min-h-[calc(100vh-100px)]">
            {/* Header & Search */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 sticky top-0 bg-gray-50 z-10 py-2">
                <h1 className="text-2xl font-bold text-black">การจัดการสินค้าคลัง</h1>
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="ค้นหาสินค้า..."
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-black placeholder:text-gray-600"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Product List */}
            {loading ? (
                <div className="text-center py-10 text-gray-500">Loading...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-20">
                    {products.length === 0 ? (
                        <div className="col-span-full text-center py-10 text-gray-400 flex flex-col items-center">
                            <Package className="w-16 h-16 mb-4 opacity-50" />
                            <p>ไม่พบสินค้า</p>
                        </div>
                    ) : (
                        products.map((product) => (
                            <div key={product._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                                <div className="h-40 bg-gray-100 relative items-center justify-center flex">
                                    {product.image ? (
                                        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <Package className="w-12 h-12 text-gray-300" />
                                    )}
                                </div>
                                <div className="p-4 flex-1 flex flex-col">
                                    <div className="text-xs text-blue-600 font-semibold mb-1 uppercase tracking-wider">
                                        <span className="text-gray-500 font-normal normal-case mr-1">ยี่ห้อ:</span>
                                        {product.brand || 'ไม่ระบุยี่ห้อ'}
                                    </div>
                                    <h3 className="font-bold text-gray-900 mb-1 truncate" title={product.name}>
                                        <span className="text-sm font-normal text-gray-500 mr-1">ชื่อสินค้า:</span>
                                        {product.name}
                                    </h3>
                                    <div className="flex items-end justify-between mt-auto pt-4">
                                        <div>
                                            <div className="text-sm text-gray-500">ราคาต้นทุน</div>
                                            <div className="font-bold text-lg text-black">฿{product.price.toLocaleString()}</div>
                                        </div>
                                        <div className={`text-right ${product.stock < 5 ? 'text-red-600' : 'text-green-600'}`}>
                                            <div className="text-sm font-medium">จำนวนสินค้า</div>
                                            <div className="font-bold text-lg">{product.stock}</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gray-50 px-4 py-3 flex justify-end space-x-2 border-t border-gray-100">
                                    <button onClick={() => openModal(product)} className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => handleDelete(product._id)} className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Floating Action Button (FAB) */}
            <button
                onClick={() => openModal()}
                className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg shadow-blue-600/30 transition-transform hover:scale-105 active:scale-95 z-20 flex items-center justify-center"
            >
                <Plus className="w-6 h-6" />
            </button>

            {/* Modal Overlay */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
                            <h2 className="text-xl font-bold text-black">{currentProduct ? 'แก้ไขสินค้า' : 'เพิ่มสินค้า'}</h2>
                            <button onClick={closeModal} className="text-gray-500 hover:text-gray-700"><X className="w-6 h-6" /></button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-black mb-1">ชื่อสินค้า</label>
                                <input
                                    type="text" required
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none text-black"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-black mb-1">ยี่ห้อ</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none text-black"
                                        value={formData.brand}
                                        onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-black mb-1">ราคาต้นทุน (บาท)</label>
                                    <input
                                        type="number" required min="0"
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none text-black"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-black mb-1">จำนวนสินค้า</label>
                                    <div className="relative">
                                        <input
                                            type="number" required min="0"
                                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none text-black"
                                            value={formData.stock}
                                            onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                                        />
                                        {currentProduct && (
                                            <div className="absolute right-2 top-2 text-xs text-gray-500 pointer-events-none">
                                                (เดิม {currentProduct.stock})
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="col-span-1">
                                    <label className="block text-sm font-bold text-black mb-1">รูปภาพ</label>

                                    {/* Toggle Buttons */}
                                    <div className="flex gap-2 mb-2">
                                        <button
                                            type="button"
                                            onClick={() => setImageMode('url')}
                                            className={`flex-1 py-1 text-xs rounded-md font-medium transition-colors ${imageMode === 'url' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                        >
                                            ลิงค์ URL
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setImageMode('upload')}
                                            className={`flex-1 py-1 text-xs rounded-md font-medium transition-colors ${imageMode === 'upload' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                        >
                                            อัปโหลดไฟล์
                                        </button>
                                    </div>

                                    {/* Inputs */}
                                    {imageMode === 'url' ? (
                                        <input
                                            type="text"
                                            placeholder="https://example.com/image.jpg"
                                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none text-black"
                                            value={formData.image}
                                            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                        />
                                    ) : (
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                            onChange={handleFileChange}
                                        />
                                    )}

                                    {/* Preview */}
                                    {formData.image && (
                                        <div className="mt-2 text-xs text-green-600 text-center truncate">
                                            เลือกรูปภาพแล้ว (ขนาด: {formData.image.length})
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button type="button" onClick={closeModal} className="flex-1 px-4 py-2 text-gray-700 font-medium bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
                                    ยกเลิก
                                </button>
                                <button type="submit" className="flex-1 px-4 py-2 text-white font-bold bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-lg shadow-blue-500/20">
                                    {currentProduct ? 'บันทึกการเปลี่ยนแปลง' : 'เพิ่มสินค้า'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function StockPage() {
    return (
        <Suspense fallback={<div className="text-center py-10 text-gray-500">Loading...</div>}>
            <StockContent />
        </Suspense>
    );
}
