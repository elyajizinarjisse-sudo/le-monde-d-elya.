import { useState, useEffect } from 'react';
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';
import { supabase } from '../../lib/supabase';

interface Review {
    id: number;
    name: string;
    role: string;
    rating: number;
    text: string;
}

export function ReviewsSlider() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [emblaRef, emblaApi] = useEmblaCarousel({
        align: 'start',
        loop: true,
        slidesToScroll: 1,
        breakpoints: {
            '(min-width: 768px)': { slidesToScroll: 2 },
            '(min-width: 1024px)': { slidesToScroll: 4, active: false }
        }
    });

    const fetchReviews = async () => {
        try {
            const { data, error } = await supabase
                .from('reviews')
                .select('*')
                .eq('is_visible', true)
                .order('display_order', { ascending: true });

            if (error) throw error;
            if (data && data.length > 0) {
                setReviews(data);
            } else {
                setReviews([
                    { id: 1, name: 'Marie P.', rating: 5, text: 'Les jouets sont d\'une qualité incroyable. Ma fille ne quitte plus son ours !', role: 'Maman comblée' },
                    { id: 2, name: 'Pierre L.', rating: 5, text: 'Livraison super rapide et emballage soigné. Parfait pour les cadeaux.', role: 'Papa de 2 enfants' },
                    { id: 3, name: 'Sophie D.', rating: 4, text: 'J\'adore la sélection de livres, on y trouve des perles rares.', role: 'Enseignante' },
                    { id: 4, name: 'Camille R.', rating: 5, text: 'Le service client est adorable et très réactif. Merci pour tout !', role: 'Cliente fidèle' },
                ]);
            }
        } catch (error) {
            console.error('Error fetching reviews:', error);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, []);

    const scrollPrev = () => emblaApi && emblaApi.scrollPrev();
    const scrollNext = () => emblaApi && emblaApi.scrollNext();

    return (
        <section className="bg-white py-16 mb-8 overflow-hidden">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <div className="flex justify-center mb-4">
                        {[1, 2, 3, 4, 5].map((_, i) => (
                            <Star key={i} size={24} className="text-yellow-400 fill-yellow-400" />
                        ))}
                    </div>
                    <h2 className="text-3xl font-bold text-gray-800 font-cursive">Vos mots doux</h2>
                    <p className="text-gray-500 mt-2">Plus de 1000 familles heureuses nous font confiance</p>
                </div>

                <div className="relative group">
                    <div className="overflow-hidden" ref={emblaRef}>
                        <div className="flex gap-6 lg:grid lg:grid-cols-4 lg:gap-6">
                            {reviews.map(review => (
                                <div key={review.id} className="flex-[0_0_85%] md:flex-[0_0_45%] lg:flex-none bg-gray-50 p-6 rounded-xl hover:shadow-lg transition-shadow relative min-h-[220px] flex flex-col">
                                    <Quote className="absolute top-4 right-4 text-pink-200 opacity-50" size={48} />
                                    <div className="flex mb-4">
                                        {[...Array(review.rating)].map((_, i) => (
                                            <Star key={i} size={16} className="text-yellow-400 fill-yellow-400" />
                                        ))}
                                    </div>
                                    <p className="text-gray-600 mb-6 italic relative z-10 flex-1">"{review.text}"</p>
                                    <div>
                                        <p className="font-bold text-gray-900">{review.name}</p>
                                        <p className="text-xs text-pink-500 font-medium uppercase tracking-wide">{review.role}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Navigation Buttons - Only visible when carrousel is active (mobile/tablet) */}
                    <div className="lg:hidden flex justify-center gap-4 mt-8">
                        <button
                            onClick={scrollPrev}
                            className="p-2 rounded-full border border-gray-200 hover:bg-gray-50 text-gray-400 hover:text-primary transition-colors bg-white shadow-sm"
                        >
                            <ChevronLeft size={24} />
                        </button>
                        <button
                            onClick={scrollNext}
                            className="p-2 rounded-full border border-gray-200 hover:bg-gray-50 text-gray-400 hover:text-primary transition-colors bg-white shadow-sm"
                        >
                            <ChevronRight size={24} />
                        </button>
                    </div>
                </div>

                <div className="mt-12 flex flex-col items-center gap-4">
                    <div className="flex -space-x-2">
                        {reviews.slice(0, 4).map((review) => (
                            <div key={review.id} className="w-10 h-10 rounded-full border-2 border-white bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600 shadow-sm uppercase">
                                {review.name.charAt(0)}
                            </div>
                        ))}
                    </div>
                    <p className="text-sm text-gray-500 flex items-center gap-2">
                        Et bien d'autres sur
                        <span className="font-bold flex items-center gap-1.5 text-gray-800 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg" className="h-4" alt="Google" /> Avis
                        </span>
                    </p>
                </div>
            </div>
        </section>
    );
}
