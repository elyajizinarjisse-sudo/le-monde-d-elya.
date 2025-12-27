import { useState, useEffect } from 'react';
import { Save, RefreshCw, FileText, Scale, RotateCcw, Eye } from 'lucide-react';
import { SimpleRichEditor } from './SimpleRichEditor';
import { supabase } from '../../../lib/supabase';

type LegalSection = 'privacy' | 'terms' | 'refund' | 'accessibility';

const SECTIONS: { id: LegalSection; label: string; icon: any }[] = [
    { id: 'privacy', label: 'Confidentialité', icon: FileText },
    { id: 'terms', label: 'CGV', icon: Scale },
    { id: 'refund', label: 'Remboursements', icon: RotateCcw },
    { id: 'accessibility', label: 'Accessibilité', icon: Eye },
];

export function LegalEditor() {
    const [activeSection, setActiveSection] = useState<LegalSection>('privacy');
    const [editorContent, setEditorContent] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Fetch content when active section changes
    useEffect(() => {
        fetchLegalContent(activeSection);
    }, [activeSection]);

    const fetchLegalContent = async (slug: string) => {
        setIsLoading(true);
        setEditorContent(''); // Reset while loading to avoid stale data
        try {
            const { data } = await supabase
                .from('legal_pages')
                .select('content')
                .eq('slug', slug)
                .maybeSingle();

            if (data) {
                setEditorContent(data.content || '');
            } else {
                setEditorContent(''); // Handle empty/new case
            }
        } catch (error) {
            console.error('Error fetching legal content:', error);
            setMessage({ type: 'error', text: 'Impossible de charger le contenu.' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        setMessage(null);
        try {
            const { error: upsertError } = await supabase
                .from('legal_pages')
                .upsert({
                    slug: activeSection,
                    title: SECTIONS.find(s => s.id === activeSection)?.label || 'Page Légale',
                    content: editorContent,
                    updated_at: new Date().toISOString()
                });

            if (upsertError) throw upsertError;

            setMessage({ type: 'success', text: 'Page sauvegardée avec succès !' });
        } catch (error) {
            console.error(error);
            setMessage({ type: 'error', text: 'Erreur lors de la sauvegarde.' });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-800">Éditeur des Mentions Légales</h3>
                <button
                    onClick={handleSave}
                    disabled={isSaving || isLoading}
                    className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 font-medium shadow-sm hover:shadow-md"
                >
                    {isSaving ? <RefreshCw className="animate-spin" size={20} /> : <Save size={20} />}
                    {isSaving ? 'Enregistrement...' : 'Enregistrer'}
                </button>
            </div>

            {message && (
                <div className={`p-4 rounded-lg flex items-center gap-2 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                    <span className="text-lg">{message.type === 'success' ? '✅' : '⚠️'}</span>
                    {message.text}
                </div>
            )}

            <div className="flex flex-col md:flex-row gap-6">
                {/* Sidebar Navigation */}
                <div className="w-full md:w-64 space-y-2">
                    {SECTIONS.map(section => (
                        <button
                            key={section.id}
                            onClick={() => setActiveSection(section.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeSection === section.id
                                ? 'bg-indigo-50 text-indigo-700 border border-indigo-100 shadow-sm'
                                : 'text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            <section.icon size={18} />
                            {section.label}
                        </button>
                    ))}
                </div>

                {/* Editor Area */}
                <div className="flex-1 space-y-4">
                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                        {isLoading ? (
                            <div className="h-[400px] flex items-center justify-center text-gray-500">
                                <RefreshCw className="animate-spin mr-2" /> Chargement...
                            </div>
                        ) : (
                            <div className="min-h-[400px]">
                                <SimpleRichEditor
                                    value={editorContent}
                                    onChange={setEditorContent}
                                    className="h-[400px]"
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
