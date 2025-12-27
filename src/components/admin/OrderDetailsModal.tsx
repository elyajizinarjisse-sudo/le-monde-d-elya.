import { useState, useEffect } from 'react';
import { X, Package, User, MapPin, Mail, ChevronDown } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Order {
    id: string;
    created_at: string;
    customer_name: string;
    customer_email: string;
    status: string;
    total: number;
    shipping_address: string;
}

interface OrderItem {
    id: string;
    title: string;
    quantity: number;
    price_at_purchase: number;
}

interface OrderDetailsModalProps {
    order: Order | null;
    onClose: () => void;
    onStatusUpdate: () => void; // Callback to refresh list
}

const STATUS_OPTIONS = [
    { value: 'pending', label: 'En attente' },
    { value: 'processing', label: 'En cours de préparation' },
    { value: 'shipped', label: 'Expédiée' },
    { value: 'delivered', label: 'Livrée' },
    { value: 'cancelled', label: 'Annulée' },
];

export function OrderDetailsModal({ order, onClose, onStatusUpdate }: OrderDetailsModalProps) {
    const [items, setItems] = useState<OrderItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [updatingStatus, setUpdatingStatus] = useState(false);

    useEffect(() => {
        if (order) {
            fetchOrderItems();
        }
    }, [order]);

    const fetchOrderItems = async () => {
        if (!order) return;
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('order_items')
                .select('*')
                .eq('order_id', order.id);

            if (error) throw error;
            if (data) setItems(data);
        } catch (error) {
            console.error('Error fetching items:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (newStatus: string) => {
        if (!order) return;
        setUpdatingStatus(true);
        try {
            const { error } = await supabase
                .from('orders')
                .update({ status: newStatus })
                .eq('id', order.id);

            if (error) throw error;
            onStatusUpdate(); // Refresh parent list
        } catch (error) {
            console.error('Error updating status:', error);
            alert("Erreur lors de la mise à jour du statut");
        } finally {
            setUpdatingStatus(false);
        }
    };

    if (!order) return null;

    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

            <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-scale-in">
                {/* Header with Status Selector */}
                <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 z-10">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <Package className="text-primary" />
                            Commande #{order.id.slice(0, 8)}
                        </h2>
                        <p className="text-sm text-gray-500">
                            Passée le {new Date(order.created_at).toLocaleDateString('fr-FR')} à {new Date(order.created_at).toLocaleTimeString('fr-FR')}
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <select
                                value={order.status}
                                onChange={(e) => handleStatusChange(e.target.value)}
                                disabled={updatingStatus}
                                className={`appearance-none pl-4 pr-10 py-2 rounded-lg font-bold text-sm border-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2
                                    ${order.status === 'pending' ? 'bg-yellow-50 border-yellow-200 text-yellow-700' :
                                        order.status === 'processing' ? 'bg-blue-50 border-blue-200 text-blue-700' :
                                            order.status === 'shipped' ? 'bg-purple-50 border-purple-200 text-purple-700' :
                                                order.status === 'delivered' ? 'bg-green-50 border-green-200 text-green-700' :
                                                    'bg-red-50 border-red-200 text-red-700'}`}
                            >
                                {STATUS_OPTIONS.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                            <ChevronDown size={16} className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none 
                                ${order.status === 'pending' ? 'text-yellow-700' : 'text-gray-500'}`} />
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors ml-2">
                            <X size={20} className="text-gray-500" />
                        </button>
                    </div>
                </div>

                <div className="p-6 space-y-8">
                    {/* Customer & Shipping Info */}
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                                <User size={18} className="text-gray-500" />
                                Client
                            </h3>
                            <div className="space-y-2 text-sm">
                                <p className="font-medium text-gray-800">{order.customer_name}</p>
                                <p className="text-gray-600 flex items-center gap-2">
                                    <Mail size={14} /> {order.customer_email}
                                </p>
                            </div>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                                <MapPin size={18} className="text-gray-500" />
                                Livraison
                            </h3>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                {order.shipping_address}
                            </p>
                        </div>
                    </div>

                    {/* Order Items */}
                    <div>
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Package size={18} className="text-gray-500" />
                            Articles ({items.length})
                        </h3>
                        {loading ? (
                            <div className="text-center py-8 text-gray-400">Chargement des articles...</div>
                        ) : (
                            <div className="border border-gray-100 rounded-xl overflow-hidden">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-gray-50 text-gray-600 border-b border-gray-100">
                                        <tr>
                                            <th className="p-3 font-medium">Produit</th>
                                            <th className="p-3 font-medium text-center">Quantité</th>
                                            <th className="p-3 font-medium text-right">Prix</th>
                                            <th className="p-3 font-medium text-right">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {items.map(item => (
                                            <tr key={item.id} className="hover:bg-gray-50/50">
                                                <td className="p-3 font-medium text-gray-900">{item.title}</td>
                                                <td className="p-3 text-center text-gray-600">{item.quantity}</td>
                                                <td className="p-3 text-right text-gray-600">{item.price_at_purchase.toFixed(2)} $</td>
                                                <td className="p-3 text-right font-medium text-gray-900">
                                                    {(item.price_at_purchase * item.quantity).toFixed(2)} $
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className="bg-gray-50 border-t border-gray-100">
                                        <tr>
                                            <td colSpan={3} className="p-4 text-right font-bold text-gray-900">Total Commande</td>
                                            <td className="p-4 text-right font-bold text-primary text-lg">
                                                {order.total.toFixed(2)} $
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
