import { useState, useEffect } from 'react';
import { Users, UserCheck, UserPlus, Search, Filter, MoreVertical, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Customer {
    id: string; // We'll use email as key or first order ID
    name: string;
    email: string;
    type: 'Client' | 'Prospect'; // Always Client for now as derived from orders
    status: 'VIP' | 'Nouveau' | 'Récurrent' | 'Actif' | 'Inactif';
    spent: number;
    orderCount: number;
    lastActive: Date;
}

export function CustomersModule() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            // Fetch all orders to aggregate customer data
            const { data: orders, error } = await supabase
                .from('orders')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            if (orders) {
                const customerMap = new Map<string, Customer>();

                orders.forEach(order => {
                    const email = order.customer_email.toLowerCase();
                    const orderDate = new Date(order.created_at);

                    if (!customerMap.has(email)) {
                        customerMap.set(email, {
                            id: order.id,
                            name: order.customer_name,
                            email: email,
                            type: 'Client',
                            status: 'Nouveau', // Will be recalculated
                            spent: 0,
                            orderCount: 0,
                            lastActive: orderDate
                        });
                    }

                    const customer = customerMap.get(email)!;
                    customer.spent += order.total;
                    customer.orderCount += 1;
                    if (orderDate > customer.lastActive) {
                        customer.lastActive = orderDate;
                    }
                });

                // Calculate Status based on aggregated data
                const processedCustomers = Array.from(customerMap.values()).map(customer => {
                    const daysSinceLastOrder = (new Date().getTime() - customer.lastActive.getTime()) / (1000 * 3600 * 24);

                    let status: Customer['status'] = 'Actif';

                    if (customer.spent > 500) {
                        status = 'VIP';
                    } else if (customer.orderCount === 1 && daysSinceLastOrder < 30) {
                        status = 'Nouveau';
                    } else if (customer.orderCount > 1) {
                        status = 'Récurrent';
                    } else if (daysSinceLastOrder > 180) { // 6 months
                        status = 'Inactif';
                    }

                    return { ...customer, status };
                });

                setCustomers(processedCustomers);
            }
        } catch (error) {
            console.error('Error fetching customers:', error);
        } finally {
            setLoading(false);
        }
    };

    // Derived Stats
    const totalClients = customers.length;
    const newClientsMonth = customers.filter(c =>
        c.status === 'Nouveau' &&
        (new Date().getTime() - c.lastActive.getTime()) / (1000 * 3600 * 24) < 30
    ).length;
    const activeClients = customers.filter(c => c.status !== 'Inactif').length;

    // Filtering
    const filteredCustomers = customers.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary" size={32} /></div>;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 rounded-xl text-white shadow-md">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                        <Users size={32} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold">Clients & Prospects</h2>
                        <p className="text-blue-100">Gérez votre base de données client (Source: Commandes)</p>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-gray-500 text-sm font-medium">Total Clients</p>
                        <p className="text-3xl font-bold text-gray-800">{totalClients}</p>
                    </div>
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                        <Users size={24} />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-gray-500 text-sm font-medium">Nouveaux (30j)</p>
                        <p className="text-3xl font-bold text-gray-800">+{newClientsMonth}</p>
                    </div>
                    <div className="p-3 bg-green-50 text-green-600 rounded-lg">
                        <UserPlus size={24} />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-gray-500 text-sm font-medium">Clients Actifs</p>
                        <p className="text-3xl font-bold text-gray-800">{activeClients}</p>
                    </div>
                    <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
                        <UserCheck size={24} />
                    </div>
                </div>
            </div>

            {/* Client List */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-200 flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Rechercher par nom, email..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        <button className="px-4 py-2 border border-gray-300 rounded-lg flex items-center gap-2 text-gray-600 hover:bg-gray-50 font-medium text-sm">
                            <Filter size={16} /> Filtres
                        </button>
                    </div>
                </div>
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
                        <tr>
                            <th className="p-4">Client</th>
                            <th className="p-4">Statut</th>
                            <th className="p-4 text-center">Commandes</th>
                            <th className="p-4 text-right">Dépenses (LTV)</th>
                            <th className="p-4">Dernière activité</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredCustomers.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="p-8 text-center text-gray-500">Aucun client trouvé</td>
                            </tr>
                        ) : (
                            filteredCustomers.map((customer) => (
                                <tr key={customer.email} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4">
                                        <div>
                                            <p className="font-bold text-gray-900">{customer.name}</p>
                                            <p className="text-gray-500 text-xs">{customer.email}</p>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${customer.status === 'VIP' ? 'bg-yellow-100 text-yellow-700' :
                                                customer.status === 'Actif' || customer.status === 'Récurrent' ? 'bg-green-100 text-green-700' :
                                                    customer.status === 'Nouveau' ? 'bg-blue-100 text-blue-700' :
                                                        'bg-gray-100 text-gray-600'
                                            }`}>
                                            {customer.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-center font-medium text-gray-700">{customer.orderCount}</td>
                                    <td className="p-4 text-right font-bold text-gray-900">{customer.spent.toFixed(2)} $</td>
                                    <td className="p-4 text-gray-500">
                                        {customer.lastActive.toLocaleDateString('fr-FR')}
                                    </td>
                                    <td className="p-4 text-right">
                                        <button className="p-2 hover:bg-gray-200 rounded-full text-gray-500">
                                            <MoreVertical size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
