import React, { useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  Sparkles,
  Package,
  X,
  Eye,
  BellRing,
} from 'lucide-react';

export const CustomerLiveAlerts: React.FC = () => {
  const {
    currentUser,
    customerLiveAlert,
    clearCustomerLiveAlert,
    products,
    setSelectedProduct,
    setIsCustomerNotifsModalOpen,
    t,
  } = useStore();

  // Auto-dismiss alert after 9 seconds
  useEffect(() => {
    if (!customerLiveAlert) return;
    const timer = setTimeout(() => {
      clearCustomerLiveAlert();
    }, 9000);
    return () => clearTimeout(timer);
  }, [customerLiveAlert, clearCustomerLiveAlert]);

  // Do not show to admins (admins have ManagerLiveAlerts)
  if (currentUser?.role === 'admin') {
    return null;
  }

  if (!customerLiveAlert) {
    return null;
  }

  const isNewProduct =
    customerLiveAlert.type === 'new_product' || Boolean(customerLiveAlert.productId);
  const matchingProduct = customerLiveAlert.productId
    ? products.find((p) => p.id === customerLiveAlert.productId)
    : null;

  return (
    <div
      dir="rtl"
      className="fixed bottom-6 right-6 z-50 max-w-sm w-full space-y-3 pointer-events-auto animate-in slide-in-from-bottom-5 fade-in duration-300"
    >
      <div className="bg-white/95 text-stone-900 rounded-3xl p-5 shadow-2xl border-2 border-rose-400/90 backdrop-blur-xl relative overflow-hidden ring-4 ring-rose-500/15">
        {/* Soft decorative background glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-400/10 rounded-full blur-2xl pointer-events-none" />

        {/* Card Header */}
        <div className="flex items-center justify-between gap-2 pb-3 border-b border-rose-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-rose-600 to-pink-500 text-white flex items-center justify-center shadow-md shadow-rose-400/30">
              {isNewProduct ? (
                <Sparkles className="w-5 h-5 animate-pulse" />
              ) : (
                <BellRing className="w-5 h-5 animate-bounce" />
              )}
            </div>
            <div>
              <h4 className="font-extrabold text-xs sm:text-sm text-stone-900 flex items-center gap-1.5">
                <span>
                  {isNewProduct ? 'وصل حديثاً للمتجر!' : 'تحديث على طلبك'}
                </span>
                <span className="text-[10px] bg-rose-600 text-white px-2 py-0.5 rounded-full font-bold">
                  فوري
                </span>
              </h4>
              <span className="text-[11px] text-stone-400 font-mono">
                {customerLiveAlert.time}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={clearCustomerLiveAlert}
            className="p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
            aria-label="إغلاق"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Card Body */}
        <div className="py-3 flex items-start gap-3 text-xs">
          {(customerLiveAlert.productImage || matchingProduct?.image) && (
            <div className="w-14 h-14 rounded-2xl overflow-hidden border border-rose-200 shrink-0 bg-stone-50 shadow-xs">
              <img
                src={customerLiveAlert.productImage || matchingProduct?.image}
                alt={customerLiveAlert.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="flex-1 space-y-1 min-w-0">
            <strong className="text-stone-900 font-bold block text-xs truncate">
              {t(customerLiveAlert.title)}
            </strong>
            <p className="text-stone-600 text-[11px] leading-relaxed line-clamp-2">
              {t(customerLiveAlert.message)}
            </p>
            {matchingProduct && (
              <span className="text-xs font-extrabold text-rose-600 font-mono block">
                {Number(matchingProduct.price || 0).toLocaleString('ar-IQ')} د.ع
              </span>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2 border-t border-rose-100 flex items-center justify-between gap-2">
          {isNewProduct ? (
            <button
              type="button"
              onClick={() => {
                if (matchingProduct) {
                  setSelectedProduct(matchingProduct);
                } else if (customerLiveAlert.productId) {
                  const found = products.find((p) => p.id === customerLiveAlert.productId);
                  if (found) setSelectedProduct(found);
                }
                clearCustomerLiveAlert();
              }}
              className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-rose-600 to-pink-500 hover:from-rose-500 hover:to-pink-600 text-white font-bold text-xs shadow-md shadow-rose-500/25 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>معاينة المنتج والطلب الآن</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setIsCustomerNotifsModalOpen(true);
                clearCustomerLiveAlert();
              }}
              className="w-full py-2 px-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Package className="w-3.5 h-3.5" />
              <span>متابعة تفاصيل الإشعار</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
