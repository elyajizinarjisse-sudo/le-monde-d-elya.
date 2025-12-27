import { useState, useEffect } from 'react';
import { Plus, Upload, X } from 'lucide-react';
import { formatPrice } from '../../lib/currency';
import { supabase } from '../../lib/supabase';

export function ProductManager() {
    const [products, setProducts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);
    const [editingId, setEditingId] = useState<number | null>(null);

    // New Product State
    const [newProduct, setNewProduct] = useState({
        title: '',
        price: '',
        category: '', // Will start empty and populate after fetch
        subcategory: '',
        images: [] as { url: string; alt: string }[],
        image: '', // Legacy support
        image_alt: '', // Legacy support
        description: '',
        aspect_ratio: 'portrait' // 'portrait' | 'square' | 'landscape'
    });

    // Fetch products and categories
    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const { data } = await supabase.from('menu_items').select('*').order('display_order', { ascending: true });
            if (data) {
                const lookup: any = {};
                const rootItems: any[] = [];
                data.forEach(item => lookup[item.id] = { ...item, children: [] });
                data.forEach(item => {
                    if (item.parent_id && lookup[item.parent_id]) {
                        lookup[item.parent_id].children.push(lookup[item.id]);
                    } else {
                        rootItems.push(lookup[item.id]);
                    }
                });

                // Transform for ProductManager: simple structure with root label and flat list of sub-links
                // A "link" is a leaf node in this context.
                const formatted = rootItems.map(root => ({
                    label: root.label,
                    subItems: root.children?.flatMap((sec: any) =>
                        sec.children?.map((link: any) => ({
                            label: link.label,
                            display: `${sec.label} > ${link.label}`
                        })) || []
                    ) || []
                }));

                setCategories(formatted);

                // Set default if empty and not set
                if (formatted.length > 0) {
                    setNewProduct(prev => {
                        if (!prev.category) {
                            return { ...prev, category: formatted[0].label };
                        }
                        return prev;
                    });
                }
            }
        } catch (e) { console.error('Error fetching categories:', e); }
    };

    const fetchProducts = async () => {
        try {
            setIsLoading(true);
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .order('created_at', { ascending: false });

            if (!error && data) {
                setProducts(data as any[]);
            } else if (error) {
                console.error('Supabase Error:', error);
            }
        } catch (err) {
            console.error('Fetch crashed:', err);
        } finally {
            setIsLoading(false);
        }
    };

    // Subcategory logic based on DYNAMIC categories
    const activeCategory = categories.find(n => n.label === newProduct.category);
    // flattened subitems array is stored in subItems prop of formatted category
    const availableSubcategories = activeCategory ? activeCategory.subItems : [];

    const handleSaveProduct = async (e: React.FormEvent) => {
        e.preventDefault();

        // Use the first image as the main one for legacy support
        const mainImage = newProduct.images.length > 0 ? newProduct.images[0].url : (newProduct.image || "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=600&fit=crop");
        const mainImageAlt = newProduct.images.length > 0 ? newProduct.images[0].alt : newProduct.image_alt;

        const productPayload = {
            title: newProduct.title,
            price: parseFloat(newProduct.price),
            // Legacy fields
            image: mainImage,
            image_alt: mainImageAlt,
            // New JSONB field
            images: newProduct.images,
            description: newProduct.description,
            category: newProduct.category,
            subcategory: newProduct.subcategory,
            aspect_ratio: newProduct.aspect_ratio,
            stock: 10,
            is_new: true
        };

        try {
            let error;
            if (editingId) {
                // UPDATE
                const result = await supabase
                    .from('products')
                    .update(productPayload)
                    .eq('id', editingId);
                error = result.error;
            } else {
                // INSERT
                const result = await supabase
                    .from('products')
                    .insert([productPayload]);
                error = result.error;
            }

            if (error) {
                console.error(error);
                if (error.message.includes('schema cache')) {
                    alert("⚠️ Erreur de synchronisation Base de Données\n\nLa colonne 'images' est introuvable par Supabase.\n\nVeuillez exécuter ce SQL dans votre dashboard Supabase :\n\nNOTIFY pgrst, 'reload config';");
                } else if (error.message.includes('images')) {
                    alert("⚠️ Colonne manquante\n\nVotre table 'products' n'a pas la colonne 'images'.\nVeuillez exécuter le script de migration SQL fourni.");
                } else {
                    alert("Erreur lors de l'enregistrement : " + error.message);
                }
                return;
            }

            // Success
            await fetchProducts();
            resetForm();
            alert(editingId ? "Produit modifié avec succès !" : "Produit ajouté avec succès !");

        } catch (err: any) {
            alert("Une erreur inattendue est survenue : " + err.message);
        }
    };

    const handleEdit = (product: any) => {
        // Prepare images array
        let images = product.images || [];
        // Fallback: if no 'images' array but 'image' exists, create one entry
        if ((!images || images.length === 0) && product.image) {
            images = [{ url: product.image, alt: product.image_alt || '' }];
        }

        setNewProduct({
            title: product.title,
            price: product.price.toString(),
            category: product.category || (categories[0]?.label || ''),
            subcategory: product.subcategory || '',
            images: images,
            image: product.image,
            image_alt: product.image_alt,
            description: product.description || '',
            aspect_ratio: product.aspect_ratio || 'portrait'
        });
        setEditingId(product.id);
        setIsFormOpen(true);
    };

    const resetForm = () => {
        setIsFormOpen(false);
        setEditingId(null);
        setNewProduct({
            title: '',
            price: '',
            category: categories.length > 0 ? categories[0].label : '',
            subcategory: '',
            images: [],
            image: '',
            image_alt: '',
            description: '',
            aspect_ratio: 'portrait'
        });
    };

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true);
            if (!event.target.files || event.target.files.length === 0) {
                return;
            }

            const files = Array.from(event.target.files);
            const uploadPromises = files.map(async (file) => {
                const fileExt = file.name.split('.').pop();
                const fileName = `${Math.random()}.${fileExt}`;
                const filePath = `${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('product-images')
                    .upload(filePath, file);

                if (uploadError) {
                    throw uploadError;
                }

                const { data } = supabase.storage.from('product-images').getPublicUrl(filePath);
                return { url: data.publicUrl, alt: '' };
            });

            const newUploadedImages = await Promise.all(uploadPromises);

            // Append to existing images
            setNewProduct(prev => ({
                ...prev,
                images: [...(prev.images || []), ...newUploadedImages]
            }));

        } catch (error: any) {
            alert('Error uploading image: ' + error.message);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="space-y-8">
            {/* Header / Actions */}
            <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div>
                    <h3 className="text-lg font-bold text-gray-800">Catalogue Produits</h3>
                    <p className="text-gray-500 text-sm">
                        {isLoading ? 'Synchronisation...' : `${products.length} produits en stock`}
                    </p>
                </div>
                <button
                    onClick={() => { resetForm(); setIsFormOpen(!isFormOpen); }}
                    className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
                >
                    <Plus size={20} />
                    Ajouter un produit
                </button>
            </div>

            {/* Add Product Form */}
            {isFormOpen && (
                <div className="bg-white p-6 rounded-xl border border-pastel-pink shadow-md animate-in fade-in slide-in-from-top-4">
                    <div className="flex justify-between items-center mb-4">
                        <h4 className="font-bold text-gray-800">{editingId ? 'Modifier le Produit' : 'Nouveau Produit'}</h4>
                        <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
                            <X size={20} />
                        </button>
                    </div>

                    <form onSubmit={handleSaveProduct} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Nom du produit</label>
                            <input
                                required
                                type="text"
                                value={newProduct.title}
                                onChange={e => setNewProduct({ ...newProduct, title: e.target.value })}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                placeholder="Ex: Livre de contes"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Prix (€)</label>
                            <input
                                required
                                type="number"
                                value={newProduct.price}
                                onChange={e => setNewProduct({ ...newProduct, price: e.target.value })}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                placeholder="0.00"
                            />
                        </div>

                        {/* Dynamic Category Selection */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Catégorie</label>
                            <select
                                value={newProduct.category}
                                onChange={e => {
                                    setNewProduct({ ...newProduct, category: e.target.value, subcategory: '' });
                                }}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white"
                            >
                                {categories.map(item => (
                                    <option key={item.label} value={item.label}>{item.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* Dynamic Subcategory Selection */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Sous-catégorie</label>
                            <select
                                value={newProduct.subcategory}
                                onChange={e => setNewProduct({ ...newProduct, subcategory: e.target.value })}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white"
                                disabled={availableSubcategories.length === 0}
                            >
                                <option value="">Choisir...</option>
                                {availableSubcategories.map((item: any) => (
                                    <option key={item.display} value={item.label}>
                                        {item.display}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Aspect Ratio Selection */}
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-medium text-gray-700">Format d'image (Ratio)</label>
                            <div className="grid grid-cols-3 gap-3">
                                {[
                                    { value: 'portrait', label: 'Portrait (3:4)', desc: 'Idéal pour livres, vêtements' },
                                    { value: 'square', label: 'Carré (1:1)', desc: 'Style Instagram, polyvalent' },
                                    { value: 'landscape', label: 'Paysage (4:3)', desc: 'Pour objets larges, kits' }
                                ].map((option) => (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => setNewProduct({ ...newProduct, aspect_ratio: option.value })}
                                        className={`p-3 rounded-lg border text-left transition-all ${newProduct.aspect_ratio === option.value
                                            ? 'border-secondary bg-secondary/5 ring-1 ring-secondary'
                                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                            }`}
                                    >
                                        <div className="font-medium text-sm text-gray-900">{option.label}</div>
                                        <div className="text-xs text-gray-500">{option.desc}</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4 md:col-span-2 border border-gray-200 p-4 rounded-xl bg-gray-50/50">
                            <label className="text-sm font-bold text-gray-700 block mb-2">Galerie d'images</label>

                            {/* Images Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                {newProduct.images && newProduct.images.length > 0 && newProduct.images.map((img: any, index: number) => (
                                    <div key={index} className="relative group bg-white p-2 rounded-lg border border-gray-200 shadow-sm">
                                        <div className="aspect-square mb-2 relative overflow-hidden rounded-md">
                                            <img
                                                src={img.url}
                                                alt={img.alt || 'Aperçu'}
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute top-1 left-1 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded">
                                                {index === 0 ? 'Principal' : `#${index + 1}`}
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const newImages = [...newProduct.images];
                                                    newImages.splice(index, 1);
                                                    setNewProduct({ ...newProduct, images: newImages });
                                                }}
                                                className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X size={12} />
                                            </button>
                                        </div>
                                        <input
                                            type="text"
                                            value={img.alt}
                                            onChange={(e) => {
                                                const newImages = [...newProduct.images];
                                                newImages[index].alt = e.target.value;
                                                setNewProduct({ ...newProduct, images: newImages });
                                            }}
                                            className="w-full text-xs p-1 border border-gray-200 rounded focus:border-secondary focus:ring-1 focus:ring-secondary/20 outline-none"
                                            placeholder="Alt Text (SEO)"
                                        />
                                    </div>
                                ))}

                                {/* Upload Button */}
                                <label className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                                    {uploading ? (
                                        <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full mb-2"></div>
                                    ) : (
                                        <Upload size={24} className="text-gray-400 mb-2" />
                                    )}
                                    <span className="text-xs text-gray-500 text-center px-2">
                                        {uploading ? 'Envoi...' : 'Ajouter des photos'}
                                    </span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={handleImageUpload}
                                        disabled={uploading}
                                        className="hidden"
                                    />
                                </label>
                            </div>

                            {/* Legacy SEO Alt Text (Synced only for fallback display, real usage relies on the array above) */}
                            <p className="text-xs text-gray-500 italic">
                                * La première image sera l'image principale. Définissez le texte alternatif pour chaque image pour un meilleur SEO.
                            </p>

                            <div className="pt-2 border-t border-gray-200 mt-4">
                                <label className="text-sm font-medium text-gray-700 flex justify-between">
                                    Description détaillée
                                    <span className="text-xs text-secondary font-normal">Pour vos clients</span>
                                </label>
                                <textarea
                                    value={newProduct.description}
                                    onChange={e => setNewProduct({ ...newProduct, description: e.target.value })}
                                    className="w-full p-2 mt-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none text-sm min-h-[100px]"
                                    placeholder="Racontez l'histoire de ce produit..."
                                />
                            </div>
                        </div>

                        <div className="md:col-span-2 flex justify-end gap-2 mt-2">
                            <button
                                type="button"
                                onClick={resetForm}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium"
                            >
                                Annuler
                            </button>
                            <button
                                type="submit"
                                className="px-6 py-2 bg-secondary text-white rounded-lg font-bold hover:bg-secondary/90 transition-colors"
                            >
                                {editingId ? 'Mettre à jour' : 'Enregistrer'}
                            </button>
                        </div>
                    </form>
                </div >
            )
            }

            {/* Product List Table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                {isLoading && (
                    <div className="p-12 text-center text-gray-500 flex flex-col items-center gap-3">
                        <p className="animate-pulse font-medium">Chargement des données...</p>
                    </div>
                )}

                {!isLoading && (
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 uppercase tracking-wider text-xs font-semibold">
                            <tr>
                                <th className="p-4">Produit</th>
                                <th className="p-4">Catégorie</th>
                                <th className="p-4">Prix</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {products.map((product) => (
                                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4 flex items-center gap-3">
                                        <img src={product.image} alt={product.title} className="w-10 h-10 rounded-lg object-cover bg-gray-100" />
                                        <span className="font-medium text-gray-900">{product.title}</span>
                                    </td>
                                    <td className="p-4">
                                        <div className="text-gray-900 font-medium">{product.category || '-'}</div>
                                        <div className="text-gray-500 text-xs">{product.subcategory || ''}</div>
                                    </td>
                                    <td className="p-4 font-medium text-gray-600">
                                        {typeof product.price === 'number' ? formatPrice(product.price) : product.price}
                                    </td>
                                    <td className="p-4">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            En Stock
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <button
                                            onClick={() => handleEdit(product)}
                                            className="text-primary hover:text-primary/80 font-medium text-xs"
                                        >
                                            Modifier
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div >
    );
}
