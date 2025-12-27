import {
    LayoutDashboard, Package, ShoppingBag, Users,
    BarChart3, Settings, MessageSquare, Bot,
    Search, Target, Truck, Zap, Printer, Megaphone, LogOut, PenTool
} from 'lucide-react';

import { Outlet, Link, NavLink, useLocation } from 'react-router-dom';


export function AdminLayout() {
    // We still use location for the Header title dynamics
    const location = useLocation();



    const navLinkClass = ({ isActive }: { isActive: boolean }) =>
        `flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${isActive
            ? 'bg-indigo-50 text-indigo-600 border-r-4 border-indigo-600'
            : 'text-gray-600 hover:bg-gray-50'
        }`;

    return (
        <div className="min-h-screen bg-gray-100 flex font-sans">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 flex flex-col fixed h-full z-10">
                <div className="p-6 border-b border-gray-200">
                    <h1 className="text-xl font-bold text-gray-800 font-cursive">Elya Admin V3</h1>
                </div>

                <nav className="p-4 space-y-1 flex-1 overflow-y-auto custom-scrollbar">
                    <NavLink to="/admin" end className={navLinkClass}>
                        <LayoutDashboard size={18} />
                        Tableau de bord
                    </NavLink>
                    <NavLink to="/admin/products" className={navLinkClass}>
                        <Package size={18} />
                        Produits
                    </NavLink>
                    <NavLink to="/admin/orders" className={navLinkClass}>
                        <ShoppingBag size={18} />
                        Commandes
                    </NavLink>
                    <NavLink to="/admin/customers" className={navLinkClass}>
                        <Users size={18} />
                        Clients
                    </NavLink>
                    <NavLink to="/admin/analytics" className={navLinkClass}>
                        <BarChart3 size={18} />
                        Analytique
                    </NavLink>

                    {/* Integrations */}
                    <div className="pt-4 pb-2">
                        <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Canaux de Vente</p>
                    </div>

                    <NavLink to="/admin/dsers" className={navLinkClass}>
                        <Truck size={18} />
                        Dropshipping
                    </NavLink>
                    <NavLink to="/admin/printify" className={navLinkClass}>
                        <Printer size={18} />
                        Print on Demand
                    </NavLink>

                    {/* Website */}
                    <div className="pt-4 pb-2">
                        <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Site Web</p>
                    </div>

                    <NavLink to="/admin/content" className={navLinkClass}>
                        <PenTool size={18} />
                        Éditeur de Contenu
                    </NavLink>

                    {/* Marketing */}
                    <div className="pt-4 pb-2">
                        <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Croissance</p>
                    </div>

                    <NavLink to="/admin/marketing" className={navLinkClass}>
                        <Megaphone size={18} />
                        Marketing
                    </NavLink>
                    <NavLink to="/admin/ads" className={navLinkClass}>
                        <Target size={18} />
                        Publicité / Ads
                    </NavLink>
                    <NavLink to="/admin/seo" className={navLinkClass}>
                        <Search size={18} />
                        SEO / Référencement
                    </NavLink>

                    {/* Automation & Support */}
                    <div className="pt-4 pb-2">
                        <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Outils</p>
                    </div>

                    <NavLink to="/admin/automation" className={navLinkClass}>
                        <Zap size={18} />
                        Automatisations
                    </NavLink>
                    <NavLink to="/admin/support" className={navLinkClass}>
                        <MessageSquare size={18} />
                        Service Client
                    </NavLink>
                    <NavLink to="/admin/chatbot" className={navLinkClass}>
                        <Bot size={18} />
                        Agent Virtuel
                    </NavLink>

                    <div className="pt-4 text-gray-400 border-t mt-4 border-gray-100">
                        <NavLink to="/admin/settings" className={navLinkClass}>
                            <Settings size={18} />
                            Paramètres
                        </NavLink>
                    </div>
                </nav>

                <div className="p-4 border-t border-gray-200 bg-gray-50">
                    <Link to="/" className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-200 hover:text-red-500 transition-colors">
                        <LogOut size={20} />
                        Retour au site
                    </Link>
                </div>
            </aside>

            {/* Main Content Area - Added margin left for fixed sidebar */}
            <main className="flex-1 ml-64 min-h-screen flex flex-col">
                <header className="bg-white border-b border-gray-200 p-6 flex justify-between items-center sticky top-0 z-20 shadow-sm">
                    <h2 className="text-2xl font-bold text-gray-800">
                        Elya Admin V3 (Mode Standard)
                    </h2>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">Admin Mode</span>
                        <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold border border-indigo-200">A</div>
                    </div>
                </header>

                <div className="p-8 flex-1 bg-gray-50/50">
                    <div key={location.pathname} className="min-h-full">
                        <Outlet />
                    </div>
                </div>
            </main>
        </div>
    );
}
