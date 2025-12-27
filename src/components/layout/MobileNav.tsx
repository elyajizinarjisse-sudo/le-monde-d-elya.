import { X, ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { cn } from '../../lib/utils';
import { Link } from 'react-router-dom';

interface MobileNavProps {
    isOpen: boolean;
    onClose: () => void;
    navItems: {
        label: string;
        subItems: {
            title: string;
            path?: string;
            type?: 'section' | 'link';
            links: { label: string; path: string }[];
        }[];
    }[];
}

export function MobileNav({ isOpen, onClose, navItems }: MobileNavProps) {
    const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

    const toggleCategory = (label: string) => {
        setExpandedCategory(curr => curr === label ? null : label);
    };

    return (
        <>
            {/* Overlay */}
            <div
                className={cn(
                    "fixed inset-0 bg-black/50 z-50 transition-opacity duration-300 md:hidden",
                    isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                )}
                onClick={onClose}
            />

            {/* Menu Drawer */}
            <div className={cn(
                "fixed inset-y-0 left-0 w-[85%] max-w-sm bg-white z-[60] shadow-xl transform transition-transform duration-300 ease-in-out md:hidden flex flex-col",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                {/* Header */}
                <div className="p-4 border-b border-pastel-pink flex items-center justify-between bg-pastel-pink/10">
                    <h2 className="font-cursive text-2xl text-primary font-bold">Le menu d'Elya</h2>
                    <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full transition-colors">
                        <X size={24} className="text-gray-600" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto py-4">
                    {/* Search Bar */}
                    <div className="px-6 mb-6 relative">
                        <input
                            type="text"
                            placeholder="Rechercher..."
                            className="w-full pl-4 pr-10 py-3 border-2 border-pastel-pink rounded-xl focus:outline-none focus:border-primary text-sm bg-gray-50"
                        />
                        <button className="absolute right-9 top-1/2 -translate-y-1/2 text-primary hover:text-secondary transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                        </button>
                    </div>

                    <ul className="space-y-1">
                        {navItems.map((item) => (
                            <li key={item.label}>
                                <button
                                    onClick={() => toggleCategory(item.label)}
                                    className="w-full px-6 py-3 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                                >
                                    <span className="font-bold text-gray-800">{item.label}</span>
                                    {item.subItems?.length > 0 && (
                                        expandedCategory === item.label
                                            ? <ChevronDown size={20} className="text-primary" />
                                            : <ChevronRight size={20} className="text-gray-400" />
                                    )}
                                </button>

                                {/* Submenu */}
                                <div className={cn(
                                    "overflow-hidden transition-all duration-300 bg-gray-50",
                                    expandedCategory === item.label ? "max-h-[1000px]" : "max-h-0"
                                )}>
                                    {item.subItems?.map((sub, idx) => (
                                        <div key={idx} className="px-6 py-3 border-l-4 border-pastel-yellow ml-4 my-2">
                                            {sub.path ? (
                                                <Link
                                                    to={sub.path}
                                                    onClick={onClose}
                                                    className="block font-cursive text-secondary text-lg mb-2 hover:text-primary transition-colors"
                                                >
                                                    {sub.title}
                                                </Link>
                                            ) : (
                                                <h3 className="font-cursive text-secondary text-lg mb-2">{sub.title}</h3>
                                            )}
                                            <ul className="space-y-2">
                                                {sub.links.map(link => (
                                                    <li key={link.label}>
                                                        <Link to={link.path || '#'} onClick={onClose} className="block text-sm text-gray-600 hover:text-primary py-1">
                                                            {link.label}
                                                        </Link>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Footer Links */}
                <div className="p-6 border-t border-gray-100 bg-gray-50">
                    <div className="space-y-3 text-sm font-medium text-gray-600">
                        <a href="#" className="block hover:text-primary">Mon Compte</a>
                        <a href="#" className="block hover:text-primary">Commandes</a>
                        <a href="#" className="block hover:text-primary pt-2 border-t border-gray-200">Aide & Contact</a>
                    </div>
                </div>
            </div>
        </>
    );
}
