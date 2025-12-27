import { Star, Quote } from 'lucide-react';

export function ReviewsSlider() {
    const REVIEWS = [
        { id: 1, name: 'Marie P.', rating: 5, text: 'Les jouets sont d\'une qualité incroyable. Ma fille ne quitte plus son ours !', role: 'Maman comblée' },
        { id: 2, name: 'Pierre L.', rating: 5, text: 'Livraison super rapide et emballage soigné. Parfait pour les cadeaux.', role: 'Papa de 2 enfants' },
        { id: 3, name: 'Sophie D.', rating: 4, text: 'J\'adore la sélection de livres, on y trouve des perles rares.', role: 'Enseignante' },
        { id: 4, name: 'Camille R.', rating: 5, text: 'Le service client est adorable et très réactif. Merci pour tout !', role: 'Cliente fidèle' },
    ];

    return (
        <section className="bg-white py-16 mb-8">
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

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {REVIEWS.map(review => (
                        <div key={review.id} className="bg-gray-50 p-6 rounded-xl hover:shadow-lg transition-shadow relative">
                            <Quote className="absolute top-4 right-4 text-pink-200" size={48} />
                            <div className="flex mb-4">
                                {[...Array(review.rating)].map((_, i) => (
                                    <Star key={i} size={16} className="text-yellow-400 fill-yellow-400" />
                                ))}
                            </div>
                            <p className="text-gray-600 mb-6 italic relative z-10">"{review.text}"</p>
                            <div>
                                <p className="font-bold text-gray-900">{review.name}</p>
                                <p className="text-xs text-pink-500 font-medium uppercase tracking-wide">{review.role}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-8 flex justify-center gap-4">
                    <div className="flex -space-x-2">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500">
                                {String.fromCharCode(64 + i)}
                            </div>
                        ))}
                    </div>
                    <p className="text-sm text-gray-500 flex items-center">
                        Et bien d'autres sur <span className="font-bold ml-1 flex items-center gap-1 text-gray-800"><img src="https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg" className="h-4" alt="Google" /> Avis</span>
                    </p>
                </div>
            </div>
        </section>
    );
}
