import { Category, Product, StoreSettings, Order, PromoCode, User, SupportMessage, ButtonTranslations, SupportedLanguage, AboutUsConfig, CityShippingRate, CustomerServiceChannel } from '../types';

export const defaultCustomerServiceChannels: CustomerServiceChannel[] = [
  {
    id: 'cs-whatsapp',
    name: 'واتساب خدمة العملاء والمبيعات',
    nameEn: 'Customer Support & Sales WhatsApp',
    nameKu: 'واتسئاپ بۆ خزمەتگوزاری کڕیاران و فرۆشتن',
    type: 'whatsapp',
    value: '07838969959',
    subtitle: 'رد سريع وفوري ومتابعة تجهيز وتغليف الطلبات',
    subtitleEn: 'Instant reply, order preparation & luxury packaging tracking',
    subtitleKu: 'وەڵامی خێرا و ئاگاداربوون لە ئامادەکردن و پێچانەوەی داواکاری',
    enabled: true,
  },
  {
    id: 'cs-phone',
    name: 'الاتصال الهاتفي المباشر',
    nameEn: 'Direct Phone Support',
    nameKu: 'پەیوەندی تەلەفۆنی ڕاستەوخۆ',
    type: 'phone',
    value: '07838969959',
    subtitle: 'يومياً من 10:00 صباحاً حتى 10:00 مساءً',
    subtitleEn: 'Daily from 10:00 AM to 10:00 PM',
    subtitleKu: 'ڕۆژانە لە ١٠:٠٠ی بەیانی تا ١٠:٠٠ی شەو',
    enabled: true,
  },
  {
    id: 'cs-email',
    name: 'البريد الإلكتروني للشكاوى والاستفسارات',
    nameEn: 'Email for Inquiries & Corporate Orders',
    nameKu: 'ئیمەیڵ بۆ پرسیار و داواکاری تایبەت',
    type: 'email',
    value: 'info@kazaki.iq',
    subtitle: 'للطلبات الخاصة ومقترحات التطوير',
    subtitleEn: 'For bespoke arrangements & business partnerships',
    subtitleKu: 'بۆ داواکاری تایبەت و پێشنیارەکان',
    enabled: true,
  },
  {
    id: 'cs-instagram',
    name: 'انستغرام خدمة العملاء والمعرض',
    nameEn: 'Official Instagram Boutique',
    nameKu: 'ئینستاگرامی فەرمی فرۆشگا',
    type: 'instagram',
    value: 'https://instagram.com/kazaki.iq',
    subtitle: '@kazaki.iq',
    subtitleEn: '@kazaki.iq',
    subtitleKu: '@kazaki.iq',
    enabled: true,
  },
  {
    id: 'cs-tiktok',
    name: 'تيك توك المتجر الرسمي',
    nameEn: 'Official TikTok Channel',
    nameKu: 'تیکتۆکی فەرمی فرۆشگا',
    type: 'tiktok',
    value: 'https://tiktok.com/@kazaki.iq',
    subtitle: '@kazaki.iq',
    subtitleEn: '@kazaki.iq',
    subtitleKu: '@kazaki.iq',
    enabled: true,
  },
];

