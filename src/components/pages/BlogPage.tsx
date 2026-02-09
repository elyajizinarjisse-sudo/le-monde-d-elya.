import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Clock, Calendar, ChevronRight, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { BLOG_POSTS } from '../../data/mockData';

interface BlogPost {
    id: number;
    title: string;
    excerpt: string;
    image: string;
    date: string;
    read_time?: string;
    readTime?: string;
}

export function BlogPage() {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const { data, error } = await supabase
                    .from('posts')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (error) throw error;

                if (data && data.length > 0) {
                    setPosts(data);
                } else {
                    // Fallback to mock data if DB is empty
                    setPosts(BLOG_POSTS as any);
                }
            } catch (error) {
                console.error('Error fetching posts:', error);
                setPosts(BLOG_POSTS as any);
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="animate-spin text-primary" size={48} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <Helmet>
                <title>Le Journal d'Elya | Conseils & Actualités</title>
                <meta name="description" content="Découvrez nos articles sur l'éducation, la lecture et la décoration pour enfants." />
            </Helmet>

            <div className="bg-white border-b border-gray-100 mb-12">
                <div className="container mx-auto px-4 py-16 text-center">
                    <Link to="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-primary mb-8 transition-colors">
                        <ArrowLeft size={20} />
                        Retour à l'accueil
                    </Link>
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 font-cursive mb-4">
                        Le Journal d'Elya <span className="text-3xl">✍️</span>
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Inspirations, conseils et petites histoires pour accompagner l'éveil de vos enfants.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {posts.map((post) => {
                        const readTime = post.read_time || post.readTime || '5 min';
                        return (
                            <Link to={`/blog/${post.id}`} key={post.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-gray-100 group flex flex-col">
                                <div className="aspect-[16/10] overflow-hidden">
                                    <img
                                        src={post.image}
                                        alt={post.title}
                                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                                    />
                                </div>
                                <div className="p-6 flex-1 flex flex-col">
                                    <div className="flex items-center gap-3 text-sm text-gray-500 mb-3">
                                        <span className="flex items-center gap-1 bg-pastel-yellow/30 px-2 py-0.5 rounded-full text-gray-700 text-xs font-bold">
                                            <Calendar size={12} />
                                            {post.date}
                                        </span>
                                        <span className="flex items-center gap-1 text-xs">
                                            <Clock size={12} />
                                            {readTime}
                                        </span>
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary transition-colors">
                                        {post.title}
                                    </h2>
                                    <p className="text-gray-500 text-sm line-clamp-3 mb-6 flex-1">
                                        {post.excerpt}
                                    </p>
                                    <div className="flex items-center text-primary font-bold text-sm uppercase tracking-wider group-hover:gap-2 transition-all">
                                        Lire la suite
                                        <ChevronRight size={18} className="translate-y-[1px]" />
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
