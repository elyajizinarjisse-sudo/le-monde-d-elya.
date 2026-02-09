import { Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { PublicLayout } from './components/layout/PublicLayout';
// Eagerly loaded public components
// Home components now imported inside Home.tsx

// Eagerly loaded Admin components
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
import { ProductPage } from './components/pages/ProductPage';
import { Home } from './components/pages/Home';
import { BlogPostPage } from './components/pages/BlogPostPage';
import { BlogPage } from './components/pages/BlogPage';

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
                <Route path="/" element={<Home />} />
                <Route path="/product/:id" element={<ProductPage />} />
                <Route path="/category/:categorySlug" element={<CategoryPage />} />
                <Route path="/category/:categorySlug/:subcategorySlug" element={<CategoryPage />} />
                <Route path="/blog" element={<BlogPage />} />
                <Route path="/blog/:id" element={<BlogPostPage />} />
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
                <Route path="customers" element={<CustomersModule />} />
                <Route path="analytics" element={<AnalyticsModule />} />
                <Route path="dsers" element={<DSersModule />} />
                <Route path="printify" element={<PrintifyModule />} />
                <Route path="marketing" element={<MarketingModule />} />
                <Route path="ads" element={<AdsModule />} />
                <Route path="seo" element={<SEOModule />} />
                <Route path="settings" element={<SettingsModule />} />
                <Route path="automation" element={<AutomationModule />} />
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
