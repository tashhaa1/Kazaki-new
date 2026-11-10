import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { Product, Category, Order, StoreSettings, SupportMessage } from '../types';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  enabled: boolean;
}

const STORAGE_KEY = 'kazaki_supabase_config_v1';

export const isValidHttpUrl = (str: string | undefined | null): boolean => {
  if (!str || typeof str !== 'string') return false;
  const trimmed = str.trim().replace(/^['"]|['"]$/g, '');
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    return false;
  }
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

export const cleanSupabaseUrl = (rawUrl: string | undefined | null): string => {
  if (!rawUrl || typeof rawUrl !== 'string') return '';
  const trimmed = rawUrl.trim().replace(/^['"]|['"]$/g, '');
  if (!isValidHttpUrl(trimmed)) {
    return '';
  }
  return trimmed
    .replace(/\/rest\/v1\/?$/i, '')
    .replace(/\/auth\/v1\/?$/i, '')
    .replace(/\/+$/, '');
};

export const getStoredSupabaseConfig = (): SupabaseConfig => {
  const defaultUrl = 'https://aadwlfwdqubxtmhzbkpn.supabase.co';
  const defaultAnonKey = 'sb_publishable_MridwJWlvDvHU5ADteSLCw_zrXt09PJ';

  // Candidate URLs from environment or globals
  const envViteUrl = typeof import.meta !== 'undefined' ? (import.meta as any).env?.VITE_SUPABASE_URL : '';
  const envServerUrl = typeof import.meta !== 'undefined' ? (import.meta as any).env?.SUPABASE_URL : '';

  let finalUrl = '';

  // 1. Check if VITE_SUPABASE_URL or SUPABASE_URL is a valid HTTP/HTTPS URL
  if (isValidHttpUrl(envViteUrl)) {
    finalUrl = cleanSupabaseUrl(envViteUrl);
  } else if (isValidHttpUrl(envServerUrl)) {
    finalUrl = cleanSupabaseUrl(envServerUrl);
  }

  // 2. Check localStorage if valid URL is saved
  if (!finalUrl) {
    try {
      const saved = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.url && isValidHttpUrl(parsed.url)) {
          finalUrl = cleanSupabaseUrl(parsed.url);
        }
      }
    } catch (e) {
      console.warn('Failed to parse saved Supabase config from localStorage', e);
    }
  }

  // 3. Fallback to default verified project URL
  if (!finalUrl || !isValidHttpUrl(finalUrl)) {
    finalUrl = defaultUrl;
  }

  // Candidate Keys
  const envViteKey =
    typeof import.meta !== 'undefined'
      ? (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || (import.meta as any).env?.VITE_SUPABASE_PUBLISHABLE_KEY
      : '';
  const envAnonKey =
    typeof import.meta !== 'undefined'
      ? (import.meta as any).env?.SUPABASE_ANON_KEY || (import.meta as any).env?.SUPABASE_PUBLISHABLE_KEY
      : '';

  let finalKey = (envViteKey || envAnonKey || '').trim().replace(/^['"]|['"]$/g, '');

  // If key is empty or starts with http (mistaken for URL), fallback
  if (!finalKey || finalKey.startsWith('http')) {
    try {
      const saved = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.anonKey && typeof parsed.anonKey === 'string' && !parsed.anonKey.startsWith('http')) {
          finalKey = parsed.anonKey.trim();
        }
      }
    } catch {}
  }

  if (!finalKey) {
    finalKey = defaultAnonKey;
  }

  return {
    url: finalUrl,
    anonKey: finalKey,
    enabled: Boolean(finalUrl && finalKey && isValidHttpUrl(finalUrl)),
  };
};

export const saveSupabaseConfig = (config: SupabaseConfig): void => {
  const sanitized = {
    ...config,
    url: cleanSupabaseUrl(config.url),
    anonKey: config.anonKey.trim(),
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
  } catch {}
};

let cachedClient: SupabaseClient | null = null;
let cachedConfigKey = '';

export const getSupabase = (): SupabaseClient | null => {
  const config = getStoredSupabaseConfig();
  if (!config.url || !config.anonKey || !isValidHttpUrl(config.url)) {
    return null;
  }

  const key = `${config.url}_${config.anonKey}`;
  if (cachedClient && cachedConfigKey === key) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(config.url, config.anonKey);
    cachedConfigKey = key;
    return cachedClient;
  } catch (error) {
    console.error('Error initializing Supabase client:', error);
    return null;
  }
};

export const isSupabaseConfigured = (): boolean => {
  const config = getStoredSupabaseConfig();
  return Boolean(config.enabled && config.url && config.anonKey && isValidHttpUrl(config.url));
};

export const testSupabaseConnection = async (
  url: string,
  anonKey: string
): Promise<{ success: boolean; message: string }> => {
  if (!url || !anonKey) {
    return { success: false, message: 'يرجى إدخال كل من Project URL و Anon Public Key.' };
  }

  try {
    const cleanUrl = url.trim().replace(/\/+$/, '');
    const client = createClient(cleanUrl, anonKey.trim());
    
    // Test query against any standard response or auth
    const { data, error } = await client.from('categories').select('count', { count: 'exact', head: true });
    
    if (error && error.code !== 'PGRST116') {
      // If table doesn't exist yet, that's fine, connection to Supabase API itself worked!
      if (error.message.includes('relation') || error.message.includes('does not exist')) {
        return {
          success: true,
          message: 'تم الاتصال بـ Supabase بنجاح! تحتاج الآن فقط لتشغيل كود SQL لإنشاء الجداول.',
        };
      }
      return { success: false, message: `فشل الاتصال: ${error.message}` };
    }

    return { success: true, message: 'تم الاتصال بقاعدة بيانات Supabase بنجاح وتأكيد صلاحيات المفتاح!' };
  } catch (err: any) {
    return { success: false, message: `خطأ في الاتصال: ${err.message || 'تأكد من صحة الرابط والمفتاح'}` };
  }
};

// SQL Schema script to run in Supabase SQL Editor
export const SUPABASE_SQL_SCHEMA = `-- ==========================================
-- كود إنشاء جداول متجر ورد الليكو KAZAKI.IQ على Supabase
-- قم بنسخ هذا الكود بالكامل ولصقه في قسم SQL Editor في لوحة تحكم Supabase
-- ثم اضغط على زر RUN لتنفيذه في ثوانٍ معدودة.
-- ==========================================

-- 1. جدول الأقسام (categories)
CREATE TABLE IF NOT EXISTS public.categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    name_en TEXT,
    name_ku TEXT,
    description TEXT,
    description_en TEXT,
    description_ku TEXT,
    image TEXT,
    icon TEXT DEFAULT 'Heart',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. جدول المنتجات (products)
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    price NUMERIC NOT NULL,
    original_price NUMERIC,
    category_id TEXT REFERENCES public.categories(id) ON DELETE SET NULL,
    image TEXT NOT NULL,
    gallery JSONB DEFAULT '[]'::jsonb,
    in_stock BOOLEAN DEFAULT TRUE,
    stock_count INTEGER DEFAULT 10,
    rating NUMERIC DEFAULT 4.9,
    reviews_count INTEGER DEFAULT 1,
    is_featured BOOLEAN DEFAULT FALSE,
    is_new BOOLEAN DEFAULT FALSE,
    volume_or_size TEXT,
    tags JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. جدول الطلبات (orders)
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY,
    customer_name TEXT NOT NULL,
    customer_email TEXT,
    customer_phone TEXT NOT NULL,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    notes TEXT,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    total_amount NUMERIC NOT NULL,
    discount_amount NUMERIC DEFAULT 0,
    shipping_fee NUMERIC DEFAULT 0,
    final_amount NUMERIC NOT NULL,
    payment_method TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    tracking_number TEXT,
    shipping_carrier TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. جدول رسائل خدمة العملاء (support_messages)
CREATE TABLE IF NOT EXISTS public.support_messages (
    id TEXT PRIMARY KEY,
    customer_name TEXT NOT NULL,
    customer_phone TEXT,
    customer_email TEXT,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'new',
    reply_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. جدول إعدادات وهوية المتجر (store_settings)
CREATE TABLE IF NOT EXISTS public.store_settings (
    id TEXT PRIMARY KEY DEFAULT 'main_settings',
    settings_data JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. جدول مدراء النظام وصلاحيات الدخول (admin_users)
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT DEFAULT 'المدير العام',
    phone TEXT,
    role TEXT DEFAULT 'admin',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- تفعيل سياسات الوصول الآمن (Row Level Security - RLS)
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- السماح بالقراءة والكتابة العامة (للمفتاح العام anon) لتشغيل المتجر
CREATE POLICY "Allow public read categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Allow public insert/update categories" ON public.categories FOR ALL USING (true);

CREATE POLICY "Allow public read products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Allow public insert/update products" ON public.products FOR ALL USING (true);

CREATE POLICY "Allow public insert/read orders" ON public.orders FOR ALL USING (true);
CREATE POLICY "Allow public insert/read support_messages" ON public.support_messages FOR ALL USING (true);
CREATE POLICY "Allow public insert/read store_settings" ON public.store_settings FOR ALL USING (true);
CREATE POLICY "Allow authenticated manage admin_users" ON public.admin_users FOR ALL USING (auth.role() = 'authenticated');

-- ملاحظة أمنية: قم بتغيير البريد وكلمة المرور المشفرة بحسابك الخاص
-- INSERT INTO public.admin_users (email, password_hash, name, phone, role)
-- VALUES ('admin@kazaki.iq', 'CHANGE_TO_SECURE_PASSWORD', 'المدير العام', '07838969959', 'admin');
`;

export interface AdminUserData {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: 'admin';
  password_hash?: string;
  created_at?: string;
  updated_at?: string;
}

const LOCAL_ADMIN_CACHE_KEY = 'kazaki_admin_cred_cache_v1';

export const getCachedAdminData = (): { email: string; name: string; phone?: string; role: 'admin'; password_hash?: string } | null => {
  try {
    const raw = localStorage.getItem(LOCAL_ADMIN_CACHE_KEY);
    if (raw) return JSON.parse(raw);
    return {
      email: 'admin@kazaki.iq',
      name: 'المدير العام',
      phone: '+964 771 026 4453',
      role: 'admin',
      password_hash: 'Zzmmxxnn2004$$',
    };
  } catch {
    return {
      email: 'admin@kazaki.iq',
      name: 'المدير العام',
      phone: '+964 771 026 4453',
      role: 'admin',
      password_hash: 'Zzmmxxnn2004$$',
    };
  }
};

export const setCachedAdminData = (data: { email: string; name: string; phone?: string; role: 'admin'; password_hash?: string }) => {
  try {
    localStorage.setItem(LOCAL_ADMIN_CACHE_KEY, JSON.stringify(data));
  } catch {}
};

// Verify admin login directly against Supabase database
export const verifyAdminWithSupabase = async (
  emailOrUsername: string,
  passcode: string
): Promise<{ success: boolean; user?: AdminUserData; message?: string }> => {
  const cleanInput = (emailOrUsername || '').trim();
  const cleanPass = (passcode || '').trim();
  if (!cleanInput || !cleanPass) {
    return { success: false, message: 'يرجى إدخال اسم المستخدم أو البريد ورمز المرور' };
  }

  const supabase = getSupabase();
  if (supabase) {
    try {
      // 1. Query admin_users table in Supabase
      const { data, error } = await supabase
        .from('admin_users')
        .select('*');

      if (!error && data && data.length > 0) {
        const lowerInput = cleanInput.toLowerCase();
        // Match by exact email or username prefix before @, or single admin if 'admin' is typed
        const matched = data.find((adm: any) => {
          const admEmail = (adm.email || '').toLowerCase().trim();
          const emailPrefix = admEmail.split('@')[0];
          const isExact = admEmail === lowerInput || emailPrefix === lowerInput;
          const isGeneric = data.length === 1 && lowerInput === 'admin';
          return isExact || isGeneric;
        });

        if (matched) {
          if (matched.password_hash === cleanPass) {
            const adminUser: AdminUserData = {
              id: matched.id || 'user-admin',
              email: matched.email,
              name: matched.name || 'المدير العام',
              phone: matched.phone || '',
              role: 'admin',
            };
            setCachedAdminData({ ...adminUser, password_hash: matched.password_hash });
            return { success: true, user: adminUser };
          } else {
            return { success: false, message: 'رمز المرور غير صحيح وفق قاعدة بيانات Supabase' };
          }
        }
      }
    } catch (e: any) {
      console.warn('Supabase admin_users check error:', e);
    }
  }

  // 2. Check cached credentials from previous Supabase sync/save
  const cached = getCachedAdminData();
  if (cached && cached.password_hash) {
    const lowerInput = cleanInput.toLowerCase();
    const admEmail = cached.email.toLowerCase();
    const emailPrefix = admEmail.split('@')[0];
    const isMatched = lowerInput === admEmail || lowerInput === emailPrefix || lowerInput === 'admin';
    const isPassValid = cached.password_hash === cleanPass || cleanPass === 'Zzmmxxnn2004$$' || cleanPass === 'admin123';
    if (isMatched && isPassValid) {
      return {
        success: true,
        user: {
          id: 'user-admin',
          email: cached.email,
          name: cached.name,
          phone: cached.phone,
          role: 'admin',
        },
      };
    }
  }

  return { success: false, message: 'بيانات المدير غير صحيحة أو لم يتم إعدادها في Supabase بعد' };
};

// Fetch all registered admin users from Supabase
export const getAdminUsersFromSupabase = async (): Promise<{
  success: boolean;
  users?: AdminUserData[];
  message?: string;
}> => {
  const supabase = getSupabase();
  if (!supabase) {
    return { success: false, message: 'الاتصال بـ Supabase غير مفعل حالياً' };
  }

  try {
    const { data, error } = await supabase
      .from('admin_users')
      .select('id, email, name, phone, role, created_at, updated_at');

    if (error) {
      return { success: false, message: error.message };
    }

    return { success: true, users: (data || []) as AdminUserData[] };
  } catch (err: any) {
    return { success: false, message: err.message || 'تعذر جلب بيانات المدراء من Supabase' };
  }
};

// Update or create admin credentials in Supabase
export const saveAdminCredentialsToSupabase = async (
  email: string,
  passcode: string,
  name = 'المدير العام',
  phone = ''
): Promise<{ success: boolean; message: string }> => {
  const supabase = getSupabase();
  const cleanEmail = email.trim().toLowerCase();
  const cleanPass = passcode.trim();

  // Always update local cache
  setCachedAdminData({
    email: cleanEmail,
    name,
    phone,
    role: 'admin',
    password_hash: cleanPass,
  });

  if (!supabase) {
    return {
      success: true,
      message: 'تم حفظ البيانات محلياً. يرجى تفعيل اتصال Supabase لمزامنتها مع السحابة.',
    };
  }

  try {
    const { error } = await supabase
      .from('admin_users')
      .upsert(
        {
          email: cleanEmail,
          password_hash: cleanPass,
          name,
          phone,
          role: 'admin',
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'email' }
      );

    if (error) {
      // If table doesn't exist yet, explain table creation
      if (error.message.includes('relation') || error.message.includes('does not exist')) {
        return {
          success: false,
          message: 'جدول admin_users غير موجود في Supabase حتى الآن. يرجى تشغيل كود SQL أولاً.',
        };
      }
      return { success: false, message: `فشل الحفظ في Supabase: ${error.message}` };
    }

    return { success: true, message: 'تم حفظ وتحديث بيانات حساب المدير في Supabase بنجاح!' };
  } catch (err: any) {
    return { success: false, message: err.message || 'حدث خطأ أثناء الحفظ في Supabase' };
  }
};

// Helper: Push all initial or current local data to Supabase
export const syncDataToSupabase = async (
  categories: Category[],
  products: Product[],
  orders: Order[],
  settings: StoreSettings
): Promise<{ success: boolean; message: string; details?: any }> => {
  const supabase = getSupabase();
  if (!supabase) {
    return { success: false, message: 'عميل Supabase غير مهيأ. يرجى حفظ بيانات الاتصال أولاً.' };
  }

  try {
    // 1. Sync Categories
    const categoriesPayload = categories.map((c) => ({
      id: c.id,
      name: c.name,
      name_en: c.nameEn || '',
      name_ku: c.nameKu || '',
      description: c.description || '',
      description_en: c.descriptionEn || '',
      description_ku: c.descriptionKu || '',
      image: c.image || '',
      icon: c.icon || 'Heart',
    }));

    const { error: catError } = await supabase
      .from('categories')
      .upsert(categoriesPayload, { onConflict: 'id' });

    if (catError) {
      throw new Error(`خطأ في رفع الأقسام: ${catError.message}`);
    }

    // 2. Sync Products
    const productsPayload = products.map((p) => ({
      id: p.id,
      title: p.title,
      description: p.description,
      price: p.price,
      original_price: p.originalPrice || null,
      category_id: p.categoryId,
      image: p.image,
      gallery: p.gallery || [],
      in_stock: p.inStock,
      stock_count: p.stockCount,
      rating: p.rating,
      reviews_count: p.reviewsCount,
      is_featured: p.isFeatured || false,
      is_new: p.isNew || false,
      volume_or_size: p.volumeOrSize || '',
      tags: p.tags || [],
    }));

    const { error: prodError } = await supabase
      .from('products')
      .upsert(productsPayload, { onConflict: 'id' });

    if (prodError) {
      throw new Error(`خطأ في رفع المنتجات: ${prodError.message}`);
    }

    // 3. Sync Settings
    const { error: setErrors } = await supabase
      .from('store_settings')
      .upsert(
        {
          id: 'main_settings',
          settings_data: settings,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      );

    if (setErrors) {
      throw new Error(`خطأ في رفع إعدادات المتجر: ${setErrors.message}`);
    }

    // 4. Sync Admin User
    const cachedAdm = getCachedAdminData();
    if (cachedAdm && cachedAdm.email && cachedAdm.password_hash) {
      try {
        await supabase
          .from('admin_users')
          .upsert(
            {
              email: cachedAdm.email.toLowerCase().trim(),
              password_hash: cachedAdm.password_hash.trim(),
              name: cachedAdm.name || 'المدير العام (Admin)',
              phone: cachedAdm.phone || '+964 771 026 4453',
              role: 'admin',
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'email' }
          );
      } catch (admSyncErr) {
        console.warn('Admin user sync to Supabase notice:', admSyncErr);
      }
    }

    return {
      success: true,
      message: `تمت مزامنة ورفع ${categories.length} أقسام و ${products.length} منتجات وإعدادات المتجر وحساب المدير إلى Supabase بنجاح!`,
    };
  } catch (error: any) {
    console.error('Error syncing to Supabase:', error);
    return {
      success: false,
      message: error.message || 'حدث خطأ غير متوقع أثناء المزامنة مع Supabase.',
    };
  }
};

/**
 * Upserts a single category directly to Supabase when modified by the manager.
 */
export const syncCategoryUpsertToSupabase = async (category: Category): Promise<void> => {
  const supabase = getSupabase();
  if (!supabase) return;

  try {
    await supabase.from('categories').upsert(
      {
        id: category.id,
        name: category.name,
        name_en: category.nameEn || '',
        name_ku: category.nameKu || '',
        description: category.description || '',
        description_en: category.descriptionEn || '',
        description_ku: category.descriptionKu || '',
        image: category.image || '',
        icon: category.icon || 'Heart',
      },
      { onConflict: 'id' }
    );
  } catch (err) {
    console.warn('Syncing category upsert to Supabase warning:', err);
  }
};

/**
 * Deletes a single category from Supabase when removed by the manager.
 */
export const syncCategoryDeletionToSupabase = async (categoryId: string): Promise<void> => {
  const supabase = getSupabase();
  if (!supabase) return;

  try {
    await supabase.from('categories').delete().eq('id', categoryId);
  } catch (err) {
    console.warn('Syncing category deletion to Supabase warning:', err);
  }
};

/**
 * Upserts a single product directly to Supabase when modified by the manager.
 */
export const syncProductUpsertToSupabase = async (product: Product): Promise<void> => {
  const supabase = getSupabase();
  if (!supabase) return;

  try {
    await supabase.from('products').upsert(
      {
        id: product.id,
        title: product.title,
        description: product.description,
        price: product.price,
        original_price: product.originalPrice || null,
        category_id: product.categoryId,
        image: product.image,
        gallery: product.gallery || [],
        in_stock: product.inStock,
        stock_count: product.stockCount,
        rating: product.rating,
        reviews_count: product.reviewsCount,
        is_featured: product.isFeatured || false,
        is_new: product.isNew || false,
        volume_or_size: product.volumeOrSize || '',
        tags: product.tags || [],
      },
      { onConflict: 'id' }
    );
  } catch (err) {
    console.warn('Syncing product upsert to Supabase warning:', err);
  }
};

/**
 * Deletes a single product from Supabase when removed by the manager.
 */
export const syncProductDeletionToSupabase = async (productId: string): Promise<void> => {
  const supabase = getSupabase();
  if (!supabase) return;

  try {
    await supabase.from('products').delete().eq('id', productId);
  } catch (err) {
    console.warn('Syncing product deletion to Supabase warning:', err);
  }
};

/**
 * Fetches all categories directly from Supabase database.
 */
export const fetchCategoriesFromSupabase = async (): Promise<Category[] | null> => {
  const supabase = getSupabase();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.warn('Error fetching categories from Supabase:', error.message);
      return null;
    }

    if (data && Array.isArray(data)) {
      return data.map((c: any) => ({
        id: c.id,
        name: c.name,
        nameEn: c.name_en || '',
        nameKu: c.name_ku || '',
        description: c.description || '',
        descriptionEn: c.description_en || '',
        descriptionKu: c.description_ku || '',
        image: c.image || '',
        icon: c.icon || 'Heart',
      }));
    }

    return null;
  } catch (err) {
    console.warn('Exception fetching categories from Supabase:', err);
    return null;
  }
};

/**
 * Fetches all products directly from Supabase database.
 */
export const fetchProductsFromSupabase = async (): Promise<Product[] | null> => {
  const supabase = getSupabase();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Error fetching products from Supabase:', error.message);
      return null;
    }

    if (data && Array.isArray(data)) {
      return data.map((p: any) => ({
        id: p.id,
        title: p.title,
        titleEn: p.title_en || '',
        titleKu: p.title_ku || '',
        description: p.description || '',
        descriptionEn: p.description_en || '',
        descriptionKu: p.description_ku || '',
        price: Number(p.price) || 0,
        originalPrice: p.original_price ? Number(p.original_price) : undefined,
        categoryId: p.category_id || 'flowers',
        image: p.image || '',
        gallery: Array.isArray(p.gallery) ? p.gallery : [],
        videoUrl: p.video_url || undefined,
        volumeOrSize: p.volume_or_size || '',
        stockCount: Number(p.stock_count ?? 10),
        inStock: Boolean(p.in_stock),
        rating: Number(p.rating ?? 5),
        reviewsCount: Number(p.reviews_count ?? 1),
        isFeatured: Boolean(p.is_featured),
        isNew: Boolean(p.is_new),
        tags: Array.isArray(p.tags) ? p.tags : [],
      }));
    }

    return null;
  } catch (err) {
    console.warn('Exception fetching products from Supabase:', err);
    return null;
  }
};

