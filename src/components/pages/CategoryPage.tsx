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
    const normalizedSlug = categorySlug?.toLowerCase();


    const [categoryTitle, setCategoryTitle] = useState('');
    const [subcategoryTitle, setSubcategoryTitle] = useState('');

    useEffect(() => {
        const fetchProducts = async () => {
            setIsLoading(true);
            try {
                let resolvedCategoryLabel = '';
                let resolvedSubcategoryLabel = '';

                const normalizedSlug = categorySlug?.toLowerCase();

                if (categorySlug && normalizedSlug !== 'soldes') {
                    // 1. Find the Category Label (Parent)
                    const { data: catMenu } = await supabase
                        .from('menu_items')
                        .select('label')
                        .or(`path.ilike.%/${categorySlug},path.ilike.%/${categorySlug}/`)
                        .eq('parent_id', null)
                        .limit(1);

                    resolvedCategoryLabel = catMenu?.[0]?.label || (categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1));

                    // 2. Find the Subcategory Label if slug exists
                    if (subcategorySlug) {
                        const { data: subMenu } = await supabase
                            .from('menu_items')
                            .select('label')
                            .ilike('path', `%${categorySlug}%${subcategorySlug}%`)
                            .not('parent_id', 'is', null)
                            .limit(1);

                        resolvedSubcategoryLabel = subMenu?.[0]?.label || (subcategorySlug.charAt(0).toUpperCase() + subcategorySlug.slice(1));
                    }
                }

                setCategoryTitle(resolvedCategoryLabel);
                setSubcategoryTitle(resolvedSubcategoryLabel);

                // 3. Fetch Products
                let query = supabase.from('products').select('*');

                if (normalizedSlug === 'soldes') {
                    query = query.not('sale_price', 'is', null).gt('sale_price', 0);
                } else if (resolvedCategoryLabel) {
                    // Start with broad category match
                    query = query.or(`category.ilike.%${resolvedCategoryLabel}%,subcategory.ilike.%${resolvedCategoryLabel}%`);
                }

                const { data } = await query;

                if (data && data.length > 0) {
                    let filtered = data;
                    // Apply Subcategory filter if present
                    if (subcategorySlug) {
                        const normalize = (str: string) => str ? str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/\s+/g, '-') : '';

                        // Try to match the subcategorySlug in the product's subcategory field
                        filtered = data.filter((p: any) => p.subcategory && normalize(p.subcategory).includes(subcategorySlug));

                        // Fallback: If no matches, maybe the resolved label is better?
                        if (filtered.length === 0 && resolvedSubcategoryLabel) {
                            filtered = data.filter((p: any) => p.subcategory && p.subcategory.toLowerCase().includes(resolvedSubcategoryLabel.toLowerCase()));
                        }
                    }
                    setProducts(filtered);
                } else {
                    setProducts([]);
                }

            } catch (err: any) {
                console.error(err);
                setProducts([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProducts();
    }, [categorySlug, subcategorySlug]);

    const displayTitle = normalizedSlug === 'soldes' ? 'Soldes' :
        (subcategoryTitle
            ? `${categoryTitle} - ${subcategoryTitle}`
            : (categoryTitle || "Notre Collection"));


    return (
        <div className="container mx-auto px-4 py-8 min-h-screen">
            <Helmet>
                <title>{displayTitle} | Le Monde d'Elya</title>
                <meta name="description" content={`Découvrez notre sélection. Livraison rapide.`} />
            </Helmet>
            <Link to="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-primary mb-8 transition-colors">
                <ArrowLeft size={20} />
                Retour à l'accueil
            </Link>

            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 font-cursive mb-8 text-center">
                {displayTitle}
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
