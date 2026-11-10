-- ==============================================================================
-- سكربت تأمين قاعدة بيانات Supabase / PostgreSQL لمتجر Kazaki.iq (نسخة متوافقة ومبسطة)
-- ==============================================================================

-- 1. تفعيل حماية الصفوف (Row Level Security - RLS) على الجداول
ALTER TABLE IF EXISTS admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS products ENABLE ROW LEVEL SECURITY;

-- 2. إزالة أي سياسات سابقة لتجنب أي تعارض
DROP POLICY IF EXISTS "Allow service role on admin_users" ON admin_users;
DROP POLICY IF EXISTS "Deny all public access to admin_users" ON admin_users;
DROP POLICY IF EXISTS "Allow service role full access to admin_users" ON admin_users;

DROP POLICY IF EXISTS "Public insert orders" ON orders;
DROP POLICY IF EXISTS "Service role read orders" ON orders;
DROP POLICY IF EXISTS "Public can insert orders" ON orders;
DROP POLICY IF EXISTS "Service role can read orders" ON orders;

DROP POLICY IF EXISTS "Public select products" ON products;
DROP POLICY IF EXISTS "Service role manage products" ON products;
DROP POLICY IF EXISTS "Public can view products" ON products;
DROP POLICY IF EXISTS "Service role manages products" ON products;

DROP POLICY IF EXISTS "Public select categories" ON categories;
DROP POLICY IF EXISTS "Service role manage categories" ON categories;
DROP POLICY IF EXISTS "Public can view categories" ON categories;
DROP POLICY IF EXISTS "Service role manages categories" ON categories;

-- 3. سياسات جدول المديرين (admin_users):
-- بمجرد تفعيل RLS، يُمنع الوصول العام تلقائياً، ونمنح الصلاحية فقط لمفتاح السيرفر service_role
CREATE POLICY "Allow service role on admin_users"
    ON admin_users
    TO service_role
    USING (true)
    WITH CHECK (true);

-- 4. سياسات جدول الطلبات (orders):
-- السماح للزبائن بإرسال طلبات جديدة فقط (INSERT)
CREATE POLICY "Public insert orders"
    ON orders
    FOR INSERT
    TO public
    WITH CHECK (true);

-- السماح للسيرفر فقط بقراءة جميع الطلبات وإدارتها
CREATE POLICY "Service role read orders"
    ON orders
    TO service_role
    USING (true)
    WITH CHECK (true);

-- 5. سياسات جدول المنتجات (products):
-- السماح لجميع الزوار بقراءة وتصفح المنتجات فقط (SELECT)
CREATE POLICY "Public select products"
    ON products
    FOR SELECT
    TO public
    USING (true);

-- السماح لمفتاح السيرفر والمدير بكافة الصلاحيات (إضافة، تعديل، حذف)
CREATE POLICY "Service role manage products"
    ON products
    TO service_role
    USING (true)
    WITH CHECK (true);

-- 6. سياسات جدول الأقسام (categories):
-- السماح لجميع الزوار بقراءة وتصفح الأقسام (SELECT)
CREATE POLICY "Public select categories"
    ON categories
    FOR SELECT
    TO public
    USING (true);

-- السماح لمفتاح السيرفر والمدير بكافة الصلاحيات
CREATE POLICY "Service role manage categories"
    ON categories
    TO service_role
    USING (true)
    WITH CHECK (true);
