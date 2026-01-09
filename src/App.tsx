import { Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { PublicLayout } from './components/layout/PublicLayout';
import { Hero } from './components/home/Hero';
import { ProductSection } from './components/home/ProductSection';
import { BlogSection } from './components/home/BlogSection';
import { BOOKS, TOYS, DECOR, BLOG_POSTS } from './data/mockData';
// Eagerly loaded public components
import { SocialStream } from './components/home/SocialStream';
import { ReviewsSlider } from './components/home/ReviewsSlider';

// Eagerly loaded Admin components
import { GlobalErrorBoundary } from './components/common/GlobalErrorBoundary';
import { AdminLayout } from './components/admin/AdminLayout';
import { ProductManager } from './components/admin/ProductManager';
import { OrdersOverview } from './components/admin/OrdersOverview';
// import { CustomersModule } from './components/admin/CustomersModule'; // File might differ, check if exists
import { AnalyticsModule } from './components/admin/AnalyticsModule';
// import { DSersModule } from './components/admin/DSersModule';
import { PrintifyModule } from './components/admin/PrintifyModule';
// import { MarketingModule } from './components/admin/MarketingModule';
// import { AdsModule } from './components/admin/AdsModule';
import { SEOModule } from './components/admin/SEOModule';
import { SettingsModule } from './components/admin/SettingsModule';
// import { AutomationModule } from './components/admin/AutomationModule';
import { SupportModule } from './components/admin/SupportModule';
import { ChatBotModule } from './components/admin/ChatBotModule';
import { ContentManagerModule } from './components/admin/ContentManagerModule';

// Pages - Public
import { CategoryPage } from './components/pages/CategoryPage';
import { ProductPage } from './components/pages/ProductPage';
import { CartProvider } from './context/CartContext';

function App() {
  return (
    // Force HMR Update
    <HelmetProvider>
      <GlobalErrorBoundary>
        <CartProvider>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              <Route element={<PublicLayout />}>
                <Route path="/" element={
                  <>
                    <Hero />
                    <ProductSection title="Nos Coups de Cœur" products={BOOKS} />
                    <div className="bg-gray-50">
                      <ProductSection title="Nouveautés Jouets" products={TOYS} />
                    </div>
                    <ProductSection title="Décoration Magique" products={DECOR} />
                    <BlogSection posts={BLOG_POSTS} />
                    <ReviewsSlider />
                    <SocialStream />
                  </>
                } />
                <Route path="/product/:id" element={<ProductPage />} />
                <Route path="/category/:categorySlug" element={<CategoryPage />} />
                <Route path="/category/:categorySlug/:subcategorySlug" element={<CategoryPage />} />
                {/* French aliases */}
                <Route path="/categorie/:categorySlug" element={<CategoryPage />} />
                <Route path="/categorie/:categorySlug/:subcategorySlug" element={<CategoryPage />} />
                {/* Fallback for root level category paths (e.g. /jouets instead of /category/jouets) */}
                <Route path="/:categorySlug" element={<CategoryPage />} />
              </Route>

              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<div>Admin Home</div>} />
                <Route path="products" element={<ProductManager />} />
                <Route path="orders" element={<OrdersOverview />} />
                <Route path="analytics" element={<AnalyticsModule />} />
                <Route path="printify" element={<PrintifyModule />} />
                <Route path="seo" element={<SEOModule />} />
                <Route path="settings" element={<SettingsModule />} />
                <Route path="support" element={<SupportModule />} />
                <Route path="chatbot" element={<ChatBotModule />} />
                <Route path="content" element={<ContentManagerModule />} />
              </Route>
            </Routes>
          </div>
        </CartProvider>
      </GlobalErrorBoundary>
    </HelmetProvider>
  )
}

export default App
