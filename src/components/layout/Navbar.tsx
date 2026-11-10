import React, { useState } from 'react';
import { useStore, isCurrentSessionAdmin } from '../../context/StoreContext';
import {
  ShoppingBag,
  Search,
  User,
  ShieldCheck,
  Package,
  LogOut,
  ChevronDown,
  UserPlus,
  Menu,
  X,
  Heart,
  Globe,
  Bell,
} from 'lucide-react';

interface NavbarProps {
  onOpenAuth: (mode?: 'login' | 'register') => void;
  onOpenOrders: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAuth, onOpenOrders }) => {
  const {
    settings,
    currentUser,
    cart,
    setIsCartOpen,
    activeView,
    setActiveView,
    searchQuery,
    setSearchQuery,
    setSelectedCategory,
    categories,
    logout,
    phoneNotificationsEnabled,
    setIsPhoneNotifsModalOpen,
    customerNotifications,
    adminNotifications,
    isCustomerNotifsModalOpen,
    setIsCustomerNotifsModalOpen,
    getBtnText,
    getText,
    t,
  } = useStore();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const totalCartItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const isAdmin = currentUser?.role === 'admin' || isCurrentSessionAdmin(currentUser, activeView);
  const relevantNotifications = isAdmin ? adminNotifications : customerNotifications;
  const unreadNotifsCount = relevantNotifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-rose-100 shadow-xs">
      {/* Top Announcement Bar */}
      {settings.announcement.enabled && (
        <div className="bg-gradient-to-r from-rose-500 via-pink-500 to-rose-400 text-white text-xs py-2 px-4 text-center font-medium">
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
            <span>{getText('announcement', settings.announcement.text)}</span>
            {settings.announcement.linkText && (
              <button
                onClick={() => {
                  setActiveView('products');
                  setSelectedCategory('all');
                }}
                className="underline hover:text-rose-100 font-semibold cursor-pointer ml-1"
              >
                {getText('announcementLink', settings.announcement.linkText)}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2 sm:gap-4">
          {/* Mobile / Tablet menu toggle (visible on mobile and tablet up to lg) */}
          <div className="flex items-center lg:hidden shrink-0">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl text-stone-700 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer min-w-[40px] min-h-[40px] flex items-center justify-center"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Logo & Store Name */}
          <div
            onClick={() => setActiveView('home')}
            className="flex items-center gap-2 sm:gap-3 cursor-pointer select-none group min-w-0"
          >
            {settings.logoUrl ? (
              <img
                src={settings.logoUrl}
                alt={settings.storeName}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover border border-rose-200 shadow-sm shrink-0 group-hover:scale-105 transition-transform"
                onError={(e) => {
                  e.currentTarget.src = '/logo.jpg';
                }}
              />
            ) : (
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-tr from-rose-500 via-pink-400 to-rose-300 flex items-center justify-center text-white shadow-md shadow-rose-200 group-hover:scale-105 transition-transform shrink-0">
                <Heart className="w-4 h-4 sm:w-5 sm:h-5 fill-white" />
              </div>
            )}
            <div className="min-w-0">
              <span className="text-base sm:text-lg lg:text-xl font-black tracking-tight text-stone-900 group-hover:text-rose-600 transition-colors block truncate">
                {settings.storeName}
              </span>
              <span className="text-[10px] sm:text-[11px] text-stone-500 hidden sm:block truncate max-w-[200px] lg:max-w-xs">
                {settings.tagline}
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-5 xl:gap-8">
            <button
              onClick={() => {
                setActiveView('home');
                setSelectedCategory('all');
              }}
              className={`text-sm font-semibold transition-colors pb-1 border-b-2 cursor-pointer ${
                activeView === 'home'
                  ? 'text-rose-600 border-rose-500'
                  : 'text-stone-600 border-transparent hover:text-rose-600'
              }`}
            >
              {getBtnText('home', 'الرئيسية')}
            </button>
            <button
              onClick={() => {
                setActiveView('products');
                setSelectedCategory('all');
              }}
              className={`text-sm font-semibold transition-colors pb-1 border-b-2 cursor-pointer ${
                activeView === 'products'
                  ? 'text-rose-600 border-rose-500'
                  : 'text-stone-600 border-transparent hover:text-rose-600'
              }`}
            >
              {getBtnText('shop', 'جميع المنتجات')}
            </button>
            <button
              onClick={() => {
                setActiveView('contact');
              }}
              className={`text-sm font-semibold transition-colors pb-1 border-b-2 cursor-pointer ${
                activeView === 'contact'
                  ? 'text-rose-600 border-rose-500'
                  : 'text-stone-600 border-transparent hover:text-rose-600'
              }`}
            >
              {getBtnText('contactUs', 'تواصل معنا')}
            </button>
            <button
              onClick={() => {
                setActiveView('about');
              }}
              className={`text-sm font-semibold transition-colors pb-1 border-b-2 cursor-pointer ${
                activeView === 'about'
                  ? 'text-rose-600 border-rose-500'
                  : 'text-stone-600 border-transparent hover:text-rose-600'
              }`}
            >
              {getBtnText('aboutUs', 'من نحن')}
            </button>
            <button
              onClick={() => {
                setActiveView('login');
              }}
              className={`text-sm font-semibold transition-colors pb-1 border-b-2 cursor-pointer ${
                activeView === 'login'
                  ? 'text-rose-600 border-rose-500'
                  : 'text-stone-600 border-transparent hover:text-rose-600'
              }`}
            >
              {currentUser ? 'حسابي' : getBtnText('login', 'تسجيل الدخول')}
            </button>
          </nav>

          {/* Search Input Box (Visible on iPad and Desktop) */}
          <div className="hidden md:flex items-center flex-1 min-w-[120px] max-w-[180px] lg:max-w-xs relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (activeView !== 'products') setActiveView('products');
              }}
              placeholder={getBtnText('searchPlaceholder', 'البحث في المتجر...')}
              className="w-full bg-rose-50/50 border border-rose-100 hover:border-rose-300 focus:border-rose-400 focus:bg-white text-xs rounded-full py-2 sm:py-2.5 pr-8 pl-3 text-stone-800 placeholder-stone-400 transition-all outline-hidden focus:ring-2 focus:ring-rose-200"
            />
            <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-stone-400 absolute right-3 pointer-events-none" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute left-2.5 text-stone-400 hover:text-stone-600 text-xs p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Right Action Icons: Cart + User */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Notifications Bell Button */}
            <button
              onClick={() => setIsCustomerNotifsModalOpen(true)}
              className="relative p-2 sm:p-2.5 rounded-full text-stone-700 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer group min-w-[40px] min-h-[40px] flex items-center justify-center"
              title="الإشعارات ووصل حديثاً"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5 group-hover:scale-110 transition-transform" />
              {unreadNotifsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[10px] font-bold min-w-5 h-5 px-1 rounded-full flex items-center justify-center border-2 border-white shadow-xs animate-in zoom-in">
                  {unreadNotifsCount > 99 ? '99+' : unreadNotifsCount}
                </span>
              )}
            </button>

            {/* Shopping Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 sm:p-2.5 rounded-full text-stone-700 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer group min-w-[40px] min-h-[40px] flex items-center justify-center"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5 group-hover:scale-110 transition-transform" />
              {totalCartItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-xs animate-in zoom-in">
                  {totalCartItems}
                </span>
              )}
            </button>

            {/* Customer Auth Actions (When NOT logged in) */}
            {!currentUser ? (
              <div className="flex items-center gap-1 sm:gap-1.5">
                {/* Mobile Quick User Icon */}
                <button
                  onClick={() => onOpenAuth('login')}
                  className="sm:hidden p-2 rounded-full text-stone-700 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer min-w-[40px] min-h-[40px] flex items-center justify-center"
                  title="تسجيل الدخول أو إنشاء حساب"
                  aria-label={getBtnText('login', 'تسجيل الدخول')}
                >
                  <User className="w-5 h-5" />
                </button>

                {/* Desktop & Tablet Login & Register Buttons */}
                <button
                  onClick={() => onOpenAuth('login')}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 text-xs font-bold transition-all cursor-pointer shadow-2xs group"
                  title="تسجيل دخول الزبون"
                >
                  <User className="w-3.5 h-3.5 text-rose-600 transition-transform group-hover:scale-110" />
                  <span>{getBtnText('login', 'تسجيل الدخول')}</span>
                </button>

                <button
                  onClick={() => onOpenAuth('register')}
                  className="hidden md:flex items-center gap-1 px-3 py-1.5 rounded-full bg-gradient-to-r from-rose-600 to-pink-500 hover:from-rose-500 hover:to-pink-600 text-white text-xs font-bold transition-all shadow-xs cursor-pointer hover:shadow-md"
                  title="إنشاء حساب زبون جديد"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>إنشاء حساب</span>
                </button>
              </div>
            ) : (
              /* User Account Section: Shown when logged in */
              <div className="flex items-center gap-2">
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className={`flex items-center gap-2 py-1.5 px-3 rounded-full text-xs font-semibold transition-all border cursor-pointer ${
                      currentUser.role === 'admin'
                        ? 'bg-rose-900 text-rose-50 border-rose-800 hover:bg-rose-950'
                        : 'bg-rose-50 text-rose-900 border-rose-200 hover:bg-rose-100'
                    }`}
                  >
                    {currentUser.role === 'admin' ? (
                      <ShieldCheck className="w-4 h-4 text-rose-300" />
                    ) : (
                      <User className="w-4 h-4 text-rose-500" />
                    )}
                    <span className="max-w-[100px] truncate">{currentUser.name}</span>
                    <ChevronDown className="w-3.5 h-3.5 opacity-70" />
                  </button>

                  {/* Dropdown Menu for Logged In User */}
                  {isUserMenuOpen && (
                    <div
                      className="absolute left-0 text-right mt-2 w-64 bg-white rounded-2xl shadow-xl border border-rose-100 py-2 z-50 animate-in fade-in slide-in-from-top-2"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <div className="px-4 py-2 border-b border-rose-50">
                        <p className="text-xs font-bold text-stone-900">{currentUser.name}</p>
                        <p className="text-[11px] text-stone-500 truncate">{currentUser.email}</p>
                        <div className="mt-1">
                          {currentUser.role === 'admin' ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                              صلاحية: المدير العام
                            </span>
                          ) : (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                              حساب زبون مسجل
                            </span>
                          )}
                        </div>
                      </div>

                      {currentUser.role === 'admin' && (
                        <div className="p-2 border-b border-rose-50 bg-amber-50/40">
                          <button
                            onClick={() => setActiveView('admin')}
                            className="w-full text-right px-3 py-2.5 rounded-xl bg-gradient-to-r from-stone-900 to-stone-800 hover:from-stone-800 hover:to-stone-700 text-white font-bold text-xs flex items-center justify-between shadow-xs transition-all cursor-pointer"
                          >
                            <div className="flex items-center gap-2">
                              <ShieldCheck className="w-4 h-4 text-amber-400" />
                              <span>لوحة تحكم المتجر (الإدارة)</span>
                            </div>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-semibold">
                              دخول
                            </span>
                          </button>
                        </div>
                      )}

                      <button
                        onClick={() => setActiveView('login')}
                        className="w-full text-right px-4 py-2.5 text-xs text-stone-700 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                      >
                        <User className="w-4 h-4 text-rose-500" />
                        <span>تفاصيل حسابي والملف الشخصي</span>
                      </button>

                      <button
                        onClick={onOpenOrders}
                        className="w-full text-right px-4 py-2.5 text-xs text-stone-700 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                      >
                        <Package className="w-4 h-4 text-stone-500" />
                        <span>{getBtnText('trackOrder', 'طلباتي السابقة ومشترياتي')}</span>
                      </button>

                      <button
                        onClick={logout}
                        className="w-full text-right px-4 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer"
                      >
                        <LogOut className="w-4 h-4 text-red-500" />
                        <span>تسجيل الخروج</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile search bar */}
        <div className="pb-3 md:hidden">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (activeView !== 'products') setActiveView('products');
              }}
              placeholder={getBtnText('searchPlaceholder', 'البحث في المتجر...')}
              className="w-full bg-rose-50/50 border border-rose-100 focus:border-rose-400 focus:bg-white text-xs rounded-full py-2 pr-9 pl-4 text-stone-800 outline-hidden"
            />
            <Search className="w-4 h-4 text-stone-400 absolute right-3 top-2.5" />
          </div>
        </div>
      </div>

      {/* Mobile & Tablet Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-rose-100 bg-white px-4 py-4 space-y-3 max-h-[calc(100dvh-4rem)] sm:max-h-[calc(100dvh-5rem)] overflow-y-auto shadow-xl">
          {/* Mobile Customer Account Actions Card */}
          {!currentUser ? (
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-200/80 text-right space-y-2.5 shadow-2xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-rose-200/80 text-rose-700 flex items-center justify-center font-bold shrink-0">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-stone-900">حساب الزبون</h4>
                  <p className="text-[11px] text-stone-500">سجّل دخولك لمتابعة مشترياتك وطلباتك بكل سهولة</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenAuth('login');
                  }}
                  className="py-2 px-3 rounded-xl bg-white border border-rose-200 text-rose-700 text-xs font-bold hover:bg-rose-50 transition-colors shadow-2xs text-center cursor-pointer"
                >
                  {getBtnText('login', 'تسجيل الدخول')}
                </button>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenAuth('register');
                  }}
                  className="py-2 px-3 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 text-white text-xs font-bold hover:from-rose-500 hover:to-pink-500 transition-colors shadow-xs text-center cursor-pointer"
                >
                  إنشاء حساب جديد
                </button>
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-rose-50/80 border border-rose-200/80 text-right space-y-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                    {currentUser.role === 'admin' ? 'صلاحية: المدير العام' : 'حساب زبون مسجل'}
                  </span>
                  <p className="text-xs font-bold text-stone-900 mt-1">{currentUser.name}</p>
                  <p className="text-[10px] text-stone-500 truncate">{currentUser.email}</p>
                </div>
                <button
                  onClick={() => {
                    logout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="text-xs text-red-600 font-bold hover:underline cursor-pointer"
                >
                  تسجيل الخروج
                </button>
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setActiveView('login');
                  }}
                  className="flex-1 py-1.5 px-2 rounded-xl bg-white border border-rose-200 text-stone-700 text-xs font-semibold text-center hover:bg-rose-50 transition-colors cursor-pointer"
                >
                  حسابي والملف
                </button>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenOrders();
                  }}
                  className="flex-1 py-1.5 px-2 rounded-xl bg-white border border-rose-200 text-stone-700 text-xs font-semibold text-center hover:bg-rose-50 transition-colors cursor-pointer"
                >
                  طلباتي السابقة
                </button>
                {currentUser.role === 'admin' && (
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setActiveView('admin');
                    }}
                    className="flex-1 py-1.5 px-2 rounded-xl bg-stone-900 text-amber-400 text-xs font-bold text-center hover:bg-stone-800 transition-colors cursor-pointer"
                  >
                    الإدارة
                  </button>
                )}
              </div>
            </div>
          )}

          <button
            onClick={() => {
              setActiveView('home');
              setSelectedCategory('all');
              setIsMobileMenuOpen(false);
            }}
            className="block w-full text-right text-sm font-semibold text-stone-800 py-1.5"
          >
            {getBtnText('home', 'الرئيسية')}
          </button>
          <button
            onClick={() => {
              setActiveView('products');
              setSelectedCategory('all');
              setIsMobileMenuOpen(false);
            }}
            className="block w-full text-right text-sm font-semibold text-stone-800 py-1.5"
          >
            {getBtnText('shop', 'جميع المنتجات')}
          </button>
          <button
            onClick={() => {
              setActiveView('contact');
              setIsMobileMenuOpen(false);
            }}
            className="block w-full text-right text-sm font-semibold text-stone-800 py-1.5"
          >
            {getBtnText('contactUs', 'تواصل معنا')}
          </button>
          <button
            onClick={() => {
              setActiveView('about');
              setIsMobileMenuOpen(false);
            }}
            className="block w-full text-right text-sm font-semibold text-stone-800 py-1.5"
          >
            {getBtnText('aboutUs', 'من نحن')}
          </button>
          <button
            onClick={() => {
              setIsMobileMenuOpen(false);
              setIsCustomerNotifsModalOpen(true);
            }}
            className="flex items-center justify-between w-full text-right text-sm font-semibold text-rose-700 py-2 px-3 rounded-xl bg-rose-50/70 border border-rose-200/60 mt-1"
          >
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-rose-600" />
              <span>الإشعارات ووصل حديثاً</span>
            </div>
            {unreadNotifsCount > 0 && (
              <span className="bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                {unreadNotifsCount}
              </span>
            )}
          </button>
        </div>
      )}
    </header>
  );
};
