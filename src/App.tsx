
import { Routes, Route, Link } from 'react-router-dom';
import { HelmetProvider, Helmet } from 'react-helmet-async';
import { PublicLayout } from './components/layout/PublicLayout';
import { Hero } from './components/home/Hero';
import { ProductSection } from './components/home/ProductSection';
import { BlogSection } from './components/home/BlogSection';
import { BOOKS, TOYS, DECOR, BLOG_POSTS } from './data/mockData';
// Eagerly loaded public components
import { SocialStream } from './components/home/SocialStream';
import { ReviewsSlider } from './components/home/ReviewsSlider';

// Eagerly loaded Admin components for debugging (ALL EAGER NOW)
import { GlobalErrorBoundary } from './components/common/GlobalErrorBoundary';
import { AdminLayout } from './components/admin/AdminLayout';
import { ProductManager } from './components/admin/ProductManager';
import { OrdersOverview } from './components/admin/OrdersOverview';
import { CustomersModule } from './components/admin/CustomersModule';
import { AnalyticsModule } from './components/admin/AnalyticsModule';
import { DSersModule } from './components/admin/DSersModule';
import { PrintifyModule } from './components/admin/PrintifyModule';
import { MarketingModule } from './components/admin/MarketingModule';
import { AdsModule } from './components/admin/AdsModule';
import { SEOModule } from './components/admin/SEOModule';
import { SettingsModule } from './components/admin/SettingsModule';
import { AutomationModule } from './components/admin/AutomationModule';
import { SupportModule } from './components/admin/SupportModule';
import { ChatBotModule } from './components/admin/ChatBotModule';
import { ContentManagerModule } from './components/admin/ContentManagerModule';

// Pages - Public
import { CategoryPage } from './components/pages/CategoryPage';
import { ProductDetailsPage } from './components/pages/ProductDetailsPage';
import { BlogPostPage } from './components/pages/BlogPostPage';
import { ContactPage } from './components/pages/ContactPage';
import { FAQPage } from './components/pages/FAQPage';
import { AccountPage } from './components/pages/AccountPage';
import { OrderTrackingPage } from './components/pages/OrderTrackingPage';
import { PrivacyPolicy, RefundPolicy, TermsAndConditions, AccessibilityStatement } from './components/pages/LegalPages';
import { CartProvider } from './context/CartContext';

// Lazy load helper no longer used for Admin, keeping just in case or removing
// const lazyLoad = ...

// Loading Components


import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';

import type { Product } from './components/home/ProductCard';

