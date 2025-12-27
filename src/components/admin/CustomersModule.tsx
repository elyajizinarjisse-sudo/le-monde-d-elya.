import { Users, UserCheck, UserPlus, Search, Filter, MoreVertical } from 'lucide-react';

export function CustomersModule() {

    const CUSTOMERS = [
        { id: 1, name: 'Sophie Martin', email: 'sophie.m@example.com', type: 'Client', status: 'VIP', spent: '1,240€', lastActive: 'Il y a 2h' },
        { id: 2, name: 'Marc Tremblay', email: 'marc.t@example.com', type: 'Prospect', status: 'Nouveau', spent: '0€', lastActive: 'Hier' },
        { id: 3, name: 'Julie Gagnon', email: 'julie.g@example.com', type: 'Client', status: 'Actif', spent: '345€', lastActive: 'Il y a 3j' },
        { id: 4, name: 'Thomas Lefebvre', email: 'thomas.l@example.com', type: 'Prospect', status: 'Inactif', spent: '0€', lastActive: 'Il y a 15j' },
        { id: 5, name: 'Émilie Roy', email: 'emilie.r@example.com', type: 'Client', status: 'Récurrent', spent: '890€', lastActive: 'Aujourd\'hui' },
    ];

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
                        <p className="text-blue-100">Gérez votre base de données client</p>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-gray-500 text-sm font-medium">Total Clients</p>
                        <p className="text-3xl font-bold text-gray-800">1,245</p>
                    </div>
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                        <Users size={24} />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-gray-500 text-sm font-medium">Nouveaux ce mois</p>
                        <p className="text-3xl font-bold text-gray-800">+48</p>
                    </div>
                    <div className="p-3 bg-green-50 text-green-600 rounded-lg">
                        <UserPlus size={24} />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-gray-500 text-sm font-medium">Clients Actifs (30j)</p>
                        <p className="text-3xl font-bold text-gray-800">850</p>
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
                        />
                    </div>
                    <div className="flex gap-2">
                        <button className="px-4 py-2 border border-gray-300 rounded-lg flex items-center gap-2 text-gray-600 hover:bg-gray-50 font-medium text-sm">
                            <Filter size={16} /> Filtres
                        </button>
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700">
                            Ajouter un client
                        </button>
                    </div>
                </div>
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
                        <tr>
                            <th className="p-4">Client</th>
                            <th className="p-4">Statut</th>
                            <th className="p-4">Type</th>
                            <th className="p-4">Dépenses (LTV)</th>
                            <th className="p-4">Dernière activité</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {CUSTOMERS.map((customer) => (
                            <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
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
                                <td className="p-4 font-medium text-gray-700">{customer.type}</td>
                                <td className="p-4 font-bold text-gray-900">{customer.spent}</td>
                                <td className="p-4 text-gray-500">{customer.lastActive}</td>
                                <td className="p-4 text-right">
                                    <button className="p-2 hover:bg-gray-200 rounded-full text-gray-500">
                                        <MoreVertical size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
