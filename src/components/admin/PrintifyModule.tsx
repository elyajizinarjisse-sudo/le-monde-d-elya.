import { useState, useEffect } from 'react';
import { Printer, Search, ShoppingBag, Palette, ExternalLink, PenTool, X, Check } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { formatPrice } from '../../lib/currency';

export function PrintifyModule() {
    const [activeTab, setActiveTab] = useState<'catalog' | 'my-products' | 'orders'>('catalog');
    const [myProducts, setMyProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // Design Wizard State
    const [isDesignOpen, setIsDesignOpen] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
    const [designForm, setDesignForm] = useState({ title: '', price: '', color: 'White' });

    useEffect(() => {
        if (activeTab === 'my-products') {
            fetchMyProducts();
        }
    }, [activeTab]);

    const fetchMyProducts = async () => {
        setLoading(true);
        const { data } = await supabase.from('products').select('*').eq('source', 'printify').order('created_at', { ascending: false });
        if (data) setMyProducts(data);
        setLoading(false);
    };

    const handleStartDesign = (item: any) => {
        setSelectedTemplate(item);
        setDesignForm({
            title: `Custom ${item.title}`,
            price: (parseFloat(item.price.replace('$', '')) * 2).toFixed(2),
            color: 'White'
        });
        setIsDesignOpen(true);
    };

    const handlePublish = async () => {
        try {
            const { error } = await supabase.from('products').insert([{
                title: designForm.title,
                price: parseFloat(designForm.price),
                image: getMockImage(selectedTemplate.img, designForm.color),
                category: 'Vêtements', // Default logic could be smarter
                description: `Produit personnalisé sur mesure. Base: ${selectedTemplate.title}. Couleur: ${designForm.color}.`,
                source: 'printify',
                stock: 999, // POD implies infinite stock
                is_new: true
            }]);

            if (error) throw error;

            setIsDesignOpen(false);
            alert("Produit créé et publié avec succès !");
            setActiveTab('my-products');

        } catch (error: any) {
            alert("Erreur lors de la publication : " + error.message);
        }
    };

    const getMockImage = (type: string, color: string) => {
        // Simple mock logic for dynamic images
        if (type === 'shirt') return color === 'Black'
            ? 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=400&h=400&fit=crop' // Black Shirt
            : 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop'; // White Shirt

        if (type === 'mug') return 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=400&h=400&fit=crop';
        if (type === 'bag') return 'https://images.unsplash.com/photo-1597484661643-2f5fef640dd1?w=400&h=400&fit=crop';
        return 'https://images.unsplash.com/photo-1572375992501-4b0892d50c69?w=400&h=400&fit=crop'; // Poster
    };

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
                    Mes Produits {myProducts.length > 0 && `(${myProducts.length})`}
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
                                        <button
                                            onClick={() => handleStartDesign(item)}
                                            className="w-full mt-3 py-2 bg-gray-900 text-white rounded-lg text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2"
                                        >
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
                    <div className="space-y-6">
                        {loading ? <div className="text-center">Chargement...</div> : (
                            myProducts.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="inline-flex p-4 bg-green-50 rounded-full text-green-600 mb-4">
                                        <ShoppingBag size={32} />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-800">Aucun produit Printify</h3>
                                    <p className="text-gray-500 max-w-md mx-auto mt-2">Créez votre premier produit personnalisé depuis l'onglet Catalogue.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                    {myProducts.map(prod => (
                                        <div key={prod.id} className="border rounded-lg overflow-hidden shadow-sm">
                                            <img src={prod.image} className="w-full h-40 object-cover" />
                                            <div className="p-3">
                                                <h4 className="font-medium text-gray-800 text-sm mb-1 truncate">{prod.title}</h4>
                                                <p className="text-green-600 font-bold">{formatPrice(prod.price)}</p>
                                                <div className="mt-2 flex justify-between items-center text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                                    <span>Print On Demand</span>
                                                    <Printer size={12} />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )
                        )}
                    </div>
                )}

                {activeTab === 'orders' && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                        <p className="text-gray-500">Aucune commande Print on Demand en cours.</p>
                    </div>
                )}

            </div>

            {/* Design Modal */}
            {isDesignOpen && selectedTemplate && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100">
                            <h3 className="text-xl font-bold text-gray-800">Designer {selectedTemplate.title}</h3>
                            <button onClick={() => setIsDesignOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Preview */}
                            <div className="bg-gray-50 rounded-lg flex items-center justify-center p-4 border border-dashed border-gray-200">
                                <img src={getMockImage(selectedTemplate.img, designForm.color)} className="w-full h-full object-contain rounded-md" />
                            </div>

                            {/* Form */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Titre du produit</label>
                                    <input
                                        value={designForm.title}
                                        onChange={(e) => setDesignForm({ ...designForm, title: e.target.value })}
                                        className="w-full p-2 border rounded-lg"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Couleur</label>
                                    <select
                                        value={designForm.color}
                                        onChange={(e) => setDesignForm({ ...designForm, color: e.target.value })}
                                        className="w-full p-2 border rounded-lg bg-white"
                                    >
                                        <option value="White">Blanc</option>
                                        <option value="Black">Noir</option>
                                        <option value="Navy">Bleu Marine</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Prix de vente (€)</label>
                                    <input
                                        type="number"
                                        value={designForm.price}
                                        onChange={(e) => setDesignForm({ ...designForm, price: e.target.value })}
                                        className="w-full p-2 border rounded-lg font-bold"
                                    />
                                </div>

                                <div className="pt-4">
                                    <button
                                        onClick={handlePublish}
                                        className="w-full py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 flex items-center justify-center gap-2"
                                    >
                                        <Check size={20} />
                                        Publier sur la boutique
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
