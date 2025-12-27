import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface BlogPost {
    id: number;
    title: string;
    excerpt: string;
    image: string;
    image_alt?: string;
    date: string;
    readTime: string;
}

interface BlogSectionProps {
    posts: BlogPost[];
}

export function BlogSection({ posts }: BlogSectionProps) {
    return (
        <section className="py-8">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800 font-cursive relative inline-block">
                    Le Journal d'Elya ✍️
                    <span className="absolute bottom-0 left-0 w-full h-2 bg-pastel-yellow opacity-40 -rotate-1 rounded-full"></span>
                </h2>
                <Link to="/category/livres" className="hidden md:flex items-center gap-2 text-primary font-bold hover:text-secondary transition-colors group">
                    Voir tous les articles
                    <ArrowRight size={20} className="transform group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {posts.map((post) => (
                    <Link to={`/blog/${post.id}`} key={post.id} className="group cursor-pointer block">
                        <article>
                            <div className="relative overflow-hidden rounded-2xl mb-4 aspect-[4/3] shadow-md">
                                <img
                                    src={post.image}
                                    alt={post.image_alt || post.title}
                                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-primary">
                                    {post.date}
                                </div>
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-primary transition-colors line-clamp-2">
                                {post.title}
                            </h3>
                            <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
                                {post.excerpt}
                            </p>
                            <div className="flex items-center text-xs font-bold text-secondary uppercase tracking-wider">
                                Lecture : {post.readTime}
                            </div>
                        </article>
                    </Link>
                ))}
            </div>

            <div className="mt-8 md:hidden text-center">
                <Link to="/category/livres" className="inline-flex items-center gap-2 text-primary font-bold hover:text-secondary transition-colors">
                    Voir tous les articles
                    <ArrowRight size={20} />
                </Link>
            </div>
        </section>
    );
}
