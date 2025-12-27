import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Edit, Trash, Save, X, Loader2, Upload, Image as ImageIcon } from 'lucide-react';

interface Post {
    id: number;
    title: string;
    excerpt: string;
    content: string;
    image: string;
    image_alt?: string;
    date: string;
    read_time: string;
    author: string;
}

export function BlogManager() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [editingPost, setEditingPost] = useState<Post | null>(null);
    const [isCreating, setIsCreating] = useState(false);

    // Form states
    const [formData, setFormData] = useState<Partial<Post>>({
        title: '',
        excerpt: '',
        content: '',
        image: '',
        image_alt: '',
        read_time: '5 min',
        author: 'Elya',
        date: new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
    });

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            const { data, error } = await supabase
                .from('posts')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setPosts(data || []);
        } catch (error) {
            console.error('Error fetching posts:', error);
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
                .from('blog-images')
                .upload(filePath, file);

            if (uploadError) {
                throw uploadError;
            }

            const { data } = supabase.storage.from('blog-images').getPublicUrl(filePath);
            setFormData({ ...formData, image: data.publicUrl });
        } catch (error: any) {
            alert('Error uploading image: ' + error.message);
        } finally {
            setUploading(false);
        }
    };

    const handleSave = async () => {
        try {
            setLoading(true);
            const postData = {
                ...formData,
                // Ensure date is set if missing
                date: formData.date || new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
            };

            if (editingPost) {
                const { error } = await supabase
                    .from('posts')
                    .update(postData)
                    .eq('id', editingPost.id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('posts')
                    .insert([postData]);
                if (error) throw error;
            }

            await fetchPosts();
            setIsCreating(false);
            setEditingPost(null);
            resetForm();
        } catch (error) {
            console.error('Error saving post:', error);
            alert('Erreur lors de la sauvegarde');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) return;

        try {
            setLoading(true);
            const { error } = await supabase.from('posts').delete().eq('id', id);
            if (error) throw error;
            await fetchPosts();
        } catch (error) {
            console.error('Error deleting post:', error);
        } finally {
            setLoading(false);
        }
    };

    const startEdit = (post: Post) => {
        setEditingPost(post);
        setFormData(post);
        setIsCreating(true);
    };

    const resetForm = () => {
        setFormData({
            title: '',
            excerpt: '',
            content: '',
            image: '',
            image_alt: '',
            read_time: '5 min',
            author: 'Elya',
            date: new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
        });
    };

    if (isCreating) {
        return (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold">{editingPost ? 'Modifier l\'article' : 'Nouvel article'}</h3>
                    <button onClick={() => { setIsCreating(false); setEditingPost(null); resetForm(); }} className="p-2 hover:bg-gray-100 rounded-full">
                        <X size={20} />
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            className="w-full p-2 border rounded-lg"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Résumé (Introduction)</label>
                        <textarea
                            value={formData.excerpt}
                            onChange={e => setFormData({ ...formData, excerpt: e.target.value })}
                            className="w-full p-2 border rounded-lg h-20"
                        />
                    </div>

                    {/* Image Upload Section */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Image de l'article</label>
                        <div className="flex items-start gap-4">
                            {formData.image ? (
                                <div className="relative group w-full max-w-xs">
                                    <img
                                        src={formData.image}
                                        alt="Prévisualisation"
                                        className="w-full h-40 object-cover rounded-lg border border-gray-200"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, image: '' })}
                                        className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            ) : (
                                <div className="w-full max-w-xs h-40 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 bg-gray-50">
                                    <ImageIcon size={32} className="mb-2" />
                                    <span className="text-sm">Aucune image</span>
                                </div>
                            )}

                            <div className="flex-1 space-y-3">
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Télécharger depuis l'appareil</label>
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
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Ou via lien URL</label>
                                    <input
                                        type="text"
                                        value={formData.image}
                                        onChange={e => setFormData({ ...formData, image: e.target.value })}
                                        className="w-full p-2 text-sm border border-gray-300 rounded-lg"
                                        placeholder="https://..."
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Texte alternatif (SEO)
                            <span className="ml-2 text-xs text-gray-500 font-normal">Description de l'image pour Google et l'accessibilité</span>
                        </label>
                        <input
                            type="text"
                            value={formData.image_alt || ''}
                            onChange={e => setFormData({ ...formData, image_alt: e.target.value })}
                            placeholder="Ex: Enfant lisant un livre dans un fauteuil confortable"
                            className="w-full p-2 border rounded-lg"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Temps de lecture</label>
                            <input
                                type="text"
                                value={formData.read_time}
                                onChange={e => setFormData({ ...formData, read_time: e.target.value })}
                                className="w-full p-2 border rounded-lg"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Auteur</label>
                            <input
                                type="text"
                                value={formData.author}
                                onChange={e => setFormData({ ...formData, author: e.target.value })}
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
                <h3 className="text-lg font-medium text-gray-900">Articles de Blog</h3>
                <button
                    onClick={() => { resetForm(); setIsCreating(true); }}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                    <Plus size={20} />
                    Nouvel Article
                </button>
            </div>

            {loading ? (
                <div className="text-center py-12"><Loader2 className="animate-spin mx-auto text-indigo-600" /></div>
            ) : posts.length === 0 ? (
                <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl">
                    <p>Aucun article pour le moment.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {posts.map(post => (
                        <div key={post.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4">
                            <img
                                src={post.image}
                                alt={post.image_alt || post.title}
                                className="w-24 h-24 object-cover rounded-lg"
                            />
                            <div className="flex-1">
                                <h4 className="font-bold text-gray-900">{post.title}</h4>
                                <p className="text-sm text-gray-500 line-clamp-2">{post.excerpt}</p>
                                <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                                    <span>{post.date}</span>
                                    <span>{post.read_time}</span>
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <button
                                    onClick={() => startEdit(post)}
                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                >
                                    <Edit size={18} />
                                </button>
                                <button
                                    onClick={() => handleDelete(post.id)}
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