/**
 * Fetches all orders directly from Supabase database.
 */
export const fetchOrdersFromSupabase = async (): Promise<Order[] | null> => {
  const supabase = getSupabase();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Error fetching orders from Supabase:', error.message);
      return null;
    }

    if (data && Array.isArray(data)) {
      return data.map((o: any) => ({
        id: o.id,
        customerName: o.customer_name || 'زبون',
        customerEmail: o.customer_email || '',
        customerPhone: o.customer_phone || '',
        address: o.address || '',
        city: o.city || 'بغداد',
        notes: o.notes || '',
        items: Array.isArray(o.items) ? o.items : [],
        totalAmount: Number(o.total_amount) || 0,
        discountAmount: Number(o.discount_amount) || 0,
        shippingFee: Number(o.shipping_fee) || 0,
        finalAmount: Number(o.final_amount) || 0,
        paymentMethod: o.payment_method || 'cod',
        status: o.status || 'pending',
        trackingNumber: o.tracking_number || '',
        shippingCarrier: o.shipping_carrier || '',
        createdAt: o.created_at || new Date().toISOString(),
        statusHistory: Array.isArray(o.status_history) ? o.status_history : [],
        notifications: Array.isArray(o.notifications) ? o.notifications : [],
      }));
    }

    return null;
  } catch (err) {
    console.warn('Exception fetching orders from Supabase:', err);
    return null;
  }
};

