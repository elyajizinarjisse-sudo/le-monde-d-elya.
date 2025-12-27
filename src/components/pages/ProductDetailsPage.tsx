import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { Star, ShoppingBag, ArrowLeft, Truck, ShieldCheck, RefreshCw } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { supabase } from '../../lib/supabase';
import { BOOKS, TOYS, DECOR } from '../../data/mockData';

export function ProductDetailsPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();

    // Use 'any' to accommodate both Supabase shape and Mock shape during transition
    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState<string>('');

    useEffect(() => {
        const fetchProduct = async () => {
            setLoading(true);
            // 1. Try DB
            const { data } = await supabase
                .from('products')
                .select('*')
                .eq('id', id)
                .single();

            if (data) {
                setProduct(data);
                // Initialize selected image
                if (data.images && data.images.length > 0) {
                    setSelectedImage(data.images[0].url);
                } else {
                    setSelectedImage(data.image);
                }
            } else {
                // 2. Fallback to Mock (legacy support)
                const allMock = [...BOOKS, ...TOYS, ...DECOR];
                const mockP = allMock.find(p => p.id === Number(id));
                if (mockP) {
                    setProduct(mockP);
                    setSelectedImage(mockP.image);
                }
            }
            setLoading(false);
        };

        if (id) fetchProduct();
    }, [id]);

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center font-bold text-gray-400 animate-pulse">Chargement de votre trouvaille...</div>;
    }

    if (!product) {
        return (
            <div className="min-h-[50vh] flex flex-col items-center justify-center p-4">
                <h1 className="text-2xl font-bold text-gray-800 mb-4">Produit introuvable 😕</h1>
                <button onClick={() => navigate('/')} className="text-primary underline">Retour à l'accueil</button>
            </div>
        );
    }

    // Handle price display robustness (string vs number)
    const displayPrice = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
    const displayOriginalPrice = product.originalPrice ? (typeof product.originalPrice === 'string' ? parseFloat(product.originalPrice) : product.originalPrice) : null;
    const rating = product.rating || 5; // Default 5 stars for new products
    const reviews = product.reviews || 0;

    // Verify images array structure
    let productImages = product.images || [];
    if (typeof productImages === 'string') {
        try {
            productImages = JSON.parse(productImages);
        } catch (e) {
            console.error("Failed to parse images JSON", e);
            productImages = [];
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 lg:py-12">
            {/* Debug section removed */}

            <Helmet>
                <title>{`${product.title} - Le Monde d'Elya`}</title>
                <meta name="description" content={`Achetez ${product.title} sur Le Monde d'Elya. ${product.category}.`} />
            </Helmet>

            <div className="container mx-auto px-4 max-w-6xl">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-600 hover:text-primary mb-6 transition-colors"
                >
                    <ArrowLeft size={20} />
                    Retour
                </button>

                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="grid md:grid-cols-2 gap-0">
                        {/* Image Section */}
                        <div className="bg-gray-100 p-8 md:p-12 flex flex-col items-center justify-center gap-4">
                            <div className={`relative w-full max-w-md shadow-2xl rounded-2xl overflow-hidden bg-white ${product.aspect_ratio === 'square' ? 'aspect-square' :
                                product.aspect_ratio === 'landscape' ? 'aspect-[4/3]' :
                                    'aspect-[3/4]' // Default portrait
                                }`}>
                                <img
                                    src={selectedImage || product.image}
                                    alt={product.title}
                                    className="w-full h-full object-contain"
                                />
                            </div>

                            {/* Thumbnails Gallery */}
                            {productImages && productImages.length > 0 ? (
                                <div className="flex gap-2 overflow-x-auto p-2 max-w-full">
                                    {productImages.map((img: any, idx: number) => (
                                        <button
                                            key={idx}
                                            onClick={() => setSelectedImage(img.url)}
                                            className={`relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${selectedImage === img.url
                                                ? 'border-primary shadow-md scale-105'
                                                : 'border-transparent hover:border-gray-300'
                                                }`}
                                        >
                                            <img
                                                src={img.url}
                                                alt={img.alt || product.title}
                                                className="w-full h-full object-cover"
                                            />
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="hidden">{/* No additional images */}</div>
                            )}
                        </div>

                        {/* Details Section */}
                        <div className="p-8 md:p-12 flex flex-col">
                            <div className="mb-auto">
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="px-3 py-1 bg-pastel-yellow text-gray-800 text-xs font-bold uppercase tracking-wider rounded-full">
                                        {product.category || 'Article'}
                                    </span>
                                    {product.is_new && (
                                        <span className="px-3 py-1 bg-blue-100 text-blue-600 text-xs font-bold uppercase tracking-wider rounded-full">
                                            Nouveau
                                        </span>
                                    )}
                                    {product.isSale && (
                                        <span className="px-3 py-1 bg-red-100 text-red-600 text-xs font-bold uppercase tracking-wider rounded-full">
                                            Solde
                                        </span>
                                    )}
                                </div>

                                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 font-cursive">{product.title}</h1>
                                {product.subcategory && <p className="text-lg text-gray-500 mb-4">{product.subcategory}</p>}

                                <div className="flex items-center gap-4 mb-8">
                                    <div className="flex items-center text-secondary">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} size={20} fill={i < Math.floor(rating) ? "currentColor" : "none"} />
                                        ))}
                                    </div>
                                    <span className="text-sm text-gray-500 underline">{reviews} avis client</span>
                                </div>

                                <div className="text-4xl font-bold text-primary mb-8 flex items-baseline gap-4">
                                    {product.isSale && displayOriginalPrice ? (
                                        <>
                                            {displayPrice.toFixed(2)} $
                                            <span className="text-xl text-gray-400 line-through font-normal">{displayOriginalPrice.toFixed(2)} $</span>
                                        </>
                                    ) : (
                                        <span>{displayPrice.toFixed(2)} $</span>
                                    )}
                                </div>

                                <div className="prose prose-sm text-gray-600 mb-8 font-sans">
                                    {/* Display fetched Description or Fallback */}
                                    {product.description ? (
                                        <p className="whitespace-pre-line">{product.description}</p>
                                    ) : (
                                        <p>Ajoutez une touche de magie au quotidien de votre enfant avec cet article soigneusement sélectionné par l'équipe d'Elya. Qualité et émerveillement garantis.</p>
                                    )}
                                </div>

                                <button
                                    onClick={() => addToCart(product)}
                                    className="w-full md:w-auto px-8 py-4 bg-primary hover:bg-opacity-90 text-white font-bold rounded-xl flex items-center justify-center gap-3 transition-all transform hover:scale-[1.02] shadow-lg shadow-primary/30"
                                >
                                    <ShoppingBag size={24} />
                                    Ajouter au panier
                                </button>
                            </div>

                            <div className="mt-12 pt-8 border-t border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="flex flex-col items-center text-center gap-2">
                                    <Truck className="text-secondary" size={24} />
                                    <span className="text-xs font-bold text-gray-900">Livraison Rapide</span>
                                    <span className="text-[10px] text-gray-500">Expédition sous 24h</span>
                                </div>
                                <div className="flex flex-col items-center text-center gap-2">
                                    <ShieldCheck className="text-secondary" size={24} />
                                    <span className="text-xs font-bold text-gray-900">Paiement Sécurisé</span>
                                    <span className="text-[10px] text-gray-500">100% protégé</span>
                                </div>
                                <div className="flex flex-col items-center text-center gap-2">
                                    <RefreshCw className="text-secondary" size={24} />
                                    <span className="text-xs font-bold text-gray-900">Retours Gratuits</span>
                                    <span className="text-[10px] text-gray-500">Sous 30 jours</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Debug section removed from bottom */}

        </div>
    );
}
