import { useState, useEffect } from 'react';
import { Instagram, Play, X, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface GalleryItem {
    id: number;
    media_url: string;
    thumbnail_url?: string;
    media_type: 'image' | 'video';
    caption?: string;
    author?: string;
    is_visible: boolean;
}

export function SocialStream() {
    const [items, setItems] = useState<GalleryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

    const fetchGallery = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('community_gallery')
                .select('*')
                .eq('is_visible', true)
                .order('display_order', { ascending: true });

            if (error) throw error;

            // Fallback to mock data if empty
            if (!data || data.length === 0) {
                setItems([
                    { id: 1, media_url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c', media_type: 'image', caption: 'Petit ours voyageur', author: 'Marie P.', is_visible: true },
                    { id: 2, media_url: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4', media_type: 'image', caption: 'Premier anniversaire', author: 'Pierre L.', is_visible: true },
                    { id: 3, media_url: 'https://images.unsplash.com/photo-1566004100631-35d015d6a491', media_type: 'image', caption: 'Coin lecture', author: 'Sophie D.', is_visible: true },
                    { id: 4, media_url: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1', media_type: 'image', caption: 'Jouets en bois', author: 'Julie M.', is_visible: true },
                    { id: 5, media_url: 'https://images.unsplash.com/photo-1519340333755-56e9c1d04579', media_type: 'image', caption: 'Doudou doux', author: 'Thomas K.', is_visible: true },
                    { id: 6, media_url: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf', media_type: 'image', caption: 'Cadeau parfait', author: 'Camille R.', is_visible: true }
                ]);
            } else {
                setItems(data);
            }
        } catch (error) {
            console.error('Error fetching gallery:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGallery();
    }, []);

    if (loading) return <div className="flex justify-center py-16"><Loader2 className="animate-spin text-primary" /></div>;

    return (
        <section className="bg-gray-50 py-16">
            <div className="container mx-auto px-4">
                <div className="flex flex-col items-center mb-10 text-center">
                    <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center text-pink-600 mb-4">
                        <Instagram size={24} />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-800 font-cursive">La communauté s'agrandit !</h2>
                    <p className="text-gray-600 mt-2">Découvrez vos achats préférés en action</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 md:gap-4">
                    {items.map(item => (
                        <div
                            key={item.id}
                            className="relative group aspect-square rounded-xl overflow-hidden cursor-pointer bg-white shadow-sm"
                            onClick={() => item.media_type === 'video' ? setSelectedVideo(item.media_url) : null}
                        >
                            <img
                                src={item.media_type === 'video' ? (item.thumbnail_url || 'https://images.unsplash.com/photo-1507679799987-c73779587ccf') : item.media_url}
                                alt={item.caption}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />

                            {item.media_type === 'video' && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
                                    <div className="bg-white/90 p-3 rounded-full shadow-lg text-primary transform group-hover:scale-110 transition-transform">
                                        <Play size={20} fill="currentColor" />
                                    </div>
                                </div>
                            )}

                            <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 to-transparent text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                <p className="text-xs font-bold truncate">{item.author || 'Communauté'}</p>
                                <p className="text-[10px] opacity-80 line-clamp-1">{item.caption}</p>
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

            {/* Video Modal */}
            {selectedVideo && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4" onClick={() => setSelectedVideo(null)}>
                    <div className="relative w-full max-w-lg aspect-[9/16] bg-black rounded-2xl overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
                        <button
                            onClick={() => setSelectedVideo(null)}
                            className="absolute top-4 right-4 z-10 p-2 bg-black/50 text-white rounded-full hover:bg-black"
                        >
                            <X size={24} />
                        </button>
                        <video
                            src={selectedVideo}
                            className="w-full h-full object-contain"
                            controls
                            autoPlay
                        />
                    </div>
                </div>
            )}
        </section>
    );
}