export const defaultIraqiShippingRates: CityShippingRate[] = [
  { id: 'kirkuk', name: 'كركوك', nameEn: 'Kirkuk', nameKu: 'کەرکووک', price: 3000, estimatedDelivery: 'خلال 24 ساعة', enabled: true },
  { id: 'baghdad', name: 'بغداد', nameEn: 'Baghdad', nameKu: 'بەغدا', price: 5000, estimatedDelivery: 'خلال 24 ساعة', enabled: true },
  { id: 'basra', name: 'البصرة', nameEn: 'Basra', nameKu: 'بەسرە', price: 6000, estimatedDelivery: 'خلال 24 - 48 ساعة', enabled: true },
  { id: 'erbil', name: 'أربيل', nameEn: 'Erbil', nameKu: 'هەولێر', price: 6000, estimatedDelivery: 'خلال 24 - 48 ساعة', enabled: true },
  { id: 'najaf', name: 'النجف الأشرف', nameEn: 'Najaf', nameKu: 'نەجەف', price: 6000, estimatedDelivery: 'خلال 24 - 48 ساعة', enabled: true },
  { id: 'karbala', name: 'كربلاء المقدسة', nameEn: 'Karbala', nameKu: 'کەربەلا', price: 6000, estimatedDelivery: 'خلال 24 - 48 ساعة', enabled: true },
  { id: 'sulaymaniyah', name: 'السليمانية', nameEn: 'Sulaymaniyah', nameKu: 'سلێمانی', price: 6000, estimatedDelivery: 'خلال 24 - 48 ساعة', enabled: true },
  { id: 'nineveh', name: 'نينوى (الموصل)', nameEn: 'Nineveh (Mosul)', nameKu: 'نەینەوا (مووسڵ)', price: 6000, estimatedDelivery: 'خلال 48 ساعة', enabled: true },
  { id: 'duhok', name: 'دهوك', nameEn: 'Duhok', nameKu: 'دهۆک', price: 6000, estimatedDelivery: 'خلال 48 ساعة', enabled: true },
  { id: 'babylon', name: 'بابل (الحلة)', nameEn: 'Babylon (Hillah)', nameKu: 'بابل', price: 6000, estimatedDelivery: 'خلال 24 - 48 ساعة', enabled: true },
  { id: 'diyala', name: 'ديالى (بعقوبة)', nameEn: 'Diyala (Baqubah)', nameKu: 'دیالە', price: 6000, estimatedDelivery: 'خلال 24 - 48 ساعة', enabled: true },
  { id: 'anbar', name: 'الأنبار (الرمادي/الفلوجة)', nameEn: 'Anbar (Ramadi/Fallujah)', nameKu: 'ئەنبار', price: 6000, estimatedDelivery: 'خلال 48 ساعة', enabled: true },
  { id: 'dhiqar', name: 'ذي قار (الناصرية)', nameEn: 'Dhi Qar (Nasiriyah)', nameKu: 'زیقار', price: 6000, estimatedDelivery: 'خلال 24 - 48 ساعة', enabled: true },
  { id: 'maysan', name: 'ميسان (العمارة)', nameEn: 'Maysan (Amarah)', nameKu: 'میسان', price: 6000, estimatedDelivery: 'خلال 24 - 48 ساعة', enabled: true },
  { id: 'wasit', name: 'واسط (الكوت)', nameEn: 'Wasit (Kut)', nameKu: 'واسیت', price: 6000, estimatedDelivery: 'خلال 24 - 48 ساعة', enabled: true },
  { id: 'saladin', name: 'صلاح الدين (تكريت/سامراء)', nameEn: 'Saladin (Tikrit/Samarra)', nameKu: 'سەلاحەدین', price: 6000, estimatedDelivery: 'خلال 48 ساعة', enabled: true },
  { id: 'qadisiyyah', name: 'القادسية (الديوانية)', nameEn: 'Al-Qadisiyyah (Diwaniyah)', nameKu: 'دیوانیە', price: 6000, estimatedDelivery: 'خلال 24 - 48 ساعة', enabled: true },
  { id: 'muthanna', name: 'المثنى (السماوة)', nameEn: 'Al-Muthanna (Samawah)', nameKu: 'موسەننا', price: 6000, estimatedDelivery: 'خلال 48 ساعة', enabled: true },
];

export const initialCategories: Category[] = [
  {
    id: 'flowers',
    name: 'VIP بوكس',
    nameEn: 'VIP Box',
    nameKu: 'VIP بوکس',
    icon: 'Heart',
    description: 'ورود جميلة وفاخرة للأهداء المميز',
    descriptionEn: 'Everlasting luxury Lego flower VIP boxes',
    descriptionKu: 'دیزاینە شاهانەکانی گوڵی لێکۆ کە سیس نابن',
    image: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'gift_boxes',
    name: 'ورد الليكو',
    nameEn: 'Lego Flowers',
    nameKu: 'گوڵی لێکۆ',
    icon: 'Gift',
    description: 'ورد مصمم لكل انواع المناسبات الراقية',
    descriptionEn: 'A rose designed for all kinds of occasions',
    descriptionKu: 'گوڵ بۆ هەموو جۆرە بۆنەیەک',
    image: 'https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'cat-1791118980798',
    name: 'بوكسات الليكو',
    nameEn: 'Lego Boxes',
    nameKu: 'سندووقەکانی لێکۆ',
    icon: 'Sparkles',
    description: 'بوكسات متنوعة من ورد الليكو الفاخر والدائم',
    descriptionEn: 'Assorted boxes of everlasting luxury Lego flowers',
    descriptionKu: 'سندووقی جۆراوجۆر لە گوڵی لێکۆی شایستە و هەمیشەیی',
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'singles',
    name: 'ورد ليكو فردي',
    nameEn: 'Single Lego Flowers',
    nameKu: 'گوڵی لێکۆی تاک',
    icon: 'Heart',
    description: 'ورد فردي أنيق لا يذبل أبداً ومصمم بعناية',
    descriptionEn: 'Elegant single flowers crafted to last',
    descriptionKu: 'گوڵی تاک سەرنجڕاکێش',
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80',
  },
];

