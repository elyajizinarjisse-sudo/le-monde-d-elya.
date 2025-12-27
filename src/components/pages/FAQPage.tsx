import { Helmet } from 'react-helmet-async';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

const FAQS = [
    {
        question: "Quels sont les délais de livraison ?",
        answer: "Nous expédions généralement les commandes sous 24 à 48 heures. La livraison prend ensuite entre 3 à 7 jours ouvrables selon votre localisation au Canada."
    },
    {
        question: "Puis-je retourner un article ?",
        answer: "Oui, vous avez 30 jours pour nous retourner un article intact dans son emballage d'origine. Contactez-nous pour obtenir votre étiquette de retour."
    },
    {
        question: "Les jouets sont-ils sécuritaires ?",
        answer: "Absolument. Tous nos jouets sont certifiés et respectent les normes de sécurité canadiennes les plus strictes. La sécurité de vos enfants est notre priorité."
    },
    {
        question: "Proposez-vous des cartes cadeaux ?",
        answer: "Oui ! Des cartes cadeaux numériques sont disponibles de 25$ à 200$. Elles sont envoyées immédiatement par courriel."
    },
    {
        question: "D'où viennent vos produits ?",
        answer: "Nous privilégions les créateurs canadiens et les marques éco-responsables. Chaque produit est sélectionné avec soin pour sa qualité et son éthique."
    },
    {
        question: "Comment suivre ma commande ?",
        answer: "Une fois votre commande expédiée, vous recevrez un courriel avec un numéro de suivi. Vous pouvez aussi utiliser notre page 'Suivre ma commande'."
    }
];

export function FAQPage() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <div className="container mx-auto px-4 py-12 min-h-screen">
            <Helmet>
                <title>Foire Aux Questions | Le Monde d'Elya</title>
                <meta name="description" content="Réponses à toutes vos questions sur la livraison, les retours et nos produits enchantés." />
            </Helmet>

            <div className="text-center mb-16">
                <h1 className="text-3xl md:text-4xl font-bold font-cursive text-gray-800 mb-4">Foire Aux Questions 💭</h1>
                <p className="text-gray-600 max-w-2xl mx-auto">
                    Vous avez une question ? Nous avons probablement la réponse !
                    Si vous ne trouvez pas votre bonheur, écrivez-nous.
                </p>
            </div>

            <div className="max-w-3xl mx-auto space-y-4">
                {FAQS.map((faq, index) => (
                    <div key={index} className="bg-white rounded-xl border border-pastel-pink/20 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                        <button
                            onClick={() => setOpenIndex(openIndex === index ? null : index)}
                            className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
                        >
                            <span className="font-bold text-gray-800 flex items-center gap-3">
                                <HelpCircle size={20} className="text-primary" />
                                {faq.question}
                            </span>
                            {openIndex === index ? (
                                <ChevronUp size={20} className="text-gray-400" />
                            ) : (
                                <ChevronDown size={20} className="text-gray-400" />
                            )}
                        </button>

                        {openIndex === index && (
                            <div className="px-6 pb-6 text-gray-600 leading-relaxed border-t border-gray-50 pt-4 animate-fade-in">
                                {faq.answer}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="mt-16 text-center bg-pastel-yellow/20 p-8 rounded-2xl border border-pastel-yellow/50 max-w-2xl mx-auto">
                <h3 className="text-xl font-bold text-gray-800 mb-2">Vous n'avez pas trouvé votre réponse ?</h3>
                <p className="text-gray-600 mb-6">Notre équipe est là pour vous aider personnellement.</p>
                <Link to="/contact" className="inline-block px-8 py-3 bg-primary text-white font-bold rounded-full shadow-lg hover:shadow-xl hover:bg-opacity-90 transition-all transform hover:-translate-y-1">
                    Contactez-nous
                </Link>
            </div>
        </div>
    );
}