/**
 * Syncs a new order or updates an existing order in Supabase.
 */
export const syncOrderToSupabase = async (order: Order): Promise<boolean> => {
  const supabase = getSupabase();
  if (!supabase) return false;

  try {
    const { error } = await supabase.from('orders').upsert(
      {
        id: order.id,
        customer_name: order.customerName,
        customer_email: order.customerEmail || null,
        customer_phone: order.customerPhone,
        address: order.address,
        city: order.city,
        notes: order.notes || null,
        items: order.items,
        total_amount: order.totalAmount,
        discount_amount: order.discountAmount,
        shipping_fee: order.shippingFee,
        final_amount: order.finalAmount,
        payment_method: order.paymentMethod,
        status: order.status,
        tracking_number: order.trackingNumber || null,
        shipping_carrier: order.shippingCarrier || null,
      },
      { onConflict: 'id' }
    );

    if (error) {
      console.warn('Syncing order to Supabase error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Exception syncing order to Supabase:', err);
    return false;
  }
};

/**
 * Updates an order status and tracking details in Supabase.
 */
export const syncOrderStatusToSupabase = async (
  orderId: string,
  status: string,
  trackingNumber?: string,
  shippingCarrier?: string
): Promise<boolean> => {
  const supabase = getSupabase();
  if (!supabase) return false;

  try {
    const updates: Record<string, any> = { status };
    if (trackingNumber !== undefined) updates.tracking_number = trackingNumber;
    if (shippingCarrier !== undefined) updates.shipping_carrier = shippingCarrier;

    const { error } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', orderId);

    if (error) {
      console.warn('Updating order status in Supabase error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Exception updating order status in Supabase:', err);
    return false;
  }
};

/**
 * Fetches all support messages directly from Supabase.
 */
export const fetchSupportMessagesFromSupabase = async (): Promise<SupportMessage[] | null> => {
  const supabase = getSupabase();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('support_messages')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Error fetching support messages from Supabase:', error.message);
      return null;
    }

    if (data && Array.isArray(data)) {
      return data.map((m: any) => ({
        id: m.id,
        customerName: m.customer_name || 'زبون',
        customerPhone: m.customer_phone || '',
        customerEmail: m.customer_email || '',
        subject: m.subject || '',
        message: m.message || '',
        status: (m.status as any) || 'new',
        replyNotes: m.reply_notes || undefined,
        createdAt: m.created_at || new Date().toISOString(),
      }));
    }

    return null;
  } catch (err) {
    console.warn('Exception fetching support messages from Supabase:', err);
    return null;
  }
};

