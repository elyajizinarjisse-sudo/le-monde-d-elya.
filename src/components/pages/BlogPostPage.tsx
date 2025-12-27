import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Clock, Calendar, User, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

interface BlogPost {
    id: number;
    title: string;
    excerpt: string;
    content?: string;
    image: string;
    date: string;
    read_time?: string; // DB column name might be read_time
    readTime?: string; // Mock data name
}

export function BlogPostPage() {
    const { id } = useParams();
    const [post, setPost] = useState<BlogPost | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPost = async () => {
            if (!id) return;
            try {
                // Try fetching from Supabase first
                const { data, error } = await supabase
                    .from('posts')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (error) throw error;
                if (data) setPost(data);
            } catch (error) {
                console.error('Error fetching post:', error);
                // Fallback to mock data if DB fails or not found (optional, but good for stability)
                // const mockPost = BLOG_POSTS.find(p => p.id === Number(id));
                // if (mockPost) setPost(mockPost as any);
            } finally {
                setLoading(false);
            }
        };

        fetchPost();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="animate-spin text-primary" size={48} />
            </div>
        );
    }

    if (!post) {
        return (
            <div className="min-h-screen flex flex-col">
                <div className="flex-1 container mx-auto px-4 py-20 text-center">
                    <h1 className="text-3xl font-bold mb-4">Article introuvable</h1>
                    <p className="text-gray-600 mb-8">L'article que vous cherchez n'existe pas ou a été supprimé.</p>
                    <Link to="/" className="text-primary hover:underline">Retour à l'accueil</Link>
                </div>
            </div>
        );
    }

    // Handle both naming conventions (read_time from DB, readTime from mock)
    const readTimeDisplay = post.read_time || post.readTime || '5 min';

    return (
        <div className="min-h-screen bg-white">
            <Helmet>
                <title>{post.title} | Le Journal d'Elya</title>
                <meta name="description" content={post.excerpt} />
            </Helmet>

            <article className="max-w-3xl mx-auto px-4 py-12">
                <Link to="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-primary mb-8 transition-colors">
                    <ArrowLeft size={20} />
                    Retour à l'accueil
                </Link>

                <div className="mb-8">
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
                        <span className="flex items-center gap-1 bg-pastel-yellow/30 px-3 py-1 rounded-full text-gray-700 font-medium">
                            <Calendar size={14} />
                            {post.date}
                        </span>
                        <span className="flex items-center gap-1">
                            <Clock size={14} />
                            {readTimeDisplay} de lecture
                        </span>
                        <span className="flex items-center gap-1">
                            <User size={14} />
                            Par Équipe Elya
                        </span>
                    </div>

                    <h1 className="text-3xl md:text-5xl font-bold text-gray-900 font-cursive leading-tight mb-6">
                        {post.title}
                    </h1>

                    <p className="text-xl text-gray-600 leading-relaxed italic border-l-4 border-pastel-pink pl-6">
                        {post.excerpt}
                    </p>
                </div>

                <div className="rounded-2xl overflow-hidden shadow-xl mb-10 border border-gray-100">
                    <img src={post.image} alt={post.title} className="w-full h-auto object-cover max-h-[500px]" />
                </div>

                <div className="prose prose-lg prose-indigo mx-auto text-gray-700 whitespace-pre-wrap">
                    {/* If content exists (DB), show it. Otherwise show mock text */}
                    {post.content ? (
                        <div dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br/>') }} />
                    ) : (
                        <>
                            <p>
                                Voici le contenu complet de l'article. Pour cet exemple, nous simulons le corps du texte.
                            </p>
                            <p>
                                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                            </p>
                        </>
                    )}
                </div>
            </article>

            <div className="bg-gray-50 py-12 mt-12 border-t border-gray-100">
                <div className="container mx-auto px-4 text-center">
                    <h3 className="text-2xl font-bold mb-6 font-cursive">Vous avez aimé cet article ?</h3>
                    <Link to="/category/livres" className="inline-block px-8 py-3 bg-primary text-white font-bold rounded-full shadow-lg hover:shadow-xl hover:bg-opacity-90 transition-all transform hover:-translate-y-1">
                        Découvrir nos livres
                    </Link>
                </div>
            </div>
        </div>
    );
}
