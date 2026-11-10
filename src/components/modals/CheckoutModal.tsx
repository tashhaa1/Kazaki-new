import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  X,
  CreditCard,
  Truck,
  CheckCircle,
  PackageCheck,
  Copy,
  ShieldAlert,
} from 'lucide-react';
import { Order, PaymentMethod } from '../../types';
import { useAntiSpam } from '../../hooks/useAntiSpam';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderSuccess: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  onOrderSuccess,
}) => {
  const {
    cart,
    cartTotals,
    settings,
    currentUser,
    createOrder,
    getBtnText,
    getText,
    shippingRates,
    getCityRate,
    getShippingFeeForCity,
    currencyLabel,
  } = useStore();

  const [customerName, setCustomerName] = useState(currentUser?.name || '');
  const [customerEmail, setCustomerEmail] = useState(currentUser?.email || '');
  const [customerPhone, setCustomerPhone] = useState(currentUser?.phone || '');
  const [city, setCity] = useState(currentUser?.city || 'بغداد');
  const [address, setAddress] = useState(currentUser?.address || '');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const [copied, setCopied] = useState(false);

  React.useEffect(() => {
    if (currentUser && isOpen) {
      if (currentUser.name) setCustomerName(currentUser.name);
      if (currentUser.email) setCustomerEmail(currentUser.email);
      if (currentUser.phone) setCustomerPhone(currentUser.phone);
      if (currentUser.city) setCity(currentUser.city);
      if (currentUser.address) setAddress(currentUser.address);
    }
  }, [currentUser, isOpen]);

  const { guard, spamAlert } = useAntiSpam();

  if (!isOpen) return null;

  const selectedCityRate = getCityRate(city);
  const currentShippingFee = getShippingFeeForCity(city, cartTotals.subtotal);
  const currentFinalTotal = Math.max(0, cartTotals.subtotal - cartTotals.discount + currentShippingFee);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim() || !address.trim()) {
      alert('يرجى ملء جميع الحقول المطلوبة (الاسم، الجوال، العنوان)');
      return;
    }

    if (isSubmitting) return;

    await guard(
      'checkout_submit_order_btn',
      async () => {
        setIsSubmitting(true);
        try {
          await new Promise((resolve) => setTimeout(resolve, 800));
          const order = createOrder({
            customerName: customerName.trim(),
            customerEmail: customerEmail.trim() || '', // Email is strictly optional
            customerPhone: customerPhone.trim(),
            address: address.trim(),
            city,
            notes: notes.trim(),
            paymentMethod,
            shippingFee: currentShippingFee,
            finalAmount: currentFinalTotal,
          });

          setConfirmedOrder(order);
          onOrderSuccess(order);
        } finally {
          setIsSubmitting(false);
        }
      },
      {
        minIntervalMs: 2500, // Discard clicks within 2.5 seconds
        rateLimitType: 'order_submission',
        maxAttempts: 3,
        windowMs: 60000,
        lockDurationMs: 20000,
      }
    );
  };

  const handleCopyTracking = (trackNum: string) => {
    navigator.clipboard.writeText(trackNum);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex min-h-full items-center justify-center p-2.5 sm:p-4 md:p-6">
      <div
        className="my-auto relative bg-white rounded-2xl sm:rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-rose-100 animate-in fade-in zoom-in-95 duration-200 text-right"
        dir="rtl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-rose-100 flex items-center justify-between bg-rose-50/40">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-rose-100 text-rose-600">
              <PackageCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900">
                {confirmedOrder
                  ? getText('orderSuccessTitle', 'تم تأكيد الطلب بنجاح')
                  : getText('checkoutTitle', 'إتمام وتأكيد الطلب')}
              </h2>
              <p className="text-[11px] text-stone-500">
                {confirmedOrder
                  ? 'شكراً لثقتكم بمتجر KAZAKI.IQ'
                  : 'إدخال بيانات التوصيل والدفع'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-rose-100 text-stone-500 hover:text-stone-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        {confirmedOrder ? (
          <div className="p-6 text-center space-y-6">
            <div className="w-20 h-20 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center animate-in zoom-in">
              <CheckCircle className="w-10 h-10" />
            </div>

            <div>
              <h3 className="text-xl font-extrabold text-stone-900 mb-1">
                تهانينا، تم تأكيد واستلام الطلب بنجاح!
              </h3>
              <p className="text-xs text-stone-500">
                سيتواصل مندوب التوصيل قريباً، مع إمكانية تتبع مسار الشحنة في أي وقت.
              </p>
            </div>

            {/* Order Details Card */}
            <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-100 space-y-3 max-w-md mx-auto text-right">
              <div className="flex justify-between items-center text-xs pb-2 border-b border-rose-100">
                <span className="text-stone-500">رقم الطلب:</span>
                <span className="font-bold text-stone-900">{confirmedOrder.id}</span>
              </div>

              <div className="flex justify-between items-center text-xs pb-2 border-b border-rose-100">
                <span className="text-stone-500">رقم التتبع السريع:</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-rose-700">
                    {confirmedOrder.trackingNumber}
                  </span>
                  <button
                    onClick={() => handleCopyTracking(confirmedOrder.trackingNumber || '')}
                    className="p-1 text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
                    title="نسخ رقم التتبع"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  {copied && <span className="text-[10px] text-emerald-600 font-bold">تم النسخ!</span>}
                </div>
              </div>

              <div className="flex justify-between items-center text-xs pb-2 border-b border-rose-100">
                <span className="text-stone-500">طريقة الدفع:</span>
                <span className="font-bold text-stone-800">
                  {confirmedOrder.paymentMethod === 'cod'
                    ? 'الدفع عند الاستلام'
                    : 'Mastercard – مصرف الرافدين'}
                </span>
              </div>

              <div className="flex justify-between items-center text-xs pb-2 border-b border-rose-100">
                <span className="text-stone-500">مدينة التوصيل:</span>
                <span className="font-bold text-stone-800">{confirmedOrder.city} - {confirmedOrder.address}</span>
              </div>

              <div className="flex justify-between items-center text-sm font-extrabold text-stone-900 pt-1">
                <span>المبلغ الإجمالي المدفوع:</span>
                <span className="text-rose-600">{confirmedOrder.finalAmount} {currencyLabel}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
              >
                متابعة التسوق بالمتجر
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Anti-Spam protection notification */}
            {spamAlert && (
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 text-xs font-bold flex items-center gap-2.5 animate-in fade-in slide-in-from-top-2">
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{spamAlert}</span>
              </div>
            )}

            {/* Customer Details */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-rose-800 uppercase tracking-wider">
                {getText('deliveryInfoTitle', 'بيانات المستلم وعنوان التوصيل')}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    الاسم الكامل <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="مثال: سارة العتيبي"
                    className="w-full text-xs border border-rose-200 rounded-xl px-3.5 py-2.5 bg-rose-50/20 focus:bg-white outline-hidden focus:border-rose-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    رقم الجوال <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    dir="ltr"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="+964 770 123 4567"
                    className="w-full text-xs border border-rose-200 rounded-xl px-3.5 py-2.5 bg-rose-50/20 focus:bg-white outline-hidden focus:border-rose-400 text-right"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-stone-700 flex items-center gap-1.5">
                      <span>البريد الإلكتروني</span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        اختياري
                      </span>
                    </label>
                  </div>
                  <input
                    type="text"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="name@example.com (اختياري - يمكنك تركه فارغاً)"
                    className="w-full text-xs border border-rose-200 rounded-xl px-3.5 py-2.5 bg-rose-50/20 focus:bg-white outline-hidden focus:border-rose-400"
                  />
                  <p className="text-[10px] text-stone-400 mt-1">
                    إدخال البريد اختياري تماماً، وسيتم التواصل معك ومتابعة الشحنة عبر رقم الهاتف والواتساب.
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-stone-700">
                      محافظة التوصيل <span className="text-rose-600">*</span>
                    </label>
                    <span className="text-[10px] text-rose-600 font-bold flex items-center gap-1">
                      <Truck className="w-3 h-3" />
                      <span>{currentShippingFee === 0 ? 'توصيل مجاني' : `${currentShippingFee.toLocaleString()} ${currencyLabel}`}</span>
                    </span>
                  </div>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full text-xs font-semibold border border-rose-200 rounded-xl px-3.5 py-2.5 bg-rose-50/20 focus:bg-white outline-hidden focus:border-rose-400 cursor-pointer"
                  >
                    {shippingRates.map((rate) => {
                      const cityName = rate.name;
                      const priceLabel = !rate.enabled
                        ? 'التوصيل متوقف مؤقتاً'
                        : currentShippingFee === 0 && (settings.freeShippingThreshold || 0) > 0 && cartTotals.subtotal >= (settings.freeShippingThreshold || 0)
                        ? 'مجاني'
                        : `+${rate.price.toLocaleString()} ${currencyLabel}`;
                      return (
                        <option key={rate.id} value={rate.name} disabled={!rate.enabled}>
                          {cityName} ({priceLabel})
                        </option>
                      );
                    })}
                  </select>
                  {selectedCityRate && (
                    <div className="mt-1.5 flex items-center justify-between text-[11px] text-stone-500 bg-rose-50/50 p-2 rounded-lg border border-rose-100">
                      <span className="flex items-center gap-1">
                        <span>المدة التقديرية:</span>
                        <strong className="text-stone-800">
                          {selectedCityRate.estimatedDelivery}
                        </strong>
                      </span>
                      <span className="text-rose-700 font-bold">
                        {currentShippingFee === 0 ? 'شحن مجاني' : `${currentShippingFee.toLocaleString()} ${currencyLabel}`}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  العنوان بالتفصيل (المنطقة، الشارع، أقرب نقطة دالة) <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="مثال: المنصور، شارع 14 رمضان، قرب مطعم الصنوبر"
                  className="w-full text-xs border border-rose-200 rounded-xl px-3.5 py-2.5 bg-rose-50/20 focus:bg-white outline-hidden focus:border-rose-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  ملاحظات لمندوب التوصيل (اختياري)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="مثال: يرجى الاتصال قبل الوصول بنصف ساعة"
                  className="w-full text-xs border border-rose-200 rounded-xl px-3.5 py-2.5 bg-rose-50/20 focus:bg-white outline-hidden focus:border-rose-400"
                />
              </div>
            </div>

            {/* Payment Method Selection - Exclusively COD and Mastercard Rafidain */}
            <div className="space-y-3 pt-2 border-t border-rose-100">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-rose-800 uppercase tracking-wider">
                  {getText('paymentMethodTitle', 'طريقة الدفع المعتمدة')}
                </h3>
                <span className="text-[11px] text-stone-500">
                  (محصورة بالدفع عند الاستلام وماستركارد الرافدين)
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 1. Cash on Delivery */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('cod')}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center gap-3.5 text-right ${
                    paymentMethod === 'cod'
                      ? 'border-rose-600 bg-rose-50/70 text-rose-950 font-bold shadow-xs ring-2 ring-rose-200'
                      : 'border-stone-200 hover:border-rose-200 text-stone-700 bg-white'
                  }`}
                >
                  <div className={`p-2.5 rounded-xl ${paymentMethod === 'cod' ? 'bg-rose-600 text-white' : 'bg-stone-100 text-stone-600'}`}>
                    <Truck className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <span className="text-sm font-bold block">
                      الدفع عند الاستلام
                    </span>
                    <span className="text-[11px] text-stone-500 font-normal">
                      ادفعي نقداً لمندوب التوصيل عند استلام الطلب ومعاينته
                    </span>
                  </div>
                </button>

                {/* 2. Mastercard Rafidain */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('mastercard_rafidain')}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center gap-3.5 text-right ${
                    paymentMethod === 'mastercard_rafidain'
                      ? 'border-rose-600 bg-rose-50/70 text-rose-950 font-bold shadow-xs ring-2 ring-rose-200'
                      : 'border-stone-200 hover:border-rose-200 text-stone-700 bg-white'
                  }`}
                >
                  <div className={`p-2.5 rounded-xl ${paymentMethod === 'mastercard_rafidain' ? 'bg-rose-600 text-white' : 'bg-stone-100 text-stone-600'}`}>
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <span className="text-sm font-bold block">
                      Mastercard – مصرف الرافدين
                    </span>
                    <span className="text-[11px] text-stone-500 font-normal">
                      الدفع الإلكتروني المباشر ببطاقة ماستركارد مصرف الرافدين
                    </span>
                  </div>
                </button>
              </div>
            </div>

            {/* Detailed Total Breakdown and Submit */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-rose-50/70 to-pink-50/40 border border-rose-100 space-y-3">
              <div className="space-y-1.5 text-xs text-stone-600 border-b border-rose-100 pb-3">
                <div className="flex justify-between items-center">
                  <span>{getText('subtotalLabel', 'مجموع المنتجات:')}</span>
                  <span className="font-bold text-stone-800">{cartTotals.subtotal.toLocaleString()} {currencyLabel}</span>
                </div>

                {cartTotals.discount > 0 && (
                  <div className="flex justify-between items-center text-emerald-600 font-bold">
                    <span>{getText('discountAppliedLabel', 'الخصم المطبق:')}</span>
                    <span>- {cartTotals.discount.toLocaleString()} {currencyLabel}</span>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-rose-500" />
                    <span>{getText('shippingLabel', 'أجرة التوصيل إلى')} <strong>{selectedCityRate?.name || city}</strong>:</span>
                  </span>
                  <span className="font-bold text-stone-900">
                    {currentShippingFee === 0 ? (
                      <span className="text-emerald-600 font-bold">توصيل مجاني</span>
                    ) : (
                      `${currentShippingFee.toLocaleString()} ${currencyLabel}`
                    )}
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
                <div className="w-full sm:w-auto flex items-center justify-between sm:block">
                  <span className="text-xs text-stone-500 block">
                    {getText('totalAmountLabel', 'المبلغ الإجمالي المطلوب:')}
                  </span>
                  <span className="text-xl font-black text-rose-700">
                    {currentFinalTotal.toLocaleString()} {currencyLabel}
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || cart.length === 0}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-gradient-to-r from-rose-600 to-pink-500 hover:from-rose-500 hover:to-pink-600 text-white font-bold text-xs shadow-lg shadow-rose-300 hover:shadow-xl transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting
                    ? 'جاري تأكيد الطلب...'
                    : getBtnText('checkout', 'تأكيد ودفع الطلب')}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
