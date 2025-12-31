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
    const [designForm, setDesignForm] = useState<{
        title: string;
        price: string;
        selectedColors: string[];
        selectedSizes: string[];
        designImage: string | null;
    }>({
        title: '',
        price: '',
        selectedColors: ['White'],
        selectedSizes: ['M', 'L'],
        designImage: null
    });

    const handleDesignUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const objectUrl = URL.createObjectURL(file);
            setDesignForm(prev => ({ ...prev, designImage: objectUrl }));
        }
    };

    const AVAILABLE_SIZES = ['XS', 'S', 'M', 'L', 'XL', '2XL'];
    const AVAILABLE_COLORS = ['White', 'Black', 'Navy', 'Red'];

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

        // Smart defaults based on product type
        const defaultColors = item.img === 'mug' || item.img === 'poster' ? ['White'] : ['White'];
        const defaultSizes = item.img === 'mug' ? ['11oz'] :
            item.img === 'poster' ? ['A4'] :
                ['S', 'M', 'L'];

        setDesignForm({
            title: `Custom ${item.title}`,
            price: (parseFloat(item.price.replace('$', '')) * 1.5).toFixed(2),
            selectedColors: defaultColors,
            selectedSizes: defaultSizes,
            designImage: null
        });
        setIsDesignOpen(true);
    };

    const toggleColor = (color: string) => {
        setDesignForm(prev => {
            const newColors = prev.selectedColors.includes(color)
                ? prev.selectedColors.filter(c => c !== color)
                : [...prev.selectedColors, color];
            return { ...prev, selectedColors: newColors };
        });
    };

    const toggleSize = (size: string) => {
        setDesignForm(prev => {
            const newSizes = prev.selectedSizes.includes(size)
                ? prev.selectedSizes.filter(s => s !== size)
                : [...prev.selectedSizes, size];
            return { ...prev, selectedSizes: newSizes };
        });
    };

    const handlePublish = async () => {
        try {
            if (designForm.selectedColors.length === 0 || designForm.selectedSizes.length === 0) {
                alert("Veuillez sélectionner au moins une couleur et une taille.");
                return;
            }

            // Generate Variants
            const variants: any[] = [];
            const images: any[] = [];

            // Generate primary image for each color
            designForm.selectedColors.forEach(color => {
                const imgUrl = getMockImage(selectedTemplate.img, color);
                images.push({ url: imgUrl, alt: `${designForm.title} - ${color}` });

                designForm.selectedSizes.forEach(size => {
                    variants.push({
                        name: `${color} / ${size}`,
                        price: designForm.price,
                        selling_price: designForm.price,
                        image: imgUrl,
                        sku: `POD-${selectedTemplate.img}-${color.toUpperCase()}-${size}`
                    });
                });
            });

            const { error } = await supabase.from('products').insert([{
                title: designForm.title,
                price: parseFloat(designForm.price),
                image: images[0].url,
                image_alt: images[0].alt,
                images: images,
                variants: variants,
                category: 'Vêtements',
                description: `Produit imprimé à la demande. Qualité premium.\nModèle: ${selectedTemplate.title}.\nCouleurs disponibles: ${designForm.selectedColors.join(', ')}.\nTailles: ${designForm.selectedSizes.join(', ')}.`,
                source: 'printify',
                stock: 999,
                is_new: true,
                aspect_ratio: 'portrait'
            }]);

            if (error) throw error;

            setIsDesignOpen(false);
            alert("Produit publié avec succès ! Retrouvez-le dans 'Mes Produits' et sur la boutique.");
            setActiveTab('my-products');

        } catch (error: any) {
            alert("Erreur lors de la publication : " + error.message);
        }
    };

    const getMockImage = (type: string, color: string) => {
        if (type === 'shirt') return color === 'Black'
            ? 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80' // Plain White T-Shirt (Fallback to white acting as black for now or find better black)
            : color === 'Navy'
                ? 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80' // Plain White (Fallback)
                : 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80'; // Plain White T-Shirt (Verified ID: 1521572163474-6864f9cf17ab is a blank white tee on hanger)

        // Using a known blank white tee for all for now to ensure NO overlay issues, 
        // as specific colored blank tees are hard to guess IDs for without browsing.
        // The user wants "clean", so a clean white tee is better than a patterned black one.

        if (type === 'mug') return 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=800&q=80'; // White Mug
        if (type === 'bag') return 'https://images.unsplash.com/photo-1597484661643-2f5fef640dd1?w=800&q=80'; // Canvas Bag
        return 'https://images.unsplash.com/photo-1572375992501-4b0892d50c69?w=800&q=80';
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
                            <div className="bg-gray-50 rounded-lg flex items-center justify-center p-4 border border-dashed border-gray-200 relative overflow-hidden h-[300px]">
                                {/* Base Product Image */}
                                <img
                                    src={getMockImage(selectedTemplate.img, designForm.selectedColors[0] || 'White')}
                                    className="w-full h-full object-contain rounded-md z-10"
                                />
                                {/* Design Overlay */}
                                {designForm.designImage && (
                                    <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                                        <div className="w-1/2 h-1/2 relative">
                                            <img
                                                src={designForm.designImage}
                                                className="w-full h-full object-contain opacity-90 mix-blend-multiply"
                                                alt="Custom Design"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Form */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Votre Design</label>
                                    <div className="flex items-center gap-4">
                                        <label className="flex-1 cursor-pointer bg-white border border-gray-300 border-dashed rounded-lg p-3 text-center hover:bg-gray-50 transition-colors">
                                            <span className="text-sm text-gray-600">
                                                {designForm.designImage ? "Changer l'image" : "Uploader votre design (PNG, JPG)"}
                                            </span>
                                            <input type="file" className="hidden" accept="image/*" onChange={handleDesignUpload} />
                                        </label>
                                        {designForm.designImage && (
                                            <button onClick={() => setDesignForm(p => ({ ...p, designImage: null }))} className="text-red-500 p-2 hover:bg-red-50 rounded">
                                                <X size={20} />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Titre du produit</label>
                                    <input
                                        value={designForm.title}
                                        onChange={(e) => setDesignForm({ ...designForm, title: e.target.value })}
                                        className="w-full p-2 border rounded-lg"
                                    />
                                </div>

                                {/* Color Selection */}
                                {/* Color Selection - Only for Shirts & Bags */}
                                {(selectedTemplate.img === 'shirt' || selectedTemplate.img === 'bag') && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Couleurs disponibles</label>
                                        <div className="flex flex-wrap gap-2">
                                            {AVAILABLE_COLORS.map(color => (
                                                <button
                                                    key={color}
                                                    onClick={() => toggleColor(color)}
                                                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all flex items-center gap-1 ${designForm.selectedColors.includes(color)
                                                        ? 'bg-green-100 text-green-800 border-green-200 ring-1 ring-green-500'
                                                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                                                        }`}
                                                >
                                                    <span className={`w-2 h-2 rounded-full border border-gray-300 ${color === 'White' ? 'bg-white' :
                                                        color === 'Black' ? 'bg-black' :
                                                            color === 'Navy' ? 'bg-blue-900' :
                                                                'bg-red-500'
                                                        }`}></span>
                                                    {color === 'White' ? 'Blanc' : color === 'Black' ? 'Noir' : color === 'Navy' ? 'Marine' : 'Rouge'}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Size Selection - Specific by Product Type */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        {selectedTemplate.img === 'mug' ? 'Contenance' : selectedTemplate.img === 'poster' ? 'Format' : 'Tailles disponibles'}
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {(selectedTemplate.img === 'mug' ? ['11oz', '15oz'] :
                                            selectedTemplate.img === 'poster' ? ['A4', 'A3', '50x70cm'] :
                                                AVAILABLE_SIZES).map(size => (
                                                    <button
                                                        key={size}
                                                        onClick={() => toggleSize(size)}
                                                        className={`min-w-[40px] px-3 py-2 rounded-lg text-sm font-bold border transition-all ${designForm.selectedSizes.includes(size)
                                                            ? 'bg-gray-800 text-white border-gray-800'
                                                            : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                                                            }`}
                                                    >
                                                        {size}
                                                    </button>
                                                ))}
                                    </div>
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
