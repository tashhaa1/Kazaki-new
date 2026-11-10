import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// تحميل متغيرات البيئة من .env مع قيم احتياطية
const envPath = path.resolve(process.cwd(), '.env');
const envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';
const env: Record<string, string> = {};
for (const line of envContent.split('\n')) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const [k, ...v] = trimmed.split('=');
  if (k && v.length) {
    env[k.trim()] = v.join('=').trim();
  }
}

const supabaseUrl = env.VITE_SUPABASE_URL || env.SUPABASE_URL || 'https://aadwlfwdqubxtmhzbkpn.supabase.co';
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.VITE_SUPABASE_ANON_KEY || env.SUPABASE_ANON_KEY || 'sb_publishable_MridwJWlvDvHU5ADteSLCw_zrXt09PJ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log('1. رفع الصور الـ 41 إلى Supabase Storage...');
  const storageBucket = 'product-images';
  const imgDir = path.resolve(process.cwd(), 'public/images/ready-lego-flowers');

  for (let i = 1; i <= 41; i++) {
    const numStr = String(i).padStart(2, '0');
    const fileName = `flower-${numStr}.jpeg`;
    const filePath = path.join(imgDir, fileName);
    const storagePath = `ready-lego-flowers/${fileName}`;

    if (fs.existsSync(filePath)) {
      const fileBuffer = fs.readFileSync(filePath);
      const { error: uploadError } = await supabase.storage
        .from(storageBucket)
        .upload(storagePath, fileBuffer, {
          contentType: 'image/jpeg',
          upsert: true,
        });

      if (uploadError) {
        console.warn(`تحذير في رفع الصورة ${fileName}:`, uploadError.message);
      } else {
        process.stdout.write(`.` );
      }
    }
  }
  console.log('\nاكتمل فحص ورفع الصور بنجاح.');

  console.log('2. تحديث قسم ورد الليكو الجاهز (id: flowers)...');
  const categoryData = {
    id: 'flowers',
    name: 'ورد الليكو الجاهز',
    name_en: 'Ready Lego Flowers',
    name_ku: 'گوڵی لێکۆی ئامادەکراو',
    description: 'تشكيلة فاخرة من زهور الليكو المركبة والمجهزة بالكامل، بتصاميم وألوان تحاكي الطبيعة برونق تركيبي لا يذبل أبداً.',
    description_en: 'A luxury collection of pre-assembled ready Lego flowers in vibrant colors and botanical designs that never wilt.',
    description_ku: 'کۆمەڵەیەکی شاز لە گوڵی لێکۆی ئامادەکراو و بەستراو بە ڕەنگ و دیزاینی سەرسوڕهێنەر کە هەرگیز پەژمورردە نابێت.',
    image: `${supabaseUrl}/storage/v1/object/public/product-images/ready-lego-flowers/flower-01.jpeg`,
    icon: 'Sparkles',
  };

  const { error: catError } = await supabase
    .from('categories')
    .upsert(categoryData, { onConflict: 'id' });

  if (catError) {
    console.error('خطأ في إضافة القسم:', catError);
    process.exit(1);
  }
  console.log('تم تحديث القسم بنجاح في قاعدة البيانات.');

  console.log('3. قراءة بيانات المنتجات وإدراجها في جدول products...');
  // قراءة السكربت أو البيانات المجهزة
  const pythonScript = `
import sys, json
sys.path.append('scripts')
from flowers_data import FLOWERS_DATA
print(json.dumps(FLOWERS_DATA))
`;
  const productsJson = execSync(`python -c "${pythonScript.replace(/"/g, '\\"')}"`, { encoding: 'utf8' });
  const rawProducts = JSON.parse(productsJson.trim());

  const productsToUpsert = rawProducts.map((p: any) => {
    const pubUrl = `${supabaseUrl}/storage/v1/object/public/product-images/${p.storage_path}`;
    const localUrl = `/images/ready-lego-flowers/${p.image_file}`;
    return {
      id: p.id,
      title: p.title,
      description: `${p.description} ${p.color_symbolism}`,
      price: p.price,
      original_price: p.original_price,
      category_id: 'flowers',
      image: pubUrl,
      gallery: [pubUrl, localUrl],
      in_stock: true,
      stock_count: p.stock,
      rating: 5,
      reviews_count: (p.num % 4) + 2,
      is_featured: [4, 6, 15, 19, 24, 26, 27, 34, 35, 36, 41].includes(p.num),
      is_new: true,
      volume_or_size: p.volume_or_size,
      tags: p.tags,
    };
  });

  // إدراج بالدفعات (Batches of 15)
  for (let i = 0; i < productsToUpsert.length; i += 15) {
    const chunk = productsToUpsert.slice(i, i + 15);
    const { error: prodError } = await supabase
      .from('products')
      .upsert(chunk, { onConflict: 'id' });

    if (prodError) {
      console.error(`خطأ في إدراج الدفعة من ${i}:`, prodError);
      process.exit(1);
    }
  }

  console.log(`تم إدراج وتحديث ${productsToUpsert.length} منتجاً بنجاح في جدول products.`);

  // تأكيد إجمالي المنتجات في قسم flowers
  const { count, error: countErr } = await supabase
    .from('products')
    .select('id', { count: 'exact' })
    .eq('category_id', 'flowers');

  console.log(`العدد الإجمالي للمنتجات في قسم flowers الآن: ${count}`);
}

main().catch(console.error);
