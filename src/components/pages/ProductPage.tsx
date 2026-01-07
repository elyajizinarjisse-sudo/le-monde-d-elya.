
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Star, Heart, ShoppingBag, Truck, ShieldCheck, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useCart } from '../../context/CartContext';
import { formatPrice } from '../../lib/currency';
import type { Product } from '../home/ProductCard';

interface ProductVariant {
    name: string;
    price?: number | string; // Relaxed type to handle DB strings
    selling_price?: number | string;
    stock?: number;
}

interface FullProduct extends Product {
    description?: string;
    images?: (string | { url: string; alt?: string })[]; // Relaxed type
    variants?: ProductVariant[];
    customization_options?: { id: string; type: 'text' | 'select' | 'file'; label: string; required: boolean; options?: string[] }[];
    stock_status?: string;
}

export function ProductPage() {
    const { id } = useParams();
    const { addToCart, setIsCartOpen } = useCart();

    const [product, setProduct] = useState<FullProduct | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState<string>('');
    const [selectedVariant, setSelectedVariant] = useState<string>('');
    const [customizationValues, setCustomizationValues] = useState<Record<string, string>>({});
    const [uploadingFiles, setUploadingFiles] = useState<Record<string, boolean>>({});
    const [error, setError] = useState<string | null>(null);

    // Helpers
    const getSafeString = (val: any): string => {
        if (!val) return '';
        if (typeof val === 'string') return val;
        if (typeof val === 'object') return JSON.stringify(val);
        return String(val);
    };

    const getImageUrl = (img: any): string => {
        if (!img) return '';
        if (typeof img === 'string') return img;
        if (typeof img === 'object' && img.url) return img.url;
        return '';
    };

    const parsePrice = (price: any): number => {
        if (typeof price === 'number') return price;
        if (typeof price === 'string') return parseFloat(price);
        return 0;
    };

    useEffect(() => {
        const fetchProduct = async () => {
            if (!id) return;
            setIsLoading(true);
            try {
                const { data, error } = await supabase
                    .from('products')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (error) throw error;

                if (data) {
                    setProduct(data);

                    // Safe Image Init
                    const mainImage = getImageUrl(data.image) || 'https://images.unsplash.com/photo-1512820790803-83ca734da794';
                    setSelectedImage(mainImage);

                    // Safe Variant Init
                    if (data.variants && Array.isArray(data.variants) && data.variants.length > 0) {
                        setSelectedVariant(data.variants[0].name);
                    }

                    // Safe Customization Init
                    if (data.customization_options && Array.isArray(data.customization_options)) {
                        const initialValues: Record<string, string> = {};
                        data.customization_options.forEach((opt: any) => {
                            const safeLabel = getSafeString(opt.label);
                            if (opt.type === 'text') initialValues[safeLabel] = '';
                            if (opt.type === 'select' && Array.isArray(opt.options) && opt.options.length > 0) {
                                const firstOpt = opt.options[0];
                                initialValues[safeLabel] = getSafeString(firstOpt);
                            }
                        });
                        setCustomizationValues(initialValues);
                    }
                }
            } catch (err: any) {
                console.error("Error fetching product:", err);
                setError(`Erreur technique: ${err.message || JSON.stringify(err)}`);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    // Sync Image with Variant
    useEffect(() => {
        if (!selectedVariant || !product || !product.variants) return;
        // Robust finding: try exact match first, then trimmed match
        const variant = product.variants.find(v => v.name === selectedVariant)
            || product.variants.find(v => v.name.trim() === selectedVariant.trim());

        if (variant && variant.image) {
            setSelectedImage(variant.image);
        }
    }, [selectedVariant, product]);

    const handleAddToCart = () => {
        if (!product) return;

        // Validation
        if (product.customization_options && Array.isArray(product.customization_options)) {
            for (const option of product.customization_options) {
                const safeLabel = getSafeString(option.label);
                if (option.required && !customizationValues[safeLabel]) {
                    alert(`Veuillez remplir le champ : ${safeLabel}`);
                    return;
                }
            }
        }

        // Price Logic
        const variantData = product.variants?.find(v => v.name === selectedVariant);
        // Prefer selling_price, fallback to price
        const variantPrice = variantData
            ? (variantData.selling_price ? parsePrice(variantData.selling_price) : parsePrice(variantData.price))
            : 0;

        const finalPrice = variantData ? variantPrice : parsePrice(product.price);

        addToCart({
            ...product,
            price: finalPrice, // Ensure number
            variant: selectedVariant ? { name: selectedVariant, price: finalPrice } : undefined,
            customizations: customizationValues
        });
        setIsCartOpen(true);
    };

    const handleFileUpload = async (file: File, label: string) => {
        if (!file) return;
        setUploadingFiles(prev => ({ ...prev, [label]: true }));
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
            const filePath = `uploads/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('customer-uploads')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('customer-uploads')
                .getPublicUrl(filePath);

            setCustomizationValues(prev => ({ ...prev, [label]: publicUrl }));
        } catch (error: any) {
            console.error('Error uploading file:', error);
            alert('Erreur: ' + (error.message || 'Problème de téléchargement'));
        } finally {
            setUploadingFiles(prev => ({ ...prev, [label]: false }));
        }
    };

    // Calculate current price for display
    const currentPrice = product
        ? (selectedVariant
            ? (() => {
                const v = product.variants?.find(varItem => varItem.name === selectedVariant);
                if (!v) return parsePrice(product.price);
                // Prefer selling_price, fallback to price
                return v.selling_price ? parsePrice(v.selling_price) : parsePrice(v.price);
            })()
            : parsePrice(product.price))
        : 0;

    if (isLoading) {
        return (
            <div className="min-h-[50vh] flex items-center justify-center">
                <div className="animate-pulse flex flex-col items-center">
                    <Loader2 className="h-12 w-12 text-gray-200 animate-spin mb-4" />
                    <p className="text-gray-400 font-cursive text-xl">Recherche de la magie...</p>
                </div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="min-h-[50vh] flex flex-col items-center justify-center p-4 text-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Produit Introuvable</h2>
                <p className="text-red-500 mb-6 font-mono bg-red-50 p-2 rounded">{error}</p>
                <Link to="/" className="bg-primary text-white px-6 py-2 rounded-full hover:bg-primary/90 transition">
                    Retour à la boutique
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen pb-20">
            {/* Breadcrumb */}
            <div className="container mx-auto px-4 py-6">
                <Link to="/" className="inline-flex items-center text-gray-500 hover:text-primary transition-colors">
                    <ArrowLeft size={18} className="mr-2" />
                    Retour
                </Link>
            </div>

            <div className="container mx-auto px-4">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-8">

                        {/* LEFT: Gallery */}
                        <div className="p-6 md:p-8 bg-gray-50/50">
                            <div className="relative aspect-square md:aspect-[4/3] rounded-xl overflow-hidden bg-white shadow-sm border border-gray-100 mb-4">
                                <img
                                    src={selectedImage}
                                    alt={getSafeString(product.title)}
                                    className="w-full h-full object-contain p-4 hover:scale-105 transition-transform duration-500"
                                />
                                {product.isSale && (
                                    <span className="absolute top-4 left-4 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                        Promo
                                    </span>
                                )}
                            </div>

                            {/* Thumbnails */}
                            {(() => {
                                // Deduplicate images: Merge main image + gallery images, then use Set
                                const allImages = [
                                    product.image ? getImageUrl(product.image) : null,
                                    ...(Array.isArray(product.images) ? product.images.map(getImageUrl) : [])
                                ].filter(Boolean) as string[];

                                const uniqueImages = Array.from(new Set(allImages));

                                if (uniqueImages.length <= 1) return null; // Don't show thumbnails if only 1 unique image

                                return (
                                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                                        {uniqueImages.map((thumbUrl, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => setSelectedImage(thumbUrl)}
                                                className={`w-20 h-20 flex-shrink-0 rounded-lg border-2 overflow-hidden ${selectedImage === thumbUrl ? 'border-primary' : 'border-transparent'}`}
                                            >
                                                <img src={thumbUrl} className="w-full h-full object-cover" />
                                            </button>
                                        ))}
                                    </div>
                                );
                            })()}
                        </div>

                        {/* RIGHT: Info */}
                        <div className="p-6 md:p-10 flex flex-col">
                            <div className="mb-6">
                                {product.subcategory && (
                                    <span className="text-sm font-bold text-pastel-pink uppercase tracking-wider">
                                        {getSafeString(product.subcategory)}
                                    </span>
                                )}
                                <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mt-2 mb-2">
                                    {getSafeString(product.title)}
                                </h1>
                                {product.author && (
                                    <p className="text-gray-500 text-sm">Par {getSafeString(product.author)}</p>
                                )}

                                <div className="flex items-center gap-4 mt-4">
                                    <div className="flex items-center bg-yellow-50 px-2 py-1 rounded-lg border border-yellow-100">
                                        <Star size={16} className="text-yellow-400 fill-current" />
                                        <span className="ml-1 font-bold text-gray-700">{getSafeString(product.rating) || '5.0'}</span>
                                        <span className="ml-1 text-xs text-gray-400">({getSafeString(product.reviews) || '0'} avis)</span>
                                    </div>
                                    <div className="h-4 w-px bg-gray-200"></div>
                                    <span className="text-green-600 text-sm font-medium flex items-center">
                                        <ShieldCheck size={16} className="mr-1" />
                                        En stock
                                    </span>
                                </div>
                            </div>

                            <div className="h-px bg-gray-100 w-full mb-6"></div>

                            {/* Price */}
                            <div className="mb-6">
                                <div className="flex items-baseline gap-3">
                                    <span className="text-4xl font-bold text-primary">
                                        {formatPrice(currentPrice)}
                                    </span>
                                    {product.isSale && product.originalPrice && (
                                        <span className="text-xl text-gray-400 line-through">
                                            {formatPrice(parsePrice(product.originalPrice))}
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Taxes et livraison calculées au paiement.</p>
                            </div>

                            {/* Customization Options */}
                            {Array.isArray(product.customization_options) && product.customization_options.length > 0 && (
                                <div className="mb-6 p-4 bg-purple-50 rounded-xl border border-purple-100">
                                    <h3 className="text-sm font-bold text-gray-800 mb-3 uppercase tracking-wide">Personnalisation</h3>
                                    <div className="space-y-4">
                                        {product.customization_options.map((option, idx) => {
                                            const safeLabel = getSafeString(option.label);
                                            return (
                                                <div key={idx}>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        {safeLabel} {option.required && <span className="text-red-500">*</span>}
                                                    </label>

                                                    {option.type === 'select' ? (
                                                        <select
                                                            value={customizationValues[safeLabel] || ''}
                                                            onChange={(e) => setCustomizationValues({ ...customizationValues, [safeLabel]: e.target.value })}
                                                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-200 focus:border-purple-500 outline-none"
                                                        >
                                                            {Array.isArray(option.options) && option.options.map((opt: any) => (
                                                                <option key={getSafeString(opt)} value={getSafeString(opt)}>{getSafeString(opt)}</option>
                                                            ))}
                                                        </select>
                                                    ) : option.type === 'file' ? (
                                                        <div>
                                                            <input
                                                                type="file"
                                                                accept="image/*,.pdf"
                                                                onChange={(e) => {
                                                                    if (e.target.files?.[0]) {
                                                                        handleFileUpload(e.target.files[0], safeLabel);
                                                                    }
                                                                }}
                                                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-200 focus:border-purple-500 outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                                                            />
                                                            {uploadingFiles[safeLabel] && <p className="text-xs text-purple-600 mt-1">Téléchargement en cours...</p>}
                                                            {customizationValues[safeLabel] && !uploadingFiles[safeLabel] && (
                                                                <div className="mt-2 text-xs text-green-600 flex items-center">
                                                                    <span className="mr-1">✓</span> Fichier reçu
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <input
                                                            type="text"
                                                            value={customizationValues[safeLabel] || ''}
                                                            onChange={(e) => setCustomizationValues({ ...customizationValues, [safeLabel]: e.target.value })}
                                                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-200 focus:border-purple-500 outline-none"
                                                            placeholder={`Entrez ${safeLabel}`}
                                                        />
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Live Preview */}
                            {(Object.keys(customizationValues).length > 0 || Object.values(uploadingFiles).some(v => v)) && (
                                <div className="mb-6 p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-100 shadow-sm animate-scale-in">
                                    <h3 className="text-sm font-bold text-indigo-900 mb-3 flex items-center gap-2">
                                        ✨ Aperçu de votre personnalisation
                                    </h3>

                                    {/* Font Loading */}
                                    <style>{`
                                        @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&family=Handlee&family=Roboto:wght@500&display=swap');
                                        .font-cursif { font-family: 'Dancing Script', cursive; }
                                        .font-baton { font-family: 'Roboto', sans-serif; }
                                        .font-manuscrit { font-family: 'Handlee', cursive; }
                                    `}</style>

                                    <div className="bg-white p-4 rounded-lg border border-indigo-100/50 shadow-inner space-y-4">
                                        {Object.entries(customizationValues).map(([key, value]) => {
                                            const safeValue = getSafeString(value);
                                            if (!safeValue) return null;

                                            // Determine font style if this is a text preview
                                            let fontClass = "font-sans";
                                            if (product.customization_options) {
                                                const fontOptionLabel = product.customization_options.find(o => o.label.toLowerCase().includes("police"))?.label;
                                                const selectedFont = fontOptionLabel ? customizationValues[fontOptionLabel] : "";

                                                if (selectedFont) {
                                                    if (selectedFont.toLowerCase().includes("cursif")) fontClass = "font-cursif text-2xl";
                                                    else if (selectedFont.toLowerCase().includes("bâton") || selectedFont.toLowerCase().includes("baton")) fontClass = "font-baton text-lg tracking-wide uppercase";
                                                    else if (selectedFont.toLowerCase().includes("manuscrit")) fontClass = "font-manuscrit text-xl";
                                                }
                                            }

                                            // Only apply specific font logic to "Prénom" or "Message" fields
                                            const isTextToPreview = key.toLowerCase().includes("prénom") || key.toLowerCase().includes("message") || key.toLowerCase().includes("texte");
                                            const activeFont = isTextToPreview ? fontClass : "";

                                            const isUrl = safeValue.startsWith('http');
                                            return (
                                                <div key={key} className="flex flex-col gap-1">
                                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{key}</span>
                                                    {isUrl ? (
                                                        <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-gray-200">
                                                            <img src={value} alt="Preview" className="w-full h-full object-cover" />
                                                        </div>
                                                    ) : (
                                                        <p className={`text-indigo-600 bg-indigo-50 px-3 py-2 rounded-lg border border-indigo-100 inline-block ${activeFont}`}>
                                                            {safeValue}
                                                        </p>
                                                    )}
                                                </div>
                                            );
                                        })}
                                        {Object.values(uploadingFiles).some(v => v) && (
                                            <div className="flex items-center gap-2 text-indigo-600 text-sm animate-pulse">
                                                <Loader2 size={16} className="animate-spin" />
                                                <span>Génération de l'aperçu...</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Variants */}
                            {Array.isArray(product.variants) && product.variants.length > 0 && (
                                <div className="mb-6">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Variante
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {product.variants.map((variant) => (
                                            <button
                                                key={getSafeString(variant.name)}
                                                onClick={() => setSelectedVariant(variant.name)}
                                                className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${selectedVariant === variant.name
                                                    ? 'border-primary bg-primary/5 text-primary'
                                                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                                                    }`}
                                            >
                                                {getSafeString(variant.name)}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex items-center gap-4 mb-8">
                                <button
                                    onClick={handleAddToCart}
                                    className="flex-1 bg-primary text-white h-12 rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 group"
                                >
                                    <ShoppingBag size={20} className="group-hover:animate-bounce" />
                                    Ajouter au panier
                                </button>
                                <button className="h-12 w-12 flex items-center justify-center border border-gray-200 rounded-xl text-gray-400 hover:text-red-500 hover:border-red-100 hover:bg-red-50 transition-colors">
                                    <Heart size={20} />
                                </button>
                            </div>

                            {/* Description */}
                            <div className="prose prose-sm prose-purple text-gray-600 bg-gray-50 p-4 rounded-xl border border-gray-100">
                                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide mb-2">Description</h3>
                                <div dangerouslySetInnerHTML={{ __html: getSafeString(product.description) || "<p>Aucune description détaillée.</p>" }} />
                            </div>

                            {/* Delivery Info */}
                            <div className="mt-6 flex items-start gap-3">
                                <div className="p-2 bg-green-50 rounded-lg text-green-600">
                                    <Truck size={20} />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-gray-800">Livraison Rapide</h4>
                                    <p className="text-xs text-gray-500">Expédié sous 24-48h. Livraison gratuite dès 35$.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
