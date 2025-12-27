import { Megaphone, Mail, Gift, Share2 } from 'lucide-react';

export function MarketingModule() {
    return (
        <div className="space-y-6">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 rounded-xl text-white shadow-md">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                        <Megaphone size={32} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold">Marketing Hub</h2>
                        <p className="text-purple-100">Campagnes emails, promotions et réseaux sociaux</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-purple-100 hover:border-purple-300 transition-colors cursor-pointer">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 mb-4">
                        <Mail size={24} />
                    </div>
                    <h3 className="font-bold text-gray-800 mb-2">Email Marketing</h3>
                    <p className="text-gray-500 text-sm">Créez des newsletters et des séquences automatisées pour vos clients.</p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-purple-100 hover:border-purple-300 transition-colors cursor-pointer">
                    <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center text-pink-600 mb-4">
                        <Gift size={24} />
                    </div>
                    <h3 className="font-bold text-gray-800 mb-2">Codes Promo</h3>
                    <p className="text-gray-500 text-sm">Gérez les réductions, cartes cadeaux et offres spéciales.</p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-purple-100 hover:border-purple-300 transition-colors cursor-pointer">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 mb-4">
                        <Share2 size={24} />
                    </div>
                    <h3 className="font-bold text-gray-800 mb-2">Social Push</h3>
                    <p className="text-gray-500 text-sm">Publiez vos nouveaux produits sur Facebook et Instagram en un clic.</p>
                </div>
            </div>
        </div>
    );
}
