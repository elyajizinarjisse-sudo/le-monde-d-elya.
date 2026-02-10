import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Star, Trash2, Edit2, Save, Plus, CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface Review {
    id: number;
    name: string;
    role: string;
    rating: number;
    text: string;
    is_visible: boolean;
    display_order: number;
}

export function ReviewManager() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState<Partial<Review>>({});
    const [isAdding, setIsAdding] = useState(false);

    const fetchReviews = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('reviews')
                .select('*')
                .order('display_order', { ascending: true });

            if (error) throw error;
            setReviews(data || []);
        } catch (error) {
            console.error('Error fetching reviews:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, []);

    const handleToggleVisibility = async (review: Review) => {
        try {
            const { error } = await supabase
                .from('reviews')
                .update({ is_visible: !review.is_visible })
                .eq('id', review.id);

            if (error) throw error;
            fetchReviews();
        } catch (error) {
            console.error('Error toggling visibility:', error);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Voulez-vous vraiment supprimer cet avis ?')) return;
        try {
            const { error } = await supabase
                .from('reviews')
                .delete()
                .eq('id', id);

            if (error) throw error;
            fetchReviews();
        } catch (error) {
            console.error('Error deleting review:', error);
        }
    };

    const handleSave = async () => {
        try {
            if (editingId) {
                const { error } = await supabase
                    .from('reviews')
                    .update(formData)
                    .eq('id', editingId);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('reviews')
                    .insert([formData]);
                if (error) throw error;
            }
            setEditingId(null);
            setIsAdding(false);
            setFormData({});
            fetchReviews();
        } catch (error) {
            console.error('Error saving review:', error);
            alert('Erreur lors de la sauvegarde');
        }
    };

    const startEdit = (review: Review) => {
        setEditingId(review.id);
        setFormData(review);
        setIsAdding(false);
    };

    if (loading) return (
        <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-blue-600" size={40} />
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-800">Modération des Avis Clients</h3>
                <button
                    onClick={() => { setIsAdding(true); setEditingId(null); setFormData({ rating: 5, is_visible: true, display_order: 0 }); }}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                    <Plus size={18} />
                    Ajouter un avis
                </button>
            </div>

            {(isAdding || editingId) && (
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 space-y-4">
                    <h4 className="font-bold">{editingId ? 'Modifier l\'avis' : 'Nouvel avis'}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Nom du client</label>
                            <input
                                type="text"
                                value={formData.name || ''}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                className="w-full mt-1 p-2 border rounded-lg"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Rôle / Qualité</label>
                            <input
                                type="text"
                                placeholder="ex: Maman comblée"
                                value={formData.role || ''}
                                onChange={e => setFormData({ ...formData, role: e.target.value })}
                                className="w-full mt-1 p-2 border rounded-lg"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Note (1-5)</label>
                            <select
                                value={formData.rating || 5}
                                onChange={e => setFormData({ ...formData, rating: parseInt(e.target.value) })}
                                className="w-full mt-1 p-2 border rounded-lg"
                            >
                                {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} étoiles</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Ordre d'affichage</label>
                            <input
                                type="number"
                                value={formData.display_order || 0}
                                onChange={e => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                                className="w-full mt-1 p-2 border rounded-lg"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Texte de l'avis</label>
                        <textarea
                            value={formData.text || ''}
                            onChange={e => setFormData({ ...formData, text: e.target.value })}
                            className="w-full mt-1 p-2 border rounded-lg h-24"
                        />
                    </div>
                    <div className="flex justify-end gap-3">
                        <button onClick={() => { setEditingId(null); setIsAdding(false); }} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Annuler</button>
                        <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
                            <Save size={18} /> Sauvegarder
                        </button>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Client</th>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Note</th>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Commentaire</th>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Statut</th>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {reviews.map(review => (
                            <tr key={review.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="font-bold">{review.name}</div>
                                    <div className="text-xs text-gray-500">{review.role}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex gap-0.5">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} size={12} className={i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} />
                                        ))}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <p className="text-sm text-gray-600 line-clamp-2 max-w-xs italic">"{review.text}"</p>
                                </td>
                                <td className="px-6 py-4">
                                    <button
                                        onClick={() => handleToggleVisibility(review)}
                                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${review.is_visible
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-red-100 text-red-700'
                                            }`}
                                    >
                                        {review.is_visible ? (
                                            <><CheckCircle size={14} /> Visible</>
                                        ) : (
                                            <><XCircle size={14} /> Masqué</>
                                        )}
                                    </button>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button onClick={() => startEdit(review)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                            <Edit2 size={16} />
                                        </button>
                                        <button onClick={() => handleDelete(review.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {reviews.length === 0 && (
                    <div className="p-12 text-center text-gray-500">
                        Aucun avis client pour le moment.
                    </div>
                )}
            </div>
        </div>
    );
}
