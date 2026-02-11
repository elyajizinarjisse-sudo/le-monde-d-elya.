
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Star, Heart, ShoppingBag, Truck, ShieldCheck, Loader2, Image as ImageIcon, Type } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useCart } from '../../context/CartContext';
import { formatPrice } from '../../lib/currency';
import { SEO } from '../common/SEO';
import type { Product } from '../home/ProductCard';

interface ProductVariant {
    name: string;
    price?: number | string; // Relaxed type to handle DB strings
    selling_price?: number | string;
    stock?: number;
    image?: string;
}

interface FullProduct extends Product {
    description?: string;
    images?: (string | { url: string; alt?: string })[]; // Relaxed type
    variants?: ProductVariant[];
    customization_options?: { id: string; type: 'text' | 'select' | 'file'; label: string; required: boolean; options?: string[] }[];
    stock_status?: string;
    technical_views?: {
        front?: string;
        back?: string;
        right?: string;
        left?: string;
        flat?: string;
    };
}

export function ProductPage() {
    const { id } = useParams();
    const { addToCart, setIsCartOpen } = useCart();

    const [dragging, setDragging] = useState<{ type: 'text' | 'image'; id: string } | null>(null);

    const [product, setProduct] = useState<FullProduct | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState<string>('');
    const [selectedVariant, setSelectedVariant] = useState<string>('');
    const [customizationValues, setCustomizationValues] = useState<Record<string, string>>({});
    const [uploadingFiles, setUploadingFiles] = useState<Record<string, boolean>>({});

    // Positioning & Scaling (Per-Option)
    const [textPositions, setTextPositions] = useState<Record<string, { x: number; y: number }>>({});
    const [imagePositions, setImagePositions] = useState<Record<string, { x: number; y: number }>>({});
    const [textScales, setTextScales] = useState<Record<string, number>>({});
    const [imageScales, setImageScales] = useState<Record<string, number>>({});

    // State for view switching (front, back, left, right) - specific for Casquette
    // Initialize to null so it defaults to the Main Marketing Image (selectedImage)
    const [currentView, setCurrentView] = useState<string | null>(null);

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
                        const initialPositions: Record<string, { x: number; y: number }> = {};
                        const initialScales: Record<string, number> = {};

                        data.customization_options.forEach((opt: any) => {
                            const safeLabel = getSafeString(opt.label);
                            if (opt.type === 'text') initialValues[safeLabel] = '';
                            if (opt.type === 'select' && Array.isArray(opt.options) && opt.options.length > 0) {
                                const firstOpt = opt.options[0];
                                initialValues[safeLabel] = getSafeString(firstOpt);
                            }
                            initialPositions[safeLabel] = { x: 50, y: 50 };
                            initialScales[safeLabel] = 1.0;
                        });
                        setCustomizationValues(initialValues);
                        setTextPositions(initialPositions);
                        setImagePositions(initialPositions);
                        setTextScales(initialScales);
                        setImageScales(initialScales);
                    }

                    // Auto-initialize currentView if technical_views exists
                    if (data.technical_views) {
                        const views = data.technical_views;
                        if (views.flat) setCurrentView('flat');
                        else if (views.front) setCurrentView('front');
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

    // DRAG AND DROP HANDLERS
    const handleMouseDown = (e: React.MouseEvent, type: 'text' | 'image', id: string) => {
        e.stopPropagation();
        e.preventDefault();
        setDragging({ type, id });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!dragging) return;

        // Find the container ref based on the event target or parent
        // Actually we use a single global containerRef for the whole preview area
        // but if we have multiple zones, maybe we should use the zone's rect?
        // No, simplest is to use the direct parent of the dragged item if it has a ref,
        // but we'll stick to a common pattern.

        const target = (e.target as HTMLElement).closest('.preview-zone-container');
        if (!target) return;

        const rect = target.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        // Clamp values 0-100
        const clampedX = Math.max(0, Math.min(100, x));
        const clampedY = Math.max(0, Math.min(100, y));

        if (dragging.type === 'text') {
            setTextPositions(prev => ({ ...prev, [dragging.id]: { x: clampedX, y: clampedY } }));
        } else if (dragging.type === 'image') {
            setImagePositions(prev => ({ ...prev, [dragging.id]: { x: clampedX, y: clampedY } }));
        }
    };

    const handleMouseUp = () => {
        setDragging(null);
    };

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

    // Prepare images for Gallery and View Switching (Deduplicated)
    const uniqueImages = (() => {
        const mainImgUrl = product.image ? getImageUrl(product.image) : '';
        const galleryImages = Array.isArray(product.images) ? product.images.map(getImageUrl).filter(Boolean) : [];
        const allImages = [mainImgUrl, ...galleryImages].filter(Boolean) as string[];
        return Array.from(new Set(allImages));
    })();

    // For Casquette (15/16), we separate Marketing Images (Gallery) from Technical Views (Buttons)
    // Assumption: The last 4 images in the unique list are the Technical Views (Front, Back, Right, Left)
    // IF there are enough images.
    // For Casquette (ID 15/16), we separate technical technical views
    const isCasquette = getSafeString(product.id) === '15' || getSafeString(product.id) === '16';

    // Known Technical View URLs (AVIFs) - Identified from DB
    // 0.9042... was identified as the 'Flexfit Label' photo, not a technical view.
    const TECHNICAL_VIEWS = [
        '0.001767523287284023.avif', // Front
        '0.9920138127518984.avif', // Back
        '0.9882617325508585.avif'  // Side (New candidate for Side View)
        // '0.450798083985984.avif' // This is clearly the Label, so we remove from Tech Views to keep in Gallery
    ];

    // Use Technical Views if available (from new JSONB column)
    const technicalViews = product.technical_views || {};
    const hasTechnicalViews = Object.keys(technicalViews).length > 0;

    // Use explicit technical views if available, otherwise fallback to finding them in the images array (Legacy)
    let viewImages: string[] = [];

    if (hasTechnicalViews) {
        viewImages = [
            technicalViews.front || '',
            technicalViews.back || '',
            technicalViews.right || '',
            technicalViews.left || ''
        ].filter(Boolean);
    } else if (isCasquette) {
        // ... (Keep existing legacy logic as fallback for now, or simplify)
        // Explicitly set the known valid Technical Views to avoid logic errors
        const explicitFront = uniqueImages.find(u => u.includes('0.001767523287284023.avif'));
        const explicitBack = uniqueImages.find(u => u.includes('0.9920138127518984.avif'));
        const explicitSide = uniqueImages.find(u => u.includes('0.9882617325508585.avif'));

        if (explicitFront && explicitBack && explicitSide) {
            viewImages = [explicitFront, explicitBack, explicitSide, explicitSide];
        } else {
            // Fallback if images missing
            const foundTechViews = uniqueImages.filter(url =>
                TECHNICAL_VIEWS.some(tech => url.includes(tech))
            );
            if (foundTechViews.length > 0) {
                // Reconstruct viewImages in correct order for buttons [Front, Back, Right, Left]
                const front = foundTechViews.find(u => u.includes('0.0017'));
                const back = foundTechViews.find(u => u.includes('0.9920'));
                const side = foundTechViews.find(u => u.includes('0.9882'));
                viewImages = [front, back, side, side].filter(Boolean) as string[];
            }
        }
    } else if (uniqueImages.length >= 4) {
        // Fallback (Legacy behavior just in case URLs changed)
        viewImages = uniqueImages.slice(-4);
    }

    // Gallery Images: For Casquette, if we have technical views, we don't want to show them ALL in main gallery necessarily.
    // But user request was primarily separation.
    // Let's keep uniqueImages as the source for galleryImages, but MAYBE filter out the ones that are technical views IF they were explicitly migrated?
    // User said "lui se fournit dans la banque d'image du main page".
    // If we use technical_views, we use THOSE for the preview.
    // The Gallery remains 'uniqueImages'.
    const galleryImages = uniqueImages;


    const productSchema = product ? {
        "@context": "https://schema.org/",
        "@type": "Product",
        "name": product.title,
        "image": product.image,
        "description": product.description || product.title,
        "brand": {
            "@type": "Brand",
            "name": "Le Monde d'Elya"
        },
        "offers": {
            "@type": "Offer",
            "priceCurrency": "CAD",
            "price": product.price,
            "availability": "https://schema.org/InStock"
        }
    } : null;

    return (
        <div className="bg-gray-50 min-h-screen pb-20">
            {product && (
                <SEO
                    title={product.title}
                    description={product.description || `Découvrez ${product.title} dans la boutique magique Le Monde d'Elya. Livraison rapide au Québec.`}
                    image={product.image}
                    url={`/product/${product.id}`}
                    type="product"
                    schemaData={productSchema}
                />
            )}
            {/* Breadcrumb */}
            <div className="container mx-auto px-4 py-6">
                <Link to="/" className="inline-flex items-center text-gray-500 hover:text-primary transition-colors">
                    <ArrowLeft size={18} className="mr-2" />
                    Retour
                </Link>
            </div>

            <div className="container mx-auto px-4">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">

                        {/* LEFT: Gallery */}
                        <div className="p-6 md:p-8 bg-gray-50/50">
                            {/* Dynamic Aspect Ratio Calculation */}
                            {(() => {
                                let dynamicAspectRatio = product.aspect_ratio === 'portrait' ? '3/4' : product.aspect_ratio === 'landscape' ? '4/3' : '1/1';

                                // Override with Variant Dimensions if available
                                if (selectedVariant) {
                                    // Robust regex: Match two numbers separated by 'x'
                                    const match = selectedVariant.match(/(\d+)\D+x\D+(\d+)/i);
                                    if (match) {
                                        let w = parseInt(match[1]);
                                        let h = parseInt(match[2]);

                                        // Explicit Orientation Override
                                        const lowerVariant = selectedVariant.toLowerCase();
                                        if (lowerVariant.includes('horizontal') || lowerVariant.includes('paysage')) {
                                            if (h > w) { const temp = w; w = h; h = temp; }
                                        } else if (lowerVariant.includes('vertical') || lowerVariant.includes('portrait')) {
                                            if (w > h) { const temp = w; w = h; h = temp; }
                                        }

                                        if (!isNaN(w) && !isNaN(h) && h !== 0) {
                                            dynamicAspectRatio = `${w}/${h}`;
                                        }
                                    }
                                }

                                return (
                                    <div
                                        className="relative rounded-xl overflow-hidden bg-white shadow-sm border border-gray-100 mb-4 w-full transition-all duration-300 ease-in-out"
                                        style={{ aspectRatio: dynamicAspectRatio }}
                                    >
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
                                );
                            })()}

                            {/* Thumbnails */}
                            {(() => {
                                if (galleryImages.length <= 1) return null;

                                return (
                                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                                        {galleryImages.map((thumbUrl, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => {
                                                    setSelectedImage(thumbUrl);
                                                    setCurrentView(null);
                                                }}
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

                            {/* VARIANTS SELECTOR */}
                            {product.variants && product.variants.length > 0 && (
                                <div className="mb-6">
                                    <h3 className="text-sm font-bold text-gray-800 mb-3 uppercase tracking-wide">
                                        {(product.category === 'Impressions' || product.category === 'Affiches') ? 'Options' : 'Modèle'}
                                    </h3>

                                    {/* POSTER UI: Split Size & Finish if applicable */}
                                    {((product.category === 'Impressions' || product.category === 'Affiches') && product.variants[0].name.includes(' - ')) ? (
                                        (() => {
                                            // 1. EXTRACT DATA
                                            // Expected format: "Size - Finish"
                                            const allSizes = new Set<string>();
                                            const allFinishes = new Set<string>();
                                            const map: Record<string, Record<string, string>> = {}; // size -> finish -> variantName

                                            product.variants?.forEach(v => {
                                                const parts = v.name.split(' - ');
                                                if (parts.length >= 2) {
                                                    const size = parts[0];
                                                    const finish = parts[1];
                                                    allSizes.add(size);
                                                    allFinishes.add(finish);

                                                    if (!map[size]) map[size] = {};
                                                    map[size][finish] = v.name;
                                                }
                                            });

                                            // Determine current selection parts
                                            const currentParts = selectedVariant.split(' - ');
                                            const currentSize = currentParts[0];
                                            const currentFinish = currentParts[1];

                                            return (
                                                <div className="space-y-4">
                                                    {/* SIZES */}
                                                    <div>
                                                        <label className="text-xs font-semibold text-gray-500 mb-2 block">Dimensions</label>
                                                        <div className="flex flex-wrap gap-2">
                                                            {Array.from(allSizes).map(size => (
                                                                <button
                                                                    key={size}
                                                                    onClick={() => {
                                                                        // Try to keep current finish if possible, else pick first available
                                                                        const nextVariant = map[size][currentFinish] || map[size][Object.keys(map[size])[0]];
                                                                        setSelectedVariant(nextVariant);
                                                                    }}
                                                                    className={`px-3 py-2 text-sm border rounded-lg transition-all ${currentSize === size
                                                                        ? 'border-primary bg-primary/5 text-primary font-bold ring-1 ring-primary'
                                                                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                                                                        }`}
                                                                >
                                                                    {size}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {/* FINISHES */}
                                                    <div>
                                                        <label className="text-xs font-semibold text-gray-500 mb-2 block">Finition</label>
                                                        <div className="flex flex-wrap gap-2">
                                                            {Array.from(allFinishes).map(finish => (
                                                                <button
                                                                    key={finish}
                                                                    onClick={() => {
                                                                        // Try to find variant with current size and new finish
                                                                        const nextVariant = map[currentSize]?.[finish];
                                                                        if (nextVariant) setSelectedVariant(nextVariant);
                                                                    }}
                                                                    className={`px-4 py-2 text-sm border rounded-lg transition-all ${currentFinish === finish
                                                                        ? 'border-primary bg-primary/5 text-primary font-bold ring-1 ring-primary'
                                                                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                                                                        }`}
                                                                >
                                                                    {finish}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })()
                                    ) : (
                                        /* STANDARD UI: Simple Buttons */
                                        <div className="flex flex-wrap gap-2">
                                            {product.variants.map((variant) => (
                                                <button
                                                    key={variant.name}
                                                    onClick={() => setSelectedVariant(variant.name)}
                                                    className={`px-4 py-2 text-sm border rounded-lg transition-all ${selectedVariant === variant.name
                                                        ? 'border-primary bg-primary/5 text-primary font-bold ring-1 ring-primary'
                                                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                                                        }`}
                                                >
                                                    {variant.name}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Customization Options */}
                            {Array.isArray(product.customization_options) && product.customization_options.length > 0 && (
                                <div className="mb-6 p-4 bg-purple-50 rounded-xl border border-purple-100">
                                    <h3 className="text-sm font-bold text-gray-800 mb-3 uppercase tracking-wide">Personnalisation</h3>

                                    <div className="space-y-4">
                                        {product.customization_options.map((option, idx) => {
                                            const safeLabel = getSafeString(option.label);

                                            return (
                                                <div key={idx} className="animate-fade-in">
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

                            {/* Duplicate Controls Removed */}

                            {/* Live Preview */}
                            {(Object.keys(customizationValues).length > 0 || Object.values(uploadingFiles).some(v => v)) && (
                                <div className="mb-6 animate-scale-in">
                                    <h3 className="text-sm font-bold text-indigo-900 mb-3 flex items-center gap-2">
                                        ✨ Aperçu de votre personnalisation
                                    </h3>

                                    {(() => {
                                        const PREVIEW_ZONES_HARDCODED: Record<string, { style: React.CSSProperties }> = {
                                            '15': { style: { top: '20%', left: '15%', width: '70%', height: '55%' } },
                                            '16': { style: { top: '20%', left: '15%', width: '70%', height: '55%' } },
                                            '14': { style: { top: '25%', left: '25%', width: '50%', height: '50%' } },
                                            '11': { style: { top: '20%', left: '28%', width: '44%', height: '40%' } },
                                            '10': { style: { top: '55%', left: '25%', width: '50%', height: '20%' } },
                                            '13': { style: { top: '16%', left: '5%', width: '90%', height: '68%' } },
                                            '23': { style: { top: '5%', left: '5%', width: '90%', height: '90%' } },
                                            '24': { style: { top: '5%', left: '5%', width: '90%', height: '90%' } }
                                        };

                                        let bgImage = selectedImage;
                                        const tv = product.technical_views as any;
                                        if (tv && Object.keys(tv).length > 0) {
                                            if (currentView === 'front') bgImage = tv.front || bgImage;
                                            else if (currentView === 'back') bgImage = tv.back || bgImage;
                                            else if (currentView === 'right') bgImage = tv.right || bgImage;
                                            else if (currentView === 'left') bgImage = tv.left || bgImage;
                                            else if (currentView === 'side') bgImage = tv.right || bgImage;
                                            else if (currentView === 'flat') bgImage = tv.flat || bgImage;
                                        }

                                        let aspectRatio = '1/1';
                                        const lowerCat = product.category?.toLowerCase() || '';
                                        const lowerSub = product.subcategory?.toLowerCase() || '';
                                        const isPoster = lowerCat === 'impressions' || lowerCat === 'affiches' || lowerCat === 'poster' || lowerSub.includes('affiches') || lowerSub.includes('poster') || getSafeString(product.id) === '22';

                                        if (isPoster && selectedVariant) {
                                            const match = selectedVariant.match(/(\d+)\D+x\D+(\d+)/i);
                                            if (match) {
                                                let w = parseInt(match[1]);
                                                let h = parseInt(match[2]);
                                                const lowerV = selectedVariant.toLowerCase();
                                                if (lowerV.includes('horizontal') || lowerV.includes('paysage')) { if (h > w) { const tmp = w; w = h; h = tmp; } }
                                                else if (lowerV.includes('vertical') || lowerV.includes('portrait')) { if (w > h) { const tmp = w; w = h; h = tmp; } }
                                                if (!isNaN(w) && !isNaN(h) && h !== 0) aspectRatio = `${w}/${h}`;
                                            }
                                        }

                                        let activeZones: { id: string; label?: string; style: React.CSSProperties }[] = [];
                                        if (tv?.zones && Array.isArray(tv.zones)) {
                                            activeZones = tv.zones.map((z: any) => ({
                                                id: z.id || z.label || Math.random().toString(),
                                                label: z.label || z.ticket || z.id,
                                                style: { top: `${z.y}%`, left: `${z.x}%`, width: `${z.width}%`, height: `${z.height}%` }
                                            }));
                                        } else {
                                            const hardcoded = PREVIEW_ZONES_HARDCODED[getSafeString(product.id)];
                                            if (hardcoded) activeZones = [{ id: 'default', style: hardcoded.style }];
                                            else if (isPoster) activeZones = [{ id: 'default', style: { top: '0%', left: '0%', width: '100%', height: '100%' } }];
                                        }

                                        if (activeZones.length === 0) return null;

                                        return (
                                            <div className="relative w-full bg-gray-100 rounded-xl overflow-hidden border border-gray-200" style={{ aspectRatio }}>
                                                {isCasquette && viewImages.length >= 4 && (
                                                    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-30 pointer-events-auto">
                                                        {['front', 'back', 'right', 'left'].map(v => (
                                                            <button key={v} onClick={() => setCurrentView(v)} className={`px-2 py-1 text-[10px] font-bold rounded-full transition-colors ${currentView === v ? 'bg-indigo-600 text-white' : 'bg-white/80 text-gray-700'}`}>
                                                                {v.toUpperCase()}
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}

                                                <img src={bgImage} alt="Preview" className="absolute inset-0 w-full h-full object-contain z-10" />

                                                {activeZones.map(zone => {
                                                    const matchZone = (optLabel: string) => {
                                                        if (activeZones.length <= 1) return true;
                                                        const zl = (zone.label || zone.id || "").toLowerCase();
                                                        const ol = optLabel.toLowerCase();
                                                        return zl.includes(ol) || ol.includes(zl)
                                                            || (zl.includes("top") && ol.includes("devant"))
                                                            || (zl.includes("bottom") && ol.includes("dos"))
                                                            || (zl.includes("devant") && ol.includes("top"))
                                                            || (zl.includes("dos") && ol.includes("bottom"));
                                                    };

                                                    return (
                                                        <div key={zone.id} className="absolute z-20 flex items-center justify-center preview-zone-container" style={{ ...zone.style }} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
                                                            {Object.entries(customizationValues).map(([key, value]) => {
                                                                if (!value || !matchZone(key)) return null;
                                                                const isUrl = value.startsWith('http');
                                                                const option = product.customization_options?.find(o => getSafeString(o.label) === key);
                                                                if (!isUrl && option && option.type !== 'text') return null;

                                                                // View Filtering for Casquette
                                                                if (isCasquette) {
                                                                    const k = key.toLowerCase();
                                                                    const cv = currentView || 'front';
                                                                    if ((k.includes('face') || k.includes('front')) && cv !== 'front') return null;
                                                                    if ((k.includes('dos') || k.includes('back')) && cv !== 'back') return null;
                                                                }

                                                                if (isUrl) {
                                                                    const pos = imagePositions[key] || { x: 50, y: 50 };
                                                                    const sc = imageScales[key] || 1.0;
                                                                    return (
                                                                        <div key={key} className="absolute origin-center cursor-move hover:border hover:border-dashed hover:border-indigo-400" style={{ top: `${pos.y}%`, left: `${pos.x}%`, width: '40%', transform: `translate(-50%, -50%) scale(${sc})`, zIndex: 10 }} onMouseDown={(e) => handleMouseDown(e, 'image', key)}>
                                                                            <img src={value} alt="logo" className="w-full h-auto pointer-events-none" />
                                                                        </div>
                                                                    );
                                                                } else {
                                                                    const pos = textPositions[key] || { x: 50, y: 50 };
                                                                    const sc = textScales[key] || 1.0;
                                                                    const fontLabel = product.customization_options?.find(o => o.label.toLowerCase().includes("police"))?.label;
                                                                    const selectedFont = fontLabel ? customizationValues[fontLabel] : "";
                                                                    let fontFamily = "inherit";
                                                                    const f = selectedFont?.toLowerCase() || "";
                                                                    if (f.includes("cursif") || f.includes("great vibes") || f.includes("cursive")) fontFamily = "'Great Vibes', cursive";
                                                                    else if (f.includes("bâton") || f.includes("roboto") || f.includes("sans")) fontFamily = "'Roboto', sans-serif";

                                                                    const colorLabel = product.customization_options?.find(o => o.label.toLowerCase().includes("couleur"))?.label;
                                                                    const selectedColor = colorLabel ? customizationValues[colorLabel] : "black";
                                                                    const colorMap: Record<string, string> = { "Noir": "black", "Blanc": "white", "Rouge": "#D32F2F" };
                                                                    return (
                                                                        <div key={key} className="absolute transform -translate-x-1/2 -translate-y-1/2 whitespace-nowrap cursor-move hover:border hover:border-dashed hover:border-indigo-400" style={{ top: `${pos.y}%`, left: `${pos.x}%`, zIndex: 11, transform: `translate(-50%, -50%) scale(${sc})` }} onMouseDown={(e) => handleMouseDown(e, 'text', key)}>
                                                                            <span style={{ fontFamily, color: colorMap[selectedColor] || selectedColor, fontSize: 'clamp(12px, 3vw, 24px)' }}>{value}</span>
                                                                        </div>
                                                                    );
                                                                }
                                                            })}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        );
                                    })()}

                                    <div className="mt-4 space-y-3">
                                        {Object.entries(customizationValues).map(([key, value]) => {
                                            if (!value) return null;
                                            const isUrl = value.startsWith('http');
                                            const option = product.customization_options?.find(o => getSafeString(o.label) === key);
                                            if (!isUrl && option && option.type !== 'text') return null;

                                            const isDraggingThis = dragging?.id === key;

                                            return (
                                                <div key={key} className={`p-3 rounded-lg border transition-all ${isDraggingThis ? 'bg-indigo-50 border-indigo-300 shadow-md' : 'bg-gray-50 border-gray-100'}`}>
                                                    <div className="flex justify-between items-center mb-2">
                                                        <span className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-1">
                                                            {isUrl ? <ImageIcon size={12} /> : <Type size={12} />} {key}
                                                        </span>
                                                        <span className="text-[10px] text-indigo-600 font-medium">Contrôles</span>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div className="space-y-1">
                                                            <div className="flex justify-between text-[8px] text-gray-400"><span>Pos X</span><span>{Math.round(isUrl ? (imagePositions[key]?.x || 50) : (textPositions[key]?.x || 50))}%</span></div>
                                                            <input type="range" min="0" max="100" value={isUrl ? (imagePositions[key]?.x || 50) : (textPositions[key]?.x || 50)} onChange={e => {
                                                                const val = parseInt(e.target.value);
                                                                if (isUrl) setImagePositions(p => ({ ...p, [key]: { ...p[key], x: val } }));
                                                                else setTextPositions(p => ({ ...p, [key]: { ...p[key], x: val } }));
                                                            }} className="w-full accent-indigo-600 h-1 bg-gray-200 rounded-full appearance-none" />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <div className="flex justify-between text-[8px] text-gray-400"><span>Pos Y</span><span>{Math.round(isUrl ? (imagePositions[key]?.y || 50) : (textPositions[key]?.y || 50))}%</span></div>
                                                            <input type="range" min="0" max="100" value={isUrl ? (imagePositions[key]?.y || 50) : (textPositions[key]?.y || 50)} onChange={e => {
                                                                const val = parseInt(e.target.value);
                                                                if (isUrl) setImagePositions(p => ({ ...p, [key]: { ...p[key], y: val } }));
                                                                else setTextPositions(p => ({ ...p, [key]: { ...p[key], y: val } }));
                                                            }} className="w-full accent-indigo-600 h-1 bg-gray-200 rounded-full appearance-none" />
                                                        </div>
                                                    </div>

                                                    <div className="mt-2 space-y-1">
                                                        <div className="flex justify-between text-[8px] text-gray-400"><span>Zoom</span><span>{Math.round((isUrl ? (imageScales[key] || 1) : (textScales[key] || 1)) * 100)}%</span></div>
                                                        <input type="range" min="0.2" max="3.0" step="0.1" value={isUrl ? (imageScales[key] || 1) : (textScales[key] || 1)} onChange={e => {
                                                            const val = parseFloat(e.target.value);
                                                            if (isUrl) setImageScales(p => ({ ...p, [key]: val }));
                                                            else setTextScales(p => ({ ...p, [key]: val }));
                                                        }} className="w-full accent-purple-600 h-1 bg-gray-200 rounded-full appearance-none" />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Variants */}
                            {
                                Array.isArray(product.variants) && product.variants.length > 0 && (
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
                                )
                            }

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
        </div >
    );
}
