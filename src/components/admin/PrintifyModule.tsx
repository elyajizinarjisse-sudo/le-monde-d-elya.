import { useState } from 'react';
import { Printer, Search, ShoppingBag, Palette, ExternalLink, PenTool } from 'lucide-react';

export function PrintifyModule() {
    const [activeTab, setActiveTab] = useState<'catalog' | 'my-products' | 'orders'>('catalog');

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 to-emerald-500 p-6 rounded-xl text-white shadow-md">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                        <Printer size={32} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold">Printify Studio</h2>
                        <p className="text-green-100">Créez et vendez des produits personnalisés à la demande</p>
                    </div>
                    <button className="ml-auto bg-white text-green-700 px-4 py-2 rounded-lg font-bold text-sm shadow-sm hover:bg-green-50 flex items-center gap-2">
                        <ExternalLink size={16} />
                        Voir catalogue complet
                    </button>
                </div>
            </div>

            {/* Navigation */}
            <div className="flex gap-2 border-b border-gray-200 pb-1">
                <button
                    onClick={() => setActiveTab('catalog')}
                    className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${activeTab === 'catalog'
                        ? 'bg-white text-green-700 border-b-2 border-green-600'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Catalogue
                </button>
                <button
                    onClick={() => setActiveTab('my-products')}
                    className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${activeTab === 'my-products'
                        ? 'bg-white text-green-700 border-b-2 border-green-600'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Mes Produits (5)
                </button>
                <button
                    onClick={() => setActiveTab('orders')}
                    className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${activeTab === 'orders'
                        ? 'bg-white text-green-700 border-b-2 border-green-600'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Commandes
                </button>
            </div>

            {/* Content */}
            <div className="bg-white rounded-b-xl rounded-tr-xl shadow-sm border border-gray-100 border-t-0 p-6 min-h-[400px]">

                {activeTab === 'catalog' && (
                    <div className="space-y-6">
                        <div className="flex gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    placeholder="T-shirts, Mugs, Posters..."
                                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {[
                                { title: 'T-shirt Unisex Bio', price: '$12.00', img: 'shirt' },
                                { title: 'Mug Céramique', price: '$5.50', img: 'mug' },
                                { title: 'Tote Bag Coton', price: '$8.00', img: 'bag' },
                                { title: 'Poster Premium', price: '$10.00', img: 'poster' },
                            ].map((item, i) => (
                                <div key={i} className="group border rounded-xl overflow-hidden hover:shadow-lg transition-all cursor-pointer">
                                    <div className="h-40 bg-gray-100 flex items-center justify-center text-gray-300">
                                        {item.img === 'shirt' && <Palette size={40} />}
                                        {item.img === 'mug' && <ShoppingBag size={40} />}
                                        {item.img !== 'shirt' && item.img !== 'mug' && <Printer size={40} />}
                                    </div>
                                    <div className="p-4">
                                        <h4 className="font-bold text-gray-800 mb-1">{item.title}</h4>
                                        <p className="text-green-600 font-medium text-sm">À partir de {item.price}</p>
                                        <button className="w-full mt-3 py-2 bg-gray-900 text-white rounded-lg text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                            <PenTool size={14} />
                                            Commencer le design
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'my-products' && (
                    <div className="text-center py-12">
                        <div className="inline-flex p-4 bg-green-50 rounded-full text-green-600 mb-4">
                            <ShoppingBag size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-800">Vos produits sont synchronisés</h3>
                        <p className="text-gray-500 max-w-md mx-auto mt-2">5 produits sont actuellement en ligne et prêts à être imprimés lors des commandes.</p>
                    </div>
                )}

                {activeTab === 'orders' && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                        <p className="text-gray-500">Aucune commande Print on Demand en cours.</p>
                    </div>
                )}

            </div>
        </div>
    );
}
