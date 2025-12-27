import { BarChart2, TrendingUp, DollarSign, ShoppingCart, Users, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export function AnalyticsModule() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-teal-500 to-emerald-500 p-6 rounded-xl text-white shadow-md">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                        <BarChart2 size={32} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold">Analytique</h2>
                        <p className="text-teal-100">Performance en temps réel de votre boutique</p>
                    </div>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                            <DollarSign size={20} />
                        </div>
                        <span className="flex items-center text-green-600 text-xs font-bold bg-green-50 px-2 py-1 rounded-full">
                            +12% <ArrowUpRight size={12} className="ml-1" />
                        </span>
                    </div>
                    <p className="text-gray-500 text-sm font-medium">Revenu Total (Auj)</p>
                    <p className="text-3xl font-bold text-gray-900">1,450.00€</p>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                            <Users size={20} />
                        </div>
                        <span className="flex items-center text-green-600 text-xs font-bold bg-green-50 px-2 py-1 rounded-full">
                            +5% <ArrowUpRight size={12} className="ml-1" />
                        </span>
                    </div>
                    <p className="text-gray-500 text-sm font-medium">Visiteurs Uniques</p>
                    <p className="text-3xl font-bold text-gray-900">3,240</p>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                            <ShoppingCart size={20} />
                        </div>
                        <span className="flex items-center text-red-500 text-xs font-bold bg-red-50 px-2 py-1 rounded-full">
                            -2% <ArrowDownRight size={12} className="ml-1" />
                        </span>
                    </div>
                    <p className="text-gray-500 text-sm font-medium">Taux de Conversion</p>
                    <p className="text-3xl font-bold text-gray-900">2.4%</p>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                            <TrendingUp size={20} />
                        </div>
                        <span className="flex items-center text-green-600 text-xs font-bold bg-green-50 px-2 py-1 rounded-full">
                            +8% <ArrowUpRight size={12} className="ml-1" />
                        </span>
                    </div>
                    <p className="text-gray-500 text-sm font-medium">Panier Moy.</p>
                    <p className="text-3xl font-bold text-gray-900">65.00€</p>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Traffic Chart (Mock) */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="font-bold text-gray-800 mb-6">Trafic (7 derniers jours)</h3>
                    <div className="h-64 flex items-end justify-between gap-2">
                        {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                            <div key={i} className="w-full flex flex-col justify-end gap-2 group cursor-pointer">
                                <div
                                    className="bg-blue-500 rounded-t-lg transition-all group-hover:bg-blue-600 relative"
                                    style={{ height: `${h}%` }}
                                >
                                    <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded pointer-events-none">
                                        {h * 40} visits
                                    </div>
                                </div>
                                <span className="text-xs text-center text-gray-500 font-medium">J-{7 - i}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Sales List */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="font-bold text-gray-800 mb-6">Top Produits</h3>
                    <div className="space-y-4">
                        {[
                            { name: 'Livre - Le Petit Prince', sales: 124, revenue: '2,480€' },
                            { name: 'Puzzle Bois 500p', sales: 89, revenue: '1,780€' },
                            { name: 'Peluche Ours Brun', sales: 65, revenue: '1,625€' },
                            { name: 'Lampe Veilleuse Étoile', sales: 42, revenue: '1,050€' },
                        ].map((prod, i) => (
                            <div key={i} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-500 text-xs">
                                        #{i + 1}
                                    </div>
                                    <span className="font-medium text-gray-700">{prod.name}</span>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-gray-900">{prod.revenue}</p>
                                    <p className="text-xs text-gray-500">{prod.sales} ventes</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button className="w-full mt-6 py-2 text-sm text-teal-600 font-bold border border-teal-100 rounded-lg hover:bg-teal-50">
                        Voir tout le rapport
                    </button>
                </div>
            </div>
        </div>
    );
}
