import { useState, useEffect } from 'react';
import { Search, ShoppingCart, Package, Truck, ArrowRight, ExternalLink, Filter, Plus, Check, X, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { formatPrice } from '../../lib/currency';

export function DSersModule() {
    const [activeTab, setActiveTab] = useState<'search' | 'import' | 'products' | 'orders'>('search');
    const [importList, setImportList] = useState<any[]>([]);
    const [myProducts, setMyProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [displayedResults, setDisplayedResults] = useState<any[]>([]);
    const [urlImportMode, setUrlImportMode] = useState(false);

    // Custom Import State with Variants
    const [customImport, setCustomImport] = useState({
        title: '',
        price: '',
        margin: 2.5, // Default margin
        variants: [{ name: 'Style 1', image: '', price: '' }]
    });

    // Image Upload State
    const [uploadingVariantIndex, setUploadingVariantIndex] = useState<number | null>(null);

    // Mock Search Results
    const searchResults = [
        { id: 101, title: 'Jouet Éducatif Montessori en Bois Naturel', price: 12.50, image: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=400&h=400&fit=crop' },
        { id: 102, title: 'Lumière de Nuit Projecteur Étoiles', price: 8.20, image: 'https://images.unsplash.com/photo-1517021897933-0e0319cfbc28?w=400&h=400&fit=crop' },
        { id: 103, title: 'Tapis d\'Éveil Bébé Mousse Douce', price: 15.90, image: 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=400&h=400&fit=crop' },
        { id: 104, title: 'Set de Blocs de Construction Magnétiques', price: 18.00, image: 'https://images.unsplash.com/photo-1587654780291-39c940483713?w=400&h=400&fit=crop' },
        { id: 105, title: 'Peluche Géante Dinosaure Doux', price: 22.00, image: 'https://images.unsplash.com/photo-1557053503-0c252e5c8093?w=400&h=400&fit=crop' },
        { id: 106, title: 'Puzzle 3D en Bois Voiture Vintage', price: 14.50, image: 'https://images.unsplash.com/photo-1612089901768-e6d8ce0a9f54?w=400&h=400&fit=crop' }
    ];

    useEffect(() => {
        if (activeTab === 'products') {
            fetchMyProducts();
        }
    }, [activeTab]);

    const handleSearch = () => {
        if (!searchQuery.trim()) return;

        setIsSearching(true);
        setUrlImportMode(false);

        // Detect if user pasted a URL
        if (searchQuery.toLowerCase().startsWith('http')) {
            setTimeout(() => {
                setIsSearching(false);
                setUrlImportMode(true);
                // Reset with a default variant
                setCustomImport({
                    title: 'Nouveau Produit AliExpress', // Placeholder
                    price: '0.00',
                    margin: 2.5,
                    variants: [{
                        name: 'Couleur Principale',
                        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop',
                        price: '0.00'
                    }]
                });
            }, 600);
            return;
        }

        // Standard Mock Search
        setTimeout(() => {
            const filtered = searchResults.filter(item =>
                item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                searchQuery.toLowerCase() === 'montessori' || // Demo triggers
                searchQuery.length > 0 // Show all for demo purposes if not empty
            );
            // Deduplicate if showing all - simple unique check
            const unique = Array.from(new Set(filtered.map(a => a.id)))
                .map(id => filtered.find(a => a.id === id));

            setDisplayedResults(unique.length > 0 ? unique : searchResults); // Fallback to all for better UX in demo
            setIsSearching(false);
        }, 800);
    };

    const handleCustomImport = () => {
        const mainImage = customImport.variants[0]?.image || '';
        const newProduct = {
            id: Date.now(),
            title: customImport.title,
            original_price: customImport.price, // Base price
            selling_price: (parseFloat(customImport.price) * customImport.margin).toFixed(2), // Base selling price
            image: mainImage,
            images: customImport.variants.map(v => ({ url: v.image, alt: `${customImport.title} - ${v.name}` })),
            variants: customImport.variants.map(v => ({
                ...v,
                selling_price: (parseFloat(v.price || customImport.price) * customImport.margin).toFixed(2)
            })),
            source_url: searchQuery
        };
        setImportList([...importList, newProduct]);
        setSearchQuery('');
        setUrlImportMode(false);
        alert("Produit importé avec succès !");
        setActiveTab('import');
    };

    const fetchMyProducts = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('source', 'dsers')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching DSers products:', error);
            // If the column doesn't exist, this error will trigger
            if (error.message.includes('column "source" does not exist')) {
                alert("⚠️ Colonne manquante : La colonne 'source' n'existe pas dans la table 'products'. Assurez-vous d'avoir exécuté le script SQL.");
            } else {
                alert("Erreur de chargement : " + error.message);
            }
        }

        if (data) setMyProducts(data);
        setLoading(false);
    };

    const addToImport = (product: any) => {
        if (!importList.find(p => p.id === product.id)) {
            setImportList([...importList, { ...product, original_price: product.price, selling_price: (product.price * 2.5).toFixed(2) }]);
        }
        alert("Produit ajouté à la liste d'import !");
    };

    const pushToStore = async (product: any) => {
        try {
            // Check if we have multiple images/variants to save
            const imagesPayload = product.images || (product.image ? [{ url: product.image, alt: '' }] : []);

            const { error } = await supabase.from('products').insert([{
                title: product.title,
                price: parseFloat(product.selling_price),
                image: product.image, // Main image
                images: imagesPayload, // Array of images/variants
                variants: product.variants, // Save detailed variants
                category: 'Jouets', // Default
                description: "Produit importé via DSers. Qualité premium garantie.",
                source: 'dsers',
                stock: 100,
                is_new: true
            }]);

            if (error) throw error;

            // Remove from list and notify
            setImportList(importList.filter(p => p.id !== product.id));
            alert("Produit publié sur la boutique avec succès !");
            setActiveTab('products');

        } catch (error: any) {
            alert("Erreur lors de la publication : " + error.message);
        }
    };

    // Variant Helpers
    const updateVariant = (index: number, field: 'name' | 'image' | 'price', value: string) => {
        const newVariants = [...customImport.variants];
        newVariants[index] = { ...newVariants[index], [field]: value };
        setCustomImport({ ...customImport, variants: newVariants });
    };

    const addVariant = () => {
        setCustomImport({
            ...customImport,
            variants: [...customImport.variants, {
                name: `Option ${customImport.variants.length + 1}`,
                image: '',
                price: customImport.price // Inherit base price by default
            }]
        });
    };

    const removeVariant = (index: number) => {
        if (customImport.variants.length <= 1) return;
        const newVariants = customImport.variants.filter((_, i) => i !== index);
        setCustomImport({ ...customImport, variants: newVariants });
    };

    const handleVariantImageUpload = async (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
        try {
            if (!event.target.files || event.target.files.length === 0) return;

            setUploadingVariantIndex(index);
            const file = event.target.files[0];
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('product-images')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data } = supabase.storage.from('product-images').getPublicUrl(filePath);
            updateVariant(index, 'image', data.publicUrl);

        } catch (error: any) {
            alert('Erreur upload: ' + error.message);
        } finally {
            setUploadingVariantIndex(null);
        }
    };

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
                    { id: 'import', label: `Liste d'Import (${importList.length})`, icon: ShoppingCart },
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
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}

                                    placeholder="Collez une URL AliExpress ou tapez un mot-clé..."
                                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                />
                                <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
                            </div>
                            <button className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50">
                                <Filter size={18} />
                                Filtres
                            </button>
                            <button
                                onClick={handleSearch}
                                disabled={isSearching}
                                className="bg-orange-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-orange-600 disabled:opacity-50 flex items-center gap-2"
                            >
                                {isSearching ? 'Analyse...' : 'Rechercher'}
                            </button>
                        </div>

                        {isSearching ? (
                            <div className="text-center py-20 text-gray-500">
                                <div className="animate-spin w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                                Analyse du lien AliExpress...
                            </div>
                        ) : urlImportMode ? (
                            <div className="max-w-xl mx-auto border border-orange-200 bg-orange-50 rounded-xl p-6">
                                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <ExternalLink size={20} className="text-orange-500" />
                                    Produit AliExpress Détecté
                                </h3>
                                <div className="space-y-4 bg-white p-4 rounded-lg border border-gray-100">

                                    <div className="space-y-4">
                                        {/* Product Basic Info */}
                                        <div className="grid grid-cols-3 gap-4">
                                            <div className="col-span-3">
                                                <label className="text-xs font-bold text-gray-500 uppercase">Titre du Produit</label>
                                                <input
                                                    value={customImport.title}
                                                    onChange={e => setCustomImport({ ...customImport, title: e.target.value })}
                                                    className="w-full p-2 border rounded focus:ring-2 focus:ring-orange-500 outline-none"
                                                    placeholder="Nom du produit..."
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-gray-500 uppercase">Prix Fournisseur ($)</label>
                                                <input
                                                    type="number"
                                                    value={customImport.price}
                                                    onChange={e => setCustomImport({ ...customImport, price: e.target.value })}
                                                    className="w-full p-2 border rounded focus:ring-2 focus:ring-orange-500 outline-none"
                                                    placeholder="0.00"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-green-600 uppercase">Marge (Multiplicateur)</label>
                                                <input
                                                    type="number"
                                                    step="0.1"
                                                    value={customImport.margin}
                                                    onChange={e => setCustomImport({ ...customImport, margin: parseFloat(e.target.value) })}
                                                    className="w-full p-2 border rounded border-green-200 focus:ring-2 focus:ring-green-500 outline-none font-bold text-green-700"
                                                    placeholder="2.5"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-gray-400 uppercase">Prix estimé</label>
                                                <div className="w-full p-2 bg-gray-50 border rounded text-gray-700 font-bold">
                                                    {((parseFloat(customImport.price) || 0) * (customImport.margin || 0)).toFixed(2)} $
                                                </div>
                                            </div>
                                        </div>

                                        {/* Variants / Images Section */}
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Variantes & Images</label>
                                            <div className="space-y-3">
                                                {customImport.variants.map((variant: any, idx: number) => (
                                                    <div key={idx} className="flex gap-4 p-3 border border-gray-100 rounded-lg bg-gray-50 items-start">
                                                        {/* Preview */}
                                                        <div className="w-16 h-16 bg-gray-200 rounded-md overflow-hidden flex-shrink-0 border border-gray-200 group-hover:border-orange-500 transition-colors relative">
                                                            {variant.image ? (
                                                                <img
                                                                    src={variant.image}
                                                                    className="w-full h-full object-cover"
                                                                    onError={(e) => (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150'}
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 text-[8px] text-center p-1">
                                                                    {uploadingVariantIndex === idx ? (
                                                                        <div className="animate-spin w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full" />
                                                                    ) : (
                                                                        <span>Aucune Image</span>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Inputs */}
                                                        <div className="flex-1 space-y-2">
                                                            <div className="flex gap-2">
                                                                <input
                                                                    placeholder="Nom la variante (ex: Rouge)..."
                                                                    value={variant.name}
                                                                    onChange={(e) => updateVariant(idx, 'name', e.target.value)}
                                                                    className="flex-1 p-1.5 text-sm border rounded focus:border-orange-500 outline-none"
                                                                />
                                                                <div className="w-24 relative">
                                                                    <span className="absolute left-1.5 top-1.5 text-gray-400 text-xs">$</span>
                                                                    <input
                                                                        type="number"
                                                                        placeholder="Prix"
                                                                        value={variant.price}
                                                                        onChange={(e) => updateVariant(idx, 'price', e.target.value)}
                                                                        className="w-full pl-4 p-1.5 text-sm border rounded focus:border-orange-500 outline-none"
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="flex gap-2 items-center">
                                                                <div className="relative flex-1">
                                                                    <input
                                                                        placeholder="Collez l'URL... OU utilisez le bouton ->"
                                                                        value={variant.image}
                                                                        onChange={(e) => updateVariant(idx, 'image', e.target.value)}
                                                                        className="w-full p-1.5 text-xs border rounded text-gray-600 focus:border-orange-500 outline-none pr-2"
                                                                    />
                                                                </div>
                                                                <label className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded cursor-pointer border border-gray-300" title="Uploader une image">
                                                                    {uploadingVariantIndex === idx ? (
                                                                        <div className="w-4 h-4 animate-spin border-2 border-gray-500 border-t-transparent rounded-full" />
                                                                    ) : (
                                                                        <Plus size={16} className="text-gray-600" />
                                                                    )}
                                                                    <input
                                                                        type="file"
                                                                        accept="image/*"
                                                                        className="hidden"
                                                                        onChange={(e) => handleVariantImageUpload(e, idx)}
                                                                        disabled={uploadingVariantIndex !== null}
                                                                    />
                                                                </label>
                                                            </div>
                                                            <div className="flex justify-between items-center mt-1">
                                                                <div className="text-[10px] text-orange-600">
                                                                    Si le lien ne marche pas, utilisez le bouton <b>+</b>
                                                                </div>
                                                                <div className="text-xs font-bold text-gray-500">
                                                                    Vente: <span className="text-green-600">{((parseFloat(variant.price || customImport.price) || 0) * customImport.margin).toFixed(2)}$</span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Actions */}
                                                        {customImport.variants.length > 1 && (
                                                            <button
                                                                onClick={() => removeVariant(idx)}
                                                                className="text-red-400 hover:text-red-600 p-1 mt-2"
                                                                title="Supprimer"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}

                                                <button
                                                    onClick={addVariant}
                                                    className="w-full py-2 border border-dashed border-orange-300 text-orange-600 rounded-lg text-sm font-medium hover:bg-orange-50 flex items-center justify-center gap-2"
                                                >
                                                    <Plus size={16} /> Ajouter une variante
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-2 flex gap-3 mt-6">
                                        <button
                                            onClick={handleCustomImport}
                                            className="flex-1 py-2 bg-orange-600 text-white rounded-lg font-bold hover:bg-orange-700"
                                        >
                                            Importer ce produit
                                        </button>
                                        <button
                                            onClick={() => setUrlImportMode(false)}
                                            className="px-4 py-2 text-gray-500 text-sm hover:underline"
                                        >
                                            Annuler
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            displayedResults.length > 0 || searchResults.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {(displayedResults.length > 0 ? displayedResults : searchResults).slice(0, 3).map((item) => (
                                        <div key={item.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                                            <div className="h-48 bg-gray-100 rounded-md mb-4 overflow-hidden relative group">
                                                <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                                            </div>
                                            <h4 className="font-medium text-gray-800 mb-2 line-clamp-2">{item.title}</h4>
                                            <div className="flex items-center justify-between mb-4">
                                                <span className="text-orange-600 font-bold">${item.price.toFixed(2)}</span>
                                                <span className="text-xs text-gray-500">Marge conseillée: x2.5</span>
                                            </div>
                                            <button
                                                onClick={() => addToImport(item)}
                                                className="w-full py-2 border border-orange-500 text-orange-600 rounded-lg hover:bg-orange-50 font-medium text-sm flex items-center justify-center gap-2"
                                            >
                                                <Plus size={16} />
                                                Ajouter à l'import
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-20 text-gray-400">
                                    Tapez un mot-clé (ex: "Montessori", "Jouet") pour voir les produits disponibles.
                                </div>
                            )
                        )}
                    </div>
                )}

                {activeTab === 'import' && (
                    <div className="p-6">
                        {importList.length === 0 ? (
                            <div className="text-center py-20 bg-gray-50 rounded-lg border border-dashed">
                                <ShoppingCart size={48} className="mx-auto text-gray-300 mb-4" />
                                <h3 className="text-lg font-medium text-gray-900">Liste d'import vide</h3>
                                <p className="text-gray-500 mb-6">Recherchez des produits et ajoutez-les ici pour les éditer.</p>
                                <button onClick={() => setActiveTab('search')} className="text-orange-600 font-medium hover:underline flex items-center justify-center gap-2">
                                    Aller à la recherche <ArrowRight size={16} />
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {importList.map(item => (
                                    <div key={item.id} className="flex flex-col md:flex-row gap-6 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                                        <img src={item.image} className="w-24 h-24 object-cover rounded-lg bg-gray-100" />
                                        <div className="flex-1 space-y-3">
                                            <div>
                                                <label className="text-xs text-gray-500 uppercase font-bold">Titre du produit</label>
                                                <input
                                                    value={item.title}
                                                    onChange={(e) => {
                                                        const newList = [...importList];
                                                        newList.find(p => p.id === item.id).title = e.target.value;
                                                        setImportList(newList);
                                                    }}
                                                    className="w-full p-2 border rounded font-medium text-gray-800 focus:outline-none focus:border-orange-500"
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-xs text-gray-500 uppercase font-bold">Prix Fournisseur</label>
                                                    <p className="text-gray-600 font-medium">${item.original_price}</p>
                                                </div>
                                                <div>
                                                    <label className="text-xs text-gray-500 uppercase font-bold">Prix de Vente</label>
                                                    <input
                                                        type="number"
                                                        value={item.selling_price}
                                                        onChange={(e) => {
                                                            const newList = [...importList];
                                                            newList.find(p => p.id === item.id).selling_price = e.target.value;
                                                            setImportList(newList);
                                                        }}
                                                        className="w-full p-2 border rounded font-bold text-orange-600 focus:outline-none focus:border-orange-500"
                                                    />
                                                </div>
                                            </div>
                                            {/* Show variants thumbnails */}
                                            {item.variants && item.variants.length > 0 && (
                                                <div className="mt-2">
                                                    <p className="text-xs text-gray-500 mb-1 font-medium">{item.variants.length} variantes :</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {item.variants.map((v: any, idx: number) => (
                                                            <div key={idx} className="relative group" title={v.name}>
                                                                <img
                                                                    src={v.image || 'https://via.placeholder.com/40'}
                                                                    className="w-10 h-10 rounded border border-gray-200 object-cover bg-white"
                                                                    alt={v.name}
                                                                />
                                                                <span className="sr-only">{v.name}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-center">
                                            <button
                                                onClick={() => pushToStore(item)}
                                                className="px-6 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 flex items-center gap-2"
                                            >
                                                <Check size={18} /> Pusher
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'products' && (
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-bold text-gray-800">Produits Synchronisés ({myProducts.length})</h3>
                            <button className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                                <ExternalLink size={14} /> Ouvrir DSers Dashboard
                            </button>
                        </div>

                        {loading ? <div className="text-center p-8">Chargement...</div> : (
                            myProducts.length === 0 ? (
                                <p className="text-gray-500">Aucun produit dropshipping actif. Importez des produits depuis l'onglet Recherche.</p>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                    {myProducts.map(prod => (
                                        <div key={prod.id} className="border rounded-lg overflow-hidden shadow-sm">
                                            <img src={prod.image} className="w-full h-40 object-cover" />
                                            <div className="p-3">
                                                <h4 className="font-medium text-gray-800 text-sm mb-1 truncate">{prod.title}</h4>
                                                <p className="text-orange-600 font-bold">{formatPrice(prod.price)}</p>
                                                <div className="mt-2 flex justify-between items-center text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                                                    <span>Synchronisé</span>
                                                    <Check size={12} />
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
