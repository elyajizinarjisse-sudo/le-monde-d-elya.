import { useState, useEffect } from 'react';
import { ShoppingBag, Search, Filter, Eye, Truck, CheckCircle, XCircle, Clock } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { OrderDetailsModal } from './OrderDetailsModal';

// Real Order Type
interface Order {
    id: string;
    created_at: string;
    customer_name: string;
    customer_email: string;
    status: string;
    total: number;
    items_count: number;
    shipping_address: string;
}

const STATUS_Styles = {
    pending: { label: 'En attente', bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Clock },
    processing: { label: 'En cours', bg: 'bg-blue-100', text: 'text-blue-700', icon: Truck },
    shipped: { label: 'Expédiée', bg: 'bg-purple-100', text: 'text-purple-700', icon: Truck },
    delivered: { label: 'Livrée', bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle },
    cancelled: { label: 'Annulée', bg: 'bg-red-100', text: 'text-red-700', icon: XCircle },
};

export function OrdersOverview() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    useEffect(() => {
        fetchOrders();

        // Subscribe to real-time changes
        const subscription = supabase
            .channel('orders_channel')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, fetchOrders)
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const fetchOrders = async () => {
        try {
            const { data, error } = await supabase
                .from('orders')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) console.error('Error fetching orders:', error);
            if (data) setOrders(data);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredOrders = orders.filter(order => {
        const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.customer_email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 rounded-xl text-white shadow-md">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                        <ShoppingBag size={32} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold">Gestion des Commandes</h2>
                        <p className="text-blue-100">Suivez et traitez les commandes clients (Temps Réel)</p>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="relative flex-1 max-w-md">
                    <input
                        type="text"
                        placeholder="Rechercher par ID ou Client..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
                </div>

                <div className="flex items-center gap-2">
                    <Filter size={20} className="text-gray-500" />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                        <option value="all">Tous les statuts</option>
                        <option value="pending">En attente</option>
                        <option value="processing">En cours</option>
                        <option value="shipped">Expédiée</option>
                        <option value="delivered">Livrée</option>
                        <option value="cancelled">Annulée</option>
                    </select>
                </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center text-gray-500">Chargement des commandes...</div>
                ) : (
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 uppercase text-xs font-semibold">
                            <tr>
                                <th className="p-4">Commande</th>
                                <th className="p-4">Date</th>
                                <th className="p-4">Client</th>
                                <th className="p-4">Statut</th>
                                <th className="p-4">Total</th>
                                <th className="p-4">Articles</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredOrders.map((order) => {
                                const statusKey = order.status as keyof typeof STATUS_Styles;
                                const status = STATUS_Styles[statusKey] || STATUS_Styles.pending;
                                const StatusIcon = status.icon;

                                return (
                                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="p-4 font-bold text-gray-800 text-xs font-mono">
                                            {order.id.split('-')[0]}...
                                        </td>
                                        <td className="p-4 text-gray-600">
                                            {new Date(order.created_at).toLocaleDateString('fr-FR')}
                                        </td>
                                        <td className="p-4">
                                            <div className="font-medium text-gray-900">{order.customer_name}</div>
                                            <div className="text-xs text-gray-500">{order.customer_email}</div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${status.bg} ${status.text}`}>
                                                <StatusIcon size={14} />
                                                {status.label}
                                            </span>
                                        </td>
                                        <td className="p-4 font-bold text-gray-800">${order.total.toFixed(2)}</td>
                                        <td className="p-4 text-gray-600">{order.items_count}</td>
                                        <td className="p-4 text-right">
                                            <button
                                                onClick={() => setSelectedOrder(order)}
                                                className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            >
                                                <Eye size={20} />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}

                {!loading && filteredOrders.length === 0 && (
                    <div className="p-12 text-center text-gray-500">
                        Aucune commande trouvée. Les nouvelles commandes apparaîtront ici automatiquement.
                    </div>
                )}
            </div>

            {/* Verification Modal */}
            <OrderDetailsModal
                order={selectedOrder}
                onClose={() => setSelectedOrder(null)}
                onStatusUpdate={() => {
                    fetchOrders();
                    setSelectedOrder(null);
                }}
            />
        </div>
    );
}
