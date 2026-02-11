import { useEffect, useState } from 'react';
import { Hero } from '../home/Hero';
import { ProductSection } from '../home/ProductSection';
import { BlogSection } from '../home/BlogSection';
import { ReviewsSlider } from '../home/ReviewsSlider';
import { SocialStream } from '../home/SocialStream';
import { SEO } from '../common/SEO';
import { supabase } from '../../lib/supabase';
import { BLOG_POSTS } from '../../data/mockData'; // Keep blog posts mock for now if no DB table
import { Loader2 } from 'lucide-react';

export function Home() {
    const [products, setProducts] = useState<any[]>([]);
    const [blogPosts, setBlogPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            try {
                // Fetch products
                const { data: prodData, error: prodErr } = await supabase
                    .from('products')
                    .select('*')
                    .order('created_at', { ascending: false })
                    .limit(20);

                if (prodErr) throw prodErr;

                const mappedProducts = (prodData || []).map((p: any) => ({
                    id: p.id,
                    title: p.title,
                    price: p.price,
                    image: p.image || p.images?.[0] || '',
                    rating: 5,
                    reviews: 0,
                    author: "Elya Design",
                    category: p.category,
                    subcategory: p.subcategory,
                    isNew: p.is_new,
                    aspect_ratio: p.aspect_ratio || 'portrait'
                }));
                setProducts(mappedProducts);

                // Fetch blog posts
                const { data: postData, error: postErr } = await supabase
                    .from('posts')
                    .select('*')
                    .order('created_at', { ascending: false })
                    .limit(3);

                if (postErr) throw postErr;

                if (postData && postData.length > 0) {
                    setBlogPosts(postData);
                } else {
                    setBlogPosts(BLOG_POSTS);
                }

            } catch (err) {
                console.error('Error fetching home data:', err);
                setBlogPosts(BLOG_POSTS);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    // Categorize products for sections
    // Note: Adjust logic based on real categories in DB
    const featuredProducts = products.slice(0, 8); // Just take newest for now

    // We can also filter by category if we want specific sections
    // const toys = products.filter(p => p.category === 'Jouets');

    const storeSchema = {
        "@context": "https://schema.org",
        "@type": "OnlineStore",
        "name": "Le Monde d'Elya",
        "description": "Boutique magique pour enfants au Québec",
        "url": "https://le-monde-d-elya.netlify.app",
        "logo": "https://le-monde-d-elya.netlify.app/logo.png",
        "address": {
            "@type": "PostalAddress",
            "addressRegion": "QC",
            "addressCountry": "CA"
        }
    };

    return (
        <>
            <SEO
                title="Boutique Magique pour Enfants"
                description="Découvrez Le Monde d'Elya : Livres, jouets éducatifs, décoration féerique et bien plus pour l'éveil de vos enfants au Québec."
                schemaData={storeSchema}
            />
            <Hero />
            <ProductSection title="Nos Dernières Créations" products={featuredProducts} />

            {/* 
            <div className="bg-gray-50">
                <ProductSection title="Nouveautés" products={products.slice(8, 16)} />
            </div>
            */}

            <BlogSection posts={blogPosts} />
            <ReviewsSlider />
            <SocialStream />
        </>
    );
}
