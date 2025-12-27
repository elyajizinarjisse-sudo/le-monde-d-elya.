import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Edit, Trash, Save, X, Loader2, Upload, Image as ImageIcon } from 'lucide-react';

interface GalleryItem {
    id: number;
    title: string;
    image_url: string;
    link_url: string;
    display_order: number;
}

export function GalleryManager() {
    const [items, setItems] = useState<GalleryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
    const [isCreating, setIsCreating] = useState(false);

    // Form states
    const [formData, setFormData] = useState<Partial<GalleryItem>>({
        title: '',
        image_url: '',
        link_url: '/category/livres',
        display_order: 0
    });

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        try {
            const { data, error } = await supabase
                .from('featured_images')
                .select('*')
                .order('display_order', { ascending: true });

            if (error) throw error;
            setItems(data || []);
        } catch (error) {
            console.error('Error fetching gallery:', error);
        } finally {
            setLoading(false);
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
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('gallery-images')
                .upload(filePath, file);

            if (uploadError) {
                // Determine if we should try product-images if gallery-images fails (fallback)
                throw uploadError;
            }

            const { data } = supabase.storage.from('gallery-images').getPublicUrl(filePath);
            setFormData({ ...formData, image_url: data.publicUrl });
        } catch (error: any) {
            console.error(error);
            alert('Erreur upload: ' + error.message);
        } finally {
            setUploading(false);
        }
    };

    const handleSave = async () => {
        try {
            setLoading(true);
            const itemData = {
                title: formData.title,
                image_url: formData.image_url,
                link_url: formData.link_url,
                display_order: formData.display_order || items.length + 1
            };

            if (editingItem) {
                const { error } = await supabase
                    .from('featured_images')
                    .update(itemData)
                    .eq('id', editingItem.id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('featured_images')
                    .insert([itemData]);
                if (error) throw error;
            }

            await fetchItems();
            setIsCreating(false);
            setEditingItem(null);
            resetForm();
        } catch (error) {
            console.error('Error saving item:', error);
            alert('Erreur lors de la sauvegarde');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Supprimer cette image ?')) return;

        try {
            setLoading(true);
            const { error } = await supabase.from('featured_images').delete().eq('id', id);
            if (error) throw error;
            await fetchItems();
        } catch (error) {
            console.error('Error deleting item:', error);
        } finally {
            setLoading(false);
        }
    };

    const startEdit = (item: GalleryItem) => {
        setEditingItem(item);
        setFormData(item);
        setIsCreating(true);
    };

    const resetForm = () => {
        setFormData({
            title: '',
            image_url: '',
            link_url: '/category/livres',
            display_order: items.length + 1
        });
    };

    if (isCreating) {
        return (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold">{editingItem ? 'Modifier l\'image' : 'Nouvelle image'}</h3>
                    <button onClick={() => { setIsCreating(false); setEditingItem(null); resetForm(); }} className="p-2 hover:bg-gray-100 rounded-full">
                        <X size={20} />
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Titre (affiché au survol)</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            className="w-full p-2 border rounded-lg"
                        />
                    </div>

                    {/* Image Upload Section */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
                        <div className="flex items-start gap-4">
                            {formData.image_url ? (
                                <div className="relative group w-32 h-32">
                                    <img
                                        src={formData.image_url}
                                        alt="Prévisualisation"
                                        className="w-full h-full object-cover rounded-lg border border-gray-200"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, image_url: '' })}
                                        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ) : (
                                <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 bg-gray-50">
                                    <ImageIcon size={24} className="mb-1" />
                                    <span className="text-xs">Aucune</span>
                                </div>
                            )}

                            <div className="flex-1 space-y-3">
                                <div>
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
                                </div>
                                <input
                                    type="text"
                                    value={formData.image_url}
                                    onChange={e => setFormData({ ...formData, image_url: e.target.value })}
                                    className="w-full p-2 text-sm border border-gray-300 rounded-lg"
                                    placeholder="Ou URL image..."
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Lien au clic (ex: /category/livres)</label>
                        <input
                            type="text"
                            value={formData.link_url}
                            onChange={e => setFormData({ ...formData, link_url: e.target.value })}
                            className="w-full p-2 border rounded-lg"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Ordre d'affichage</label>
                            <input
                                type="number"
                                value={formData.display_order}
                                onChange={e => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                                className="w-full p-2 border rounded-lg"
                            />
                        </div>
                    </div>

                    <button
                        onClick={handleSave}
                        disabled={loading || uploading}
                        className="w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                        Sauvegarder
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-medium text-gray-900">Galerie "Nos petits lecteurs"</h3>
                    <p className="text-sm text-gray-500">Gérez les 4 images affichées sur la page d'accueil</p>
                </div>
                <button
                    onClick={() => { resetForm(); setIsCreating(true); }}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                    <Plus size={20} />
                    Ajouter
                </button>
            </div>

            {loading ? (
                <div className="text-center py-12"><Loader2 className="animate-spin mx-auto text-indigo-600" /></div>
            ) : items.length === 0 ? (
                <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl">
                    <p>Aucune image dans la galerie.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {items.map(item => (
                        <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4 items-center">
                            <span className="font-mono text-gray-400 w-6">{item.display_order}</span>
                            <img
                                src={item.image_url}
                                alt={item.title}
                                className="w-16 h-16 object-cover rounded-lg bg-gray-100"
                            />
                            <div className="flex-1">
                                <h4 className="font-bold text-gray-900">{item.title}</h4>
                                <p className="text-sm text-gray-500 truncate">{item.link_url}</p>
                            </div>
                            <div className="flex flex-col gap-2">
                                <button
                                    onClick={() => startEdit(item)}
                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                >
                                    <Edit size={18} />
                                </button>
                                <button
                                    onClick={() => handleDelete(item.id)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                >
                                    <Trash size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
