export type UserRole = 'guest' | 'customer' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  address?: string;
  city?: string;
  createdAt: string;
}

export interface Product {
  id: string;
  title: string;
  titleEn?: string;
  titleKu?: string;
  description: string;
  descriptionEn?: string;
  descriptionKu?: string;
  price: number;
  originalPrice?: number;
  categoryId: string;
  image: string;
  videoUrl?: string;
  gallery?: string[];
  inStock: boolean;
  stockCount: number;
  rating: number;
  reviewsCount: number;
  isFeatured?: boolean;
  isNew?: boolean;
  tags?: string[];
  volumeOrSize?: string;
}

export interface Category {
  id: string;
  name: string;
  nameEn?: string;
  nameKu?: string;
  icon: string;
  image?: string;
  description?: string;
  descriptionEn?: string;
  descriptionKu?: string;
  itemCount?: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedVariant?: string;
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
export type PaymentMethod = 'cod' | 'mastercard_rafidain';

export interface OrderStatusHistoryItem {
  id: string;
  status: OrderStatus;
  timestamp: string;
  note?: string;
  trackingNumber?: string;
  shippingCarrier?: string;
  updatedBy: string;
  notificationSent: boolean;
}

export interface OrderNotification {
  id: string;
  orderId?: string;
  productId?: string;
  productImage?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  status?: OrderStatus;
  title: string;
  message: string;
  timestamp: string;
  channel: 'whatsapp' | 'email' | 'system';
  read: boolean;
  trackingNumber?: string;
  target?: 'admin' | 'customer' | 'customer_all' | 'all';
  type?: 'order' | 'new_product' | 'system';
}

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: string;
  city: string;
  notes?: string;
  items: CartItem[];
  totalAmount: number;
  discountAmount: number;
  shippingFee: number;
  finalAmount: number;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  createdAt: string;
  trackingNumber?: string;
  shippingCarrier?: string;
  statusHistory?: OrderStatusHistoryItem[];
  notifications?: OrderNotification[];
}

export type IntroType = 'image' | 'video' | 'animation';

export interface IntroConfig {
  enabled: boolean;
  type: IntroType;
  mediaUrl: string;
  title: string;
  subtitle: string;
  buttonText: string;
  autoCloseSeconds: number; // 0 means do not auto close
}

export type SupportedLanguage = 'ar';

export type SitePhrasesTranslations = Record<string, { ar: string; en?: string; ku?: string }>;

export interface ButtonTranslations {
  home: { ar: string; en?: string; ku?: string };
  shop: { ar: string; en?: string; ku?: string };
  categories: { ar: string; en?: string; ku?: string };
  addToCart: { ar: string; en?: string; ku?: string };
  buyNow: { ar: string; en?: string; ku?: string };
  login: { ar: string; en?: string; ku?: string };
  contactUs: { ar: string; en?: string; ku?: string };
  customerService: { ar: string; en?: string; ku?: string };
  checkout: { ar: string; en?: string; ku?: string };
  trackOrder: { ar: string; en?: string; ku?: string };
  viewCart: { ar: string; en?: string; ku?: string };
  register: { ar: string; en?: string; ku?: string };
  sendMessage: { ar: string; en?: string; ku?: string };
  viewProduct: { ar: string; en?: string; ku?: string };
  aboutUs: { ar: string; en?: string; ku?: string };
  [key: string]: { ar: string; en?: string; ku?: string };
}

export interface AboutUsFeature {
  id: string;
  icon: string;
  title: string;
  titleEn?: string;
  titleKu?: string;
  description: string;
  descriptionEn?: string;
  descriptionKu?: string;
}

export interface AboutUsConfig {
  badge: string;
  badgeEn?: string;
  badgeKu?: string;
  title: string;
  titleEn?: string;
  titleKu?: string;
  subtitle: string;
  subtitleEn?: string;
  subtitleKu?: string;
  story: string;
  storyEn?: string;
  storyKu?: string;
  mission: string;
  missionEn?: string;
  missionKu?: string;
  imageUrl: string;
  secondaryImageUrl?: string;
  gallery?: string[];
  experienceYears?: string;
  experienceYearsEn?: string;
  experienceYearsKu?: string;
  satisfiedCustomers?: string;
  satisfiedCustomersEn?: string;
  satisfiedCustomersKu?: string;
  everlastingGuarantee?: string;
  everlastingGuaranteeEn?: string;
  everlastingGuaranteeKu?: string;
  features?: AboutUsFeature[];
}

export interface CityShippingRate {
  id: string;
  name: string;
  nameEn?: string;
  nameKu?: string;
  price: number;
  estimatedDelivery: string;
  enabled: boolean;
}

export interface StoreNotificationSettings {
  enableSound: boolean;
  enableBrowserPush: boolean;
  enableTelegram: boolean;
  telegramBotToken?: string;
  telegramChatId?: string;
  enableWhatsAppAlert: boolean;
  adminWhatsApp?: string;
  enableEmailAlert: boolean;
  adminEmail?: string;
}

export type CustomerServiceType = 'whatsapp' | 'phone' | 'email' | 'instagram' | 'tiktok' | 'telegram' | 'custom';

export interface CustomerServiceChannel {
  id: string;
  name: string;
  nameEn?: string;
  nameKu?: string;
  type: CustomerServiceType;
  value: string;
  subtitle?: string;
  subtitleEn?: string;
  subtitleKu?: string;
  enabled: boolean;
}

export interface CustomerServiceConfig {
  enabled: boolean;
  title: string;
  subtitle: string;
  workingHours: string;
  customerServiceNote: string;
  channels?: CustomerServiceChannel[];
}

export interface StoreSettings {
  storeName: string;
  tagline: string;
  logoUrl?: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  instagram: string;
  tiktok: string;
  currency: string;
  announcement: {
    enabled: boolean;
    text: string;
    linkText?: string;
  };
  heroBanner: {
    title: string;
    subtitle: string;
    ctaText: string;
    imageUrl: string;
    discountBadge: string;
  };
  contactInfo: CustomerServiceConfig;
  introConfig: IntroConfig;
  aboutUs?: AboutUsConfig;
  buttonTexts?: ButtonTranslations;
  siteTexts?: SitePhrasesTranslations;
  shippingRates?: CityShippingRate[];
  defaultShippingFee?: number;
  freeShippingThreshold?: number;
  notificationSettings?: StoreNotificationSettings;
}

export interface PromoCode {
  code: string;
  discountPercent: number;
  minOrder: number;
  active: boolean;
}

export interface SupportMessage {
  id: string;
  customerName: string;
  customerPhone?: string;
  customerEmail: string;
  subject: string;
  message: string;
  createdAt: string;
  status: 'new' | 'read' | 'replied';
  replyNotes?: string;
}

export interface TempChatMessage {
  id: string;
  sender: 'customer' | 'admin';
  senderName: string;
  text: string;
  timestamp: string;
}

export interface TempChatSession {
  id: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  createdAt: string;
  expiresAt: string;
  messages: TempChatMessage[];
  status: 'active' | 'closed';
  unreadByAdmin?: number;
  unreadByCustomer?: number;
  lastMessageAt: string;
}

