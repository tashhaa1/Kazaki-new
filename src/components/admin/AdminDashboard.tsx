import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useStore, isCurrentSessionAdmin } from '../../context/StoreContext';
import {
  LayoutDashboard,
  Smartphone,
  Package,
  Layers,
  ShoppingBag,
  UserPlus,
  Sliders,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  TrendingUp,
  DollarSign,
  Users,
  Eye,
  Video,
  Image as ImageIcon,
  RotateCcw,
  Tag,
  Save,
  Clock,
  Truck,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Phone,
  Mail,
  MapPin,
  MessageCircle,
  Share2,
  Headphones,
  Instagram,
  CreditCard,
  Inbox,
  Bell,
  BellRing,
  ArrowRight,
  Search,
  History,
  Send,
  CheckCircle,
  MessageSquare,
  Filter,
  Copy,
  Languages,
  Globe,
  Heart,
  Award,
  Database,
  Key,
  Terminal,
  Lock,
  EyeOff,
  UserCheck,
  Shield,
  Volume2,
  VolumeX,
  Play,
  Loader2,
  Home,
  Zap,
  FileText,
  Gift,
  ShieldCheck,
  XCircle,
  Music,
  Hash,
  RefreshCw,
  Percent,
  PieChart,
  BarChart3,
} from 'lucide-react';
import { Product, Category, OrderStatus, PromoCode, Order, ButtonTranslations, SupportedLanguage, CityShippingRate, StoreNotificationSettings, CustomerServiceChannel, CustomerServiceConfig, CustomerServiceType, SupportMessage, TempChatSession, TempChatMessage } from '../../types';
import { initialButtonTranslations, initialSiteTexts, defaultAboutUs, defaultIraqiShippingRates } from '../../data/initialData';
import {
  playNotificationChime,
  requestBrowserNotificationPermission,
  showBrowserNotification,
  testTelegramBot,
} from '../../lib/notifications';
import { translateArabicToEnAndKu, instantTranslateArabic } from '../../utils/autoTranslator';
import { StudioMediaUploader } from '../common/StudioMediaUploader';
import { ReportsView } from './ReportsView';

