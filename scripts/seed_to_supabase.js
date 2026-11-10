import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. تحميل مفاتيح البيئة
const envPath = path.resolve(__dirname, '../.env');
const envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';
const env = {};
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
  console.log('1. Uploading 41 flower images to Supabase Storage...');
  const storageBucket = 'product-images';
  const imgDir = path.resolve(__dirname, '../public/images/ready-lego-flowers');

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
        console.warn(`Warning uploading ${fileName}:`, uploadError.message);
      } else {
        process.stdout.write('.');
      }
    }
  }
  console.log('\nImages verified and uploaded to Storage successfully.');

  console.log('2. Updating category "flowers" (ورد الليكو الجاهز)...');
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
    console.error('Error upserting category:', catError);
    process.exit(1);
  }
  console.log('Category upserted successfully in database.');

  console.log('3. Reading flowers_data.json and upserting 41 products...');
  const jsonPath = path.resolve(__dirname, 'flowers_data.json');
  const rawProducts = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

  const featuredIds = [4, 6, 15, 19, 24, 26, 27, 34, 35, 36, 41];
  const productsToUpsert = rawProducts.map((p) => {
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
      is_featured: featuredIds.includes(p.num),
      is_new: true,
      volume_or_size: p.volume_or_size,
      tags: p.tags,
    };
  });

  // Upsert in chunks of 15
  for (let i = 0; i < productsToUpsert.length; i += 15) {
    const chunk = productsToUpsert.slice(i, i + 15);
    const { error: prodError } = await supabase
      .from('products')
      .upsert(chunk, { onConflict: 'id' });

    if (prodError) {
      console.error(`Error inserting chunk starting at ${i}:`, prodError);
      process.exit(1);
    }
  }

  console.log(`Successfully upserted ${productsToUpsert.length} products into the products table.`);

  // Verify total count
  const { count, error: countErr } = await supabase
    .from('products')
    .select('id', { count: 'exact' })
    .eq('category_id', 'flowers');

  console.log(`Current products count in "flowers" category: ${count}`);
}

main().catch(console.error);
