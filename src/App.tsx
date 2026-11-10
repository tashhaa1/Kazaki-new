import React, { useState, useEffect } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import {
  IntroScreen,
  Navbar,
  HeroSection,
  ProductsView,
  ProductCard,
  ProductDetailsModal,
  CartDrawer,
  CheckoutModal,
  OrdersModal,
  AuthModal,
  PhoneNotificationsModal,
  CustomerNotificationsModal,
  ManagerLiveAlerts,
  CustomerLiveAlerts,
  AdminDashboard,
  ContactView,
  LoginView,
  AboutView,
  Footer,
  ScrollLegoFlowerCanvas,
  ErrorBoundary,
  IOSInstallBanner,
} from './components';
import { ShieldAlert, Heart } from 'lucide-react';
import { Order } from './types';
import { setGlobalSpamNotifier } from './utils/antiSpam';

const StoreContent: React.FC = () => {
  const {
    activeView,
    setActiveView,
    currentUser,
    switchRole,
    products,
    setSelectedCategory,
    getBtnText,
    getText,
    isPhoneNotifsModalOpen,
    setIsPhoneNotifsModalOpen,
    isCustomerNotifsModalOpen,
    setIsCustomerNotifsModalOpen,
    isIntroActive,
  } = useStore();

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [spamToast, setSpamToast] = useState<string | null>(null);

  useEffect(() => {
    setGlobalSpamNotifier((msg) => {
      setSpamToast(msg);
      setTimeout(() => {
        setSpamToast(null);
      }, 3500);
    });
  }, []);

  // Strict route protection: Admin dashboard is accessible ONLY to logged-in admins
  useEffect(() => {
    if (activeView === 'admin' && currentUser?.role !== 'admin') {
      setActiveView('home');
    }
  }, [activeView, currentUser, setActiveView]);

  const handleOrderSuccess = (order: Order) => {
    // optional notification or redirect
  };

  return (
    <div className="min-h-screen flex flex-col bg-rose-50/20 text-stone-800 relative font-cairo" dir="rtl">
      {/* Global Anti-Spam / Rate-Limit Alert Pill */}
      {spamToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-full bg-stone-900/95 text-white border border-rose-500/50 shadow-2xl backdrop-blur-md text-xs font-bold flex items-center gap-2.5 animate-in fade-in slide-in-from-top-4 duration-200 pointer-events-none">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 animate-bounce" />
          <span>{spamToast}</span>
        </div>
      )}

      {/* Dynamic Intro Screen (Controlled by Admin: Image, Video, or Animation) */}
      <IntroScreen />

      {/* Interactive 3D Scroll Lego Flower Background (Assembles on scroll & rotates 360°) */}
      {activeView !== 'admin' && !isIntroActive && <ScrollLegoFlowerCanvas />}

      {/* Global Navigation */}
      <Navbar
        onOpenAuth={(mode) => {
          setAuthModalMode(mode || 'login');
          setIsAuthOpen(true);
        }}
        onOpenOrders={() => setIsOrdersOpen(true)}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {activeView === 'admin' && currentUser?.role === 'admin' ? (
          <AdminDashboard />
        ) : activeView === 'products' ? (
          <ProductsView />
        ) : activeView === 'contact' ? (
          <ContactView />
        ) : activeView === 'login' ? (
          <LoginView />
        ) : activeView === 'about' ? (
          <AboutView />
        ) : (
          /* Home View */
          <div>
            {/* Hero Section */}
            <HeroSection />

            {/* Pink Boutique Story Banner */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
              <div
                dir="rtl"
                className="rounded-3xl bg-gradient-to-r from-rose-600/90 via-pink-600/90 to-rose-500/90 backdrop-blur-md p-8 sm:p-12 text-white relative overflow-hidden shadow-xl text-right"
              >
                <div className="relative z-10 max-w-xl space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-xs font-semibold">
                    <Heart className="w-3.5 h-3.5 fill-white" />
                    <span>ورد مميز لا يذبل</span>
                  </div>
                  <h3 className="text-2xl sm:text-4xl font-extrabold leading-snug">
                    ورد مميز لا يذبل • صممت لتبقى معك للأبد
                  </h3>
                  <p className="text-rose-100 text-xs sm:text-sm leading-relaxed">
                    اختيار اجمل انواع الورد بعناية مع ضمان الجودة والتغليف الفاخر لجميع الطلبات
                  </p>
                  <div className="pt-2 flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => {
                        setActiveView('products');
                        setSelectedCategory('all');
                      }}
                      className="px-7 py-3 rounded-full bg-white hover:bg-rose-50 text-rose-700 font-bold text-xs shadow-md transition-colors cursor-pointer"
                    >
                      {getBtnText('shop', 'تسوق الآن')}
                    </button>
                    <button
                      onClick={() => {
                        setActiveView('about');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="px-6 py-3 rounded-full bg-white/20 hover:bg-white/30 text-white font-bold text-xs border border-white/30 backdrop-blur-xs transition-colors cursor-pointer"
                    >
                      {getBtnText('aboutUs', 'من نحن وقصتنا')}
                    </button>
                  </div>
                </div>

                {/* Decorative background shapes */}
                <div className="absolute top-0 left-0 w-80 h-80 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-pink-300/20 rounded-full blur-xl pointer-events-none" />
              </div>
            </section>
          </div>
        )}
      </main>

      {/* Global Modals & Drawers */}
      <ProductDetailsModal />

      <CartDrawer
        onOpenCheckout={() => setIsCheckoutOpen(true)}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onOrderSuccess={handleOrderSuccess}
      />

      <OrdersModal
        isOpen={isOrdersOpen}
        onClose={() => setIsOrdersOpen(false)}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        initialMode={authModalMode}
      />

      {/* Global Phone Notifications Modal */}
      <PhoneNotificationsModal
        isOpen={isPhoneNotifsModalOpen}
        onClose={() => setIsPhoneNotifsModalOpen(false)}
      />

      {/* Customer Status Notifications & Manager Notifications Modal */}
      <CustomerNotificationsModal
        isOpen={isCustomerNotifsModalOpen}
        onClose={() => setIsCustomerNotifsModalOpen(false)}
        onOpenOrders={() => setIsOrdersOpen(true)}
      />

      {/* Floating Real-Time Manager Incoming Alerts (Orders & Support Chats) */}
      <ManagerLiveAlerts />

      {/* Floating Real-Time Customer Incoming Alerts (New Products & Order Status) */}
      <CustomerLiveAlerts />

      {/* iOS Safari Install Prompt (shows only on iPhone/iPad Safari, not standalone PWA) */}
      <IOSInstallBanner />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <StoreProvider>
        <StoreContent />
      </StoreProvider>
    </ErrorBoundary>
  );
}