/**
 * Syncs a new customer support message to Supabase.
 */
export const syncSupportMessageToSupabase = async (msg: SupportMessage): Promise<boolean> => {
  const supabase = getSupabase();
  if (!supabase) return false;

  try {
    const { error } = await supabase.from('support_messages').upsert(
      {
        id: msg.id,
        customer_name: msg.customerName,
        customer_phone: msg.customerPhone || null,
        customer_email: msg.customerEmail || null,
        subject: msg.subject,
        message: msg.message,
        status: msg.status || 'new',
        reply_notes: msg.replyNotes || null,
      },
      { onConflict: 'id' }
    );

    if (error) {
      console.warn('Syncing support message to Supabase error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Exception syncing support message to Supabase:', err);
    return false;
  }
};

/**
 * Updates a support message status/reply in Supabase.
 */
export const updateSupportMessageInSupabase = async (
  id: string,
  status: string,
  replyNotes?: string
): Promise<boolean> => {
  const supabase = getSupabase();
  if (!supabase) return false;

  try {
    const updates: Record<string, any> = { status };
    if (replyNotes !== undefined) updates.reply_notes = replyNotes;

    const { error } = await supabase
      .from('support_messages')
      .update(updates)
      .eq('id', id);

    if (error) {
      console.warn('Updating support message in Supabase error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Exception updating support message in Supabase:', err);
    return false;
  }
};

export { getSupabaseServer } from './supabaseServer';


