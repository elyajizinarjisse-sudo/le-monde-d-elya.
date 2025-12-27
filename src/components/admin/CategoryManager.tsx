import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Edit, Trash, Save, X, Loader2, ChevronRight, ChevronDown, FolderPlus } from 'lucide-react';

interface MenuItem {
    id: number;
    label: string;
    path: string | null;
    display_order: number;
    type: 'root' | 'section' | 'link';
    parent_id: number | null;
    is_active: boolean;
    children?: MenuItem[];
}

export function CategoryManager() {
    const [items, setItems] = useState<MenuItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

    // State for creating new item
    const [addingToParentId, setAddingToParentId] = useState<number | null>(null); // null = adding root
    const [newItem, setNewItem] = useState<Partial<MenuItem>>({ label: '', path: '', display_order: 0, type: 'link' });

    const fetchItems = async () => {
        try {
            setLoading(true);

            // Use Supabase client directly
            const { data, error } = await supabase
                .from('menu_items')
                .select('*')
                .order('display_order', { ascending: true });

            if (error) {
                // Check if table missing
                if (error.code === '42P01') { // PostgreSQL code for undefined_table
                    throw new Error("La table 'menu_items' n'existe pas. Veuillez exécuter le script SQL de configuration.");
                }
                throw error;
            }

            if (data) {
                const tree = buildTree(data);
                setItems(tree);

                // Auto-expand all items (recursively)
                const allParentIds = new Set<number>();
                const collectParents = (nodes: MenuItem[]) => {
                    nodes.forEach(node => {
                        if (node.children && node.children.length > 0) {
                            allParentIds.add(node.id);
                            collectParents(node.children);
                        }
                    });
                };
                collectParents(tree);
                setExpandedIds(allParentIds);
            }
        } catch (err: any) {
            console.error("Category Fetch Error:", err);
            setError(err.message || "Erreur de chargement");
        } finally {
            setLoading(false);
        }
    };

    const buildTree = (flatItems: any[]): MenuItem[] => {
        const rootItems: MenuItem[] = [];
        const lookup: { [key: number]: MenuItem } = {};
        flatItems.forEach(item => lookup[item.id] = { ...item, children: [] });
        flatItems.forEach(item => {
            if (item.parent_id && lookup[item.parent_id]) {
                lookup[item.parent_id].children?.push(lookup[item.id]);
            } else {
                rootItems.push(lookup[item.id]);
            }
        });
        return rootItems;
    };

    useEffect(() => { fetchItems(); }, []);

    const toggleExpand = (id: number) => {
        const newExpanded = new Set(expandedIds);
        if (newExpanded.has(id)) newExpanded.delete(id);
        else newExpanded.add(id);
        setExpandedIds(newExpanded);
    };

    // Actions
    const startAdding = (parentId: number | null, level: number) => {
        setAddingToParentId(parentId);
        // Default type based on level
        const defaultType = level === 0 ? 'root' : level === 1 ? 'section' : 'link';
        // Auto-calculate order (last + 10)
        let maxOrder = 0;
        if (parentId === null) {
            maxOrder = items.length > 0 ? Math.max(...items.map(i => i.display_order)) : 0;
        } else {
            // Find parent to inspect children
            maxOrder = 0;
        }

        setNewItem({
            label: '',
            path: defaultType === 'section' ? null : '',
            display_order: maxOrder + 10,
            type: defaultType
        });
        // Auto-expand if adding to parent
        if (parentId) {
            const newExpanded = new Set(expandedIds);
            newExpanded.add(parentId);
            setExpandedIds(newExpanded);
        }
    };

    const saveNewItem = async () => {
        if (!newItem.label) return;
        try {
            const { error } = await supabase.from('menu_items').insert([{
                label: newItem.label,
                path: newItem.path,
                display_order: newItem.display_order,
                type: newItem.type,
                parent_id: addingToParentId
            }]);
            if (error) throw error;
            setAddingToParentId(null);
            fetchItems();
        } catch (err: any) { alert(err.message); }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Supprimer cet élément et TOUS ses enfants ?')) return;
        try {
            const { error } = await supabase.from('menu_items').delete().eq('id', id);
            if (error) throw error;
            fetchItems();
        } catch (err: any) { alert(err.message); }
    };

    const handleUpdate = async () => {
        if (!editingItem) return;
        try {
            const { error } = await supabase.from('menu_items').update({
                label: editingItem.label,
                path: editingItem.path,
                display_order: editingItem.display_order
            }).eq('id', editingItem.id);
            if (error) throw error;
            setEditingItem(null);
            fetchItems();
        } catch (err: any) { alert(err.message); }
    };

    const renderItem = (item: MenuItem, level: number = 0) => {
        const hasChildren = item.children && item.children.length > 0;
        const isExpanded = expandedIds.has(item.id);
        const paddingLeft = level * 24;

        return (
            <div key={item.id}>
                <div
                    className={`flex items-center p-3 border-b hover:bg-gray-50 transition-colors ${level === 0 ? 'bg-white' : 'bg-gray-50/50'}`}
                    style={{ paddingLeft: `${paddingLeft + 12}px` }}
                >
                    {/* Toggle */}
                    <div
                        className="w-8 flex-shrink-0 cursor-pointer flex justify-center"
                        onClick={() => hasChildren && toggleExpand(item.id)}
                    >
                        {(hasChildren || addingToParentId === item.id) && (
                            <span className="text-gray-400 hover:text-blue-600">
                                {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                            </span>
                        )}
                    </div>

                    {/* Content */}
                    <div
                        className={`flex-1 flex items-center gap-3 ${hasChildren ? 'cursor-pointer' : ''}`}
                        onClick={() => { if (hasChildren && editingItem?.id !== item.id) toggleExpand(item.id); }}
                    >
                        {editingItem?.id === item.id ? (
                            <div className="flex-1 grid grid-cols-12 gap-2">
                                <input className="col-span-1 border rounded px-1" type="number" value={editingItem.display_order} onChange={e => setEditingItem({ ...editingItem, display_order: +e.target.value })} />
                                <input className="col-span-5 border rounded px-2" type="text" value={editingItem.label} onChange={e => setEditingItem({ ...editingItem, label: e.target.value })} />
                                <input className="col-span-6 border rounded px-2" type="text" value={editingItem.path || ''} onChange={e => setEditingItem({ ...editingItem, path: e.target.value })} placeholder="/" />
                            </div>
                        ) : (
                            <>
                                <span className={`text-xs uppercase font-bold px-2 py-0.5 rounded ${item.type === 'root' ? 'bg-blue-100 text-blue-700' :
                                    item.type === 'section' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'
                                    }`}>
                                    {item.type === 'root' ? 'Menu' : item.type === 'section' ? 'Section' : 'Lien'}
                                </span>
                                <span className="font-medium">{item.label}</span>
                                <span className="text-gray-400 text-xs italic">{item.path}</span>
                            </>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-1 ml-2">
                        {editingItem?.id === item.id ? (
                            <>
                                <button onClick={handleUpdate} className="text-green-600 p-1 hover:bg-green-50 rounded"><Save size={16} /></button>
                                <button onClick={() => setEditingItem(null)} className="text-gray-400 p-1 hover:bg-gray-100 rounded"><X size={16} /></button>
                            </>
                        ) : (
                            <>
                                <button onClick={() => startAdding(item.id, level + 1)} className="text-blue-600 p-1 hover:bg-blue-50 rounded" title="Ajouter un sous-élément"><FolderPlus size={16} /></button>
                                <button onClick={() => setEditingItem(item)} className="text-gray-600 p-1 hover:bg-gray-100 rounded" title="Modifier"><Edit size={16} /></button>
                                <button onClick={() => handleDelete(item.id)} className="text-red-400 p-1 hover:bg-red-50 rounded" title="Supprimer"><Trash size={16} /></button>
                            </>
                        )}
                    </div>
                </div>

                {/* Sub-Items */}
                {isExpanded && (
                    <div className="border-t border-gray-100">
                        {item.children?.sort((a, b) => a.display_order - b.display_order).map(child => renderItem(child, level + 1))}

                        {/* Adding Form Inline */}
                        {addingToParentId === item.id && (
                            <div className="p-3 border-b bg-green-50 flex items-center gap-2" style={{ paddingLeft: `${(level + 1) * 24 + 44}px` }}>
                                <Loader2 size={16} className="text-green-600 animate-spin opacity-0" /> {/* Spacer */}
                                <input className="w-16 border rounded px-1" type="number" placeholder="Ordre" value={newItem.display_order} onChange={e => setNewItem({ ...newItem, display_order: +e.target.value })} />
                                <input className="flex-1 border rounded px-2" type="text" placeholder="Nom du sous-élément" value={newItem.label} onChange={e => setNewItem({ ...newItem, label: e.target.value })} autoFocus />
                                {newItem.type !== 'section' && (
                                    <input className="flex-1 border rounded px-2" type="text" placeholder="/url-du-lien" value={newItem.path || ''} onChange={e => setNewItem({ ...newItem, path: e.target.value })} />
                                )}
                                <select className="border rounded px-2" value={newItem.type} onChange={e => setNewItem({ ...newItem, type: e.target.value as any })}>
                                    <option value="section">Section (Titre)</option>
                                    <option value="link">Lien</option>
                                </select>
                                <button onClick={saveNewItem} className="bg-green-600 text-white p-1 rounded hover:bg-green-700"><Save size={16} /></button>
                                <button onClick={() => setAddingToParentId(null)} className="text-gray-500 p-1 hover:bg-gray-200 rounded"><X size={16} /></button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-800">Gestion du Menu</h3>
                <button
                    onClick={() => startAdding(null, 0)}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                    <Plus size={18} />
                    Ajouter une catégorie principale
                </button>
            </div>

            {/* Add Root Form */}
            {addingToParentId === null && newItem.display_order !== undefined && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex gap-2 items-center mb-4">
                    <span className="font-bold text-blue-800 text-sm">Nouveau Menu :</span>
                    <input type="number" className="w-20 p-2 border rounded" placeholder="Ordre" value={newItem.display_order} onChange={e => setNewItem({ ...newItem, display_order: +e.target.value })} />
                    <input type="text" className="flex-1 p-2 border rounded" placeholder="Nom de la catégorie" value={newItem.label} onChange={e => setNewItem({ ...newItem, label: e.target.value })} />
                    <input type="text" className="flex-1 p-2 border rounded" placeholder="/categorie" value={newItem.path || ''} onChange={e => setNewItem({ ...newItem, path: e.target.value })} />
                    <button onClick={saveNewItem} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Enregistrer</button>
                    <button onClick={() => setAddingToParentId(undefined as any)} className="text-gray-500 hover:text-gray-700"><X size={20} /></button>
                </div>
            )}

            {/* Tree */}
            {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-lg shadow-sm border border-red-100 mb-4">
                    <p className="font-bold flex items-center gap-2">⚠️ Erreur : {error}</p>
                    {error.includes("n'existe pas") && (
                        <p className="text-sm mt-2 text-red-800">
                            Il semble que la base de données ne soit pas encore configurée.
                            Vérifiez que vous avez bien exécuté le script SQL fourni.
                        </p>
                    )}
                </div>
            )}

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="animate-spin text-blue-600" size={40} />
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden text-sm">
                    <div className="divide-y divide-gray-100">
                        {items.map(item => renderItem(item))}
                    </div>
                </div>
            )}
        </div>
    );
}
