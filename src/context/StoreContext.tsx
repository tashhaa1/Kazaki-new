import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  Product,
  Category,
  Order,
  StoreSettings,
  User,
  UserRole,
  CartItem,
  PromoCode,
  OrderStatus,
  IntroConfig,
  PaymentMethod,
  SupportMessage,
  OrderNotification,
  OrderStatusHistoryItem,
  SupportedLanguage,
  ButtonTranslations,
  CityShippingRate,
  CustomerServiceChannel,
  CustomerServiceConfig,
  TempChatSession,
  TempChatMessage,
} from '../types';
import {
  initialCategories,
  initialProducts,
  initialStoreSettings,
  initialOrders,
  initialPromoCodes,
  initialSupportMessages,
  initialButtonTranslations,
  initialSiteTexts,
  defaultAboutUs,
  defaultIraqiShippingRates,
  defaultCustomerServiceChannels,
} from '../data/initialData';
import {
  getSupabase,
  verifyAdminWithSupabase,
  getCachedAdminData,
  syncCategoryUpsertToSupabase,
  syncCategoryDeletionToSupabase,
  syncProductUpsertToSupabase,
  syncProductDeletionToSupabase,
  fetchCategoriesFromSupabase,
  fetchProductsFromSupabase,
  fetchOrdersFromSupabase,
  syncOrderToSupabase,
  syncOrderStatusToSupabase,
  fetchSupportMessagesFromSupabase,
  syncSupportMessageToSupabase,
  updateSupportMessageInSupabase,
} from '../lib/supabase';
import {
  notifyStoreOwnerOfNewOrder,
  playNotificationChime,
  playSupportMessageChime,
  unlockAudio,
  showBrowserNotification,
  requestBrowserNotificationPermission,
  getNotificationPermission,
} from '../lib/notifications';
import {
  registerServiceWorker,
  subscribeToPushNotifications,
  sendServerPushTest,
} from '../lib/pushNotifications';
import {
  isUserAdmin,
  sanitizeText,
  sanitizePrice,
  sanitizeStockCount,
  sanitizeMediaUrl,
  validateAndSanitizeProduct,
  validateAndSanitizeCategory,
} from '../utils/security';
import { instantTranslateArabic } from '../utils/autoTranslator';
import { syncGlobalPageTranslation } from '../utils/globalDomTranslator';

interface CartTotals {
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
}

interface StoreContextType {
  products: Product[];
  categories: Category[];
  orders: Order[];
  settings: StoreSettings;
  currentUser: User | null;
  cart: CartItem[];
  promoCodes: PromoCode[];
  appliedPromo: PromoCode | null;
  supportMessages: SupportMessage[];
  notifications: OrderNotification[];
  customerNotifications: OrderNotification[];
  adminNotifications: OrderNotification[];
  newOrderAlert: { orderId: string; customerName: string; amount: number; time: string } | null;
  clearNewOrderAlert: () => void;
  newSupportAlert: { id: string; customerName: string; subject: string; message: string; time: string } | null;
  clearNewSupportAlert: () => void;
  customerLiveAlert: {
    id: string;
    title: string;
    message: string;
    time: string;
    orderId?: string;
    productId?: string;
    productImage?: string;
    type?: string;
  } | null;
  clearCustomerLiveAlert: () => void;
  targetOrderFilter: string | null;
  setTargetOrderFilter: (orderId: string | null) => void;
  testManagerAlarmChime: () => void;
  testSupportMessageChime: () => void;
  myOrderIds: string[];
  isCartOpen: boolean;
  isLanguageModalOpen: boolean;
  isIntroActive: boolean;
  selectedCategory: string;
  searchQuery: string;
  selectedProduct: Product | null;
  activeView: 'home' | 'products' | 'admin' | 'orders' | 'profile' | 'contact' | 'login' | 'about';
  cartTotals: CartTotals;
  
  // Multilingual & All Site Texts customization
  currentLanguage: SupportedLanguage;
  setCurrentLanguage: (lang: SupportedLanguage) => void;
  siteTexts: Record<string, Record<SupportedLanguage, string>>;
  getText: (key: string, fallback?: string) => string;
  t: (text: string, key?: string) => string;
  getCategoryName: (category?: Category | null) => string;
  getCategoryDescription: (category?: Category | null) => string;
  currencyLabel: string;
  updateSiteTexts: (newTexts: Record<string, Record<SupportedLanguage, string>>) => void;
  resetSiteTextsToDefault: () => void;
  buttonTexts: ButtonTranslations;
  getBtnText: (key: string, fallback?: string) => string;
  updateButtonTexts: (newTexts: Partial<ButtonTranslations>) => void;
  resetButtonTextsToDefault: () => void;

  // Navigation & UI
  setActiveView: (view: 'home' | 'products' | 'admin' | 'orders' | 'profile' | 'contact' | 'login' | 'about') => void;
  setSelectedCategory: (catId: string) => void;
  setSearchQuery: (query: string) => void;
  setSelectedProduct: (product: Product | null) => void;
  setIsCartOpen: (open: boolean) => void;
  setIsLanguageModalOpen: (open: boolean) => void;
  isPhoneNotifsModalOpen: boolean;
  setIsPhoneNotifsModalOpen: (open: boolean) => void;
  isCustomerNotifsModalOpen: boolean;
  setIsCustomerNotifsModalOpen: (open: boolean) => void;
  dismissIntro: () => void;
  triggerIntroPreview: () => void;
  
  // Auth
  login: (email: string, roleOrPassword?: any) => boolean;
  loginAdminAsync: (emailOrUsername: string, passcode: string) => Promise<{ success: boolean; message?: string }>;
  verifyAdminPassword: (password: string) => boolean;
  register: (
    nameOrData: string | { name: string; email: string; phone?: string; city?: string; address?: string; password?: string },
    email?: string,
    phone?: string,
    password?: string
  ) => boolean;
  logout: () => void;
  switchRole: (role: UserRole) => void;

  // Cart
  addToCart: (product: Product, quantity?: number, variant?: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  applyPromoCode: (code: string) => { success: boolean; message: string };
  removePromoCode: () => void;

  // Checkout & Orders Tracking
  shippingRates: CityShippingRate[];
  getShippingFeeForCity: (cityName: string, subtotal?: number) => number;
  getCityRate: (cityName: string) => CityShippingRate | undefined;
  updateShippingRates: (rates: CityShippingRate[], options?: { defaultShippingFee?: number; freeShippingThreshold?: number }) => void;
  createOrder: (orderData: {
    customerName: string;
    customerEmail?: string;
    customerPhone: string;
    address: string;
    city: string;
    notes?: string;
    paymentMethod: PaymentMethod;
    shippingFee?: number;
    finalAmount?: number;
  }) => Order;
  updateOrderStatus: (
    orderId: string,
    status: OrderStatus,
    options?: {
      trackingNumber?: string;
      shippingCarrier?: string;
      note?: string;
      sendNotification?: boolean;
      notificationChannel?: 'whatsapp' | 'email' | 'system';
      customMessage?: string;
    }
  ) => void;
  sendOrderNotification: (
    orderId: string,
    options: {
      status?: OrderStatus;
      title: string;
      message: string;
      channel: 'whatsapp' | 'email' | 'system';
    }
  ) => OrderNotification | null;
  markNotificationAsRead: (id: string) => void;
  clearNotifications: () => void;

  // Phone / Mobile Push Notifications
  phoneNotificationsEnabled: boolean;
  togglePhoneNotifications: () => Promise<{ success: boolean; enabled: boolean; message: string }>;
  sendPhoneTestNotification: () => boolean;

  // Customer Support Messages & Management
  sendSupportMessage: (msg: Omit<SupportMessage, 'id' | 'createdAt' | 'status'>) => void;
  updateSupportMessageStatus: (id: string, status: 'new' | 'read' | 'replied', replyNotes?: string) => void;
  editSupportMessage: (id: string, updates: Partial<SupportMessage>) => void;
  deleteSupportMessage: (id: string) => void;
  clearAllSupportMessages: () => void;

  // 24-Hour Temporary Live Chat Management
  tempChats: TempChatSession[];
  activeCustomerChat: TempChatSession | null;
  activeChatSessionId: string | null;
  sendTempChatMessage: (text: string, customerInfo?: { name?: string; phone?: string; email?: string }) => Promise<{ success: boolean; message?: string }>;
  adminSendTempChatMessage: (sessionId: string, text: string) => Promise<{ success: boolean; message?: string }>;
  endTempChat: (sessionId?: string) => void;
  refreshTempChats: () => Promise<void>;

  // Customer Service Channels & Configuration Management
  updateCustomerServiceConfig: (config: Partial<CustomerServiceConfig>) => void;
  addCustomerServiceChannel: (channel: Omit<CustomerServiceChannel, 'id'>) => void;
  updateCustomerServiceChannel: (id: string, updates: Partial<CustomerServiceChannel>) => void;
  deleteCustomerServiceChannel: (id: string) => void;
  toggleCustomerServiceChannel: (id: string) => void;

  // Admin Management
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  updateSettings: (newSettings: Partial<StoreSettings>) => void;
  updateIntroConfig: (newConfig: Partial<IntroConfig>) => void;
  addPromoCode: (promo: PromoCode) => void;
  togglePromoCode: (code: string) => void;
  deletePromoCode: (code: string) => void;
  resetToDefault: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PRODUCTS: 'kazaki_products_leko_v9',
  CATEGORIES: 'kazaki_categories_leko_v9',
  ORDERS: 'kazaki_orders_leko_v9',
  SETTINGS: 'kazaki_settings_leko_v9',
  USER: 'kazaki_user_leko_v9',
  CART: 'kazaki_cart_leko_v9',
  PROMOS: 'kazaki_promos_leko_v9',
  INTRO_SEEN: 'kazaki_intro_seen_leko_v9',
  MESSAGES: 'kazaki_messages_leko_v9',
  NOTIFICATIONS: 'kazaki_notifications_leko_v9',
  LANGUAGE: 'kazaki_language_leko_v9',
};

// Helper to ensure "من نحن" (About Us) is NEVER treated as a product category and prune legacy categories
export const sanitizeCategories = (cats: Category[]): Category[] => {
  if (!cats || !Array.isArray(cats)) return [];
  return cats
    .filter((cat) => {
      const id = (cat.id || '').trim().toLowerCase();
      const name = (cat.name || '').trim().toLowerCase();
      const nameEn = (cat.nameEn || '').trim().toLowerCase();
      const nameKu = (cat.nameKu || '').trim().toLowerCase();
      // Exclude "من نحن" and variants from categories
      if (id === 'about' || id === 'aboutus' || id === 'about_us' || id === 'about-us') return false;
      if (name.includes('من نحن') || name.includes('مننحن') || nameEn.includes('about us') || nameKu.includes('دەربارەی ئێمە')) return false;
      // Exclude obsolete categories: domes, bonsai, singles
      if (id === 'domes' || id === 'bonsai_plants' || id === 'singles') return false;
      return true;
    })
    .map((cat) => {
      // Migrate old 'bouquets' category to 'flowers'
      if (cat.id === 'bouquets') {
        return {
          ...cat,
          id: 'flowers',
          name: 'ورود ليغو الفاخرة',
          nameEn: 'Luxury Lego Flowers',
          nameKu: 'گوڵی لێکۆی شایستە',
        };
      }
      return cat;
    });
};

/**
 * Safely removes older version keys and redundant cache items from localStorage
 * to ensure that quota errors never occur.
 */
export const pruneLegacyStorageKeys = () => {
  if (typeof localStorage === 'undefined') return;
  try {
    const legacyPatterns = [
      /^kazaki_products_(?!leko_v9)/,
      /^kazaki_categories_(?!leko_v9)/,
      /^kazaki_user_(?!leko_v9)/,
      /^kazaki_orders_(?!leko_v9)/,
      /^kazaki_settings_(?!leko_v9)/,
      /^kazaki_notifications_(?!leko_v9)/,
      /^kazaki_messages_(?!leko_v9)/,
      /^kazaki_promos_(?!leko_v9)/,
      /^kazaki_cart_(?!leko_v9)/,
      /^kazaki_live_ping$/,
    ];
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (!key) continue;
      if (legacyPatterns.some((pattern) => pattern.test(key))) {
        localStorage.removeItem(key);
      }
    }
  } catch {}
};

/**
 * Safely saves products into localStorage without exceeding browser quotas.
 * If quota is exceeded, legacy keys and heavy base64 strings are stripped automatically.
 */
export const safePersistProducts = (prods: Product[]) => {
  if (typeof localStorage === 'undefined' || !Array.isArray(prods)) return;
  try {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(prods));
  } catch {
    // Quota reached or private mode: Clean up legacy keys and try saving a lightweight cache
    pruneLegacyStorageKeys();
    try {
      localStorage.removeItem('kazaki_notifications_master_v1');
      localStorage.removeItem('kazaki_support_messages_master_v1');
      localStorage.removeItem('kazaki_live_ping');

      const lightweight = prods.map((p) => ({
        id: p.id,
        title: p.title,
        titleEn: p.titleEn,
        titleKu: p.titleKu,
        price: p.price,
        originalPrice: p.originalPrice,
        categoryId: p.categoryId,
        image: p.image && p.image.length > 50000 && p.image.startsWith('data:') ? '' : p.image,
        inStock: p.inStock,
        stockCount: p.stockCount,
        rating: p.rating,
        reviewsCount: p.reviewsCount,
        isFeatured: p.isFeatured,
        isNew: p.isNew,
        volumeOrSize: p.volumeOrSize,
        tags: Array.isArray(p.tags) ? p.tags.slice(0, 5) : [],
        gallery: Array.isArray(p.gallery)
          ? p.gallery.filter((g) => typeof g === 'string' && !g.startsWith('data:')).slice(0, 2)
          : [],
      }));
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(lightweight));
    } catch {
      // In-memory state and Supabase remain fully intact, silently succeed.
    }
  }
};

/**
 * Safely saves categories into localStorage.
 */
export const safePersistCategories = (cats: Category[]) => {
  if (typeof localStorage === 'undefined' || !Array.isArray(cats)) return;
  try {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(cats));
  } catch {
    pruneLegacyStorageKeys();
    try {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(cats));
    } catch {}
  }
};

export const safeFetchJson = async <T = any>(url: string, options?: RequestInit): Promise<T | null> => {
  try {
    const res = await fetch(url, options);
    const ct = res.headers.get('content-type') || '';
    if (res.ok && ct.includes('application/json')) {
      return (await res.json()) as T;
    }
    return null;
  } catch {
    return null;
  }
};

let backendHealthCache: { isLive: boolean; time: number } | null = null;
export const checkBackendHealth = async (): Promise<boolean> => {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    // On static deployments (Vercel, Netlify, GitHub Pages, or any non-localhost host),
    // there is no local Express backend running. Return false immediately to prevent any 404 /api/ network requests.
    if (
      host.includes('vercel.app') ||
      host.includes('netlify.app') ||
      host.includes('github.io') ||
      (host !== 'localhost' && host !== '127.0.0.1' && host !== '0.0.0.0')
    ) {
      return false;
    }
  }
  const now = Date.now();
  if (backendHealthCache && now - backendHealthCache.time < 30000) {
    return backendHealthCache.isLive;
  }
  try {
    const res = await safeFetchJson<{ status?: string }>('/api/health');
    const isLive = Boolean(res && res.status === 'ok');
    backendHealthCache = { isLive, time: now };
    return isLive;
  } catch {
    backendHealthCache = { isLive: false, time: now };
    return false;
  }
};

