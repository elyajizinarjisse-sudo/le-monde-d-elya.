import { X, Minus, Plus, Trash2, ShoppingBag, ShieldCheck } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useState } from 'react';
import { CheckoutModal } from './CheckoutModal';

export function CartDrawer() {
    const { isCartOpen, setIsCartOpen, items, removeFromCart, updateQuantity, cartTotal } = useCart();
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

    if (!isCartOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex justify-end">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/30 backdrop-blur-sm"
                onClick={() => setIsCartOpen(false)}
            />

            {/* Drawer */}
            <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-slide-in-right">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-pastel-yellow/20">
                    <h2 className="text-xl font-bold font-cursive text-gray-900 flex items-center gap-2">
                        <ShoppingBag className="text-primary" />
                        Mon Panier
                    </h2>
                    <button
                        onClick={() => setIsCartOpen(false)}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X size={24} className="text-gray-500" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {items.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center">
                                <ShoppingBag size={40} className="text-gray-300" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Votre panier est vide</h3>
                                <p className="text-gray-500">Il est temps de le remplir de merveilles !</p>
                            </div>
                            <button
                                onClick={() => setIsCartOpen(false)}
                                className="px-6 py-2 bg-primary text-white rounded-full font-bold hover:bg-opacity-90 transition-colors"
                            >
                                Continuer mes achats
                            </button>
                        </div>
                    ) : (
                        items.map(item => (
                            <div key={item.id} className="flex gap-4">
                                <div className="w-20 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200">
                                    <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 flex flex-col justify-between py-1">
                                    <div>
                                        <h3 className="font-bold text-gray-900 text-sm leading-tight line-clamp-2">{item.title}</h3>
                                        <p className="text-primary font-bold mt-1">{item.price.toFixed(2)} $</p>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-1 border border-gray-100">
                                            <button
                                                onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                                                className="w-6 h-6 flex items-center justify-center bg-white rounded shadow-sm hover:text-primary disabled:opacity-50"
                                            >
                                                <Minus size={12} />
                                            </button>
                                            <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                                                className="w-6 h-6 flex items-center justify-center bg-white rounded shadow-sm hover:text-primary"
                                            >
                                                <Plus size={12} />
                                            </button>
                                        </div>
                                        <button
                                            onClick={() => removeFromCart(item.cartItemId)}
                                            className="text-gray-400 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {items.length > 0 && (
                    <div className="p-6 border-t border-gray-100 bg-gray-50">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-gray-600 font-medium">Sous-total</span>
                            <span className="text-xl font-bold text-gray-900">{cartTotal.toFixed(2)} $</span>
                        </div>
                        <button
                            onClick={() => setIsCheckoutOpen(true)}
                            className="w-full py-4 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-opacity-90 transform active:scale-95 transition-all"
                        >
                            Commander
                        </button>
                        <p className="text-center text-xs text-gray-400 mt-4 flex items-center justify-center gap-1">
                            <ShieldCheck size={12} />
                            Paiement sécurisé par Stripe
                        </p>
                    </div>
                )}
            </div>

            <CheckoutModal
                isOpen={isCheckoutOpen}
                onClose={() => setIsCheckoutOpen(false)}
            />
        </div>
    );
}
