import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Trash2, Eye, EyeOff, Save, Image as ImageIcon, Video, Loader2 } from 'lucide-react';

interface GalleryItem {
    id: number;
    media_url: string;
    thumbnail_url?: string;
    media_type: 'image' | 'video';
    caption?: string;
    author?: string;
    is_visible: boolean;
    display_order: number;
}

export function GalleryManager() {
    const [items, setItems] = useState<GalleryItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [editingItem, setEditingItem] = useState<Partial<GalleryItem> | null>(null);

    const fetchItems = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('community_gallery')
            .select('*')
            .order('display_order', { ascending: true });

        if (error) {
            console.error('Error fetching gallery:', error);
        } else {
            setItems(data || []);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchItems();
    }, []);

    const handleSave = async () => {
        if (!editingItem?.media_url) {
            alert('L\'URL du média est requise');
            return;
        }

        setIsSaving(true);
        try {
            if (editingItem.id) {
                const { error } = await supabase
                    .from('community_gallery')
                    .update(editingItem)
                    .eq('id', editingItem.id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('community_gallery')
                    .insert([editingItem]);
                if (error) throw error;
            }
            setEditingItem(null);
            fetchItems();
        } catch (error) {
            console.error('Error saving item:', error);
            alert('Erreur lors de la sauvegarde');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Supprimer cet élément ?')) return;

        const { error } = await supabase
            .from('community_gallery')
            .delete()
            .eq('id', id);

        if (error) {
            alert('Erreur lors de la suppression');
        } else {
            fetchItems();
        }
    };

    const toggleVisibility = async (item: GalleryItem) => {
        const { error } = await supabase
            .from('community_gallery')
            .update({ is_visible: !item.is_visible })
            .eq('id', item.id);

        if (error) {
            alert('Erreur lors de l\'action');
        } else {
            fetchItems();
        }
    };

    if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">Galerie Communautaire</h2>
                <button
                    onClick={() => setEditingItem({
                        media_type: 'image',
                        is_visible: true,
                        display_order: items.length * 10 + 10
                    })}
                    className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
                >
                    <Plus size={20} />
                    Ajouter un média
                </button>
            </div>

            {/* Modal / Form */}
            {editingItem && (
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
                    <h3 className="font-bold text-gray-800 mb-4">
                        {editingItem.id ? 'Modifier le média' : 'Nouveau média'}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Type de média</label>
                                <select
                                    value={editingItem.media_type}
                                    onChange={(e) => setEditingItem({ ...editingItem, media_type: e.target.value as 'image' | 'video' })}
                                    className="w-full border border-gray-300 rounded-lg p-2"
                                >
                                    <option value="image">Image</option>
                                    <option value="video">Vidéo</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">URL du média (Direct Link)</label>
                                <input
                                    type="text"
                                    value={editingItem.media_url || ''}
                                    onChange={(e) => setEditingItem({ ...editingItem, media_url: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg p-2"
                                    placeholder="https://..."
                                />
                            </div>
                            {editingItem.media_type === 'video' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">URL de la miniature (Thumbnail)</label>
                                    <input
                                        type="text"
                                        value={editingItem.thumbnail_url || ''}
                                        onChange={(e) => setEditingItem({ ...editingItem, thumbnail_url: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg p-2"
                                        placeholder="https://..."
                                    />
                                </div>
                            )}
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Légende</label>
                                <input
                                    type="text"
                                    value={editingItem.caption || ''}
                                    onChange={(e) => setEditingItem({ ...editingItem, caption: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg p-2"
                                    placeholder="Ex: Mon doudou préféré"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Client (Auteur)</label>
                                <input
                                    type="text"
                                    value={editingItem.author || ''}
                                    onChange={(e) => setEditingItem({ ...editingItem, author: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg p-2"
                                    placeholder="Ex: Marie P."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Ordre d'affichage</label>
                                <input
                                    type="number"
                                    value={editingItem.display_order || 0}
                                    onChange={(e) => setEditingItem({ ...editingItem, display_order: parseInt(e.target.value) })}
                                    className="w-full border border-gray-300 rounded-lg p-2"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-6">
                        <button
                            onClick={() => setEditingItem(null)}
                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                        >
                            Annuler
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="flex items-center gap-2 bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 disabled:opacity-50"
                        >
                            {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                            Sauvegarder
                        </button>
                    </div>
                </div>
            )}

            {/* Grid display */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {items.map((item) => (
                    <div
                        key={item.id}
                        className={`bg-white rounded-xl border-2 overflow-hidden transition-all duration-300 ${item.is_visible ? 'border-gray-100' : 'border-gray-200 grayscale'}`}
                    >
                        <div className="relative aspect-square">
                            <img
                                src={item.media_type === 'video' ? (item.thumbnail_url || 'https://via.placeholder.com/400x400?text=Video') : item.media_url}
                                alt={item.caption}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute top-2 right-2 flex gap-1">
                                <span className="bg-black/60 text-white p-1 rounded-md text-[10px] flex items-center gap-1 uppercase font-bold">
                                    {item.media_type === 'video' ? <Video size={10} /> : <ImageIcon size={10} />}
                                    {item.media_type}
                                </span>
                            </div>
                        </div>
                        <div className="p-4">
                            <p className="text-sm font-bold text-gray-800 line-clamp-1">{item.caption || 'Sans légende'}</p>
                            <p className="text-xs text-gray-500 mb-4">Par {item.author || 'Inconnu'}</p>
                            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => toggleVisibility(item)}
                                        className={`p-2 rounded-lg transition-colors ${item.is_visible ? 'bg-green-50 text-green-600 hover:bg-green-100' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                                        title={item.is_visible ? 'Masquer' : 'Afficher'}
                                    >
                                        {item.is_visible ? <Eye size={18} /> : <EyeOff size={18} />}
                                    </button>
                                    <button
                                        onClick={() => setEditingItem(item)}
                                        className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                                    >
                                        <Save size={18} />
                                    </button>
                                </div>
                                <button
                                    onClick={() => handleDelete(item.id)}
                                    className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {items.length === 0 && !isLoading && (
                <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                    <ImageIcon className="mx-auto text-gray-300 mb-4" size={48} />
                    <p className="text-gray-500">Aucun média dans la galerie pour le moment.</p>
                </div>
            )}
        </div>
    );
}