export const initialProducts: Product[] = [];

export const initialSiteTexts: Record<string, { ar: string; en?: string; ku?: string }> = {
  // --- الأزرار الرئيسية (Buttons) ---
  home: {
    ar: 'الرئيسية',
    en: 'Home',
    ku: 'سەرەکی',
  },
  shop: {
    ar: 'المتجر',
    en: 'Shop',
    ku: 'فرۆشگا',
  },
  categories: {
    ar: 'الأقسام',
    en: 'Categories',
    ku: 'پۆلەکان',
  },
  addToCart: {
    ar: 'أضف إلى السلة',
    en: 'Add to Cart',
    ku: 'زیادکردن بۆ سەبەتە',
  },
  buyNow: {
    ar: 'شراء الآن',
    en: 'Buy Now',
    ku: 'ئێستا بکڕە',
  },
  login: {
    ar: 'تسجيل الدخول',
    en: 'Login',
    ku: 'چوونەژوورەوە',
  },
  register: {
    ar: 'إنشاء حساب جديد',
    en: 'Register',
    ku: 'دروستکردنی هەژمار',
  },
  contactUs: {
    ar: 'تواصل معنا',
    en: 'Contact Us',
    ku: 'پەیوەندیمان پێوە بکە',
  },
  customerService: {
    ar: 'خدمة العملاء',
    en: 'Customer Service',
    ku: 'خزمەتگوزاری کڕیاران',
  },
  checkout: {
    ar: 'الدفع وإتمام الطلب',
    en: 'Proceed to Checkout',
    ku: 'تەواوکردنی داواکاری و پارەدان',
  },
  trackOrder: {
    ar: 'تتبع الطلب',
    en: 'Track Order',
    ku: 'بەدواداچوونی داواکاری',
  },
  viewCart: {
    ar: 'عرض السلة',
    en: 'View Cart',
    ku: 'بینینی سەبەتە',
  },
  sendMessage: {
    ar: 'إرسال الرسالة',
    en: 'Send Message',
    ku: 'ناردنی پەیام',
  },
  viewProduct: {
    ar: 'عرض التفاصيل',
    en: 'View Details',
    ku: 'بینینی وردەکارییەکان',
  },

  // --- نصوص الترحاب والهيرو (Welcome & Hero) ---
  tagline: {
    ar: 'ورد مميز لا يذبل • صممت لتبقى معك للأبد',
    en: 'Special Flowers That Never Wilt • Designed To Stay With You Forever',
    ku: 'گوڵی بێوێنە کە هەرگیز سیس نابێت • دیزاین کراوە تا هەمیشە لەگەڵت بمێنێتەوە',
  },
  welcomeTitle: {
    ar: 'أهلاً بكم في عالم ورد الليكو | KAZAKI.IQ',
    en: 'Welcome to KAZAKI.IQ Lego Flowers',
    ku: 'بەخێربێن بۆ جیهانی گوڵی لێکۆ | KAZAKI.IQ',
  },
  welcomeSubtitle: {
    ar: 'ورد مميز لا يذبل صُممت لتبقى معك للأبد مع ضمان الجودة والتغليف الفاخر لجميع الطلبات',
    en: 'Special flowers that never wilt, designed to stay with you forever with luxury packaging',
    ku: 'گوڵی بێوێنە کە هەرگیز سیس نابێت، دیزاین کراوە بۆ ئەوەی هەمیشە بمێنێتەوە لەگەڵ گەرەنتی کوالێتی و پێچانەوەی شایستە بۆ هەموو داواکارییەکان',
  },
  heroTitle: {
    ar: 'ورد مميز لا يذبل • صممت لتبقى معك للأبد',
    en: 'Special Flowers That Never Wilt • Designed To Stay With You Forever',
    ku: 'گوڵی بێوێنە کە هەرگیز سیس نابێت • دیزاین کراوە تا هەمیشە لەگەڵت بمێنێتەوە',
  },
  heroSubtitle: {
    ar: 'اختيار اجمل انواع الورد بعناية مع ضمان الجودة والتغليف الفاخر لجميع الطلبات',
    en: 'Carefully selecting the most beautiful flowers with guaranteed quality and luxury packaging for all orders',
    ku: 'هەڵبژاردنی جوانترین جۆرەکانی گوڵ بە وردی لەگەڵ گەرەنتی کوالێتی و پێچانەوەی شاهانە بۆ سەرجەم داواکارییەکان',
  },
  heroBadge: {
    ar: 'ورد الليكو الدائم للأبد',
    en: 'Forever Blooming Lego Flowers',
    ku: 'گوڵی لێکۆی هەمیشەیی بۆ هەتاهەتایە',
  },
  announcement: {
    ar: 'توصيل سريع لكافة محافظات العراق | كود الخصم: KAZAKI20 يمنح خصماً 20% على جميع ورد الليكو',
    en: 'Fast delivery across Iraq | Promo code: KAZAKI20 gives 20% off all Lego flowers',
    ku: 'گەیاندنی خێرا بۆ سەرجەم پارێزگاکانی عێراق | کۆدی داشکاندن: KAZAKI20 داشکاندنی ٢٠٪ دەبەخشێت بۆ هەموو گوڵی لێکۆ',
  },
  announcementLink: {
    ar: 'تسوق ورد الليكو الآن',
    en: 'Shop Lego Flowers',
    ku: 'ئێستا گوڵی لێکۆ بکڕە',
  },

  // --- تصفح المنتجات والأقسام (Products & Store) ---
  allProductsTitle: {
    ar: 'تشكيلة ورد الليكو الفاخرة',
    en: 'Luxury Lego Flowers Collection',
    ku: 'کۆمەڵەی ناوازەی گوڵی لێکۆ',
  },
  allProductsSubtitle: {
    ar: 'ورد مميز لا يذبل صُممت لتبقى معك للأبد بأرقى تفاصيل التركيب والتغليف الفاخر',
    en: 'Special flowers that never wilt, designed to stay forever with premium packaging',
    ku: 'گوڵی تایبەت کە هەرگیز سیس نابێت، دروستکراوە بۆ هەمیشە بە باڵاترین وردەکارییەکانی بەستن و پێچانەوەی شاهانە',
  },
  searchPlaceholder: {
    ar: 'ابحث عن ورد ليغو، بوكس هدايا، إهداء فاخر...',
    en: 'Search for Lego flower, gift box, luxury gifts...',
    ku: 'گەڕان بۆ گوڵی لێکۆ، سندووقی دیاری، بەخشینی شاهانە...',
  },
  inStock: {
    ar: 'متوفر بالمخزون',
    en: 'In Stock',
    ku: 'لە کۆگادا بەردەستە',
  },
  outOfStock: {
    ar: 'نفدت الكمية',
    en: 'Out of Stock',
    ku: 'لە کۆگادا نەماوە',
  },
  newBadge: {
    ar: 'وصل حديثاً',
    en: 'New Arrival',
    ku: 'تازە گەیشتوو',
  },
  filterAll: {
    ar: 'عرض الكل',
    en: 'View All',
    ku: 'بینینی هەمووی',
  },

  // --- سلة المشتريات والدفع (Cart & Checkout) ---
  cartTitle: {
    ar: 'سلة المشتريات',
    en: 'Shopping Cart',
    ku: 'سەبەتەی کڕین',
  },
  emptyCartMsg: {
    ar: 'سلة المشتريات فارغة حالياً',
    en: 'Your shopping cart is currently empty',
    ku: 'سەبەتەی کڕینەکەت لە ئێستادا بەتاڵە',
  },
  subtotalLabel: {
    ar: 'مجموع المنتجات',
    en: 'Products Subtotal',
    ku: 'کۆی بەرهەمەکان',
  },
  shippingLabel: {
    ar: 'رسوم التوصيل',
    en: 'Delivery Fee',
    ku: 'کرێی گەیاندن',
  },
  freeShippingText: {
    ar: 'توصيل مجاني',
    en: 'Free Shipping',
    ku: 'گەیاندنی بێبەرامبەر',
  },
  totalAmountLabel: {
    ar: 'الإجمالي النهائي',
    en: 'Final Total',
    ku: 'کۆی گشتی کۆتایی',
  },
  discountAppliedLabel: {
    ar: 'الخصم المطبق',
    en: 'Applied Discount',
    ku: 'داشکاندنی بەکارهاتوو',
  },
  checkoutTitle: {
    ar: 'إتمام الطلب والدفع',
    en: 'Checkout & Payment',
    ku: 'تەواوکردنی داواکاری و پارەدان',
  },
  deliveryInfoTitle: {
    ar: 'بيانات المستلم وعنوان التوصيل',
    en: 'Recipient & Delivery Details',
    ku: 'زانیارییەکانی وەرگر و ناونیشانی گەیاندن',
  },
  paymentMethodTitle: {
    ar: 'طرق الدفع المعتمدة',
    en: 'Accepted Payment Methods',
    ku: 'شێوازە پەسەندکراوەکانی پارەدان',
  },
  codTitle: {
    ar: 'الدفع عند الاستلام (COD)',
    en: 'Cash on Delivery (COD)',
    ku: 'پارەدان لە کاتی وەرگرتندا (نەختینە)',
  },
  codSubtitle: {
    ar: 'الدفع نقداً لمندوب التوصيل عند استلام الطلب ومعاينته',
    en: 'Pay in cash to the delivery agent upon receiving the order',
    ku: 'پارەدانی کاش بە نوێنەری گەیاندن لە کاتی وەرگرتن و پشکنینی داواکارییەکەدا',
  },
  orderSuccessTitle: {
    ar: 'تم تأكيد الطلب بنجاح',
    en: 'Order Confirmed Successfully',
    ku: 'داواکارییەکەت بە سەرکەوتوویی تۆمارکرا',
  },

  // --- تتبع الطلبات وخدمة العملاء (Tracking & Support) ---
  trackOrderModalTitle: {
    ar: 'سجل وتتبع مسار الطلبات',
    en: 'Orders History & Tracking',
    ku: 'مێژووی داواکارییەکان و بەدواداچوونی بار',
  },
  customerServiceTitle: {
    ar: 'مركز خدمة العملاء والدعم الفني',
    en: 'Customer Support Center',
    ku: 'ناوەندی خزمەتگوزاری کڕیاران و پشتگیری تەکنیکی',
  },
  customerServiceSubtitle: {
    ar: 'التواجد الدائم لتقديم المساعدة والإجابة على جميع الاستفسارات',
    en: 'Always here to assist and answer all inquiries',
    ku: 'هەمیشە ئامادەین بۆ پێشکەشکردنی هاوکاری و وەڵامدانەوەی سەرجەم پرسیارەکانتان',
  },
  contactFormTitle: {
    ar: 'إرسال رسالة أو استفسار',
    en: 'Send a Message or Inquiry',
    ku: 'ناردنی پەیام یان پرسیار',
  },
  authModalSubtitle: {
    ar: 'تسجيل الدخول للاستمتاع بتجربة تسوق متكاملة وسريعة',
    en: 'Sign in for a complete and smooth shopping experience',
    ku: 'چوونەژوورەوە بۆ ئەزموونکردنی کڕینێکی تەواو و خێرا',
  },
  guaranteeOriginal: {
    ar: 'منتجات أصلية 100%',
    en: '100% Authentic Products',
    ku: 'بەرهەمی ١٠٠٪ ئەسڵی و دەستەبەرکراو',
  },
  guaranteeFastShipping: {
    ar: 'شحن لجميع العراق',
    en: 'Shipping Across All Iraq',
    ku: 'گەیاندن بۆ هەموو عێراق',
  },
  guaranteeEasyReturn: {
    ar: 'إرجاع سهل ومرن',
    en: 'Easy & Flexible Returns',
    ku: 'گەڕاندنەوەی ئاسان و گونجاو',
  },

  // --- حقول الطلب ونماذج الشراء (Order & Form Fields) ---
  emailAddressOptional: {
    ar: 'البريد الإلكتروني (اختياري)',
    en: 'Email Address (Optional)',
    ku: 'ئیمەیڵ (ئارەزوومەندانە)',
  },
  fullNameLabel: {
    ar: 'الاسم الكامل',
    en: 'Full Name',
    ku: 'ناوی تەواو',
  },
  phoneNumberLabel: {
    ar: 'رقم الهاتف والجوال',
    en: 'Phone Number',
    ku: 'ژمارەی مۆبایل',
  },
  cityLabel: {
    ar: 'المحافظة / المدينة',
    en: 'Governorate / City',
    ku: 'پارێزگا / شار',
  },
  addressLabel: {
    ar: 'العنوان بالتفصيل',
    en: 'Detailed Address',
    ku: 'ناونیشانی ورد',
  },
  notesLabel: {
    ar: 'ملاحظات إضافية للتوصيل',
    en: 'Delivery Notes (Optional)',
    ku: 'تێبینی زیاتر بۆ گەیاندن',
  },
  applyPromoBtn: {
    ar: 'تطبيق الخصم',
    en: 'Apply Discount',
    ku: 'داشکاندن بەکاربهێنە',
  },
  promoPlaceholder: {
    ar: 'كود الخصم (مثال: KAZAKI20)',
    en: 'Promo code (e.g. KAZAKI20)',
    ku: 'کۆدی داشکاندن (وەک: KAZAKI20)',
  },

  // --- مسميات الأقسام الرئيسية (Categories) ---
  catFlowers: {
    ar: 'ورود ليغو الفاخرة',
    en: 'Luxury Lego Flowers',
    ku: 'گوڵی لێکۆی شایستە',
  },
  catBouquets: {
    ar: 'ورود ليغو الفاخرة',
    en: 'Luxury Lego Flowers',
    ku: 'گوڵی لێکۆی شایستە',
  },
  catDomes: {
    ar: 'بوكسات ورد الليكو للإهداء',
    en: 'Lego Flower Gift Boxes',
    ku: 'سندووق و بوکسی دیاری گوڵی لێکۆ',
  },
  catGiftBoxes: {
    ar: 'بوكسات ورد الليكو للإهداء',
    en: 'Lego Flower Gift Boxes',
    ku: 'سندووق و بوکسی دیاری گوڵی لێکۆ',
  },
  catBonsai: {
    ar: 'أصص ونباتات ورد الليكو',
    en: 'Lego Bonsai & Plants',
    ku: 'گۆزە و ڕووەکی گوڵی لێکۆ',
  },
  catSingles: {
    ar: 'ورود ليكو مفردة وميني',
    en: 'Single & Mini Lego Flowers',
    ku: 'گوڵی لێکۆی تاکی و بچووک',
  },

  // --- من نحن وقصة المتجر (About Us) ---
  aboutUs: {
    ar: 'من نحن',
    en: 'About Us',
    ku: 'دەربارەی ئێمە',
  },
  aboutOurStory: {
    ar: 'قصتنا وهوية متجرنا',
    en: 'Our Story & Brand Identity',
    ku: 'چیرۆک و ناسنامەی ئێمە',
  },
  myAccount: {
    ar: 'حسابي',
    en: 'My Account',
    ku: 'هەژماری من',
  },
  registerNewAccount: {
    ar: 'إنشاء حساب جديد',
    en: 'Create New Account',
    ku: 'دروستکردنی هەژماری نوێ',
  },
  createAccount: {
    ar: 'إنشاء حساب',
    en: 'Create Account',
    ku: 'دروستکردنی هەژمار',
  },
  adminDashboardLink: {
    ar: 'لوحة تحكم المتجر (الإدارة)',
    en: 'Admin Dashboard',
    ku: 'دەستەی بەڕێوەبردن',
  },
  logout: {
    ar: 'تسجيل الخروج',
    en: 'Log Out',
    ku: 'چوونەدەرەوە',
  },
  myOrders: {
    ar: 'طلباتي السابقة ومشترياتي',
    en: 'My Past Orders & Purchases',
    ku: 'داواکارییە پێشووەکانم',
  },
  allRightsReserved: {
    ar: 'جميع الحقوق محفوظة',
    en: 'All rights reserved',
    ku: 'هەموو مافەکان پارێزراون',
  },
  followUs: {
    ar: 'تابعينا على السوشيال ميديا',
    en: 'Follow Us on Social Media',
    ku: 'لە تۆڕە کۆمەڵایەتییەکان لەگەڵمان بن',
  },
  shopByCategory: {
    ar: 'التسوق حسب القسم',
    en: 'Shop by Category',
    ku: 'کڕین بەپێی پۆل',
  },
};

