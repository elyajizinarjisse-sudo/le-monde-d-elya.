import { useState, useEffect } from 'react';
import { BarChart2, TrendingUp, DollarSign, ShoppingCart, Package, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface AnalyticsData {
    totalRevenue: number;
    totalOrders: number;
    averageOrderValue: number;
    totalItemsSold: number;
    revenueHistory: { day: string; revenue: number }[];
    topProducts: { name: string; sales: number; revenue: number }[];
}

export function AnalyticsModule() {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const today = new Date();
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(today.getDate() - 7);

            // Fetch Orders
            const { data: orders, error: ordersError } = await supabase
                .from('orders')
                .select('*')
                .order('created_at', { ascending: true }); // Ascending for chart

            if (ordersError) throw ordersError;

            // Fetch Order Items for Top Products
            const { data: orderItems, error: itemsError } = await supabase
                .from('order_items')
                .select('*');

            if (itemsError) throw itemsError;

            if (orders && orderItems) {
                // 1. KPIs
                const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
                const totalOrders = orders.length;
                const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
                const totalItemsSold = orderItems.reduce((sum, item) => sum + item.quantity, 0);

                // 2. Revenue History (Last 7 Days)
                const revenueHistory = [];
                for (let i = 6; i >= 0; i--) {
                    const d = new Date();
                    d.setDate(d.getDate() - i);
                    const dateStr = d.toISOString().split('T')[0]; // YYYY-MM-DD

                    const dailyRevenue = orders
                        .filter(o => o.created_at.startsWith(dateStr))
                        .reduce((sum, o) => sum + o.total, 0);

                    revenueHistory.push({
                        day: d.toLocaleDateString('fr-FR', { weekday: 'short' }),
                        revenue: dailyRevenue
                    });
                }

                // 3. Top Products
                const productStats = new Map<string, { sales: number; revenue: number }>();

                orderItems.forEach(item => {
                    const current = productStats.get(item.title) || { sales: 0, revenue: 0 };
                    productStats.set(item.title, {
                        sales: current.sales + item.quantity,
                        revenue: current.revenue + (item.price_at_purchase * item.quantity)
                    });
                });

                const topProducts = Array.from(productStats.entries())
                    .map(([name, stats]) => ({ name, ...stats }))
                    .sort((a, b) => b.revenue - a.revenue)
                    .slice(0, 5);

                setData({
                    totalRevenue,
                    totalOrders,
                    averageOrderValue,
                    totalItemsSold,
                    revenueHistory,
                    topProducts
                });
            }
        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary" size={32} /></div>;
    if (!data) return <div className="p-12 text-center text-gray-500">Aucune donnée disponible.</div>;

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
                        <p className="text-teal-100">Performance en temps réel (Basé sur les commandes réelles)</p>
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
                    </div>
                    <p className="text-gray-500 text-sm font-medium">Revenu Total</p>
                    <p className="text-3xl font-bold text-gray-900">{data.totalRevenue.toFixed(2)} $</p>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                            <ShoppingCart size={20} />
                        </div>
                    </div>
                    <p className="text-gray-500 text-sm font-medium">Commandes Totales</p>
                    <p className="text-3xl font-bold text-gray-900">{data.totalOrders}</p>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                            <Package size={20} />
                        </div>
                    </div>
                    <p className="text-gray-500 text-sm font-medium">Articles Vendus</p>
                    <p className="text-3xl font-bold text-gray-900">{data.totalItemsSold}</p>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                            <TrendingUp size={20} />
                        </div>
                    </div>
                    <p className="text-gray-500 text-sm font-medium">Panier Moyen</p>
                    <p className="text-3xl font-bold text-gray-900">{data.averageOrderValue.toFixed(2)} $</p>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Chart */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="font-bold text-gray-800 mb-6">Revenus (7 derniers jours)</h3>
                    <div className="h-64 flex items-end justify-between gap-2">
                        {data.revenueHistory.map((day, i) => {
                            // Normalize height for display (max height 100% relative to max value)
                            const maxRev = Math.max(...data.revenueHistory.map(d => d.revenue), 1); // Avoid div by 0
                            const heightPercent = (day.revenue / maxRev) * 100;

                            return (
                                <div key={i} className="w-full flex flex-col justify-end gap-2 group cursor-pointer">
                                    <div
                                        className="bg-teal-500 rounded-t-lg transition-all group-hover:bg-teal-600 relative min-h-[4px]"
                                        style={{ height: `${heightPercent}%` }}
                                    >
                                        <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded pointer-events-none whitespace-nowrap z-10">
                                            {day.revenue.toFixed(2)} $
                                        </div>
                                    </div>
                                    <span className="text-xs text-center text-gray-500 font-medium">{day.day}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Top Products */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="font-bold text-gray-800 mb-6">Top Produits (Par Revenu)</h3>
                    <div className="space-y-4">
                        {data.topProducts.map((prod, i) => (
                            <div key={i} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-500 text-xs">
                                        #{i + 1}
                                    </div>
                                    <span className="font-medium text-gray-700 truncate max-w-[200px]">{prod.name}</span>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-gray-900">{prod.revenue.toFixed(2)} $</p>
                                    <p className="text-xs text-gray-500">{prod.sales} ventes</p>
                                </div>
                            </div>
                        ))}
                        {data.topProducts.length === 0 && (
                            <div className="text-center text-gray-400 py-8">Aucune vente enregistrée</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
