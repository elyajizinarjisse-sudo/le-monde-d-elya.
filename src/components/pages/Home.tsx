
import React, { useEffect, useState } from 'react';
import { Hero } from '../home/Hero';
import { ProductSection } from '../home/ProductSection';
import { BlogSection } from '../home/BlogSection';
import { ReviewsSlider } from '../home/ReviewsSlider';
import { SocialStream } from '../home/SocialStream';
import { supabase } from '../../lib/supabase';
import { BLOG_POSTS } from '../../data/mockData'; // Keep blog posts mock for now if no DB table
import { Loader2 } from 'lucide-react';

export function Home() {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchProducts() {
            try {
                // Fetch all products for now
                const { data, error } = await supabase
                    .from('products')
                    .select('*')
                    .order('created_at', { ascending: false })
                    .limit(20);

                if (error) throw error;

                // Map DB fields to ProductCard interface
                const mappedProducts = (data || []).map((p: any) => ({
                    id: p.id,
                    title: p.title,
                    price: p.price,
                    image: p.image || p.images?.[0] || '', // Fallback to first gallery image
                    rating: 5, // Default rating since DB doesn't have it yet
                    reviews: 0,
                    author: "Elya Design",
                    category: p.category,
                    subcategory: p.subcategory,
                    isNew: p.is_new,
                    aspect_ratio: p.aspect_ratio || 'portrait'
                }));

                setProducts(mappedProducts);
            } catch (err) {
                console.error('Error fetching home products:', err);
            } finally {
                setLoading(false);
            }
        }

        fetchProducts();
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

    return (
        <>
            <Hero />
            <ProductSection title="Nos Dernières Créations" products={featuredProducts} />

            {/* 
            <div className="bg-gray-50">
                <ProductSection title="Nouveautés" products={products.slice(8, 16)} />
            </div>
            */}

            <BlogSection posts={BLOG_POSTS} />
            <ReviewsSlider />
            <SocialStream />
        </>
    );
}