export const defaultAboutUs: AboutUsConfig = {
  badge: 'قصتنا وهوية متجرنا',
  badgeEn: 'Our Story & Boutique Identity',
  badgeKu: 'چیرۆک و ناسنامەی ئێمە',
  title: 'من نحن | KAZAKI.IQ لعالم ورد الليكو الفاخر',
  titleEn: 'About Us | KAZAKI.IQ Luxury Everlasting Lego Flowers',
  titleKu: 'دەربارەی ئێمە | جیهانی گوڵی لێکۆی شایستە',
  subtitle: 'أول وأرقى متجر متخصص في تصميم بوكسات وورود ليغو الفاخرة التي صُممت لتبقى معك للأبد',
  subtitleEn: 'The premier boutique specialized in everlasting luxury Lego flowers, gift boxes, and botanical masterpieces',
  subtitleKu: 'یەکەمین و شایستەترین فرۆشگا بۆ دیزاینی بوکس و گوڵی لێکۆ کە بۆ هەمیشە دەمێنێتەوە',
  story: 'انطلقت فكرة KAZAKI.IQ من شغف عميق بالجمع بين فخامة الإهداء والجمال الذي لا يذبل أبداً. لاحظنا أن الورد الطبيعي رغم سحره يذبل سريعاً بعد أيام معدودة، لذا ابتكرنا عالماً فريداً من ورد الليكو المصنوع بدقة هندسية عالية وتفاصيل مذهلة، ليكون الهدية الأرقى التي تبقى ذكرى خالدة تنبض بالحياة في قلوب من تحبون.',
  storyEn: 'KAZAKI.IQ was born out of a deep passion to blend everlasting beauty with the prestige of gifting. Natural flowers wilt within days, so we created a mesmerizing universe of meticulously crafted Lego botanical flowers that never fade—designed to stand as an immortal symbol of affection and elegance.',
  storyKu: 'بیرۆکەی KAZAKI.IQ لە خولیای پێشکەشکردنی جوانییەک دەستی پێکرد کە هەرگیز سیس نابێت. گوڵی سروشتی زوو سیس دەبێت، بۆیە ئێمە جیهانێکی ناوازەمان لە گوڵی لێکۆی ئەندازیاری و قەشەنگ دروستکرد، تا ببێتە دیارییەکی نەمام کە بۆ هەمیشە لە دڵی ئازیزانتاندا بمێنێتەوە.',
  mission: 'رسالتنا هي تحويل كل مناسبة إهداء إلى لحظة لا تُنسى من خلال ورود ليغو راقية، وبوكسات فاخرة مع بطاقات إهداء مخصصة وتغليف استثنائي يصل إلى كافة محافظات العراق.',
  missionEn: 'Our mission is to transform every special moment into an unforgettable memory through exquisite Lego flowers, luxury gift boxes, and bespoke packaging delivered across all regions of Iraq.',
  missionKu: 'ئامانجی ئێمە گۆڕینی هەموو بۆنەیەکە بۆ یادەوەرییەکی هەمیشەیی لە رێگەی گوڵی لێکۆی شایستە و بوکسی ناوازە بە پێچانەوەی شایستە بۆ هەموو عێراق.',
  imageUrl: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=1000&q=80',
  secondaryImageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1000&q=80',
  gallery: [
    'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?auto=format&fit=crop&w=1000&q=80',
  ],
  experienceYears: '+3 سنوات من الإبداع',
  experienceYearsEn: '+3 Years of Mastery',
  experienceYearsKu: '+٣ ساڵ لە داهێنان',
  satisfiedCustomers: '+10,000 زبون راضٍ',
  satisfiedCustomersEn: '+10,000 Happy Clients',
  satisfiedCustomersKu: '+١٠,٠٠٠ کڕیاری دڵخۆش',
  everlastingGuarantee: '100% ورد لا يذبل',
  everlastingGuaranteeEn: '100% Everlasting Flowers',
  everlastingGuaranteeKu: '١٠٠٪ گوڵی هەمیشەیی',
  features: [
    {
      id: 'feat-1',
      icon: 'Heart',
      title: 'تصاميم لا تذبل أبداً',
      titleEn: 'Everlasting Designs',
      titleKu: 'دیزاین کە هەرگیز سیس نابێت',
      description: 'تحف فنية صُنعت لتبقى مشرقة وجميلة للأبد دون الحاجة للماء أو العناية',
      descriptionEn: 'Artistic blooms that stay vibrant forever without wilting or requiring maintenance',
      descriptionKu: 'شاکاری هونەری کە بۆ هەمیشە بە گەشاوەیی دەمێنێتەوە بێ پێویستی بە ئاو',
    },
    {
      id: 'feat-2',
      icon: 'Gift',
      title: 'تغليف فاخر وبطاقات إهداء',
      titleEn: 'Luxury Premium Packaging',
      titleKu: 'پێچانەوەی شایستە و کارتی دیاری',
      description: 'بوكسات فاخرة، أشرطة ساتان، وبطاقات إهداء بعبارات أنيقة مخصصة لكل طلب',
      descriptionEn: 'Premium gift boxes, satin ribbons, and custom greeting cards handwritten for your recipient',
      descriptionKu: 'سندووقی شایستە، شریتی ساتان و کارتی پیرۆزبایی تایبەت بە هەر کڕیارێک',
    },
    {
      id: 'feat-3',
      icon: 'Truck',
      title: 'توصيل سريع وآمن لكافة المحافظات',
      titleEn: 'Fast Nationwide Delivery',
      titleKu: 'گەیاندنی خێرا بۆ هەموو پارێزگاکان',
      description: 'شحن وتوصيل فوري مع تغليف مضاد للصدمات يضمن وصول طلبيتك بكامل أناقتها',
      descriptionEn: 'Rapid and secure shipping with shock-proof packaging ensuring pristine arrival',
      descriptionKu: 'گەیاندنی پارێزراو بە باشترین پاکەتکردن کە گوڵەکان وەک خۆیان بگەن',
    },
    {
      id: 'feat-4',
      icon: 'ShieldCheck',
      title: 'ضمان الجودة الذهبي',
      titleEn: 'Golden Quality Guarantee',
      titleKu: 'گرەنتی زێڕینی کواڵیتی',
      description: 'قطع أصلية وتفاصيل متقنة مع إمكانية المعاينة عند الاستلام قبل الدفع',
      descriptionEn: 'Authentic materials, immaculate finishing, and option to inspect upon delivery before payment',
      descriptionKu: 'کەرەستەی ئەسڵی و کاریگەری بێوێنە لەگەڵ مافی پشکنین پێش وەرگرتن',
    },
  ],
};

