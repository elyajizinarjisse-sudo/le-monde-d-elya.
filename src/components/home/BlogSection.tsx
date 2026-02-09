import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface BlogPost {
    id: number;
    title: string;
    excerpt: string;
    image: string;
    image_alt?: string;
    date: string;
    readTime: string;
    slug?: string;
}

interface BlogSectionProps {
    posts: BlogPost[];
}

export function BlogSection({ posts }: BlogSectionProps) {
    return (
        <section className="py-16 bg-white">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between mb-10">
                    <h2 className="text-3xl font-bold text-gray-800 font-cursive flex items-center gap-3">
                        Le Journal d'Elya <span className="text-2xl">✍️</span>
                    </h2>
                    <Link to="/blog" className="text-sm font-bold text-primary flex items-center hover:text-secondary transition-colors group">
                        Voir tous les articles <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {posts.map((post) => (
                        <Link to={`/blog/${post.id}`} key={post.id} className="group cursor-pointer">
                            <div className="mb-4 overflow-hidden rounded-2xl shadow-sm aspect-[4/3]">
                                <img
                                    src={post.image}
                                    alt={post.title}
                                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                                />
                            </div>
                            <div className="space-y-2">
                                <span className="text-[10px] font-bold tracking-wider text-secondary uppercase bg-secondary/10 px-2 py-1 rounded-full">
                                    {post.date}
                                </span>
                                <h3 className="font-bold text-lg text-gray-800 group-hover:text-primary transition-colors leading-tight">
                                    {post.title}
                                </h3>
                                <p className="text-gray-500 text-sm line-clamp-2">
                                    {post.excerpt}
                                </p>
                                <div className="pt-2 text-xs font-bold text-gray-400 uppercase tracking-wide">
                                    Lecture : {post.readTime}
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