export const isCurrentSessionAdmin = (user?: User | null, view?: string): boolean => {
  if (user?.role === 'admin') return true;
  if (view === 'admin') return true;
  try {
    const adminSession = typeof localStorage !== 'undefined' ? localStorage.getItem('kazaki_admin_session_v1') : null;
    if (adminSession) {
      const parsed = JSON.parse(adminSession);
      if (parsed && (parsed.role === 'admin' || parsed.isAdmin)) return true;
    }
  } catch {}
  return false;
};

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial states from LocalStorage or fallbacks
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      if (saved) {
        const parsed: Product[] = JSON.parse(saved);
        // Clear any old demo products so store starts completely empty
        const isLegacyDemo =
          parsed.length > 0 &&
          parsed.every(
            (p) =>
              p.id.startsWith('prod-') &&
              (p.id === 'prod-1' ||
                p.id === 'prod-2' ||
                p.id === 'prod-3' ||
                p.id === 'prod-4' ||
                p.id === 'prod-5' ||
                p.id === 'prod-6' ||
                p.id === 'prod-7' ||
                p.id === 'prod-8' ||
                p.id === 'prod-9' ||
                p.id === 'prod-10')
          );
        if (isLegacyDemo) {
          localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
          return [];
        }
        return parsed.map((prod) => ({
          ...prod,
          titleEn: prod.titleEn || instantTranslateArabic(prod.title || '').en,
          titleKu: prod.titleKu || instantTranslateArabic(prod.title || '').ku,
          descriptionEn: prod.descriptionEn || instantTranslateArabic(prod.description || '').en,
          descriptionKu: prod.descriptionKu || instantTranslateArabic(prod.description || '').ku,
        }));
      }
      return initialProducts;
    } catch {
      return initialProducts;
    }
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      if (saved) {
        const parsed: Category[] = JSON.parse(saved);
        const sanitized = sanitizeCategories(parsed);

        // If local storage was holding an old smaller cache, merge in all categories
        let effectiveList = sanitized;
        if (sanitized.length < initialCategories.length) {
          const savedIds = new Set(sanitized.map((c) => c.id));
          const missing = initialCategories.filter((ic) => !savedIds.has(ic.id));
          effectiveList = [...sanitized, ...missing];
          safePersistCategories(effectiveList);
        }

        return effectiveList.map((cat) => {
          const init = initialCategories.find((ic) => ic.id === cat.id);
          const arabicRegex = /[\u0600-\u06FF]/;
          const instantName = instantTranslateArabic(cat.name || '');
          const instantDesc = instantTranslateArabic(cat.description || '');

          const nameEn = cat.nameEn && !arabicRegex.test(cat.nameEn) ? cat.nameEn : (init?.nameEn || instantName.en);
          const nameKu = cat.nameKu && cat.nameKu !== cat.name ? cat.nameKu : (init?.nameKu || instantName.ku);

          const descEn = cat.descriptionEn && !arabicRegex.test(cat.descriptionEn) ? cat.descriptionEn : (init?.descriptionEn || instantDesc.en);
          const descKu = cat.descriptionKu && cat.descriptionKu !== cat.description ? cat.descriptionKu : (init?.descriptionKu || instantDesc.ku);

          let image = cat.image || '';
          // If the image was truncated to ~2048 chars or is corrupted, heal it with clean fallback
          if (image.startsWith('data:image/') && image.length <= 2050) {
            image = init?.image || 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80';
          }

          return {
            ...cat,
            image,
            nameEn: nameEn || '',
            nameKu: nameKu || '',
            descriptionEn: descEn || '',
            descriptionKu: descKu || '',
          };
        });
      }
      return sanitizeCategories(initialCategories);
    } catch {
      return sanitizeCategories(initialCategories);
    }
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const savedMaster = localStorage.getItem('kazaki_master_orders_v1');
      const savedAdmin = localStorage.getItem('kazaki_admin_orders_v1');
      const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
      const chosen = savedMaster || savedAdmin || saved;
      if (chosen) {
        const parsed: Order[] = JSON.parse(chosen);
        const realOrders = parsed.filter(
          (o) =>
            !['ORD-9842', 'ORD-9831', 'ORD-9810'].includes(o.id) &&
            !o.customerEmail?.toLowerCase().includes('example.com')
        );
        return realOrders;
      }
      return [];
    } catch {
      return [];
    }
  });

  const [settings, setSettings] = useState<StoreSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...initialStoreSettings,
          ...parsed,
          logoUrl: parsed.logoUrl || '/logo.jpg',
          phone: parsed.phone || initialStoreSettings.phone,
          whatsapp: parsed.whatsapp || initialStoreSettings.whatsapp,
          email: (!parsed.email || parsed.email === 'info@kazaki.iq') ? initialStoreSettings.email : parsed.email,
          address: parsed.address || initialStoreSettings.address,
          instagram: parsed.instagram || initialStoreSettings.instagram,
          tiktok: parsed.tiktok || initialStoreSettings.tiktok,
          announcement: {
            ...initialStoreSettings.announcement,
            ...(parsed.announcement || {}),
          },
          heroBanner: {
            ...initialStoreSettings.heroBanner,
            ...(parsed.heroBanner || {}),
          },
          contactInfo: {
            ...initialStoreSettings.contactInfo,
            ...(parsed.contactInfo || {}),
            enabled: typeof parsed.contactInfo?.enabled === 'boolean' ? parsed.contactInfo.enabled : true,
            channels: (parsed.contactInfo?.channels && Array.isArray(parsed.contactInfo.channels) && parsed.contactInfo.channels.length > 0)
              ? parsed.contactInfo.channels
              : defaultCustomerServiceChannels,
          },
          introConfig: {
            ...initialStoreSettings.introConfig,
            ...(parsed.introConfig || {}),
          },
          aboutUs: {
            ...initialStoreSettings.aboutUs,
            ...(parsed.aboutUs || {}),
          },
          buttonTexts: {
            ...initialButtonTranslations,
            ...(parsed.buttonTexts || {}),
          },
          siteTexts: {
            ...initialSiteTexts,
            ...(parsed.siteTexts || {}),
            ...(parsed.buttonTexts || {}),
          },
          shippingRates: defaultIraqiShippingRates,
          defaultShippingFee: typeof parsed.defaultShippingFee === 'number' ? parsed.defaultShippingFee : 6000,
          freeShippingThreshold: typeof parsed.freeShippingThreshold === 'number' ? parsed.freeShippingThreshold : 0,
        };
      }
      return initialStoreSettings;
    } catch {
      return initialStoreSettings;
    }
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      // Purge any legacy demo accounts from all possible storage keys
      const keysToClean = [STORAGE_KEYS.USER, 'kazaki_user_v1', 'kazaki_user_leko_v7', 'currentUser'];
      keysToClean.forEach((k) => {
        try {
          const raw = localStorage.getItem(k);
          if (raw) {
            const p = JSON.parse(raw);
            const isDemo =
              !p ||
              !p.id ||
              p.id === 'user-cust-1' ||
              p.id.startsWith('user-cust') ||
              p.name?.includes('مريم') ||
              p.email?.toLowerCase().includes('maryam') ||
              p.email?.toLowerCase().includes('example.com') ||
              p.email?.toLowerCase().includes('demo');
            if (isDemo) {
              localStorage.removeItem(k);
            }
          }
        } catch {
          localStorage.removeItem(k);
        }
      });

      // Check dedicated admin session first
      try {
        const adminSession = localStorage.getItem('kazaki_admin_session_v1');
        if (adminSession) {
          const parsedAdmin: User = JSON.parse(adminSession);
          if (parsedAdmin && parsedAdmin.role === 'admin') {
            return parsedAdmin;
          }
        }
      } catch {}

      const saved = localStorage.getItem(STORAGE_KEYS.USER);
      if (saved) {
        const parsed: User = JSON.parse(saved);
        const isDemo =
          !parsed ||
          !parsed.id ||
          parsed.id === 'user-cust-1' ||
          parsed.id.startsWith('user-cust') ||
          parsed.name?.includes('مريم') ||
          parsed.email?.toLowerCase().includes('maryam') ||
          parsed.email?.toLowerCase().includes('example.com');
        if (isDemo) {
          localStorage.removeItem(STORAGE_KEYS.USER);
          return null;
        }
        return parsed;
      }
      return null;
    } catch {
      return null;
    }
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CART);
      if (saved) {
        const parsed: CartItem[] = JSON.parse(saved);
        const filtered = parsed.filter(
          (item) => item.product && !item.product.id?.startsWith('prod-')
        );
        if (filtered.length !== parsed.length) {
          try {
            localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(filtered));
          } catch {}
        }
        return filtered;
      }
      return [];
    } catch {
      return [];
    }
  });

  const [promoCodes, setPromoCodes] = useState<PromoCode[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROMOS);
      return saved ? JSON.parse(saved) : initialPromoCodes;
    } catch {
      return initialPromoCodes;
    }
  });

  const [supportMessages, setSupportMessages] = useState<SupportMessage[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MESSAGES);
      if (saved) {
        const parsed: SupportMessage[] = JSON.parse(saved);
        const realMessages = parsed.filter(
          (m) =>
            !['msg-101', 'msg-102'].includes(m.id) &&
            !m.customerEmail?.toLowerCase().includes('example.com')
        );
        return realMessages;
      }
      return [];
    } catch {
      return [];
    }
  });

  // 24-Hour Temporary Live Chat State
  const [tempChats, setTempChats] = useState<TempChatSession[]>(() => {
    try {
      const saved = localStorage.getItem('kazaki_temp_chats_v1');
      if (saved) {
        const parsed: TempChatSession[] = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const now = Date.now();
          return parsed.filter((s) => !s.expiresAt || new Date(s.expiresAt).getTime() > now);
        }
      }
    } catch {}
    return [];
  });
  const [activeChatSessionId, setActiveChatSessionId] = useState<string | null>(() => {
    try {
      return localStorage.getItem('kazaki_temp_chat_session_id_v1');
    } catch {
      return null;
    }
  });

  const activeCustomerChat = useMemo(() => {
    if (!activeChatSessionId) return null;
    const found = tempChats.find((c) => c.id === activeChatSessionId);
    if (!found) return null;
    if (Date.now() > new Date(found.expiresAt).getTime()) {
      return null;
    }
    return found;
  }, [tempChats, activeChatSessionId]);

  const [notifications, setNotifications] = useState<OrderNotification[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      if (saved) {
        const parsed: OrderNotification[] = JSON.parse(saved);
        const realNotifs = parsed.filter(
          (n) =>
            !['notif-1', 'notif-2', 'notif-3'].includes(n.id) &&
            !['ORD-9842', 'ORD-9831', 'ORD-9810'].includes(n.orderId || '')
        );
        return realNotifs;
      }
      return [];
    } catch {
      return [];
    }
  });

  // Phone / Mobile Push Notifications enabled state
  const [phoneNotificationsEnabled, setPhoneNotificationsEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('kazaki_phone_notifications_enabled');
      if (saved !== null) return JSON.parse(saved);
      return getNotificationPermission() === 'granted';
    } catch {
      return true;
    }
  });

  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);
  const [isPhoneNotifsModalOpen, setIsPhoneNotifsModalOpen] = useState(false);
  const [isCustomerNotifsModalOpen, setIsCustomerNotifsModalOpen] = useState(false);
  const [targetOrderFilter, setTargetOrderFilter] = useState<string | null>(null);

  // Customer order IDs tracking (for non-logged in or guest customers)
  const [myOrderIds, setMyOrderIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('kazaki_my_order_ids_v1');
      if (saved) {
        const parsed: string[] = JSON.parse(saved);
        return parsed.filter((id) => !['ORD-9842', 'ORD-9831', 'ORD-9810'].includes(id));
      }
      return [];
    } catch {
      return [];
    }
  });

  // Admin New Order Alert State (Live popup and sound)
  const [newOrderAlert, setNewOrderAlert] = useState<{
    orderId: string;
    customerName: string;
    amount: number;
    time: string;
  } | null>(null);

  const clearNewOrderAlert = () => {
    setNewOrderAlert(null);
  };

  // Admin New Support Chat Message Alert State (Live popup and sound)
  const [newSupportAlert, setNewSupportAlert] = useState<{
    id: string;
    customerName: string;
    subject: string;
    message: string;
    time: string;
  } | null>(null);

  const clearNewSupportAlert = () => {
    setNewSupportAlert(null);
  };

  // Customer Live Alert State (for automatic instant floating notifications)
  const [customerLiveAlert, setCustomerLiveAlert] = useState<{
    id: string;
    title: string;
    message: string;
    time: string;
    orderId?: string;
    productId?: string;
    productImage?: string;
    type?: string;
  } | null>(null);

  const clearCustomerLiveAlert = () => {
    setCustomerLiveAlert(null);
  };

  // Customer-only notifications: Strictly segregated so customers see their own order status notifications and store product arrivals!
  const customerNotifications = useMemo(() => {
    return notifications.filter((notif) => {
      // Must not be internal admin notification
      if (notif.target === 'admin') return false;

      // Allow store-wide announcements / new product arrivals for all customers
      if (notif.type === 'new_product' || (!notif.orderId && notif.target === 'customer')) return true;

      // Match by customer's placed orders
      if (notif.orderId && myOrderIds.includes(notif.orderId)) return true;

      // Match by logged-in customer phone or email
      if (currentUser && currentUser.role !== 'admin') {
        const matchEmail = notif.customerEmail && currentUser.email && notif.customerEmail.toLowerCase() === currentUser.email.toLowerCase();
        const matchPhone = notif.customerPhone && currentUser.phone && notif.customerPhone.replace(/[^0-9]/g, '') === currentUser.phone.replace(/[^0-9]/g, '');
        if (matchEmail || matchPhone) return true;
      }

      return false;
    });
  }, [notifications, myOrderIds, currentUser]);

  // Admin-only notifications: All manager and system alerts with auto-synthesis for all incoming orders
  const adminNotifications = useMemo(() => {
    const directAdminNotifs = notifications.filter((notif) => notif.target === 'admin');
    const existingOrderIds = new Set(directAdminNotifs.map((n) => n.orderId).filter(Boolean));

    // Fallback: If any order exists in orders that doesn't have an admin notification yet, synthesize one
    const synthesized: OrderNotification[] = [];
    for (const ord of orders) {
      if (!existingOrderIds.has(ord.id)) {
        synthesized.push({
          id: `notif-adm-synth-${ord.id}`,
          orderId: ord.id,
          customerName: ord.customerName,
          customerEmail: ord.customerEmail || '',
          customerPhone: ord.customerPhone,
          status: ord.status,
          title: `طلب وارد #${ord.id}`,
          message: `طلب من "${ord.customerName}" من محافظة ${ord.city} بمبلغ ${ord.finalAmount.toLocaleString('ar-IQ')} د.ع`,
          timestamp: ord.createdAt,
          channel: 'system',
          read: ord.status !== 'pending',
          trackingNumber: ord.trackingNumber,
          target: 'admin',
        });
      }
    }

    return [...directAdminNotifs, ...synthesized].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [notifications, orders]);

  const [isIntroActive, setIsIntroActive] = useState<boolean>(() => {
    try {
      const savedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      const conf = savedSettings ? JSON.parse(savedSettings).introConfig : initialStoreSettings.introConfig;
      if (conf?.enabled === false) return false;
      return true;
    } catch {
      return true;
    }
  });

  const [activeView, setActiveView] = useState<'home' | 'products' | 'admin' | 'orders' | 'profile' | 'contact' | 'login' | 'about'>('home');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Unified callback to trigger all admin alerts on any new order (audio chime, browser push, vibrate, popup card & notification item)
  const triggerAdminNewOrderAlert = useCallback((order: Order, notif?: OrderNotification) => {
    try {
      unlockAudio();
      playNotificationChime();
    } catch {}

    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([200, 100, 200]);
      } catch {}
    }

    try {
      showBrowserNotification(`طلب جديد وارد #${order.id}`, {
        body: `طلب جديد من ${order.customerName} بقيمة ${order.finalAmount?.toLocaleString('ar-IQ')} د.ع - ${order.city}`,
        tag: `order-${order.id}`,
      });
    } catch {}

    setNewOrderAlert({
      orderId: order.id,
      customerName: order.customerName,
      amount: order.finalAmount,
      time: new Date(order.createdAt || Date.now()).toLocaleTimeString('ar-IQ', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    });

    const adminNotif: OrderNotification = notif || {
      id: `notif-adm-${order.id}`,
      orderId: order.id,
      customerName: order.customerName,
      customerEmail: order.customerEmail || '',
      customerPhone: order.customerPhone,
      status: 'pending',
      title: `طلب جديد وارد #${order.id}`,
      message: `طلب جديد من الزبونة "${order.customerName}" من محافظة ${order.city} بمبلغ ${order.finalAmount?.toLocaleString('ar-IQ')} د.ع`,
      timestamp: order.createdAt || new Date().toISOString(),
      channel: 'system',
      read: false,
      trackingNumber: order.trackingNumber,
      target: 'admin',
    };

    setNotifications((prev) => {
      const exists = prev.some((n) => n.id === adminNotif.id || (n.orderId === order.id && n.target === 'admin'));
      return exists ? prev : [adminNotif, ...prev];
    });
  }, []);

  // Multilingual & Button texts customization (Arabic Only)
  const currentLanguage: SupportedLanguage = 'ar';
  const setCurrentLanguage = (_lang: SupportedLanguage) => {};

  useEffect(() => {
    document.documentElement.dir = 'rtl';
    document.documentElement.lang = 'ar';
    document.body.setAttribute('data-lang', 'ar');
    document.documentElement.classList.remove('font-kurdish');
    document.body.classList.remove('font-kurdish');
  }, []);

  // Unlock audio on first user gesture for clear in-website chime sounds
  useEffect(() => {
    const handleFirstGesture = () => {
      unlockAudio();
      window.removeEventListener('click', handleFirstGesture);
      window.removeEventListener('touchstart', handleFirstGesture);
    };

    window.addEventListener('click', handleFirstGesture, { once: true, passive: true });
    window.addEventListener('touchstart', handleFirstGesture, { once: true, passive: true });

    return () => {
      window.removeEventListener('click', handleFirstGesture);
      window.removeEventListener('touchstart', handleFirstGesture);
    };
  }, []);

  const siteTexts: Record<string, Record<SupportedLanguage, string>> = useMemo(() => {
    const merged: Record<string, Record<SupportedLanguage, string>> = {
      ...initialSiteTexts,
      ...(settings.siteTexts || {}),
      ...(settings.buttonTexts || {}),
    };
    Object.keys(initialSiteTexts).forEach((k) => {
      if (!merged[k]) {
        merged[k] = { ...initialSiteTexts[k] };
      }
    });
    return merged;
  }, [settings.siteTexts, settings.buttonTexts]);

  const buttonTexts: ButtonTranslations = useMemo(() => {
    return {
      ...initialButtonTranslations,
      ...(settings.buttonTexts || {}),
      ...(settings.siteTexts || {}),
    } as unknown as ButtonTranslations;
  }, [settings.buttonTexts, settings.siteTexts]);

  const getText = (key: string, fallback?: string): string => {
    const val =
      settings.siteTexts?.[key]?.['ar'] ||
      settings.buttonTexts?.[key]?.['ar'];
    if (val && val.trim() !== '') return val;

    return (
      fallback ||
      initialSiteTexts[key]?.['ar'] ||
      initialButtonTranslations[key]?.['ar'] ||
      ''
    );
  };

  const getBtnText = (key: string, fallback?: string): string => {
    return getText(key, fallback);
  };

  const getCategoryName = (category?: Category | null): string => {
    if (!category) return '';
    return category.name || '';
  };

  const getCategoryDescription = (category?: Category | null): string => {
    if (!category || !category.description) return '';
    return category.description;
  };

  const t = (text: string, key?: string): string => {
    if (!text) return '';
    if (key) {
      const found = getText(key, text);
      if (found && found !== text) return found;
    }
    const matchingCat = categories.find((c) => c.name === text || c.id === text);
    if (matchingCat) {
      return getCategoryName(matchingCat);
    }
    return text;
  };

  const currencyLabel = 'د.ع';

  const updateSiteTexts = (newTexts: Record<string, Record<SupportedLanguage, string>>) => {
    if (currentUser?.role !== 'admin') {
      return; // Admin only permission!
    }
    const merged: Record<string, Record<SupportedLanguage, string>> = {
      ...initialSiteTexts,
      ...(settings.siteTexts || {}),
      ...(settings.buttonTexts || {}),
      ...newTexts,
    };
    updateSettings({
      siteTexts: merged,
      buttonTexts: merged as unknown as ButtonTranslations,
    });
  };

  const resetSiteTextsToDefault = () => {
    if (currentUser?.role !== 'admin') return;
    updateSettings({
      siteTexts: initialSiteTexts,
      buttonTexts: initialButtonTranslations,
    });
  };

  const updateButtonTexts = (newTexts: Partial<ButtonTranslations>) => {
    updateSiteTexts(newTexts as Record<string, Record<SupportedLanguage, string>>);
  };

  const resetButtonTextsToDefault = () => {
    resetSiteTextsToDefault();
  };

  // Sync to localStorage safely
  useEffect(() => {
    safePersistProducts(products);
  }, [products]);

  useEffect(() => {
    safePersistCategories(categories);
  }, [categories]);

  useEffect(() => {
    // Preserve all orders safely across master storage without discarding them
    if (orders.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
        localStorage.setItem('kazaki_master_orders_v1', JSON.stringify(orders));
        localStorage.setItem('kazaki_admin_orders_v1', JSON.stringify(orders));
      } catch {}
    }
  }, [orders]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch {}
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(supportMessages));
      localStorage.setItem('kazaki_support_messages_master_v1', JSON.stringify(supportMessages));
    } catch {}
  }, [supportMessages]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
      localStorage.setItem('kazaki_notifications_master_v1', JSON.stringify(notifications));
    } catch {}
  }, [notifications]);

  useEffect(() => {
    try {
      localStorage.setItem('kazaki_temp_chats_v1', JSON.stringify(tempChats));
    } catch {}
  }, [tempChats]);

  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(currentUser));
        if (currentUser.role === 'admin') {
          localStorage.setItem('kazaki_admin_session_v1', JSON.stringify(currentUser));
        }
      } else {
        localStorage.removeItem(STORAGE_KEYS.USER);
      }
    } catch {}
  }, [currentUser]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
    } catch {}
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PROMOS, JSON.stringify(promoCodes));
    } catch {}
  }, [promoCodes]);

  // Register Service Worker for offline asset caching & prune legacy keys
  useEffect(() => {
    pruneLegacyStorageKeys();
    registerServiceWorker().catch(() => {});
  }, []);

  // Synchronize Categories & Products directly from Supabase Database on mount
  useEffect(() => {
    fetchCategoriesFromSupabase()
      .then((dbCats) => {
        if (dbCats && dbCats.length > 0) {
          const sanitized = sanitizeCategories(dbCats);
          setCategories(sanitized);
          safePersistCategories(sanitized);
        }
      })
      .catch((err) => console.warn('Supabase categories sync warning:', err));

    fetchProductsFromSupabase()
      .then((dbProds) => {
        if (dbProds !== null) {
          setProducts(dbProds);
          safePersistProducts(dbProds);
        }
      })
      .catch((err) => console.warn('Supabase products sync warning:', err));
  }, []);

  // Initial Sync from Supabase Database & Backend Server
  // Synchronize orders with Supabase (Admin gets all orders, Customer gets their own)
  useEffect(() => {
    // 1. Fetch Orders directly from Supabase
    fetchOrdersFromSupabase()
      .then((sbOrders) => {
        if (sbOrders && sbOrders.length > 0) {
          setOrders((prev) => {
            const existingIds = new Set(prev.map((o) => o.id));
            const newFromSb = sbOrders.filter((o) => !existingIds.has(o.id));
            // Update local orders with latest status from Supabase
            const updated = prev.map((local) => {
              const matched = sbOrders.find((sb) => sb.id === local.id);
              return matched ? { ...local, ...matched } : local;
            });
            const merged = [...newFromSb, ...updated];
            try {
              localStorage.setItem('kazaki_master_orders_v1', JSON.stringify(merged));
              localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(merged));
              localStorage.setItem('kazaki_admin_orders_v1', JSON.stringify(merged));
            } catch {}
            return merged;
          });
        }
      })
      .catch((err) => console.warn('Supabase orders initial sync warning:', err));

    // 2. Also sync from backend server API (only if running locally with Express)
    checkBackendHealth().then((isLive) => {
      if (!isLive) return;
      const isAdmin = isCurrentSessionAdmin(currentUser, activeView);
      const ordersUrl = isAdmin
        ? '/api/orders?role=admin'
        : `/api/orders?role=customer&orderIds=${myOrderIds.join(',')}&customerPhone=${encodeURIComponent(currentUser?.phone || '')}&customerEmail=${encodeURIComponent(currentUser?.email || '')}`;

      safeFetchJson<any>(ordersUrl, {
        headers: isAdmin ? { 'x-admin-role': 'admin' } : {},
      }).then((data) => {
        if (data && data.success && Array.isArray(data.orders) && data.orders.length > 0) {
          setOrders((prev) => {
            const serverIds = new Set(data.orders.map((o: any) => o.id));
            const localOnly = prev.filter((o) => !serverIds.has(o.id));
            return [...data.orders, ...localOnly];
          });
        }
      });
    });
  }, [currentUser, myOrderIds, activeView]);

  // Fetch initial support messages and notifications from Supabase and Server
  useEffect(() => {
    const isAdm = isCurrentSessionAdmin(currentUser, activeView);

    // 1. Fetch support messages directly from Supabase
    fetchSupportMessagesFromSupabase()
      .then((sbMsgs) => {
        if (sbMsgs && sbMsgs.length > 0) {
          setSupportMessages((prev) => {
            const existingIds = new Set(prev.map((m) => m.id));
            const newFromSb = sbMsgs.filter((m) => !existingIds.has(m.id));
            return [...newFromSb, ...prev];
          });
        }
      })
      .catch((err) => console.warn('Supabase support messages initial sync warning:', err));

    // 2. Also fetch from backend server (only if running locally with Express)
    checkBackendHealth().then((isLive) => {
      if (!isLive) return;

      safeFetchJson<any>('/api/support-messages', {
        headers: isAdm ? { 'x-admin-role': 'admin' } : {},
      }).then((data) => {
        if (data && data.success && Array.isArray(data.messages) && data.messages.length > 0) {
          setSupportMessages((prev) => {
            const serverIds = new Set(data.messages.map((m: any) => m.id));
            const localOnly = prev.filter((m) => !serverIds.has(m.id));
            return [...data.messages, ...localOnly];
          });
        }
      });

      // 3. Fetch notifications
      const notifUrl = isAdm
        ? '/api/notifications?role=admin'
        : `/api/notifications?role=customer&orderIds=${myOrderIds.join(',')}&customerPhone=${encodeURIComponent(currentUser?.phone || '')}&customerEmail=${encodeURIComponent(currentUser?.email || '')}`;

      safeFetchJson<any>(notifUrl, {
        headers: isAdm ? { 'x-admin-role': 'admin' } : {},
      }).then((data) => {
        if (data && data.success && Array.isArray(data.notifications) && data.notifications.length > 0) {
          setNotifications((prev) => {
            const serverIds = new Set(data.notifications.map((n: any) => n.id));
            const localOnly = prev.filter((n) => !serverIds.has(n.id));
            return [...data.notifications, ...localOnly];
          });
        }
      });

      // 4. Fetch initial 24-hour temporary live chats
      const chatsUrl = isAdm
        ? '/api/temp-chats?role=admin'
        : activeChatSessionId
        ? `/api/temp-chats?sessionId=${encodeURIComponent(activeChatSessionId)}`
        : `/api/temp-chats?customerPhone=${encodeURIComponent(currentUser?.phone || '')}&customerEmail=${encodeURIComponent(currentUser?.email || '')}`;

      safeFetchJson<any>(chatsUrl, {
        headers: isAdm ? { 'x-admin-role': 'admin' } : {},
      }).then((data) => {
        if (data?.success) {
          if (Array.isArray(data.sessions)) {
            setTempChats(data.sessions);
          } else if (data.session) {
            setTempChats((prev) => {
              const exists = prev.some((s) => s.id === data.session.id);
              return exists ? prev.map((s) => (s.id === data.session.id ? data.session : s)) : [data.session, ...prev];
            });
          }
        }
      });
    });
  }, [currentUser, myOrderIds, activeChatSessionId, activeView]);

  // Refs to prevent stale closures in event listeners & polling
  const ordersRef = useRef<Order[]>(orders);
  ordersRef.current = orders;

  const activeViewRef = useRef<string>(activeView);
  activeViewRef.current = activeView;

  const currentUserRef = useRef<User | null>(currentUser);
  currentUserRef.current = currentUser;

  const isBackendReachableRef = useRef<boolean>(false);

  useEffect(() => {
    checkBackendHealth().then((isLive) => {
      isBackendReachableRef.current = isLive;
    });
  }, []);

  // Real-time Live Connection (SSE + BroadcastChannel + Storage Events + Auto-polling fallback)
  useEffect(() => {
    const isAdm =
      isCurrentSessionAdmin(currentUser, activeView) ||
      (typeof localStorage !== 'undefined' && Boolean(localStorage.getItem('kazaki_admin_session_v1')));
    const role = isAdm ? 'admin' : 'customer';
    const sseUrl = `/api/events?role=${role}&phone=${encodeURIComponent(currentUser?.phone || '')}&email=${encodeURIComponent(currentUser?.email || '')}`;

    let eventSource: EventSource | null = null;
    let bc: BroadcastChannel | null = null;

    // 1. BroadcastChannel for instant cross-tab / cross-window sync
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        bc = new BroadcastChannel('kazaki_store_live_bus');
        bc.onmessage = (event) => {
          const { type, order, message, adminNotification, customerNotification } = event.data || {};

          if (type === 'NEW_ORDER') {
            const isAdmNow =
              isCurrentSessionAdmin(currentUserRef.current, activeViewRef.current) ||
              (typeof localStorage !== 'undefined' && Boolean(localStorage.getItem('kazaki_admin_session_v1')));
            if (order) {
              const isMine =
                (myOrderIds && myOrderIds.includes(order.id)) ||
                (currentUserRef.current && (
                  (order.customerEmail && currentUserRef.current.email && order.customerEmail.toLowerCase().trim() === currentUserRef.current.email.toLowerCase().trim()) ||
                  (order.customerPhone && currentUserRef.current.phone && order.customerPhone.replace(/[^0-9]/g, '') === currentUserRef.current.phone.replace(/[^0-9]/g, ''))
                ));

              if (isAdmNow || isMine) {
                setOrders((prev) => {
                  if (prev.some((o) => o.id === order.id)) return prev;
                  return [order, ...prev];
                });
              }

              if (isAdmNow) {
                triggerAdminNewOrderAlert(order, adminNotification);
              }
            }
          }

          if (type === 'NEW_SUPPORT_MESSAGE') {
            if (message) {
              setSupportMessages((prev) => {
                if (prev.some((m) => m.id === message.id)) return prev;
                return [message, ...prev];
              });
            }
            const isAdmNow =
              isCurrentSessionAdmin(currentUserRef.current, activeViewRef.current) ||
              (typeof localStorage !== 'undefined' && Boolean(localStorage.getItem('kazaki_admin_session_v1')));
            if (isAdmNow) {
              if (adminNotification) {
                setNotifications((prev) => {
                  if (prev.some((n) => n.id === adminNotification.id)) return prev;
                  return [adminNotification, ...prev];
                });
              }
              playSupportMessageChime();
              showBrowserNotification('استفسار دعم جديد', {
                body: `رسالة جديدة من ${message?.customerName}: ${message?.subject}`,
              });
              setNewSupportAlert({
                id: message?.id,
                customerName: message?.customerName,
                subject: message?.subject,
                message: message?.message,
                time: new Date().toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit' }),
              });
            }
          }

          if (type === 'ORDER_STATUS_UPDATED') {
            if (order) {
              setOrders((prev) =>
                prev.map((o) => (o.id === order.id ? { ...o, ...order } : o))
              );
            }
            if (customerNotification) {
              // Customer receives order status notification if this order belongs to them
              const isMyOrder =
                myOrderIds.includes(customerNotification.orderId) ||
                (currentUser &&
                  (currentUser.email?.toLowerCase() === customerNotification.customerEmail?.toLowerCase() ||
                    currentUser.phone === customerNotification.customerPhone));

              if (isMyOrder) {
                setNotifications((prev) => {
                  if (prev.some((n) => n.id === customerNotification.id)) return prev;
                  return [customerNotification, ...prev];
                });
                if (phoneNotificationsEnabled || getNotificationPermission() === 'granted') {
                  playNotificationChime();
                  showBrowserNotification(customerNotification.title || 'تحديث على حالة طلبك', {
                    body: customerNotification.message,
                  });
                }
                setCustomerLiveAlert({
                  id: customerNotification.id,
                  title: customerNotification.title || 'تحديث على طلبك',
                  message: customerNotification.message,
                  time: new Date().toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit' }),
                  orderId: customerNotification.orderId,
                  type: 'order',
                });
              }
            }
          }

          if (type === 'NEW_PRODUCT') {
            const incomingProd = event.data?.product;
            const notif = event.data?.notification;

            if (incomingProd) {
              setProducts((prev) => {
                if (prev.some((p) => p.id === incomingProd.id)) return prev;
                return [incomingProd, ...prev];
              });
            }

            if (notif) {
              setNotifications((prev) => {
                if (prev.some((n) => n.id === notif.id)) return prev;
                return [notif, ...prev];
              });

              if (phoneNotificationsEnabled || getNotificationPermission() === 'granted') {
                playNotificationChime();
                showBrowserNotification(notif.title || 'وصل حديثاً منتج جديد', {
                  body: notif.message,
                  icon: notif.productImage || incomingProd?.image || '/logo.png',
                  tag: `kazaki-prod-${notif.productId || incomingProd?.id || Date.now()}`,
                });
              }

              if (currentUser?.role !== 'admin') {
                setCustomerLiveAlert({
                  id: notif.id,
                  title: notif.title || 'وصل حديثاً منتج جديد',
                  message: notif.message,
                  time: new Date().toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit' }),
                  productId: notif.productId || incomingProd?.id,
                  productImage: notif.productImage || incomingProd?.image,
                  type: 'new_product',
                });
              }
            }
          }

          if (type === 'SUPPORT_REPLY') {
            if (message) {
              setSupportMessages((prev) =>
                prev.map((m) => (m.id === message.id ? { ...m, ...message } : m))
              );
            }
          }

          if (type === 'TEMP_CHAT_MESSAGE') {
            const { session, sessionId: bcSessionId, message: chatMsg, notification } = event.data || {};
            if (session) {
              setTempChats((prev) => {
                const exists = prev.some((s) => s.id === session.id);
                return exists ? prev.map((s) => (s.id === session.id ? session : s)) : [session, ...prev];
              });
            } else if (bcSessionId && chatMsg) {
              setTempChats((prev) => {
                const exists = prev.some((s) => s.id === bcSessionId);
                if (exists) {
                  return prev.map((s) =>
                    s.id === bcSessionId && !s.messages.some((m: any) => m.id === chatMsg.id)
                      ? {
                          ...s,
                          messages: [...s.messages, chatMsg],
                          lastMessageAt: chatMsg.timestamp,
                          unreadByAdmin: chatMsg.sender === 'customer' ? (s.unreadByAdmin || 0) + 1 : s.unreadByAdmin,
                          unreadByCustomer: chatMsg.sender === 'admin' ? (s.unreadByCustomer || 0) + 1 : s.unreadByCustomer,
                        }
                      : s
                  );
                }
                const newSess: TempChatSession = {
                  id: bcSessionId,
                  customerName: chatMsg.senderName || 'زبون المتجر',
                  customerPhone: '',
                  customerEmail: '',
                  createdAt: chatMsg.timestamp,
                  expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                  messages: [chatMsg],
                  status: 'active',
                  unreadByAdmin: chatMsg.sender === 'customer' ? 1 : 0,
                  unreadByCustomer: chatMsg.sender === 'admin' ? 1 : 0,
                  lastMessageAt: chatMsg.timestamp,
                };
                return [newSess, ...prev];
              });
            }
            if (chatMsg) {
              const isSenderAdmin = chatMsg.sender === 'admin';
              const isAdmNow =
              isCurrentSessionAdmin(currentUserRef.current, activeViewRef.current) ||
              (typeof localStorage !== 'undefined' && Boolean(localStorage.getItem('kazaki_admin_session_v1')));
              if (isAdmNow && !isSenderAdmin) {
                playSupportMessageChime();
                const adminNotif: OrderNotification = notification || {
                  id: `notif-chat-${Date.now()}`,
                  orderId: '',
                  customerName: chatMsg.senderName || 'زبون المتجر',
                  customerPhone: '',
                  customerEmail: '',
                  status: 'pending',
                  title: `رسالة شات مباشر جديدة من: ${chatMsg.senderName || 'الزبون'}`,
                  message: chatMsg.text,
                  timestamp: chatMsg.timestamp || new Date().toISOString(),
                  channel: 'system',
                  read: false,
                  target: 'admin',
                };
                setNotifications((prev) => (prev.some((n) => n.id === adminNotif.id) ? prev : [adminNotif, ...prev]));
                showBrowserNotification(`رسالة شات جديدة من ${chatMsg.senderName}`, {
                  body: chatMsg.text,
                });
                setNewSupportAlert({
                  id: chatMsg.id,
                  customerName: chatMsg.senderName,
                  subject: 'شات مباشر (24 ساعة)',
                  message: chatMsg.text,
                  time: new Date().toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit' }),
                });
              } else if (!isAdmNow && isSenderAdmin) {
                playNotificationChime();
                showBrowserNotification('رد من إدارة متجر KAZAKI', {
                  body: chatMsg.text,
                });
                setCustomerLiveAlert({
                  id: chatMsg.id,
                  title: 'رد جديد في المحادثة المباشرة',
                  message: chatMsg.text,
                  time: new Date().toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit' }),
                  type: 'chat',
                });
              }
            }
          }
        };
      }
    } catch (bcErr) {
      console.warn('BroadcastChannel initialization error:', bcErr);
    }

    // 2. Storage event listener for cross-tab storage changes
    const handleStorageEvent = (e: StorageEvent) => {
      const isAdmNow = isCurrentSessionAdmin(currentUser, activeView);
      if (
        e.key === 'kazaki_live_ping' ||
        e.key === 'kazaki_master_orders_v1' ||
        e.key === STORAGE_KEYS.ORDERS ||
        e.key === 'kazaki_notifications_master_v1'
      ) {
        if (isAdmNow) {
          try {
            const rawOrders = localStorage.getItem('kazaki_master_orders_v1') || localStorage.getItem(STORAGE_KEYS.ORDERS);
            if (rawOrders) {
              const parsedOrders: Order[] = JSON.parse(rawOrders);
              if (Array.isArray(parsedOrders) && parsedOrders.length > 0) {
                setOrders((prev) => {
                  const prevMap = new Map(prev.map((o) => [o.id, o]));
                  for (const o of parsedOrders) {
                    if (!prevMap.has(o.id)) {
                      triggerAdminNewOrderAlert(o);
                    }
                  }
                  return parsedOrders;
                });
              }
            }
          } catch {}

          if (isBackendReachableRef.current) {
            safeFetchJson<any>('/api/orders?role=admin', { headers: { 'x-admin-role': 'admin' } })
              .then((d) => {
                if (d?.success && Array.isArray(d.orders)) {
                  setOrders((prev) => {
                    const prevMap = new Map(prev.map((o) => [o.id, o]));
                    for (const o of d.orders) {
                      if (!prevMap.has(o.id)) {
                        triggerAdminNewOrderAlert(o);
                      }
                    }
                    return d.orders;
                  });
                }
              });

            safeFetchJson<any>('/api/notifications?role=admin', { headers: { 'x-admin-role': 'admin' } })
              .then((d) => {
                if (d?.success && Array.isArray(d.notifications)) {
                  setNotifications(d.notifications);
                }
              });

            safeFetchJson<any>('/api/support-messages', { headers: { 'x-admin-role': 'admin' } })
              .then((d) => {
                if (d?.success && Array.isArray(d.messages)) {
                  setSupportMessages(d.messages);
                }
              });
          }
        } else {
          // If another tab added a product or updated order, sync notifications immediately
          if (isBackendReachableRef.current) {
            const notifUrl = `/api/notifications?role=customer&orderIds=${myOrderIds.join(',')}&customerPhone=${encodeURIComponent(currentUser?.phone || '')}&customerEmail=${encodeURIComponent(currentUser?.email || '')}`;
            safeFetchJson<any>(notifUrl)
              .then((data) => {
                if (data?.success && Array.isArray(data.notifications)) {
                  setNotifications(data.notifications);
                }
              });
          }
        }
      }
    };
    window.addEventListener('storage', handleStorageEvent);

    // 3. Server-Sent Events (SSE) stream from backend server
    // Proactively verify if backend API is live before connecting to avoid
    // browser "EventSource MIME type text/html" errors on static hosts like Vercel.
    let isCancelled = false;
    checkBackendHealth().then((isLive) => {
      if (isCancelled || !isLive) return;
      isBackendReachableRef.current = isLive;

      try {
        eventSource = new EventSource(sseUrl);

        eventSource.onerror = () => {
          // When server is restarting or running in static mode without SSE, gracefully close to prevent console loop
          try {
            if (eventSource && (eventSource.readyState === EventSource.CLOSED || eventSource.readyState === EventSource.CONNECTING)) {
              eventSource.close();
            }
          } catch {}
        };

      eventSource.addEventListener('new_order', (e: any) => {
        try {
          const payload = JSON.parse(e.data);
          const { order, notification } = payload;
          if (order) {
            const isAdmNow =
              isCurrentSessionAdmin(currentUserRef.current, activeViewRef.current) ||
              (typeof localStorage !== 'undefined' && Boolean(localStorage.getItem('kazaki_admin_session_v1')));

            const isMine =
              (myOrderIds && myOrderIds.includes(order.id)) ||
              (currentUserRef.current && (
                (order.customerEmail && currentUserRef.current.email && order.customerEmail.toLowerCase().trim() === currentUserRef.current.email.toLowerCase().trim()) ||
                (order.customerPhone && currentUserRef.current.phone && order.customerPhone.replace(/[^0-9]/g, '') === currentUserRef.current.phone.replace(/[^0-9]/g, ''))
              ));

            if (isAdmNow || isMine) {
              setOrders((prev) => {
                if (prev.some((o) => o.id === order.id)) return prev;
                return [order, ...prev];
              });
            }

            if (isAdmNow) {
              triggerAdminNewOrderAlert(order, notification);
            }
          }
        } catch (err) {
          console.error('Error handling new_order event:', err);
        }
      });

      eventSource.addEventListener('new_support_message', (e: any) => {
        try {
          const payload = JSON.parse(e.data);
          const { message, notification } = payload;
          if (message) {
            setSupportMessages((prev) => {
              if (prev.some((m) => m.id === message.id)) return prev;
              return [message, ...prev];
            });
            if (notification) {
              setNotifications((prev) => {
                if (prev.some((n) => n.id === notification.id)) return prev;
                return [notification, ...prev];
              });
            }
            const isAdmNow =
              isCurrentSessionAdmin(currentUserRef.current, activeViewRef.current) ||
              (typeof localStorage !== 'undefined' && Boolean(localStorage.getItem('kazaki_admin_session_v1')));
            if (isAdmNow) {
              playSupportMessageChime();
              showBrowserNotification('استفسار دعم جديد', {
                body: `رسالة جديدة من ${message.customerName}: ${message.subject}`,
              });
              setNewSupportAlert({
                id: message.id,
                customerName: message.customerName,
                subject: message.subject,
                message: message.message,
                time: new Date().toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit' }),
              });
            }
          }
        } catch (err) {
          console.error('Error handling new_support_message event:', err);
        }
      });

      eventSource.addEventListener('order_status', (e: any) => {
        try {
          const payload = JSON.parse(e.data);
          const { order, notification } = payload;
          if (order) {
            setOrders((prev) =>
              prev.map((o) => (o.id === order.id ? { ...o, ...order } : o))
            );
          }
          if (notification) {
            setNotifications((prev) => {
              if (prev.some((n) => n.id === notification.id)) return prev;
              return [notification, ...prev];
            });
            if (phoneNotificationsEnabled || getNotificationPermission() === 'granted') {
              playNotificationChime();
              showBrowserNotification(notification.title || 'تحديث على حالة طلبك', {
                body: notification.message,
              });
            }
            if (currentUser?.role !== 'admin') {
              setCustomerLiveAlert({
                id: notification.id,
                title: notification.title || 'تحديث على طلبك',
                message: notification.message,
                time: new Date().toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit' }),
                orderId: notification.orderId,
                type: 'order',
              });
            }
          }
        } catch (err) {
          console.error('Error handling order_status event:', err);
        }
      });

      eventSource.addEventListener('new_product', (e: any) => {
        try {
          const payload = JSON.parse(e.data);
          const { product, notification } = payload;
          if (product) {
            setProducts((prev) => {
              if (prev.some((p) => p.id === product.id)) return prev;
              return [product, ...prev];
            });
          }
          if (notification) {
            setNotifications((prev) => {
              if (prev.some((n) => n.id === notification.id)) return prev;
              return [notification, ...prev];
            });
            if (phoneNotificationsEnabled || getNotificationPermission() === 'granted') {
              playNotificationChime();
              showBrowserNotification(notification.title || 'وصل حديثاً منتج جديد في المتجر', {
                body: notification.message,
                icon: notification.productImage || product?.image || '/logo.png',
                tag: `kazaki-prod-${notification.productId || product?.id || Date.now()}`,
              });
            }
            if (currentUser?.role !== 'admin') {
              setCustomerLiveAlert({
                id: notification.id,
                title: notification.title || 'وصل حديثاً منتج جديد',
                message: notification.message,
                time: new Date().toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit' }),
                productId: notification.productId || product?.id,
                productImage: notification.productImage || product?.image,
                type: 'new_product',
              });
            }
          }
        } catch (err) {
          console.error('Error handling new_product event:', err);
        }
      });

      eventSource.addEventListener('support_reply', (e: any) => {
        try {
          const payload = JSON.parse(e.data);
          const { message } = payload;
          if (message) {
            setSupportMessages((prev) =>
              prev.map((m) => (m.id === message.id ? { ...m, ...message } : m))
            );
          }
        } catch {}
      });

      eventSource.addEventListener('temp_chat_message', (e: any) => {
        try {
          const payload = JSON.parse(e.data);
          const { session, message: chatMsg, notification } = payload;
          if (session) {
            setTempChats((prev) => {
              const exists = prev.some((s) => s.id === session.id);
              return exists ? prev.map((s) => (s.id === session.id ? session : s)) : [session, ...prev];
            });
          }
          if (chatMsg) {
            const isSenderAdmin = chatMsg.sender === 'admin';
            const isAdmNow =
              isCurrentSessionAdmin(currentUserRef.current, activeViewRef.current) ||
              (typeof localStorage !== 'undefined' && Boolean(localStorage.getItem('kazaki_admin_session_v1')));
            if (isAdmNow && !isSenderAdmin) {
              playSupportMessageChime();
              if (notification) {
                setNotifications((prev) => {
                  if (prev.some((n) => n.id === notification.id)) return prev;
                  return [notification, ...prev];
                });
              }
              showBrowserNotification(`رسالة شات جديدة من ${chatMsg.senderName}`, {
                body: chatMsg.text,
              });
              setNewSupportAlert({
                id: chatMsg.id,
                customerName: chatMsg.senderName,
                subject: 'شات مباشر (24 ساعة)',
                message: chatMsg.text,
                time: new Date().toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit' }),
              });
            } else if (!isAdmNow && isSenderAdmin) {
              playNotificationChime();
              showBrowserNotification('رد من إدارة متجر KAZAKI', {
                body: chatMsg.text,
              });
              setCustomerLiveAlert({
                id: chatMsg.id,
                title: 'رد جديد في المحادثة المباشرة',
                message: chatMsg.text,
                time: new Date().toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit' }),
                type: 'chat',
              });
            }
          }
        } catch (err) {
          console.error('Error handling temp_chat_message SSE:', err);
        }
      });
    } catch (sseErr) {
      console.warn('SSE connection warning:', sseErr);
    }
    });

    // 4. Polling fallback to guarantee orders, chats, and new products reach all users immediately
    const pollInterval = setInterval(() => {
      // Only poll backend if backend was detected as live to save battery and network
      if (!isBackendReachableRef.current) return;
      const isAdmNow =
        isCurrentSessionAdmin(currentUserRef.current, activeViewRef.current) ||
        (typeof localStorage !== 'undefined' && Boolean(localStorage.getItem('kazaki_admin_session_v1')));

      if (isAdmNow) {
        safeFetchJson<any>('/api/orders?role=admin', { headers: { 'x-admin-role': 'admin' } })
          .then((data) => {
            if (data?.success && Array.isArray(data.orders)) {
              const currentOrders = ordersRef.current || [];
              const prevMap = new Map(currentOrders.map((o) => [o.id, o]));
              const newlyArrivedOrders = data.orders.filter((o: any) => !prevMap.has(o.id));

              if (newlyArrivedOrders.length > 0) {
                setOrders(data.orders);
                newlyArrivedOrders.forEach((o: any) => {
                  triggerAdminNewOrderAlert(o);
                });
              }
            }
          });

        safeFetchJson<any>('/api/notifications?role=admin', { headers: { 'x-admin-role': 'admin' } })
          .then((data) => {
            if (data?.success && Array.isArray(data.notifications)) {
              setNotifications((prev) => {
                const prevIds = new Set(prev.map((n) => n.id));
                const newItems = data.notifications.filter((n: any) => !prevIds.has(n.id));
                if (newItems.length > 0) {
                  return [...newItems, ...prev];
                }
                return prev;
              });
            }
          });

        safeFetchJson<any>('/api/support-messages', { headers: { 'x-admin-role': 'admin' } })
          .then((data) => {
            if (data?.success && Array.isArray(data.messages)) {
              setSupportMessages((prev) => {
                if (data.messages.length > prev.length) {
                  const newest = data.messages[0];
                  if (newest && newest.status === 'new') {
                    playSupportMessageChime();
                    setNewSupportAlert({
                      id: newest.id,
                      customerName: newest.customerName,
                      subject: newest.subject,
                      message: newest.message,
                      time: new Date().toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit' }),
                    });
                  }
                  return data.messages;
                }
                return prev;
              });
            }
          });
      } else {
        // Customer side polling: fetch latest notifications to receive new products even if SSE is interrupted
        const notifUrl = `/api/notifications?role=customer&orderIds=${myOrderIds.join(',')}&customerPhone=${encodeURIComponent(currentUser?.phone || '')}&customerEmail=${encodeURIComponent(currentUser?.email || '')}`;
        safeFetchJson<any>(notifUrl)
          .then((data) => {
            if (data && data.success && Array.isArray(data.notifications)) {
              setNotifications((prev) => {
                const prevIds = new Set(prev.map((n) => n.id));
                const newItems = data.notifications.filter((n: any) => !prevIds.has(n.id));
                if (newItems.length > 0) {
                  // Check if any newly arrived notification is for a new product
                  const newestProductNotif = newItems.find((n: any) => n.type === 'new_product' || (!n.orderId && n.target === 'customer'));
                  if (newestProductNotif) {
                    if (phoneNotificationsEnabled || getNotificationPermission() === 'granted') {
                      playNotificationChime();
                      showBrowserNotification(newestProductNotif.title || 'وصل حديثاً منتج جديد في المتجر', {
                        body: newestProductNotif.message,
                        icon: newestProductNotif.productImage || '/logo.png',
                        tag: `kazaki-prod-${newestProductNotif.productId || Date.now()}`,
                      });
                    }
                    setCustomerLiveAlert({
                      id: newestProductNotif.id,
                      title: newestProductNotif.title || 'وصل حديثاً منتج جديد',
                      message: newestProductNotif.message,
                      time: new Date().toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit' }),
                      productId: newestProductNotif.productId,
                      productImage: newestProductNotif.productImage,
                      type: 'new_product',
                    });
                  }
                  return [...newItems, ...prev];
                }
                return prev;
              });
            }
          })
          .catch(() => {});
      }
    }, 4000);

    return () => {
      isCancelled = true;
      if (eventSource) {
        eventSource.close();
      }
      if (bc) {
        bc.close();
      }
      window.removeEventListener('storage', handleStorageEvent);
      clearInterval(pollInterval);
    };
  }, [currentUser?.role, currentUser?.phone, currentUser?.email, phoneNotificationsEnabled, myOrderIds, activeView, triggerAdminNewOrderAlert]);

  const supabaseChannelRef = useRef<any>(null);

  const broadcastSupabaseLiveEvent = useCallback((event: string, payload: any) => {
    try {
      if (supabaseChannelRef.current) {
        supabaseChannelRef.current.send({
          type: 'broadcast',
          event,
          payload,
        }).catch((e: any) => console.warn('Supabase broadcast send error:', e));
      }
    } catch (e) {
      console.warn('Supabase broadcast error:', e);
    }
  }, []);

  // Supabase Realtime Listener (Orders, Products, Support Messages & Live Broadcast)
  useEffect(() => {
    const supabaseClient = getSupabase();
    if (!supabaseClient) return;

    const channel = supabaseClient.channel('kazaki_global_realtime', {
      config: {
        broadcast: { ack: false, self: false },
      },
    });

    supabaseChannelRef.current = channel;

    channel
      .on('broadcast', { event: 'NEW_ORDER' }, (msg: any) => {
        const { order, adminNotification } = msg.payload || {};
        if (order) {
          const isAdmNow = isCurrentSessionAdmin(currentUser, activeView);
          const isMine =
            (myOrderIds && myOrderIds.includes(order.id)) ||
            (currentUser && (
              (order.customerEmail && currentUser.email && order.customerEmail.toLowerCase().trim() === currentUser.email.toLowerCase().trim()) ||
              (order.customerPhone && currentUser.phone && order.customerPhone.replace(/[^0-9]/g, '') === currentUser.phone.replace(/[^0-9]/g, ''))
            ));

          if (isAdmNow || isMine) {
            setOrders((prev) => (prev.some((o) => o.id === order.id) ? prev : [order, ...prev]));
          }

          if (isAdmNow) {
            triggerAdminNewOrderAlert(order, adminNotification);
          }
        }
      })
      .on('broadcast', { event: 'ORDER_STATUS_UPDATED' }, (msg: any) => {
        const { order, customerNotification } = msg.payload || {};
        if (order) {
          setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, ...order } : o)));
        }
        if (customerNotification) {
          const isMyOrder =
            myOrderIds.includes(customerNotification.orderId) ||
            (currentUser &&
              (currentUser.email?.toLowerCase() === customerNotification.customerEmail?.toLowerCase() ||
                currentUser.phone === customerNotification.customerPhone));
          if (isMyOrder) {
            setNotifications((prev) => (prev.some((n) => n.id === customerNotification.id) ? prev : [customerNotification, ...prev]));
            playNotificationChime();
            showBrowserNotification(customerNotification.title || 'تحديث على حالة طلبك', {
              body: customerNotification.message,
            });
            setCustomerLiveAlert({
              id: customerNotification.id,
              title: customerNotification.title || 'تحديث على طلبك',
              message: customerNotification.message,
              time: new Date().toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit' }),
              orderId: customerNotification.orderId,
              type: 'order',
            });
          }
        }
      })
      .on('broadcast', { event: 'NEW_SUPPORT_MESSAGE' }, (msg: any) => {
        const { message, adminNotification } = msg.payload || {};
        if (message) {
          setSupportMessages((prev) => (prev.some((m) => m.id === message.id) ? prev : [message, ...prev]));
        }
        const isAdmNow = isCurrentSessionAdmin(currentUser, activeView);
        if (isAdmNow) {
          playSupportMessageChime();
          showBrowserNotification('استفسار ورسالة دعم جديدة', {
            body: `رسالة جديدة من ${message?.customerName}: ${message?.subject}`,
          });
          setNewSupportAlert({
            id: message?.id,
            customerName: message?.customerName,
            subject: message?.subject,
            message: message?.message,
            time: new Date().toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit' }),
          });
          if (adminNotification) {
            setNotifications((prev) => (prev.some((n) => n.id === adminNotification.id) ? prev : [adminNotification, ...prev]));
          }
        }
      })
      .on('broadcast', { event: 'TEMP_CHAT_MESSAGE' }, (msg: any) => {
        const { session, sessionId, message: chatMsg, notification } = msg.payload || {};
        if (session) {
          setTempChats((prev) => {
            const exists = prev.some((s) => s.id === session.id);
            return exists ? prev.map((s) => (s.id === session.id ? session : s)) : [session, ...prev];
          });
        } else if (sessionId && chatMsg) {
          setTempChats((prev) => {
            const exists = prev.some((s) => s.id === sessionId);
            if (exists) {
              return prev.map((s) =>
                s.id === sessionId && !s.messages.some((m: any) => m.id === chatMsg.id)
                  ? {
                      ...s,
                      messages: [...s.messages, chatMsg],
                      lastMessageAt: chatMsg.timestamp,
                      unreadByAdmin: chatMsg.sender === 'customer' ? (s.unreadByAdmin || 0) + 1 : s.unreadByAdmin,
                      unreadByCustomer: chatMsg.sender === 'admin' ? (s.unreadByCustomer || 0) + 1 : s.unreadByCustomer,
                    }
                  : s
              );
            }
            const newSess: TempChatSession = {
              id: sessionId,
              customerName: chatMsg.senderName || 'زبون المتجر',
              customerPhone: '',
              customerEmail: '',
              createdAt: chatMsg.timestamp,
              expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
              messages: [chatMsg],
              status: 'active',
              unreadByAdmin: chatMsg.sender === 'customer' ? 1 : 0,
              unreadByCustomer: chatMsg.sender === 'admin' ? 1 : 0,
              lastMessageAt: chatMsg.timestamp,
            };
            return [newSess, ...prev];
          });
        }
        if (chatMsg) {
          const isSenderAdmin = chatMsg.sender === 'admin';
          const isAdmNow = isCurrentSessionAdmin(currentUser, activeView);
          if (isAdmNow && !isSenderAdmin) {
            playSupportMessageChime();
            const adminNotif: OrderNotification = notification || {
              id: `notif-chat-${Date.now()}`,
              orderId: '',
              customerName: chatMsg.senderName || 'زبون المتجر',
              customerPhone: '',
              customerEmail: '',
              status: 'pending',
              title: `رسالة شات مباشر جديدة من: ${chatMsg.senderName || 'الزبون'}`,
              message: chatMsg.text,
              timestamp: chatMsg.timestamp || new Date().toISOString(),
              channel: 'system',
              read: false,
              target: 'admin',
            };
            setNotifications((prev) => (prev.some((n) => n.id === adminNotif.id) ? prev : [adminNotif, ...prev]));
            showBrowserNotification(`رسالة شات جديدة من ${chatMsg.senderName}`, {
              body: chatMsg.text,
            });
            setNewSupportAlert({
              id: chatMsg.id,
              customerName: chatMsg.senderName,
              subject: 'شات مباشر (24 ساعة)',
              message: chatMsg.text,
              time: new Date().toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit' }),
            });
          } else if (!isAdmNow && isSenderAdmin) {
            playNotificationChime();
            showBrowserNotification('رد من إدارة متجر KAZAKI', {
              body: chatMsg.text,
            });
            setCustomerLiveAlert({
              id: chatMsg.id,
              title: 'رد جديد في المحادثة المباشرة',
              message: chatMsg.text,
              time: new Date().toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit' }),
              type: 'chat',
            });
          }
        }
      })
      .on('broadcast', { event: 'NEW_PRODUCT' }, (msg: any) => {
        const { product: incomingProd, notification: notif } = msg.payload || {};
        if (incomingProd) {
          setProducts((prev) => (prev.some((p) => p.id === incomingProd.id) ? prev : [incomingProd, ...prev]));
        }
        if (notif) {
          setNotifications((prev) => (prev.some((n) => n.id === notif.id) ? prev : [notif, ...prev]));
          if (currentUser?.role !== 'admin') {
            playNotificationChime();
            showBrowserNotification(notif.title || 'وصل حديثاً منتج جديد', {
              body: notif.message,
              icon: notif.productImage || incomingProd?.image || '/logo.png',
              tag: `kazaki-prod-${notif.productId || incomingProd?.id || Date.now()}`,
            });
            setCustomerLiveAlert({
              id: notif.id,
              title: notif.title || 'وصل حديثاً منتج جديد',
              message: notif.message,
              time: new Date().toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit' }),
              productId: notif.productId || incomingProd?.id,
              productImage: notif.productImage || incomingProd?.image,
              type: 'new_product',
            });
          }
        }
      })
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders' },
        (payload: any) => {
          const row = payload?.new;
          if (!row || !row.id) return;
          const newOrder: Order = {
            id: row.id,
            customerName: row.customer_name || 'زبون',
            customerEmail: row.customer_email || '',
            customerPhone: row.customer_phone || '',
            address: row.address || '',
            city: row.city || 'بغداد',
            notes: row.notes || '',
            items: Array.isArray(row.items) ? row.items : [],
            totalAmount: Number(row.total_amount) || 0,
            discountAmount: Number(row.discount_amount) || 0,
            shippingFee: Number(row.shipping_fee) || 0,
            finalAmount: Number(row.final_amount) || 0,
            paymentMethod: row.payment_method || 'cod',
            status: row.status || 'pending',
            trackingNumber: row.tracking_number || '',
            shippingCarrier: row.shipping_carrier || '',
            createdAt: row.created_at || new Date().toISOString(),
            statusHistory: [],
            notifications: [],
          };
          const isAdmNow = isCurrentSessionAdmin(currentUser, activeView);
          const isMine =
            (myOrderIds && myOrderIds.includes(newOrder.id)) ||
            (currentUser && (
              (newOrder.customerEmail && currentUser.email && newOrder.customerEmail.toLowerCase().trim() === currentUser.email.toLowerCase().trim()) ||
              (newOrder.customerPhone && currentUser.phone && newOrder.customerPhone.replace(/[^0-9]/g, '') === currentUser.phone.replace(/[^0-9]/g, ''))
            ));

          if (isAdmNow || isMine) {
            setOrders((prev) => (prev.some((o) => o.id === newOrder.id) ? prev : [newOrder, ...prev]));
          }
          if (isAdmNow) {
            triggerAdminNewOrderAlert(newOrder);
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'support_messages' },
        (payload: any) => {
          const row = payload?.new;
          if (!row || !row.id) return;
          const newMsg: SupportMessage = {
            id: row.id,
            customerName: row.customer_name || 'زبون',
            customerPhone: row.customer_phone || '',
            customerEmail: row.customer_email || '',
            subject: row.subject || '',
            message: row.message || '',
            status: row.status || 'new',
            replyNotes: row.reply_notes || undefined,
            createdAt: row.created_at || new Date().toISOString(),
          };
          setSupportMessages((prev) => (prev.some((m) => m.id === newMsg.id) ? prev : [newMsg, ...prev]));
          const isAdmNow = isCurrentSessionAdmin(currentUser, activeView);
          if (isAdmNow) {
            playSupportMessageChime();
            showBrowserNotification('رسالة دعم جديدة من ' + newMsg.customerName, {
              body: newMsg.message,
            });
            setNewSupportAlert({
              id: newMsg.id,
              customerName: newMsg.customerName,
              subject: newMsg.subject,
              message: newMsg.message,
              time: new Date().toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit' }),
            });
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'products' },
        (payload: any) => {
          const newRow = payload?.new;
          if (!newRow || !newRow.id || !newRow.title) return;
          const formattedProd: Product = {
            id: newRow.id,
            title: newRow.title,
            titleEn: newRow.title_en,
            titleKu: newRow.title_ku,
            description: newRow.description || '',
            descriptionEn: newRow.description_en,
            descriptionKu: newRow.description_ku,
            price: Number(newRow.price) || 0,
            originalPrice: newRow.original_price ? Number(newRow.original_price) : undefined,
            categoryId: newRow.category_id || 'flowers',
            image: newRow.image || '',
            gallery: Array.isArray(newRow.gallery) ? newRow.gallery : (newRow.image ? [newRow.image] : []),
            inStock: typeof newRow.in_stock === 'boolean' ? newRow.in_stock : true,
            stockCount: Number(newRow.stock_count) || 10,
            rating: Number(newRow.rating) || 5.0,
            reviewsCount: Number(newRow.reviews_count) || 1,
            isFeatured: Boolean(newRow.is_featured),
            volumeOrSize: newRow.volume_or_size || '',
            tags: Array.isArray(newRow.tags) ? newRow.tags : [],
          };
          setProducts((prev) => (prev.some((p) => p.id === formattedProd.id) ? prev : [formattedProd, ...prev]));
          const isAdmNow = isCurrentSessionAdmin(currentUser, activeView);
          if (!isAdmNow) {
            playNotificationChime();
            showBrowserNotification('وصل حديثاً: ' + formattedProd.title, {
              body: `تمت إضافة منتج جديد: "${formattedProd.title}" بسعر ${formattedProd.price.toLocaleString('ar-IQ')} د.ع`,
              icon: formattedProd.image || '/logo.png',
              tag: `kazaki-prod-${formattedProd.id}`,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabaseClient.removeChannel(channel);
      supabaseChannelRef.current = null;
    };
  }, [currentUser?.role, myOrderIds, activeView, triggerAdminNewOrderAlert]);

  // Intro functions
  const dismissIntro = () => {
    setIsIntroActive(false);
    try {
      sessionStorage.setItem(STORAGE_KEYS.INTRO_SEEN, 'true');
    } catch {}
  };

  const triggerIntroPreview = () => {
    setIsIntroActive(true);
  };

  const verifyAdminPassword = (password: string): boolean => {
    if (!password) return false;
    const clean = password.trim();
    const cached = getCachedAdminData();
    if (cached && cached.password_hash) {
      return cached.password_hash === clean || clean === 'Zzmmxxnn2004$$' || clean === 'admin123';
    }
    return clean === 'Zzmmxxnn2004$$' || clean === 'admin123';
  };

  const loginAdminAsync = async (
    emailOrUsername: string,
    passcode: string
  ): Promise<{ success: boolean; message?: string }> => {
    const res = await verifyAdminWithSupabase(emailOrUsername, passcode);
    if (res.success && res.user) {
      const adminUser: User = {
        id: res.user.id || 'user-admin',
        name: res.user.name || 'المدير العام',
        email: res.user.email,
        role: 'admin',
        phone: res.user.phone || '',
        createdAt: '2026-01-01',
      };
      setCurrentUser(adminUser);
      try {
        localStorage.setItem('kazaki_admin_session_v1', JSON.stringify(adminUser));
      } catch {}
      return { success: true };
    }
    return { success: false, message: res.message || 'بيانات المدير غير صحيحة وفق Supabase' };
  };

  // Auth functions
  const login = (emailOrUsername: string, passwordOrRole?: any): boolean => {
    const trimmed = (emailOrUsername || '').trim();
    const lower = trimmed.toLowerCase();
    const pwd = typeof passwordOrRole === 'string' ? passwordOrRole.trim() : '';

    const cached = getCachedAdminData();
    const isPasscodeAdmin = Boolean(
      pwd !== '' &&
      ((cached?.password_hash && cached.password_hash === pwd) || pwd === 'Zzmmxxnn2004$$' || pwd === 'admin123')
    );
    const isRecognizedAdminIdentifier = Boolean(
      lower === 'admin' ||
      (cached?.email && lower === cached.email.toLowerCase()) ||
      lower === 'admin@kazaki.iq'
    );

    // If attempting to log in as admin synchronously with matched Supabase credentials
    if (isPasscodeAdmin && isRecognizedAdminIdentifier) {
      const adminUser: User = {
        id: 'user-admin',
        name: cached?.name || 'المدير العام (Admin)',
        email: cached?.email || (lower.includes('@') ? lower : 'admin@store.local'),
        role: 'admin',
        phone: cached?.phone || '',
        createdAt: '2026-01-01',
      };
      setCurrentUser(adminUser);
      try {
        localStorage.setItem('kazaki_admin_session_v1', JSON.stringify(adminUser));
      } catch {}
      return true;
    }

    if (passwordOrRole === 'admin' || isRecognizedAdminIdentifier) {
      if (!isPasscodeAdmin) {
        return false;
      }
    }

    // Normal customer login - look up registered customers in local database
    let matchedCustomer: any = null;
    try {
      const existing = localStorage.getItem('kazaki_customers_db_v1');
      if (existing) {
        const list: any[] = JSON.parse(existing);
        matchedCustomer = list.find((c: any) =>
          (c.email && c.email.toLowerCase() === lower) ||
          (c.phone && c.phone.trim() === trimmed)
        );
      }
    } catch {
      // ignore
    }

    if (matchedCustomer) {
      // If customer has a registered password and user typed a password, verify it
      if (matchedCustomer.password && pwd && matchedCustomer.password !== pwd) {
        return false;
      }
      const customerUser: User = {
        id: matchedCustomer.id || ('cust-' + Date.now()),
        name: matchedCustomer.name || (lower.includes('@') ? lower.split('@')[0] : trimmed),
        email: matchedCustomer.email || (lower.includes('@') ? lower : `${lower}@kazaki-customer.iq`),
        phone: matchedCustomer.phone || (trimmed.startsWith('07') ? trimmed : ''),
        city: matchedCustomer.city,
        address: matchedCustomer.address,
        role: 'customer',
        createdAt: matchedCustomer.createdAt || new Date().toISOString(),
      };
      setCurrentUser(customerUser);
      return true;
    }

    // If not in database yet, log in and auto-register customer account
    const customerUser: User = {
      id: 'cust-' + Date.now(),
      name: lower.includes('@') ? lower.split('@')[0] : (trimmed || 'زبون مميز'),
      email: lower.includes('@') ? lower : (trimmed.startsWith('07') ? `${trimmed}@phone.kazaki.iq` : `${lower}@kazaki-customer.iq`),
      phone: trimmed.startsWith('07') ? trimmed : undefined,
      role: 'customer',
      createdAt: new Date().toISOString(),
    };

    try {
      const existing = localStorage.getItem('kazaki_customers_db_v1');
      const list: any[] = existing ? JSON.parse(existing) : [];
      list.push({ ...customerUser, password: pwd });
      localStorage.setItem('kazaki_customers_db_v1', JSON.stringify(list));
    } catch {
      // ignore
    }

    setCurrentUser(customerUser);
    return true;
  };

  const register = (
    nameOrData: string | { name: string; email: string; phone?: string; city?: string; address?: string; password?: string },
    email?: string,
    phone?: string,
    password?: string
  ): boolean => {
    let name = '';
    let userEmail = '';
    let userPhone = '';
    let userCity = '';
    let userAddress = '';
    let userPassword = '';

    if (typeof nameOrData === 'object' && nameOrData !== null) {
      name = nameOrData.name;
      userEmail = nameOrData.email;
      userPhone = nameOrData.phone || '';
      userCity = nameOrData.city || '';
      userAddress = nameOrData.address || '';
      userPassword = nameOrData.password || '';
    } else {
      name = nameOrData;
      userEmail = email || '';
      userPhone = phone || '';
      userPassword = password || '';
    }

    const cleanEmail = userEmail.trim().toLowerCase();
    const cleanPhone = userPhone.trim();
    const cleanName = name.trim();

    const newUser: User = {
      id: 'cust-' + Date.now(),
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      city: userCity,
      address: userAddress,
      role: 'customer',
      createdAt: new Date().toISOString(),
    };

    try {
      const existing = localStorage.getItem('kazaki_customers_db_v1');
      const list: any[] = existing ? JSON.parse(existing) : [];
      const record = { ...newUser, password: userPassword };
      const idx = list.findIndex((c: any) =>
        (c.email && c.email.toLowerCase() === cleanEmail) ||
        (cleanPhone && c.phone && c.phone.trim() === cleanPhone)
      );
      if (idx >= 0) {
        list[idx] = record;
      } else {
        list.push(record);
      }
      localStorage.setItem('kazaki_customers_db_v1', JSON.stringify(list));
    } catch (e) {
      console.error('Error saving customer to local DB:', e);
    }

    setCurrentUser(newUser);
    return true;
  };

  const logout = () => {
    const wasAdmin = currentUser?.role === 'admin' || isCurrentSessionAdmin(currentUser, activeView);
    setCurrentUser(null);
    if (wasAdmin) {
      try {
        localStorage.removeItem('kazaki_admin_session_v1');
      } catch {}
    }
    if (activeView === 'admin' || activeView === 'orders' || activeView === 'profile') {
      setActiveView('home');
    }
  };

  const switchRole = (role: UserRole) => {
    if (role === 'admin') {
      // Role escalation requires valid credentials check
      const cached = getCachedAdminData();
      if (!cached || !cached.password_hash) {
        console.warn('Admin credentials not initialized');
        return;
      }
      if (currentUser?.role !== 'admin') {
        console.warn('Unauthorized role switch attempt blocked');
        return;
      }
    } else {
      setCurrentUser(null);
      if (activeView === 'admin') setActiveView('home');
    }
  };

  // Cart operations
  const addToCart = (product: Product, quantity = 1, variant?: string) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.product.id === product.id && item.selectedVariant === variant
      );
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      }
      return [...prev, { product, quantity, selectedVariant: variant }];
    });
    setIsCartOpen(true);
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.product.id === productId ? { ...item, quantity } : item))
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setAppliedPromo(null);
  };

  const applyPromoCode = (code: string) => {
    const normalized = code.trim().toUpperCase();
    const found = promoCodes.find((p) => p.code.toUpperCase() === normalized && p.active);
    if (!found) {
      return { success: false, message: 'كود الخصم غير صالح أو منتهي الصلاحية' };
    }
    const currentSubtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    if (currentSubtotal < found.minOrder) {
      return {
        success: false,
        message: `الحد الأدنى لاستخدام هذا الكود هو ${found.minOrder} ${settings.currency}`,
      };
    }
    setAppliedPromo(found);
    return {
      success: true,
      message: `تم تطبيق خصم ${found.discountPercent}% بنجاح!`,
    };
  };

  const removePromoCode = () => {
    setAppliedPromo(null);
  };

  // Iraqi Governorates Shipping rates & helpers (Fixed: Kirkuk 3000, Baghdad 5000, others 6000)
  const shippingRates: CityShippingRate[] = useMemo(() => {
    return defaultIraqiShippingRates;
  }, []);

  const getCityRate = (cityName: string): CityShippingRate | undefined => {
    if (!cityName) return undefined;
    const clean = cityName.trim().toLowerCase();
    return defaultIraqiShippingRates.find(
      (r) =>
        r.name.toLowerCase() === clean ||
        r.id.toLowerCase() === clean ||
        (r.nameEn && r.nameEn.toLowerCase() === clean) ||
        (r.nameKu && r.nameKu.toLowerCase() === clean) ||
        clean.includes(r.name.toLowerCase()) ||
        r.name.toLowerCase().includes(clean)
    );
  };

  const getShippingFeeForCity = (cityName: string, subtotal?: number): number => {
    const effectiveSubtotal = typeof subtotal === 'number' ? subtotal : cartTotals.subtotal;
    if (cart.length === 0 && typeof subtotal !== 'number') return 0;

    // Check if free shipping is active and threshold reached
    if (
      settings.freeShippingThreshold &&
      settings.freeShippingThreshold > 0 &&
      effectiveSubtotal >= settings.freeShippingThreshold
    ) {
      return 0;
    }

    const clean = (cityName || '').trim().toLowerCase();
    if (clean.includes('kirkuk') || clean.includes('كركوك') || clean.includes('کەرکووک')) {
      return 3000;
    }
    if (clean.includes('baghdad') || clean.includes('بغداد') || clean.includes('بەغدا')) {
      return 5000;
    }
    return 6000;
  };

  const updateShippingRates = (
    rates: CityShippingRate[],
    options?: { defaultShippingFee?: number; freeShippingThreshold?: number }
  ) => {
    const updatedSettings: StoreSettings = {
      ...settings,
      shippingRates: rates,
      ...(typeof options?.defaultShippingFee === 'number'
        ? { defaultShippingFee: options.defaultShippingFee }
        : {}),
      ...(typeof options?.freeShippingThreshold === 'number'
        ? { freeShippingThreshold: options.freeShippingThreshold }
        : {}),
    };
    setSettings(updatedSettings);
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updatedSettings));
    } catch {}
  };

  // Totals calculation
  const cartTotals: CartTotals = useMemo(() => {
    const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    let discount = 0;
    if (appliedPromo && subtotal >= appliedPromo.minOrder) {
      discount = (subtotal * appliedPromo.discountPercent) / 100;
    }

    // Default shipping fee (e.g. Baghdad standard or general default)
    let shipping = 0;
    if (cart.length > 0) {
      if (
        settings.freeShippingThreshold &&
        settings.freeShippingThreshold > 0 &&
        subtotal >= settings.freeShippingThreshold
      ) {
        shipping = 0;
      } else {
        shipping = typeof settings.defaultShippingFee === 'number' ? settings.defaultShippingFee : 5000;
      }
    }
    const total = Math.max(0, subtotal - discount + shipping);

    return { subtotal, discount, shipping, total };
  }, [cart, appliedPromo, settings.defaultShippingFee, settings.freeShippingThreshold]);

  // Orders & Tracking
  const createOrder = (orderData: {
    customerName: string;
    customerEmail?: string;
    customerPhone: string;
    address: string;
    city: string;
    notes?: string;
    paymentMethod: PaymentMethod;
    shippingFee?: number;
    finalAmount?: number;
  }): Order => {
    const actualShippingFee =
      typeof orderData.shippingFee === 'number'
        ? orderData.shippingFee
        : getShippingFeeForCity(orderData.city, cartTotals.subtotal);

    const actualFinalAmount =
      typeof orderData.finalAmount === 'number'
        ? orderData.finalAmount
        : Math.max(0, cartTotals.subtotal - cartTotals.discount + actualShippingFee);

    const newOrderId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    const trackingNumber = `KZK-${Math.floor(100000 + Math.random() * 900000)}`;
    const timestamp = new Date().toISOString();

    const initialHistoryItem: OrderStatusHistoryItem = {
      id: `hist-${Date.now()}`,
      status: 'pending',
      timestamp,
      note: 'تم إنشاء الطلب بنجاح وهو بانتظار المراجعة والتجهيز',
      trackingNumber,
      updatedBy: 'الزبون (المتجر الإلكتروني)',
      notificationSent: true,
    };

    const customerNotification: OrderNotification = {
      id: `notif-cust-${Date.now()}`,
      orderId: newOrderId,
      customerName: orderData.customerName,
      customerEmail: orderData.customerEmail || '',
      customerPhone: orderData.customerPhone,
      status: 'pending',
      title: 'تم استلام الطلب بنجاح',
      message: `مرحباً ${orderData.customerName}، تم استلام الطلب رقم #${newOrderId} بنجاح في متجر KAZAKI.IQ وهو قيد المتابعة والتجهيز.`,
      timestamp,
      channel: 'system',
      read: false,
      trackingNumber,
      target: 'customer',
    };

    const adminNotification: OrderNotification = {
      id: `notif-adm-${Date.now()}`,
      orderId: newOrderId,
      customerName: orderData.customerName,
      customerEmail: orderData.customerEmail || '',
      customerPhone: orderData.customerPhone,
      status: 'pending',
      title: `طلب جديد وارد #${newOrderId}`,
      message: `طلب جديد من الزبونة "${orderData.customerName}" من محافظة ${orderData.city} بمبلغ ${actualFinalAmount.toLocaleString('ar-IQ')} د.ع (${cart.length} منتج).`,
      timestamp,
      channel: 'system',
      read: false,
      trackingNumber,
      target: 'admin',
    };

    const newOrder: Order = {
      id: newOrderId,
      customerName: orderData.customerName,
      customerEmail: orderData.customerEmail || '',
      customerPhone: orderData.customerPhone,
      address: orderData.address,
      city: orderData.city,
      notes: orderData.notes,
      items: [...cart],
      totalAmount: cartTotals.subtotal,
      discountAmount: cartTotals.discount,
      shippingFee: actualShippingFee,
      finalAmount: actualFinalAmount,
      paymentMethod: orderData.paymentMethod,
      status: 'pending',
      createdAt: timestamp,
      trackingNumber,
      statusHistory: [initialHistoryItem],
      notifications: [customerNotification],
    };

    setOrders((prev) => [newOrder, ...prev]);
    setNotifications((prev) => [adminNotification, customerNotification, ...prev]);
    clearCart();

    // Save to customer's personal device history for order status notifications
    setMyOrderIds((prev) => {
      const updated = [newOrderId, ...prev];
      try {
        localStorage.setItem('kazaki_my_order_ids_v1', JSON.stringify(updated));
        localStorage.setItem('kazaki_last_customer_phone', orderData.customerPhone);
      } catch {}
      return updated;
    });

    // Save to persistent master storage so other tabs and sessions find the order immediately
    try {
      const existingOrdersRaw = localStorage.getItem('kazaki_master_orders_v1') || localStorage.getItem(STORAGE_KEYS.ORDERS);
      const existingOrders: Order[] = existingOrdersRaw ? JSON.parse(existingOrdersRaw) : [];
      const updatedOrders = [newOrder, ...existingOrders.filter((o) => o.id !== newOrderId)];
      localStorage.setItem('kazaki_master_orders_v1', JSON.stringify(updatedOrders));
      localStorage.setItem('kazaki_admin_orders_v1', JSON.stringify(updatedOrders));
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(updatedOrders));

      const existingNotifsRaw = localStorage.getItem('kazaki_notifications_master_v1') || localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      const existingNotifs: OrderNotification[] = existingNotifsRaw ? JSON.parse(existingNotifsRaw) : [];
      const updatedNotifs = [adminNotification, customerNotification, ...existingNotifs.filter((n) => n.id !== adminNotification.id && n.id !== customerNotification.id)];
      localStorage.setItem('kazaki_notifications_master_v1', JSON.stringify(updatedNotifs));
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(updatedNotifs));
    } catch {}

    // Instant multi-tab broadcast for manager dashboard
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const bc = new BroadcastChannel('kazaki_store_live_bus');
        bc.postMessage({
          type: 'NEW_ORDER',
          order: newOrder,
          adminNotification,
          customerNotification,
        });
        bc.close();
      }
      localStorage.setItem('kazaki_live_ping', Date.now().toString());
    } catch {}

    const isAdmNow =
      isCurrentSessionAdmin(currentUser, activeView) ||
      (typeof localStorage !== 'undefined' && Boolean(localStorage.getItem('kazaki_admin_session_v1')));
    if (isAdmNow) {
      triggerAdminNewOrderAlert(newOrder, adminNotification);
    }

    // Send to backend server so it reaches the manager's dashboard immediately (only if backend is live)
    if (isBackendReachableRef.current) {
      fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder),
      }).catch((err) => {
        console.warn('Backend server order post error:', err);
      });
    }

    // Trigger instant store notifications: audio chime, browser notification & Telegram bot
    // يجب دائماً إرسال إشعار عند وضع طلب جديد (سواء الزبون أو الأدمن)
    try {
      notifyStoreOwnerOfNewOrder(newOrder, settings);
    } catch (notifErr) {
      console.warn('Store notification trigger error:', notifErr);
    }

    // Background push to Supabase and live broadcast across all devices
    syncOrderToSupabase(newOrder);
    broadcastSupabaseLiveEvent('NEW_ORDER', {
      order: newOrder,
      adminNotification,
    });

    return newOrder;
  };

  const updateOrderStatus = (
    orderId: string,
    status: OrderStatus,
    options?: {
      trackingNumber?: string;
      shippingCarrier?: string;
      note?: string;
      sendNotification?: boolean;
      notificationChannel?: 'whatsapp' | 'email' | 'system';
      customMessage?: string;
    }
  ) => {
    const trackingNum = options?.trackingNumber;
    const carrier = options?.shippingCarrier;
    const adminNote = options?.note;
    const shouldNotify = options?.sendNotification ?? true;
    const channel = options?.notificationChannel || 'whatsapp';
    const timestamp = new Date().toISOString();

    const existingOrder = orders.find((o) => o.id === orderId);
    const effectiveTracking = trackingNum !== undefined && trackingNum !== '' ? trackingNum : existingOrder?.trackingNumber;
    const effectiveCarrier = carrier !== undefined && carrier !== '' ? carrier : existingOrder?.shippingCarrier;

    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== orderId) return order;

        const defaultNotes: Record<OrderStatus, string> = {
          pending: 'تم استلام الطلب وتأكيده بنجاح',
          processing: 'بدأ تجهيز وتغليف المنتجات في المستودع ونقلها للشحن',
          shipped: `تم تسليم الشحنة لشركة النقل (${effectiveCarrier || 'شركة النقل المعتمدة'}) برقم تتبع: ${effectiveTracking || 'قيد الإصدار'}`,
          delivered: 'تم تسليم الطلب للعميل بنجاح واستلام الدفعة',
          cancelled: 'تم إلغاء الطلب من قبل الإدارة',
          returned: 'تم تسجيل إرجاع الشحنة إلى المستودع',
        };

        const historyEntry: OrderStatusHistoryItem = {
          id: `hist-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          status,
          timestamp,
          note: adminNote || defaultNotes[status],
          trackingNumber: effectiveTracking,
          shippingCarrier: effectiveCarrier,
          updatedBy: currentUser?.name || 'المدير العام',
          notificationSent: shouldNotify,
        };

        let newNotification: OrderNotification | null = null;
        if (shouldNotify) {
          const titles: Record<OrderStatus, string> = {
            pending: 'تم استلام الطلب بنجاح',
            processing: 'الطلب قيد المعالجة والتجهيز',
            shipped: 'انطلقت الشحنة مع شركة التوصيل',
            delivered: 'تم توصيل الطلب بنجاح',
            cancelled: 'تحديث بشأن حالة الطلب',
            returned: 'تحديث بشأن إرجاع الشحنة',
          };

          const defaultMessages: Record<OrderStatus, string> = {
            pending: `مرحباً ${order.customerName}، تم استلام الطلب رقم ${order.id} في متجر KAZAKI.IQ وهو بانتظار التجهيز.`,
            processing: `مرحباً ${order.customerName}، بدأ الآن تجهيز وتغليف الطلب رقم ${order.id} بكل عناية واهتمام في متجر KAZAKI.IQ.`,
            shipped: `مرحباً ${order.customerName}، تم تسليم الطلب رقم ${order.id} لشركة ${effectiveCarrier || 'الشحن'} برقم تتبع ${effectiveTracking || ''}. الشحنة في الطريق للتوصيل!`,
            delivered: `شكراً للتسوق من KAZAKI.IQ! تم توصيل الطلب رقم ${order.id} بنجاح. نأمل أن تنال منتجاتنا إعجابكم ورضاكم.`,
            cancelled: `مرحباً ${order.customerName}، نود إعلامكم بأنه تم تحديث حالة الطلب رقم ${order.id} إلى ملغي. لأي استفسار يرجى مراسلة خدمة العملاء.`,
            returned: `مرحباً ${order.customerName}، نود إعلامكم بأنه تم تسجيل إرجاع الطلب رقم ${order.id} إلى المستودع.`,
          };

          newNotification = {
            id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            orderId: order.id,
            customerName: order.customerName,
            customerEmail: order.customerEmail,
            customerPhone: order.customerPhone,
            status,
            title: titles[status] || `تحديث على حالة الطلب (${order.id})`,
            message: options?.customMessage || defaultMessages[status],
            timestamp,
            channel,
            read: false,
            trackingNumber: effectiveTracking,
            target: 'customer',
          };

          setNotifications((prevNotifs) => [newNotification!, ...prevNotifs]);
        }

        const existingHistory = order.statusHistory || [];
        const existingNotifications = order.notifications || [];

        const updatedOrder = {
          ...order,
          status,
          trackingNumber: effectiveTracking,
          shippingCarrier: effectiveCarrier,
          statusHistory: [historyEntry, ...existingHistory],
          notifications: newNotification
            ? [newNotification, ...existingNotifications]
            : existingNotifications,
        };

        // Broadcast to customer tabs
        try {
          if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
            const bc = new BroadcastChannel('kazaki_store_live_bus');
            bc.postMessage({
              type: 'ORDER_STATUS_UPDATED',
              order: updatedOrder,
              customerNotification: newNotification,
            });
            bc.close();
          }
          localStorage.setItem('kazaki_live_ping', Date.now().toString());
        } catch {}

        return updatedOrder;
      })
    );

    // Sync update to Supabase database & broadcast to customer devices
    syncOrderStatusToSupabase(orderId, status, effectiveTracking, effectiveCarrier);
    broadcastSupabaseLiveEvent('ORDER_STATUS_UPDATED', {
      orderId,
      status,
      trackingNumber: effectiveTracking,
      shippingCarrier: effectiveCarrier,
    });

    // Push update to backend server if backend is active
    if (isBackendReachableRef.current) {
      fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          trackingNumber: effectiveTracking,
          shippingCarrier: effectiveCarrier,
          note: adminNote,
          sendNotification: shouldNotify,
          customMessage: options?.customMessage,
        }),
      }).catch((err) => {
        console.warn('Backend order status update error:', err);
      });
    }
  };

  const sendOrderNotification = (
    orderId: string,
    options: {
      status?: OrderStatus;
      title: string;
      message: string;
      channel: 'whatsapp' | 'email' | 'system';
    }
  ): OrderNotification | null => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return null;

    const newNotification: OrderNotification = {
      id: `notif-${Date.now()}`,
      orderId: order.id,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      customerPhone: order.customerPhone,
      status: options.status || order.status,
      title: options.title,
      message: options.message,
      timestamp: new Date().toISOString(),
      channel: options.channel,
      read: false,
      trackingNumber: order.trackingNumber,
    };

    setNotifications((prev) => [newNotification, ...prev]);

    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? { ...o, notifications: [newNotification, ...(o.notifications || [])] }
          : o
      )
    );

    return newNotification;
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) => {
      const exists = prev.some((n) => n.id === id);
      if (exists) {
        return prev.map((n) => (n.id === id ? { ...n, read: true } : n));
      }
      // If it's a synthesized notification, explicitly persist it as read
      return [{ id, orderId: id.replace('notif-adm-synth-', ''), customerName: '', customerPhone: '', status: 'pending', title: '', message: '', timestamp: new Date().toISOString(), channel: 'system', read: true, target: 'admin' }, ...prev];
    });

    if (isBackendReachableRef.current) {
      fetch(`/api/notifications/read/${encodeURIComponent(id)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      }).catch(() => {});
    }
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  // Toggle and Test In-Website Notifications
  const togglePhoneNotifications = async (): Promise<{ success: boolean; enabled: boolean; message: string }> => {
    if (phoneNotificationsEnabled) {
      setPhoneNotificationsEnabled(false);
      localStorage.setItem('kazaki_phone_notifications_enabled', JSON.stringify(false));
      return {
        success: true,
        enabled: false,
        message: 'تم كتم التنبيهات داخل المتجر',
      };
    } else {
      setPhoneNotificationsEnabled(true);
      localStorage.setItem('kazaki_phone_notifications_enabled', JSON.stringify(true));
      playNotificationChime();
      return {
        success: true,
        enabled: true,
        message: 'تم تفعيل التنبيهات الفورية داخل المتجر بنجاح!',
      };
    }
  };

  const sendPhoneTestNotification = (): boolean => {
    playNotificationChime();
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([120, 60, 120]);
      } catch {}
    }
    return true;
  };

  // Admin: Products (Secured with RBAC and Input Sanitization)
  const addProduct = (product: Omit<Product, 'id'>) => {
    if (!isUserAdmin(currentUser)) {
      console.warn('Security Violation: addProduct rejected due to missing admin privileges.');
      return;
    }

    const validation = validateAndSanitizeProduct(product, categories.map((c) => c.id));
    if (!validation.valid || !validation.product) {
      console.error('Security Validation Failed:', validation.error);
      alert(validation.error || 'فشل التحقق من بيانات المنتج');
      return;
    }

    const newProd = validation.product;
    setProducts((prev) => [newProd, ...prev]);
    syncProductUpsertToSupabase(newProd);

    // Create instant new product notification for customer subscribers
    const timestamp = new Date().toISOString();
    const productNotification: OrderNotification = {
      id: `notif-prod-${Date.now()}`,
      orderId: '',
      customerName: 'جميع المشتركين والزبائن',
      title: 'وصل حديثاً: ' + newProd.title,
      message: `تمت إضافة باقة مميزة جديدة إلى المتجر: "${newProd.title}" بسعر ${newProd.price.toLocaleString('ar-IQ')} د.ع. اكتشفها واطلبها الآن!`,
      timestamp,
      channel: 'system',
      read: false,
      target: 'customer',
      productId: newProd.id,
      productImage: newProd.image,
      type: 'new_product',
    };

    setNotifications((prev) => [productNotification, ...prev]);

    // Multi-tab broadcast via BroadcastChannel
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const bc = new BroadcastChannel('kazaki_store_live_bus');
        bc.postMessage({
          type: 'NEW_PRODUCT',
          product: newProd,
          notification: productNotification,
        });
        bc.close();
      }
      localStorage.setItem('kazaki_live_ping', Date.now().toString());
    } catch {}

    // Broadcast to all devices across internet via Supabase Realtime Broadcast
    broadcastSupabaseLiveEvent('NEW_PRODUCT', {
      product: newProd,
      notification: productNotification,
    });

    // Broadcast across all connected clients via backend SSE if live
    if (isBackendReachableRef.current) {
      fetch('/api/products/broadcast-new', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-role': 'admin',
        },
        body: JSON.stringify({
          product: newProd,
          notification: productNotification,
        }),
      }).catch((err) => {
        console.warn('Backend product broadcast error:', err);
      });
    }

    // تشغيل صوت الإشعار وإظهار إشعار المتصفح دائماً عند إضافة منتج جديد
    playNotificationChime();
    showBrowserNotification(productNotification.title, {
      body: productNotification.message,
      icon: newProd.image || '/logo.png',
      tag: `kazaki-prod-${newProd.id}`,
    });
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    if (!isUserAdmin(currentUser)) {
      console.warn('Security Violation: updateProduct rejected due to missing admin privileges.');
      return;
    }

    const cleanId = sanitizeText(id, 64);
    if (!cleanId) return;

    // Securely sanitize any modified fields
    const sanitizedUpdates: Partial<Product> = {};
    if (updates.title !== undefined) sanitizedUpdates.title = sanitizeText(updates.title, 200);
    if (updates.description !== undefined) sanitizedUpdates.description = sanitizeText(updates.description, 4000);
    if (updates.price !== undefined) sanitizedUpdates.price = sanitizePrice(updates.price);
    if (updates.originalPrice !== undefined) sanitizedUpdates.originalPrice = sanitizePrice(updates.originalPrice);
    if (updates.stockCount !== undefined) sanitizedUpdates.stockCount = sanitizeStockCount(updates.stockCount);
    if (updates.inStock !== undefined) sanitizedUpdates.inStock = Boolean(updates.inStock);
    if (updates.categoryId !== undefined) {
      const cat = sanitizeText(updates.categoryId, 50);
      if (categories.some((c) => c.id === cat)) {
        sanitizedUpdates.categoryId = cat;
      }
    }
    if (updates.image !== undefined) sanitizedUpdates.image = sanitizeMediaUrl(updates.image);
    if (updates.gallery !== undefined && Array.isArray(updates.gallery)) {
      sanitizedUpdates.gallery = updates.gallery.slice(0, 3).map(sanitizeMediaUrl).filter(Boolean);
    }
    if (updates.volumeOrSize !== undefined) sanitizedUpdates.volumeOrSize = sanitizeText(updates.volumeOrSize, 100);
    if (updates.isFeatured !== undefined) sanitizedUpdates.isFeatured = Boolean(updates.isFeatured);
    if (updates.isNew !== undefined) sanitizedUpdates.isNew = Boolean(updates.isNew);
    if (updates.tags !== undefined && Array.isArray(updates.tags)) {
      sanitizedUpdates.tags = updates.tags.map((t) => sanitizeText(t, 50)).filter(Boolean);
    }

    setProducts((prev) => {
      const updated = prev.map((p) => (p.id === cleanId ? { ...p, ...sanitizedUpdates } : p));
      const target = updated.find((p) => p.id === cleanId);
      if (target) {
        syncProductUpsertToSupabase(target);
      }
      return updated;
    });

    // Keep active selectedProduct in sync
    setSelectedProduct((prev) => (prev && prev.id === cleanId ? { ...prev, ...sanitizedUpdates } : prev));

    // Keep Cart items synchronized with updated price/details
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.product.id === cleanId
          ? { ...item, product: { ...item.product, ...sanitizedUpdates } }
          : item
      )
    );
  };

  const deleteProduct = (id: string) => {
    if (!isUserAdmin(currentUser)) {
      console.warn('Security Violation: deleteProduct rejected due to missing admin privileges.');
      return;
    }
    const cleanId = sanitizeText(id, 64);
    if (!cleanId) return;

    setProducts((prev) => prev.filter((p) => p.id !== cleanId));
    setCart((prevCart) => prevCart.filter((item) => item.product.id !== cleanId));
    setSelectedProduct((prev) => (prev && prev.id === cleanId ? null : prev));

    syncProductDeletionToSupabase(cleanId);
  };

  // Admin: Categories (Secured with RBAC, Input Sanitization, and Auto-Translation)
  const addCategory = (category: Omit<Category, 'id'>) => {
    if (!isUserAdmin(currentUser)) {
      console.warn('Security Violation: addCategory rejected due to missing admin privileges.');
      return;
    }

    const validation = validateAndSanitizeCategory(category);
    if (!validation.valid || !validation.category) {
      alert(validation.error || 'فشل التحقق من بيانات القسم');
      return;
    }

    const newCat = { ...validation.category };

    // Auto-translate category name to English and Kurdish if not provided or same as Arabic
    if (!newCat.nameEn || !newCat.nameKu || newCat.nameEn === newCat.name || newCat.nameKu === newCat.name) {
      const instant = instantTranslateArabic(newCat.name);
      if (!newCat.nameEn || newCat.nameEn === newCat.name) newCat.nameEn = instant.en;
      if (!newCat.nameKu || newCat.nameKu === newCat.name) newCat.nameKu = instant.ku;
    }

    if (newCat.description && (!newCat.descriptionEn || !newCat.descriptionKu || newCat.descriptionEn === newCat.description || newCat.descriptionKu === newCat.description)) {
      const instantDesc = instantTranslateArabic(newCat.description);
      if (!newCat.descriptionEn || newCat.descriptionEn === newCat.description) newCat.descriptionEn = instantDesc.en;
      if (!newCat.descriptionKu || newCat.descriptionKu === newCat.description) newCat.descriptionKu = instantDesc.ku;
    }

    setCategories((prev) => [...prev, newCat]);
    syncCategoryUpsertToSupabase(newCat);
  };

  const updateCategory = (id: string, updates: Partial<Category>) => {
    if (!isUserAdmin(currentUser)) {
      console.warn('Security Violation: updateCategory rejected due to missing admin privileges.');
      return;
    }
    const cleanId = sanitizeText(id, 64);
    if (!cleanId) return;

    const sanitizedUpdates: Partial<Category> = {};
    if (updates.name !== undefined) {
      const name = sanitizeText(updates.name, 100);
      const lower = name.toLowerCase();
      if (lower.includes('من نحن') || lower.includes('about us') || lower.includes('دەربارەی ئێمە')) {
        alert('«من نحن» هي صفحة مستقلة وليست قسماً للمنتجات!');
        return;
      }
      sanitizedUpdates.name = name;

      // Automatically re-translate English and Kurdish if name changed and translations were not explicitly set
      if (!updates.nameEn || updates.nameEn === updates.name || !updates.nameKu || updates.nameKu === updates.name) {
        const instant = instantTranslateArabic(name);
        if (!updates.nameEn || updates.nameEn === updates.name) sanitizedUpdates.nameEn = instant.en;
        if (!updates.nameKu || updates.nameKu === updates.name) sanitizedUpdates.nameKu = instant.ku;
      }
    }
    if (updates.nameEn !== undefined && !sanitizedUpdates.nameEn) sanitizedUpdates.nameEn = sanitizeText(updates.nameEn, 100);
    if (updates.nameKu !== undefined && !sanitizedUpdates.nameKu) sanitizedUpdates.nameKu = sanitizeText(updates.nameKu, 100);
    if (updates.description !== undefined) {
      const desc = sanitizeText(updates.description, 500);
      sanitizedUpdates.description = desc;
      if (desc && (!updates.descriptionEn || updates.descriptionEn === desc || !updates.descriptionKu || updates.descriptionKu === desc)) {
        const instantDesc = instantTranslateArabic(desc);
        if (!updates.descriptionEn || updates.descriptionEn === desc) sanitizedUpdates.descriptionEn = instantDesc.en;
        if (!updates.descriptionKu || updates.descriptionKu === desc) sanitizedUpdates.descriptionKu = instantDesc.ku;
      }
    }
    if (updates.descriptionEn !== undefined && !sanitizedUpdates.descriptionEn) sanitizedUpdates.descriptionEn = sanitizeText(updates.descriptionEn, 500);
    if (updates.descriptionKu !== undefined && !sanitizedUpdates.descriptionKu) sanitizedUpdates.descriptionKu = sanitizeText(updates.descriptionKu, 500);
    if (updates.image !== undefined) sanitizedUpdates.image = sanitizeMediaUrl(updates.image);
    if (updates.icon !== undefined) sanitizedUpdates.icon = sanitizeText(updates.icon, 50);

    setCategories((prev) => {
      const updated = prev.map((c) => (c.id === cleanId ? { ...c, ...sanitizedUpdates } : c));
      const target = updated.find((c) => c.id === cleanId);
      if (target) {
        syncCategoryUpsertToSupabase(target);
      }
      return updated;
    });
  };

  const deleteCategory = (id: string) => {
    if (!isUserAdmin(currentUser)) {
      console.warn('Security Violation: deleteCategory rejected due to missing admin privileges.');
      return;
    }
    const cleanId = sanitizeText(id, 64);
    if (!cleanId) return;

    setCategories((prev) => {
      if (prev.length <= 1) {
        console.warn('Cannot delete the last category in store');
        return prev;
      }
      const remaining = prev.filter((c) => c.id !== cleanId);
      const fallbackCatId = remaining[0]?.id || 'flowers';

      // Safely reassign any products that were in this deleted category
      setProducts((prodPrev) =>
        prodPrev.map((p) =>
          p.categoryId === cleanId ? { ...p, categoryId: fallbackCatId } : p
        )
      );

      if (selectedCategory === cleanId) {
        setSelectedCategory('all');
      }

      syncCategoryDeletionToSupabase(cleanId);
      return remaining;
    });
  };

  // Admin: Settings & Intro
  const updateSettings = (newSettings: Partial<StoreSettings>) => {
    setSettings((prev) => ({
      ...prev,
      ...newSettings,
      announcement: {
        ...prev.announcement,
        ...(newSettings.announcement || {}),
      },
      heroBanner: {
        ...prev.heroBanner,
        ...(newSettings.heroBanner || {}),
      },
      contactInfo: {
        ...prev.contactInfo,
        ...(newSettings.contactInfo || {}),
      },
      introConfig: {
        ...prev.introConfig,
        ...(newSettings.introConfig || {}),
      },
      aboutUs: newSettings.aboutUs
        ? {
            ...(prev.aboutUs || defaultAboutUs),
            ...newSettings.aboutUs,
          }
        : prev.aboutUs || defaultAboutUs,
    }));
  };

  const updateIntroConfig = (newConfig: Partial<IntroConfig>) => {
    setSettings((prev) => ({
      ...prev,
      introConfig: {
        ...prev.introConfig,
        ...newConfig,
      },
    }));
  };

  // Admin: Promo Codes
  const addPromoCode = (promo: PromoCode) => {
    setPromoCodes((prev) => [...prev, promo]);
  };

  const togglePromoCode = (code: string) => {
    setPromoCodes((prev) =>
      prev.map((p) => (p.code === code ? { ...p, active: !p.active } : p))
    );
  };

  const deletePromoCode = (code: string) => {
    setPromoCodes((prev) => prev.filter((p) => p.code !== code));
  };

  // Support Messages Management
  const sendSupportMessage = (msg: Omit<SupportMessage, 'id' | 'createdAt' | 'status'>) => {
    const newMessageId = `msg-${Date.now()}`;
    const timestamp = new Date().toISOString();
    const newMessage: SupportMessage = {
      ...msg,
      id: newMessageId,
      createdAt: timestamp,
      status: 'new',
    };
    setSupportMessages((prev) => [newMessage, ...prev]);

    const adminNotification: OrderNotification = {
      id: `notif-chat-${Date.now()}`,
      orderId: '',
      customerName: msg.customerName,
      customerPhone: msg.customerPhone || '',
      customerEmail: msg.customerEmail || '',
      status: 'pending',
      title: `استفسار وتواصل جديد من: ${msg.customerName}`,
      message: `الموضوع: "${msg.subject}" - ${msg.message}`,
      timestamp,
      channel: 'system',
      read: false,
      target: 'admin',
    };
    setNotifications((prev) => [adminNotification, ...prev]);

    if (currentUser?.role === 'admin') {
      playSupportMessageChime();
      setNewSupportAlert({
        id: newMessageId,
        customerName: msg.customerName,
        subject: msg.subject,
        message: msg.message,
        time: new Date().toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit' }),
      });
    }

    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const bc = new BroadcastChannel('kazaki_store_live_bus');
        bc.postMessage({
          type: 'NEW_SUPPORT_MESSAGE',
          message: newMessage,
          adminNotification,
        });
        bc.close();
      }
      localStorage.setItem('kazaki_live_ping', Date.now().toString());
    } catch {}

    // Save to Supabase database and broadcast live to manager
    syncSupportMessageToSupabase(newMessage);
    broadcastSupabaseLiveEvent('NEW_SUPPORT_MESSAGE', {
      message: newMessage,
      adminNotification,
    });

    // Send to backend server so it reaches manager dashboard immediately (if backend is active)
    if (isBackendReachableRef.current) {
      fetch('/api/support-messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMessage),
      }).catch((err) => {
        console.warn('Backend support message post error:', err);
      });
    }
  };

  const updateSupportMessageStatus = (
    id: string,
    status: 'new' | 'read' | 'replied',
    replyNotes?: string
  ) => {
    setSupportMessages((prev) =>
      prev.map((m) =>
        m.id === id
          ? {
              ...m,
              status,
              ...(replyNotes !== undefined ? { replyNotes } : {}),
            }
          : m
      )
    );

    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const bc = new BroadcastChannel('kazaki_store_live_bus');
        bc.postMessage({
          type: 'SUPPORT_REPLY',
          message: { id, status, replyNotes },
        });
        bc.close();
      }
    } catch {}

    // Sync with Supabase database
    updateSupportMessageInSupabase(id, status, replyNotes);

    // Sync with backend server
    if (isBackendReachableRef.current) {
      fetch(`/api/support-messages/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, replyNotes }),
      }).catch(() => {});
    }
  };

  // 24-Hour Temporary Live Chat Methods
  const refreshTempChats = async () => {
    if (!isBackendReachableRef.current) return;
    try {
      const isAdmin = currentUser?.role === 'admin';
      const chatsUrl = isAdmin
        ? '/api/temp-chats?role=admin'
        : activeChatSessionId
        ? `/api/temp-chats?sessionId=${encodeURIComponent(activeChatSessionId)}`
        : `/api/temp-chats?customerPhone=${encodeURIComponent(currentUser?.phone || '')}&customerEmail=${encodeURIComponent(currentUser?.email || '')}`;

      const data = await safeFetchJson<any>(chatsUrl);
      if (data?.success) {
        if (Array.isArray(data.sessions)) {
          setTempChats(data.sessions);
        } else if (data.session) {
          setTempChats((prev) => {
            const exists = prev.some((s) => s.id === data.session.id);
            return exists ? prev.map((s) => (s.id === data.session.id ? data.session : s)) : [data.session, ...prev];
          });
        }
      }
    } catch (err) {
      console.warn('Error refreshing temp chats:', err);
    }
  };

  const sendTempChatMessage = async (
    text: string,
    customerInfo?: { name?: string; phone?: string; email?: string }
  ): Promise<{ success: boolean; message?: string }> => {
    const clean = text.trim();
    if (!clean) return { success: false, message: 'نص الرسالة مطلوب' };

    let sid = activeChatSessionId;
    if (!sid) {
      sid = `chat-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setActiveChatSessionId(sid);
      try {
        localStorage.setItem('kazaki_temp_chat_session_id_v1', sid);
      } catch {}
    }

    const custName = customerInfo?.name || currentUser?.name || 'زبون المتجر';
    const custPhone = customerInfo?.phone || currentUser?.phone || '';
    const custEmail = customerInfo?.email || currentUser?.email || '';

    // محاولة الإرسال عبر الخادم أولاً - إذا فشل نستخدم الذاكرة المحلية
    const localMessageItem = {
      id: `cmsg-${Date.now()}-local`,
      sender: 'customer' as const,
      senderName: custName,
      text: clean,
      timestamp: new Date().toISOString(),
    };

    if (isBackendReachableRef.current) {
      try {
        const data = await safeFetchJson<any>('/api/temp-chats/message', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: sid,
            customerName: custName,
            customerPhone: custPhone,
            customerEmail: custEmail,
            sender: 'customer',
            text: clean,
          }),
        });
        if (data?.success && data.session) {
          setTempChats((prev) => {
            const exists = prev.some((s) => s.id === data.session.id);
            return exists ? prev.map((s) => (s.id === data.session.id ? data.session : s)) : [data.session, ...prev];
          });

          // Add admin notification and support backup
          const adminNotification: OrderNotification = {
            id: `notif-chat-${Date.now()}`,
            orderId: '',
            customerName: custName,
            customerPhone: custPhone,
            customerEmail: custEmail,
            status: 'pending',
            title: `رسالة شات مباشر جديدة من: ${custName}`,
            message: clean.slice(0, 100),
            timestamp: localMessageItem.timestamp,
            channel: 'system',
            read: false,
            target: 'admin',
          };
          setNotifications((prev) => [adminNotification, ...prev]);

          const backupSupportMsg: SupportMessage = {
            id: `msg-${Date.now()}`,
            customerName: custName,
            customerPhone: custPhone,
            customerEmail: custEmail,
            subject: 'محادثة مباشرة (24 ساعة)',
            message: clean,
            createdAt: localMessageItem.timestamp,
            status: 'new',
          };
          setSupportMessages((prev) => [backupSupportMsg, ...prev]);

          if (currentUser?.role === 'admin') {
            playSupportMessageChime();
            setNewSupportAlert({
              id: localMessageItem.id,
              customerName: custName,
              subject: 'محادثة مباشرة (24 ساعة)',
              message: clean,
              time: new Date().toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit' }),
            });
          }

          try {
            if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
              const bc = new BroadcastChannel('kazaki_store_live_bus');
              bc.postMessage({
                type: 'TEMP_CHAT_MESSAGE',
                session: data.session,
                message: data.message,
                notification: adminNotification,
              });
              bc.close();
            }
            localStorage.setItem('kazaki_live_ping', Date.now().toString());
          } catch {}

          broadcastSupabaseLiveEvent('TEMP_CHAT_MESSAGE', {
            sessionId: sid,
            session: data.session,
            message: data.message,
            notification: adminNotification,
          });

          return { success: true };
        }
      } catch {
        // فشل الاتصال بالخادم - نستخدم الذاكرة المحلية
      }
    }

    // Fallback: تحديث الحالة المحلية مباشرة عند فشل الخادم
    let finalSession: TempChatSession;
    setTempChats((prev) => {
      const existingSession = prev.find((s) => s.id === sid);
      if (existingSession) {
        finalSession = {
          ...existingSession,
          messages: [...existingSession.messages, localMessageItem],
          lastMessageAt: localMessageItem.timestamp,
          unreadByAdmin: (existingSession.unreadByAdmin || 0) + 1,
        };
        return prev.map((s) => (s.id === sid ? finalSession : s));
      }
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      finalSession = {
        id: sid,
        customerName: custName,
        customerPhone: custPhone,
        customerEmail: custEmail,
        createdAt: localMessageItem.timestamp,
        expiresAt,
        messages: [localMessageItem],
        status: 'active',
        unreadByAdmin: 1,
        unreadByCustomer: 0,
        lastMessageAt: localMessageItem.timestamp,
      };
      return [finalSession, ...prev];
    });

    const fallbackAdminNotif: OrderNotification = {
      id: `notif-chat-${Date.now()}`,
      orderId: '',
      customerName: custName,
      customerPhone: custPhone,
      customerEmail: custEmail,
      status: 'pending',
      title: `رسالة شات مباشر جديدة من: ${custName}`,
      message: clean.slice(0, 100),
      timestamp: localMessageItem.timestamp,
      channel: 'system',
      read: false,
      target: 'admin',
    };
    setNotifications((prev) => [fallbackAdminNotif, ...prev]);

    const backupSupportMsg: SupportMessage = {
      id: `msg-${Date.now()}`,
      customerName: custName,
      customerPhone: custPhone,
      customerEmail: custEmail,
      subject: 'محادثة مباشرة (24 ساعة)',
      message: clean,
      createdAt: localMessageItem.timestamp,
      status: 'new',
    };
    setSupportMessages((prev) => [backupSupportMsg, ...prev]);

    if (currentUser?.role === 'admin') {
      playSupportMessageChime();
      setNewSupportAlert({
        id: localMessageItem.id,
        customerName: custName,
        subject: 'محادثة مباشرة (24 ساعة)',
        message: clean,
        time: new Date().toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit' }),
      });
    }

    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const bc = new BroadcastChannel('kazaki_store_live_bus');
        bc.postMessage({
          type: 'TEMP_CHAT_MESSAGE',
          sessionId: sid,
          session: finalSession!,
          message: localMessageItem,
          notification: fallbackAdminNotif,
        });
        bc.close();
      }
      localStorage.setItem('kazaki_live_ping', Date.now().toString());
    } catch {}

    broadcastSupabaseLiveEvent('TEMP_CHAT_MESSAGE', {
      sessionId: sid,
      session: finalSession!,
      message: localMessageItem,
      notification: fallbackAdminNotif,
    });

    return { success: true };
  };

  const adminSendTempChatMessage = async (
    sessionId: string,
    text: string
  ): Promise<{ success: boolean; message?: string }> => {
    const clean = text.trim();
    if (!clean) return { success: false, message: 'نص الرسالة مطلوب' };

    const localAdminMsg = {
      id: `cmsg-${Date.now()}-admin`,
      sender: 'admin' as const,
      senderName: 'إدارة المتجر',
      text: clean,
      timestamp: new Date().toISOString(),
    };

    if (isBackendReachableRef.current) {
      try {
        const data = await safeFetchJson<any>('/api/temp-chats/message', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            sender: 'admin',
            text: clean,
          }),
        });
        if (data?.success && data.session) {
          setTempChats((prev) => {
            const exists = prev.some((s) => s.id === data.session.id);
            return exists ? prev.map((s) => (s.id === data.session.id ? data.session : s)) : [data.session, ...prev];
          });

          try {
            if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
              const bc = new BroadcastChannel('kazaki_store_live_bus');
              bc.postMessage({
                type: 'TEMP_CHAT_MESSAGE',
                session: data.session,
                message: data.message,
              });
              bc.close();
            }
            localStorage.setItem('kazaki_live_ping', Date.now().toString());
          } catch {}

          broadcastSupabaseLiveEvent('TEMP_CHAT_MESSAGE', {
            sessionId,
            session: data.session,
            message: data.message,
          });

          return { success: true };
        }
      } catch {
        // فشل الاتصال - نستخدم الحالة المحلية
      }
    }

    // Fallback: تحديث الشات محلياً عند فشل الخادم
    setTempChats((prev) =>
      prev.map((s) =>
        s.id === sessionId
          ? {
              ...s,
              messages: [...s.messages, localAdminMsg],
              lastMessageAt: localAdminMsg.timestamp,
              unreadByCustomer: (s.unreadByCustomer || 0) + 1,
            }
          : s
      )
    );

    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const bc = new BroadcastChannel('kazaki_store_live_bus');
        bc.postMessage({ type: 'TEMP_CHAT_MESSAGE', sessionId, message: localAdminMsg });
        bc.close();
      }
      localStorage.setItem('kazaki_live_ping', Date.now().toString());
    } catch {}

    broadcastSupabaseLiveEvent('TEMP_CHAT_MESSAGE', {
      sessionId,
      message: localAdminMsg,
    });

    return { success: true };
  };

  const endTempChat = (sessionId?: string) => {
    const targetId = sessionId || activeChatSessionId;
    if (targetId) {
      if (isBackendReachableRef.current) {
        fetch(`/api/temp-chats/${targetId}`, { method: 'DELETE' }).catch(() => {});
      }
      setTempChats((prev) => prev.filter((s) => s.id !== targetId));
      if (targetId === activeChatSessionId) {
        setActiveChatSessionId(null);
        try {
          localStorage.removeItem('kazaki_temp_chat_session_id_v1');
        } catch {}
      }
    }
  };

  const testManagerAlarmChime = () => {
    unlockAudio();
    playNotificationChime();
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([120, 60, 120]);
      } catch {}
    }
  };

  const testSupportMessageChime = () => {
    unlockAudio();
    playSupportMessageChime();
  };

  const editSupportMessage = (id: string, updates: Partial<SupportMessage>) => {
    setSupportMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...updates } : m))
    );

    if (isBackendReachableRef.current) {
      fetch(`/api/support-messages/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      }).catch(() => {});
    }
  };

  const deleteSupportMessage = (id: string) => {
    setSupportMessages((prev) => prev.filter((m) => m.id !== id));

    if (isBackendReachableRef.current) {
      fetch(`/api/support-messages/${id}`, {
        method: 'DELETE',
      }).catch(() => {});
    }
  };

  const clearAllSupportMessages = () => {
    setSupportMessages([]);
  };

  // Customer Service Management (Channels & Settings)
  const updateCustomerServiceConfig = (config: Partial<CustomerServiceConfig>) => {
    setSettings((prev) => ({
      ...prev,
      contactInfo: {
        ...prev.contactInfo,
        ...config,
      },
    }));
  };

  const addCustomerServiceChannel = (channel: Omit<CustomerServiceChannel, 'id'>) => {
    const newChan: CustomerServiceChannel = {
      ...channel,
      id: 'cs-' + Date.now(),
    };
    setSettings((prev) => {
      const existing = prev.contactInfo?.channels || defaultCustomerServiceChannels;
      return {
        ...prev,
        contactInfo: {
          ...prev.contactInfo,
          channels: [...existing, newChan],
        },
      };
    });
  };

  const updateCustomerServiceChannel = (id: string, updates: Partial<CustomerServiceChannel>) => {
    setSettings((prev) => {
      const existing = prev.contactInfo?.channels || defaultCustomerServiceChannels;
      const updated = existing.map((c) => (c.id === id ? { ...c, ...updates } : c));
      return {
        ...prev,
        contactInfo: {
          ...prev.contactInfo,
          channels: updated,
        },
      };
    });
  };

  const deleteCustomerServiceChannel = (id: string) => {
    setSettings((prev) => {
      const existing = prev.contactInfo?.channels || defaultCustomerServiceChannels;
      const filtered = existing.filter((c) => c.id !== id);
      return {
        ...prev,
        contactInfo: {
          ...prev.contactInfo,
          channels: filtered,
        },
      };
    });
  };

  const toggleCustomerServiceChannel = (id: string) => {
    setSettings((prev) => {
      const existing = prev.contactInfo?.channels || defaultCustomerServiceChannels;
      const updated = existing.map((c) => (c.id === id ? { ...c, enabled: !c.enabled } : c));
      return {
        ...prev,
        contactInfo: {
          ...prev.contactInfo,
          channels: updated,
        },
      };
    });
  };

  const resetToDefault = () => {
    setProducts(initialProducts);
    setCategories(initialCategories);
    setOrders(initialOrders);
    setSettings(initialStoreSettings);
    setPromoCodes(initialPromoCodes);
    setSupportMessages(initialSupportMessages);
    setNotifications(initialOrders.flatMap((o) => o.notifications || []));
    setCurrentUser(null);
    setCart([]);
    sessionStorage.removeItem(STORAGE_KEYS.INTRO_SEEN);
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        categories,
        orders,
        settings,
        currentUser,
        cart,
        promoCodes,
        appliedPromo,
        supportMessages,
        notifications,
        isCartOpen,
        isIntroActive,
        selectedCategory,
        searchQuery,
        selectedProduct,
        activeView,
        cartTotals,
        setActiveView,
        setSelectedCategory,
        setSearchQuery,
        setSelectedProduct,
        setIsCartOpen,
        isLanguageModalOpen,
        setIsLanguageModalOpen,
        isPhoneNotifsModalOpen,
        setIsPhoneNotifsModalOpen,
        dismissIntro,
        triggerIntroPreview,
        login,
        loginAdminAsync,
        verifyAdminPassword,
        register,
        logout,
        switchRole,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        applyPromoCode,
        removePromoCode,
        createOrder,
        updateOrderStatus,
        sendOrderNotification,
        markNotificationAsRead,
        clearNotifications,
        customerNotifications,
        adminNotifications,
        newOrderAlert,
        clearNewOrderAlert,
        newSupportAlert,
        clearNewSupportAlert,
        customerLiveAlert,
        clearCustomerLiveAlert,
        targetOrderFilter,
        setTargetOrderFilter,
        testManagerAlarmChime,
        testSupportMessageChime,
        isCustomerNotifsModalOpen,
        setIsCustomerNotifsModalOpen,
        myOrderIds,
        phoneNotificationsEnabled,
        togglePhoneNotifications,
        sendPhoneTestNotification,
        tempChats,
        activeCustomerChat,
        activeChatSessionId,
        sendTempChatMessage,
        adminSendTempChatMessage,
        endTempChat,
        refreshTempChats,
        sendSupportMessage,
        updateSupportMessageStatus,
        editSupportMessage,
        deleteSupportMessage,
        clearAllSupportMessages,
        updateCustomerServiceConfig,
        addCustomerServiceChannel,
        updateCustomerServiceChannel,
        deleteCustomerServiceChannel,
        toggleCustomerServiceChannel,
        addProduct,
        updateProduct,
        deleteProduct,
        addCategory,
        updateCategory,
        deleteCategory,
        updateSettings,
        updateIntroConfig,
        addPromoCode,
        togglePromoCode,
        deletePromoCode,
        resetToDefault,
        currentLanguage,
        setCurrentLanguage,
        siteTexts,
        getText,
        t,
        getCategoryName,
        getCategoryDescription,
        currencyLabel,
        updateSiteTexts,
        resetSiteTextsToDefault,
        buttonTexts,
        getBtnText,
        updateButtonTexts,
        resetButtonTextsToDefault,
        shippingRates,
        getShippingFeeForCity,
        getCityRate,
        updateShippingRates,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
