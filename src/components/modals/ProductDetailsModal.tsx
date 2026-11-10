import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  X,
  Star,
  ShoppingBag,
  ShieldCheck,
  Truck,
  RotateCcw,
  Check,
  Plus,
  Minus,
  Zap,
  Video,
  DollarSign,
  Edit2,
  Trash2,
  Camera,
} from 'lucide-react';

export const ProductDetailsModal: React.FC = () => {
  const {
    selectedProduct,
    setSelectedProduct,
    addToCart,
    categories,
    settings,
    setIsCartOpen,
    getBtnText,
    getText,
    currentUser,
    setActiveView,
    updateProduct,
    deleteProduct,
    currencyLabel,
    getCategoryName,
  } = useStore();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [addedSuccess, setAddedSuccess] = useState(false);
  const [activeMedia, setActiveMedia] = useState<'image' | 'video'>('image');

  React.useEffect(() => {
    setSelectedImage('');
    setActiveMedia('image');
  }, [selectedProduct?.id]);

  if (!selectedProduct) return null;

  const category = categories.find((c) => c.id === selectedProduct.categoryId);
  const gallery = Array.from(
    new Set([
      selectedProduct.image,
      ...(selectedProduct.gallery || []),
    ].filter(Boolean) as string[])
  );
  const mainImage = selectedImage && gallery.includes(selectedImage) ? selectedImage : selectedProduct.image;

  const handleAddToCart = () => {
    if (!selectedProduct.inStock || addedSuccess) return;
    addToCart(selectedProduct, quantity);
    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 1500);
  };

  const handleBuyNow = () => {
    if (!selectedProduct.inStock || addedSuccess) return;
    addToCart(selectedProduct, quantity);
    setSelectedProduct(null);
    setIsCartOpen(true);
  };

  const discountPercent =
    selectedProduct.originalPrice && selectedProduct.originalPrice > selectedProduct.price
      ? Math.round(
          ((selectedProduct.originalPrice - selectedProduct.price) /
            selectedProduct.originalPrice) *
            100
        )
      : null;

  const effectiveTitle = selectedProduct.title;
  const effectiveDescription = selectedProduct.description;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex min-h-full items-center justify-center p-2.5 sm:p-4 md:p-6">
      <div
        className="my-auto relative bg-white rounded-2xl sm:rounded-3xl max-w-lg md:max-w-3xl w-full overflow-hidden shadow-2xl border border-rose-100 animate-in fade-in zoom-in-95 duration-200 text-right"
        dir="rtl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Manager Controls Bar (Visible ONLY to Admin) */}
        {currentUser?.role === 'admin' && (
          <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 text-white px-5 py-2.5 flex flex-wrap items-center justify-between gap-2 border-b border-stone-700 text-xs">
            <div className="flex items-center gap-2">
              <span className="bg-amber-400/20 text-amber-300 font-bold px-2.5 py-1 rounded-md text-[11px] border border-amber-400/30 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>صلاحيات المدير</span>
              </span>
              <span className="text-stone-300 hidden sm:inline text-[11px]">
                تعديل السعر والبيانات أو حذف المنتج مباشرة
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Quick price update prompt */}
              <button
                type="button"
                onClick={() => {
                  const input = prompt(
                    `تعديل سعر المنتج (${selectedProduct.title}):\nالسعر الحالي: ${selectedProduct.price} ${settings.currency}\nأدخل السعر الجديد بالأرقام:`,
                    String(selectedProduct.price)
                  );
                  if (input !== null) {
                    const num = Number(input.trim());
                    if (!isNaN(num) && num > 0) {
                      updateProduct(selectedProduct.id, { price: num });
                    }
                  }
                }}
                className="px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold transition-all cursor-pointer flex items-center gap-1 shadow-2xs text-[11px]"
                title="تعديل السعر الحالي مباشرة"
              >
                <DollarSign className="w-3.5 h-3.5" />
                <span>تعديل السعر ({selectedProduct.price} {settings.currency})</span>
              </button>

              {/* Full Edit in Admin Dashboard */}
              <button
                type="button"
                onClick={() => {
                  setSelectedProduct(null);
                  setActiveView('admin');
                }}
                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold transition-all cursor-pointer flex items-center gap-1 border border-white/20 text-[11px]"
                title="فتح لوحة الإدارة للتعديل الشامل"
              >
                <Edit2 className="w-3.5 h-3.5 text-rose-300" />
                <span>تعديل شامل</span>
              </button>

              {/* Delete product directly */}
              <button
                type="button"
                onClick={() => {
                  if (confirm(`هل أنت متأكد من رغبتك في حذف المنتج "${selectedProduct.title}" نهائياً من المتجر؟`)) {
                    deleteProduct(selectedProduct.id);
                    setSelectedProduct(null);
                  }
                }}
                className="px-2.5 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500 text-red-200 hover:text-white font-bold transition-all cursor-pointer flex items-center gap-1 border border-red-500/30 text-[11px]"
                title="حذف هذا المنتج"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>حذف</span>
              </button>
            </div>
          </div>
        )}

        {/* Close Button */}
        <button
          onClick={() => setSelectedProduct(null)}
          className={`absolute ${currentUser?.role === 'admin' ? 'top-14' : 'top-4'} left-4 z-20 p-2 rounded-full bg-stone-100 hover:bg-rose-100 text-stone-600 hover:text-rose-700 transition-colors cursor-pointer`}
          aria-label="إغلاق النافذة"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Images / Video Gallery */}
          <div className="bg-rose-50/40 p-4 sm:p-6 flex flex-col justify-between border-b md:border-b-0 md:border-l border-rose-100">
            {/* Switcher if product has video */}
            {selectedProduct.videoUrl && (
              <div className="flex items-center justify-center gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => setActiveMedia('image')}
                  className={`px-3.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeMedia === 'image'
                      ? 'bg-rose-600 text-white shadow-2xs'
                      : 'bg-white text-stone-600 border border-rose-200 hover:bg-rose-50'
                  }`}
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>الصور</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveMedia('video')}
                  className={`px-3.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeMedia === 'video'
                      ? 'bg-rose-600 text-white shadow-2xs'
                      : 'bg-white text-stone-600 border border-rose-200 hover:bg-rose-50'
                  }`}
                >
                  <Video className="w-3.5 h-3.5 text-amber-300" />
                  <span>فيديو المنتج</span>
                </button>
              </div>
            )}

            <div className="relative aspect-square rounded-2xl overflow-hidden bg-white shadow-xs border border-rose-100 flex items-center justify-center">
              {activeMedia === 'video' && selectedProduct.videoUrl ? (
                <video
                  src={selectedProduct.videoUrl}
                  controls
                  autoPlay
                  playsInline
                  className="w-full h-full object-contain bg-black"
                />
              ) : (
                <>
                  <img
                    src={mainImage}
                    alt={selectedProduct.title}
                    className="w-full h-full object-cover"
                  />
                  {discountPercent && (
                    <span className="absolute top-3 right-3 bg-rose-600 text-white text-xs font-bold px-2.5 py-1 rounded-lg">
                      خصم {discountPercent}%
                    </span>
                  )}
                </>
              )}
            </div>

            {/* Thumbnail selector if gallery exists */}
            {gallery.length > 1 && (
              <div className="flex gap-2 mt-4 overflow-x-auto pb-1">
                {gallery.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                      mainImage === img ? 'border-rose-600 scale-105' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details Content */}
          <div className="p-6 md:p-8 flex flex-col justify-between text-right">
            <div>
              {/* Category & Tags */}
              <div className="flex items-center gap-2 text-xs text-stone-500 mb-2">
                <span className="font-semibold text-rose-600">
                  {getCategoryName(category)}
                </span>
                {selectedProduct.volumeOrSize && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span>{selectedProduct.volumeOrSize}</span>
                  </>
                )}
                {!selectedProduct.inStock && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="text-red-500 font-medium">
                      غير متوفر حالياً
                    </span>
                  </>
                )}
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-stone-900 mb-3 leading-snug">
                {effectiveTitle}
              </h2>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-4 text-xs">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(selectedProduct.rating) ? 'fill-amber-400' : 'text-stone-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="font-bold text-stone-800">{selectedProduct.rating}</span>
                <span className="text-stone-400">
                  ({selectedProduct.reviewsCount} تقييم حقيقي)
                </span>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-2xl font-extrabold text-stone-900">
                  {selectedProduct.price} {currencyLabel}
                </span>
                {selectedProduct.originalPrice && (
                  <span className="text-sm text-stone-400 line-through">
                    {selectedProduct.originalPrice} {currencyLabel}
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed mb-6">
                {effectiveDescription}
              </p>

              {/* Tags */}
              {selectedProduct.tags && selectedProduct.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-6">
                  {selectedProduct.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="text-[11px] px-2.5 py-1 rounded-md bg-rose-50 text-rose-700 font-medium border border-rose-100"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Actions: Quantity & Add to Cart */}
            <div className="pt-4 border-t border-rose-100">
              <div className="flex items-center gap-4 mb-4">
                <span className="text-xs font-bold text-stone-700">
                  الكمية:
                </span>
                <div className="flex items-center border border-rose-200 rounded-full bg-rose-50/50 p-1">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-1 rounded-full hover:bg-white text-stone-600 transition-colors cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-8 text-center text-xs font-bold text-stone-800">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    disabled={quantity >= 50}
                    className="p-1 rounded-full hover:bg-white text-stone-600 transition-colors cursor-pointer disabled:opacity-40"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="space-y-2.5">
                <button
                  onClick={handleAddToCart}
                  disabled={!selectedProduct.inStock}
                  className={`w-full py-3.5 rounded-full font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 shadow-md cursor-pointer ${
                    addedSuccess
                      ? 'bg-emerald-600 text-white shadow-emerald-200'
                      : selectedProduct.inStock
                      ? 'bg-gradient-to-r from-rose-600 to-pink-500 hover:from-rose-500 hover:to-pink-600 text-white shadow-rose-300 hover:shadow-lg'
                      : 'bg-stone-200 text-stone-400 cursor-not-allowed shadow-none'
                  }`}
                >
                  {addedSuccess ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>تمت الإضافة بنجاح إلى السلة!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>
                        {getBtnText('addToCart', 'أضف إلى السلة')} ({selectedProduct.price * quantity} {currencyLabel})
                      </span>
                    </>
                  )}
                </button>

                {selectedProduct.inStock && (
                  <button
                    onClick={handleBuyNow}
                    type="button"
                    disabled={addedSuccess}
                    className="w-full py-3 rounded-full font-bold text-xs bg-stone-900 hover:bg-stone-800 text-white transition-all duration-200 flex items-center justify-center gap-2 shadow-xs cursor-pointer border border-stone-800 disabled:opacity-50"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                    <span>{getBtnText('buyNow', 'شراء الآن')}</span>
                  </button>
                )}
              </div>

              {/* Guarantees */}
              <div className="grid grid-cols-3 gap-2 mt-4 text-[10px] text-stone-500 text-center">
                <div className="flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-rose-500" />
                  <span>{getText('guaranteeOriginal', 'منتج أصلي 100%')}</span>
                </div>
                <div className="flex items-center justify-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-rose-500" />
                  <span>{getText('guaranteeFastShipping', 'شحن لجميع العراق')}</span>
                </div>
                <div className="flex items-center justify-center gap-1">
                  <RotateCcw className="w-3.5 h-3.5 text-rose-500" />
                  <span>{getText('guaranteeEasyReturn', 'إرجاع سهل')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