export const AdminDashboard: React.FC = () => {
  const {
    products,
    categories,
    orders,
    settings,
    promoCodes,
    supportMessages,
    notifications,
    currentUser,
    buttonTexts,
    updateButtonTexts,
    resetButtonTextsToDefault,
    siteTexts,
    updateSiteTexts,
    resetSiteTextsToDefault,
    currentLanguage,
    setCurrentLanguage,
    shippingRates,
    updateShippingRates,
    addProduct,
    updateProduct,
    deleteProduct,
    addCategory,
    updateCategory,
    deleteCategory,
    updateSettings,
    updateOrderStatus,
    sendOrderNotification,
    addPromoCode,
    togglePromoCode,
    deletePromoCode,
    updateSupportMessageStatus,
    deleteSupportMessage,
    editSupportMessage,
    clearAllSupportMessages,
    updateCustomerServiceConfig,
    addCustomerServiceChannel,
    updateCustomerServiceChannel,
    deleteCustomerServiceChannel,
    toggleCustomerServiceChannel,
    resetToDefault,
    setActiveView,
    activeView,
    adminNotifications,
    newOrderAlert,
    clearNewOrderAlert,
    newSupportAlert,
    clearNewSupportAlert,
    setIsCustomerNotifsModalOpen,
    targetOrderFilter,
    setTargetOrderFilter,
    testManagerAlarmChime,
    testSupportMessageChime,
    phoneNotificationsEnabled,
    togglePhoneNotifications,
    sendPhoneTestNotification,
    tempChats,
    adminSendTempChatMessage,
    endTempChat,
    refreshTempChats,
  } = useStore();

  if (currentUser?.role !== 'admin' && !isCurrentSessionAdmin(currentUser, activeView)) {
    return null;
  }

  const [activeTab, setActiveTab] = useState<
    'overview' | 'reports' | 'products' | 'categories' | 'orders' | 'buttons' | 'branding' | 'contact' | 'about'
  >('overview');

  // Store notification settings state
  const [notifSettings, setNotifSettings] = useState<StoreNotificationSettings>(() => {
    return (
      settings.notificationSettings || {
        enableSound: true,
        enableBrowserPush: true,
        enableTelegram: false,
        telegramBotToken: '',
        telegramChatId: '',
        enableWhatsAppAlert: true,
        adminWhatsApp: settings.whatsapp || '07838969959',
        enableEmailAlert: true,
        adminEmail: settings.email || 'abdo07710264453@gmail.com',
      }
    );
  });
  const [telegramTesting, setTelegramTesting] = useState(false);
  const [telegramTestResult, setTelegramTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [notifSavedToast, setNotifSavedToast] = useState(false);

  // All Site Texts & Buttons customizer state
  const [siteTextsForm, setSiteTextsForm] = useState<Record<string, { ar: string; en?: string; ku?: string }>>(() => {
    return JSON.parse(JSON.stringify(siteTexts || initialSiteTexts));
  });
  const [buttonSearchQuery, setButtonSearchQuery] = useState('');
  const [activeTextCategoryTab, setActiveTextCategoryTab] = useState<
    'all' | 'buttons' | 'hero' | 'products' | 'cart' | 'tracking' | 'contact'
  >('all');

  const buttonsForm = siteTextsForm;
  const setButtonsForm = setSiteTextsForm;

  // Keep siteTextsForm in sync when siteTexts updates in context
  React.useEffect(() => {
    if (siteTexts) {
      setSiteTextsForm(JSON.parse(JSON.stringify(siteTexts)));
    }
  }, [siteTexts]);

  // Order tracking & status update states
  const [orderStatusFilter, setOrderStatusFilter] = useState<'all' | OrderStatus>('all');
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [selectedOrderForStatus, setSelectedOrderForStatus] = useState<Order | null>(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [selectedOrderForTimeline, setSelectedOrderForTimeline] = useState<Order | null>(null);
  const [isTimelineModalOpen, setIsTimelineModalOpen] = useState(false);

  // Jump to specific incoming order when manager clicks floating alert
  React.useEffect(() => {
    if (targetOrderFilter) {
      setActiveTab('orders');
      setOrderSearchQuery(targetOrderFilter);
      setOrderStatusFilter('all');
      setTargetOrderFilter(null);
    }
  }, [targetOrderFilter, setTargetOrderFilter]);
  const [statusUpdateForm, setStatusUpdateForm] = useState<{
    status: OrderStatus;
    trackingNumber: string;
    shippingCarrier: string;
    note: string;
    sendNotification: boolean;
    channel: 'whatsapp' | 'email' | 'system';
    customMessage: string;
  }>({
    status: 'processing',
    trackingNumber: '',
    shippingCarrier: 'أرجوان إكسبريس (بغداد والمحافظات)',
    note: '',
    sendNotification: true,
    channel: 'whatsapp',
    customMessage: '',
  });

  // Product modal state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [productForm, setProductForm] = useState({
    title: '',
    titleEn: '',
    titleKu: '',
    description: '',
    descriptionEn: '',
    descriptionKu: '',
    price: 0,
    originalPrice: 0,
    categoryId: categories[0]?.id || 'flowers',
    image: '',
    image2: '',
    image3: '',
    videoUrl: '',
    volumeOrSize: '',
    stockCount: 10,
    inStock: true,
    isFeatured: true,
    tags: '',
  });

  const [isTranslatingProduct, setIsTranslatingProduct] = useState(false);
  const [isTranslatingCategory, setIsTranslatingCategory] = useState(false);
  const [isTranslatingAllPhrases, setIsTranslatingAllPhrases] = useState(false);

  // Admin Products table search and filter
  const [adminProductSearch, setAdminProductSearch] = useState('');
  const [adminProductCatFilter, setAdminProductCatFilter] = useState('all');

  const filteredAdminProducts = useMemo(() => {
    return products.filter((prod) => {
      const q = adminProductSearch.toLowerCase().trim();
      const matchSearch =
        !q ||
        prod.title.toLowerCase().includes(q) ||
        (prod.titleEn && prod.titleEn.toLowerCase().includes(q)) ||
        (prod.titleKu && prod.titleKu.toLowerCase().includes(q)) ||
        prod.description.toLowerCase().includes(q) ||
        String(prod.price).includes(q);
      const matchCat =
        adminProductCatFilter === 'all' || prod.categoryId === adminProductCatFilter;
      return matchSearch && matchCat;
    });
  }, [products, adminProductSearch, adminProductCatFilter]);

  // Category modal and editing state
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    nameEn: '',
    nameKu: '',
    description: '',
    descriptionEn: '',
    descriptionKu: '',
    image: '',
    icon: 'Heart',
  });

  // Product Delete Confirmation Modal State
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeletingProduct, setIsDeletingProduct] = useState(false);

  // Quick Discount Modal State
  const [discountModalProduct, setDiscountModalProduct] = useState<Product | null>(null);
  const [discountPercentInput, setDiscountPercentInput] = useState<number>(20);
  const [discountTypeMode, setDiscountTypeMode] = useState<'percent' | 'customPrice'>('percent');
  const [discountCustomPrice, setDiscountCustomPrice] = useState<number>(0);

  // Promo code modal state
  const [promoForm, setPromoForm] = useState({
    code: '',
    discountPercent: 15,
    minOrder: 150,
  });

  // Customer Service Channels modal and editing state
  const [isChannelModalOpen, setIsChannelModalOpen] = useState(false);
  const [editingChannelId, setEditingChannelId] = useState<string | null>(null);
  const [channelForm, setChannelForm] = useState<{
    name: string;
    type: CustomerServiceType;
    value: string;
    subtitle: string;
    enabled: boolean;
  }>({
    name: '',
    type: 'whatsapp',
    value: '',
    subtitle: '',
    enabled: true,
  });

  // Support Message editing modal state
  const [isEditMessageModalOpen, setIsEditMessageModalOpen] = useState(false);
  const [editingMessage, setEditingMessage] = useState<SupportMessage | null>(null);
  const [editMessageForm, setEditMessageForm] = useState<{
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    subject: string;
    message: string;
    replyNotes: string;
    status: 'new' | 'read' | 'replied';
  }>({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    subject: '',
    message: '',
    replyNotes: '',
    status: 'new',
  });

  // Branding settings local state
  const [brandingForm, setBrandingForm] = useState({
    storeName: settings.storeName || 'KAZAKI.IQ',
    tagline: settings.tagline || '',
    logoUrl: settings.logoUrl || '',
    phone: settings.phone || '07838969959',
    whatsapp: settings.whatsapp || '07838969959',
    email: settings.email || 'info@kazaki.iq',
    address: settings.address || 'بغداد - المنصور - شارع 14 رمضان',
    instagram: settings.instagram || 'https://instagram.com/kazaki.iq',
    tiktok: settings.tiktok || 'https://tiktok.com/@kazaki.iq',
    currency: settings.currency || 'د.ع',
    announcementEnabled: settings.announcement?.enabled ?? true,
    announcementText: settings.announcement?.text || '',
    announcementLink: settings.announcement?.linkText || '',
    heroTitle: settings.heroBanner?.title || '',
    heroSubtitle: settings.heroBanner?.subtitle || '',
    heroCta: settings.heroBanner?.ctaText || '',
    heroImage: settings.heroBanner?.imageUrl || '',
    heroBadge: settings.heroBanner?.discountBadge || '',
    contactTitle: settings.contactInfo?.title || 'مركز خدمة عملاء KAZAKI.IQ',
    contactSubtitle: settings.contactInfo?.subtitle || 'نحن هنا لخدمتكِ ومساعدتكِ في كل خطوة',
    workingHours: settings.contactInfo?.workingHours || 'يومياً من 10:00 صباحاً حتى 10:00 مساءً',
    customerServiceNote: settings.contactInfo?.customerServiceNote || 'فريق الدعم الفني متواجد للإجابة على استفساراتكم عبر واتساب والهاتف فوراً.',
  });


  // About Us settings local state
  const [aboutForm, setAboutForm] = useState({
    badge: settings.aboutUs?.badge || defaultAboutUs.badge,
    badgeEn: settings.aboutUs?.badgeEn || defaultAboutUs.badgeEn || '',
    badgeKu: settings.aboutUs?.badgeKu || defaultAboutUs.badgeKu || '',
    title: settings.aboutUs?.title || defaultAboutUs.title,
    titleEn: settings.aboutUs?.titleEn || defaultAboutUs.titleEn || '',
    titleKu: settings.aboutUs?.titleKu || defaultAboutUs.titleKu || '',
    subtitle: settings.aboutUs?.subtitle || defaultAboutUs.subtitle,
    subtitleEn: settings.aboutUs?.subtitleEn || defaultAboutUs.subtitleEn || '',
    subtitleKu: settings.aboutUs?.subtitleKu || defaultAboutUs.subtitleKu || '',
    story: settings.aboutUs?.story || defaultAboutUs.story,
    storyEn: settings.aboutUs?.storyEn || defaultAboutUs.storyEn || '',
    storyKu: settings.aboutUs?.storyKu || defaultAboutUs.storyKu || '',
    mission: settings.aboutUs?.mission || defaultAboutUs.mission,
    missionEn: settings.aboutUs?.missionEn || defaultAboutUs.missionEn || '',
    missionKu: settings.aboutUs?.missionKu || defaultAboutUs.missionKu || '',
    imageUrl: settings.aboutUs?.imageUrl || defaultAboutUs.imageUrl,
    secondaryImageUrl: settings.aboutUs?.secondaryImageUrl || defaultAboutUs.secondaryImageUrl || '',
    gallery: settings.aboutUs?.gallery || defaultAboutUs.gallery || [],
    experienceYears: settings.aboutUs?.experienceYears || defaultAboutUs.experienceYears || '+3 سنوات من الإبداع',
    satisfiedCustomers: settings.aboutUs?.satisfiedCustomers || defaultAboutUs.satisfiedCustomers || '+10,000 زبون راضٍ',
    everlastingGuarantee: settings.aboutUs?.everlastingGuarantee || defaultAboutUs.everlastingGuarantee || '100% ورد لا يذبل',
  });

  // Iraqi Governorates Shipping rates state
  const [shippingRatesForm, setShippingRatesForm] = useState<CityShippingRate[]>(() => {
    return settings.shippingRates && settings.shippingRates.length > 0
      ? JSON.parse(JSON.stringify(settings.shippingRates))
      : JSON.parse(JSON.stringify(defaultIraqiShippingRates));
  });

  const [defaultShippingFeeInput, setDefaultShippingFeeInput] = useState<number>(
    typeof settings.defaultShippingFee === 'number' ? settings.defaultShippingFee : 5000
  );

  const [freeShippingThresholdInput, setFreeShippingThresholdInput] = useState<number>(
    typeof settings.freeShippingThreshold === 'number' ? settings.freeShippingThreshold : 0
  );

  const [shippingSearchFilter, setShippingSearchFilter] = useState('');
  const [batchPriceInput, setBatchPriceInput] = useState<number>(6000);

  // Sync shipping form if settings change
  React.useEffect(() => {
    if (settings.shippingRates && settings.shippingRates.length > 0) {
      setShippingRatesForm(JSON.parse(JSON.stringify(settings.shippingRates)));
    }
    if (typeof settings.defaultShippingFee === 'number') {
      setDefaultShippingFeeInput(settings.defaultShippingFee);
    }
    if (typeof settings.freeShippingThreshold === 'number') {
      setFreeShippingThresholdInput(settings.freeShippingThreshold);
    }
  }, [settings.shippingRates, settings.defaultShippingFee, settings.freeShippingThreshold]);

  const handleSaveShippingRates = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (currentUser?.role !== 'admin') {
      showNotification('عذراً، الصلاحية محصورة بالمدير العام فقط');
      return;
    }
    updateShippingRates(shippingRatesForm, {
      defaultShippingFee: Number(defaultShippingFeeInput),
      freeShippingThreshold: Number(freeShippingThresholdInput),
    });
    showNotification('تم حفظ وتطبيق أسعار التوصيل لجميع محافظات العراق بنجاح!');
  };

  const handleResetShippingRates = () => {
    if (currentUser?.role !== 'admin') {
      showNotification('عذراً، الصلاحية محصورة بالمدير العام فقط');
      return;
    }
    if (confirm('هل أنت متأكد من استعادة أسعار التوصيل الافتراضية لجميع المحافظات؟')) {
      const reset = JSON.parse(JSON.stringify(defaultIraqiShippingRates));
      setShippingRatesForm(reset);
      setDefaultShippingFeeInput(5000);
      setFreeShippingThresholdInput(0);
      updateShippingRates(reset, { defaultShippingFee: 5000, freeShippingThreshold: 0 });
      showNotification('تمت استعادة أسعار التوصيل الافتراضية بنجاح');
    }
  };

  const handleApplyBaghdadAndProvincesStandard = () => {
    const updated = shippingRatesForm.map((rate) => {
      if (rate.id === 'baghdad' || rate.name === 'بغداد') {
        return { ...rate, price: 5000, estimatedDelivery: 'خلال 24 ساعة', enabled: true };
      }
      return { ...rate, price: 6000, estimatedDelivery: 'خلال 24 - 48 ساعة', enabled: true };
    });
    setShippingRatesForm(updated);
    showNotification('تم تطبيق (بغداد 5,000 د.ع) و (باقي المحافظات 6,000 د.ع)! اضغط حفظ للتأكيد');
  };

  const handleApplyBatchPriceToAll = () => {
    if (!batchPriceInput || batchPriceInput < 0) return;
    const updated = shippingRatesForm.map((rate) => ({ ...rate, price: Number(batchPriceInput) }));
    setShippingRatesForm(updated);
    showNotification(`تم تحديد سعر ${batchPriceInput.toLocaleString()} د.ع لجميع المحافظات! اضغط حفظ للتأكيد`);
  };

  const handleToggleCityShipping = (cityId: string) => {
    setShippingRatesForm((prev) =>
      prev.map((c) => (c.id === cityId ? { ...c, enabled: !c.enabled } : c))
    );
  };

  const handleUpdateCityRatePrice = (cityId: string, newPrice: number) => {
    setShippingRatesForm((prev) =>
      prev.map((c) => (c.id === cityId ? { ...c, price: Math.max(0, newPrice) } : c))
    );
  };

  const handleUpdateCityRateTime = (cityId: string, newTime: string) => {
    setShippingRatesForm((prev) =>
      prev.map((c) => (c.id === cityId ? { ...c, estimatedDelivery: newTime } : c))
    );
  };

  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setSaveSuccessMsg(msg);
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  // 24-Hour Temporary Live Chats management state
  const [selectedTempChatId, setSelectedTempChatId] = useState<string | null>(null);
  const [adminReplyText, setAdminReplyText] = useState('');
  const [isAdminSendingReply, setIsAdminSendingReply] = useState(false);
  const [adminChatSearch, setAdminChatSearch] = useState('');
  const adminChatEndRef = useRef<HTMLDivElement>(null);

  const activeTempSessions = (tempChats || []).filter(
    (s) => new Date(s.expiresAt).getTime() > Date.now()
  );

  const filteredTempSessions = activeTempSessions.filter((s) => {
    if (!adminChatSearch.trim()) return true;
    const q = adminChatSearch.toLowerCase();
    return (
      s.customerName.toLowerCase().includes(q) ||
      (s.customerPhone && s.customerPhone.includes(q)) ||
      (s.customerEmail && s.customerEmail.toLowerCase().includes(q))
    );
  });

  const selectedSession =
    filteredTempSessions.find((s) => s.id === selectedTempChatId) ||
    filteredTempSessions[0] ||
    null;

  useEffect(() => {
    if (selectedSession?.messages?.length) {
      adminChatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedSession?.messages?.length, selectedSession?.id]);

  const getSessionRemainingTime = (expiresAt: string) => {
    const diff = new Date(expiresAt).getTime() - Date.now();
    if (diff <= 0) return 'منتهية الصلاحية';
    const totalMinutes = Math.floor(diff / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    if (hours > 0) {
      return `${hours} ساعة و ${minutes} دقيقة متبقية`;
    }
    return `${minutes} دقيقة متبقية`;
  };

  const adminQuickReplies = [
    'أهلاً بكِ عزيزتي، كيف يمكننا مساعدتكِ اليوم؟',
    'طلبكِ قيد التجهيز وسيتم تسليمه لشركة التوصيل في أسرع وقت.',
    'المقاس واللون المطلوبان متوفران وجاهزان للشحن الفوري.',
    'الدفع متاح نقداً عند الاستلام لجميع محافظات العراق.',
    'شكراً لتواصلكِ معنا، يسعدنا دائماً تقديم المساعدة.',
  ];

  const handleAdminSendReply = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedSession || !adminReplyText.trim() || isAdminSendingReply) return;

    const textToSend = adminReplyText.trim();
    setIsAdminSendingReply(true);
    const res = await adminSendTempChatMessage(selectedSession.id, textToSend);
    setIsAdminSendingReply(false);
    if (res.success) {
      setAdminReplyText('');
      showNotification('تم إرسال الرد المباشر للزبون بنجاح');
    } else {
      showNotification(res.message || 'تعذر إرسال الرد للزبون');
    }
  };

  // Calculations for overview
  const totalRevenue = orders.reduce((sum, o) => sum + (o.status !== 'cancelled' ? o.finalAmount : 0), 0);
  const totalOrdersCount = orders.length;
  const pendingOrdersCount = orders.filter((o) => o.status === 'pending' || o.status === 'processing').length;

  // Open product modal for new product
  const handleOpenAddProduct = () => {
    setEditingProductId(null);
    setProductForm({
      title: '',
      titleEn: '',
      titleKu: '',
      description: '',
      descriptionEn: '',
      descriptionKu: '',
      price: 35000,
      originalPrice: 45000,
      categoryId: categories[0]?.id || 'flowers',
      image: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=800&q=80',
      image2: '',
      image3: '',
      videoUrl: '',
      volumeOrSize: '500+ قطعة تركيب • ورد ليكو دائم',
      stockCount: 15,
      inStock: true,
      isFeatured: true,
      tags: 'ورد ليكو, لا يذبل, هدية فاخرة',
    });
    setIsProductModalOpen(true);
  };

  // Open product modal for editing
  const handleOpenEditProduct = (prod: Product) => {
    const extraImages = (prod.gallery || []).filter((url) => Boolean(url) && url !== prod.image);
    const secondImage = extraImages[0] || (prod.gallery && prod.gallery.length > 1 && prod.gallery[0] === prod.image ? prod.gallery[1] : (prod.gallery?.[0] !== prod.image ? prod.gallery?.[0] : '')) || '';
    const thirdImage = extraImages[1] || (prod.gallery && prod.gallery.length > 2 && prod.gallery[0] === prod.image ? prod.gallery[2] : (prod.gallery?.[1] !== prod.image && prod.gallery?.[1] !== secondImage ? prod.gallery?.[1] : '')) || '';

    setEditingProductId(prod.id);
    setProductForm({
      title: prod.title,
      titleEn: prod.titleEn || '',
      titleKu: prod.titleKu || '',
      description: prod.description,
      descriptionEn: prod.descriptionEn || '',
      descriptionKu: prod.descriptionKu || '',
      price: prod.price,
      originalPrice: prod.originalPrice || 0,
      categoryId: prod.categoryId,
      image: prod.image,
      image2: secondImage,
      image3: thirdImage,
      videoUrl: prod.videoUrl || '',
      volumeOrSize: prod.volumeOrSize || '',
      stockCount: prod.stockCount,
      inStock: prod.inStock,
      isFeatured: !!prod.isFeatured,
      tags: prod.tags ? prod.tags.join(', ') : '',
    });
    setIsProductModalOpen(true);
  };

  // Open Quick Discount Modal for a product
  const handleOpenDiscountModal = (prod: Product) => {
    setDiscountModalProduct(prod);
    setDiscountTypeMode('percent');
    setDiscountPercentInput(20);
    // If originalPrice exists and higher than price, calculate initial percent
    if (prod.originalPrice && prod.originalPrice > prod.price) {
      const calcPercent = Math.round(((prod.originalPrice - prod.price) / prod.originalPrice) * 100);
      setDiscountPercentInput(calcPercent > 0 ? calcPercent : 20);
      setDiscountCustomPrice(prod.price);
    } else {
      const discounted = Math.round((prod.price * 0.8) / 250) * 250;
      setDiscountCustomPrice(discounted);
    }
  };

  // Apply Quick Discount to Product
  const handleApplyQuickDiscount = (prod: Product, percent: number) => {
    // If product doesn't have originalPrice, its current price becomes originalPrice
    const basePrice = (prod.originalPrice && prod.originalPrice > prod.price) ? prod.originalPrice : prod.price;
    const newPrice = Math.max(500, Math.round((basePrice * (1 - percent / 100)) / 250) * 250);
    updateProduct(prod.id, {
      originalPrice: basePrice,
      price: newPrice,
    });
    showNotification(`تم تفعيل خصم ${percent}% على "${prod.title}". السعر بعد الخصم: ${newPrice.toLocaleString('ar-IQ')} ${settings.currency}`);
  };

  // Remove Discount from Product
  const handleRemoveDiscount = (prod: Product) => {
    if (prod.originalPrice && prod.originalPrice > prod.price) {
      updateProduct(prod.id, {
        price: prod.originalPrice,
        originalPrice: undefined,
      });
      showNotification(`تم إلغاء الخصم عن "${prod.title}" واستعادة السعر الأصلي ${prod.originalPrice.toLocaleString('ar-IQ')} ${settings.currency}`);
    } else {
      updateProduct(prod.id, {
        originalPrice: undefined,
      });
      showNotification(`تمت إزالة علامة السعر القديم عن "${prod.title}"`);
    }
  };

  // Perform Product Deletion
  const handleConfirmDeleteProduct = async () => {
    if (!productToDelete) return;
    setIsDeletingProduct(true);
    try {
      deleteProduct(productToDelete.id);
      showNotification(`تم حذف منتج "${productToDelete.title}" بنجاح`);
      setProductToDelete(null);
      if (editingProductId === productToDelete.id) {
        setIsProductModalOpen(false);
      }
    } catch (err) {
      console.error('Error deleting product:', err);
      showNotification('حدث خطأ أثناء محاولة حذف المنتج');
    } finally {
      setIsDeletingProduct(false);
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const tagArray = productForm.tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const galleryImages = [
      productForm.image,
      productForm.image2,
      productForm.image3,
    ]
      .map((img) => img?.trim())
      .filter((img): img is string => Boolean(img));
    const uniqueGallery = Array.from(new Set(galleryImages));

    if (editingProductId) {
      updateProduct(editingProductId, {
        title: productForm.title,
        description: productForm.description,
        price: Number(productForm.price),
        originalPrice: Number(productForm.originalPrice) || undefined,
        categoryId: productForm.categoryId,
        image: productForm.image,
        gallery: uniqueGallery,
        videoUrl: productForm.videoUrl?.trim() || undefined,
        volumeOrSize: productForm.volumeOrSize,
        stockCount: Number(productForm.stockCount),
        inStock: productForm.stockCount > 0 && productForm.inStock,
        isFeatured: productForm.isFeatured,
        tags: tagArray,
      });
      showNotification('تم تحديث المنتج بنجاح');
    } else {
      addProduct({
        title: productForm.title,
        description: productForm.description,
        price: Number(productForm.price),
        originalPrice: Number(productForm.originalPrice) || undefined,
        categoryId: productForm.categoryId,
        image: productForm.image,
        gallery: uniqueGallery,
        videoUrl: productForm.videoUrl?.trim() || undefined,
        volumeOrSize: productForm.volumeOrSize,
        stockCount: Number(productForm.stockCount),
        inStock: productForm.stockCount > 0 && productForm.inStock,
        rating: 5.0,
        reviewsCount: 1,
        isFeatured: productForm.isFeatured,
        isNew: true,
        tags: tagArray,
      });
      showNotification('تمت إضافة المنتج الجديد بنجاح');
    }
    setIsProductModalOpen(false);
  };

  const handleCategoryNameChange = (newName: string) => {
    setCategoryForm((prev) => ({
      ...prev,
      name: newName,
    }));
  };

  const handleCategoryDescChange = (newDesc: string) => {
    setCategoryForm((prev) => ({
      ...prev,
      description: newDesc,
    }));
  };

  // Add or Edit Category
  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryForm.name.trim()) return;

    if (editingCategoryId) {
      updateCategory(editingCategoryId, {
        name: categoryForm.name.trim(),
        description: categoryForm.description.trim(),
        image: categoryForm.image.trim() || 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80',
        icon: categoryForm.icon,
      });
      showNotification('تم تحديث وتعديل اسم القسم بنجاح');
    } else {
      addCategory({
        name: categoryForm.name.trim(),
        description: categoryForm.description.trim(),
        image: categoryForm.image.trim() || 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80',
        icon: categoryForm.icon,
      });
      showNotification('تمت إضافة القسم الجديد بنجاح');
    }

    setCategoryForm({
      name: '',
      nameEn: '',
      nameKu: '',
      description: '',
      descriptionEn: '',
      descriptionKu: '',
      image: '',
      icon: 'Heart',
    });
    setEditingCategoryId(null);
    setIsCategoryModalOpen(false);
  };

  const handleEditCategory = (cat: Category) => {
    setEditingCategoryId(cat.id);
    setCategoryForm({
      name: cat.name || '',
      nameEn: '',
      nameKu: '',
      description: cat.description || '',
      descriptionEn: '',
      descriptionKu: '',
      image: cat.image || '',
      icon: cat.icon || 'Heart',
    });
    setIsCategoryModalOpen(true);
  };

  const handleOpenAddCategory = () => {
    setEditingCategoryId(null);
    setCategoryForm({
      name: '',
      nameEn: '',
      nameKu: '',
      description: '',
      descriptionEn: '',
      descriptionKu: '',
      image: '',
      icon: 'Heart',
    });
    setIsCategoryModalOpen(true);
  };

  // Save Branding
  const handleSaveBranding = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      storeName: brandingForm.storeName,
      tagline: brandingForm.tagline,
      logoUrl: brandingForm.logoUrl,
      phone: brandingForm.phone,
      whatsapp: brandingForm.whatsapp,
      email: brandingForm.email,
      address: brandingForm.address,
      instagram: brandingForm.instagram,
      tiktok: brandingForm.tiktok,
      currency: brandingForm.currency,
      announcement: {
        enabled: brandingForm.announcementEnabled,
        text: brandingForm.announcementText,
        linkText: brandingForm.announcementLink,
      },
      heroBanner: {
        title: brandingForm.heroTitle,
        subtitle: brandingForm.heroSubtitle,
        ctaText: brandingForm.heroCta,
        imageUrl: brandingForm.heroImage,
        discountBadge: brandingForm.heroBadge,
      },
      contactInfo: {
        ...(settings.contactInfo || {}),
        title: brandingForm.contactTitle,
        subtitle: brandingForm.contactSubtitle,
        workingHours: brandingForm.workingHours,
        customerServiceNote: brandingForm.customerServiceNote,
      },
    });
    showNotification('تم حفظ إعدادات الهوية والتواصل بنجاح!');
  };

  // Customer Service Channel Handlers (Add, Edit, Delete, Toggle)
  const handleOpenAddChannel = () => {
    setEditingChannelId(null);
    setChannelForm({
      name: '',
      type: 'whatsapp',
      value: '',
      subtitle: '',
      enabled: true,
    });
    setIsChannelModalOpen(true);
  };

  const handleEditChannel = (channel: CustomerServiceChannel) => {
    setEditingChannelId(channel.id);
    setChannelForm({
      name: channel.name,
      type: channel.type,
      value: channel.value,
      subtitle: channel.subtitle || '',
      enabled: channel.enabled !== false,
    });
    setIsChannelModalOpen(true);
  };

  const handleSaveChannel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!channelForm.name.trim() || !channelForm.value.trim()) return;

    if (editingChannelId) {
      updateCustomerServiceChannel(editingChannelId, {
        name: channelForm.name.trim(),
        type: channelForm.type,
        value: channelForm.value.trim(),
        subtitle: channelForm.subtitle.trim(),
        enabled: channelForm.enabled,
      });
      showNotification('تم تحديث وسيلة خدمة العملاء بنجاح!');
    } else {
      addCustomerServiceChannel({
        name: channelForm.name.trim(),
        type: channelForm.type,
        value: channelForm.value.trim(),
        subtitle: channelForm.subtitle.trim(),
        enabled: channelForm.enabled,
      });
      showNotification('تمت إضافة وسيلة خدمة عملاء جديدة بنجاح!');
    }
    setIsChannelModalOpen(false);
  };

  const handleDeleteChannel = (id: string, name: string) => {
    if (confirm(`هل أنتِ متأكدة من حذف وسيلة خدمة العملاء "${name}" نهائياً من المتجر؟`)) {
      deleteCustomerServiceChannel(id);
      showNotification(`تم حذف وسيلة خدمة العملاء "${name}" بنجاح`);
    }
  };

  const handleToggleCustomerServiceGlobal = () => {
    const isCurrentlyActive = settings.contactInfo?.enabled !== false;
    updateCustomerServiceConfig({ enabled: !isCurrentlyActive });
    showNotification(
      !isCurrentlyActive
        ? 'تم تفعيل وإظهار خدمة العملاء في المتجر بنجاح!'
        : 'تم إخفاء/تعطيل خدمة العملاء من المتجر'
    );
  };

  // Support Message Edit & Clear Handlers
  const handleOpenEditMessage = (msg: SupportMessage) => {
    setEditingMessage(msg);
    setEditMessageForm({
      customerName: msg.customerName,
      customerPhone: msg.customerPhone || '',
      customerEmail: msg.customerEmail,
      subject: msg.subject || '',
      message: msg.message,
      replyNotes: msg.replyNotes || '',
      status: msg.status,
    });
    setIsEditMessageModalOpen(true);
  };

  const handleSaveEditMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMessage) return;
    editSupportMessage(editingMessage.id, {
      customerName: editMessageForm.customerName.trim(),
      customerPhone: editMessageForm.customerPhone.trim(),
      customerEmail: editMessageForm.customerEmail.trim(),
      subject: editMessageForm.subject.trim(),
      message: editMessageForm.message.trim(),
      replyNotes: editMessageForm.replyNotes.trim(),
      status: editMessageForm.status,
    });
    setIsEditMessageModalOpen(false);
    showNotification('تم حفظ وتعديل رسالة خدمة العملاء بنجاح!');
  };

  const handleClearReadMessages = () => {
    const readCount = supportMessages.filter((m) => m.status === 'read' || m.status === 'replied').length;
    if (readCount === 0) {
      showNotification('لا توجد رسائل مقروءة أو تم الرد عليها لحذفها.');
      return;
    }
    if (confirm(`هل ترغبين في حذف جميع الرسائل المقروءة والتي تم الرد عليها (${readCount} رسالة) لتنظيف السجل؟`)) {
      supportMessages
        .filter((m) => m.status === 'read' || m.status === 'replied')
        .forEach((m) => deleteSupportMessage(m.id));
      showNotification('تم تنظيف وحذف الرسائل المقروءة بنجاح');
    }
  };


  // Save About Us
  const handleSaveAboutUs = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      aboutUs: {
        ...(settings.aboutUs || defaultAboutUs),
        ...aboutForm,
      },
    });
    showNotification('تم حفظ وتحديث صفحة وقسم «من نحن» بنجاح! التغييرات مفعلة فوراً للجميع');
  };

  const handleResetAboutUs = () => {
    if (confirm('هل ترغب في استعادة النصوص والبيانات الافتراضية لقسم «من نحن»؟')) {
      const resetData = {
        badge: defaultAboutUs.badge,
        badgeEn: defaultAboutUs.badgeEn || '',
        badgeKu: defaultAboutUs.badgeKu || '',
        title: defaultAboutUs.title,
        titleEn: defaultAboutUs.titleEn || '',
        titleKu: defaultAboutUs.titleKu || '',
        subtitle: defaultAboutUs.subtitle,
        subtitleEn: defaultAboutUs.subtitleEn || '',
        subtitleKu: defaultAboutUs.subtitleKu || '',
        story: defaultAboutUs.story,
        storyEn: defaultAboutUs.storyEn || '',
        storyKu: defaultAboutUs.storyKu || '',
        mission: defaultAboutUs.mission,
        missionEn: defaultAboutUs.missionEn || '',
        missionKu: defaultAboutUs.missionKu || '',
        imageUrl: defaultAboutUs.imageUrl,
        secondaryImageUrl: defaultAboutUs.secondaryImageUrl || '',
        gallery: defaultAboutUs.gallery || [],
        experienceYears: defaultAboutUs.experienceYears || '+3 سنوات من الإبداع',
        satisfiedCustomers: defaultAboutUs.satisfiedCustomers || '+10,000 زبون راضٍ',
        everlastingGuarantee: defaultAboutUs.everlastingGuarantee || '100% ورد لا يذبل',
      };
      setAboutForm(resetData);
      updateSettings({
        aboutUs: defaultAboutUs,
      });
      showNotification('تمت استعادة البيانات الافتراضية لقسم «من نحن»');
    }
  };

  // Add Promo Code
  const handleAddPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoForm.code) return;
    addPromoCode({
      code: promoForm.code.toUpperCase(),
      discountPercent: Number(promoForm.discountPercent),
      minOrder: Number(promoForm.minOrder),
      active: true,
    });
    setPromoForm({ code: '', discountPercent: 15, minOrder: 150 });
    showNotification('تم إنشاء كود الخصم الجديد!');
  };

  // Button Customization Handlers
  const handleSaveButtonTexts = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (currentUser?.role !== 'admin') {
      showNotification('عذراً، الصلاحية محصورة بالمدير العام فقط');
      return;
    }
    updateButtonTexts(buttonsForm);
    showNotification('تم حفظ وتحديث جميع أسماء الأزرار واللغات بنجاح! تظهر الآن مباشرة للزوار');
  };

  const handleResetButtonTexts = () => {
    if (currentUser?.role !== 'admin') {
      showNotification('عذراً، الصلاحية محصورة بالمدير العام فقط');
      return;
    }
    if (confirm('هل أنتِ متأكدة من استعادة الأسماء الافتراضية لجميع أزرار الموقع؟')) {
      resetButtonTextsToDefault();
      setButtonsForm(JSON.parse(JSON.stringify(initialButtonTranslations)));
      showNotification('تمت استعادة الأسماء الافتراضية بنجاح');
    }
  };

  const customizableButtonsConfig: {
    key: string;
    title: string;
    description: string;
    badge: string;
    icon: React.ComponentType<{ className?: string }>;
    group?: 'buttons' | 'checkout' | 'banners' | 'support' | 'categories';
  }[] = [
    // --- الأزرار الرئيسية ---
    {
      key: 'home',
      title: 'زر الرئيسية',
      description: 'زر العودة للصفحة الرئيسية في شريط التنقل العلوي، القائمة الجانبية، والفوتر',
      badge: 'القائمة العلوية والفوتر',
      icon: Home,
      group: 'buttons',
    },
    {
      key: 'shop',
      title: 'زر المتجر / تسوق الآن',
      description: 'الزر الأساسي للبدء في تصفح المنتجات في البانر الترحيبي وشريط القائمة',
      badge: 'الواجهة والهيرو',
      icon: ShoppingBag,
      group: 'buttons',
    },
    {
      key: 'categories',
      title: 'زر الأقسام',
      description: 'زر تصفح كافة أقسام وتصنيفات المتجر لورد الليكو',
      badge: 'شريط التصنيفات',
      icon: Layers,
      group: 'buttons',
    },
    {
      key: 'aboutUs',
      title: 'زر «من نحن» وقصة المتجر',
      description: 'زر الدخول لصفحة وقسم قصة وهوية المتجر في الشريط العلوي، الموبايل، والفوتر',
      badge: 'القائمة العلوية والفوتر',
      icon: Heart,
      group: 'buttons',
    },
    {
      key: 'addToCart',
      title: 'زر أضف إلى السلة',
      description: 'الزر الموجود على كل بطاقة منتج وفي نافذة التفاصيل لإضافة القطعة للسلة',
      badge: 'بطاقات المنتجات',
      icon: ShoppingBag,
      group: 'buttons',
    },
    {
      key: 'buyNow',
      title: 'زر شراء الآن',
      description: 'زر الشراء المباشر الفوري في نافذة المنتج للتخطي مباشرة لصفحة الدفع',
      badge: 'نافذة المنتج السريعة',
      icon: Zap,
      group: 'buttons',
    },
    {
      key: 'checkout',
      title: 'زر الدفع وإتمام الطلب',
      description: 'الزر الرئيسي داخل سلة المشتريات لتأكيد الشراء والانتقال للدفع',
      badge: 'سلة المشتريات',
      icon: CreditCard,
      group: 'buttons',
    },
    {
      key: 'trackOrder',
      title: 'زر تتبع الطلب',
      description: 'زر متابعة مسار الشحنات وبوالص الشحن في حساب الزبون ولوحة التتبع',
      badge: 'تتبع الشحنات',
      icon: Truck,
      group: 'buttons',
    },
    {
      key: 'login',
      title: 'زر تسجيل الدخول',
      description: 'زر فتح نافذة الدخول للحساب الشخصي أو لوحة المدير في أعلى الموقع',
      badge: 'أعلى الموقع والقوائم',
      icon: UserCheck,
      group: 'buttons',
    },
    {
      key: 'register',
      title: 'زر إنشاء حساب جديد',
      description: 'زر التسجيل والانضمام لعائلة المتجر في نافذة تسجيل الدخول',
      badge: 'نافذة الحسابات',
      icon: UserPlus,
      group: 'buttons',
    },
    {
      key: 'contactUs',
      title: 'زر تواصل معنا',
      description: 'زر الانتقال لصفحة مركز خدمة العملاء والدعم الفني المباشر',
      badge: 'شريط التنقل والفوتر',
      icon: MessageCircle,
      group: 'buttons',
    },
    {
      key: 'customerService',
      title: 'زر خدمة العملاء',
      description: 'الزر الخاص بقسم المساعدة والتواصل السريع عبر واتساب والهاتف',
      badge: 'الفوتر والدعم الفني',
      icon: Headphones,
      group: 'buttons',
    },
    {
      key: 'viewCart',
      title: 'زر عرض السلة',
      description: 'زر فتح سلة التسوق ومعاينة المنتجات المضافة وإجمالي الفاتورة',
      badge: 'شريط التنقل',
      icon: ShoppingBag,
      group: 'buttons',
    },
    {
      key: 'sendMessage',
      title: 'زر إرسال الرسالة',
      description: 'زر إرسال الرسالة أو الاستفسار المباشر في صفحة خدمة العملاء',
      badge: 'صفحة خدمة العملاء',
      icon: Send,
      group: 'buttons',
    },
    {
      key: 'viewProduct',
      title: 'زر عرض التفاصيل',
      description: 'زر المعاينة السريعة أو فتح نافذة المنتج عند تمرير الماوس',
      badge: 'بطاقات المنتجات',
      icon: Eye,
      group: 'buttons',
    },

    // --- صفحة الطلب والسلة (Checkout & Cart) ---
    {
      key: 'checkoutTitle',
      title: 'عنوان صفحة إتمام الطلب والدفع',
      description: 'العنوان البارز في نافذة إتمام وتأكيد الطلب',
      badge: 'نافذة الطلب',
      icon: FileText,
      group: 'checkout',
    },
    {
      key: 'deliveryInfoTitle',
      title: 'عنوان بيانات التوصيل والمستلم',
      description: 'عنوان قسم بيانات الزبون وعنوان الشحن في صفحة الطلب',
      badge: 'نافذة الطلب',
      icon: MapPin,
      group: 'checkout',
    },
    {
      key: 'emailAddressOptional',
      title: 'حقل البريد الإلكتروني (اختياري)',
      description: 'تسمية حقل البريد في صفحة الطلب الموضح بأنه اختياري تماماً',
      badge: 'حقل اختياري',
      icon: Mail,
      group: 'checkout',
    },
    {
      key: 'cartTitle',
      title: 'عنوان سلة المشتريات',
      description: 'العنوان العلوي في القائمة الجانبية لسلة التسوق',
      badge: 'سلة المشتريات',
      icon: ShoppingBag,
      group: 'checkout',
    },
    {
      key: 'subtotalLabel',
      title: 'مجموع المنتجات',
      description: 'نص بند المجموع الفرعي قبل الخصم والتوصيل',
      badge: 'فاتورة السلة',
      icon: Layers,
      group: 'checkout',
    },
    {
      key: 'shippingLabel',
      title: 'رسوم التوصيل',
      description: 'نص بند تكلفة شحن وتوصيل الطلب',
      badge: 'فاتورة السلة',
      icon: Truck,
      group: 'checkout',
    },
    {
      key: 'freeShippingText',
      title: 'نص التوصيل المجاني',
      description: 'يظهر عندما يستحق الزبون الشحن المجاني في السلة',
      badge: 'ميزة الشحن',
      icon: Gift,
      group: 'checkout',
    },
    {
      key: 'totalAmountLabel',
      title: 'الإجمالي النهائي للطلب',
      description: 'نص إجمالي الفاتورة النهائي المستحق للدفع',
      badge: 'إجمالي الفاتورة',
      icon: DollarSign,
      group: 'checkout',
    },
    {
      key: 'discountAppliedLabel',
      title: 'الخصم المطبق',
      description: 'نص مقدار التوفير أو الخصم المطبق بكود الكوبون',
      badge: 'خصم الكود',
      icon: Tag,
      group: 'checkout',
    },
    {
      key: 'paymentMethodTitle',
      title: 'عنوان طرق الدفع المعتمدة',
      description: 'عنوان اختيار وسيلة الدفع في صفحة الطلب',
      badge: 'خيارات الدفع',
      icon: CreditCard,
      group: 'checkout',
    },
    {
      key: 'codTitle',
      title: 'الدفع عند الاستلام',
      description: 'اسم خيار الدفع نقداً عند استلام الشحنة والمعاينة',
      badge: 'وسيلة الدفع',
      icon: DollarSign,
      group: 'checkout',
    },
    {
      key: 'orderSuccessTitle',
      title: 'تم تأكيد الطلب بنجاح',
      description: 'عنوان رسالة النجاح والتهنئة بعد إتمام الطلب',
      badge: 'تأكيد الطلب',
      icon: CheckCircle2,
      group: 'checkout',
    },

    // --- العناوين والبانرات (Banners & Headlines) ---
    {
      key: 'tagline',
      title: 'شعار المتجر (Tagline)',
      description: 'الشعار المعبر للمتجر يظهر في الهيدر والفوتر والبانرات',
      badge: 'شعار وهوية',
      icon: Heart,
      group: 'banners',
    },
    {
      key: 'welcomeTitle',
      title: 'عنوان الترحيب الرئيسي',
      description: 'عنوان شاشة الافتتاحية والمقدمة الترحيبية للزوار',
      badge: 'شاشة الترحيب',
      icon: Award,
      group: 'banners',
    },
    {
      key: 'welcomeSubtitle',
      title: 'النص التعريفي الترحيبي',
      description: 'الوصف الشارح لجودة وفخامة ورد الليكو الدائم',
      badge: 'شاشة الترحيب',
      icon: FileText,
      group: 'banners',
    },
    {
      key: 'heroBadge',
      title: 'شارة البانر الترويجي (Hero Badge)',
      description: 'الشارة الصغيرة في أعلى الواجهة الترحيبية',
      badge: 'بانر الواجهة',
      icon: Tag,
      group: 'banners',
    },
    {
      key: 'announcement',
      title: 'شريط الإعلانات العلوي',
      description: 'نص الشريط الإعلاني في أعلى الموقع عن كود الخصم والتوصيل',
      badge: 'أعلى الموقع',
      icon: Bell,
      group: 'banners',
    },
    {
      key: 'announcementLink',
      title: 'زر شريط الإعلانات',
      description: 'نص زر التوجيه السريع في الشريط الإعلاني',
      badge: 'الشريط الإعلاني',
      icon: ExternalLink,
      group: 'banners',
    },
    {
      key: 'allProductsTitle',
      title: 'عنوان تشكيلة المنتجات',
      description: 'العنوان الرئيسي لقسم عرض المنتجات في الصفحة',
      badge: 'شبكة المنتجات',
      icon: Package,
      group: 'banners',
    },
    {
      key: 'searchPlaceholder',
      title: 'نص خانة البحث',
      description: 'النص الإرشادي في حقل البحث عن المنتجات',
      badge: 'شريط البحث',
      icon: Search,
      group: 'banners',
    },

    // --- الضمانات وخدمة الزبائن (Support & Guarantees) ---
    {
      key: 'guaranteeOriginal',
      title: 'ضمان المنتجات الأصلية 100%',
      description: 'شارة التحقق من جودة وأصالة قطع ورد الليكو الفاخرة',
      badge: 'شارة الثقة',
      icon: ShieldCheck,
      group: 'support',
    },
    {
      key: 'guaranteeFastShipping',
      title: 'ضمان الشحن لجميع العراق',
      description: 'شارة التوصيل والشحن لكافة محافظات العراق',
      badge: 'شارة الثقة',
      icon: Truck,
      group: 'support',
    },
    {
      key: 'guaranteeEasyReturn',
      title: 'ضمان الإرجاع السهل والمرن',
      description: 'شارة سياسة الإرجاع والاستبدال المرنة',
      badge: 'شارة الثقة',
      icon: RotateCcw,
      group: 'support',
    },
    {
      key: 'customerServiceTitle',
      title: 'عنوان مركز خدمة العملاء',
      description: 'العنوان في صفحة التواصل والدعم الفني',
      badge: 'صفحة التواصل',
      icon: Phone,
      group: 'support',
    },
    {
      key: 'trackOrderModalTitle',
      title: 'عنوان سجل وتتبع مسار الطلبات',
      description: 'عنوان نافذة متابعة الشحنات والطرود',
      badge: 'تتبع الطلبات',
      icon: MapPin,
      group: 'support',
    },

    // --- مسميات الأقسام الرئيسية (Categories) ---
    {
      key: 'catFlowers',
      title: 'قسم ورود ليغو الفاخرة',
      description: 'مسمى تصنيف ورود ليغو الفاخرة بألوانها وتفاصيلها المتقنة',
      badge: 'تصنيفات المتجر',
      icon: Heart,
      group: 'categories',
    },
    {
      key: 'catGiftBoxes',
      title: 'قسم بوكسات ورد الليكو للإهداء',
      description: 'مسمى تصنيف بوكسات الهدايا والتغليف الفاخر',
      badge: 'تصنيفات المتجر',
      icon: Gift,
      group: 'categories',
    },
  ];

  // Order Tracking & Status Update Handlers
  const openStatusUpdateModal = (ord: Order) => {
    setSelectedOrderForStatus(ord);
    const nextStatus: OrderStatus =
      ord.status === 'pending'
        ? 'processing'
        : ord.status === 'processing'
        ? 'shipped'
        : ord.status === 'shipped'
        ? 'delivered'
        : ord.status;

    const defaultCarrier = ord.shippingCarrier || 'أرجوان إكسبريس (بغداد والمحافظات)';
    const defaultTracking =
      ord.trackingNumber || `KZK-${Math.floor(100000 + Math.random() * 900000)}`;

    const defaultMessages: Record<OrderStatus, string> = {
      pending: `عزيزتي ${ord.customerName}، تم استلام طلبكِ رقم ${ord.id} في متجر KAZAKI.IQ وهو بانتظار التجهيز.`,
      processing: `عزيزتي ${ord.customerName}، بدأنا الآن بتجهيز وتغليف طلبكِ رقم ${ord.id} بكل عناية واهتمام في متجر KAZAKI.IQ.`,
      shipped: `مرحباً ${ord.customerName}، تم تسليم طلبكِ رقم ${ord.id} لشركة ${defaultCarrier} برقم تتبع ${defaultTracking}. شحنتكِ في الطريق إليكِ!`,
      delivered: `شكراً لتسوقكِ من KAZAKI.IQ! تم توصيل طلبكِ رقم ${ord.id} بنجاح. نأمل أن تنال منتجاتنا إعجابكِ ورضاكِ.`,
      cancelled: `عزيزتي ${ord.customerName}، نود إعلامكِ بأنه تم تحديث حالة طلبكِ رقم ${ord.id} إلى ملغي. لأي استفسار يرجى مراسلة خدمة العملاء.`,
      returned: `عزيزتي ${ord.customerName}، نود إعلامكِ بأنه تم تسجيل إرجاع الشحنة الخاصة بطلبكِ رقم ${ord.id} إلى المستودع.`,
    };

    setStatusUpdateForm({
      status: nextStatus,
      trackingNumber: defaultTracking,
      shippingCarrier: defaultCarrier,
      note: '',
      sendNotification: true,
      channel: 'whatsapp',
      customMessage: defaultMessages[nextStatus] || '',
    });
    setIsStatusModalOpen(true);
  };

  const handleApplyStatusUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderForStatus) return;

    updateOrderStatus(selectedOrderForStatus.id, statusUpdateForm.status, {
      trackingNumber: statusUpdateForm.trackingNumber,
      shippingCarrier: statusUpdateForm.shippingCarrier,
      note: statusUpdateForm.note,
      sendNotification: statusUpdateForm.sendNotification,
      notificationChannel: statusUpdateForm.channel,
      customMessage: statusUpdateForm.customMessage,
    });

    showNotification(
      `تم تحديث حالة الطلب ${selectedOrderForStatus.id} وإرسال الإشعار للعميل بنجاح!`
    );

    if (statusUpdateForm.channel === 'whatsapp' && statusUpdateForm.sendNotification) {
      const cleanPhone = (selectedOrderForStatus.customerPhone || '').replace(/[^0-9]/g, '');
      if (cleanPhone) {
        const textEncoded = encodeURIComponent(statusUpdateForm.customMessage);
        window.open(`https://wa.me/${cleanPhone}?text=${textEncoded}`, '_blank');
      }
    }

    setIsStatusModalOpen(false);
  };

  const openTimelineModal = (ord: Order) => {
    setSelectedOrderForTimeline(ord);
    setIsTimelineModalOpen(true);
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((ord) => {
      const matchesStatus = orderStatusFilter === 'all' || ord.status === orderStatusFilter;
      const q = orderSearchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        ord.id.toLowerCase().includes(q) ||
        ord.customerName.toLowerCase().includes(q) ||
        ord.customerPhone.toLowerCase().includes(q) ||
        ord.city.toLowerCase().includes(q) ||
        (ord.trackingNumber && ord.trackingNumber.toLowerCase().includes(q));

      return matchesStatus && matchesSearch;
    });
  }, [orders, orderStatusFilter, orderSearchQuery]);

  const handleSaveNotificationSettings = () => {
    updateSettings({
      ...settings,
      notificationSettings: notifSettings,
    });
    setNotifSavedToast(true);
    setTimeout(() => setNotifSavedToast(false), 3500);
  };

  const handleTestChime = () => {
    playNotificationChime();
  };

  const handleTestBrowserPush = async () => {
    const granted = await requestBrowserNotificationPermission();
    if (granted) {
      showBrowserNotification('تجربة إشعارات متجر KAZAKI.IQ', {
        body: 'تهانينا! نظام الإشعارات الفورية للمتجر يعمل على متصفحك بنجاح',
      });
    } else {
      alert('يرجى السماح بالإشعارات من نافذة المتصفح لتفعيل التنبيهات المنبثقة.');
    }
  };

  const handleTestTelegram = async () => {
    if (!notifSettings.telegramBotToken || !notifSettings.telegramChatId) {
      setTelegramTestResult({
        success: false,
        message: 'يرجى إدخال Token و Chat ID أولاً لتجربة الاتصال.',
      });
      return;
    }
    setTelegramTesting(true);
    setTelegramTestResult(null);
    try {
      const res = await testTelegramBot(
        notifSettings.telegramBotToken,
        notifSettings.telegramChatId,
        settings.storeName
      );
      setTelegramTestResult(res);
    } catch (e: any) {
      setTelegramTestResult({ success: false, message: e.message || 'حدث خطأ أثناء الاتصال' });
    } finally {
      setTelegramTesting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50/60 via-white to-rose-50/40 text-stone-900 pb-20 text-right font-sans antialiased selection:bg-rose-200 selection:text-rose-900">
      {/* Top Admin Header Bar - Luxury Rose & Stone Palette */}
      <div className="bg-white/90 backdrop-blur-md text-stone-900 py-5 px-4 sm:px-6 lg:px-8 border-b border-rose-100 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-600 to-pink-500 flex items-center justify-center text-white shadow-md shadow-rose-200">
              <Sliders className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black text-stone-900 tracking-wide">لوحة تحكم المدير العام</h1>
                <span className="bg-rose-50 text-rose-700 text-[10px] px-2.5 py-0.5 rounded-full border border-rose-200 font-bold">
                  تحكم مباشر وفوري
                </span>
              </div>
              <p className="text-xs text-stone-500">
                إدارة المنتجات، الأسعار، الأقسام، والمبيعات والطلبات بسهولة واحترافية
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                const url = window.location.origin;
                navigator.clipboard.writeText(url);
                showNotification('تم نسخ رابط المتجر إلى الحافظة بنجاح');
              }}
              className="px-4 py-2 rounded-full bg-white hover:bg-rose-50 text-stone-700 border border-rose-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
              title="نسخ رابط المتجر لنشره ومشاركته مع العملاء"
            >
              <Share2 className="w-3.5 h-3.5 text-rose-600" />
              <span>نسخ رابط المتجر</span>
            </button>
            <button
              onClick={() => setActiveView('home')}
              className="px-4 py-2 rounded-full bg-gradient-to-r from-rose-600 to-pink-500 hover:from-rose-500 hover:to-pink-600 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-rose-200"
            >
              <Eye className="w-3.5 h-3.5 text-white" />
              <span>مشاهدة المتجر كزبون</span>
            </button>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {saveSuccessMsg && (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50 bg-stone-900 text-white border border-stone-700 px-6 py-2.5 rounded-full shadow-2xl text-xs font-bold animate-in fade-in slide-in-from-top-4 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {/* Real-time Manager Hub & Live Alert Signals Bar */}
        <div className="mb-4 bg-white rounded-2xl p-3.5 sm:p-4 border border-rose-100 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping absolute" />
              <span className="w-3 h-3 rounded-full bg-emerald-500 relative" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-stone-900 text-xs">نظام استقبال الطلبات والمحادثات المباشر</span>
                <span className="bg-emerald-50 text-emerald-700 text-[10px] px-2 py-0.5 rounded-full font-bold border border-emerald-200">
                  متصل لحظياً
                </span>
              </div>
              <p className="text-[11px] text-stone-500 mt-0.5">
                تصلك التنبيهات الفورية مع صوت الرنين للطلبات ومحادثات الدعم عبر كافة الأجهزة والمتصفحات.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Quick Filter: Pending Orders */}
            <button
              type="button"
              onClick={() => {
                setActiveTab('orders');
                setOrderStatusFilter('pending');
                setOrderSearchQuery('');
              }}
              className="py-1.5 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-rose-600" />
              <span>طلبات جديدة بانتظار التجهيز:</span>
              <span className="bg-rose-600 text-white text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold">
                {orders.filter((o) => o.status === 'pending').length}
              </span>
            </button>

            {/* Quick Jump: Unread Support Chats */}
            <button
              type="button"
              onClick={() => {
                setActiveTab('contact');
              }}
              className="py-1.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
              <span>محادثات زبائن غير مقروءة:</span>
              <span className="bg-emerald-600 text-white text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold">
                {supportMessages.filter((m) => m.status === 'new').length}
              </span>
            </button>

            {/* Quick Jump: Admin Notifications */}
            <button
              type="button"
              onClick={() => {
                setIsCustomerNotifsModalOpen(true);
              }}
              className="py-1.5 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Bell className="w-3.5 h-3.5 text-amber-600" />
              <span>إشعارات الإدارة:</span>
              <span className="bg-amber-600 text-white text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold">
                {adminNotifications.filter((n) => !n.read).length}
              </span>
            </button>

            {/* Test Alarm Chime */}
            <button
              type="button"
              onClick={testManagerAlarmChime}
              className="py-1.5 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              title="فحص صوت رنين التنبيه الموسيقي للطلبات الجديدة"
            >
              <Volume2 className="w-3.5 h-3.5 text-rose-600" />
              <span>جرس الطلبات</span>
            </button>

            {/* Test Support Chime */}
            <button
              type="button"
              onClick={testSupportMessageChime}
              className="py-1.5 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              title="فحص صوت رنين محادثات خدمة العملاء"
            >
              <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>جرس الدعم</span>
            </button>

            {/* Phone Web Push Notification (Runs even when phone is locked / outside Chrome) */}
            <button
              type="button"
              onClick={async () => {
                if (!phoneNotificationsEnabled) {
                  await togglePhoneNotifications();
                } else {
                  sendPhoneTestNotification();
                }
              }}
              className={`py-1.5 px-3 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer border ${
                phoneNotificationsEnabled
                  ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300'
                  : 'bg-rose-50 hover:bg-rose-100 text-rose-800 border-rose-300 animate-pulse'
              }`}
              title="تفعيل وفحص إشعار هاتف الأدمن المباشر حتى لو كان الهاتف مقفلاً أو خارج متصفح كروم"
            >
              <Smartphone className={`w-3.5 h-3.5 ${phoneNotificationsEnabled ? 'text-emerald-600' : 'text-rose-600'}`} />
              <span>
                {phoneNotificationsEnabled
                  ? 'فحص إشعار الهاتف (خارج كروم / شاشة مقفلة)'
                  : 'تفعيل إشعارات هاتف الأدمن (خارج كروم)'}
              </span>
            </button>
          </div>
        </div>

        {/* Real-time Order Alert Banner for Admin */}
        {newOrderAlert && (
          <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-stone-900 via-rose-950 to-stone-900 text-white shadow-2xl border-2 border-rose-500/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in slide-in-from-top-4 duration-300 ring-4 ring-rose-500/20">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-rose-600/50 animate-pulse">
                <BellRing className="w-6 h-6 animate-bounce" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-black uppercase tracking-wider bg-rose-600 text-white px-2.5 py-0.5 rounded-full shadow-xs">
                    طلب جديد وارد الآن!
                  </span>
                  <span className="text-xs font-mono text-rose-300 font-bold">#{newOrderAlert.orderId}</span>
                  <span className="text-xs text-stone-400 font-mono">• {newOrderAlert.time}</span>
                </div>
                <h4 className="text-sm sm:text-base font-extrabold truncate mt-1 text-white">
                  طلب جديد من الزبونة «{newOrderAlert.customerName}» بمبلغ {newOrderAlert.amount?.toLocaleString('ar-IQ')} د.ع
                </h4>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('orders');
                  setTargetOrderFilter(newOrderAlert.orderId);
                  clearNewOrderAlert();
                }}
                className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs shadow-lg shadow-rose-600/40 transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>معاينة وتجهيز الطلب فوراً</span>
                <ArrowRight className="w-4 h-4 rtl:rotate-180" />
              </button>
              <button
                type="button"
                onClick={clearNewOrderAlert}
                className="p-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors cursor-pointer"
                title="إخفاء التنبيه"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Navigation Tabs - Matching Project Rose / White Theme */}
        <div className="flex overflow-x-auto gap-2 p-1.5 bg-white rounded-2xl border border-rose-200/80 shadow-2xs mb-6 scrollbar-none">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-gradient-to-r from-rose-600 to-pink-500 text-white shadow-md shadow-rose-200 font-extrabold'
                : 'text-stone-600 hover:bg-rose-50 hover:text-rose-700 font-semibold'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>نظرة عامة وإحصائيات</span>
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === 'reports'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20 font-extrabold'
                : 'text-stone-600 hover:bg-blue-50 hover:text-blue-700 font-semibold'
            }`}
          >
            <PieChart className="w-4 h-4 text-blue-500" />
            <span>شاشة التقارير والعمليات</span>
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === 'products'
                ? 'bg-gradient-to-r from-rose-600 to-pink-500 text-white shadow-md shadow-rose-200 font-extrabold'
                : 'text-stone-600 hover:bg-rose-50 hover:text-rose-700 font-semibold'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>المنتجات والأسعار ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-gradient-to-r from-rose-600 to-pink-500 text-white shadow-md shadow-rose-200 font-extrabold'
                : 'text-stone-600 hover:bg-rose-50 hover:text-rose-700 font-semibold'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>إدارة الطلبات والتتبع ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === 'categories'
                ? 'bg-gradient-to-r from-rose-600 to-pink-500 text-white shadow-md shadow-rose-200 font-extrabold'
                : 'text-stone-600 hover:bg-rose-50 hover:text-rose-700 font-semibold'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>الأقسام ({categories.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('branding')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === 'branding'
                ? 'bg-gradient-to-r from-rose-600 to-pink-500 text-white shadow-md shadow-rose-200 font-extrabold'
                : 'text-stone-600 hover:bg-rose-50 hover:text-rose-700 font-semibold'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>هوية المتجر والعروض</span>
          </button>

          <button
            onClick={() => setActiveTab('contact')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === 'contact'
                ? 'bg-gradient-to-r from-rose-600 to-pink-500 text-white shadow-md shadow-rose-200 font-extrabold'
                : 'text-stone-600 hover:bg-rose-50 hover:text-rose-700 font-semibold'
            }`}
          >
            <Headphones className="w-4 h-4 text-emerald-600" />
            <span>خدمة العملاء (تعديل وحذف)</span>
          </button>

          <button
            onClick={() => setActiveTab('about')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === 'about'
                ? 'bg-gradient-to-r from-rose-600 to-pink-500 text-white shadow-md shadow-rose-200 font-extrabold'
                : 'text-stone-600 hover:bg-rose-50 hover:text-rose-700 font-semibold'
            }`}
          >
            <Heart className="w-4 h-4 text-rose-500" />
            <span>«من نحن» وقصة المتجر</span>
          </button>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-in fade-in">
            {/* KPI Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-rose-100 shadow-2xs">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-stone-500">إجمالي المبيعات</span>
                  <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
                    <DollarSign className="w-5 h-5" />
                  </div>
                </div>
                <h3 className="text-2xl font-black text-stone-900">
                  {totalRevenue} {settings.currency}
                </h3>
                <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">
                  ↑ +18.4% نمو هذا الشهر
                </span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-rose-100 shadow-2xs">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-stone-500">عدد الطلبات الكلي</span>
                  <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                </div>
                <h3 className="text-2xl font-black text-stone-900">{totalOrdersCount}</h3>
                <span className="text-[11px] text-stone-500 mt-1 block">
                  منها {pendingOrdersCount} طلبات قيد المعالجة
                </span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-rose-100 shadow-2xs">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-stone-500">المنتجات المعروضة</span>
                  <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600">
                    <Package className="w-5 h-5" />
                  </div>
                </div>
                <h3 className="text-2xl font-black text-stone-900">{products.length}</h3>
                <span className="text-[11px] text-stone-500 mt-1 block">
                  موزعة على {categories.length} أقسام رئيسية
                </span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-rose-100 shadow-2xs">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-stone-500">حالة المتجر</span>
                  <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                </div>
                <h3 className="text-lg font-bold text-stone-900">
                  نشط وجاهز للطلبات
                </h3>
                <span className="text-[11px] text-stone-500 mt-1 block">
                  مزامنة لحظية وتنبيهات فورية مفعلة
                </span>
              </div>
            </div>

            {/* Quick Link to Operations Reports */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-4 text-white flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md shadow-blue-500/15">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-md">
                  <PieChart className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">شاشة تقارير العمليات وحركة الشحنات</h4>
                  <p className="text-xs text-blue-100">
                    متابعة لحظية لأعلى 5 محافظات، الشحنات المستلمة والراجعة، ومبالغ التسليم
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('reports')}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-white text-blue-700 text-xs font-bold hover:bg-blue-50 transition-colors shadow-xs cursor-pointer shrink-0"
              >
                فتح شاشة التقارير
              </button>
            </div>

            {/* Recent Orders Overview */}
            <div className="bg-white rounded-2xl border border-rose-100 p-5 shadow-2xs">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-rose-50">
                <h3 className="font-bold text-sm text-stone-900">أحدث الطلبات الواردة</h3>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="text-xs font-bold text-rose-600 hover:text-rose-700 cursor-pointer"
                >
                  عرض كل الطلبات ({orders.length})
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-right">
                  <thead>
                    <tr className="text-stone-400 border-b border-rose-50">
                      <th className="py-2.5 font-semibold">رقم الطلب</th>
                      <th className="py-2.5 font-semibold">الزبونة</th>
                      <th className="py-2.5 font-semibold">المبلغ</th>
                      <th className="py-2.5 font-semibold">الحالة</th>
                      <th className="py-2.5 font-semibold">الإجراء</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-rose-50">
                    {orders.slice(0, 5).map((ord) => (
                      <tr key={ord.id} className="hover:bg-rose-50/40 transition-colors">
                        <td className="py-3 font-bold text-stone-900">{ord.id}</td>
                        <td className="py-3">
                          <span className="font-semibold block">{ord.customerName}</span>
                          <span className="text-[10px] text-stone-400">{ord.city}</span>
                        </td>
                        <td className="py-3 font-bold text-rose-600">
                          {ord.finalAmount} {settings.currency}
                        </td>
                        <td className="py-3">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              ord.status === 'delivered'
                                ? 'bg-emerald-100 text-emerald-800'
                                : ord.status === 'shipped'
                                ? 'bg-blue-100 text-blue-800'
                                : ord.status === 'processing'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {ord.status === 'delivered'
                              ? 'تم التوصيل'
                              : ord.status === 'shipped'
                              ? 'تم الشحن'
                              : ord.status === 'processing'
                              ? 'قيد التجهيز'
                              : 'قيد الانتظار'}
                          </span>
                        </td>
                        <td className="py-3">
                          <button
                            onClick={() => setActiveTab('orders')}
                            className="text-stone-600 hover:text-rose-600 font-semibold cursor-pointer"
                          >
                            إدارة
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB: OPERATIONS & SHIPMENT REPORTS */}
        {activeTab === 'reports' && <ReportsView />}

        {/* TAB 2: PRODUCTS MANAGEMENT */}
        {activeTab === 'products' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-rose-100">
              <div>
                <h3 className="font-bold text-sm text-stone-900">إدارة المنتجات والأسعار والمخزون</h3>
                <p className="text-xs text-stone-500">
                  يمكنك تعديل الأسعار مباشرة بالنقر على حقل السعر، أو النقر على زر التعديل الشامل وحذف المنتجات
                </p>
              </div>
              <button
                onClick={handleOpenAddProduct}
                className="px-4 py-2 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة منتج جديد</span>
              </button>
            </div>

            {/* Quick Search & Category Filter Toolbar */}
            <div className="flex flex-wrap items-center gap-3 bg-white p-3.5 rounded-2xl border border-rose-100">
              <div className="relative flex-1 min-w-[220px]">
                <Search className="w-4 h-4 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="ابحث عن اسم المنتج، السعر، أو الوصف..."
                  value={adminProductSearch}
                  onChange={(e) => setAdminProductSearch(e.target.value)}
                  className="w-full pr-9 pl-3 py-2 text-xs border border-rose-200 rounded-xl bg-rose-50/20 focus:bg-white outline-hidden focus:border-rose-400"
                />
              </div>

              <select
                value={adminProductCatFilter}
                onChange={(e) => setAdminProductCatFilter(e.target.value)}
                className="px-3.5 py-2 text-xs border border-rose-200 rounded-xl bg-white text-stone-700 outline-hidden font-bold cursor-pointer"
              >
                <option value="all">جميع الأقسام ({products.length})</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({products.filter((p) => p.categoryId === c.id).length})
                  </option>
                ))}
              </select>

              <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-3 py-2 rounded-xl border border-rose-100">
                المنتجات: {filteredAdminProducts.length} من {products.length}
              </span>
            </div>

            {/* Products Table */}
            <div className="bg-white rounded-2xl border border-rose-100 shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-right">
                  <thead className="bg-rose-50/50 text-stone-600 border-b border-rose-100">
                    <tr>
                      <th className="p-3.5 font-bold">المنتج والصورة</th>
                      <th className="p-3.5 font-bold">القسم</th>
                      <th className="p-3.5 font-bold">السعر الأصلي</th>
                      <th className="p-3.5 font-bold">حالة الخصم والتحكم</th>
                      <th className="p-3.5 font-bold">السعر بعد الخصم (الحالي)</th>
                      <th className="p-3.5 font-bold">المخزون والتوفر</th>
                      <th className="p-3.5 font-bold">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-rose-50">
                    {filteredAdminProducts.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-stone-400 text-xs">
                          لا توجد منتجات مطابقة لخيارات البحث
                        </td>
                      </tr>
                    ) : (
                      filteredAdminProducts.map((prod) => {
                        const cat = categories.find((c) => c.id === prod.categoryId);
                        const hasDiscount = Boolean(prod.originalPrice && prod.originalPrice > prod.price);
                        const currentDiscountPercent = hasDiscount
                          ? Math.round((((prod.originalPrice! - prod.price) / prod.originalPrice!) * 100))
                          : 0;

                        return (
                          <tr key={prod.id} className="hover:bg-rose-50/30 transition-colors">
                            <td className="p-3.5">
                              <div className="flex items-center gap-3">
                                <img
                                  src={prod.image}
                                  alt={prod.title}
                                  className="w-12 h-12 rounded-xl object-cover bg-rose-50 border border-rose-100 shrink-0"
                                />
                                <div className="min-w-0">
                                  <h4 className="font-bold text-stone-900 truncate max-w-xs">
                                    {prod.title}
                                  </h4>
                                  <span className="text-[10px] text-stone-400 block">
                                    {prod.volumeOrSize || 'عادي'}
                                  </span>
                                </div>
                              </div>
                            </td>

                            <td className="p-3.5">
                              <span className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 font-medium text-[11px]">
                                {cat?.name || prod.categoryId}
                              </span>
                            </td>

                            {/* Base / Original Price */}
                            <td className="p-3.5">
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="number"
                                  min={1}
                                  defaultValue={hasDiscount ? prod.originalPrice : prod.price}
                                  key={`orig-${prod.id}-${prod.originalPrice}-${prod.price}`}
                                  onBlur={(e) => {
                                    const val = Number(e.target.value);
                                    if (!isNaN(val) && val > 0) {
                                      if (hasDiscount) {
                                        if (val !== prod.originalPrice) {
                                          updateProduct(prod.id, { originalPrice: val });
                                          showNotification(`تم تحديث السعر الأصلي لـ "${prod.title}"`);
                                        }
                                      } else {
                                        if (val !== prod.price) {
                                          updateProduct(prod.id, { price: val });
                                          showNotification(`تم تحديث سعر "${prod.title}" إلى ${val} ${settings.currency}`);
                                        }
                                      }
                                    }
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      (e.target as HTMLInputElement).blur();
                                    }
                                  }}
                                  className={`w-24 px-2 py-1.5 rounded-lg border text-xs text-center outline-hidden transition-all ${
                                    hasDiscount
                                      ? 'border-stone-300 bg-stone-50 text-stone-500 line-through'
                                      : 'border-rose-200 focus:border-rose-500 bg-white font-bold text-stone-900 shadow-2xs'
                                  }`}
                                  title={hasDiscount ? 'السعر الأصلي قبل الخصم' : 'السعر الأصلي للمنتج'}
                                />
                                <span className="text-[10px] text-stone-400 font-medium">{settings.currency}</span>
                              </div>
                            </td>

                            {/* Discount Action & Preset Buttons */}
                            <td className="p-3.5">
                              <div className="flex flex-col gap-1.5">
                                {hasDiscount ? (
                                  <div className="flex items-center gap-1.5">
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500 text-white text-[11px] font-black shadow-2xs">
                                      <Percent className="w-3 h-3" />
                                      <span>خصم {currentDiscountPercent}%</span>
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveDiscount(prod)}
                                      className="px-2 py-1 rounded-lg border border-stone-200 hover:border-red-300 bg-white hover:bg-red-50 text-stone-500 hover:text-red-600 text-[10px] font-bold transition-all cursor-pointer"
                                      title="إلغاء الخصم واسترجاع السعر الأصلي"
                                    >
                                      إلغاء
                                    </button>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-1">
                                    <button
                                      type="button"
                                      onClick={() => handleApplyQuickDiscount(prod, 10)}
                                      className="px-2 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[10px] font-bold transition-all cursor-pointer hover:scale-105 active:scale-95"
                                      title="تفعيل خصم 10% فوراً بضغطة زر"
                                    >
                                      10%
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleApplyQuickDiscount(prod, 15)}
                                      className="px-2 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[10px] font-bold transition-all cursor-pointer hover:scale-105 active:scale-95"
                                      title="تفعيل خصم 15% فوراً بضغطة زر"
                                    >
                                      15%
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleApplyQuickDiscount(prod, 20)}
                                      className="px-2 py-1 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-800 border border-rose-300 text-[10px] font-black transition-all cursor-pointer hover:scale-105 active:scale-95"
                                      title="تفعيل خصم 20% فوراً بضغطة زر"
                                    >
                                      20%
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleOpenDiscountModal(prod)}
                                      className="px-2 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-[10px] font-bold transition-all cursor-pointer"
                                      title="تخصيص نسبة الخصم أو السعر بعد الخصم"
                                    >
                                      تخصيص
                                    </button>
                                  </div>
                                )}
                              </div>
                            </td>

                            {/* Final Price after Discount (Price to Customer) */}
                            <td className="p-3.5">
                              <div className="flex items-center gap-1.5 font-bold">
                                <input
                                  type="number"
                                  min={1}
                                  value={prod.price}
                                  key={`final-price-${prod.id}-${prod.price}`}
                                  onChange={(e) => {
                                    const val = Number(e.target.value);
                                    if (!isNaN(val) && val > 0) {
                                      // If already has originalPrice or basePrice
                                      const basePrice = (prod.originalPrice && prod.originalPrice > prod.price) ? prod.originalPrice : undefined;
                                      updateProduct(prod.id, {
                                        price: val,
                                        originalPrice: basePrice && basePrice > val ? basePrice : undefined,
                                      });
                                    }
                                  }}
                                  className={`w-24 px-2 py-1.5 rounded-lg border text-xs font-black text-center outline-hidden transition-all shadow-2xs ${
                                    hasDiscount
                                      ? 'border-rose-400 bg-rose-50/50 text-rose-700 font-extrabold focus:bg-white'
                                      : 'border-rose-200 focus:border-rose-500 bg-rose-50/30 text-stone-900 focus:bg-white'
                                  }`}
                                  title="السعر الفعلي الذي يدفعه الزبون بعد الخصم (تعديل مباشر)"
                                />
                                <span className={`text-[11px] font-bold ${hasDiscount ? 'text-rose-600' : 'text-stone-500'}`}>
                                  {settings.currency}
                                </span>
                              </div>
                            </td>

                            <td className="p-3.5">
                              <button
                                onClick={() =>
                                  updateProduct(prod.id, {
                                    inStock: !prod.inStock,
                                    stockCount: !prod.inStock ? 10 : 0,
                                  })
                                }
                                className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-colors cursor-pointer ${
                                  prod.inStock
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : 'bg-red-50 text-red-700 border-red-200'
                                }`}
                              >
                                {prod.inStock ? `متوفر (${prod.stockCount})` : 'نفد المخزون'}
                              </button>
                            </td>

                            <td className="p-3.5">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleOpenEditProduct(prod)}
                                  className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                                  title="تعديل تفاصيل المنتج والأسعار"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                  <span>تعديل</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setProductToDelete(prod)}
                                  className="p-1.5 rounded-lg bg-stone-100 hover:bg-red-50 text-stone-400 hover:text-red-600 transition-colors cursor-pointer border border-transparent hover:border-red-200"
                                  title="حذف المنتج"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: ORDERS MANAGEMENT & TRACKING SYSTEM */}
        {activeTab === 'orders' && (
          <div className="space-y-6 animate-in fade-in">
            {/* Header & Stats Bar */}
            <div className="bg-white rounded-3xl p-6 border border-rose-100 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-bold mb-1">
                    <Truck className="w-3.5 h-3.5" />
                    <span>نظام التتبع وإشعارات العملاء</span>
                  </div>
                  <h3 className="font-bold text-base text-stone-900">
                    لوحة تتبع حالات الطلبات وإرسال إشعارات التوصيل الفورية
                  </h3>
                  <p className="text-xs text-stone-500">
                    يمكنكِ تحديث حالة كل طلب (قيد المعالجة، تم الشحن، تم التوصيل) وإرسال إشعار فوري للعميل عبر الواتساب أو حسابه في المتجر.
                  </p>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <span className="text-xs font-bold text-stone-700 bg-stone-100 px-3 py-1.5 rounded-full">
                    إجمالي الطلبات: {orders.length}
                  </span>
                </div>
              </div>

              {/* Status Filter Badges */}
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-rose-50">
                <span className="text-xs font-bold text-stone-600 flex items-center gap-1 ml-1">
                  <Filter className="w-3.5 h-3.5 text-stone-400" />
                  <span>تصفية:</span>
                </span>
                {[
                  { key: 'all', label: 'الكل', count: orders.length },
                  {
                    key: 'pending',
                    label: 'قيد الانتظار',
                    count: orders.filter((o) => o.status === 'pending').length,
                    color: 'text-amber-700 bg-amber-50 border-amber-200',
                  },
                  {
                    key: 'processing',
                    label: 'قيد المعالجة',
                    count: orders.filter((o) => o.status === 'processing').length,
                    color: 'text-rose-700 bg-rose-50 border-rose-200',
                  },
                  {
                    key: 'shipped',
                    label: 'تم الشحن',
                    count: orders.filter((o) => o.status === 'shipped').length,
                    color: 'text-blue-700 bg-blue-50 border-blue-200',
                  },
                  {
                    key: 'delivered',
                    label: 'تم التوصيل',
                    count: orders.filter((o) => o.status === 'delivered').length,
                    color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
                  },
                  {
                    key: 'cancelled',
                    label: 'ملغي',
                    count: orders.filter((o) => o.status === 'cancelled').length,
                    color: 'text-red-700 bg-red-50 border-red-200',
                  },
                ].map((st) => (
                  <button
                    key={st.key}
                    type="button"
                    onClick={() => setOrderStatusFilter(st.key as any)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                      orderStatusFilter === st.key
                        ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                        : 'bg-white text-stone-600 border-stone-200 hover:border-rose-300'
                    }`}
                  >
                    <span>{st.label}</span>
                    <span className="mr-1 text-[10px] opacity-80">({st.count})</span>
                  </button>
                ))}
              </div>

              {/* Search Bar */}
              <div className="relative">
                <input
                  type="text"
                  value={orderSearchQuery}
                  onChange={(e) => setOrderSearchQuery(e.target.value)}
                  placeholder="ابحثي برقم الطلب (ORD-...)، اسم الزبون، رقم الهاتف، المحافظة، أو رقم التتبع..."
                  className="w-full text-xs border border-rose-200 rounded-xl py-2.5 pr-9 pl-4 bg-rose-50/20 focus:bg-white outline-hidden focus:border-rose-400"
                />
                <Search className="w-4 h-4 text-stone-400 absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>

            {/* Orders List */}
            {filteredOrders.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-rose-100 space-y-2">
                <Truck className="w-10 h-10 text-stone-300 mx-auto" />
                <h4 className="text-sm font-bold text-stone-800">لا توجد طلبات مطابقة للبحث أو التصفية</h4>
                <p className="text-xs text-stone-500">جربي تغيير فلتر الحالة أو مسح نص البحث</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((ord) => {
                  const cleanPhone = (ord.customerPhone || '').replace(/[^0-9]/g, '');
                  const currentStatus = ord.status;
                  const stepIndex =
                    currentStatus === 'pending'
                      ? 0
                      : currentStatus === 'processing'
                      ? 1
                      : currentStatus === 'shipped'
                      ? 2
                      : currentStatus === 'delivered'
                      ? 3
                      : -1;

                  const statusBadges: Record<OrderStatus, { text: string; bg: string }> = {
                    pending: { text: 'قيد الانتظار', bg: 'bg-amber-100 text-amber-900 border-amber-300' },
                    processing: { text: 'قيد المعالجة والتجهيز', bg: 'bg-rose-100 text-rose-900 border-rose-300' },
                    shipped: { text: 'تم الشحن مع الناقل', bg: 'bg-blue-100 text-blue-900 border-blue-300' },
                    delivered: { text: 'تم التوصيل بنجاح', bg: 'bg-emerald-100 text-emerald-900 border-emerald-300' },
                    cancelled: { text: 'طلب ملغي', bg: 'bg-red-100 text-red-900 border-red-300' },
                    returned: { text: 'شحنة راجعة', bg: 'bg-purple-100 text-purple-900 border-purple-300' },
                  };

                  return (
                    <div
                      key={ord.id}
                      className="bg-white rounded-3xl border border-rose-100 p-6 shadow-2xs hover:shadow-md transition-all space-y-5"
                    >
                      {/* Top Header of Card */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-rose-50">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2.5">
                            <span className="text-base font-black text-stone-900 font-mono tracking-tight">
                              {ord.id}
                            </span>
                            <span
                              className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                                statusBadges[ord.status].bg
                              }`}
                            >
                              {statusBadges[ord.status].text}
                            </span>
                          </div>
                          <span className="text-[11px] text-stone-400 block">
                            تاريخ الإنشاء: {new Date(ord.createdAt).toLocaleDateString('ar-IQ')} - الساعة{' '}
                            {new Date(ord.createdAt).toLocaleTimeString('ar-IQ', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>

                        {/* Payment & Amount */}
                        <div className="flex items-center gap-4 text-left">
                          <div className="text-right sm:text-left">
                            <span className="text-[10px] text-stone-400 block font-semibold">طريقة الدفع</span>
                            <span
                              className={`text-xs font-bold px-2 py-0.5 rounded-md inline-block ${
                                ord.paymentMethod === 'cod'
                                  ? 'bg-emerald-50 text-emerald-800'
                                  : 'bg-amber-50 text-amber-900'
                              }`}
                            >
                              {ord.paymentMethod === 'cod' ? 'الدفع عند الاستلام' : 'ماستركارد الرافدين'}
                            </span>
                          </div>

                          <div className="text-left border-r pr-4 border-rose-100">
                            <span className="text-[10px] text-stone-400 block font-semibold">المبلغ النهائي</span>
                            <span className="text-base font-black text-rose-600 font-mono">
                              {ord.finalAmount.toLocaleString('en-US')} {settings.currency}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Customer Details & Address */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs bg-rose-50/30 p-4 rounded-2xl border border-rose-100">
                        <div className="space-y-1">
                          <p className="font-bold text-stone-900 flex items-center gap-1.5">
                            <span>العميل:</span>
                            <span className="text-rose-700">{ord.customerName}</span>
                          </p>
                          <div className="flex flex-wrap items-center gap-2 text-stone-600">
                            <span dir="ltr">{ord.customerPhone}</span>
                            {cleanPhone && (
                              <a
                                href={`https://wa.me/${cleanPhone}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-emerald-700 bg-emerald-100 hover:bg-emerald-200 px-2 py-0.5 rounded-md font-bold text-[10px] flex items-center gap-1"
                              >
                                <MessageCircle className="w-3 h-3" />
                                <span>محادثة واتساب</span>
                              </a>
                            )}
                            <a
                              href={`tel:${ord.customerPhone}`}
                              className="text-stone-700 bg-stone-200 hover:bg-stone-300 px-2 py-0.5 rounded-md font-semibold text-[10px]"
                            >
                              اتصال
                            </a>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <p className="font-bold text-stone-900">
                            المحافظة والعنوان: <span className="font-semibold text-stone-700">{ord.city} - {ord.address}</span>
                          </p>
                          {ord.notes && (
                            <p className="text-[11px] text-stone-500 bg-white/80 p-1.5 rounded-lg border border-stone-200">
                              ملاحظة العميل: {ord.notes}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Visual Order Tracking Stepper */}
                      <div className="py-2">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-rose-500" />
                            <span>مراحل مسار وتتبع الطلب (Live Tracking):</span>
                          </span>

                          <span className="text-[11px] text-stone-500">
                            {currentStatus === 'cancelled'
                              ? 'الطلب ملغي'
                              : `المرحلة الحالية: ${statusBadges[currentStatus].text}`}
                          </span>
                        </div>

                        {currentStatus === 'cancelled' ? (
                          <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs font-bold flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-red-600" />
                            <span>تم إلغاء هذا الطلب وإخطار العميل بذلك.</span>
                          </div>
                        ) : (
                          <div className="grid grid-cols-4 gap-2">
                            {[
                              { label: 'تم الطلب', sub: 'استلام وتأكيد' },
                              { label: 'قيد المعالجة', sub: 'تجهيز وتغليف' },
                              { label: 'تم الشحن', sub: 'مع المندوب' },
                              { label: 'تم التوصيل', sub: 'تسليم بنجاح' },
                            ].map((step, idx) => {
                              const isCompleted = stepIndex >= idx;
                              const isCurrent = stepIndex === idx;

                              return (
                                <div
                                  key={idx}
                                  className={`p-3 rounded-2xl border text-center transition-all ${
                                    isCurrent
                                      ? 'bg-gradient-to-b from-rose-50 to-pink-50 border-rose-300 ring-2 ring-rose-200 shadow-2xs'
                                      : isCompleted
                                      ? 'bg-emerald-50/60 border-emerald-200'
                                      : 'bg-stone-50/60 border-stone-200 opacity-60'
                                  }`}
                                >
                                  <div className="flex justify-center mb-1">
                                    <div
                                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                        isCompleted
                                          ? 'bg-emerald-600 text-white'
                                          : 'bg-stone-200 text-stone-600'
                                      }`}
                                    >
                                      {isCompleted ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                                    </div>
                                  </div>
                                  <p
                                    className={`text-xs font-bold ${
                                      isCurrent
                                        ? 'text-rose-700'
                                        : isCompleted
                                        ? 'text-emerald-800'
                                        : 'text-stone-600'
                                    }`}
                                  >
                                    {step.label}
                                  </p>
                                  <span className="text-[10px] text-stone-400 block">{step.sub}</span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Carrier & Tracking Number Strip */}
                      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-stone-50 border border-stone-200 text-xs">
                        <div className="flex flex-wrap items-center gap-3">
                          <div className="flex items-center gap-1.5 text-stone-700">
                            <Truck className="w-4 h-4 text-rose-600" />
                            <span className="font-semibold">شركة الشحن:</span>
                            <span className="font-bold text-stone-900 bg-white px-2 py-0.5 rounded-md border border-stone-200">
                              {ord.shippingCarrier || 'أرجوان إكسبريس (بغداد)'}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 text-stone-700">
                            <span className="font-semibold">رقم التتبع:</span>
                            <span className="font-mono font-bold text-rose-700 bg-white px-2.5 py-0.5 rounded-md border border-rose-200" dir="ltr">
                              {ord.trackingNumber || 'قيد الإصدار'}
                            </span>
                            {ord.trackingNumber && (
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(ord.trackingNumber || '');
                                  showNotification('تم نسخ رقم التتبع');
                                }}
                                className="p-1 hover:bg-stone-200 rounded text-stone-500 cursor-pointer"
                                title="نسخ رقم التتبع"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Sent Notifications Count */}
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-stone-600 bg-white px-2.5 py-1 rounded-full border border-stone-200">
                            <Bell className="w-3 h-3 text-rose-500" />
                            <span>{ord.notifications?.length || 0} إشعارات مرسلة للعميل</span>
                          </span>
                        </div>
                      </div>

                      {/* Items Ordered Thumbnails */}
                      <div className="space-y-1.5 pt-1">
                        <span className="text-[11px] font-bold text-stone-600 block">
                          المنتجات المطلوبة ({ord.items.reduce((s, i) => s + i.quantity, 0)} قطع):
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {ord.items.map((it, idx) => (
                            <div
                              key={idx}
                              className="flex items-center gap-2 bg-white border border-rose-100 rounded-xl p-1.5 pr-2 text-xs shadow-2xs"
                            >
                              <img
                                src={it.product.image}
                                alt={it.product.title}
                                className="w-8 h-8 rounded-lg object-cover"
                              />
                              <div>
                                <span className="font-bold text-stone-800 block text-[11px] max-w-[150px] truncate">
                                  {it.product.title}
                                </span>
                                <span className="text-rose-600 font-bold text-[10px]">
                                  {it.quantity} × {it.product.price} {settings.currency}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Action Buttons: Status Update Modal, Timeline, Direct WhatsApp */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-rose-100">
                        <div className="flex flex-wrap items-center gap-2">
                          {/* PRIMARY: Open Status Update & Notification Modal */}
                          <button
                            type="button"
                            onClick={() => openStatusUpdateModal(ord)}
                            className="px-4 py-2.5 rounded-full bg-gradient-to-r from-rose-600 to-pink-500 hover:from-rose-500 hover:to-pink-600 text-white font-bold text-xs shadow-sm hover:shadow flex items-center gap-2 cursor-pointer transition-all"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>تحديث الحالة وإرسال إشعار للعميل</span>
                          </button>

                          {/* SECONDARY: View Full Timeline History */}
                          <button
                            type="button"
                            onClick={() => openTimelineModal(ord)}
                            className="px-4 py-2.5 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs flex items-center gap-2 cursor-pointer transition-colors"
                          >
                            <History className="w-3.5 h-3.5 text-stone-600" />
                            <span>سجل التتبع الزمني ({ord.statusHistory?.length || 1})</span>
                          </button>
                        </div>

                        {/* WhatsApp Fast Notification Button */}
                        {cleanPhone && (
                          <button
                            type="button"
                            onClick={() => {
                              const message = `مرحباً ${ord.customerName}، نود إعلامكِ بأن حالة طلبكِ رقم ${ord.id} في متجر KAZAKI.IQ هي الآن: (${statusBadges[ord.status].text}). رقم بوليصة الشحن: ${ord.trackingNumber || 'قيد الإصدار'}. شكراً لتسوقكِ معنا!`;
                              window.open(
                                `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`,
                                '_blank'
                              );
                            }}
                            className="px-3.5 py-2 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                            <span>إشعار واتساب فوري</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: BUTTON TEXTS & MULTILINGUAL CUSTOMIZER (تعديل وتخصيص أسماء الأزرار) */}
        {activeTab === 'buttons' && (
          <div className="space-y-6 animate-in fade-in">
            {/* Header Card */}
            <div className="bg-white rounded-3xl p-6 border border-rose-100 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-bold mb-1">
                    <Languages className="w-3.5 h-3.5 text-rose-600" />
                    <span>تخصيص الواجهة واللغات (AR / EN / KU)</span>
                  </div>
                  <h3 className="font-black text-lg text-stone-900">
                    تعديل وتخصيص أسماء جميع أزرار المتجر والموقع
                  </h3>
                  <p className="text-xs text-stone-500 max-w-2xl leading-relaxed mt-0.5">
                    يمكن للمدير هنا تغيير اسم أي زر في الموقع (الرئيسية، المتجر، الأقسام، أضف إلى السلة، شراء الآن، تسجيل الدخول، تواصل معنا، خدمة العملاء، الدفع، تتبع الطلب وغيرها). التغييرات تظهر مباشرة وفوراً لكافة الزوار بعد الحفظ، مع دعم كامل للغات الثلاث.
                  </p>
                </div>

                {/* Top Action Buttons */}
                <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={handleResetButtonTexts}
                    className="px-4 py-2.5 rounded-full border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-stone-500" />
                    <span>استعادة الافتراضي</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveButtonTexts}
                    className="px-6 py-2.5 rounded-full bg-gradient-to-r from-rose-600 to-pink-500 hover:from-rose-500 hover:to-pink-600 text-white text-xs font-bold shadow-md shadow-rose-200 hover:shadow-lg flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>حفظ جميع التغييرات</span>
                  </button>
                </div>
              </div>

              {/* Admin-only guarantee notice */}
              <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-amber-900 text-xs flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  <span className="font-semibold">
                    صلاحية التعديل محصورة بالمدير العام فقط ({currentUser?.email || 'admin'}). لا يستطيع المستخدم العادي تعديل هذه النصوص.
                  </span>
                </div>
                <span className="text-[10px] font-bold bg-amber-200/70 text-amber-800 px-2.5 py-0.5 rounded-full">
                  محمي وموثق
                </span>
              </div>

              {/* Category Filter Tabs */}
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-rose-50">
                <span className="text-xs font-bold text-stone-600 flex items-center gap-1">
                  <span>الأقسام:</span>
                </span>
                {[
                  { id: 'all', label: `جميع النصوص (${customizableButtonsConfig.length})` },
                  { id: 'buttons', label: 'الأزرار الرئيسية' },
                  { id: 'checkout', label: 'صفحة وسلة الطلب' },
                  { id: 'banners', label: 'العناوين والبانرات' },
                  { id: 'support', label: 'الضمانات والدعم' },
                  { id: 'categories', label: 'أقسام المتجر' },
                ].map((gTab) => (
                  <button
                    key={gTab.id}
                    type="button"
                    onClick={() => setActiveTextCategoryTab(gTab.id as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                      activeTextCategoryTab === gTab.id
                        ? 'bg-rose-600 text-white border-rose-600 shadow-2xs'
                        : 'bg-white text-stone-600 border-stone-200 hover:border-rose-300'
                    }`}
                  >
                    {gTab.label}
                  </button>
                ))}
              </div>

              {/* Search in buttons */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-rose-50">
                <div className="relative w-full sm:w-80">
                  <input
                    type="text"
                    value={buttonSearchQuery}
                    onChange={(e) => setButtonSearchQuery(e.target.value)}
                    placeholder="ابحثي عن أي زر أو نص..."
                    className="w-full text-xs border border-rose-200 rounded-xl py-2 pr-8 pl-3 bg-rose-50/20 focus:bg-white outline-hidden focus:border-rose-400"
                  />
                  <Search className="w-3.5 h-3.5 text-stone-400 absolute right-2.5 top-2.5 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Buttons Customization Cards Grid */}
            <form onSubmit={handleSaveButtonTexts} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {customizableButtonsConfig
                  .filter((b) => {
                    if (activeTextCategoryTab !== 'all' && (b as any).group !== activeTextCategoryTab) {
                      return false;
                    }
                    if (!buttonSearchQuery.trim()) return true;
                    const q = buttonSearchQuery.toLowerCase();
                    return (
                      b.title.toLowerCase().includes(q) ||
                      b.description.toLowerCase().includes(q) ||
                      String(b.key).toLowerCase().includes(q) ||
                      buttonsForm[b.key]?.ar?.toLowerCase().includes(q)
                    );
                  })
                  .map((btn) => {
                    const fallbackValues = initialSiteTexts[btn.key] || initialButtonTranslations[btn.key] || { ar: '' };
                    const currentValues = buttonsForm[btn.key] || fallbackValues;
                    const effectiveAr = (currentValues.ar && currentValues.ar.trim() !== '') ? currentValues.ar : (fallbackValues.ar || '');

                    return (
                      <div
                        key={btn.key}
                        className="bg-white rounded-3xl border border-rose-100 p-5 shadow-2xs hover:shadow-md hover:border-rose-200 transition-all space-y-4 text-right flex flex-col justify-between"
                      >
                        {/* Card Header */}
                        <div>
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div className="flex items-center gap-2">
                              <span className="w-8 h-8 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-700 shadow-2xs"><btn.icon className="w-4 h-4" /></span>
                              <div>
                                <h4 className="font-extrabold text-sm text-stone-900">
                                  {btn.title}
                                </h4>
                                <span className="text-[10px] font-mono text-stone-400">
                                  مفتاح الزر: {btn.key}
                                </span>
                              </div>
                            </div>

                            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-100">
                              {btn.badge}
                            </span>
                          </div>

                          <p className="text-[11px] text-stone-500 leading-relaxed">
                            {btn.description}
                          </p>

                          {/* Live Button Preview */}
                          <div className="mt-3 p-3 rounded-2xl bg-stone-50/70 border border-stone-100 space-y-1.5">
                            <div className="text-[10px] text-stone-400 font-semibold text-right">
                              <span>معاينة مظهر الزر المباشر للزوار:</span>
                            </div>

                            {/* Rendered Preview Button */}
                            <div className="flex items-center justify-center pt-1">
                              <div className="px-5 py-2 rounded-full bg-gradient-to-r from-rose-600 to-pink-500 text-white font-bold text-xs shadow-xs text-center">
                                <span>{effectiveAr}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Input Field for Button Text */}
                        <div className="space-y-3 pt-2 border-t border-rose-50">
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className="text-[11px] font-bold text-stone-800 flex items-center gap-1">
                                <span>نص الزر / العبارة (بالعربية):</span>
                              </label>
                            </div>
                            <input
                              type="text"
                              dir="rtl"
                              value={effectiveAr}
                              onChange={(e) =>
                                setButtonsForm({
                                  ...buttonsForm,
                                  [btn.key]: {
                                    ...currentValues,
                                    ar: e.target.value,
                                  },
                                })
                              }
                              placeholder={fallbackValues.ar}
                              className="w-full text-xs font-semibold border border-rose-200 rounded-xl px-3.5 py-2 bg-rose-50/20 focus:bg-white outline-hidden focus:border-rose-500 transition-colors"
                            />
                          </div>

                          {/* Reset Single Button to Default */}
                          <div className="flex justify-end pt-1">
                            <button
                              type="button"
                              onClick={() => {
                                setButtonsForm({
                                  ...buttonsForm,
                                  [btn.key]: { ...initialButtonTranslations[btn.key] },
                                });
                                showNotification(`تم استعادة الاسم الافتراضي لـ (${btn.title})`);
                              }}
                              className="text-[10px] text-stone-400 hover:text-stone-700 underline cursor-pointer"
                            >
                              استعادة الاسم الافتراضي لهذا الزر فقط ↩️
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>

              {/* Bottom Sticky Save Bar */}
              <div className="p-5 rounded-3xl bg-white border border-rose-100 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <p className="font-black text-xs text-stone-900 flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span>جاهز للحفظ والتطبيق المباشر على الموقع</span>
                  </p>
                  <p className="text-[11px] text-stone-500">
                    بمجرد النقر على حفظ، سيتغير اسم كل زر في واجهة الزوار فوراً وبدون الحاجة لإعادة تحميل الصفحة.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleResetButtonTexts}
                    className="px-5 py-2.5 rounded-full border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-bold cursor-pointer"
                  >
                    استعادة جميع الأسماء الافتراضية
                  </button>

                  <button
                    type="submit"
                    className="px-8 py-2.5 rounded-full bg-gradient-to-r from-rose-600 to-pink-500 hover:from-rose-500 hover:to-pink-600 text-white font-black text-xs shadow-md shadow-rose-200 hover:shadow-lg transition-all cursor-pointer flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>حفظ جميع التغييرات الآن</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* TAB 5: CATEGORIES */}
        {activeTab === 'categories' && (
          <div className="space-y-4 animate-in fade-in">
            {/* Standalone Segregation Notice for "من نحن" */}
            <div className="bg-gradient-to-r from-pink-50 via-rose-50 to-pink-50 p-4 rounded-2xl border border-pink-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-pink-100 text-pink-700 shrink-0 mt-0.5">
                  <Languages className="w-4 h-4 text-pink-600" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-pink-900">
                    تم إزالة وفصل «من نحن» تماماً عن أقسام المنتجات ووضعها كصفحة وقسم مستقل وحدها
                  </h4>
                  <p className="text-[11px] text-pink-800 leading-relaxed mt-0.5">
                    وفقاً للتنظيم الجديد، لا تُعتبر «من نحن» تصنيفاً للمنتجات. تم عزلها بالكامل في تبويب مستقل خاص بها لإدارة القصة والرسالة والمزايا، لتقتصر الأقسام هنا على بوكسات وورود ليغو فقط.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('about')}
                className="px-4 py-2 rounded-xl bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold shrink-0 transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer mr-auto sm:mr-0"
              >
                <span>إدارة صفحة «من نحن» المستقلة</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-rose-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-stone-900">أقسام وتصنيفات المتجر</h3>
                <p className="text-xs text-stone-500">
                  إدارة وتعديل جميع الأقسام، تغيير أسماء الأقسام بكافة اللغات، وتعديل الوصف والصور
                </p>
              </div>
              <button
                onClick={handleOpenAddCategory}
                className="px-4 py-2 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs flex items-center gap-2 cursor-pointer transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة قسم جديد</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((cat) => {
                const count = products.filter((p) => p.categoryId === cat.id).length;
                return (
                  <div
                    key={cat.id}
                    className="bg-white rounded-2xl border border-rose-100 p-5 shadow-2xs hover:border-rose-300 transition-all flex flex-col justify-between gap-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-16 h-16 rounded-2xl overflow-hidden bg-rose-50 border border-rose-100 shrink-0 flex items-center justify-center relative">
                        {cat.image ? (
                          <img
                            src={cat.image}
                            alt={cat.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.currentTarget;
                              target.style.display = 'none';
                              const fallback = target.parentElement?.querySelector('.cat-admin-fallback') as HTMLElement;
                              if (fallback) fallback.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div
                          className="cat-admin-fallback w-full h-full flex items-center justify-center text-rose-300"
                          style={{ display: cat.image ? 'none' : 'flex' }}
                        >
                          <Package className="w-6 h-6" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-stone-900 text-sm truncate">{cat.name}</h4>
                        <p className="text-xs text-stone-500 line-clamp-2 mt-1.5">
                          {cat.description || 'لا يوجد وصف'}
                        </p>
                        <span className="text-[11px] font-semibold text-rose-600 mt-1 block">
                          {count} منتجات مرتبطة بهذا القسم
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-rose-50">
                      <button
                        onClick={() => handleEditCategory(cat)}
                        className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                        title="تعديل اسم وبيانات القسم"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>تعديل القسم وتغيير الاسم</span>
                      </button>

                      <button
                        onClick={() => {
                          if (categories.length <= 1) {
                            showNotification('لا يمكن حذف القسم الأخير في المتجر! يجب الإبقاء على قسم واحد على الأقل');
                            return;
                          }
                          const warning = count > 0
                            ? `هل أنت متأكد من حذف قسم "${cat.name}"؟\n\nتنبيه: يحتوي هذا القسم على (${count}) منتجات، سيتم نقلها تلقائياً إلى قسم آخر لحمايتها من الضياع وعدم حذفها.`
                            : `هل أنت متأكد من حذف قسم "${cat.name}"؟`;
                          if (confirm(warning)) {
                            deleteCategory(cat.id);
                            showNotification(`تم حذف قسم "${cat.name}" بنجاح`);
                          }
                        }}
                        className="px-2.5 py-1.5 text-stone-400 hover:text-red-600 rounded-xl hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors cursor-pointer flex items-center gap-1 text-xs font-semibold"
                        title="حذف القسم"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>حذف</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 6: BRANDING & OFFERS */}
        {activeTab === 'branding' && (
          <div className="space-y-6 animate-in fade-in">
            {/* Branding Settings Form */}
            <form onSubmit={handleSaveBranding} className="bg-white rounded-2xl border border-rose-100 p-6 shadow-2xs space-y-6">
              <h3 className="font-bold text-base text-stone-900 pb-3 border-b border-rose-100">
                هوية المتجر، النصوص، وصور الصفحة الرئيسية
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">اسم المتجر</label>
                  <input
                    type="text"
                    value={brandingForm.storeName}
                    onChange={(e) => setBrandingForm({ ...brandingForm, storeName: e.target.value })}
                    className="w-full text-xs border border-rose-200 rounded-xl px-3.5 py-2.5 bg-rose-50/20 focus:bg-white outline-hidden focus:border-rose-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">الشعار اللفظي (Tagline)</label>
                  <input
                    type="text"
                    value={brandingForm.tagline}
                    onChange={(e) => setBrandingForm({ ...brandingForm, tagline: e.target.value })}
                    className="w-full text-xs border border-rose-200 rounded-xl px-3.5 py-2.5 bg-rose-50/20 focus:bg-white outline-hidden focus:border-rose-400"
                  />
                </div>

                <div className="sm:col-span-2">
                  <StudioMediaUploader
                    label="لوغو المتجر الرسمي (الشعار المرئي)"
                    value={brandingForm.logoUrl || '/logo.jpg'}
                    onChange={(val) => setBrandingForm({ ...brandingForm, logoUrl: val })}
                    mediaType="image"
                    helperText="يظهر هذا اللوغو في الهيدر، الفوتر، شاشة الترحيب، وكافة صفحات المتجر"
                  />
                </div>
              </div>

              {/* Announcement Bar */}
              <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-100 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-800">شريط الإعلانات العلوي</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={brandingForm.announcementEnabled}
                      onChange={(e) => setBrandingForm({ ...brandingForm, announcementEnabled: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-stone-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
                  </label>
                </div>

                <input
                  type="text"
                  value={brandingForm.announcementText}
                  onChange={(e) => setBrandingForm({ ...brandingForm, announcementText: e.target.value })}
                  placeholder="نص الإعلان العلوي..."
                  className="w-full text-xs border border-rose-200 rounded-xl px-3.5 py-2.5 bg-white outline-hidden focus:border-rose-400"
                />
              </div>

              {/* Hero Banner Controls */}
              <div className="space-y-4 pt-2">
                <h4 className="text-xs font-bold text-rose-800 uppercase tracking-wider">
                  واجهة البانر الرئيسي (Hero Section)
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      العنوان الرئيسي
                    </label>
                    <input
                      type="text"
                      value={brandingForm.heroTitle}
                      onChange={(e) => setBrandingForm({ ...brandingForm, heroTitle: e.target.value })}
                      className="w-full text-xs border border-rose-200 rounded-xl px-3.5 py-2.5 bg-rose-50/20 focus:bg-white outline-hidden focus:border-rose-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      شارة الخصم أو العرض
                    </label>
                    <input
                      type="text"
                      value={brandingForm.heroBadge}
                      onChange={(e) => setBrandingForm({ ...brandingForm, heroBadge: e.target.value })}
                      className="w-full text-xs border border-rose-200 rounded-xl px-3.5 py-2.5 bg-rose-50/20 focus:bg-white outline-hidden focus:border-rose-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    الوصف التفصيلي للبانر
                  </label>
                  <textarea
                    rows={2}
                    value={brandingForm.heroSubtitle}
                    onChange={(e) => setBrandingForm({ ...brandingForm, heroSubtitle: e.target.value })}
                    className="w-full text-xs border border-rose-200 rounded-xl px-3.5 py-2.5 bg-rose-50/20 focus:bg-white outline-hidden focus:border-rose-400"
                  />
                </div>

                <div className="col-span-full">
                  <StudioMediaUploader
                    label="صورة أو فيديو البانر الرئيسي"
                    value={brandingForm.heroImage}
                    onChange={(val) => setBrandingForm({ ...brandingForm, heroImage: val })}
                    mediaType="both"
                    helperText="يمكنك اختيار صورة أو فيديو من استوديو هاتفك أو جهازك أو إدخال رابط مباشر"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-rose-100 flex justify-end">
                <button
                  type="submit"
                  className="px-8 py-3 rounded-full bg-gradient-to-r from-rose-600 to-pink-500 hover:from-rose-500 hover:to-pink-600 text-white font-bold text-xs shadow-md shadow-rose-300 hover:shadow-lg transition-all cursor-pointer flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>حفظ التعديلات في واجهة المتجر</span>
                </button>
              </div>
            </form>

            {/* Promo Codes Manager */}
            <div className="bg-white rounded-2xl border border-rose-100 p-6 shadow-2xs space-y-4">
              <h3 className="font-bold text-base text-stone-900 pb-3 border-b border-rose-100 flex items-center justify-between">
                <span>إدارة كوبونات وأكواد الخصم</span>
                <span className="text-xs text-stone-400 font-normal">
                  يحصل الزبائن على خصم فوري في السلة عند استخدام الكود
                </span>
              </h3>

              {/* Add Promo Code Form */}
              <form onSubmit={handleAddPromo} className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-rose-50/50 p-4 rounded-xl border border-rose-100">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">رمز الكوبون</label>
                  <input
                    type="text"
                    required
                    dir="ltr"
                    value={promoForm.code}
                    onChange={(e) => setPromoForm({ ...promoForm, code: e.target.value })}
                    placeholder="مثال: SUMMER25"
                    className="w-full text-xs uppercase border border-rose-200 rounded-xl px-3 py-2 bg-white outline-hidden focus:border-rose-400 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">نسبة الخصم (%)</label>
                  <input
                    type="number"
                    min={1}
                    max={99}
                    required
                    value={promoForm.discountPercent}
                    onChange={(e) => setPromoForm({ ...promoForm, discountPercent: Number(e.target.value) })}
                    className="w-full text-xs border border-rose-200 rounded-xl px-3 py-2 bg-white outline-hidden focus:border-rose-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">الحد الأدنى للطلب</label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={promoForm.minOrder}
                    onChange={(e) => setPromoForm({ ...promoForm, minOrder: Number(e.target.value) })}
                    className="w-full text-xs border border-rose-200 rounded-xl px-3 py-2 bg-white outline-hidden focus:border-rose-400"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="submit"
                    className="w-full py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    + إضافة الكود
                  </button>
                </div>
              </form>

              {/* Promo codes list */}
              <div className="space-y-2">
                {promoCodes.map((p) => (
                  <div
                    key={p.code}
                    className="flex items-center justify-between p-3 rounded-xl border border-rose-100 bg-white hover:border-rose-300 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-black text-rose-700 text-sm bg-rose-50 px-2.5 py-1 rounded-md border border-rose-200">
                        {p.code}
                      </span>
                      <span className="text-xs font-bold text-stone-800">
                        خصم {p.discountPercent}%
                      </span>
                      <span className="text-[11px] text-stone-400">
                        (للطلبات فوق {p.minOrder} {settings.currency})
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => togglePromoCode(p.code)}
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full border transition-colors cursor-pointer ${
                          p.active
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-stone-100 text-stone-500 border-stone-200'
                        }`}
                      >
                        {p.active ? 'مفعل' : 'معطل'}
                      </button>

                      <button
                        onClick={() => deletePromoCode(p.code)}
                        className="p-1 text-stone-400 hover:text-red-500 cursor-pointer"
                        title="حذف الكوبون"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: CUSTOMER SERVICE & CONTACT MANAGEMENT */}
        {activeTab === 'contact' && (
          <div className="space-y-6 animate-in fade-in">
            {/* Top Info Banner */}
            <div className="bg-white rounded-3xl p-6 border border-rose-100 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-right">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-bold mb-1">
                  <Headphones className="w-3.5 h-3.5" />
                  <span>مركز خدمة العملاء وإعدادات التواصل</span>
                </div>
                <h3 className="text-lg font-bold text-stone-900">
                  التحكم الكامل بصفحة تواصل معنا وأرقام الدعم والسوشيال ميديا
                </h3>
                <p className="text-xs text-stone-500 max-w-xl">
                  جميع التعديلات هنا تنعكس فوراً وبشكل تلقائي في الصفحة الرئيسية، التذييل (Footer)، وصفحة التواصل معنا بدون أي تعديل برمجي.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setActiveView('contact')}
                className="px-5 py-2.5 rounded-full bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer shrink-0"
              >
                <ExternalLink className="w-4 h-4" />
                <span>معاينة صفحة التواصل المباشرة</span>
              </button>
            </div>

            {/* SECTION 0: 24-HOUR TEMPORARY LIVE CHATS WITH CUSTOMERS */}
            <div className="bg-white rounded-3xl p-6 border border-rose-200/80 shadow-md space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-rose-100 gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-rose-600/10 text-rose-600">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-extrabold text-sm sm:text-base text-stone-900">
                          شاشات المحادثات المباشرة المؤقتة مع الزبائن (24 ساعة)
                        </h3>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-rose-100 text-rose-700">
                          {activeTempSessions.length} جلسات نشطة
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-500">
                        محادثات فورية من داخل الموقع تنتهي وتُحذف تلقائياً بعد مرور 24 ساعة. الردود المكتوبة هنا تصل للزبون فوراً على شاشته.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      refreshTempChats();
                      showNotification('تم تحديث قائمة المحادثات المباشرة');
                    }}
                    className="px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>تحديث</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveView('contact')}
                    className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>شاشة الزبون</span>
                  </button>
                </div>
              </div>

              {activeTempSessions.length === 0 ? (
                <div className="text-center py-10 px-4 rounded-2xl bg-stone-50 border border-stone-200/60 space-y-3">
                  <div className="w-12 h-12 mx-auto rounded-2xl bg-rose-100/60 text-rose-600 flex items-center justify-center">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-stone-800">
                      لا توجد جلسات محادثة مباشرة مؤقتة نشطة حالياً
                    </h4>
                    <p className="text-[11px] text-stone-500 max-w-md mx-auto mt-1">
                      عندما يبدأ أي زبون محادثة من صفحة "اتصل بنا"، ستظهر جلسته هنا فوراً مع تنبيه صوتي وإشعار فوري ويمكنكِ الرد عليه ومتابعته طوال 24 ساعة.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                  {/* Left Column: Sessions List */}
                  <div className="lg:col-span-4 space-y-3">
                    {/* Search filter */}
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={adminChatSearch}
                        onChange={(e) => setAdminChatSearch(e.target.value)}
                        placeholder="بحث بالاسم أو الهاتف..."
                        className="w-full text-xs pr-8 pl-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-rose-400"
                      />
                    </div>

                    {/* Sessions scroll container */}
                    <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
                      {filteredTempSessions.map((session) => {
                        const isSelected = selectedSession?.id === session.id;
                        const lastMsg = session.messages[session.messages.length - 1];
                        return (
                          <div
                            key={session.id}
                            onClick={() => setSelectedTempChatId(session.id)}
                            className={`p-3 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                              isSelected
                                ? 'bg-rose-50/70 border-rose-400 shadow-xs ring-1 ring-rose-400'
                                : 'bg-white hover:bg-stone-50 border-stone-200'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-bold text-stone-900 text-xs truncate">
                                {session.customerName}
                              </span>
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-100 text-amber-800 shrink-0">
                                {getSessionRemainingTime(session.expiresAt)}
                              </span>
                            </div>

                            <div className="flex items-center justify-between text-[10px] text-stone-500">
                              <span dir="ltr" className="truncate">
                                {session.customerPhone || session.customerEmail || 'محادثة زائر'}
                              </span>
                              <span className="text-stone-400">
                                {lastMsg ? new Date(lastMsg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                              </span>
                            </div>

                            {lastMsg && (
                              <p className="text-[11px] text-stone-600 truncate bg-white/60 p-1.5 rounded-lg border border-stone-100">
                                <span className="font-semibold text-stone-700">
                                  {lastMsg.sender === 'admin' ? 'الإدارة: ' : 'الزبون: '}
                                </span>
                                {lastMsg.text}
                              </p>
                            )}

                            <div className="flex items-center justify-between pt-1">
                              <span className="text-[10px] text-rose-600 font-semibold">
                                {session.messages.length} رسالة
                              </span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  endTempChat(session.id);
                                  showNotification('تم إغلاق وحذف جلسة المحادثة');
                                }}
                                className="text-[10px] text-stone-400 hover:text-rose-600 transition-colors flex items-center gap-1 cursor-pointer"
                                title="إنهاء المحادثة"
                              >
                                <Trash2 className="w-3 h-3" />
                                <span>إنهاء</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right Column: Active Chat Feed & Reply Box */}
                  {selectedSession ? (
                    <div className="lg:col-span-8 bg-stone-50/60 rounded-2xl border border-stone-200 p-4 space-y-4 flex flex-col justify-between">
                      {/* Active Session Info Header */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-stone-200">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-stone-900">
                              {selectedSession.customerName}
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              جلسة نشطة 24 ساعة
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-[11px] text-stone-500">
                            {selectedSession.customerPhone && (
                              <div className="flex items-center gap-1">
                                <Phone className="w-3 h-3 text-stone-400" />
                                <span dir="ltr">{selectedSession.customerPhone}</span>
                                <a
                                  href={`https://wa.me/${selectedSession.customerPhone.replace(/[^0-9]/g, '')}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-emerald-600 hover:underline font-bold mr-1"
                                >
                                  (واتساب)
                                </a>
                              </div>
                            )}
                            {selectedSession.customerEmail && (
                              <div className="flex items-center gap-1">
                                <Mail className="w-3 h-3 text-stone-400" />
                                <span>{selectedSession.customerEmail}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1 px-3 py-1 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold">
                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                            <span>{getSessionRemainingTime(selectedSession.expiresAt)}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              endTempChat(selectedSession.id);
                              showNotification('تم إغلاق وحذف جلسة المحادثة');
                            }}
                            className="px-3 py-1 rounded-xl bg-stone-200 hover:bg-rose-100 hover:text-rose-700 text-stone-600 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>إغلاق المحادثة</span>
                          </button>
                        </div>
                      </div>

                      {/* Chat Messages Feed */}
                      <div className="h-72 sm:h-80 overflow-y-auto space-y-3 p-3 bg-white rounded-xl border border-stone-200/80">
                        {selectedSession.messages.map((msg) => {
                          const isAdmin = msg.sender === 'admin';
                          return (
                            <div
                              key={msg.id}
                              className={`flex flex-col ${isAdmin ? 'items-start' : 'items-end'}`}
                            >
                              <div className="flex items-center gap-1.5 mb-1 px-1">
                                <span className="text-[10px] font-bold text-stone-500">
                                  {isAdmin ? 'إدارة KAZAKI.IQ' : selectedSession.customerName}
                                </span>
                                <span className="text-[9px] text-stone-400">
                                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>

                              <div
                                className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed font-medium shadow-2xs ${
                                  isAdmin
                                    ? 'bg-stone-900 text-white rounded-tl-xs'
                                    : 'bg-rose-50 border border-rose-200 text-stone-800 rounded-tr-xs'
                                }`}
                              >
                                <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                              </div>
                            </div>
                          );
                        })}
                        <div ref={adminChatEndRef} />
                      </div>

                      {/* Quick Replies chips */}
                      <div className="space-y-1.5 pt-1">
                        <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                          ردود جاهزة وسريعة للزبون:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {adminQuickReplies.map((r, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setAdminReplyText(r)}
                              className="px-2.5 py-1 rounded-lg bg-white hover:bg-rose-50 hover:text-rose-700 text-stone-600 text-[11px] font-medium transition-colors border border-stone-200 cursor-pointer"
                            >
                              {r}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Reply Input Form */}
                      <form onSubmit={handleAdminSendReply} className="flex items-center gap-2 pt-1">
                        <input
                          type="text"
                          value={adminReplyText}
                          onChange={(e) => setAdminReplyText(e.target.value)}
                          placeholder="اكتب ردك المباشر للزبون هنا (يصل لشاشته فوراً)..."
                          className="flex-1 text-xs border border-stone-300 rounded-xl px-4 py-2.5 bg-white focus:outline-hidden focus:border-rose-500 shadow-2xs"
                        />
                        <button
                          type="submit"
                          disabled={isAdminSendingReply || !adminReplyText.trim()}
                          className="px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shrink-0"
                        >
                          <Send className={`w-3.5 h-3.5 ${isAdminSendingReply ? 'animate-pulse' : ''} rotate-180`} />
                          <span>{isAdminSendingReply ? 'جاري الإرسال...' : 'إرسال الرد للزبون'}</span>
                        </button>
                      </form>
                    </div>
                  ) : (
                    <div className="lg:col-span-8 flex items-center justify-center p-12 bg-white rounded-2xl border border-stone-200 text-stone-400 text-xs">
                      اختر محادثة من القائمة لعرض تفاصيلها والرد عليها.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* SECTION 1: CUSTOMER INQUIRIES & MESSAGES */}
            <div className="bg-white rounded-3xl p-6 border border-rose-100 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-rose-100">
                <div className="flex items-center gap-2">
                  <Inbox className="w-5 h-5 text-rose-600" />
                  <h3 className="font-bold text-sm text-stone-900">
                    رسائل واستفسارات العملاء الواردة ({supportMessages.length})
                  </h3>
                </div>
                <span className="text-xs font-semibold text-stone-500">
                  {supportMessages.filter((m) => m.status === 'new').length} رسائل جديدة تحتاج إلى متابعة
                </span>
              </div>

              {supportMessages.length === 0 ? (
                <div className="text-center py-10 text-stone-400 text-xs">
                  لا توجد رسائل دعم جديدة حالياً.
                </div>
              ) : (
                <div className="space-y-3">
                  {supportMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`p-4 rounded-2xl border transition-all text-xs space-y-3 ${
                        msg.status === 'new'
                          ? 'border-amber-200 bg-amber-50/30'
                          : msg.status === 'replied'
                          ? 'border-emerald-200 bg-emerald-50/20'
                          : 'border-stone-200 bg-white'
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <span className="font-bold text-stone-900 text-sm">{msg.customerName}</span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              msg.status === 'new'
                                ? 'bg-amber-100 text-amber-800'
                                : msg.status === 'replied'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-stone-100 text-stone-700'
                            }`}
                          >
                            {msg.status === 'new' ? 'جديدة' : msg.status === 'replied' ? 'تم الرد' : 'مقروءة'}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-stone-400 text-[11px]">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{new Date(msg.createdAt).toLocaleDateString('ar-IQ')}</span>
                        </div>
                      </div>

                      {/* Contact metadata */}
                      <div className="flex flex-wrap items-center gap-4 text-stone-600 text-[11px]">
                        {msg.customerPhone && (
                          <div className="flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-stone-400" />
                            <span dir="ltr">{msg.customerPhone}</span>
                            <a
                              href={`https://wa.me/${msg.customerPhone.replace(/[^0-9]/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-emerald-600 hover:underline font-bold mr-1"
                            >
                              (واتساب)
                            </a>
                          </div>
                        )}
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-stone-400" />
                          <span>{msg.customerEmail}</span>
                        </div>
                        {msg.subject && (
                          <div className="bg-stone-100 px-2 py-0.5 rounded-md font-semibold text-stone-700">
                            الموضوع: {msg.subject}
                          </div>
                        )}
                      </div>

                      {/* Message Content */}
                      <p className="text-stone-800 bg-white/70 p-3 rounded-xl border border-stone-100 leading-relaxed">
                        {msg.message}
                      </p>

                      {/* Reply notes if present */}
                      {msg.replyNotes && (
                        <div className="bg-emerald-50 p-2.5 rounded-xl border border-emerald-200 text-emerald-900 text-[11px]">
                          <span className="font-bold block mb-0.5">ملاحظة الرد الإداري:</span>
                          <span>{msg.replyNotes}</span>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-stone-100">
                        <div className="flex items-center gap-2">
                          {msg.status !== 'replied' && (
                            <button
                              type="button"
                              onClick={() => {
                                const note = prompt('أدخلي ملاحظة الرد أو ما تم الاتفاق عليه مع الزبون:', 'تم التواصل وتلبية الطلب');
                                updateSupportMessageStatus(msg.id, 'replied', note || undefined);
                                showNotification('تم تحديث حالة الرسالة إلى تم الرد بنجاح');
                              }}
                              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition-colors cursor-pointer flex items-center gap-1.5"
                            >
                              <Check className="w-3 h-3" />
                              <span>تأكيد الرد والمتابعة</span>
                            </button>
                          )}

                          {msg.status === 'new' && (
                            <button
                              type="button"
                              onClick={() => {
                                updateSupportMessageStatus(msg.id, 'read');
                                showNotification('تم وضع علامة مقروءة');
                              }}
                              className="px-3 py-1.5 rounded-xl border border-stone-200 hover:bg-stone-100 text-stone-700 font-semibold text-[11px] transition-colors cursor-pointer"
                            >
                              تحديد كمقروءة
                            </button>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            if (confirm('هل أنتِ متأكدة من حذف هذه الرسالة نهائياً؟')) {
                              deleteSupportMessage(msg.id);
                              showNotification('تم حذف الرسالة بنجاح');
                            }
                          }}
                          className="p-1.5 text-stone-400 hover:text-red-500 transition-colors cursor-pointer"
                          title="حذف الرسالة"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* SECTION 2: EDIT CONTACT PAGE & SOCIAL MEDIA CHANNELS FORM */}
            <form onSubmit={handleSaveBranding} className="bg-white rounded-3xl p-6 sm:p-8 border border-rose-100 shadow-2xs space-y-6">
              <h3 className="font-bold text-base text-stone-900 pb-3 border-b border-rose-100 flex items-center gap-2">
                <Phone className="w-5 h-5 text-rose-600" />
                <span>تعديل أرقام الهواتف، العناوين، وصفحة التواصل معنا</span>
              </h3>

              {/* Phone, WhatsApp, Email */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    رقم الهاتف الرسمي للتواصل <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    dir="ltr"
                    value={brandingForm.phone}
                    onChange={(e) => setBrandingForm({ ...brandingForm, phone: e.target.value })}
                    placeholder="+964 770 123 4567"
                    className="w-full text-xs text-right border border-rose-200 rounded-xl px-3.5 py-2.5 bg-rose-50/20 focus:bg-white outline-hidden focus:border-rose-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    رقم الواتساب المباشر (WhatsApp) <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    dir="ltr"
                    value={brandingForm.whatsapp}
                    onChange={(e) => setBrandingForm({ ...brandingForm, whatsapp: e.target.value })}
                    placeholder="+964 770 123 4567"
                    className="w-full text-xs text-right border border-rose-200 rounded-xl px-3.5 py-2.5 bg-rose-50/20 focus:bg-white outline-hidden focus:border-rose-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    البريد الإلكتروني الرسمي <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={brandingForm.email}
                    onChange={(e) => setBrandingForm({ ...brandingForm, email: e.target.value })}
                    placeholder="info@kazaki.iq"
                    className="w-full text-xs border border-rose-200 rounded-xl px-3.5 py-2.5 bg-rose-50/20 focus:bg-white outline-hidden focus:border-rose-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  عنوان صفحة خدمة العملاء
                </label>
                <input
                  type="text"
                  value={brandingForm.contactTitle}
                  onChange={(e) => setBrandingForm({ ...brandingForm, contactTitle: e.target.value })}
                  placeholder="مركز خدمة عملاء KAZAKI.IQ"
                  className="w-full text-xs border border-rose-200 rounded-xl px-3.5 py-2.5 bg-rose-50/20 focus:bg-white outline-hidden focus:border-rose-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  الوصف الترحيبي لصفحة خدمة العملاء
                </label>
                <input
                  type="text"
                  value={brandingForm.contactSubtitle}
                  onChange={(e) => setBrandingForm({ ...brandingForm, contactSubtitle: e.target.value })}
                  placeholder="نحن هنا لخدمتكِ ومساعدتكِ في كل خطوة من تجربة تسوقكِ الفاخرة..."
                  className="w-full text-xs border border-rose-200 rounded-xl px-3.5 py-2.5 bg-rose-50/20 focus:bg-white outline-hidden focus:border-rose-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  ملاحظة ورسالة خدمة العملاء
                </label>
                <textarea
                  rows={2}
                  value={brandingForm.customerServiceNote}
                  onChange={(e) => setBrandingForm({ ...brandingForm, customerServiceNote: e.target.value })}
                  placeholder="فريق الدعم الفني متواجد للإجابة على استفساراتكم عبر واتساب والهاتف فوراً..."
                  className="w-full text-xs border border-rose-200 rounded-xl px-3.5 py-2.5 bg-rose-50/20 focus:bg-white outline-hidden focus:border-rose-400"
                />
              </div>

              {/* Social Media Links (Instagram & TikTok) */}
              <div className="pt-4 border-t border-rose-100 space-y-4">
                <h4 className="text-xs font-bold text-rose-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Share2 className="w-4 h-4" />
                  <span>روابط حسابات التواصل الاجتماعي (السوشيال ميديا)</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Instagram */}
                  <div className="p-4 rounded-2xl bg-pink-50/40 border border-pink-100 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-pink-900 flex items-center gap-1.5">
                        <Instagram className="w-4 h-4 text-pink-600" />
                        <span>رابط أو حساب Instagram</span>
                      </label>
                      <a
                        href={
                          (brandingForm.instagram || 'https://instagram.com/kazaki.iq').startsWith('http')
                            ? brandingForm.instagram || 'https://instagram.com/kazaki.iq'
                            : `https://instagram.com/${(brandingForm.instagram || 'kazaki.iq').replace('@', '')}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-pink-600 hover:underline font-bold flex items-center gap-1"
                      >
                        <span>فتح الرابط</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    <input
                      type="text"
                      dir="ltr"
                      value={brandingForm.instagram}
                      onChange={(e) => setBrandingForm({ ...brandingForm, instagram: e.target.value })}
                      placeholder="https://instagram.com/kazaki.iq"
                      className="w-full text-xs border border-pink-200 rounded-xl px-3.5 py-2 bg-white outline-hidden focus:border-pink-500 font-mono"
                    />
                  </div>

                  {/* TikTok */}
                  <div className="p-4 rounded-2xl bg-stone-100/70 border border-stone-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                        <Music className="w-4 h-4 text-stone-700" />
                        <span>رابط أو حساب TikTok</span>
                      </label>
                      <a
                        href={
                          (brandingForm.tiktok || 'https://tiktok.com/@kazaki.iq').startsWith('http')
                            ? brandingForm.tiktok || 'https://tiktok.com/@kazaki.iq'
                            : `https://tiktok.com/@${(brandingForm.tiktok || 'kazaki.iq').replace('@', '')}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-stone-700 hover:underline font-bold flex items-center gap-1"
                      >
                        <span>فتح الرابط</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    <input
                      type="text"
                      dir="ltr"
                      value={brandingForm.tiktok}
                      onChange={(e) => setBrandingForm({ ...brandingForm, tiktok: e.target.value })}
                      placeholder="https://tiktok.com/@kazaki.iq"
                      className="w-full text-xs border border-stone-300 rounded-xl px-3.5 py-2 bg-white outline-hidden focus:border-stone-500 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* PAYMENT METHODS GUARANTEE CARD */}
              <div className="p-5 rounded-2xl bg-rose-50/50 border border-rose-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-rose-900 flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-rose-600" />
                    <span>طرق الدفع المعتمدة للمتجر (محصورة حصرياً)</span>
                  </h4>
                  <span className="text-[11px] bg-rose-200/60 text-rose-800 px-2 py-0.5 rounded-full font-bold">
                    معتمدة وثابتة في النظام
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="p-3.5 rounded-xl bg-white border border-emerald-200 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700 font-bold"><DollarSign className="w-4 h-4" /></div>
                      <div>
                        <span className="text-xs font-bold text-stone-900 block">الدفع عند الاستلام (COD)</span>
                        <span className="text-[11px] text-stone-500">يدفع الزبون نقداً عند الاستلام</span>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                      {orders.filter((o) => o.paymentMethod === 'cod').length} طلب
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white border border-amber-200 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-amber-50 text-amber-700 font-bold"><CreditCard className="w-4 h-4" /></div>
                      <div>
                        <span className="text-xs font-bold text-stone-900 block">Mastercard – مصرف الرافدين</span>
                        <span className="text-[11px] text-stone-500">دفع إلكتروني مباشر عبر بطاقة الرافدين</span>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                      {orders.filter((o) => o.paymentMethod === 'mastercard_rafidain').length} طلب
                    </span>
                  </div>
                </div>
              </div>

              {/* Submit button */}
              <div className="pt-4 border-t border-rose-100 flex items-center justify-end">
                <button
                  type="submit"
                  className="px-8 py-3 rounded-full bg-gradient-to-r from-rose-600 to-pink-500 hover:from-rose-500 hover:to-pink-600 text-white font-bold text-xs shadow-md shadow-rose-300 hover:shadow-lg transition-all cursor-pointer flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>حفظ كافة بيانات التواصل وخدمة العملاء</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 8: ABOUT US & STORE STORY CONTROL (من نحن وقصة المتجر) */}
        {activeTab === 'about' && (
          <div className="bg-white rounded-2xl border border-rose-100 p-6 shadow-2xs space-y-6 animate-in fade-in">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-rose-100">
              <div>
                <h3 className="font-extrabold text-base text-stone-900 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-rose-600" />
                  <span>إدارة وتعديل قسم وصفحة «من نحن» (About Us) وقصة المتجر</span>
                </h3>
                <p className="text-xs text-stone-500 mt-1">
                  تعديل قصة KAZAKI.IQ، الرسالة، العناوين باللغات الثلاث (عربي/إنجليزي/كردي)، الصور، والإحصائيات التي تظهر للزوار في صفحة «من نحن» والبنرات.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveView('about')}
                  className="px-4 py-2 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>مشاهدة صفحة «من نحن» كزبون</span>
                </button>
                <button
                  type="button"
                  onClick={handleResetAboutUs}
                  className="px-3.5 py-2 rounded-full border border-stone-200 hover:bg-stone-50 text-stone-600 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="استعادة النصوص الافتراضية"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>استعادة الافتراضي</span>
                </button>
              </div>
            </div>

            <form onSubmit={handleSaveAboutUs} className="space-y-6">
              {/* SECTION 1: BADGE & MAIN TITLES */}
              <div className="p-5 rounded-2xl bg-rose-50/30 border border-rose-100 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-rose-900 uppercase tracking-wider flex items-center gap-2">
                    <Heart className="w-4 h-4 text-rose-500" />
                    <span>الشارة الترحيبية والعنوان الرئيسي لـ «من نحن»</span>
                  </h4>
                  <span className="text-[11px] font-medium text-rose-600 bg-rose-100/70 px-2 py-0.5 rounded-full">
                    يدعم اللغات الثلاث (العربية / English / الكردية)
                  </span>
                </div>

                {/* Badge Inputs */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      الشارة الترحيبية (Badge بالعربية)
                    </label>
                    <input
                      type="text"
                      value={aboutForm.badge}
                      onChange={(e) => setAboutForm({ ...aboutForm, badge: e.target.value })}
                      placeholder="مثال: قصتنا وهوية متجرنا"
                      className="w-full text-xs border border-rose-200 rounded-xl px-3.5 py-2.5 bg-white focus:ring-2 focus:ring-rose-200 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      الشارة بالإنجليزية (Badge EN)
                    </label>
                    <input
                      type="text"
                      dir="ltr"
                      value={aboutForm.badgeEn}
                      onChange={(e) => setAboutForm({ ...aboutForm, badgeEn: e.target.value })}
                      placeholder="e.g. Our Story & Boutique Identity"
                      className="w-full text-xs border border-rose-200 rounded-xl px-3.5 py-2.5 bg-white focus:ring-2 focus:ring-rose-200 outline-none font-sans"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      الشارة بالكردية (Badge KU)
                    </label>
                    <input
                      type="text"
                      value={aboutForm.badgeKu}
                      onChange={(e) => setAboutForm({ ...aboutForm, badgeKu: e.target.value })}
                      placeholder="نموونە: چیرۆک و ناسنامەی ئێمە"
                      className="w-full text-xs border border-rose-200 rounded-xl px-3.5 py-2.5 bg-white focus:ring-2 focus:ring-rose-200 outline-none"
                    />
                  </div>
                </div>

                {/* Main Title Inputs */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      العنوان الرئيسي (بالعربية) <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={aboutForm.title}
                      onChange={(e) => setAboutForm({ ...aboutForm, title: e.target.value })}
                      placeholder="من نحن | KAZAKI.IQ لعالم ورد الليكو الفاخر"
                      className="w-full text-xs border border-rose-200 rounded-xl px-3.5 py-2.5 bg-white focus:ring-2 focus:ring-rose-200 outline-none"
                    />
                  </div>
                </div>

                {/* Subtitle Inputs */}
                <div className="pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      العنوان الفرعي والشعار (بالعربية)
                    </label>
                    <input
                      type="text"
                      value={aboutForm.subtitle}
                      onChange={(e) => setAboutForm({ ...aboutForm, subtitle: e.target.value })}
                      placeholder="أول وأرقى متجر متخصص في بوكسات وورود ليغو الفاخرة..."
                      className="w-full text-xs border border-rose-200 rounded-xl px-3.5 py-2.5 bg-white focus:ring-2 focus:ring-rose-200 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: STORE STORY (قصة المتجر بالتفصيل) */}
              <div className="p-5 rounded-2xl bg-white border border-rose-100 shadow-2xs space-y-4">
                <h4 className="font-bold text-xs text-stone-900 uppercase tracking-wider flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-500" />
                  <span>قصة المتجر ورؤيته (Story Text)</span>
                </h4>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      نص قصة المتجر (بالعربية) <span className="text-rose-600">*</span>
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={aboutForm.story}
                      onChange={(e) => setAboutForm({ ...aboutForm, story: e.target.value })}
                      placeholder="اكتب هنا قصة تأسيس المتجر، الشغف، وفلسفة ورد الليكو الذي لا يذبل..."
                      className="w-full text-xs border border-rose-200 rounded-xl p-3.5 bg-rose-50/10 focus:bg-white focus:ring-2 focus:ring-rose-200 outline-none leading-relaxed"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 3: MISSION & PROMISE (الرسالة والوعد) */}
              <div className="p-5 rounded-2xl bg-white border border-rose-100 shadow-2xs space-y-4">
                <h4 className="font-bold text-xs text-stone-900 uppercase tracking-wider flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>رسالة المتجر والوعد للعميل (Mission & Promise)</span>
                </h4>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      نص رسالة المتجر (بالعربية)
                    </label>
                    <textarea
                      rows={2}
                      value={aboutForm.mission}
                      onChange={(e) => setAboutForm({ ...aboutForm, mission: e.target.value })}
                      placeholder="رسالتنا هي تحويل كل مناسبة إهداء إلى لحظة لا تُنسى..."
                      className="w-full text-xs border border-rose-200 rounded-xl p-3.5 bg-rose-50/10 focus:bg-white focus:ring-2 focus:ring-rose-200 outline-none leading-relaxed"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 4: IMAGERY & MEDIA (رفع الصور من الاستوديو أو رابط) */}
              <div className="p-5 rounded-2xl bg-white border border-rose-100 shadow-2xs space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-rose-100">
                  <h4 className="font-bold text-xs text-stone-900 uppercase tracking-wider flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-rose-600" />
                    <span>صور قسم «من نحن» والوسائط من الاستوديو</span>
                  </h4>
                  <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                    دعم مباشر لرفع الصور من استوديو الهاتف والجهاز
                  </span>
                </div>

                {/* 1. Main About Us Image (صورة من نحن الرئيسية من الاستوديو) */}
                <div className="p-4 rounded-xl bg-rose-50/20 border border-rose-100 space-y-3">
                  <StudioMediaUploader
                    label="صورة «من نحن» الرئيسية (اختر من استوديو جهازك أو ضع رابطاً)"
                    value={aboutForm.imageUrl || ''}
                    onChange={(val) => setAboutForm({ ...aboutForm, imageUrl: val })}
                    mediaType="image"
                    helperText="الصورة الأبرز التي تظهر في الصفحة الرئيسية وصفحة من نحن للتعريف بالمتجر والورد الفاخر"
                  />

                  {/* Quick Suggestions for Lego Flower Images */}
                  <div className="pt-2">
                    <span className="text-[11px] font-bold text-stone-500 block mb-2">
                      أو اختر من النماذج الجاهزة لورد الليكو (انقر للتطبيق الفوري):
                    </span>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setAboutForm({
                            ...aboutForm,
                            imageUrl:
                              'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=1000&q=80',
                          })
                        }
                        className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-bold border border-rose-200 transition-colors cursor-pointer"
                      >
                        ورود ليغو وردية
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setAboutForm({
                            ...aboutForm,
                            imageUrl:
                              'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1000&q=80',
                          })
                        }
                        className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-bold border border-rose-200 transition-colors cursor-pointer"
                      >
                        بوكس ورد ليغو فاخر
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setAboutForm({
                            ...aboutForm,
                            imageUrl:
                              'https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?auto=format&fit=crop&w=1000&q=80',
                          })
                        }
                        className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-bold border border-rose-200 transition-colors cursor-pointer"
                      >
                        بوكس الهدايا الفاخر
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setAboutForm({
                            ...aboutForm,
                            imageUrl:
                              'https://images.unsplash.com/photo-1508610048659-a06b669e3321?auto=format&fit=crop&w=1000&q=80',
                          })
                        }
                        className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-bold border border-rose-200 transition-colors cursor-pointer"
                      >
                        نباتات بونساي وأوركيد
                      </button>
                    </div>
                  </div>
                </div>

                {/* 2. Secondary Image from Studio */}
                <div className="p-4 rounded-xl bg-rose-50/20 border border-rose-100">
                  <StudioMediaUploader
                    label="صورة ثانوية إضافية لصفحة من نحن (من الاستوديو أو رابط - اختياري)"
                    value={aboutForm.secondaryImageUrl || ''}
                    onChange={(val) => setAboutForm({ ...aboutForm, secondaryImageUrl: val })}
                    mediaType="image"
                    helperText="صورة إضافية تبرز زاوية أخرى، تفاصيل التغليف، أو الورشة في صفحة من نحن"
                  />
                </div>

                {/* 3. Studio Gallery Photos for About Us (معرض صور متعدد من الاستوديو) */}
                <div className="p-4 rounded-xl bg-rose-50/20 border border-rose-100 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <label className="block text-xs font-bold text-stone-800">
                        معرض صور المتجر والورشة (Studio Gallery لـ «من نحن»)
                      </label>
                      <p className="text-[11px] text-stone-500">
                        يمكنك إضافة عدة صور مباشرة من استوديو هاتفك لتظهر كمعرض صور فوتوغرافي داخل صفحة «من نحن»
                      </p>
                    </div>
                    <span className="text-[11px] font-bold text-rose-700 bg-white px-3 py-1 rounded-full border border-rose-200 shadow-2xs">
                      {aboutForm.gallery?.length || 0} صور بالمعرض
                    </span>
                  </div>

                  {/* Thumbnail gallery grid */}
                  {aboutForm.gallery && aboutForm.gallery.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 pt-2">
                      {aboutForm.gallery.map((imgUrl, idx) => (
                        <div key={idx} className="relative rounded-2xl overflow-hidden aspect-square border border-rose-200 group bg-stone-100 shadow-2xs">
                          <img src={imgUrl} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                          <button
                            type="button"
                            onClick={() => {
                              const updated = (aboutForm.gallery || []).filter((_, i) => i !== idx);
                              setAboutForm({ ...aboutForm, gallery: updated });
                            }}
                            className="absolute top-1.5 left-1.5 p-1.5 rounded-full bg-red-600 hover:bg-red-700 text-white transition-opacity shadow-sm cursor-pointer"
                            title="حذف الصورة"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <span className="absolute bottom-1 right-1.5 bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded font-mono">
                            #{idx + 1}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add New Image to Gallery from Studio */}
                  <div className="pt-2">
                    <StudioMediaUploader
                      label="إضافة صورة جديدة إلى معرض الاستوديو"
                      value=""
                      onChange={(newImg) => {
                        if (newImg) {
                          setAboutForm({
                            ...aboutForm,
                            gallery: [...(aboutForm.gallery || []), newImg],
                          });
                          showNotification('تمت إضافة الصورة إلى معرض استوديو «من نحن» بنجاح!');
                        }
                      }}
                      mediaType="image"
                      helperText="اختر صورة من استوديو هاتفك وسيتم حفظها وإدراجها فوراً في معرض صور من نحن"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 5: TRUST METRICS & GUARANTEES */}
              <div className="p-5 rounded-2xl bg-white border border-rose-100 shadow-2xs space-y-4">
                <h4 className="font-bold text-xs text-stone-900 uppercase tracking-wider flex items-center gap-2">
                  <Award className="w-4 h-4 text-rose-600" />
                  <span>إحصائيات وأرقام الثقة (Trust Numbers & Metrics)</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      سنوات الخبرة والإبداع
                    </label>
                    <input
                      type="text"
                      value={aboutForm.experienceYears}
                      onChange={(e) => setAboutForm({ ...aboutForm, experienceYears: e.target.value })}
                      placeholder="مثال: +3 سنوات من الإبداع"
                      className="w-full text-xs border border-rose-200 rounded-xl px-3.5 py-2.5 bg-rose-50/10 focus:bg-white focus:ring-2 focus:ring-rose-200 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      عدد الزبائن الراضين
                    </label>
                    <input
                      type="text"
                      value={aboutForm.satisfiedCustomers}
                      onChange={(e) => setAboutForm({ ...aboutForm, satisfiedCustomers: e.target.value })}
                      placeholder="مثال: +10,000 زبون راضٍ"
                      className="w-full text-xs border border-rose-200 rounded-xl px-3.5 py-2.5 bg-rose-50/10 focus:bg-white focus:ring-2 focus:ring-rose-200 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      نسبة الضمان والورد الدائم
                    </label>
                    <input
                      type="text"
                      value={aboutForm.everlastingGuarantee}
                      onChange={(e) => setAboutForm({ ...aboutForm, everlastingGuarantee: e.target.value })}
                      placeholder="مثال: 100% ورد لا يذبل"
                      className="w-full text-xs border border-rose-200 rounded-xl px-3.5 py-2.5 bg-rose-50/10 focus:bg-white focus:ring-2 focus:ring-rose-200 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 6: LIVE PREVIEW BOX */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-rose-50/50 via-pink-50/30 to-rose-100/40 border border-rose-200 space-y-3">
                <span className="text-[11px] font-bold text-rose-800 uppercase tracking-widest flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5" />
                  <span>معاينة فورية لكيفية ظهور صفحة «من نحن» للزبائن الآن</span>
                </span>

                <div className="bg-white rounded-2xl p-4 sm:p-5 border border-rose-100 shadow-sm space-y-3">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-700 text-xs font-bold">
                    <Heart className="w-3 h-3 fill-rose-500 text-rose-500" />
                    <span>{aboutForm.badge || 'قصتنا وهوية متجرنا'}</span>
                  </div>
                  <h3 className="font-black text-lg text-stone-900 leading-snug">
                    {aboutForm.title || 'من نحن | KAZAKI.IQ'}
                  </h3>
                  <p className="text-xs text-stone-600 line-clamp-2">
                    {aboutForm.subtitle}
                  </p>
                  <p className="text-xs text-stone-700 line-clamp-3 bg-rose-50/30 p-3 rounded-xl border border-rose-100/60 leading-relaxed">
                    {aboutForm.story}
                  </p>
                </div>
              </div>

              {/* SUBMIT BUTTON */}
              <div className="pt-4 border-t border-rose-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setActiveView('about')}
                  className="text-xs text-rose-600 font-bold hover:underline cursor-pointer"
                >
                  معاينة كاملة على الموقع ←
                </button>

                <button
                  type="submit"
                  className="px-8 py-3.5 rounded-full bg-gradient-to-r from-rose-600 via-pink-600 to-rose-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold text-xs shadow-md shadow-rose-300 hover:shadow-lg transition-all cursor-pointer flex items-center gap-2 transform hover:-translate-y-0.5"
                >
                  <Save className="w-4 h-4" />
                  <span>حفظ وتطبيق تعديل «من نحن» فوراً</span>
                </button>
              </div>
            </form>
          </div>
        )}

      </div>

      {/* PRODUCT ADD / EDIT MODAL */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            className="relative bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-rose-100 animate-in fade-in zoom-in-95 duration-200 text-right"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-rose-100 flex items-center justify-between bg-rose-50/40">
              <h3 className="font-bold text-stone-900 text-sm">
                {editingProductId ? 'تعديل بيانات المنتج' : 'إضافة منتج جديد إلى المتجر'}
              </h3>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-rose-100 text-stone-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-stone-700">
                    اسم وعنوان المنتج (بالعربية) <span className="text-rose-600">*</span>
                  </label>
                </div>
                <input
                  type="text"
                  required
                  value={productForm.title}
                  onChange={(e) => setProductForm({ ...productForm, title: e.target.value })}
                  placeholder="مثال: ورد الليكو الجوري الفاخر"
                  className="w-full text-xs border border-rose-200 rounded-xl px-3.5 py-2.5 bg-rose-50/20 focus:bg-white outline-hidden focus:border-rose-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    السعر الحالي ({settings.currency}) <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                    className="w-full text-xs border border-rose-200 rounded-xl px-3.5 py-2.5 bg-rose-50/20 focus:bg-white outline-hidden focus:border-rose-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    السعر قبل الخصم (اختياري)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={productForm.originalPrice}
                    onChange={(e) =>
                      setProductForm({ ...productForm, originalPrice: Number(e.target.value) })
                    }
                    className="w-full text-xs border border-rose-200 rounded-xl px-3.5 py-2.5 bg-rose-50/20 focus:bg-white outline-hidden focus:border-rose-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    القسم التابع له <span className="text-rose-600">*</span>
                  </label>
                  <select
                    value={productForm.categoryId}
                    onChange={(e) => setProductForm({ ...productForm, categoryId: e.target.value })}
                    className="w-full text-xs border border-rose-200 rounded-xl px-3.5 py-2.5 bg-rose-50/20 focus:bg-white outline-hidden focus:border-rose-400"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    الكمية المتوفرة بالمخزون
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={productForm.stockCount}
                    onChange={(e) =>
                      setProductForm({ ...productForm, stockCount: Number(e.target.value) })
                    }
                    className="w-full text-xs border border-rose-200 rounded-xl px-3.5 py-2.5 bg-rose-50/20 focus:bg-white outline-hidden focus:border-rose-400"
                  />
                </div>
              </div>

              <div className="space-y-3 p-3.5 rounded-2xl bg-rose-50/40 border border-rose-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-800">
                    صور المنتج (يمكنك إضافة حتى 3 صور عالية الدقة ومضغوطة تلقائياً)
                  </span>
                  <span className="text-[11px] text-rose-600 font-medium">
                    الحد الأقصى 300KB للصورة بدقة كريستالية
                  </span>
                </div>

                <StudioMediaUploader
                  label="الصورة 1 (الرئيسية والمميزة للمنتج)"
                  value={productForm.image}
                  onChange={(val) => setProductForm({ ...productForm, image: val })}
                  mediaType="image"
                  required
                  helperText="الصورة الأساسية التي تظهر في واجهة المتجر والبطاقات"
                />

                <StudioMediaUploader
                  label="الصورة 2 (زاوية جانبية أو تفاصيل إضافية)"
                  value={productForm.image2}
                  onChange={(val) => setProductForm({ ...productForm, image2: val })}
                  mediaType="image"
                  helperText="اختياري - تظهر كصورة ثانية في ألبوم المنتج"
                />

                <StudioMediaUploader
                  label="الصورة 3 (تفاصيل التغليف أو الهدية)"
                  value={productForm.image3}
                  onChange={(val) => setProductForm({ ...productForm, image3: val })}
                  mediaType="image"
                  helperText="اختياري - تظهر كصورة ثالثة في ألبوم المنتج"
                />
              </div>

              <StudioMediaUploader
                label="فيديو المنتج التوضيحي (اختياري)"
                value={productForm.videoUrl || ''}
                onChange={(val) => setProductForm({ ...productForm, videoUrl: val })}
                mediaType="video"
                placeholder="https://... فيديو بصيغة MP4 أو WebM"
                helperText="يمكنك رفع فيديو من استوديو هاتفك أو وضع رابط فيديو ليشاهده الزبائن"
              />

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  الحجم أو السعة (مثال: 100 مل، 50 جرام، Free Size)
                </label>
                <input
                  type="text"
                  value={productForm.volumeOrSize}
                  onChange={(e) => setProductForm({ ...productForm, volumeOrSize: e.target.value })}
                  placeholder="100 مل"
                  className="w-full text-xs border border-rose-200 rounded-xl px-3.5 py-2.5 bg-rose-50/20 focus:bg-white outline-hidden focus:border-rose-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  وصف المنتج التفصيلي (بالعربية)
                </label>
                <textarea
                  rows={3}
                  required
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  placeholder="اكتبي وصفاً جذاباً لمكونات وميزات هذا المنتج..."
                  className="w-full text-xs border border-rose-200 rounded-xl px-3.5 py-2.5 bg-rose-50/20 focus:bg-white outline-hidden focus:border-rose-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  الوسوم والكلمات الدلالية (مفصولة بفواصل)
                </label>
                <input
                  type="text"
                  value={productForm.tags}
                  onChange={(e) => setProductForm({ ...productForm, tags: e.target.value })}
                  placeholder="الأكثر مبيعاً, ثبات عالي, طبيعي"
                  className="w-full text-xs border border-rose-200 rounded-xl px-3.5 py-2.5 bg-rose-50/20 focus:bg-white outline-hidden focus:border-rose-400"
                />
              </div>

              <div className="pt-4 border-t border-rose-100 flex items-center justify-between gap-3">
                {editingProductId ? (
                  <button
                    type="button"
                    onClick={() => {
                      const prodToDelete = products.find((p) => p.id === editingProductId);
                      if (prodToDelete) {
                        setProductToDelete(prodToDelete);
                      }
                    }}
                    className="px-4 py-2 rounded-full border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>حذف هذا المنتج</span>
                  </button>
                ) : <div />}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsProductModalOpen(false)}
                    className="px-4 py-2.5 rounded-full border border-stone-200 text-stone-600 text-xs font-semibold hover:bg-stone-50 cursor-pointer"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md cursor-pointer transition-all"
                  >
                    {editingProductId ? 'حفظ تعديلات المنتج والسعر' : 'إضافة المنتج فوراً'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CATEGORY ADD & EDIT MODAL */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            className="relative bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-rose-100 animate-in fade-in zoom-in-95 duration-200 text-right"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-rose-100 flex items-center justify-between bg-rose-50/40">
              <div>
                <h3 className="font-bold text-stone-900 text-sm">
                  {editingCategoryId ? 'تعديل وتغيير اسم وبيانات القسم' : 'إنشاء قسم جديد بالمتجر'}
                </h3>
                <p className="text-[11px] text-stone-500 mt-0.5">
                  {editingCategoryId
                    ? 'يمكنك تغيير اسم القسم بجميع اللغات وتحديث الوصف والصورة فوراً'
                    : 'أدخل تفاصيل القسم الجديد باللغات المتاحة ليظهر في كافة أجزاء المتجر'}
                </p>
              </div>
              <button
                onClick={() => setIsCategoryModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-rose-100 text-stone-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-stone-700">
                    اسم القسم (بالعربية) <span className="text-rose-600">*</span>
                  </label>
                </div>
                <input
                  type="text"
                  required
                  value={categoryForm.name}
                  onChange={(e) => handleCategoryNameChange(e.target.value)}
                  placeholder="مثال: ورد الليكو الفاخر"
                  className="w-full text-xs border border-rose-200 rounded-xl px-3.5 py-2.5 bg-rose-50/20 focus:bg-white outline-hidden focus:border-rose-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  وصف القسم (بالعربية)
                </label>
                <input
                  type="text"
                  value={categoryForm.description}
                  onChange={(e) => handleCategoryDescChange(e.target.value)}
                  placeholder="تصاميم ورد الليكو الفاخرة التي لا تذبل ومصممة لتبقى معك للأبد"
                  className="w-full text-xs border border-rose-200 rounded-xl px-3.5 py-2.5 bg-rose-50/20 focus:bg-white outline-hidden focus:border-rose-400"
                />
              </div>

              <StudioMediaUploader
                label="صورة القسم"
                value={categoryForm.image}
                onChange={(val) => setCategoryForm({ ...categoryForm, image: val })}
                mediaType="image"
                helperText="يمكنك اختيار صورة للقسم من استوديو هاتفك أو جهازك أو إدخال رابط مباشر"
              />

              <div className="pt-4 border-t border-rose-100 flex items-center justify-between gap-3">
                {editingCategoryId ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (categories.length <= 1) {
                        showNotification('لا يمكن حذف القسم الأخير في المتجر! يجب الإبقاء على قسم واحد على الأقل');
                        return;
                      }
                      const catToDelete = categories.find((c) => c.id === editingCategoryId);
                      const count = products.filter((p) => p.categoryId === editingCategoryId).length;
                      const warning = count > 0
                        ? `هل أنت متأكد من حذف قسم "${catToDelete?.name || ''}"؟\n\nتنبيه: يحتوي هذا القسم على (${count}) منتجات، سيتم نقلها تلقائياً إلى قسم آخر لحمايتها من الضياع.`
                        : `هل أنت متأكد من حذف هذا القسم؟`;
                      if (confirm(warning)) {
                        deleteCategory(editingCategoryId);
                        setIsCategoryModalOpen(false);
                        showNotification('تم حذف القسم بنجاح');
                      }
                    }}
                    className="px-4 py-2 rounded-full border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>حذف هذا القسم</span>
                  </button>
                ) : <div />}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCategoryModalOpen(false)}
                    className="px-4 py-2.5 rounded-full border border-stone-200 text-stone-600 text-xs font-semibold hover:bg-stone-50 cursor-pointer"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md cursor-pointer transition-all"
                  >
                    {editingCategoryId ? 'حفظ وتطبيق تغييرات القسم واسمه' : 'إضافة القسم'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 1: ORDER STATUS UPDATE & CUSTOMER NOTIFICATION */}
      {isStatusModalOpen && selectedOrderForStatus && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            className="relative bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-rose-100 animate-in fade-in zoom-in-95 duration-200 text-right"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 border-b border-rose-100 flex items-center justify-between bg-gradient-to-r from-rose-50 via-pink-50 to-rose-50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-rose-600 text-white shadow-xs">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-stone-900 text-sm">
                    تحديث حالة الطلب وإرسال إشعار للعميل
                  </h3>
                  <p className="text-[11px] text-stone-500 font-mono">
                    الطلب: {selectedOrderForStatus.id} | العميل: {selectedOrderForStatus.customerName}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsStatusModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-rose-100 text-stone-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleApplyStatusUpdate} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
              {/* Status Radio / Selectors */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-stone-800">
                  اختاري الحالة الجديدة للطلب: <span className="text-rose-600">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {[
                    { id: 'processing', label: 'قيد المعالجة', icon: Clock, color: 'border-rose-300 bg-rose-50/50 text-rose-800' },
                    { id: 'shipped', label: 'تم الشحن', icon: Truck, color: 'border-blue-300 bg-blue-50/50 text-blue-800' },
                    { id: 'delivered', label: 'تم التوصيل', icon: CheckCircle, color: 'border-emerald-300 bg-emerald-50/50 text-emerald-800' },
                    { id: 'returned', label: 'شحنة راجعة', icon: RotateCcw, color: 'border-purple-300 bg-purple-50/50 text-purple-800' },
                    { id: 'cancelled', label: 'إلغاء الطلب', icon: XCircle, color: 'border-red-300 bg-red-50/50 text-red-800' },
                  ].map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => {
                        const newStatus = st.id as OrderStatus;
                        const carrier = statusUpdateForm.shippingCarrier;
                        const tracking = statusUpdateForm.trackingNumber;
                        const ord = selectedOrderForStatus;

                        const messages: Record<OrderStatus, string> = {
                          pending: `عزيزتي ${ord.customerName}، تم استلام طلبكِ رقم ${ord.id} في متجر KAZAKI.IQ وهو بانتظار التجهيز.`,
                          processing: `عزيزتي ${ord.customerName}، بدأنا الآن بتجهيز وتغليف طلبكِ رقم ${ord.id} بكل عناية واهتمام في متجر KAZAKI.IQ.`,
                          shipped: `مرحباً ${ord.customerName}، تم تسليم طلبكِ رقم ${ord.id} لشركة ${carrier} برقم تتبع ${tracking}. شحنتكِ في الطريق إليكِ!`,
                          delivered: `شكراً لتسوقكِ من KAZAKI.IQ! تم توصيل طلبكِ رقم ${ord.id} بنجاح. نأمل أن تنال منتجاتنا إعجابكِ ورضاكِ.`,
                          cancelled: `عزيزتي ${ord.customerName}، نود إعلامكِ بأنه تم تحديث حالة طلبكِ رقم ${ord.id} إلى ملغي. لأي استفسار يرجى مراسلة خدمة العملاء.`,
                          returned: `عزيزتي ${ord.customerName}، نود إعلامكِ بأنه تم تسجيل إرجاع الشحنة الخاصة بطلبكِ رقم ${ord.id} إلى المستودع.`,
                        };

                        setStatusUpdateForm({
                          ...statusUpdateForm,
                          status: newStatus,
                          customMessage: messages[newStatus] || '',
                        });
                      }}
                      className={`p-3 rounded-2xl border text-center font-bold text-xs transition-all cursor-pointer ${
                        statusUpdateForm.status === st.id
                          ? `${st.color} ring-2 ring-rose-400 shadow-xs`
                          : 'border-stone-200 hover:border-stone-300 bg-white text-stone-700'
                      }`}
                    >
                      <st.icon className="w-5 h-5 mx-auto mb-1 text-current" />
                      <span>{st.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Carrier & Tracking Number Fields */}
              <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-rose-600" />
                    <span>بيانات الشحن وشركة النقل</span>
                  </h4>
                  <button
                    type="button"
                    onClick={() => {
                      const gen = `KZK-${Math.floor(100000 + Math.random() * 900000)}`;
                      setStatusUpdateForm({
                        ...statusUpdateForm,
                        trackingNumber: gen,
                      });
                    }}
                    className="text-[10px] text-rose-600 hover:text-rose-700 font-bold hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>إنشاء رقم شحنة جديد</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                      شركة الشحن / الناقل:
                    </label>
                    <select
                      value={statusUpdateForm.shippingCarrier}
                      onChange={(e) => setStatusUpdateForm({ ...statusUpdateForm, shippingCarrier: e.target.value })}
                      className="w-full text-xs border border-stone-300 rounded-xl px-3 py-2 bg-white outline-hidden focus:border-rose-400"
                    >
                      <option value="أرجوان إكسبريس (بغداد والمحافظات)">أرجوان إكسبريس (بغداد والمحافظات)</option>
                      <option value="شركة الفهد إكسبريس (البصرة والجنوب)">شركة الفهد إكسبريس (البصرة والجنوب)</option>
                      <option value="شركة الرافدين للنقل السريع (الشمال والفرات)">شركة الرافدين للنقل السريع (الشمال والفرات)</option>
                      <option value="أرامكس العراق (Aramex Iraq)">أرامكس العراق (Aramex Iraq)</option>
                      <option value="مندوب KAZAKI.IQ الخاص">مندوب KAZAKI.IQ الخاص</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                      رقم بوليصة الشحن (Tracking #):
                    </label>
                    <input
                      type="text"
                      dir="ltr"
                      value={statusUpdateForm.trackingNumber}
                      onChange={(e) => setStatusUpdateForm({ ...statusUpdateForm, trackingNumber: e.target.value })}
                      placeholder="KZK-123456"
                      className="w-full text-xs text-right border border-stone-300 rounded-xl px-3 py-2 bg-white outline-hidden focus:border-rose-400 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Admin Internal Note */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  ملاحظة داخلية في سجل التتبع (اختياري):
                </label>
                <input
                  type="text"
                  value={statusUpdateForm.note}
                  onChange={(e) => setStatusUpdateForm({ ...statusUpdateForm, note: e.target.value })}
                  placeholder="مثال: تم التغليف في بوكس وردي خاص ونقلها لسيارة التوزيع"
                  className="w-full text-xs border border-rose-200 rounded-xl px-3 py-2 bg-rose-50/20 focus:bg-white outline-hidden focus:border-rose-400"
                />
              </div>

              {/* Notification Channel & Toggle */}
              <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-stone-900">
                    <input
                      type="checkbox"
                      checked={statusUpdateForm.sendNotification}
                      onChange={(e) => setStatusUpdateForm({ ...statusUpdateForm, sendNotification: e.target.checked })}
                      className="w-4 h-4 text-rose-600 rounded-sm focus:ring-rose-500 cursor-pointer"
                    />
                    <span>إرسال إشعار فوري للعميل عند تغيير الحالة</span>
                  </label>
                </div>

                {statusUpdateForm.sendNotification && (
                  <div className="space-y-3 pt-2 border-t border-rose-200/60">
                    <div>
                      <span className="block text-[11px] font-semibold text-stone-700 mb-1.5">
                        قناة الإشعار المفضلة:
                      </span>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: 'whatsapp', label: 'واتساب', sub: 'رابط مباشر' },
                          { id: 'system', label: 'حساب العميل', sub: 'إشعار النظام' },
                          { id: 'email', label: 'بريد إلكتروني', sub: 'رسالة إلكترونية' },
                        ].map((ch) => (
                          <button
                            key={ch.id}
                            type="button"
                            onClick={() => setStatusUpdateForm({ ...statusUpdateForm, channel: ch.id as any })}
                            className={`p-2 rounded-xl border text-center text-xs font-bold transition-all cursor-pointer ${
                              statusUpdateForm.channel === ch.id
                                ? 'bg-white border-rose-500 text-rose-800 shadow-2xs'
                                : 'bg-rose-50/40 border-stone-200 text-stone-600 hover:bg-white'
                            }`}
                          >
                            <span>{ch.label}</span>
                            <span className="text-[9px] block text-stone-400 font-normal">{ch.sub}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                        نص الإشعار المرسل للعميل (يمكنكِ تعديله بحرية):
                      </label>
                      <textarea
                        rows={3}
                        value={statusUpdateForm.customMessage}
                        onChange={(e) => setStatusUpdateForm({ ...statusUpdateForm, customMessage: e.target.value })}
                        className="w-full text-xs border border-rose-200 rounded-xl p-3 bg-white outline-hidden focus:border-rose-400 leading-relaxed"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-rose-100 flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setIsStatusModalOpen(false)}
                  className="px-4 py-2.5 rounded-full border border-stone-200 text-stone-600 text-xs font-semibold hover:bg-stone-50 cursor-pointer"
                >
                  إلغاء
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-full bg-gradient-to-r from-rose-600 to-pink-500 hover:from-rose-500 hover:to-pink-600 text-white font-bold text-xs shadow-md shadow-rose-200 hover:shadow-lg transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>تأكيد التحديث وحفظ الإشعار</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ORDER TRACKING TIMELINE & NOTIFICATIONS LOG */}
      {isTimelineModalOpen && selectedOrderForTimeline && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            className="relative bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-rose-100 animate-in fade-in zoom-in-95 duration-200 text-right"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-5 border-b border-rose-100 flex items-center justify-between bg-stone-50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-stone-900 text-white">
                  <History className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-stone-900 text-sm">
                    سجل التتبع الزمني والإشعارات للطلب {selectedOrderForTimeline.id}
                  </h3>
                  <p className="text-[11px] text-stone-500">
                    العميل: {selectedOrderForTimeline.customerName} | الهاتف: {selectedOrderForTimeline.customerPhone}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsTimelineModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-rose-100 text-stone-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6">
              {/* Chronological Timeline */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-rose-600" />
                  <span>سجل التحديثات وحالات الطلب (Timeline):</span>
                </h4>

                {(!selectedOrderForTimeline.statusHistory || selectedOrderForTimeline.statusHistory.length === 0) ? (
                  <p className="text-xs text-stone-400 p-4 bg-stone-50 rounded-2xl text-center">
                    لا يوجد سجل تاريخي مسجل لهذا الطلب حتى الآن.
                  </p>
                ) : (
                  <div className="relative pr-4 space-y-4 before:absolute before:right-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-rose-200">
                    {selectedOrderForTimeline.statusHistory.map((item, idx) => (
                      <div key={item.id || idx} className="relative pr-6 space-y-1">
                        <div className="absolute right-0 top-1 w-4 h-4 rounded-full bg-rose-500 border-2 border-white shadow-xs" />
                        <div className="p-3.5 rounded-2xl bg-white border border-rose-100 shadow-2xs space-y-1 text-xs">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="font-bold text-stone-900">
                              {item.status === 'pending'
                                ? 'تم استلام الطلب'
                                : item.status === 'processing'
                                ? 'قيد المعالجة والتجهيز'
                                : item.status === 'shipped'
                                ? 'تم الشحن مع الناقل'
                                : item.status === 'delivered'
                                ? 'تم التوصيل بنجاح'
                                : 'ملغي'}
                            </span>
                            <span className="text-[10px] text-stone-400 font-mono">
                              {new Date(item.timestamp).toLocaleDateString('ar-IQ')} - {new Date(item.timestamp).toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>

                          {item.note && (
                            <p className="text-stone-700 bg-rose-50/40 p-2 rounded-xl border border-rose-100/60 leading-relaxed">
                              {item.note}
                            </p>
                          )}

                          <div className="flex flex-wrap items-center gap-3 text-[10px] text-stone-400 pt-1">
                            <span>بواسطة: {item.updatedBy || 'المدير'}</span>
                            {item.trackingNumber && (
                              <span className="font-mono">تتبع: {item.trackingNumber}</span>
                            )}
                            {item.shippingCarrier && (
                              <span>الناقل: {item.shippingCarrier}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Customer Notifications Sent Log */}
              <div className="pt-4 border-t border-rose-100 space-y-3">
                <h4 className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                  <Bell className="w-4 h-4 text-rose-600" />
                  <span>الإشعارات المرسلة للعميل ({selectedOrderForTimeline.notifications?.length || 0}):</span>
                </h4>

                {(!selectedOrderForTimeline.notifications || selectedOrderForTimeline.notifications.length === 0) ? (
                  <p className="text-xs text-stone-400 p-4 bg-stone-50 rounded-2xl text-center">
                    لم يتم إرسال إشعارات مسجلة لهذا الطلب بعد.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {selectedOrderForTimeline.notifications.map((notif, idx) => (
                      <div
                        key={notif.id || idx}
                        className="p-3.5 rounded-2xl bg-rose-50/40 border border-rose-100 text-xs space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-stone-900">{notif.title}</span>
                          <span className="text-[10px] text-stone-400 font-mono">
                            {new Date(notif.timestamp).toLocaleDateString('ar-IQ')}
                          </span>
                        </div>
                        <p className="text-stone-700 bg-white p-2.5 rounded-xl border border-rose-100 leading-relaxed">
                          {notif.message}
                        </p>
                        <div className="flex items-center justify-between text-[10px] text-stone-400 pt-0.5">
                          <span>
                            القناة: {notif.channel === 'whatsapp' ? 'واتساب' : notif.channel === 'email' ? 'بريد' : 'نظام داخلي'}
                          </span>
                          <span>الحالة: تم الإرسال للعميل</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Footer Close */}
            <div className="p-4 border-t border-rose-100 bg-stone-50 flex justify-end">
              <button
                type="button"
                onClick={() => setIsTimelineModalOpen(false)}
                className="px-6 py-2 rounded-full bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QUICK DISCOUNT MODAL */}
      {discountModalProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-rose-100 overflow-hidden">
            <div className="p-5 border-b border-rose-100 bg-rose-50/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold">
                  <Percent className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-stone-900">تخصيص الخصم للمنتج</h3>
                  <p className="text-[11px] text-stone-500 truncate max-w-xs">{discountModalProduct.title}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDiscountModalProduct(null)}
                className="p-1.5 rounded-full hover:bg-rose-100 text-stone-400 hover:text-stone-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="p-3.5 rounded-2xl bg-rose-50/40 border border-rose-100 flex items-center justify-between text-xs">
                <span className="text-stone-500 font-medium">السعر الأساسي الحالي:</span>
                <span className="font-bold text-stone-900">
                  {((discountModalProduct.originalPrice && discountModalProduct.originalPrice > discountModalProduct.price)
                    ? discountModalProduct.originalPrice
                    : discountModalProduct.price
                  ).toLocaleString('ar-IQ')} {settings.currency}
                </span>
              </div>

              {/* Mode Toggle: Percent vs Custom Price */}
              <div className="flex rounded-xl bg-stone-100 p-1 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setDiscountTypeMode('percent')}
                  className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                    discountTypeMode === 'percent'
                      ? 'bg-white text-rose-600 shadow-2xs'
                      : 'text-stone-500 hover:text-stone-900'
                  }`}
                >
                  نسبة مئوية (%)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDiscountTypeMode('customPrice');
                    const base = (discountModalProduct.originalPrice && discountModalProduct.originalPrice > discountModalProduct.price)
                      ? discountModalProduct.originalPrice
                      : discountModalProduct.price;
                    const calculated = Math.round((base * (1 - discountPercentInput / 100)) / 250) * 250;
                    setDiscountCustomPrice(calculated);
                  }}
                  className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                    discountTypeMode === 'customPrice'
                      ? 'bg-white text-rose-600 shadow-2xs'
                      : 'text-stone-500 hover:text-stone-900'
                  }`}
                >
                  السعر بعد الخصم مباشرة ({settings.currency})
                </button>
              </div>

              {discountTypeMode === 'percent' ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <label className="font-bold text-stone-700">نسبة الخصم المطلوبة:</label>
                    <span className="font-black text-rose-600 text-sm">{discountPercentInput}%</span>
                  </div>

                  <input
                    type="range"
                    min={1}
                    max={90}
                    step={1}
                    value={discountPercentInput}
                    onChange={(e) => setDiscountPercentInput(Number(e.target.value))}
                    className="w-full accent-rose-600 cursor-pointer"
                  />

                  {/* Preset quick buttons */}
                  <div className="grid grid-cols-5 gap-1.5 pt-1">
                    {[5, 10, 15, 20, 25, 30, 40, 50, 60, 75].map((pct) => (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => setDiscountPercentInput(pct)}
                        className={`py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                          discountPercentInput === pct
                            ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                            : 'bg-stone-50 hover:bg-rose-50 text-stone-700 border-stone-200'
                        }`}
                      >
                        {pct}%
                      </button>
                    ))}
                  </div>

                  {/* Realtime calculated final price preview */}
                  <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200 flex items-center justify-between text-xs">
                    <span className="text-emerald-800 font-medium">السعر بعد الخصم سيكون:</span>
                    <span className="font-black text-emerald-700 text-sm">
                      {Math.max(
                        500,
                        Math.round(
                          (((discountModalProduct.originalPrice && discountModalProduct.originalPrice > discountModalProduct.price)
                            ? discountModalProduct.originalPrice
                            : discountModalProduct.price) *
                            (1 - discountPercentInput / 100)) /
                            250
                        ) * 250
                      ).toLocaleString('ar-IQ')}{' '}
                      {settings.currency}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <label className="block text-xs font-bold text-stone-700">
                    أدخل السعر الجديد بعد الخصم ({settings.currency}):
                  </label>
                  <input
                    type="number"
                    min={500}
                    value={discountCustomPrice}
                    onChange={(e) => setDiscountCustomPrice(Number(e.target.value))}
                    className="w-full text-sm font-bold border border-rose-200 rounded-xl px-4 py-2.5 bg-rose-50/20 focus:bg-white outline-hidden focus:border-rose-400 text-center"
                    placeholder="السعر بعد الخصم"
                  />
                  {discountCustomPrice > 0 && (
                    <div className="p-3 rounded-xl bg-rose-50/60 border border-rose-200 flex items-center justify-between text-xs">
                      <span className="text-rose-800 font-medium">نسبة الخصم المحسوبة:</span>
                      <span className="font-black text-rose-700 text-sm">
                        {Math.max(
                          0,
                          Math.round(
                            ((((discountModalProduct.originalPrice && discountModalProduct.originalPrice > discountModalProduct.price)
                              ? discountModalProduct.originalPrice
                              : discountModalProduct.price) -
                              discountCustomPrice) /
                              ((discountModalProduct.originalPrice && discountModalProduct.originalPrice > discountModalProduct.price)
                                ? discountModalProduct.originalPrice
                                : discountModalProduct.price)) *
                              100
                          )
                        )}
                        %
                      </span>
                    </div>
                  )}
                </div>
              )}

              <div className="pt-3 border-t border-rose-100 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setDiscountModalProduct(null)}
                  className="flex-1 py-2.5 rounded-full border border-stone-200 text-stone-600 text-xs font-semibold hover:bg-stone-50 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const base = (discountModalProduct.originalPrice && discountModalProduct.originalPrice > discountModalProduct.price)
                      ? discountModalProduct.originalPrice
                      : discountModalProduct.price;

                    let finalPrice = discountModalProduct.price;
                    if (discountTypeMode === 'percent') {
                      finalPrice = Math.max(500, Math.round((base * (1 - discountPercentInput / 100)) / 250) * 250);
                    } else {
                      finalPrice = Math.max(500, discountCustomPrice);
                    }

                    if (finalPrice >= base) {
                      showNotification('السعر بعد الخصم يجب أن يكون أقل من السعر الأصلي!');
                      return;
                    }

                    updateProduct(discountModalProduct.id, {
                      originalPrice: base,
                      price: finalPrice,
                    });
                    const pct = Math.round(((base - finalPrice) / base) * 100);
                    showNotification(`تم تفعيل خصم ${pct}% على "${discountModalProduct.title}" بنجاح!`);
                    setDiscountModalProduct(null);
                  }}
                  className="flex-1 py-2.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md cursor-pointer transition-all"
                >
                  تطبيق وتفعيل الخصم
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE PRODUCT MODAL */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-red-100 overflow-hidden">
            <div className="p-6 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto border-4 border-red-100 shadow-xs">
                <Trash2 className="w-6 h-6" />
              </div>

              <div className="space-y-1">
                <h3 className="font-extrabold text-stone-900 text-base">تأكيد حذف المنتج نهائياً</h3>
                <p className="text-xs text-stone-500 leading-relaxed">
                  هل أنت متأكد من رغبتك في حذف هذا المنتج من المتجر وقاعدة البيانات؟
                </p>
              </div>

              {/* Product Info Preview Box */}
              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80 flex items-center gap-3 text-right">
                <img
                  src={productToDelete.image}
                  alt={productToDelete.title}
                  className="w-14 h-14 rounded-xl object-cover bg-white border border-stone-200 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-xs text-stone-900 truncate">{productToDelete.title}</h4>
                  <span className="text-[11px] text-stone-500 block">
                    السعر: {productToDelete.price.toLocaleString('ar-IQ')} {settings.currency}
                  </span>
                  <span className="text-[10px] text-stone-400 font-mono block">المعرف: {productToDelete.id}</span>
                </div>
              </div>

              <p className="text-[11px] text-red-500 font-semibold bg-red-50/60 p-2.5 rounded-xl border border-red-100">
                تنبيه: هذا الإجراء لا يمكن التراجع عنه وسيتم مسح المنتج من الموقع فوراً.
              </p>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  disabled={isDeletingProduct}
                  onClick={() => setProductToDelete(null)}
                  className="flex-1 py-2.5 rounded-full border border-stone-200 text-stone-600 text-xs font-semibold hover:bg-stone-50 cursor-pointer disabled:opacity-50"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  disabled={isDeletingProduct}
                  onClick={handleConfirmDeleteProduct}
                  className="flex-1 py-2.5 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md cursor-pointer transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {isDeletingProduct ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>جارِ الحذف...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      <span>نعم، احذف المنتج</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
