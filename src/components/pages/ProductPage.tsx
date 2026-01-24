
import { useState, useEffect, useRef } from 'react';
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

    // Preview Container Ref for Drag and Drop
    const containerRef = useRef<HTMLDivElement>(null);
    const [dragging, setDragging] = useState<'text' | 'image' | null>(null);

    const [product, setProduct] = useState<FullProduct | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState<string>('');
    const [selectedVariant, setSelectedVariant] = useState<string>('');
    const [customizationValues, setCustomizationValues] = useState<Record<string, string>>({});
    const [uploadingFiles, setUploadingFiles] = useState<Record<string, boolean>>({});

    // Scaling
    const [imageScale, setImageScale] = useState<number>(1.0);
    const [textScale, setTextScale] = useState<number>(1.0);

    // Positioning
    const [textPosition, setTextPosition] = useState<{ x: number; y: number }>({ x: 50, y: 50 });
    const [imagePosition, setImagePosition] = useState<{ x: number; y: number }>({ x: 50, y: 50 });

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
    const handleMouseDown = (e: React.MouseEvent, type: 'text' | 'image') => {
        e.stopPropagation();
        e.preventDefault();
        setDragging(type);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!dragging || !containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        // Clamp values 0-100
        const clampedX = Math.max(0, Math.min(100, x));
        const clampedY = Math.max(0, Math.min(100, y));

        if (dragging === 'text') {
            setTextPosition({ x: clampedX, y: clampedY });
        } else if (dragging === 'image') {
            setImagePosition({ x: clampedX, y: clampedY });
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
                            {/* Visual Preview (Configuration Based) */}
                            {(Object.keys(customizationValues).length > 0 || Object.values(uploadingFiles).some(v => v)) && (
                                <div className="mb-6 animate-scale-in">
                                    <h3 className="text-sm font-bold text-indigo-900 mb-3 flex items-center gap-2">
                                        ✨ Aperçu de votre personnalisation
                                    </h3>

                                    {(() => {
                                        // PREVIEW CONFIGURATION
                                        const PREVIEW_ZONES: Record<string, { templateUrl?: string; style: React.CSSProperties }> = {
                                            '15': { // Casquette Personnalisable
                                                style: { top: '20%', left: '15%', width: '70%', height: '55%' }
                                            },
                                            '16': { // Casquette Unisexe (Share same template)
                                                style: { top: '20%', left: '15%', width: '70%', height: '55%' }
                                            },
                                            '14': { // Custom Mug Céramique
                                                // Center of the mug face
                                                style: { top: '25%', left: '25%', width: '50%', height: '50%' }
                                            },
                                            '11': { // Custom T-shirt Unisex Bio
                                                // No template URL yet, uses product image. 
                                                // Adjust zone to chest area.
                                                style: { top: '20%', left: '28%', width: '44%', height: '40%' }
                                            },
                                            '10': { // Doudou
                                                style: { top: '55%', left: '25%', width: '50%', height: '20%' } // Tummy Area
                                            },
                                            '13': { // Mug 1
                                                templateUrl: '/mug_template.png',
                                                style: { top: '16%', left: '5%', width: '90%', height: '68%' } // Full Wrap Area
                                            },
                                            '23': { // Sac weekender
                                                style: { top: '5%', left: '5%', width: '90%', height: '90%' }
                                            },
                                            '24': { // Sac weekender personalisable
                                                style: { top: '5%', left: '5%', width: '90%', height: '90%' }
                                            }
                                        };

                                        const previewConfig = PREVIEW_ZONES[getSafeString(product.id)] ||
                                            ((product.category === 'Impressions' || product.category === 'Affiches' || product.category?.toLowerCase() === 'poster' || (product.subcategory && (product.subcategory.includes('Affiches') || product.subcategory.toLowerCase().includes('poster'))) || getSafeString(product.id) === '22') ? {
                                                // Default Poster Config: Full area
                                                style: { top: '0%', left: '0%', width: '100%', height: '100%' }
                                            } : undefined);

                                        if (previewConfig) {
                                            // CALCULATE ASPECT RATIO
                                            let aspectRatio = '1/1'; // Default
                                            const lowerCat = product.category?.toLowerCase() || '';
                                            const lowerSub = product.subcategory?.toLowerCase() || '';
                                            const isPoster = lowerCat === 'impressions' || lowerCat === 'affiches' || lowerCat === 'poster' || lowerSub.includes('affiches') || lowerSub.includes('poster') || getSafeString(product.id) === '22';

                                            if (isPoster && selectedVariant) {
                                                // Robust regex: Match two numbers separated by 'x' with any non-digit chars in between
                                                const match = selectedVariant.match(/(\d+)\D+x\D+(\d+)/i);

                                                if (match) {
                                                    let w = parseInt(match[1]);
                                                    let h = parseInt(match[2]);

                                                    // Explicit Orientation Override
                                                    const lowerVariant = selectedVariant.toLowerCase();
                                                    if (lowerVariant.includes('horizontal') || lowerVariant.includes('paysage')) {
                                                        // Ensure Width > Height
                                                        if (h > w) { const temp = w; w = h; h = temp; }
                                                    } else if (lowerVariant.includes('vertical') || lowerVariant.includes('portrait')) {
                                                        // Ensure Height > Width
                                                        if (w > h) { const temp = w; w = h; h = temp; }
                                                    }

                                                    if (!isNaN(w) && !isNaN(h) && h !== 0) {
                                                        aspectRatio = `${w}/${h}`;
                                                    }
                                                }
                                            }
                                            // VIEW SWITCHING LOGIC (Casquette) uses top-level currentView state

                                            // Determine background image based on View
                                            // PRIORITIZE Technical Views from new column
                                            let bgImage = selectedImage; // Default to main image

                                            if (product.technical_views && Object.keys(product.technical_views).length > 0) {
                                                // New Logic: Use explicit technical views
                                                if (currentView === 'front') bgImage = product.technical_views.front || bgImage;
                                                else if (currentView === 'back') bgImage = product.technical_views.back || bgImage;
                                                else if (currentView === 'right') bgImage = product.technical_views.right || bgImage;
                                                else if (currentView === 'left') bgImage = product.technical_views.left || bgImage;
                                                else if (currentView === 'side') bgImage = product.technical_views.right || bgImage;
                                                else if (currentView === 'flat') bgImage = product.technical_views.flat || bgImage;
                                                else bgImage = selectedImage;
                                            } else {
                                                // Legacy Fallback using array indices
                                                bgImage = previewConfig.templateUrl || selectedImage;
                                                if (currentView === 'back' && viewImages.length > 1) {
                                                    bgImage = viewImages[1];
                                                } else if (currentView === 'right' && viewImages.length > 2) {
                                                    bgImage = viewImages[2];
                                                } else if (currentView === 'left' && viewImages.length > 3) {
                                                    bgImage = viewImages[3];
                                                } else if (currentView === 'front' && viewImages.length > 0) {
                                                    bgImage = viewImages[0];
                                                }
                                            }

                                            return (
                                                <div
                                                    className="relative w-full bg-gray-100 rounded-xl overflow-hidden border border-gray-200 transition-all duration-300"
                                                    style={{ aspectRatio }}
                                                >
                                                    {/* View Switching Buttons (Only for Casquette) */}
                                                    {(getSafeString(product.id) === '15' || getSafeString(product.id) === '16') && viewImages.length >= 4 && (
                                                        <div className="absolute bottom-4 left-0 right-0 flex flex-wrap justify-center gap-2 z-30 pointer-events-auto px-2">
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); setCurrentView('front'); }}
                                                                className={`px-3 py-1 text-xs font-bold rounded-full transition-colors ${currentView === 'front' ? 'bg-indigo-600 text-white' : 'bg-white/80 text-gray-700 hover:bg-white'}`}
                                                            >
                                                                Face avant
                                                            </button>

                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); setCurrentView('back'); }}
                                                                className={`px-3 py-1 text-xs font-bold rounded-full transition-colors ${currentView === 'back' ? 'bg-indigo-600 text-white' : 'bg-white/80 text-gray-700 hover:bg-white'}`}
                                                            >
                                                                Dos
                                                            </button>

                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); setCurrentView('right'); }}
                                                                className={`px-3 py-1 text-xs font-bold rounded-full transition-colors ${currentView === 'right' ? 'bg-indigo-600 text-white' : 'bg-white/80 text-gray-700 hover:bg-white'}`}
                                                            >
                                                                Côté droit
                                                            </button>

                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); setCurrentView('left'); }}
                                                                className={`px-3 py-1 text-xs font-bold rounded-full transition-colors ${currentView === 'left' ? 'bg-indigo-600 text-white' : 'bg-white/80 text-gray-700 hover:bg-white'}`}
                                                            >
                                                                Côté gauche
                                                            </button>
                                                        </div>
                                                    )}
                                                    {/* Background Layer */}
                                                    <img
                                                        src={bgImage}
                                                        alt="Aperçu"
                                                        className="absolute inset-0 w-full h-full object-contain z-10"
                                                    />

                                                    {/* Customization Overlay Area - Only show on Front view for Casquettes to avoid ghosting */}
                                                    {/* Customization Overlay Area - Always active, internal filtering logic handles view visibility */}
                                                    {(true) && (
                                                        <div
                                                            className="absolute z-20 flex items-center justify-center pointer-events-none"
                                                            style={{
                                                                ...previewConfig.style,
                                                            }}
                                                        >
                                                            {/* Pointer Events Wrapper for Interaction */}
                                                            <div
                                                                ref={containerRef}
                                                                className="relative w-full h-full pointer-events-auto cursor-crosshair" // Cursor indicates interactive area
                                                                onMouseMove={handleMouseMove}
                                                                onMouseUp={handleMouseUp}
                                                                onMouseLeave={handleMouseUp} // Stop drag if leaving container
                                                            >

                                                                {/* Image Layer */}
                                                                {Object.entries(customizationValues).map(([key, value]) => {
                                                                    if (!value || !value.startsWith('http')) return null;

                                                                    // Image View Filtering
                                                                    const k = key.toLowerCase();
                                                                    if (isCasquette) {
                                                                        const currentViewSafe = currentView || 'front';
                                                                        if ((k.includes('face') || k.includes('front')) && currentViewSafe !== 'front') return null;
                                                                        if ((k.includes('dos') || k.includes('back') || k.includes('arrière')) && currentViewSafe !== 'back') return null;
                                                                        if ((k.includes('droit') || k.includes('right')) && currentViewSafe !== 'right') return null;
                                                                        if ((k.includes('gauche') || k.includes('left')) && currentViewSafe !== 'left') return null;
                                                                    }

                                                                    return (
                                                                        <div
                                                                            key={key}
                                                                            className="absolute origin-center cursor-move hover:border hover:border-dashed hover:border-indigo-400"
                                                                            style={{
                                                                                top: `${imagePosition.y}%`,
                                                                                left: `${imagePosition.x}%`,
                                                                                width: '50%', // Fixed base width relative to zone
                                                                                transform: `translate(-50%, -50%) scale(${imageScale})`, // Zoom via transform
                                                                                zIndex: 10,
                                                                            }}
                                                                            onMouseDown={(e) => handleMouseDown(e, 'image')}
                                                                        >
                                                                            <img
                                                                                src={value}
                                                                                alt="Logo"
                                                                                className="w-full h-auto object-contain pointer-events-none"
                                                                            />
                                                                        </div>
                                                                    );
                                                                })}

                                                                {/* Text Layer */}
                                                                {(() => {
                                                                    const validTextEntries = Object.entries(customizationValues).filter(([key, value]) => {
                                                                        if (!value) return false;
                                                                        const k = key.toLowerCase();
                                                                        const isExcluded = k.includes("couleur") || k.includes("police") || k.includes("color") || k.includes("font") || k.includes("taille") || k.includes("size");
                                                                        if (isExcluded) return false;
                                                                        const option = product.customization_options?.find(o => getSafeString(o.label) === key);
                                                                        if (option && option.type !== 'text') return false;

                                                                        // MULTI-VIEW FILTERING:
                                                                        // Only show "Face/Front" on 'front' view (or if view is null/undefined default)
                                                                        // Only show "Dos/Back" on 'back' view
                                                                        // Only show "Droit/Right" on 'right' view
                                                                        // Only show "Gauche/Left" on 'left' view
                                                                        if (isCasquette) {
                                                                            const currentViewSafe = currentView || 'front'; // Default to front if null

                                                                            if ((k.includes('face') || k.includes('front')) && currentViewSafe !== 'front') return false;
                                                                            if ((k.includes('dos') || k.includes('back') || k.includes('arrière')) && currentViewSafe !== 'back') return false;
                                                                            if ((k.includes('droit') || k.includes('right')) && currentViewSafe !== 'right') return false;
                                                                            if ((k.includes('gauche') || k.includes('left')) && currentViewSafe !== 'left') return false;
                                                                        }

                                                                        return true;
                                                                    });

                                                                    return (
                                                                        <>
                                                                            {validTextEntries.length === 0 && (
                                                                                <div
                                                                                    className="absolute transform -translate-x-1/2 -translate-y-1/2 bg-white/30 backdrop-blur-sm border border-gray-300 rounded px-2 py-1 flex items-center justify-center pointer-events-none"
                                                                                    style={{
                                                                                        top: `${textPosition.y}%`,
                                                                                        left: `${textPosition.x}%`,
                                                                                        minWidth: '80px',
                                                                                        zIndex: 5
                                                                                    }}
                                                                                >
                                                                                    <span className="text-[10px] text-gray-600 font-bold uppercase opacity-70">Zone Texte</span>
                                                                                </div>
                                                                            )}

                                                                            {validTextEntries.map(([key, value]) => {
                                                                                // Font Logic
                                                                                const fontOptionLabel = product.customization_options?.find(o => o.label.toLowerCase().includes("police"))?.label;
                                                                                const selectedFont = fontOptionLabel ? customizationValues[fontOptionLabel] : "";
                                                                                let fontFamily = "inherit";
                                                                                let fontWeight = "normal";

                                                                                const f = selectedFont?.toLowerCase() || "";

                                                                                // Mapping for French ("bâton", "cursif", "manuscrit") AND English ("Modern Sans", "Classic Serif", "Handwritten", "Bold Impact")
                                                                                if (f.includes("cursif") || f.includes("great vibes") || f.includes("cursive")) {
                                                                                    fontFamily = "'Great Vibes', cursive";
                                                                                } else if (f.includes("bâton") || f.includes("modern sans") || f.includes("sans")) {
                                                                                    fontFamily = "'Roboto', sans-serif";
                                                                                } else if (f.includes("manuscrit") || f.includes("handwritten") || f.includes("handlee")) {
                                                                                    fontFamily = "'Handlee', cursive";
                                                                                } else if (f.includes("serif") || f.includes("classic")) {
                                                                                    fontFamily = "'Times New Roman', serif";
                                                                                } else if (f.includes("bold") || f.includes("impact")) {
                                                                                    fontFamily = "'Impact', sans-serif";
                                                                                    fontWeight = "bold";
                                                                                }

                                                                                // Color Logic
                                                                                const colorOptionLabel = product.customization_options?.find(o => o.label.toLowerCase().includes("couleur"))?.label;
                                                                                const selectedColor = colorOptionLabel ? customizationValues[colorOptionLabel] : "black";
                                                                                const colorMap: Record<string, string> = {
                                                                                    "Noir": "black", "Black": "black",
                                                                                    "Blanc": "white", "White": "white",
                                                                                    "Rouge": "#D32F2F", "Red": "#D32F2F",
                                                                                    "Bleu Marine": "#1A237E", "Bleu Marin": "#1A237E", "Navy": "#1A237E",
                                                                                    "Or": "#FFD700", "Gold": "#FFD700",
                                                                                    "Argent": "#C0C0C0", "Silver": "#C0C0C0",
                                                                                    "Rose": "#E91E63", "Rose Pâle": "#FFB6C1", "Pink": "#E91E63",
                                                                                    "Bleu": "#1E88E5", "Blue": "#1E88E5",
                                                                                    "Vert": "#43A047", "Green": "#43A047",
                                                                                    "Chocolat": "#5D4037", "Chocolate": "#5D4037",
                                                                                    "Violet": "#9C27B0", "Purple": "#9C27B0",
                                                                                    "Jaune": "#FFD600", "Yellow": "#FFD600",
                                                                                    "Orange": "#FF5722",
                                                                                    "Gris": "#757575", "Grey": "#757575", "Gray": "#757575",
                                                                                    "Beige": "#D4C4A8",
                                                                                    "Turquoise": "#00BCD4", "Cyan": "#00BCD4",
                                                                                    "Bordeaux": "#800020", "Burgundy": "#800020",
                                                                                    "Rose Vif": "#FF4081", "Hot Pink": "#FF4081",
                                                                                    "Vert Sapin": "#2E7D32", "Forest Green": "#2E7D32",
                                                                                    "Bleu Ciel": "#42A5F5", "Sky Blue": "#42A5F5",
                                                                                    "Lavande": "#B39DDB", "Lavender": "#B39DDB"
                                                                                };
                                                                                const cssColor = colorMap[selectedColor] || selectedColor;

                                                                                return (
                                                                                    <div
                                                                                        key={key}
                                                                                        className="absolute transform -translate-x-1/2 -translate-y-1/2 whitespace-pre shadow-sm border border-transparent hover:border-dashed hover:border-indigo-400 cursor-move"
                                                                                        style={{
                                                                                            top: `${textPosition.y}%`,
                                                                                            left: `${textPosition.x}%`,
                                                                                            zIndex: 50, // Explicit Z-Index VERY HIGH
                                                                                            transform: `translate(-50%, -50%) scale(${textScale})` // Text Scale
                                                                                        }}
                                                                                        onMouseDown={(e) => handleMouseDown(e, 'text')}
                                                                                    >
                                                                                        <span style={{ fontFamily, fontWeight, color: cssColor, fontSize: 'clamp(12px, 4vw, 32px)', lineHeight: 1.2, textAlign: 'center' }}>
                                                                                            {value}
                                                                                        </span>
                                                                                    </div>
                                                                                );
                                                                            })}
                                                                        </>
                                                                    );
                                                                })()}
                                                            </div >
                                                        </div >
                                                    )}
                                                    {/* Pointer events wrapper end */}
                                                </div>

                                            );
                                        } else {
                                            // GENERIC FALLBACK LIST
                                            return (
                                                <div className="bg-white p-4 rounded-lg border border-indigo-100/50 shadow-inner space-y-4">
                                                    {Object.entries(customizationValues).map(([key, value]) => {
                                                        const safeValue = getSafeString(value);
                                                        if (!safeValue) return null;
                                                        const isUrl = safeValue.startsWith('http');
                                                        return (
                                                            <div key={key} className="flex flex-col gap-1">
                                                                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{key}</span>
                                                                {isUrl ? (
                                                                    <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-gray-200">
                                                                        <img src={value} alt="Preview" className="w-full h-full object-cover" />
                                                                    </div>
                                                                ) : (
                                                                    <p className="text-indigo-600 bg-indigo-50 px-4 py-3 rounded-lg border border-indigo-100 inline-block font-medium">
                                                                        {safeValue}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            );
                                        }
                                    })()}

                                    {/* Positioning Controls */}
                                    <div className="mt-4 space-y-4">
                                        {Object.values(customizationValues).some(v => v && !v.startsWith('http')) && (
                                            <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-lg">
                                                <h4 className="text-xs font-bold text-indigo-900 mb-2 uppercase tracking-wide">Position & Taille Texte</h4>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="text-[10px] text-gray-500 block mb-1">Horizontal (X)</label>
                                                        <input type="range" min="0" max="100" value={textPosition.x} onChange={e => setTextPosition(p => ({ ...p, x: parseInt(e.target.value) }))} className="w-full accent-indigo-600 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] text-gray-500 block mb-1">Vertical (Y)</label>
                                                        <input type="range" min="0" max="100" value={textPosition.y} onChange={e => setTextPosition(p => ({ ...p, y: parseInt(e.target.value) }))} className="w-full accent-indigo-600 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                                                    </div>
                                                </div>
                                                <div className="mt-2">
                                                    <label className="text-[10px] text-gray-500 block mb-1 flex justify-between">
                                                        <span>Echelle (Zoom Texte)</span>
                                                        <span>{Math.round(textScale * 100)}%</span>
                                                    </label>
                                                    <input type="range" min="0.5" max="3.0" step="0.1" value={textScale} onChange={e => setTextScale(parseFloat(e.target.value))} className="w-full accent-indigo-600 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                                                </div>
                                            </div>
                                        )}

                                        {Object.values(customizationValues).some(v => v && v.startsWith('http')) && (
                                            <div className="p-3 bg-purple-50/50 border border-purple-100 rounded-lg">
                                                <h4 className="text-xs font-bold text-purple-900 mb-2 uppercase tracking-wide">Position & Taille Image</h4>
                                                <div className="grid grid-cols-2 gap-4 mb-2">
                                                    <div>
                                                        <label className="text-[10px] text-gray-500 block mb-1">Horizontal (X)</label>
                                                        <input type="range" min="0" max="100" value={imagePosition.x} onChange={e => setImagePosition(p => ({ ...p, x: parseInt(e.target.value) }))} className="w-full accent-purple-600 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] text-gray-500 block mb-1">Vertical (Y)</label>
                                                        <input type="range" min="0" max="100" value={imagePosition.y} onChange={e => setImagePosition(p => ({ ...p, y: parseInt(e.target.value) }))} className="w-full accent-purple-600 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="text-[10px] text-gray-500 block mb-1 flex justify-between">
                                                        <span>Echelle (Zoom)</span>
                                                        <span>{Math.round(imageScale * 100)}%</span>
                                                    </label>
                                                    <input type="range" min="0.2" max="3.0" step="0.1" value={imageScale} onChange={e => setImageScale(parseFloat(e.target.value))} className="w-full accent-purple-600 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )
                            }

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
