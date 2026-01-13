import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft } from 'lucide-react';
import { ProductCard } from '../home/ProductCard';
import { supabase } from '../../lib/supabase';

export function CategoryPage() {
    const { categorySlug: rawCategorySlug, subcategorySlug: rawSubcategorySlug } = useParams();
    const categorySlug = rawCategorySlug ? decodeURIComponent(rawCategorySlug) : undefined;
    const subcategorySlug = rawSubcategorySlug ? decodeURIComponent(rawSubcategorySlug) : undefined;
    const [products, setProducts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    // DEBUG STATE
    const [debugInfo, setDebugInfo] = useState<any>({});

    // Handle potential typos or translation artifacts from URL
    let targetSlug = subcategorySlug;
    if (subcategorySlug === 'romains') targetSlug = 'romans';
    if (subcategorySlug === 'pantalons') targetSlug = 'paniers';

    useEffect(() => {
        const fetchProducts = async () => {
            setIsLoading(true);
            let debug: { slug: string | undefined; step: string; label: string; found: number; strategy: string; error?: string } = { slug: categorySlug, step: 'Start', label: '', found: 0, strategy: 'none' };
            try {
                // Determine Category Label dynamically
                let categoryLabel = '';

                // 1. Try to find category in menu_items matching the slug
                // We assume path in menu_items might be "/categorySlug" or just "categorySlug" or "/category/categorySlug"
                // Let's interpret the slug.
                if (categorySlug && categorySlug !== 'soldes') {
                    try {
                        let menuQuery = supabase
                            .from('menu_items')
                            .select('label, path');

                        // 1. Try Path Match
                        // Construct a robust path search
                        if (subcategorySlug) {
                            menuQuery = menuQuery.ilike('path', `%${categorySlug}%${subcategorySlug}%`);
                        } else {
                            menuQuery = menuQuery.ilike('path', `%${categorySlug}%`);
                        }

                        const { data: menuData } = await menuQuery.limit(1);

                        if (menuData && menuData.length > 0) {
                            categoryLabel = menuData[0].label;
                            targetSlug = undefined;
                            debug.strategy = 'Path Match';
                            debug.label = categoryLabel;
                        } else {
                            // 2. Fallback: Try Label Match (e.g. slug "deco" -> label "Déco")
                            const { data: labelData } = await supabase
                                .from('menu_items')
                                .select('label')
                                .ilike('label', categorySlug) // Search for label matching slug
                                .limit(1);

                            if (labelData && labelData.length > 0) {
                                categoryLabel = labelData[0].label;
                                targetSlug = undefined;
                                debug.strategy = 'Label Match';
                                debug.label = categoryLabel;
                            } else {
                                // 3. Last Resort: Capitalize slug
                                categoryLabel = categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1);
                                if (categorySlug.toLowerCase() === 'ebook') categoryLabel = 'E-book';
                                debug.strategy = 'Capitalization Fallback';
                                debug.label = categoryLabel;
                            }
                        }
                    } catch (err: any) {
                        console.error("Menu fetch error:", err);
                        categoryLabel = categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1);
                        debug.error = err.message;
                    }
                }

                // 2. Fetch Products
                let query = supabase.from('products').select('*');

                if (categorySlug === 'soldes') {
                    // query = query.eq('is_sale', true); 
                } else if (categoryLabel) {
                    // Search in both 'category' and 'subcategory' using ILIKE for case-insensitive matching
                    // syntax: column.ilike.value
                    // We use the simpler OR syntax string
                    query = query.or(`category.ilike.%${categoryLabel}%,subcategory.ilike.%${categoryLabel}%`);
                }

                const { data } = await query;

                if (data && data.length > 0) {
                    let filtered = data;
                    // Only apply local filtering if we DIDN'T find a specific menu match (targetSlug is still set)
                    if (targetSlug) {
                        const normalize = (str: string) => str ? str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/\s+/g, '-') : '';
                        filtered = data.filter((p: any) => p.subcategory && normalize(p.subcategory).includes(targetSlug!));
                    }
                    setProducts(filtered);
                    debug.found = filtered.length;
                    setDebugInfo(debug);
                } else {
                    // Try loose match if exact label failed (e.g. user typed "Broderie" but DB has "broderie")
                    if (categorySlug && !categoryLabel) {
                        const { data: allProducts } = await supabase.from('products').select('*');
                        if (allProducts) {
                            const filtered = allProducts.filter(p =>
                                p.category && p.category.toLowerCase().includes(categorySlug!.toLowerCase())
                            );
                            setProducts(filtered);
                            debug.strategy = 'Loose Match (No Label)';
                            debug.found = filtered.length;
                        } else {
                            setProducts([]);
                        }
                    } else {
                        setProducts([]);
                        debug.found = 0;
                    }
                    setDebugInfo(debug);
                }

            } catch (err: any) {
                console.error(err);
                setProducts([]);
                setDebugInfo({ ...debug, error: err.message });
            } finally {
                setIsLoading(false);
            }
        };

        fetchProducts();
    }, [categorySlug, targetSlug]);

    const title = products.length > 0 && products[0].category
        ? `${products[0].category} ${targetSlug ? '- ' + products[0].subcategory : ''}`
        : "Notre Collection";

    return (
        <div className="container mx-auto px-4 py-8 min-h-screen">
            <Helmet>
                <title>{title} | Le Monde d'Elya</title>
                <meta name="description" content={`Découvrez notre sélection. Livraison rapide.`} />
            </Helmet>
            <Link to="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-primary mb-8 transition-colors">
                <ArrowLeft size={20} />
                Retour à l'accueil
            </Link>

            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 font-cursive mb-8 text-center">
                {title}
            </h1>

            {/* DEBUGGER */}
            <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6 rounded shadow-sm">
                <p className="font-bold">🔧 Diagnostic Rapide (Sera retiré après test)</p>
                <div className="grid grid-cols-2 gap-2 text-sm mt-2">
                    <p>Slug URL: <span className="font-mono bg-white px-1">{debugInfo.slug}</span></p>
                    <p>Label Déduit: <span className="font-mono bg-white px-1">{debugInfo.label || 'N/A'}</span></p>
                    <p>Stratégie: <span className="font-mono bg-white px-1">{debugInfo.strategy}</span></p>
                    <p>Produits: <span className="font-mono bg-white px-1">{debugInfo.found}</span></p>
                    {debugInfo.error && <p className="text-red-500 col-span-2">Erreur: {debugInfo.error}</p>}
                </div>
            </div>

            {isLoading ? (
                <div className="text-center py-20"><p>Chargement des trésors...</p></div>
            ) : products.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
                    {products.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                    <p className="text-xl text-gray-500 mb-4">Oups ! Cette section est vide pour le moment.</p>
                    <p className="text-gray-400">Revenez vite, nous ajoutons des merveilles tous les jours !</p>
                </div>
            )}
        </div>
    );
}
