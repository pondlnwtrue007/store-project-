'use client';

import { useState, useEffect } from 'react';
import { Search, ShoppingCart, Plus, Minus, Trash2, CheckCircle, Package } from 'lucide-react';

export default function POSPage() {
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState([]);
    const [query, setQuery] = useState('');
    const [checkingOut, setCheckingOut] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    // Fetch products for grid
    useEffect(() => {
        const fetchProducts = async () => {
            // setLoading(true); // Removed as per instruction, not used in provided snippet
            try {
                const res = await fetch(`/api/products?q=${query}`);
                const data = await res.json();
                setProducts(data);
            } catch (error) {
                console.error('Failed to fetch products');
            } finally {
                // setLoading(false); // Removed
            }
        };
        fetchProducts();
    }, [query]);

    // Cart Operations
    const addToCart = (product) => {
        if (product.stock <= 0) return;

        setCart(prev => {
            const existing = prev.find(item => item.productId === product._id);
            if (existing) {
                // Don't add more than stock
                if (existing.qty >= product.stock) return prev;
                return prev.map(item =>
                    item.productId === product._id ? { ...item, qty: item.qty + 1 } : item
                );
            }
            return [...prev, {
                productId: product._id,
                name: product.name,
                price: product.price,
                qty: 1,
                maxStock: product.stock,
                image: product.image
            }];
        });
    };

    const removeFromCart = (productId) => {
        setCart(prev => prev.filter(item => item.productId !== productId));
    };

    const updateQty = (productId, delta) => {
        setCart(prev => {
            return prev.map(item => {
                if (item.productId === productId) {
                    const newQty = item.qty + delta;
                    if (newQty < 1) return item;
                    if (newQty > item.maxStock) return item;
                    return { ...item, qty: newQty };
                }
                return item;
            });
        });
    };

    const updatePrice = (productId, newPrice) => {
        setCart(prev => prev.map(item =>
            item.productId === productId ? { ...item, price: Number(newPrice) } : item
        ));
    };

    const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

    // Trigger Confirmation Modal
    const handleCheckoutClick = () => {
        if (cart.length === 0) return;
        setShowConfirm(true);
    };

    // Actual API Call
    const processSale = async () => {
        setCheckingOut(true);
        try {
            const res = await fetch('/api/pos/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ items: cart }),
            });

            const data = await res.json();

            if (res.ok) {
                setShowConfirm(false);
                setShowSuccess(true);
                setCart([]);
                // Refresh products in background
                setQuery(prev => prev + ' ');
                setTimeout(() => setQuery(query), 100);
            } else {
                alert('Checkout failed: ' + (data.error || 'Unknown error')); // Start with basic alert for error, or could use error state
            }
        } catch (error) {
            alert('Checkout error');
        } finally {
            setCheckingOut(false);
        }
    };

    const startNewSale = () => {
        setShowSuccess(false);
    };

    return (
        <div className="flex flex-col lg:flex-row h-[calc(100vh-100px)] gap-6 relative">

            {/* Left: Product Grid */}
            <div className="flex-1 flex flex-col min-w-0">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-4 flex items-center gap-4">
                    <Search className="text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="ค้นหาสินค้าเพื่อเพิ่มลงตะกร้า..."
                        className="flex-1 outline-none text-gray-700 font-medium"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                </div>

                <div className="flex-1 overflow-y-auto no-scrollbar grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 pb-4">
                    {products.map(product => (
                        <div
                            key={product._id}
                            onClick={() => addToCart(product)}
                            className={`bg-white p-3 rounded-xl border border-gray-100 cursor-pointer transition-all hover:shadow-md hover:border-blue-300 active:scale-95 flex flex-col ${product.stock <= 0 ? 'opacity-50 pointer-events-none' : ''}`}
                        >
                            <div className="h-28 bg-gray-100 rounded-lg mb-3 relative overflow-hidden">
                                {product.image ? (
                                    <img src={product.image} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                                        <Package className="w-8 h-8" />
                                    </div>
                                )}
                                <div className="absolute top-1 right-1 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                                    เหลือ {product.stock}
                                </div>
                            </div>
                            <div className="font-bold text-gray-900 truncate text-sm mb-1">{product.name}</div>
                            <div className="text-blue-600 font-bold">฿{product.price.toLocaleString()}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right: Cart */}
            <div className="w-full lg:w-96 bg-white rounded-2xl shadow-xl flex flex-col border border-gray-100 h-full">
                <div className="p-6 border-b border-gray-100 bg-gray-50/50 rounded-t-2xl">
                    <h2 className="text-xl font-bold flex items-center text-gray-800">
                        <ShoppingCart className="w-5 h-5 mr-2" />
                        รายการขายปัจจุบัน
                    </h2>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-300 space-y-2 opacity-60">
                            <ShoppingCart className="w-16 h-16" />
                            <p>ตะกร้าว่างเปล่า</p>
                        </div>
                    ) : (
                        cart.map(item => (
                            <div key={item.productId} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                <div className="flex-1 min-w-0 pr-4">
                                    <div className="font-bold text-gray-800 truncate">{item.name}</div>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-sm text-gray-500">ราคา: ฿</span>
                                        <input
                                            type="number"
                                            min="0"
                                            className="w-20 px-2 py-1 bg-white border border-gray-200 rounded text-sm font-bold text-blue-600 focus:ring-2 focus:ring-blue-500 outline-none"
                                            value={item.price}
                                            onChange={(e) => updatePrice(item.productId, e.target.value)}
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                        <span className="text-xs text-gray-400">x {item.qty}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center bg-white rounded-lg shadow-sm border border-gray-200 text-black">
                                        <button onClick={() => updateQty(item.productId, -1)} className="p-1 hover:bg-gray-100"><Minus className="w-4 h-4" /></button>
                                        <span className="w-8 text-center font-bold text-sm">{item.qty}</span>
                                        <button onClick={() => updateQty(item.productId, 1)} className="p-1 hover:bg-gray-100"><Plus className="w-4 h-4" /></button>
                                    </div>
                                    <button onClick={() => removeFromCart(item.productId)} className="text-gray-400 hover:text-red-500">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
                    <div className="flex justify-between items-center mb-6">
                        <span className="text-gray-500 font-medium">ยอดรวม</span>
                        <span className="text-3xl font-black text-gray-900">฿{cartTotal.toLocaleString()}</span>
                    </div>
                    <button
                        onClick={handleCheckoutClick}
                        disabled={cart.length === 0}
                        className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-lg font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all active:scale-95 flex items-center justify-center"
                    >
                        ชำระเงิน
                    </button>
                </div>
            </div>

            {/* --- MODALS --- */}

            {/* Verification Modal */}
            {showConfirm && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm rounded-2xl">
                    <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-sm border border-gray-100 animate-in fade-in zoom-in duration-200">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">ยืนยันการชำระเงิน?</h3>
                        <p className="text-gray-500 mb-6">ยอดชำระทั้งหมด:</p>
                        <div className="text-4xl font-black text-blue-600 mb-8 text-center">
                            ฿{cartTotal.toLocaleString()}
                        </div>
                        <div className="space-y-3">
                            <button
                                onClick={processSale}
                                disabled={checkingOut}
                                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all active:scale-95 flex justify-center"
                            >
                                {checkingOut ? 'กำลังดำเนินการ...' : 'ยืนยันการชำระเงิน'}
                            </button>
                            <button
                                onClick={() => setShowConfirm(false)}
                                disabled={checkingOut}
                                className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors"
                            >
                                ยกเลิก
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Success Modal */}
            {showSuccess && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-md rounded-2xl">
                    <div className="text-center p-8 animate-in fade-in zoom-in duration-300">
                        <div className="w-24 h-24 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                            <CheckCircle className="w-12 h-12" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">ทำรายการสำเร็จ!</h2>
                        <p className="text-gray-500 mb-8">บันทึกรายการเรียบร้อยแล้ว</p>
                        <button
                            onClick={startNewSale}
                            className="px-8 py-3 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl shadow-xl transition-transform hover:scale-105 active:scale-95"
                        >
                            เริ่มรายการขายใหม่
                        </button>
                    </div>
                </div>
            )}

        </div>
    );
}
