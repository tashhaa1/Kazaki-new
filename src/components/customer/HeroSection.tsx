import React from 'react';
import { useStore } from '../../context/StoreContext';
import { ArrowLeft, Heart, Shield, Truck, RefreshCw, Layers } from 'lucide-react';

export const HeroSection: React.FC = () => {
  const {
    settings,
    products,
    setActiveView,
    setSelectedCategory,
    setSelectedProduct,
    categories,
    getBtnText,
    getText,
    getCategoryName,
    getCategoryDescription,
    currencyLabel,
  } = useStore();

  const banner = settings.heroBanner;

  // The latest product added to the store (connected to "وصل حديثاً")
  const latestProduct = products.length > 0 ? (products.find((p) => p.isNew) || products[0]) : null;
  const effectiveLatestTitle = latestProduct ? latestProduct.title : '';

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-rose-50/50 via-white/70 to-rose-50/30 backdrop-blur-[1px] pt-8 pb-16 font-cairo" dir="rtl">
      {/* Subtle background blur rings */}
      <div className="absolute top-0 right-10 w-96 h-96 bg-rose-200/30 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-10 w-80 h-80 bg-pink-200/20 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Text Content */}
          <div className="lg:col-span-7 space-y-6 text-right">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-100/90 text-rose-800 text-xs font-bold border border-rose-200 shadow-2xs">
              <Heart className="w-3.5 h-3.5 text-rose-600 fill-rose-600" />
              <span>{getText('heroBadge', banner.discountBadge || 'ورد الليكو الدائم للأبد')}</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-stone-900 tracking-tight leading-[1.2]">
              {getText('heroTitle', banner.title)}
            </h1>

            <p className="text-stone-600 text-sm sm:text-base lg:text-lg leading-relaxed max-w-xl">
              {getText('heroSubtitle', banner.subtitle)}
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => {
                  setActiveView('products');
                  setSelectedCategory('all');
                }}
                className="group inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-gradient-to-r from-rose-600 to-pink-500 hover:from-rose-500 hover:to-pink-600 text-white font-semibold text-sm shadow-md shadow-rose-300 hover:shadow-lg hover:shadow-rose-300/60 transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer"
              >
                <span>{getText('announcementLink', banner.ctaText || 'استكشف ورد الليكو')}</span>
                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              </button>
            </div>

            {/* Micro Feature Proofs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 pt-6 sm:pt-8 border-t border-rose-100/80">
              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white/60 sm:bg-transparent border sm:border-0 border-rose-100/60">
                <div className="p-2 rounded-xl bg-rose-100/80 text-rose-700 shrink-0">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-stone-800">
                    {getText('guaranteeFastShipping', 'شحن لجميع العراق')}
                  </h4>
                  <p className="text-[11px] text-stone-500">
                    خلال 24-48 ساعة
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white/60 sm:bg-transparent border sm:border-0 border-rose-100/60">
                <div className="p-2 rounded-xl bg-rose-100/80 text-rose-700 shrink-0">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-stone-800">
                    {getText('guaranteeOriginal', 'منتجات أصلية 100%')}
                  </h4>
                  <p className="text-[11px] text-stone-500">
                    ضمان ذهبي للمنتجات
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white/60 sm:bg-transparent border sm:border-0 border-rose-100/60">
                <div className="p-2 rounded-xl bg-rose-100/80 text-rose-700 shrink-0">
                  <RefreshCw className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-stone-800">
                    {getText('guaranteeEasyReturn', 'إرجاع سهل ومرن')}
                  </h4>
                  <p className="text-[11px] text-stone-500">
                    خلال 14 يوماً بسهولة
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Hero Visual Image */}
          <div className="lg:col-span-5 relative mt-4 lg:mt-0">
            <div className="relative mx-auto max-w-sm sm:max-w-md md:max-w-lg lg:max-w-none">
              {/* Outer decorative ring */}
              <div className="absolute -inset-2 rounded-3xl bg-gradient-to-tr from-rose-300 via-pink-200 to-rose-100 opacity-60 blur-lg" />
              
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white aspect-4/5 bg-rose-100">
                <img
                  src={
                    (latestProduct && latestProduct.image)
                      ? latestProduct.image
                      : (banner.imageUrl || 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=1200&q=80')
                  }
                  alt={latestProduct ? effectiveLatestTitle : banner.title}
                  className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-700"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=1200&q=80';
                  }}
                />

                {/* Floating luxury product highlight tag for "وصل حديثاً" */}
                {latestProduct ? (
                  <div
                    onClick={() => setSelectedProduct(latestProduct)}
                    className="absolute bottom-6 right-6 left-6 p-3.5 sm:p-4 rounded-2xl bg-white/95 backdrop-blur-md border border-rose-100/90 shadow-xl flex items-center justify-between gap-3 cursor-pointer hover:border-rose-300 hover:shadow-2xl transition-all duration-300 group/tag text-right"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {latestProduct.image && (
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-rose-50 border border-rose-200 shrink-0">
                          <img
                            src={latestProduct.image}
                            alt={effectiveLatestTitle}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.currentTarget as HTMLElement).style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                          <span className="text-[11px] font-bold text-rose-600 block truncate">
                            وصل حديثاً
                          </span>
                        </div>
                        <h3 className="text-xs sm:text-sm font-extrabold text-stone-900 truncate group-hover/tag:text-rose-600 transition-colors">
                          {effectiveLatestTitle}
                        </h3>
                        <span className="text-[11px] font-bold text-rose-600">
                          {Number(latestProduct.price || 0).toLocaleString('ar-IQ')} {currencyLabel}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedProduct(latestProduct);
                      }}
                      className="p-2.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white transition-colors shrink-0 shadow-md cursor-pointer"
                      title="عرض تفاصيل المنتج"
                    >
                      <ArrowLeft className="w-4 h-4 transition-transform group-hover/tag:-translate-x-1" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => {
                      setActiveView('products');
                      setSelectedCategory('all');
                    }}
                    className="absolute bottom-6 right-6 left-6 p-4 rounded-2xl bg-white/90 backdrop-blur-md border border-rose-100/80 shadow-lg flex items-center justify-between cursor-pointer text-right"
                  >
                    <div>
                      <span className="text-[11px] font-semibold text-rose-600 block">
                        استكشف التشكيلة
                      </span>
                      <h3 className="text-sm font-bold text-stone-900">
                        ورد الليكو الفاخر الدائم
                      </h3>
                    </div>
                    <div className="p-2 rounded-full bg-rose-500 text-white">
                      <ArrowLeft className="w-4 h-4" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Categories Bar */}
        <div className="mt-16 pt-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-stone-900">
              التسوق حسب القسم
            </h2>
            <button
              onClick={() => {
                setActiveView('products');
                setSelectedCategory('all');
              }}
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
            >
              <span>{getBtnText('filterAll', 'عرض الكل')}</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {categories
              .filter((c) => c.id !== 'about' && !c.name.includes('من نحن') && !c.name.toLowerCase().includes('about'))
              .map((cat) => (
              <div
                key={cat.id}
                onClick={() => {
                  setActiveView('products');
                  setSelectedCategory(cat.id);
                }}
                className="group relative rounded-2xl overflow-hidden bg-white border border-rose-100 p-4 hover:border-rose-300 hover:shadow-md transition-all cursor-pointer text-center"
              >
                <div className="w-16 h-16 mx-auto mb-3 rounded-full overflow-hidden bg-rose-50 border-2 border-rose-100 group-hover:scale-110 transition-transform flex items-center justify-center relative">
                  {cat.image ? (
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.currentTarget;
                        target.style.display = 'none';
                        const fallback = target.parentElement?.querySelector('.category-fallback-icon') as HTMLElement;
                        if (fallback) fallback.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div
                    className="category-fallback-icon w-full h-full flex items-center justify-center text-rose-500 font-bold"
                    style={{ display: cat.image ? 'none' : 'flex' }}
                  >
                    <Layers className="w-6 h-6 text-rose-400" />
                  </div>
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-stone-800 group-hover:text-rose-600 transition-colors">
                  {getCategoryName(cat)}
                </h3>
                <p className="text-[10px] text-stone-400 mt-0.5 line-clamp-1">
                  {getCategoryDescription(cat)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
