/**
 * Security & Input Sanitization Suite for Kazaki.iq
 * Implements strict input validation, XSS prevention, and authorization controls
 * according to backend & frontend security best practices.
 */

import { Product, Category, User } from '../types';

/**
 * Strips dangerous HTML tags, javascript: schemes, and inline event handlers to prevent XSS.
 */
export const sanitizeText = (input: unknown, maxLength = 2000): string => {
  if (typeof input !== 'string') return '';
  
  // 1. Strip script, iframe, object, embed, and style tags with their contents
  let clean = input.replace(/<\s*(script|iframe|object|embed|style)\b[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, '');
  
  // 2. Strip remaining HTML tags
  clean = clean.replace(/<\/?[a-z0-9]+(?:\s+[^>]*?)?\/?>/gi, '');
  
  // 3. Strip javascript: and vbscript: pseudoprotocols
  clean = clean.replace(/javascript\s*:/gi, '').replace(/vbscript\s*:/gi, '');
  
  // 4. Strip dangerous inline event handlers like onerror=, onload=, onclick=
  clean = clean.replace(/\bon\w+\s*=/gi, '');

  // 5. Trim and enforce length bound
  clean = clean.trim();
  if (clean.length > maxLength) {
    clean = clean.substring(0, maxLength);
  }

  return clean;
};

/**
 * Validates and sanitizes monetary prices.
 * Protects against negative values, NaN, Infinity, and non-numeric payloads.
 */
export const sanitizePrice = (priceInput: unknown): number => {
  const num = Number(priceInput);
  if (!Number.isFinite(num) || isNaN(num) || num < 0) {
    return 0;
  }
  // Cap at maximum reasonable store price (100 Million IQD)
  const capped = Math.min(num, 100_000_000);
  return Math.round(capped);
};

/**
 * Validates and sanitizes stock inventory counts.
 */
export const sanitizeStockCount = (stockInput: unknown): number => {
  const num = Number(stockInput);
  if (!Number.isFinite(num) || isNaN(num) || num < 0) {
    return 0;
  }
  return Math.floor(Math.min(num, 1_000_000));
};

/**
 * Validates whether an active user session is an authenticated Administrator.
 */
export const isUserAdmin = (user: User | null | undefined): boolean => {
  if (!user || typeof user !== 'object') return false;
  return user.role === 'admin' && Boolean(user.id);
};

/**
 * Comprehensive Product Payload Validator & Sanitizer.
 */
/**
 * Validates and sanitizes media URLs (data: URLs, absolute http/https, and relative URLs).
 * Preserves full base64 image data without truncation.
 */
export const sanitizeMediaUrl = (url: unknown): string => {
  if (typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (
    trimmed.startsWith('data:image/') ||
    trimmed.startsWith('data:video/') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('http://') ||
    trimmed.startsWith('/') ||
    trimmed.startsWith('blob:')
  ) {
    // Cap at 2MB to protect against malicious huge payloads while easily accommodating 300KB webp/jpeg base64 images
    if (trimmed.length > 2_000_000) {
      return '';
    }
    return trimmed;
  }
  return '';
};

/**
 * Comprehensive Product Payload Validator & Sanitizer.
 */
export const validateAndSanitizeProduct = (
  raw: Partial<Product>,
  validCategoryIds: string[]
): { valid: boolean; error?: string; product?: Product } => {
  const title = sanitizeText(raw.title, 200);
  if (!title) {
    return { valid: false, error: 'اسم المنتج مطلوب ولا يمكن أن يكون فارغاً' };
  }

  const price = sanitizePrice(raw.price);
  const originalPrice = raw.originalPrice !== undefined ? sanitizePrice(raw.originalPrice) : undefined;
  
  // Ensure category is in allowlist or fallback
  let categoryId = sanitizeText(raw.categoryId, 50);
  if (!validCategoryIds.includes(categoryId)) {
    categoryId = validCategoryIds[0] || 'all';
  }

  const image = sanitizeMediaUrl(raw.image) || 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=800&q=80';
  
  // Process up to 3 images (giving up to 3 images total for the product)
  const gallery: string[] = Array.isArray(raw.gallery)
    ? raw.gallery.map(sanitizeMediaUrl).filter(Boolean).slice(0, 3)
    : [];

  const stockCount = sanitizeStockCount(raw.stockCount ?? 10);
  const inStock = Boolean(raw.inStock && stockCount > 0);

  const sanitized: Product = {
    id: raw.id ? sanitizeText(raw.id, 64) : 'prod-' + Date.now(),
    title,
    description: sanitizeText(raw.description, 4000),
    price,
    originalPrice: originalPrice && originalPrice > price ? originalPrice : undefined,
    categoryId,
    image,
    gallery,
    inStock,
    stockCount,
    rating: typeof raw.rating === 'number' && raw.rating >= 0 && raw.rating <= 5 ? raw.rating : 5,
    reviewsCount: typeof raw.reviewsCount === 'number' && raw.reviewsCount >= 0 ? Math.floor(raw.reviewsCount) : 1,
    isFeatured: Boolean(raw.isFeatured),
    isNew: Boolean(raw.isNew),
    volumeOrSize: sanitizeText(raw.volumeOrSize, 100),
    tags: Array.isArray(raw.tags) ? raw.tags.map((t) => sanitizeText(t, 50)).filter(Boolean) : [],
  };

  return { valid: true, product: sanitized };
};

/**
 * Comprehensive Category Payload Validator & Sanitizer.
 */
export const validateAndSanitizeCategory = (
  raw: Partial<Category>
): { valid: boolean; error?: string; category?: Category } => {
  const name = sanitizeText(raw.name, 100);
  if (!name) {
    return { valid: false, error: 'اسم القسم مطلوب ولا يمكن أن يكون فارغاً' };
  }

  const lower = name.toLowerCase();
  if (lower.includes('من نحن') || lower.includes('about us') || lower.includes('دەربارەی ئێمە')) {
    return { valid: false, error: '«من نحن» هي صفحة مستقلة وليست قسماً للمنتجات' };
  }

  const sanitized: Category = {
    id: raw.id ? sanitizeText(raw.id, 64) : 'cat-' + Date.now(),
    name,
    nameEn: sanitizeText(raw.nameEn, 100),
    nameKu: sanitizeText(raw.nameKu, 100),
    description: sanitizeText(raw.description, 500),
    descriptionEn: sanitizeText(raw.descriptionEn, 500),
    descriptionKu: sanitizeText(raw.descriptionKu, 500),
    image: sanitizeMediaUrl(raw.image) || 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80',
    icon: sanitizeText(raw.icon, 50) || 'Heart',
  };

  return { valid: true, category: sanitized };
};
