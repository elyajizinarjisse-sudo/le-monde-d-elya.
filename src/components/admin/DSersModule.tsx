import { useState } from 'react';
import { Search, ShoppingCart, Package, Truck, ArrowRight, ExternalLink, Filter } from 'lucide-react';

export function DSersModule() {
    const [activeTab, setActiveTab] = useState<'search' | 'import' | 'products' | 'orders'>('search');

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 rounded-xl text-white shadow-md">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                        <Package size={32} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold">DSers Dropshipping</h2>
                        <p className="text-orange-100">Connectez vos fournisseurs et gérez vos importations</p>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                {[
                    { id: 'search', label: 'Recherche Fournisseurs', icon: Search },
                    { id: 'import', label: 'Liste d\'Import (2)', icon: ShoppingCart },
                    { id: 'products', label: 'Mes Produits', icon: Package },
                    { id: 'orders', label: 'Commandes', icon: Truck },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${activeTab === tab.id
                                ? 'bg-orange-100 text-orange-700'
                                : 'bg-white text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        <tab.icon size={16} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 min-h-[400px]">

                {activeTab === 'search' && (
                    <div className="p-6 space-y-6">
                        <div className="flex gap-4">
                            <div className="flex-1 relative">
                                <input
                                    type="text"
                                    placeholder="Rechercher sur AliExpress..."
                                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                />
                                <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
                            </div>
                            <button className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50">
                                <Filter size={18} />
                                Filtres
                            </button>
                            <button className="bg-orange-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-orange-600">
                                Rechercher
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                                    <div className="h-48 bg-gray-100 rounded-md mb-4 flex items-center justify-center text-gray-400">
                                        Image Produit
                                    </div>
                                    <h4 className="font-medium text-gray-800 mb-2 line-clamp-2">Jouet Éducatif Montessori en Bois Naturel pour Enfants</h4>
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-orange-600 font-bold">$12.50</span>
                                        <span className="text-xs text-gray-500">Marge: x2.5</span>
                                    </div>
                                    <button className="w-full py-2 border border-orange-500 text-orange-600 rounded-lg hover:bg-orange-50 font-medium text-sm flex items-center justify-center gap-2">
                                        <ShoppingCart size={16} />
                                        Ajouter à l'import
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'import' && (
                    <div className="p-6">
                        <div className="text-center py-20 bg-gray-50 rounded-lg border border-dashed">
                            <ShoppingCart size={48} className="mx-auto text-gray-300 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900">2 Produits en attente</h3>
                            <p className="text-gray-500 mb-6">Personnalisez les titres et descriptions avant de publier.</p>
                            <button className="text-orange-600 font-medium hover:underline flex items-center justify-center gap-2">
                                Voir la liste complète <ArrowRight size={16} />
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === 'products' && (
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-bold text-gray-800">Produits Synchronisés</h3>
                            <button className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                                <ExternalLink size={14} /> Ouvrir DSers Dashboard
                            </button>
                        </div>
                        <p className="text-gray-500">Aucun produit dropshipping actif pour le moment.</p>
                    </div>
                )}

                {activeTab === 'orders' && (
                    <div className="p-6">
                        <h3 className="font-bold text-gray-800 mb-4">Commandes à traiter</h3>
                        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg flex items-start gap-3">
                            <div className="mt-1 text-yellow-600"><Truck size={20} /></div>
                            <div>
                                <h4 className="font-bold text-yellow-800">Synchronisation active</h4>
                                <p className="text-sm text-yellow-700">Les commandes passeront automatiquement ici une fois payées par les clients.</p>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
