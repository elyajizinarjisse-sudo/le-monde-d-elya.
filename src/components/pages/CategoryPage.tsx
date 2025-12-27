import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft } from 'lucide-react';
import { ProductCard } from '../home/ProductCard';
import { supabase } from '../../lib/supabase';
// Keep mock data only as fallback or type reference if needed, but we rely on DB now
import { BOOKS, TOYS, ORGANIZERS, DECOR, PARTY, CREATIVE, DIGITAL_PRODUCTS } from '../../data/mockData';

const ALL_PRODUCTS_MOCK = [...BOOKS, ...TOYS, ...DECOR, ...ORGANIZERS, ...PARTY, ...CREATIVE, ...DIGITAL_PRODUCTS];

export function CategoryPage() {
    const { categorySlug, subcategorySlug } = useParams();
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
                // 1. Try fetching from Supabase
                // Build query based on category/subcategory
                let query = supabase.from('products').select('*');

                if (categorySlug && categorySlug !== 'soldes') {
                    // Map slug to Category Name (simple mapping)
                    // Note: In a real app, we might have a Categories table.
                    // Here we try to match what we put in Admin ("Livres", "Jouets", etc.)
                    // This is a bit loose but works for this scale.
                    const categoryMap: Record<string, string> = {
                        'livres': 'Livres',
                        'jouets': 'Jouets',
                        'organisateurs': 'Organisateurs',
                        'deco': 'Décoration',
                        'creatif': 'Loisirs Créatifs',
                        'fete': 'Fêtes & Anniversaires',
                        'impressions': 'Numérique'
                    };
                    const dbCategory = categoryMap[categorySlug];
                    if (dbCategory) {
                        query = query.eq('category', dbCategory);
                    }
                }

                // If subcategory is present, filter by it (this requires the subcategory text to match closely or use normalized search)
                // For now, let's fetch everything in the category and filter clientside if needed for stricter matching, 
                // or just rely on the category filter for now to show *something*.

                const { data } = await query;

                if (data && data.length > 0) {
                    let filtered = data;
                    if (targetSlug) {
                        const normalize = (str: string) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/\s+/g, '-');
                        filtered = data.filter((p: any) => p.subcategory && normalize(p.subcategory).includes(targetSlug!));
                    }
                    setProducts(filtered);
                } else {
                    // Fallback to mock data if DB is empty or fails (so site doesn't look broken during transition)
                    console.log("No DB data found, using mock fallback");
                    fallbackToMock();
                }

            } catch (err) {
                console.error(err);
                fallbackToMock();
            } finally {
                setIsLoading(false);
            }
        };

        const fallbackToMock = () => {
            // ... duplicate logic from before but with state ...
            // For simplicity, let's just use the previous logic:
            let filtered = ALL_PRODUCTS_MOCK;
            // Re-implement the static logic efficiently:
            if (categorySlug === 'livres') filtered = BOOKS;
            else if (categorySlug === 'jouets') filtered = TOYS;
            else if (categorySlug === 'organisateurs') filtered = ORGANIZERS;
            else if (categorySlug === 'deco') filtered = DECOR;
            else if (categorySlug === 'creatif') filtered = CREATIVE;
            else if (categorySlug === 'fete') filtered = PARTY;
            else if (categorySlug === 'impressions') filtered = DIGITAL_PRODUCTS;
            else if (categorySlug === 'soldes') filtered = ALL_PRODUCTS_MOCK.filter(p => p.isSale);

            if (targetSlug) {
                const normalize = (str: string) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/\s+/g, '-');
                filtered = filtered.filter(p => p.subcategory && normalize(p.subcategory) === targetSlug);
            }
            setProducts(filtered);
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
