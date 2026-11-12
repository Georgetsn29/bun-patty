'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CartProvider, CartItem, ItemCustomization } from '@/context/CartContext';
import { LanguageProvider } from '@/context/LanguageContext';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { ProductModal } from '@/components/product/ProductModal';
import { ActiveOrderBanner } from '@/components/tracking/ActiveOrderBanner';
import { MenuItem } from '@/data/menu';
import styles from './page.module.scss';

// Views
import { HomeView } from '@/components/views/HomeView';
import { ShopView } from '@/components/views/ShopView';
import { AboutView } from '@/components/views/AboutView';
import { LocationsView } from '@/components/views/LocationsView';
import { ContactView } from '@/components/views/ContactView';
import { CheckoutView } from '@/components/views/CheckoutView';
import { TrackingView } from '@/components/views/TrackingView';
import { NotFoundView } from '@/components/views/NotFoundView';

export default function App() {
  const [currentRoute, setCurrentRoute] = useState<string>('home');
  const [selectedProduct, setSelectedProduct] = useState<MenuItem | null>(null);
  const [editingCustomization, setEditingCustomization] = useState<ItemCustomization | null>(null);
  const [editingCartItemId, setEditingCartItemId] = useState<string | null>(null);
  const [editingQuantity, setEditingQuantity] = useState<number>(1);

  useEffect(() => {
    const handleHashChange = () => {
      const rawHash = window.location.hash;
      const hash = rawHash.replace(/^#\/?/, '');

      // Ignore in-page section anchor links (e.g. #section-side-dishes) so page is not reset or scrolled to top
      if (hash.startsWith('section-')) {
        return;
      }

      // Redirect old Journal, Blog, and FAQ links directly to Home page
      if (
        hash === 'journal' ||
        hash.startsWith('journal/') ||
        hash === 'blog' ||
        hash.startsWith('blog/') ||
        hash === 'faq' ||
        hash.startsWith('faq/')
      ) {
        setCurrentRoute('home');
        if (typeof window !== 'undefined' && window.history?.replaceState) {
          window.history.replaceState(null, '', '#/');
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      if (!hash || hash === '') {
        setCurrentRoute('home');
      } else if (hash === 'track' || hash.startsWith('track/')) {
        setCurrentRoute(hash);
      } else if (
        ['home', 'shop', 'about', 'locations', 'contact', 'checkout'].includes(
          hash
        )
      ) {
        setCurrentRoute(hash);
      } else {
        setCurrentRoute('404');
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (route: string) => {
    setCurrentRoute(route);
    window.location.hash = `#/${route}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenProductModal = (item: MenuItem) => {
    setSelectedProduct(item);
    setEditingCustomization(null);
    setEditingCartItemId(null);
    setEditingQuantity(1);
  };

  const handleEditCartItem = (cartItem: CartItem) => {
    setSelectedProduct(cartItem.item);
    setEditingCustomization(cartItem.customization);
    setEditingCartItemId(cartItem.cartItemId);
    setEditingQuantity(cartItem.quantity);
  };

  const handleCloseProductModal = () => {
    setSelectedProduct(null);
    setEditingCustomization(null);
    setEditingCartItemId(null);
    setEditingQuantity(1);
  };

  const renderCurrentView = () => {
    if (currentRoute === 'track' || currentRoute.startsWith('track/')) {
      const orderNumber = currentRoute.startsWith('track/')
        ? currentRoute.replace('track/', '')
        : undefined;
      return (
        <TrackingView
          orderNumberParam={orderNumber}
          onNavigate={navigateTo}
        />
      );
    }

    switch (currentRoute) {
      case 'home':
        return (
          <HomeView
            onNavigate={navigateTo}
            onOpenProductModal={handleOpenProductModal}
          />
        );
      case 'shop':
        return (
          <ShopView
            onOpenProductModal={handleOpenProductModal}
            onNavigate={navigateTo}
          />
        );
      case 'about':
        return <AboutView onNavigate={navigateTo} />;
      case 'locations':
        return <LocationsView onNavigate={navigateTo} />;
      case 'contact':
        return <ContactView />;
      case 'checkout':
        return <CheckoutView onNavigate={navigateTo} />;
      default:
        return <NotFoundView onNavigate={navigateTo} />;
    }
  };

  return (
    <LanguageProvider>
      <CartProvider>
        <div className={styles.pageWrapper}>
          {/* Active In-Progress Order Notification Banner */}
          <ActiveOrderBanner
            onNavigate={navigateTo}
            currentRoute={currentRoute}
          />

          {/* Unified Sticky Header on all pages */}
          <Header currentRoute={currentRoute} onNavigate={navigateTo} />

          {/* Main Content Area */}
          <main className={styles.mainContent}>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentRoute}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              >
                {renderCurrentView()}
              </motion.div>
            </AnimatePresence>
          </main>

          {/* Global Cart Slip Drawer */}
          <CartDrawer
            onNavigateToCheckout={() => navigateTo('checkout')}
            onNavigateToShop={() => navigateTo('shop')}
            onEditCartItem={handleEditCartItem}
          />

          {/* Product Customization & Editing Modal */}
          <ProductModal
            item={selectedProduct}
            initialCustomization={editingCustomization}
            editingCartItemId={editingCartItemId}
            initialQuantity={editingQuantity}
            onClose={handleCloseProductModal}
          />

          {/* Unified Footer on all pages */}
          <Footer onNavigate={navigateTo} />
        </div>
      </CartProvider>
    </LanguageProvider>
  );
}
