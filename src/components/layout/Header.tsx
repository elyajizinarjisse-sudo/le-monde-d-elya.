import { Search, User, ShoppingBag, Menu, ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { TopBar } from './TopBar';
import { supabase } from '../../lib/supabase';
import { MobileNav } from './MobileNav';

export function Header() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { setIsCartOpen, cartCount } = useCart();
    const [menuItems, setMenuItems] = useState<any[]>([]);

    const fetchMenu = async () => {
        try {
            // Use Supabase client directly
            const { data, error } = await supabase
                .from('menu_items')
                .select('*')
                .order('display_order', { ascending: true });

            if (error) {
                if (error.code !== '42P01') { // Ignore missing table error to avoid console noise if not setup
                    console.error("Menu Fetch Error:", error);
                }
                return;
            }

            if (data && data.length > 0) {
                // 1. Build Tree
                const lookup: any = {};
                const rootItems: any[] = [];
                data.forEach((item: any) => lookup[item.id] = { ...item, children: [] });
                data.forEach((item: any) => {
                    if (item.parent_id && lookup[item.parent_id]) {
                        lookup[item.parent_id].children.push(lookup[item.id]);
                    } else {
                        rootItems.push(lookup[item.id]);
                    }
                });

                // 2. Transform to UI Structure
                const uiItems = rootItems.map(root => ({
                    label: root.label,
                    path: root.path,
                    subItems: root.children?.map((section: any) => ({
                        title: section.label,
                        path: section.path, // Pass the path
                        type: section.type, // Pass the type
                        links: section.children?.map((link: any) => ({
                            label: link.label,
                            path: link.path
                        })) || []
                    })) || []
                }));

                setMenuItems(uiItems);
            } else {
                // Fallback / Debug if requests fail or empty
                setMenuItems([
                    { label: "MENU TEST 1 (DB VIDE)", path: "#", subItems: [] },
                    { label: "MENU TEST 2", path: "#", subItems: [] }
                ]);
            }
        } catch (err: any) {
            console.error("Error fetching menu:", err);
            // Fallback on error
            setMenuItems([
                { label: "MENU ERREUR", path: "#", subItems: [] }
            ]);
        }
    };

    useEffect(() => {
        // Initial fetch
        fetchMenu();

        // Realtime Subscription
        const channel = supabase
            .channel('menu_updates')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'menu_items'
                },
                (payload) => {
                    console.log('Menu change detected:', payload);
                    fetchMenu();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);



    // ... (keep existing fetch logic, but update state on error)

    return (
        <header className="border-b border-pastel-pink font-sans bg-white relative z-50">
            <TopBar />
            {/* ... rest of header */}

            {/* Main Header */}
            <div className="container mx-auto px-4 py-4 md:py-6">
                <div className="flex items-center justify-between gap-4 md:gap-8">

                    {/* Mobile Menu & Logo */}
                    <div className="flex items-center gap-4">
                        <button
                            className="md:hidden p-1 hover:bg-gray-100 rounded-full transition-colors"
                            onClick={() => setIsMobileMenuOpen(true)}
                        >
                            <Menu size={24} className="text-gray-800" />
                        </button>
                        <Link to="/" className="text-3xl md:text-5xl font-bold tracking-tight text-primary font-cursive transform -rotate-2 hover:rotate-0 transition-transform">
                            Le Monde d'Elya
                        </Link>
                    </div>

                    {/* Search Bar - Desktop */}
                    <div className="hidden md:flex flex-1 max-w-2xl relative">
                        <input
                            type="text"
                            placeholder="Rechercher des merveilles..."
                            className="w-full pl-4 pr-12 py-2.5 border-2 border-pastel-pink rounded-full focus:outline-none focus:border-primary placeholder:text-gray-400 text-gray-700 bg-gray-50 bg-opacity-50"
                        />
                        <button className="absolute right-0 top-0 h-full px-4 text-primary rounded-r-full hover:bg-pastel-pink hover:bg-opacity-20">
                            <Search size={20} strokeWidth={2.5} />
                        </button>
                    </div>

                    {/* Icons */}
                    <div className="flex items-center gap-2 md:gap-6 text-primary">
                        <Link to="/track" className="text-gray-700 font-medium hover:text-pastel-pink transition-colors relative group hidden md:block">
                            Suivre ma commande
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-pastel-pink transition-all group-hover:w-full"></span>
                        </Link>
                        <Link to="/account" className="hidden md:flex flex-col items-center gap-0.5 group hover:text-secondary transition-colors">
                            <User size={24} strokeWidth={2} />
                            <span className="text-[10px] font-bold hidden lg:block">Compte</span>
                        </Link>

                        <button
                            onClick={() => setIsCartOpen(true)}
                            className="flex flex-col items-center gap-0.5 group relative hover:text-secondary transition-colors"
                        >
                            <ShoppingBag size={24} strokeWidth={2} />
                            {cartCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-secondary text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold shadow-sm animate-scale-in">
                                    {cartCount}
                                </span>
                            )}
                            <span className="text-[10px] font-bold hidden lg:block">Panier</span>
                        </button>
                    </div>
                </div>

                {/* Search Bar - Mobile */}
                <div className="mt-4 md:hidden relative">
                    <input
                        type="text"
                        placeholder="Rechercher..."
                        className="w-full pl-4 pr-10 py-2 border-2 border-pastel-pink rounded-full focus:outline-none focus:border-primary"
                    />
                    <button className="absolute right-0 top-0 h-full px-3 text-primary">
                        <Search size={18} />
                    </button>
                </div>
            </div>

            {/* Navigation Bar (Desktop) - Mega Menu */}
            <nav className="hidden md:block border-t border-dashed border-pastel-pink bg-pastel-yellow bg-opacity-30">
                <div className="container mx-auto px-4">
                    <ul className="flex items-center justify-center gap-8 text-sm font-bold text-gray-700 uppercase tracking-wide">
                        {menuItems.map((item) => (
                            <li key={item.label} className="group relative py-3">
                                <Link to={item.path} className="hover:text-primary transition-colors flex items-center gap-1">
                                    {item.label}
                                    {item.subItems && item.subItems.length > 0 && <ChevronDown size={14} className="text-secondary" />}
                                </Link>

                                {/* Dropdown Content */}
                                {item.subItems && item.subItems.length > 0 && (
                                    <div className="absolute left-1/2 -translate-x-1/2 top-full w-[600px] bg-white shadow-xl rounded-xl border border-pastel-pink opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 overflow-hidden">
                                        <div className="grid grid-cols-3 gap-6 p-8 bg-white/95 backdrop-blur-sm">
                                            {item.subItems.map((section: any, idx: number) => (
                                                <div key={idx}>
                                                    {section.path ? (
                                                        <Link
                                                            to={section.path}
                                                            className="font-cursive text-primary text-lg mb-2 border-b-2 border-pastel-yellow inline-block hover:text-secondary transition-colors"
                                                        >
                                                            {section.title}
                                                        </Link>
                                                    ) : (
                                                        <h4 className="font-cursive text-primary text-lg mb-2 border-b-2 border-pastel-yellow inline-block">
                                                            {section.title}
                                                        </h4>
                                                    )}
                                                    <ul className="space-y-2">
                                                        {section.links.map((link: any) => (
                                                            <li key={link.label}>
                                                                <Link
                                                                    to={link.path || '#'}
                                                                    className="text-gray-600 hover:text-secondary text-xs capitalize hover:underline decoration-pastel-pink decoration-2 underline-offset-4"
                                                                >
                                                                    {link.label}
                                                                </Link>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            ))}
                                            {/* Decorative Image */}
                                            <div className="absolute bottom-0 right-0 p-4 opacity-10 pointer-events-none">
                                                <span className="text-6xl">🦄</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            </nav>

            <MobileNav
                isOpen={isMobileMenuOpen}
                onClose={() => setIsMobileMenuOpen(false)}
                navItems={menuItems}
            />
        </header>
    );
}
