import { useState } from 'react';
import { CheckCheck, TrendingUp, AlertCircle, Globe } from 'lucide-react';

export function SEOModule() {
    const [optimizationScore] = useState(82);

    const KEYWORDS = [
        { term: 'jouets éducatifs bois', volume: 1200, position: 4, diff: '+2' },
        { term: 'livres enfants québec', volume: 850, position: 2, diff: '=' },
        { term: 'décoration chambre bébé', volume: 2400, position: 12, diff: '-3' },
        { term: 'blog parentalité', volume: 500, position: 8, diff: '+5' },
    ];

    const TASKS = [
        { id: 1, task: 'Ajouter des méta-descriptions manquantes', status: 'urgent', count: 3 },
        { id: 2, task: 'Optimiser les images (tailles > 1MB)', status: 'warning', count: 12 },
        { id: 3, task: 'Soumettre le sitemap à Google', status: 'done', count: 0 },
        { id: 4, task: 'Vérifier les liens brisés (404)', status: 'done', count: 0 },
    ];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-cyan-500 p-6 rounded-xl text-white shadow-md">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                        <TrendingUp size={32} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold">SEO Rush Pro</h2>
                        <p className="text-blue-100">Optimisez votre visibilité sur Google</p>
                    </div>
                </div>
            </div>

            {/* Score & Main Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Score Card */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center text-center">
                    <h3 className="text-gray-500 font-medium mb-4">Score SEO Global</h3>
                    <div className="relative flex items-center justify-center w-32 h-32">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle cx="64" cy="64" r="56" stroke="#f3f4f6" strokeWidth="12" fill="none" />
                            <circle
                                cx="64"
                                cy="64"
                                r="56"
                                stroke="#3b82f6"
                                strokeWidth="12"
                                fill="none"
                                strokeDasharray="351.86"
                                strokeDashoffset={351.86 - (351.86 * optimizationScore) / 100}
                                className="transition-all duration-1000 ease-out"
                            />
                        </svg>
                        <span className="absolute text-3xl font-bold text-gray-800">{optimizationScore}</span>
                    </div>
                    <p className="mt-4 text-sm text-green-600 font-medium flex items-center gap-1">
                        <TrendingUp size={16} /> +4 pts ce mois-ci
                    </p>
                </div>

                {/* Keyword Stats */}
                <div className="md:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                        <h3 className="font-bold text-gray-800">Suivi des Mots-Clés</h3>
                        <button className="text-blue-600 text-sm font-medium hover:underline">Voir tout le rapport</button>
                    </div>
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-500 font-medium">
                            <tr>
                                <th className="p-4">Mot-Clé</th>
                                <th className="p-4">Volume</th>
                                <th className="p-4">Position</th>
                                <th className="p-4">Évolution</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {KEYWORDS.map((kw, i) => (
                                <tr key={i} className="hover:bg-gray-50">
                                    <td className="p-4 font-medium text-gray-800">{kw.term}</td>
                                    <td className="p-4 text-gray-500">{kw.volume}/mois</td>
                                    <td className="p-4 font-bold text-blue-600">{kw.position}e</td>
                                    <td className={`p-4 font-medium ${kw.diff.startsWith('+') ? 'text-green-600' : kw.diff.startsWith('-') ? 'text-red-500' : 'text-gray-400'}`}>
                                        {kw.diff}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Content & Checklist */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Checklist */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <AlertCircle className="text-orange-500" size={20} /> Actions Recommandées
                    </h3>
                    <div className="space-y-4">
                        {TASKS.map((task) => (
                            <div key={task.id} className="flex items-start gap-3 p-3 rounded-lg border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-colors cursor-pointer group">
                                <div className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${task.status === 'done' ? 'bg-green-100 border-green-500 text-green-600' : 'border-gray-300'}`}>
                                    {task.status === 'done' && <CheckCheck size={12} />}
                                </div>
                                <div className="flex-1">
                                    <p className={`text-sm font-medium ${task.status === 'done' ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                                        {task.task}
                                    </p>
                                    {task.count > 0 && <span className="text-xs text-orange-500 font-medium">{task.count} problèmes détectés</span>}
                                </div>
                                <span className="opacity-0 group-hover:opacity-100 text-blue-600 text-xs font-bold self-center">Corriger</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* SERP Preview */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <Globe className="text-blue-500" size={20} /> Aperçu recherche Google
                    </h3>

                    <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm max-w-lg">
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                            <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">E</div>
                            <span>Le Monde d'Elya</span>
                            <span>›</span>
                            <span>Boutique</span>
                        </div>
                        <h4 className="text-xl text-[#1a0dab] font-normal hover:underline cursor-pointer mb-1 truncate">
                            Le Monde d'Elya | Livres Jeunesse et Jouets Éducatifs
                        </h4>
                        <p className="text-sm text-gray-600 leading-snug">
                            Découvrez notre sélection de livres pour enfants, jouets en bois et décoration enchantée. Livraison rapide partout au Québec.
                        </p>
                    </div>

                    <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-dashed border-gray-300 text-center">
                        <p className="text-sm text-gray-500 mb-2">Configurez vos balises meta pour améliorer cet affichage.</p>
                        <button className="text-primary font-bold text-sm hover:underline">Modifier les métadonnées</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