function HomePageContent() {
  const [products, setProducts] = useState<Product[]>([]);

  // Fetch blog posts
  const [posts, setPosts] = useState<any[]>([]);

  // Fetch gallery items
  const [galleryItems, setGalleryItems] = useState<any[]>([]);

  useEffect(() => {
    const fetchHomeProducts = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false }); // Fix: Ensure latest are first
      if (error) console.error('Error fetching home products:', error);
      if (data) setProducts(data);
    };

    const fetchPosts = async () => {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) console.error('Error fetching posts:', error);
      if (data && data.length > 0) setPosts(data);
    };

    const fetchGallery = async () => {
      const { data } = await supabase
        .from('featured_images')
        .select('*')
        .order('display_order', { ascending: true });
      if (data) setGalleryItems(data);
    };

    fetchHomeProducts();
    fetchPosts();
    fetchGallery();
  }, []);

  // Filter products for sections
  // If DB is empty, use empty arrays (or could fallback to mock, but let's show real state)
  const bookProducts = products.filter(p => p.category === 'Livres').slice(0, 4);
  const toyProducts = products.filter(p => p.category === 'Jouets').slice(0, 4);
  const decorProducts = products.filter(p => p.category === 'Décoration').slice(0, 4);

  // If we have 0 real products, maybe fallback to mock? 
  // User wants to see THEIR products using the site.
  // Let's use mock data only if NO products exist at all in DB to avoid empty site syndrome during dev.
  const hasRealData = products.length > 0;
  // Use mock posts only if no real posts exist
  const displayPosts = posts.length > 0 ? posts : BLOG_POSTS;

  const displayBooks = hasRealData ? bookProducts : BOOKS.slice(0, 4);
  const displayToys = hasRealData ? toyProducts : TOYS.slice(0, 4);
  const displayDecor = hasRealData ? decorProducts : DECOR.slice(0, 4);

  return (
    <>
      <Helmet>
        <title>Le Monde d'Elya - Boutique Magique pour Enfants 🦄</title>
        <meta name="description" content="Découvrez Le Monde d'Elya : Livres, jouets éducatifs, décoration féerique et bien plus pour l'éveil de vos enfants." />
      </Helmet>
      <Hero />
      <div className="container mx-auto px-4 py-8 space-y-12">
        {/* Debug / Visibility Section: Show all recent uploads */}
        {hasRealData && (
          <ProductSection title="Derniers Ajouts (Vos Produits) ✨" products={products.slice(0, 4)} />
        )}

        <ProductSection title="Nouveautés en livres 📚" products={displayBooks} />

        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 tracking-tight font-cursive mb-6">Nos petits lecteurs épanouis 🌟</h2>

          {/* Dynamic Gallery or Hardcoded Fallback */}
          {galleryItems.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {galleryItems.map(item => (
                <Link key={item.id} to={item.link_url} className="block relative group overflow-hidden rounded-xl shadow-md aspect-[5/4]">
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors flex items-end justify-start p-4">
                    <span className="text-white font-bold opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">{item.title}</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link to="/category/livres" className="block relative group overflow-hidden rounded-xl shadow-md">
                <img src="https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500&h=400&fit=crop" alt="Lecture confortable" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
              </Link>
              <Link to="/category/jouets" className="block relative group overflow-hidden rounded-xl shadow-md">
                <img src="https://images.unsplash.com/photo-1596464716127-f9a86255b6c3?w=500&h=400&fit=crop" alt="Découverte" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
              </Link>
              <Link to="/category/livres" className="block relative group overflow-hidden rounded-xl shadow-md">
                <img src="https://images.unsplash.com/photo-1621425178657-3f81e330bc02?w=500&h=400&fit=crop" alt="Histoires du soir" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
              </Link>
              <Link to="/category/creatif" className="block relative group overflow-hidden rounded-xl shadow-md">
                <img src="https://images.unsplash.com/photo-1589886406450-4d40cbd44598?w=500&h=400&fit=crop" alt="Complicité" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
              </Link>
            </div>
          )}
        </div>

        <BlogSection posts={displayPosts} />
        <ProductSection title="Jouets & Éveil 🧸" products={displayToys} />
        <ProductSection title="Décoration Féerique ✨" products={displayDecor} />
      </div>

      <ReviewsSlider />
      <SocialStream />
    </>
  );
}

function App() {
  return (
    <HelmetProvider>
      <GlobalErrorBoundary>
        {/* DEBUG BANNER - Verify Deployment */}
        <div className="fixed bottom-0 right-0 bg-gray-800 text-white text-xs p-1 z-[9999] pointer-events-none opacity-30 font-mono">
          VERSION: V3
        </div>

        <CartProvider>
          <Routes>
            {/* Public Store Routes */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<HomePageContent />} />
              <Route path="/product/:id" element={<ProductDetailsPage />} />
              <Route path="/track" element={<OrderTrackingPage />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/refunds" element={<RefundPolicy />} />
              <Route path="/terms" element={<TermsAndConditions />} />
              <Route path="/accessibility" element={<AccessibilityStatement />} />
              <Route path="/category/:categorySlug" element={<CategoryPage />} />
              <Route path="/category/:categorySlug/:subcategorySlug" element={<CategoryPage />} />
              <Route path="/blog/:id" element={<BlogPostPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/faq" element={<FAQPage />} />
              <Route path="/account" element={<AccountPage />} />
            </Route>

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <h3 className="text-lg font-bold mb-4">Bienvenue dans votre panneau de gestion</h3>
                  <p className="text-gray-600">Sélectionnez "Produits" ou "Commandes" dans le menu pour commencer.</p>
                </div>
              } />
              <Route path="products" element={<ProductManager />} />
              <Route path="orders" element={<OrdersOverview />} />
              <Route path="customers" element={<CustomersModule />} />
              <Route path="analytics" element={<AnalyticsModule />} />
              <Route path="dsers" element={<DSersModule />} />
              <Route path="printify" element={<PrintifyModule />} />
              <Route path="marketing" element={<MarketingModule />} />
              <Route path="ads" element={<AdsModule />} />
              <Route path="automation" element={<AutomationModule />} />
              <Route path="support" element={<SupportModule />} />
              <Route path="chatbot" element={<ChatBotModule />} />
              <Route path="content" element={<ContentManagerModule />} />
              <Route path="seo" element={<SEOModule />} />
              <Route path="settings" element={<SettingsModule />} />
            </Route>
          </Routes>
        </CartProvider>
      </GlobalErrorBoundary>
    </HelmetProvider >
  )
}

export default App
