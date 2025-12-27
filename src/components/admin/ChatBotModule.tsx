import { useState, useRef } from 'react';
import { Bot, Save, Upload, MessageSquare } from 'lucide-react';

export function ChatBotModule() {
    const [config, setConfig] = useState({
        name: 'ElyaBot',
        welcomeMessage: 'Bonjour ! Je suis l\'assistant virtuel du Monde d\'Elya. Comment puis-je vous aider ? 🧸',
        tone: 'Amical'
    });

    const [files, setFiles] = useState<File[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFiles([...files, ...Array.from(e.target.files)]);
        }
    };

    const removeFile = (index: number) => {
        setFiles(files.filter((_, i) => i !== index));
    };

    const handleSave = () => {
        // Here you would upload the files to your backend/storage
        console.log('Saving config:', config);
        console.log('Uploading files:', files);
        alert('Configuration enregistrée et fichiers en cours de traitement !');
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="bg-gradient-to-r from-violet-600 to-fuchsia-600 p-6 rounded-xl text-white shadow-md">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                        <Bot size={32} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold">Agent Virtuel (IA)</h2>
                        <p className="text-violet-100">Configurez votre assistant intelligent</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Configuration Form */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <SettingsIcon /> Paramètres de l'Agent
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nom du Bot</label>
                                <input
                                    type="text"
                                    value={config.name}
                                    onChange={e => setConfig({ ...config, name: e.target.value })}
                                    className="w-full p-2 border border-gray-300 rounded-lg"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Ton de conversation</label>
                                <select
                                    value={config.tone}
                                    onChange={e => setConfig({ ...config, tone: e.target.value })}
                                    className="w-full p-2 border border-gray-300 rounded-lg bg-white"
                                >
                                    <option>Amical & Enjoué</option>
                                    <option>Professionnel & Sérieux</option>
                                    <option>Concis & Direct</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Message de bienvenue</label>
                                <textarea
                                    value={config.welcomeMessage}
                                    onChange={e => setConfig({ ...config, welcomeMessage: e.target.value })}
                                    rows={3}
                                    className="w-full p-2 border border-gray-300 rounded-lg resize-none"
                                />
                            </div>
                            <button
                                onClick={handleSave}
                                className="w-full bg-violet-600 text-white py-2 rounded-lg font-bold hover:bg-violet-700 transition-colors flex items-center justify-center gap-2"
                            >
                                <Save size={18} /> Enregistrer les modifications
                            </button>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <Upload size={20} className="text-violet-600" /> Base de Connaissances
                        </h3>
                        <p className="text-sm text-gray-500 mb-4">
                            Importez vos fichiers (PDF, FAQ) pour entraîner votre agent.
                        </p>

                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileSelect}
                            multiple
                            className="hidden"
                            accept=".pdf,.doc,.docx,.txt,.md"
                        />

                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:bg-gray-50 transition-colors cursor-pointer"
                        >
                            <Upload size={32} className="mx-auto text-gray-400 mb-2" />
                            <p className="text-sm font-medium text-gray-600">Cliquez pour ajouter des fichiers</p>
                            <p className="text-xs text-gray-400 mt-1">PDF, DOC, TXT, MD supportés</p>
                        </div>

                        {/* File List */}
                        {files.length > 0 && (
                            <div className="mt-4 space-y-2">
                                <h4 className="text-xs font-bold text-gray-500 uppercase">Fichiers sélectionnés</h4>
                                {files.map((file, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg text-sm border border-gray-100">
                                        <div className="flex items-center gap-2 overflow-hidden">
                                            <div className="w-8 h-8 bg-white border border-gray-200 rounded flex items-center justify-center text-xs font-bold text-violet-600 uppercase">
                                                {file.name.split('.').pop()}
                                            </div>
                                            <span className="truncate max-w-[150px]">{file.name}</span>
                                        </div>
                                        <button onClick={() => removeFile(idx)} className="text-red-400 hover:text-red-600">
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Preview */}
                <div className="bg-gray-100 p-6 rounded-xl border border-gray-200 flex flex-col items-center justify-center">
                    <h3 className="font-bold text-gray-500 mb-6 text-sm uppercase tracking-wide">Aperçu en direct</h3>

                    <div className="w-80 bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200 flex flex-col h-[500px]">
                        {/* Fake Chat Header */}
                        <div className="bg-violet-600 p-4 text-white flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                                <Bot size={20} />
                            </div>
                            <div>
                                <h4 className="font-bold">{config.name}</h4>
                                <p className="text-xs text-violet-200 flex items-center gap-1">
                                    <span className="w-2 h-2 bg-green-400 rounded-full"></span> En ligne
                                </p>
                            </div>
                        </div>

                        {/* Fake Chat Body */}
                        <div className="flex-1 bg-gray-50 p-4 space-y-4 overflow-y-auto">
                            <div className="flex items-start gap-2">
                                <div className="w-8 h-8 bg-violet-100 rounded-full flex-shrink-0 flex items-center justify-center text-violet-600">
                                    <Bot size={16} />
                                </div>
                                <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm text-sm text-gray-700">
                                    {config.welcomeMessage}
                                </div>
                            </div>
                            <div className="flex items-start gap-2 flex-row-reverse">
                                <div className="w-8 h-8 bg-gray-200 rounded-full flex-shrink-0 flex items-center justify-center text-gray-500">
                                    U
                                </div>
                                <div className="bg-violet-600 text-white p-3 rounded-2xl rounded-tr-none shadow-sm text-sm">
                                    Quels sont vos délais de livraison ?
                                </div>
                            </div>
                            <div className="flex items-start gap-2">
                                <div className="w-8 h-8 bg-violet-100 rounded-full flex-shrink-0 flex items-center justify-center text-violet-600">
                                    <Bot size={16} />
                                </div>
                                <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm text-sm text-gray-700">
                                    Nos délais de livraison standard sont de 3 à 5 jours ouvrables. ✨
                                </div>
                            </div>
                        </div>

                        {/* Fake Input */}
                        <div className="p-3 border-t border-gray-100 bg-white">
                            <div className="flex gap-2">
                                <input disabled placeholder="Posez une question..." className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm outline-none" />
                                <button disabled className="p-2 bg-violet-600 text-white rounded-full">
                                    <MessageSquare size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function SettingsIcon() {
    return <Settings size={20} className="text-gray-400" />
}
import { Settings } from 'lucide-react';
