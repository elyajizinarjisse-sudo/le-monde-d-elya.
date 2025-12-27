import { useState } from 'react';
import { Truck, Package, CheckCircle, MapPin, Search, ArrowRight } from 'lucide-react';
import { Header } from '../layout/Header';
import { Footer } from '../layout/Footer';

export function OrderTrackingPage() {
    const [orderId, setOrderId] = useState('');
    const [email, setEmail] = useState('');
    const [trackingResult, setTrackingResult] = useState<any>(null);

    const handleTrack = (e: React.FormEvent) => {
        e.preventDefault();
        // Simulate finding an order
        if (orderId) {
            setTrackingResult({
                status: 'shipped',
                estimatedDelivery: '18 Décembre 2025',
                steps: [
                    { id: 1, label: 'Commande confirmée', date: '14 Déc', completed: true },
                    { id: 2, label: 'Préparation en cours', date: '15 Déc', completed: true },
                    { id: 3, label: 'Expédié', date: '15 Déc (14:30)', completed: true },
                    { id: 4, label: 'En livraison', date: 'En attente', completed: false },
                    { id: 5, label: 'Livré', date: '-', completed: false },
                ]
            });
        }
    };

    return (
        <div className="min-h-screen flex flex-col font-sans bg-gray-50">
            <Header />
            <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl">

                <div className="text-center mb-12">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mx-auto mb-4">
                        <Truck size={32} />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Suivre ma commande</h1>
                    <p className="text-gray-600">Entrez votre numéro de commande pour connaître son statut en temps réel.</p>
                </div>

                {/* Tracking Form */}
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 mb-8">
                    <form onSubmit={handleTrack} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">Numéro de commande</label>
                            <div className="relative">
                                <Package className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Ex: #12345"
                                    value={orderId}
                                    onChange={e => setOrderId(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                                />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">Email de confirmation</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="email"
                                    placeholder="votre@email.com"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                                />
                            </div>
                        </div>
                        <div className="flex items-end">
                            <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                                Suivre <ArrowRight size={18} />
                            </button>
                        </div>
                    </form>
                </div>

                {/* Results */}
                {trackingResult && (
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 animate-in fade-in slide-in-from-bottom-4">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 pb-8 border-b border-gray-100">
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Livraison estimée</p>
                                <h3 className="text-2xl font-bold text-green-600">{trackingResult.estimatedDelivery}</h3>
                            </div>
                            <div className="mt-4 md:mt-0 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg font-bold text-sm uppercase tracking-wide">
                                Colis Expédié
                            </div>
                        </div>

                        <div className="relative">
                            {/* Vertical Line for mobile, Horizontal for desktop could be complex, sticking to simple list for tracking */}
                            <div className="space-y-8">
                                {trackingResult.steps.map((step: any, index: number) => (
                                    <div key={step.id} className="flex gap-4 relative">
                                        {/* Line */}
                                        {index !== trackingResult.steps.length - 1 && (
                                            <div className={`absolute left-[15px] top-8 w-0.5 h-12 ${step.completed ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
                                        )}

                                        {/* Icon */}
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${step.completed ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                                            {step.completed ? <CheckCircle size={16} /> : <div className="w-3 h-3 bg-gray-300 rounded-full"></div>}
                                        </div>

                                        {/* Content */}
                                        <div className="pt-1">
                                            <h4 className={`font-bold ${step.completed ? 'text-gray-900' : 'text-gray-500'}`}>{step.label}</h4>
                                            <p className="text-sm text-gray-500">{step.date}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-gray-100">
                            <div className="flex items-start gap-3 bg-gray-50 p-4 rounded-xl">
                                <MapPin className="text-gray-400 mt-1" size={20} />
                                <div>
                                    <p className="font-bold text-gray-800 text-sm">Adresse de livraison</p>
                                    <p className="text-gray-600 text-sm">Sophie Martin<br />123 Rue des Érables<br />Montréal, QC H2X 1Y1</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

            </main>
            <Footer />
        </div>
    );
}
