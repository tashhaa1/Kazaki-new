import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  X,
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  Tag,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';
import { checkClickAllowed, checkRateLimit } from '../../utils/antiSpam';

interface CartDrawerProps {
  onOpenCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onOpenCheckout }) => {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    updateCartQuantity,
    removeFromCart,
    cartTotals,
    applyPromoCode,
    appliedPromo,
    removePromoCode,
    settings,
    getBtnText,
    getText,
    currencyLabel,
  } = useStore();

  const [couponInput, setCouponInput] = useState('');
  const [couponMsg, setCouponMsg] = useState<{ text: string; error: boolean } | null>(null);

  if (!isCartOpen) return null;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;

    // Anti-spam debounce
    if (!checkClickAllowed('apply_coupon_btn', 1000, false)) {
      setCouponMsg({
        text: 'يرجى الانتظار ثانية قبل إعادة تجربة الكوبون لمنع التكرار.',
        error: true,
      });
      return;
    }

    // Anti-spam rate limiting: max 5 coupon attempts per minute
    const rateCheck = checkRateLimit('promo_attempt', 5, 60000, 30000);
    if (!rateCheck.allowed) {
      setCouponMsg({
        text: rateCheck.message || 'تم تجاوز الحد الأقصى للمحاولات. يرجى الانتظار 30 ثانية.',
        error: true,
      });
      return;
    }

    const res = applyPromoCode(couponInput);
    setCouponMsg({ text: res.message, error: !res.success });
    if (res.success) {
      setCouponInput('');
    }
  };

  const freeShippingThreshold = typeof settings.freeShippingThreshold === 'number' && settings.freeShippingThreshold > 0
    ? settings.freeShippingThreshold
    : 0;
  const remainingForFreeShipping = freeShippingThreshold > 0 ? Math.max(0, freeShippingThreshold - cartTotals.subtotal) : 0;
  const freeShippingPercent = freeShippingThreshold > 0 ? Math.min(100, (cartTotals.subtotal / freeShippingThreshold) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-stone-900/60 backdrop-blur-xs flex justify-start">
      <div
        className="w-full sm:max-w-md bg-white h-full h-[100dvh] max-h-[100dvh] shadow-2xl flex flex-col justify-between animate-in slide-in-from-right text-right duration-300 border-l border-rose-100"
        dir="rtl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-rose-100 flex items-center justify-between bg-rose-50/40">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-rose-100 text-rose-600">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900">
                {getText('cartTitle', 'سلة المشتريات')}
              </h2>
              <p className="text-[11px] text-stone-500">
                {cart.length > 0
                  ? `${cart.length} منتجات مختارة`
                  : getText('emptyCartMsg', 'السلة فارغة')}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="p-2 rounded-full hover:bg-rose-100 text-stone-500 hover:text-stone-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Bar (Shown only if admin enabled free shipping threshold) */}
        {cart.length > 0 && freeShippingThreshold > 0 && (
          <div className="bg-rose-50 px-5 py-2.5 border-b border-rose-100">
            <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
              {remainingForFreeShipping > 0 ? (
                <span className="text-stone-700">
                  أضيفي بقيمة <strong className="text-rose-600">{remainingForFreeShipping} {currencyLabel}</strong> للشحن المجاني!
                </span>
              ) : (
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  تهانينا! لقد حصلتِ على شحن مجاني
                </span>
              )}
              <span className="text-rose-600 font-bold">{Math.round(freeShippingPercent)}%</span>
            </div>
            <div className="w-full h-1.5 bg-rose-200/60 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-rose-500 to-pink-500 transition-all duration-500 rounded-full"
                style={{ width: `${freeShippingPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
              <div className="w-20 h-20 rounded-full bg-rose-50 flex items-center justify-center text-rose-300">
                <ShoppingBag className="w-10 h-10" />
              </div>
              <h3 className="text-base font-bold text-stone-800">
                {getText('emptyCartMsg', 'سلة المشتريات فارغة')}
              </h3>
              <p className="text-xs text-stone-500 max-w-xs leading-relaxed">
                تصفحي تشكيلات ورد الليكو الفاخرة التي لا تذبل وأضيفي ما يعجبكِ للسلة!
              </p>
              <button
                onClick={() => setIsCartOpen(false)}
                className="px-6 py-2.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-md transition-colors cursor-pointer"
              >
                {getText('shop', 'تصفحي المنتجات')}
              </button>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.product.id}
                className="flex items-center gap-3.5 p-3 rounded-2xl bg-stone-50/70 border border-stone-100 hover:border-rose-200 transition-colors"
              >
                <img
                  src={item.product.image}
                  alt={item.product.title}
                  className="w-16 h-16 rounded-xl object-cover border border-rose-100 shrink-0 bg-white"
                />

                <div className="flex-1 min-w-0 text-right">
                  <h4 className="text-xs font-bold text-stone-900 truncate">
                    {item.product.title}
                  </h4>
                  <div className="text-xs font-extrabold text-rose-600 mt-0.5">
                    {item.product.price} {currencyLabel}
                  </div>

                  {/* Quantity control */}
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center border border-rose-200 rounded-full bg-white px-1 py-0.5">
                      <button
                        onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                        className="p-1 hover:text-rose-600 transition-colors cursor-pointer"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center text-xs font-bold text-stone-800">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                        className="p-1 hover:text-rose-600 transition-colors cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="text-stone-400 hover:text-red-500 p-1 transition-colors cursor-pointer"
                      title="حذف"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Drawer Footer & Checkout */}
        {cart.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-rose-100 bg-white space-y-4">
            {/* Promo Code Form */}
            <div>
              {appliedPromo ? (
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs">
                  <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                    <Tag className="w-3.5 h-3.5" />
                    <span>
                      كود الخصم ({appliedPromo.code}): خصم {appliedPromo.discountPercent}%
                    </span>
                  </div>
                  <button
                    onClick={removePromoCode}
                    className="text-stone-400 hover:text-red-600 font-semibold text-xs cursor-pointer"
                  >
                    إلغاء
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    placeholder="كود الخصم (مثال: KAZAKI20)"
                    className="flex-1 text-xs border border-rose-200 rounded-xl px-3 py-2 bg-rose-50/30 outline-hidden focus:border-rose-400"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                  >
                    تطبيق
                  </button>
                </form>
              )}
              {couponMsg && !appliedPromo && (
                <p className={`text-[11px] mt-1 ${couponMsg.error ? 'text-red-500' : 'text-emerald-600'}`}>
                  {couponMsg.text}
                </p>
              )}
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-1.5 text-xs text-stone-600 pt-1">
              <div className="flex justify-between">
                <span>{getText('subtotalLabel', 'مجموع المنتجات:')}</span>
                <span className="font-bold text-stone-800">{cartTotals.subtotal} {currencyLabel}</span>
              </div>
              {cartTotals.discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>{getText('discountAppliedLabel', 'الخصم المطبق:')}</span>
                  <span>- {cartTotals.discount} {currencyLabel}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>{getText('shippingLabel', 'رسوم التوصيل:')}</span>
                <span>
                  {cartTotals.shipping === 0 ? (
                    <strong className="text-emerald-600 font-bold">
                      {getText('freeShippingText', 'مجاني')}
                    </strong>
                  ) : (
                    `${cartTotals.shipping} ${currencyLabel}`
                  )}
                </span>
              </div>
              <div className="flex justify-between text-sm font-extrabold text-stone-900 pt-2 border-t border-rose-100">
                <span>{getText('totalAmountLabel', 'الإجمالي النهائي:')}</span>
                <span className="text-rose-600">{cartTotals.total} {currencyLabel}</span>
              </div>
            </div>

            {/* Checkout Action Button */}
            <button
              onClick={() => {
                if (!checkClickAllowed('open_checkout_btn', 1000)) return;
                setIsCartOpen(false);
                onOpenCheckout();
              }}
              className="w-full py-3.5 rounded-full bg-gradient-to-r from-rose-600 to-pink-500 hover:from-rose-500 hover:to-pink-600 text-white text-sm font-bold shadow-lg shadow-rose-300 hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{getBtnText('checkout', 'متابعة إتمام الطلب')}</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
