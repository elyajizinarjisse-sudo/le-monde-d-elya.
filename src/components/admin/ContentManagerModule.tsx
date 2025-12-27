import { useState } from 'react';
// Force HMR Update
import { Image as ImageIcon, Type, Layout, Store, Newspaper, Images } from 'lucide-react';
import { BlogManager } from './BlogManager';
import { GalleryManager } from './GalleryManager';
import { CategoryManager } from './CategoryManager';
import { HeroEditor } from './cms/HeroEditor';
import { LegalEditor } from './cms/LegalEditor';

export function ContentManagerModule() {
    const [activeTab, setActiveTab] = useState<'categories' | 'legal' | 'hero' | 'blog' | 'gallery'>('categories');

    return (
        <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 rounded-xl text-white shadow-lg">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                        <Store size={32} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold">Éditeur de Contenu</h2>
                        <p className="text-blue-100">Modifiez les textes, images et catégories de votre boutique</p>
                    </div>
                </div>
            </div>

            <div className="flex gap-2 border-b border-gray-200 pb-1 overflow-x-auto">
                <button
                    onClick={() => setActiveTab('categories')}
                    className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'categories'
                        ? 'bg-white text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <Layout className="inline-block w-4 h-4 mr-2" />
                    Catégories & Menu
                </button>
                <button
                    onClick={() => setActiveTab('blog')}
                    className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'blog'
                        ? 'bg-white text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <Newspaper className="inline-block w-4 h-4 mr-2" />
                    Articles de Blog
                </button>
                <button
                    onClick={() => setActiveTab('gallery')}
                    className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'gallery'
                        ? 'bg-white text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <Images className="inline-block w-4 h-4 mr-2" />
                    Galerie "Petits Lecteurs"
                </button>
                <button
                    onClick={() => setActiveTab('hero')}
                    className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'hero'
                        ? 'bg-white text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <ImageIcon className="inline-block w-4 h-4 mr-2" />
                    Images Accueil
                </button>
                <button
                    onClick={() => setActiveTab('legal')}
                    className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'legal'
                        ? 'bg-white text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <Type className="inline-block w-4 h-4 mr-2" />
                    Pages Légales
                </button>
            </div>

            <div className="bg-white rounded-b-xl rounded-tr-xl shadow-sm border border-gray-100 border-t-0 p-8 min-h-[400px]">
                {activeTab === 'blog' && <BlogManager />}
                {activeTab === 'gallery' && <GalleryManager />}
                {activeTab === 'categories' && <CategoryManager />}
                {activeTab === 'hero' && <HeroEditor />}

                {activeTab === 'legal' && <LegalEditor />}
            </div>
        </div>
    );
}
