import React from 'react';
import { Product } from '../../types';
import { useStore } from '../../context/StoreContext';
import { ShoppingBag, Star, Eye, Check, Edit2 } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const {
    addToCart,
    setSelectedProduct,
    categories,
    settings,
    getBtnText,
    getText,
    currentUser,
    updateProduct,
    currencyLabel,
    getCategoryName,
  } = useStore();
  const [justAdded, setJustAdded] = React.useState(false);

  const category = categories.find((c) => c.id === product.categoryId);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!product.inStock || justAdded) return;
    addToCart(product, 1);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
  };

  const discountPercent =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : null;

  return (
    <div
      onClick={() => setSelectedProduct(product)}
      className="group relative bg-white rounded-2xl border border-rose-100 hover:border-rose-300 shadow-2xs hover:shadow-lg transition-all duration-300 flex flex-col overflow-hidden cursor-pointer font-cairo"
      dir="rtl"
    >
      {/* Product Image Box */}
      <div className="relative aspect-square w-full overflow-hidden bg-rose-50/50">
        <img
          src={product.image}
          alt={product.title}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Manager Quick Price Edit Button */}
        {currentUser?.role === 'admin' && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              const input = prompt(
                `تعديل سعر (${product.title}):\nالسعر الحالي: ${product.price} ${settings.currency}\nأدخل السعر الجديد بالأرقام:`,
                String(product.price)
              );
              if (input !== null) {
                const val = Number(input.trim());
                if (!isNaN(val) && val > 0) {
                  updateProduct(product.id, { price: val });
                }
              }
            }}
            className="absolute top-2.5 left-2.5 z-20 px-2.5 py-1 rounded-lg bg-stone-900/90 hover:bg-stone-900 text-amber-300 font-bold text-[10px] shadow-md flex items-center gap-1 border border-stone-700 transition-all cursor-pointer"
            title="تعديل سعر المنتج مباشرة (خاص بالمدير)"
          >
            <Edit2 className="w-3 h-3 text-amber-400" />
            <span>تعديل السعر</span>
          </button>
        )}

        {/* Sale / New Tag */}
        <div className="absolute top-3 right-3 flex flex-col items-end gap-1 z-10 pointer-events-none">
          {discountPercent && (
            <span className="bg-rose-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-md shadow-xs">
              خصم {discountPercent}%
            </span>
          )}
          {product.isNew && (
            <span className="bg-stone-900 text-white text-[10px] font-medium px-2 py-0.5 rounded-md shadow-xs">
              {getText('newBadge', 'جديد')}
            </span>
          )}
        </div>

        {/* Hover Quick Action Buttons */}
        <div className="absolute inset-0 bg-stone-900/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedProduct(product);
            }}
            className="p-2.5 rounded-full bg-white text-stone-800 hover:bg-rose-50 hover:text-rose-600 shadow-md transition-transform transform hover:scale-110 cursor-pointer flex items-center gap-1.5 text-xs font-bold px-3.5"
            title={getBtnText('viewProduct', 'عرض التفاصيل')}
          >
            <Eye className="w-4 h-4" />
            <span className="text-[11px]">{getBtnText('viewProduct', 'عرض التفاصيل')}</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 sm:p-4 flex-1 flex flex-col text-right">
        {/* Anti-slop: clean unboxed metadata with dot separator */}
        <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-stone-500 mb-1.5 truncate">
          <span className="truncate">
            {getCategoryName(category)}
          </span>
          {product.volumeOrSize && (
            <>
              <span aria-hidden="true">·</span>
              <span className="shrink-0">{product.volumeOrSize}</span>
            </>
          )}
        </div>

        <h3 className="font-bold text-xs sm:text-sm text-stone-900 leading-snug line-clamp-2 mb-2 group-hover:text-rose-600 transition-colors">
          {product.title}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1.5 mb-2.5 sm:mb-3 text-[11px] sm:text-xs">
          <div className="flex items-center text-amber-400">
            <Star className="w-3 sm:w-3.5 h-3 sm:h-3.5 fill-amber-400" />
          </div>
          <span className="font-bold text-stone-700">{product.rating}</span>
          <span className="text-stone-400 text-[10px] sm:text-[11px]">({product.reviewsCount})</span>
        </div>

        {/* Price & Action */}
        <div className="mt-auto pt-2.5 sm:pt-3 border-t border-rose-50 flex items-center justify-between gap-1.5 sm:gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline gap-1 sm:gap-1.5 flex-wrap">
              <span className="text-xs sm:text-sm md:text-base font-extrabold text-stone-900 leading-tight">
                {product.price} {currencyLabel}
              </span>
              {product.originalPrice && (
                <span className="text-[10px] sm:text-xs text-stone-400 line-through">
                  {product.originalPrice} {currencyLabel}
                </span>
              )}
            </div>
            {!product.inStock && (
              <span className="text-[10px] text-red-500 font-semibold block mt-0.5">
                {getText('outOfStock', 'نفدت الكمية')}
              </span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={!product.inStock || justAdded}
            className={`p-2 sm:p-2.5 rounded-full transition-all duration-300 cursor-pointer shrink-0 min-w-[34px] min-h-[34px] sm:min-w-[38px] sm:min-h-[38px] flex items-center justify-center ${
              justAdded
                ? 'bg-emerald-600 text-white'
                : product.inStock
                ? 'bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white'
                : 'bg-stone-100 text-stone-400 cursor-not-allowed'
            }`}
            title={product.inStock ? getBtnText('addToCart', 'أضف إلى السلة') : 'غير متوفر'}
          >
            {justAdded ? (
              <Check className="w-4 h-4 animate-in zoom-in" />
            ) : (
              <ShoppingBag className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
