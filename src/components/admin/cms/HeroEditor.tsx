import { useState, useEffect } from 'react';
import { Save, RefreshCw, Image as ImageIcon, Upload, Loader2 } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

export interface HeroContent {
    title: string;
    subtitle: string;
    buttonText: string;
    buttonLink: string;
    imageUrl: string;
    overlayPosition: 'left' | 'center' | 'right';
    showOverlay: boolean;
}

export const DEFAULT_HERO_CONTENT: HeroContent = {
    title: "Bienvenue !",
    subtitle: "Plongez dans le monde magique d'Elya. Des histoires, des jeux et de la douceur pour petits et grands.",
    buttonText: "EXPLORER 🦄",
    buttonLink: "/category/jouets",
    imageUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=1600&h=900&fit=crop",
    overlayPosition: 'left',
    showOverlay: true
};

export function HeroEditor() {
    const [content, setContent] = useState<HeroContent>(DEFAULT_HERO_CONTENT);
    const [isSaving, setIsSaving] = useState(false);
    // Add ID to state to know which row to update
    const [dbId, setDbId] = useState<number | null>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [uploading, setUploading] = useState(false);
    const [showButtonSettings, setShowButtonSettings] = useState(false);

    useEffect(() => {
        fetchHeroContent();
    }, []);

    const fetchHeroContent = async () => {
        try {
            const { data } = await supabase
                .from('hero_content')
                .select('*')
                .limit(1)
                .maybeSingle();

            if (data) {
                setDbId(data.id);
                setContent({
                    title: data.title || DEFAULT_HERO_CONTENT.title,
                    subtitle: data.subtitle || DEFAULT_HERO_CONTENT.subtitle,
                    buttonText: data.button_text || DEFAULT_HERO_CONTENT.buttonText,
                    buttonLink: data.button_link || DEFAULT_HERO_CONTENT.buttonLink,
                    imageUrl: data.image_url || DEFAULT_HERO_CONTENT.imageUrl,
                    overlayPosition: data.overlay_position || DEFAULT_HERO_CONTENT.overlayPosition,
                    showOverlay: data.show_overlay !== undefined ? data.show_overlay : DEFAULT_HERO_CONTENT.showOverlay
                });
            }
        } catch (error) {
            console.error('Error fetching hero content:', error);
        }
    };

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true);
            if (!event.target.files || event.target.files.length === 0) {
                return;
            }
            const file = event.target.files[0];
            const fileExt = file.name.split('.').pop();
            const fileName = `hero-${Date.now()}.${fileExt}`;
            const filePath = `${fileName}`;

            // Upload to 'gallery-images' bucket (reusing existing bucket)
            const { error: uploadError } = await supabase.storage
                .from('gallery-images')
                .upload(filePath, file);

            if (uploadError) {
                throw uploadError;
            }

            const { data } = supabase.storage.from('gallery-images').getPublicUrl(filePath);
            setContent(prev => ({ ...prev, imageUrl: data.publicUrl }));
            setMessage({ type: 'success', text: 'Image téléchargée avec succès !' });
        } catch (error: any) {
            console.error(error);
            setMessage({ type: 'error', text: 'Erreur upload: ' + error.message });
        } finally {
            setUploading(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        setMessage(null);

        try {
            const payload = {
                title: content.title,
                subtitle: content.subtitle,
                button_text: content.buttonText,
                button_link: content.buttonLink,
                image_url: content.imageUrl,
                overlay_position: content.overlayPosition,
                show_overlay: content.showOverlay,
                is_active: true
            };

            let error;
            if (dbId) {
                const { error: updateError } = await supabase
                    .from('hero_content')
                    .update(payload)
                    .eq('id', dbId);
                error = updateError;
            } else {
                const { error: insertError } = await supabase
                    .from('hero_content')
                    .insert([payload]);
                error = insertError;
            }

            if (error) throw error;

            // Trigger fetch to get new ID if inserted
            await fetchHeroContent();

            setMessage({ type: 'success', text: 'Bannière mise à jour avec succès !' });
        } catch (error) {
            console.error(error);
            setMessage({ type: 'error', text: 'Erreur lors de la sauvegarde.' });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-800">Éditer la Bannière d'Accueil</h3>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 font-medium shadow-sm hover:shadow-md"
                >
                    {isSaving ? <RefreshCw className="animate-spin" size={20} /> : <Save size={20} />}
                    {isSaving ? 'Enregistrement...' : 'Enregistrer les modifications'}
                </button>
            </div>

            {message && (
                <div className={`p-4 rounded-lg flex items-center gap-2 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                    <span className="text-lg">{message.type === 'success' ? '✅' : '⚠️'}</span>
                    {message.text}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Form */}
                <div className="space-y-6 bg-gray-50 p-6 rounded-xl border border-gray-200">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 block">Titre Principal</label>
                        <input
                            type="text"
                            value={content.title}
                            onChange={e => setContent({ ...content, title: e.target.value })}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                            placeholder="Titre de la bannière"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 block">Sous-titre / Message</label>
                        <textarea
                            value={content.subtitle}
                            onChange={e => setContent({ ...content, subtitle: e.target.value })}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all h-24 resize-none"
                            placeholder="Message d'accueil"
                        />
                    </div>

                    {/* Button Management with Settings Icon */}
                    <div className="border border-gray-200 rounded-xl p-4 bg-white">
                        <div className="flex items-center justify-between mb-4">
                            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                Configuration des Boutons
                            </label>
                            <button
                                onClick={() => setShowButtonSettings(!showButtonSettings)}
                                className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
                                title="Gérer les boutons"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                            </button>
                        </div>

                        <div className={`space-y-4 transition-all duration-300 ${showButtonSettings ? 'block' : 'hidden'}`}>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-gray-500">Texte</label>
                                    <input
                                        type="text"
                                        value={content.buttonText}
                                        onChange={e => setContent({ ...content, buttonText: e.target.value })}
                                        className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                                        placeholder="Ex: Explorer"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-gray-500">Lien</label>
                                    <input
                                        type="text"
                                        value={content.buttonLink}
                                        onChange={e => setContent({ ...content, buttonLink: e.target.value })}
                                        className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                                        placeholder="Ex: /category/jouets"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 block">Image de fond</label>

                        <div className="flex flex-col gap-4">
                            {/* Upload Button */}
                            <div className="flex items-center gap-4">
                                <label className="cursor-pointer inline-block">
                                    <div className="flex items-center gap-2 px-4 py-2 border border-blue-200 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors">
                                        {uploading ? (
                                            <Loader2 className="animate-spin" size={18} />
                                        ) : (
                                            <Upload size={18} />
                                        )}
                                        <span className="text-sm font-medium">{uploading ? 'Envoi...' : 'Choisir une image'}</span>
                                    </div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        disabled={uploading}
                                        className="hidden"
                                    />
                                </label>
                                <span className="text-xs text-gray-500">ou</span>
                            </div>

                            {/* URL Input */}
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={content.imageUrl}
                                    onChange={e => setContent({ ...content, imageUrl: e.target.value })}
                                    className="flex-1 p-3 border border-gray-300 rounded-lg outline-none focus:border-blue-500 text-sm font-mono text-gray-600"
                                    placeholder="https://..."
                                />
                                <div className="p-3 bg-white border border-gray-200 rounded-lg text-gray-400">
                                    <ImageIcon size={20} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2 pt-4 border-t border-gray-100">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-semibold text-gray-700">Afficher le cadre texte</label>
                            <button
                                onClick={() => setContent({ ...content, showOverlay: !content.showOverlay })}
                                className={`w-12 h-6 rounded-full transition-colors relative ${content.showOverlay ? 'bg-blue-600' : 'bg-gray-200'}`}
                            >
                                <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${content.showOverlay ? 'translate-x-6' : 'translate-x-0'}`} />
                            </button>
                        </div>

                        {content.showOverlay && (
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 block">Position du texte</label>
                                <div className="flex gap-2">
                                    {['left', 'center', 'right'].map((pos) => (
                                        <button
                                            key={pos}
                                            onClick={() => setContent({ ...content, overlayPosition: pos as any })}
                                            className={`flex-1 py-2 px-3 rounded-lg text-sm border font-medium capitalize transition-all ${content.overlayPosition === pos
                                                ? 'bg-blue-50 border-blue-200 text-blue-700 ring-1 ring-blue-500/20'
                                                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                                                }`}
                                        >
                                            {pos === 'left' ? 'Gauche' : pos === 'center' ? 'Centre' : 'Droite'}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Live Preview (Miniature) */}
                <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Aperçu en temps réel</h4>
                    <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-lg border-4 border-white ring-1 ring-gray-200 group">
                        <img
                            src={content.imageUrl}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            alt="Aperçu"
                            onError={(e) => (e.currentTarget.src = "https://via.placeholder.com/800x450?text=Erreur+Image")}
                        />

                        {content.showOverlay && (
                            <div className={`absolute inset-0 bg-black/10 flex items-center p-6 ${content.overlayPosition === 'left' ? 'justify-start' : content.overlayPosition === 'center' ? 'justify-center' : 'justify-end'
                                }`}>
                                <div className="bg-white/95 backdrop-blur-sm p-4 rounded-2xl shadow-xl max-w-[240px] text-center transform scale-75 origin-center border border-white/50">
                                    <h2 className="text-2xl font-bold text-primary mb-2 font-cursive truncate">{content.title}</h2>
                                    <p className="text-xs text-gray-600 mb-4 line-clamp-3 leading-relaxed">{content.subtitle}</p>
                                    <span className="bg-secondary text-white px-4 py-2 rounded-full text-xs font-bold shadow-sm inline-block">
                                        {content.buttonText}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                    <p className="text-center text-xs text-gray-400 italic">L'aperçu est une version simplifiée du rendu final.</p>
                </div>
            </div>
        </div>
    );
}
