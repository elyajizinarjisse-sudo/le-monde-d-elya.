import { useState } from 'react';
import { ChevronDown, Globe } from 'lucide-react';

export function TopBar() {
    const [currency, setCurrency] = useState('CAD $');
    const [lang, setLang] = useState('FR');
    const [country, setCountry] = useState('Canada');

    return (
        <div className="bg-pastel-pink text-gray-800 text-[11px] md:text-xs py-2 border-b border-white relative z-[100]">
            <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-2">

                {/* Promo Message */}
                <div className="flex-1 text-center md:text-left">
                    <span className="font-bold text-gray-900">✨ LIVRAISON GRATUITE ✨</span> SUR LES COMMANDES DE PLUS DE 35 $
                </div>

                {/* Localization Selectors */}
                <div className="flex items-center gap-4 text-gray-700 font-medium">
                    {/* Country Selector */}
                    <div className="flex items-center gap-1 cursor-pointer hover:text-black group relative">
                        <span>{country}</span>
                        <ChevronDown size={12} />

                        {/* Dropdown */}
                        <div className="absolute top-full right-0 pt-2 w-32 hidden group-hover:block z-[9999]">
                            <div className="bg-white rounded-lg shadow-xl border border-gray-100">
                                {['France', 'Canada', 'Belgique', 'Suisse'].map((c) => (
                                    <div key={c} onClick={() => setCountry(c)} className="px-4 py-2 hover:bg-gray-50 cursor-pointer text-gray-600 hover:text-primary">
                                        {c}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <span className="text-gray-400">|</span>

                    {/* Currency Selector */}
                    <div className="flex items-center gap-1 cursor-pointer hover:text-black group relative">
                        <span>{currency}</span>
                        <ChevronDown size={12} />

                        <div className="absolute top-full right-0 pt-2 w-24 hidden group-hover:block z-[9999]">
                            <div className="bg-white rounded-lg shadow-xl border border-gray-100">
                                {['EUR €', 'CAD $', 'USD $'].map((c) => (
                                    <div key={c} onClick={() => setCurrency(c)} className="px-4 py-2 hover:bg-gray-50 cursor-pointer text-gray-600 hover:text-primary">
                                        {c}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <span className="text-gray-400">|</span>

                    {/* Language Selector */}
                    <div className="flex items-center gap-1 cursor-pointer hover:text-black group relative">
                        <Globe size={12} />
                        <span>{lang}</span>
                        <ChevronDown size={12} />

                        <div className="absolute top-full right-0 pt-2 w-24 hidden group-hover:block z-[9999]">
                            <div className="bg-white rounded-lg shadow-xl border border-gray-100">
                                {['FR', 'EN'].map((l) => (
                                    <div key={l} onClick={() => setLang(l)} className="px-4 py-2 hover:bg-gray-50 cursor-pointer text-gray-600 hover:text-primary">
                                        {l}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
