import React, { useState, useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import { ProductCard } from './ProductCard';
import { SlidersHorizontal, Search, X, Settings } from 'lucide-react';

export const ProductsView: React.FC = () => {
  const {
    products,
    categories,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    getText,
    currentUser,
    setActiveView,
    getCategoryName,
    getCategoryDescription,
  } = useStore();

  const [sortBy, setSortBy] = useState<'featured' | 'newest' | 'price-asc' | 'price-desc' | 'rating'>('featured');

  // Filter & sort
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Filter by category
    if (selectedCategory && selectedCategory !== 'all') {
      result = result.filter((p) => p.categoryId === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          (p.tags && p.tags.some((t) => t.toLowerCase().includes(q)))
      );
    }

    // Sort
    if (sortBy === 'newest') {
      result.sort((a, b) => {
        if (a.isNew && !b.isNew) return -1;
        if (!a.isNew && b.isNew) return 1;
        return 0;
      });
    } else if (sortBy === 'price-asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    }

    return result;
  }, [products, selectedCategory, searchQuery, sortBy]);

  const activeCategoryObj = categories.find((c) => c.id === selectedCategory);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10 text-right font-cairo" dir="rtl">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-stone-900">
              {activeCategoryObj
                ? getCategoryName(activeCategoryObj)
                : getText('allProductsTitle', 'تشكيلة ورد الليكو الفاخرة')}
            </h1>
            <span className="text-xs font-semibold text-rose-600 bg-rose-100/70 px-2.5 py-0.5 rounded-full shrink-0">
              {filteredProducts.length} منتج
            </span>
          </div>
          <p className="text-xs text-stone-500">
            {activeCategoryObj
              ? getCategoryDescription(activeCategoryObj)
              : getText('allProductsSubtitle', 'ورد مميز لا يذبل صُممت لتبقى معك للأبد بأرقى تفاصيل التركيب والتغليف الفاخر')}
          </p>
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-rose-200 text-xs shadow-2xs w-full sm:w-auto justify-between sm:justify-start">
            <div className="flex items-center gap-1.5 text-stone-500">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>الترتيب:</span>
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="font-bold text-stone-800 bg-transparent outline-hidden cursor-pointer text-xs"
            >
              <option value="featured">المميزة والأكثر طلباً</option>
              <option value="newest">وصل حديثاً (الأحدث أولاً)</option>
              <option value="price-asc">السعر: من الأقل للأعلى</option>
              <option value="price-desc">السعر: من الأعلى للأقل</option>
              <option value="rating">الأعلى تقييماً</option>
            </select>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none -mx-3 px-3 sm:mx-0 sm:px-0">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            selectedCategory === 'all'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'bg-white text-stone-700 border border-rose-100 hover:border-rose-300'
          }`}
        >
          {getText('filterAll', 'عرض الكل')}
        </button>

        {categories
          .filter((c) => c.id !== 'about' && !c.name.includes('من نحن') && !c.name.toLowerCase().includes('about'))
          .map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              selectedCategory === cat.id
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-white text-stone-700 border border-rose-100 hover:border-rose-300'
            }`}
          >
            {getCategoryName(cat)}
          </button>
        ))}

        {/* Manager-only Category Control */}
        {currentUser?.role === 'admin' && (
          <button
            onClick={() => setActiveView('admin')}
            className="px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer bg-stone-900 hover:bg-stone-800 text-amber-300 border border-stone-800 flex items-center gap-1.5 shadow-2xs"
            title="إدارة وتعديل الأقسام (خاص بالمدير)"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>إدارة وتعديل الأقسام (خاص بالمدير)</span>
          </button>
        )}
      </div>

      {/* Search Filter Chip if active */}
      {searchQuery && (
        <div className="flex items-center gap-2 mb-6 bg-rose-50 p-3 rounded-xl border border-rose-200">
          <span className="text-xs text-stone-600">
            نتائج البحث عن: <strong className="text-rose-700">"{searchQuery}"</strong>
          </span>
          <button
            onClick={() => setSearchQuery('')}
            className="p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-rose-100 transition-colors cursor-pointer mr-auto"
            title="إلغاء البحث"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Products Grid - Optimized for Mobile (2 cols), iPad (3 cols), Desktop (4 cols) */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-16 sm:py-20 bg-white rounded-3xl border border-rose-100 p-6 sm:p-8 shadow-2xs space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-rose-50 flex items-center justify-center text-rose-300">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-stone-900">
            {products.length === 0
              ? 'لا توجد منتجات معروضة حالياً'
              : 'لم يتم العثور على منتجات مطابقة'}
          </h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            {products.length === 0
              ? 'المتجر مجهز وفارغ بالكامل، ويمكنك كمدير البدء بإضافة المنتجات وتحديد أسعارها من لوحة التحكم.'
              : 'جربي البحث بكلمات أخرى أو تصفح قسم مختلف من أقسام المتجر.'}
          </p>
          {products.length === 0 && currentUser?.role === 'admin' ? (
            <button
              onClick={() => setActiveView('admin')}
              className="px-6 py-2.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-md shadow-rose-200 cursor-pointer inline-flex items-center gap-2"
            >
              <span>إضافة المنتجات والأسعار من لوحة التحكم</span>
            </button>
          ) : products.length > 0 ? (
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
              }}
              className="px-6 py-2.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              إعادة تعيين التصفية
            </button>
          ) : null}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};
