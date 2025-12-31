import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Product } from '../components/home/ProductCard';

export interface CartItem extends Product {
    quantity: number;
    cartItemId: string; // Unique ID for the cart entry (product.id + variant)
    variant?: {
        name: string;
        price?: string;
        image?: string;
    };
}

interface CartContextType {
    items: CartItem[];
    addToCart: (product: Product & { variant?: any }) => void;
    removeFromCart: (cartItemId: string) => void;
    updateQuantity: (cartItemId: string, quantity: number) => void;
    clearCart: () => void;
    cartCount: number;
    cartTotal: number;
    isCartOpen: boolean;
    setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>(() => {
        try {
            const savedCart = localStorage.getItem('cart');
            return savedCart ? JSON.parse(savedCart) : [];
        } catch {
            return [];
        }
    });
    const [isCartOpen, setIsCartOpen] = useState(false);

    // Save to local storage on change
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(items));
    }, [items]);

    const addToCart = (product: Product & { variant?: any }) => {
        setItems(prev => {
            // Create a unique key for this combination
            const variantKey = product.variant ? product.variant.name : 'base';
            const existing = prev.find(item => item.id === product.id && (item.variant?.name || 'base') === variantKey);

            if (existing) {
                return prev.map(item =>
                    item.cartItemId === existing.cartItemId ? { ...item, quantity: item.quantity + 1 } : item
                );
            }

            // New item
            return [...prev, {
                ...product,
                quantity: 1,
                cartItemId: `${product.id}-${variantKey}-${Date.now()}`,
                variant: product.variant
            }];
        });
        setIsCartOpen(true);
    };

    const removeFromCart = (cartItemId: string) => {
        setItems(prev => prev.filter(item => item.cartItemId !== cartItemId));
    };

    const updateQuantity = (cartItemId: string, quantity: number) => {
        if (quantity <= 0) {
            removeFromCart(cartItemId);
            return;
        }
        setItems(prev => prev.map(item =>
            item.cartItemId === cartItemId ? { ...item, quantity } : item
        ));
    };

    const clearCart = () => setItems([]);

    const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);
    const cartTotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    return (
        <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, cartCount, cartTotal, isCartOpen, setIsCartOpen }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
