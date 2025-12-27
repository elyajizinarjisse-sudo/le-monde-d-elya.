import { useState, useEffect } from 'react';
import { Settings, CreditCard, Truck, Globe, Save, ToggleLeft, ToggleRight, Smartphone, MapPin, DollarSign } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export function SettingsModule() {
    const [activeTab, setActiveTab] = useState<'general' | 'payments' | 'shipping' | 'localization'>('general');
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState<string | null>(null);

    // Initial State (will be populated from DB)
    const [storeInfo, setStoreInfo] = useState({
        name: "Le Monde d'Elya",
        email: "support@lemondedelya.com",
        phone: "+1 (514) 123-4567",
        address: "Montréal, Québec"
    });

    const [payments, setPayments] = useState({ stripe: true, paypal: false, apple: true });
    // Shipping and localization are kept local for now as no DB schema was requested for them yet, 
    // but could be added to Key-Value store as JSON strings if needed. 
    // For now we focused on Contact Info sync.
    const [shipping, setShipping] = useState({ freeThreshold: '75', flatRate: '9.99' });
    const [localization, setLocalization] = useState({
        language: 'fr',
        currency: 'CAD',
        timezone: 'America/Toronto'
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        const { data } = await supabase.from('store_settings').select('*');
        if (data) {
            const newInfo: any = { ...storeInfo };
            data.forEach(item => {
                if (item.key === 'store_name') newInfo.name = item.value;
                if (item.key === 'contact_email') newInfo.email = item.value;
                if (item.key === 'contact_phone') newInfo.phone = item.value;
                if (item.key === 'contact_address') newInfo.address = item.value;
            });
            setStoreInfo(newInfo);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        setSaveMessage(null);
        try {
            const updates = [
                { key: 'store_name', value: storeInfo.name },
                { key: 'contact_email', value: storeInfo.email },
                { key: 'contact_phone', value: storeInfo.phone },
                { key: 'contact_address', value: storeInfo.address },
            ];

            const { error } = await supabase.from('store_settings').upsert(updates);
            if (error) throw error;

            setSaveMessage("Paramètres enregistrés avec succès !");
            setTimeout(() => setSaveMessage(null), 3000);
        } catch (error) {
            console.error('Error saving settings:', error);
            setSaveMessage("Erreur lors de la sauvegarde.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-800 to-slate-700 p-6 rounded-xl text-white shadow-md">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                        <Settings size={32} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold">Paramètres de la Boutique</h2>
                        <p className="text-slate-300">Configuration générale, paiements et localisation</p>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {[
                    { id: 'general', label: 'Général', icon: MapPin },
                    { id: 'payments', label: 'Paiements', icon: CreditCard },
                    { id: 'shipping', label: 'Livraison', icon: Truck },
                    { id: 'localization', label: 'Localisation', icon: Globe },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all whitespace-nowrap ${activeTab === tab.id
                            ? 'bg-indigo-600 text-white shadow-md transform scale-105'
                            : 'bg-white text-gray-600 hover:bg-gray-50 border border-transparent hover:border-gray-200'
                            }`}
                    >
                        <tab.icon size={18} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm min-h-[500px]">

                {/* GENERAL SETTINGS */}
                {activeTab === 'general' && (
                    <div className="animate-fade-in max-w-4xl space-y-8">
                        <div>
                            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <Settings size={20} className="text-indigo-600" />
                                Informations de l'entreprise
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700">Nom de la boutique</label>
                                    <input
                                        type="text"
                                        value={storeInfo.name}
                                        onChange={(e) => setStoreInfo({ ...storeInfo, name: e.target.value })}
                                        className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700">Email de contact</label>
                                    <input
                                        type="email"
                                        value={storeInfo.email}
                                        onChange={(e) => setStoreInfo({ ...storeInfo, email: e.target.value })}
                                        className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700">Téléphone</label>
                                    <div className="flex">
                                        <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-200 bg-gray-50 text-gray-500 text-sm">
                                            <Smartphone size={16} />
                                        </span>
                                        <input
                                            type="tel"
                                            value={storeInfo.phone}
                                            onChange={(e) => setStoreInfo({ ...storeInfo, phone: e.target.value })}
                                            className="flex-1 p-3 border border-gray-200 rounded-r-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700">Adresse officielle</label>
                                    <input
                                        type="text"
                                        value={storeInfo.address}
                                        onChange={(e) => setStoreInfo({ ...storeInfo, address: e.target.value })}
                                        className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* PAYMENT SETTINGS */}
                {activeTab === 'payments' && (
                    <div className="animate-fade-in max-w-3xl space-y-6">
                        <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg flex items-start gap-3 mb-6">
                            <CreditCard className="text-blue-600 mt-1" size={20} />
                            <div>
                                <h4 className="font-bold text-blue-800">Mode Test Activé</h4>
                                <p className="text-sm text-blue-600">Aucun débit réel ne sera effectué. Utilisez les cartes de test Stripe pour simuler des paiements.</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {[
                                { id: 'stripe', name: 'Stripe (Cartes Bancaires)', icon: '💳', desc: 'Visa, Mastercard, Amex, Apple Pay' },
                                { id: 'paypal', name: 'PayPal Express', icon: '🅿️', desc: 'Paiement rapide et sécurisé avec compte PayPal' },
                                { id: 'apple', name: 'Apple Pay / Google Pay', icon: '📱', desc: 'Portefeuilles numériques natifs' }
                            ].map((method) => (
                                <div key={method.id} className="flex items-center justify-between p-5 border border-gray-200 rounded-xl hover:border-indigo-200 hover:shadow-sm transition-all bg-white">
                                    <div className="flex items-center gap-4">
                                        <div className="text-2xl">{method.icon}</div>
                                        <div>
                                            <p className="font-bold text-gray-800">{method.name}</p>
                                            <p className="text-sm text-gray-500">{method.desc}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setPayments({ ...payments, [method.id]: !payments[method.id as keyof typeof payments] })}
                                        className={`transition-colors ${payments[method.id as keyof typeof payments] ? 'text-green-500' : 'text-gray-300'}`}
                                    >
                                        {payments[method.id as keyof typeof payments] ? <ToggleRight size={48} /> : <ToggleLeft size={48} />}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* SHIPPING SETTINGS */}
                {activeTab === 'shipping' && (
                    <div className="animate-fade-in max-w-3xl space-y-8">
                        <div>
                            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <Truck size={20} className="text-indigo-600" />
                                Options de Livraison
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="p-6 border border-gray-200 rounded-xl bg-gray-50 hover:bg-white hover:shadow-md transition-all cursor-pointer group">
                                    <div className="flex justify-between items-start mb-4">
                                        <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide">Livraison Gratuite</label>
                                        <Truck className="text-gray-400 group-hover:text-indigo-500" size={24} />
                                    </div>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">$</span>
                                        <input
                                            type="number"
                                            value={shipping.freeThreshold}
                                            onChange={(e) => setShipping({ ...shipping, freeThreshold: e.target.value })}
                                            className="w-full pl-8 p-3 text-lg font-bold border border-gray-300 rounded-lg outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">Montant minimum du panier pour offrir la livraison.</p>
                                </div>

                                <div className="p-6 border border-gray-200 rounded-xl bg-gray-50 hover:bg-white hover:shadow-md transition-all cursor-pointer group">
                                    <div className="flex justify-between items-start mb-4">
                                        <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide">Tarif Standard</label>
                                        <CreditCard className="text-gray-400 group-hover:text-indigo-500" size={24} />
                                    </div>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">$</span>
                                        <input
                                            type="number"
                                            value={shipping.flatRate}
                                            onChange={(e) => setShipping({ ...shipping, flatRate: e.target.value })}
                                            className="w-full pl-8 p-3 text-lg font-bold border border-gray-300 rounded-lg outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">Frais appliqués si le seuil n'est pas atteint.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* LOCALIZATION SETTINGS */}
                {activeTab === 'localization' && (
                    <div className="animate-fade-in max-w-4xl space-y-8">
                        <div>
                            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                                <Globe size={20} className="text-indigo-600" />
                                Région et Langue
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Language */}
                                <div className="space-y-4">
                                    <label className="block text-sm font-semibold text-gray-700">Langue principale</label>
                                    <div className="grid grid-cols-1 gap-3">
                                        {[
                                            { code: 'fr', label: 'Français (Canada)', icon: '🇨🇦' },
                                            { code: 'en', label: 'English (Canada)', icon: '🇨🇦' },
                                            { code: 'fr-fr', label: 'Français (France)', icon: '🇫🇷' }
                                        ].map((lang) => (
                                            <div
                                                key={lang.code}
                                                onClick={() => setLocalization({ ...localization, language: lang.code })}
                                                className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-all ${localization.language === lang.code
                                                    ? 'border-indigo-500 bg-indigo-50 shadow-sm ring-1 ring-indigo-500'
                                                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className="text-xl">{lang.icon}</span>
                                                    <span className="font-medium text-gray-900">{lang.label}</span>
                                                </div>
                                                {localization.language === lang.code && (
                                                    <div className="w-4 h-4 rounded-full bg-indigo-600 border-2 border-white ring-2 ring-indigo-600"></div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Currency */}
                                <div className="space-y-4">
                                    <label className="block text-sm font-semibold text-gray-700">Devise de la boutique</label>
                                    <div className="grid grid-cols-1 gap-3">
                                        {[
                                            { code: 'CAD', label: 'Dollar Canadien ($)', symbol: 'CAD' },
                                            { code: 'EUR', label: 'Euro (€)', symbol: 'EUR' },
                                            { code: 'USD', label: 'Dollar Américain ($)', symbol: 'USD' }
                                        ].map((curr) => (
                                            <div
                                                key={curr.code}
                                                onClick={() => setLocalization({ ...localization, currency: curr.code })}
                                                className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-all ${localization.currency === curr.code
                                                    ? 'border-emerald-500 bg-emerald-50 shadow-sm ring-1 ring-emerald-500'
                                                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-2 rounded-lg ${localization.currency === curr.code ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                                                        <DollarSign size={18} />
                                                    </div>
                                                    <span className="font-medium text-gray-900">{curr.label}</span>
                                                </div>
                                                {localization.currency === curr.code && (
                                                    <div className="w-4 h-4 rounded-full bg-emerald-600 border-2 border-white ring-2 ring-emerald-600"></div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Floating Save Button */}
                <div className="mt-8 flex items-center justify-end gap-4 border-t border-gray-100 pt-6">
                    {saveMessage && (
                        <span className={`text-sm font-medium animate-in fade-in ${saveMessage.includes('Erreur') ? 'text-red-600' : 'text-green-600'}`}>
                            {saveMessage}
                        </span>
                    )}
                    <button
                        onClick={handleSave}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 py-3 rounded-xl shadow-lg shadow-indigo-200 flex items-center gap-2 transition-all active:scale-95"
                    >
                        {isSaving ? (
                            <span className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Sauvegarde...
                            </span>
                        ) : (
                            <>
                                <Save size={20} /> Enregistrer les modifications
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
