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

    // Handle potential typos or translation artifacts from URL
    let targetSlug = subcategorySlug;
    if (subcategorySlug === 'romains') targetSlug = 'romans';
    if (subcategorySlug === 'pantalons') targetSlug = 'paniers';

    useEffect(() => {
        const fetchProducts = async () => {
            setIsLoading(true);
            try {
                // Determine Category Label dynamically
                let categoryLabel = '';

                // 1. Try to find category in menu_items matching the slug
                if (categorySlug && categorySlug !== 'soldes') {
                    try {
                        let categoryFound = false;

                        // Strategy A: Try exact Label Match first (e.g. slug "jouets" -> label "Jouets")
                        // This fixes the issue where broad path match matched children first.
                        const { data: labelData } = await supabase
                            .from('menu_items')
                            .select('label')
                            .ilike('label', categorySlug)
                            .limit(1);

                        if (labelData && labelData.length > 0) {
                            categoryLabel = labelData[0].label;
                            targetSlug = undefined; // If a direct label match is found, no need for subcategory filtering
                            categoryFound = true;
                        }

                        // Strategy B: Try Exact Path Match (e.g. slug "jouets" -> path "/category/jouets")
                        if (!categoryFound) {
                            const { data: pathData } = await supabase
                                .from('menu_items')
                                .select('label')
                                .eq('path', `/category/${categorySlug}`)
                                .limit(1);

                            if (pathData && pathData.length > 0) {
                                categoryLabel = pathData[0].label;
                                targetSlug = undefined; // If a direct path match is found, no need for subcategory filtering
                                categoryFound = true;
                            }
                        }

                        // Strategy C: Fallback to Robust Path Search (only if A and B failed)
                        if (!categoryFound) {
                            let menuQuery = supabase.from('menu_items').select('label, path');

                            if (subcategorySlug) {
                                // For subcategories, we need the broad match
                                menuQuery = menuQuery.ilike('path', `%${categorySlug}%${subcategorySlug}%`);
                            } else {
                                // For main categories, restrict to ending with the slug to avoid children
                                // e.g. match ".../jouets" but NOT ".../jouets/bebe"
                                menuQuery = menuQuery.or(`path.ilike.%/${categorySlug},path.ilike.%/${categorySlug}/`);
                            }

                            const { data: menuData } = await menuQuery.limit(1);

                            if (menuData && menuData.length > 0) {
                                categoryLabel = menuData[0].label;
                                targetSlug = undefined; // If a menu item is found, no need for subcategory filtering
                            } else {
                                // Final Fallback: Capitalize
                                categoryLabel = categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1);
                                if (categorySlug.toLowerCase() === 'ebook') categoryLabel = 'E-book';
                            }
                        }
                    } catch (err: any) {
                        console.error("Menu fetch error:", err);
                        categoryLabel = categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1);
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
                } else {
                    // Try loose match if exact label failed (e.g. user typed "Broderie" but DB has "broderie")
                    if (categorySlug && !categoryLabel) {
                        const { data: allProducts } = await supabase.from('products').select('*');
                        if (allProducts) {
                            const filtered = allProducts.filter(p =>
                                p.category && p.category.toLowerCase().includes(categorySlug!.toLowerCase())
                            );
                            setProducts(filtered);
                        } else {
                            setProducts([]);
                        }
                    } else {
                        setProducts([]);
                    }
                }

            } catch (err: any) {
                console.error(err);
                setProducts([]);
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
