import { useState } from 'react';
import { Zap, Plus, Play, Pause, Settings, ArrowRight } from 'lucide-react';

export function AutomationModule() {
    const [workflows, setWorkflows] = useState([
        { id: 1, name: 'Taguer Client VIP', trigger: 'Dépenses > 500€', action: 'Ajouter tag "VIP"', active: true, runs: 124 },
        { id: 2, name: 'Relance Panier Abandonné', trigger: 'Panier > 1h sans achat', action: 'Email de relance', active: true, runs: 850 },
        { id: 3, name: 'Cadeau Anniversaire', trigger: 'Date = Date de naissance', action: 'Code promo -20%', active: false, runs: 45 },
    ]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6 rounded-xl text-white shadow-md">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                        <Zap size={32} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold">Automatisations</h2>
                        <p className="text-amber-100">Pilotez votre boutique en pilote automatique</p>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center">
                <p className="text-gray-600 font-medium">3 flux de travail configurés</p>
                <button className="bg-gray-900 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-gray-800 transition-colors">
                    <Plus size={18} /> Créer une automatisation
                </button>
            </div>

            {/* Workflows List */}
            <div className="grid gap-4">
                {workflows.map(wf => (
                    <div key={wf.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 hover:border-amber-300 transition-colors group">

                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <div className={`p-2 rounded-lg ${wf.active ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                                    <Zap size={20} fill={wf.active ? "currentColor" : "none"} />
                                </div>
                                <h3 className="font-bold text-lg text-gray-800">{wf.name}</h3>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <span className="bg-gray-100 px-2 py-1 rounded border border-gray-200">{wf.trigger}</span>
                                <ArrowRight size={14} />
                                <span className="bg-gray-100 px-2 py-1 rounded border border-gray-200">{wf.action}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-8">
                            <div className="text-center">
                                <p className="text-xl font-bold text-gray-800">{wf.runs}</p>
                                <p className="text-xs text-gray-500 uppercase tracking-wide">Exécutions</p>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setWorkflows(workflows.map(w => w.id === wf.id ? { ...w, active: !w.active } : w))}
                                    className={`p-2 rounded-full border ${wf.active ? 'text-green-600 border-green-200 hover:bg-green-50' : 'text-gray-400 border-gray-200 hover:bg-gray-50'}`}
                                    title={wf.active ? "Mettre en pause" : "Activer"}
                                >
                                    {wf.active ? <Pause size={20} /> : <Play size={20} />}
                                </button>
                                <button className="p-2 rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-800">
                                    <Settings size={20} />
                                </button>
                            </div>
                        </div>

                    </div>
                ))}
            </div>

            {/* Suggestions */}
            <div className="bg-amber-50 p-6 rounded-xl border border-amber-100">
                <h3 className="font-bold text-amber-900 mb-4">Modèles recommandés</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {['Message de bienvenue', 'Demande d\'avis client', 'Alerte stock faible'].map(template => (
                        <button key={template} className="bg-white p-4 rounded-lg border border-amber-200 text-amber-800 font-medium text-sm hover:shadow-md transition-shadow text-left">
                            + {template}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
