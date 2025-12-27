import { Instagram, Heart, MessageCircle } from 'lucide-react';

export function SocialStream() {
    const POSTS = [
        { id: 1, image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=400&fit=crop', likes: 124, comments: 8 },
        { id: 2, image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400&h=400&fit=crop', likes: 89, comments: 12 },
        { id: 3, image: 'https://images.unsplash.com/photo-1566004100631-35d015d6a491?w=400&h=400&fit=crop', likes: 256, comments: 24 },
        { id: 4, image: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=400&h=400&fit=crop', likes: 178, comments: 15 },
        { id: 5, image: 'https://images.unsplash.com/photo-1519340333755-56e9c1d04579?w=400&h=400&fit=crop', likes: 92, comments: 6 },
        { id: 6, image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400&h=400&fit=crop', likes: 310, comments: 42 },
    ];

    return (
        <section className="bg-gray-50 py-16">
            <div className="container mx-auto px-4">
                <div className="flex flex-col items-center mb-10 text-center">
                    <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center text-pink-600 mb-4">
                        <Instagram size={24} />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-800 font-cursive">La communauté s'agrandit !</h2>
                    <p className="text-gray-600 mt-2">Suivez-nous @LeMondeDElya pour ne rien manquer</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 md:gap-4">
                    {POSTS.map(post => (
                        <div key={post.id} className="relative group aspect-square rounded-xl overflow-hidden cursor-pointer">
                            <img
                                src={post.image}
                                alt="Instagram post"
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 text-white">
                                <span className="flex items-center gap-1 font-bold">
                                    <Heart size={18} fill="white" /> {post.likes}
                                </span>
                                <span className="flex items-center gap-1 font-bold">
                                    <MessageCircle size={18} fill="white" /> {post.comments}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="text-center mt-10">
                    <a
                        href="https://instagram.com"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-3 rounded-full font-bold hover:shadow-lg hover:scale-105 transition-all"
                    >
                        <Instagram size={20} />
                        Rejoignez-nous sur Instagram
                    </a>
                </div>
            </div>
        </section>
    );
}