export const initialButtonTranslations: ButtonTranslations = initialSiteTexts as unknown as ButtonTranslations;

export const initialStoreSettings: StoreSettings = {
  storeName: 'KAZAKI.IQ',
  tagline: 'ورد مميز لا يذبل • صممت لتبقى معك للأبد',
  logoUrl: '/logo.jpg',
  phone: '07838969959',
  whatsapp: '07838969959',
  email: 'info@kazaki.iq',
  address: '',
  instagram: 'https://instagram.com/kazaki.iq',
  tiktok: 'https://tiktok.com/@kazaki.iq',
  currency: 'د.ع',
  announcement: {
    enabled: true,
    text: 'توصيل سريع لكافة محافظات العراق | كود الخصم: KAZAKI20 يمنح خصماً 20% على جميع ورد الليكو',
    linkText: 'تسوق ورد الليكو الآن',
  },
  heroBanner: {
    title: 'ورد مميز لا يذبل • صممت لتبقى معك للأبد',
    subtitle: 'اختيار اجمل انواع الورد بعناية مع ضمان الجودة والتغليف الفاخر لجميع الطلبات',
    ctaText: 'استكشاف ورد الليكو',
    imageUrl: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=1200&q=80',
    discountBadge: 'ورد الليكو الدائم للأبد',
  },
  contactInfo: {
    enabled: true,
    title: 'مركز خدمة عملاء ورد الليكو KAZAKI.IQ',
    subtitle: 'التواجد الدائم لتقديم المساعدة واختيار أجمل تصاميم وبوكسات ورد الليكو الفاخرة',
    workingHours: '',
    customerServiceNote: 'فريق الدعم الفني متواجد للإجابة على جميع الاستفسارات وتجهيز بطاقات الإهداء فوراً.',
    channels: defaultCustomerServiceChannels,
  },
  introConfig: {
    enabled: true,
    type: 'animation', // 'image' | 'video' | 'animation'
    mediaUrl: 'https://assets.mixkit.co/videos/preview/mixkit-rose-petals-falling-slowly-41680-large.mp4',
    title: 'أهلاً بكم في عالم ورد الليكو | KAZAKI.IQ',
    subtitle: 'ورد مميز لا يذبل • صممت لتبقى معك للأبد مع ضمان الجودة والتغليف الفاخر لجميع الطلبات.',
    buttonText: 'الدخول إلى متجر ورد الليكو',
    autoCloseSeconds: 0, // 0 = wait for user click
  },
  aboutUs: defaultAboutUs,
  buttonTexts: initialButtonTranslations,
  siteTexts: initialSiteTexts,
  shippingRates: defaultIraqiShippingRates,
  defaultShippingFee: 5000,
  freeShippingThreshold: 0,
  notificationSettings: {
    enableSound: true,
    enableBrowserPush: true,
    enableTelegram: false,
    telegramBotToken: '',
    telegramChatId: '',
    enableWhatsAppAlert: true,
    adminWhatsApp: '9647838969959',
    enableEmailAlert: true,
    adminEmail: 'abdo07710264453@gmail.com',
  },
};

export const initialPromoCodes: PromoCode[] = [
  { code: 'KAZAKI20', discountPercent: 20, minOrder: 25000, active: true },
  { code: 'WELCOME10', discountPercent: 10, minOrder: 15000, active: true },
  { code: 'VIP30', discountPercent: 30, minOrder: 50000, active: true },
];

export const initialOrders: Order[] = [];

export const defaultUsers: User[] = [];

export const initialSupportMessages: SupportMessage[] = [];

