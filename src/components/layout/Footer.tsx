import { Link } from 'react-router-dom';

export function Footer() {
    return (
        <footer className="bg-gray-900 text-gray-300 py-16">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                    <div>
                        <h3 className="text-white text-lg font-bold mb-6 font-cursive text-2xl">Le Monde d'Elya</h3>
                        <p className="text-sm leading-relaxed text-gray-400">
                            Une sélection enchantée de livres, jouets et décorations pour éveiller l'imaginaire de vos enfants.
                        </p>
                    </div>

                    <div>
                        <h4 className="text-white font-bold mb-6 uppercase text-sm tracking-wider">Boutique</h4>
                        <ul className="space-y-3 text-sm">
                            <li><Link to="/category/livres" className="hover:text-pastel-pink transition-colors">Livres Jeunesse</Link></li>
                            <li><Link to="/category/jouets" className="hover:text-pastel-pink transition-colors">Jouets Éducatifs</Link></li>
                            <li><Link to="/category/decoration" className="hover:text-pastel-pink transition-colors">Décoration</Link></li>
                            <li><Link to="/track" className="hover:text-pastel-pink transition-colors font-medium text-white">Suivre ma commande</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-bold mb-6 uppercase text-sm tracking-wider">Support</h4>
                        <ul className="space-y-3 text-sm">
                            <li><Link to="/contact" className="hover:text-pastel-pink transition-colors">Contactez-nous</Link></li>
                            <li><Link to="/refunds" className="hover:text-pastel-pink transition-colors">Livraison & Retours</Link></li>
                            <li><Link to="/faq" className="hover:text-pastel-pink transition-colors">FAQ</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-bold mb-6 uppercase text-sm tracking-wider">Légal</h4>
                        <ul className="space-y-3 text-sm">
                            <li><Link to="/terms" className="hover:text-pastel-pink transition-colors">Conditions Générales</Link></li>
                            <li><Link to="/privacy" className="hover:text-pastel-pink transition-colors">Confidentialité</Link></li>
                            <li><Link to="/accessibility" className="hover:text-pastel-pink transition-colors">Accessibilité</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-800 mt-12 pt-8 text-center text-xs text-gray-500">
                    <p>© 2025 Le Monde d'Elya. Tous droits réservés.</p>
                </div>
            </div>
        </footer>
    );
}
