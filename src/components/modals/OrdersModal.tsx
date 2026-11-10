import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  X,
  Package,
  CheckCircle,
  Clock,
  Truck,
  Copy,
  Bell,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { OrderStatus } from '../../types';

interface OrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OrdersModal: React.FC<OrdersModalProps> = ({ isOpen, onClose }) => {
  const { orders, currentUser, getBtnText, myOrderIds, currencyLabel, t } = useStore();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedTimelineId, setExpandedTimelineId] = useState<string | null>(null);
  const [orderQuery, setOrderQuery] = useState('');

  if (!isOpen) return null;

  // Filter orders for current customer
  const trimmedQuery = orderQuery.trim().toLowerCase();
  const customerOrders = orders.filter((o) => {
    // 1. Admin can see and search all customer orders
    if (currentUser?.role === 'admin') {
      if (!trimmedQuery) return true;
      return (
        o.id.toLowerCase().includes(trimmedQuery) ||
        (o.trackingNumber && o.trackingNumber.toLowerCase().includes(trimmedQuery)) ||
        o.customerPhone.includes(trimmedQuery) ||
        (o.customerName && o.customerName.toLowerCase().includes(trimmedQuery))
      );
    }

    // 2. Strict Customer Ownership: order MUST belong to this customer
    const isOwner =
      (myOrderIds && myOrderIds.includes(o.id)) ||
      (currentUser && (
        (o.customerEmail && currentUser.email && o.customerEmail.toLowerCase().trim() === currentUser.email.toLowerCase().trim()) ||
        (o.customerPhone && currentUser.phone && o.customerPhone.replace(/[^0-9]/g, '') === currentUser.phone.replace(/[^0-9]/g, ''))
      ));

    // If the order does not belong to this customer, strictly hide and block it
    if (!isOwner) {
      return false;
    }

    // Customer can search within their own orders only
    if (trimmedQuery) {
      return (
        o.id.toLowerCase().includes(trimmedQuery) ||
        (o.trackingNumber && o.trackingNumber.toLowerCase().includes(trimmedQuery))
      );
    }

    return true;
  });

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return {
          label: 'قيد الانتظار',
          color: 'bg-amber-100 text-amber-800 border-amber-200',
        };
      case 'processing':
        return {
          label: 'جاري التجهيز بالمستودع',
          color: 'bg-rose-100 text-rose-800 border-rose-200',
        };
      case 'shipped':
        return {
          label: 'تم الشحن مع المندوب',
          color: 'bg-blue-100 text-blue-800 border-blue-200',
        };
      case 'delivered':
        return {
          label: 'تم التوصيل بنجاح',
          color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        };
      case 'cancelled':
        return {
          label: 'طلب ملغي',
          color: 'bg-red-100 text-red-800 border-red-200',
        };
      case 'returned':
        return {
          label: 'شحنة راجعة',
          color: 'bg-purple-100 text-purple-800 border-purple-200',
        };
      default:
        return {
          label: 'قيد المعالجة',
          color: 'bg-stone-100 text-stone-800 border-stone-200',
        };
    }
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(code);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex min-h-full items-center justify-center p-2.5 sm:p-4 md:p-6">
      <div
        className="my-auto relative bg-white rounded-2xl sm:rounded-3xl max-w-lg md:max-w-3xl w-full overflow-hidden shadow-2xl border border-rose-100 animate-in fade-in zoom-in-95 duration-200 text-right font-cairo"
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
      >
        {/* Header */}
        <div className="p-5 border-b border-rose-100 flex items-center justify-between bg-rose-50/40">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-rose-100 text-rose-600">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900">
                {getBtnText('trackOrder', 'سجل وتتبع طلبات المشتريات')}
              </h2>
              <p className="text-[11px] text-stone-500">
                تتبعي مسار شحناتكِ وإشعارات التوصيل لحظة بلحظة في KAZAKI.IQ
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-rose-100 text-stone-500 hover:text-stone-800 transition-colors cursor-pointer"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6">
          {/* Order lookup input if not logged in or searching */}
          {!currentUser && (
            <div className="bg-rose-50/50 p-4 rounded-2xl border border-rose-100 space-y-2">
              <label className="block text-xs font-bold text-stone-700">
                تتبع طلب عبر رقم الطلب أو رقم الهاتف:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={orderQuery}
                  onChange={(e) => setOrderQuery(e.target.value)}
                  placeholder="مثال: ORD-1234 أو 07701234567"
                  className="flex-1 px-3.5 py-2.5 text-xs rounded-xl border border-stone-200 focus:border-rose-400 focus:bg-white outline-none"
                />
                {orderQuery && (
                  <button
                    type="button"
                    onClick={() => setOrderQuery('')}
                    className="px-3 py-2 text-xs text-stone-500 hover:text-stone-800 bg-stone-100 rounded-xl cursor-pointer"
                  >
                    مسح
                  </button>
                )}
              </div>
            </div>
          )}

          {customerOrders.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <div className="w-16 h-16 mx-auto rounded-full bg-rose-50 flex items-center justify-center text-rose-300">
                <Package className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-stone-800">
                {!currentUser && !orderQuery
                  ? 'يرجى إدخال رقم الطلب أو رقم الهاتف أعلاه لتتبع طلبك'
                  : 'لا توجد طلبات مطابقة'}
              </h3>
              <p className="text-xs text-stone-500">
                {!currentUser && !orderQuery
                  ? 'يمكنك تتبع أي شحنة فوراً باستخدام الرقم التعريفي للطلب أو تسجيل الدخول لحسابك.'
                  : 'تأكد من كتابة رقم الطلب أو رقم الهاتف بشكل صحيح.'}
              </p>
            </div>
          ) : (
            customerOrders.map((order) => {
              const statusInfo = getStatusBadge(order.status);
              const stepIndex =
                order.status === 'pending'
                  ? 0
                  : order.status === 'processing'
                  ? 1
                  : order.status === 'shipped'
                  ? 2
                  : order.status === 'delivered'
                  ? 3
                  : -1;

              const isTimelineExpanded = expandedTimelineId === order.id;

              return (
                <div
                  key={order.id}
                  className="rounded-3xl border border-rose-100 bg-white p-5 shadow-2xs hover:shadow-md transition-shadow space-y-4 text-right"
                >
                  {/* Top Bar of Order */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-rose-50 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-stone-900 font-mono">{order.id}</span>
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${statusInfo.color}`}
                        >
                          {statusInfo.label}
                        </span>
                      </div>
                      <span className="text-[11px] text-stone-400 mt-0.5 block">
                        تاريخ الطلب: {new Date(order.createdAt).toLocaleDateString('ar-IQ')}
                      </span>
                    </div>

                    <div className="text-left">
                      <span className="text-xs text-stone-500 block">
                        الإجمالي:
                      </span>
                      <span className="text-base font-extrabold text-rose-600 font-mono">
                        {order.finalAmount.toLocaleString('en-US')} {currencyLabel}
                      </span>
                    </div>
                  </div>

                  {/* Customer Visual Tracking Stepper */}
                  {order.status !== 'cancelled' ? (
                    <div className="py-2 bg-stone-50/50 p-3.5 rounded-2xl border border-stone-100 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-stone-700 flex items-center gap-1.5">
                          <Truck className="w-3.5 h-3.5 text-rose-600" />
                          <span>مسار الشحنة المباشر:</span>
                        </span>
                        <span className="text-[11px] font-bold text-rose-600">
                          {statusInfo.label}
                        </span>
                      </div>

                      <div className="grid grid-cols-4 gap-1.5 text-center">
                        {[
                          { label: 'تم الطلب', icon: Clock },
                          { label: 'قيد المعالجة', icon: Package },
                          { label: 'تم الشحن', icon: Truck },
                          { label: 'تم التوصيل', icon: CheckCircle },
                        ].map((st, idx) => {
                          const isDone = stepIndex >= idx;
                          const isCurrent = stepIndex === idx;
                          const IconComp = st.icon;
                          return (
                            <div
                              key={idx}
                              className={`p-2 rounded-xl text-center text-xs border transition-all flex flex-col items-center justify-center gap-1 ${
                                isCurrent
                                  ? 'bg-rose-50 border-rose-300 ring-2 ring-rose-200'
                                  : isDone
                                  ? 'bg-emerald-50/70 border-emerald-200 text-emerald-800'
                                  : 'bg-white border-stone-200 text-stone-400'
                              }`}
                            >
                              <IconComp className="w-4 h-4" />
                              <span
                                className={`text-[11px] font-bold block ${
                                  isCurrent ? 'text-rose-700' : isDone ? 'text-emerald-800' : 'text-stone-400'
                                }`}
                              >
                                {st.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs font-bold">
                      تم إلغاء هذا الطلب من قبل الإدارة.
                    </div>
                  )}

                  {/* Tracking Number & Carrier */}
                  {order.trackingNumber && (
                    <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-2xl bg-rose-50/40 border border-rose-100 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-stone-600">
                          {order.shippingCarrier ? `${order.shippingCarrier} | ` : ''}
                          رقم التتبع: 
                        </span>
                        <strong className="font-mono text-rose-700 font-bold bg-white px-2 py-0.5 rounded-md border border-rose-200" dir="ltr">
                          {order.trackingNumber}
                        </strong>
                      </div>
                      <button
                        onClick={() => handleCopy(order.trackingNumber || '')}
                        className="text-stone-500 hover:text-stone-800 px-2.5 py-1 rounded-lg bg-white border border-stone-200 flex items-center gap-1 cursor-pointer text-[11px]"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>
                          {copiedId === order.trackingNumber ? 'تم النسخ!' : 'نسخ رقم التتبع'}
                        </span>
                      </button>
                    </div>
                  )}

                  {/* Customer Status Notifications */}
                  {order.notifications && order.notifications.filter((n) => n.target !== 'admin').length > 0 && (
                    <div className="space-y-2">
                      <span className="text-[11px] font-bold text-stone-600 flex items-center gap-1.5">
                        <Bell className="w-3.5 h-3.5 text-rose-500" />
                        <span>إشعارات وتحديثات حالة هذا الطلب:</span>
                      </span>
                      {order.notifications
                        .filter((n) => n.target !== 'admin')
                        .map((notif, idx) => (
                          <div
                            key={notif.id || idx}
                            className="p-3 rounded-2xl bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200 text-xs space-y-1"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-rose-900 flex items-center gap-1.5">
                                <Bell className="w-3.5 h-3.5 text-rose-600" />
                                <span>{t(notif.title)}</span>
                              </span>
                              <span className="text-[10px] text-stone-400 font-mono">
                                {new Date(notif.timestamp).toLocaleDateString('ar-IQ')}
                              </span>
                            </div>
                            <p className="text-stone-700 leading-relaxed">
                              {t(notif.message)}
                            </p>
                          </div>
                        ))}
                    </div>
                  )}

                  {/* Toggle Timeline History */}
                  {order.statusHistory && order.statusHistory.length > 0 && (
                    <div>
                      <button
                        type="button"
                        onClick={() => setExpandedTimelineId(isTimelineExpanded ? null : order.id)}
                        className="text-xs font-bold text-stone-600 hover:text-rose-600 flex items-center gap-1 cursor-pointer"
                      >
                        <span>
                          سجل تحديثات الشحنة بالتفصيل ({order.statusHistory.length})
                        </span>
                        {isTimelineExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>

                      {isTimelineExpanded && (
                        <div className="mt-2 space-y-2 pr-2 border-r-2 border-rose-200">
                          {order.statusHistory.map((h, i) => (
                            <div key={h.id || i} className="text-xs bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                              <div className="flex items-center justify-between text-[11px] font-bold text-stone-800">
                                <span>
                                  {h.status === 'pending'
                                    ? 'استلام الطلب'
                                    : h.status === 'processing'
                                    ? 'قيد المعالجة'
                                    : h.status === 'shipped'
                                    ? 'تم الشحن'
                                    : h.status === 'delivered'
                                    ? 'تم التوصيل'
                                    : 'ملغي'}
                                </span>
                                <span className="text-[10px] text-stone-400 font-mono">
                                  {new Date(h.timestamp).toLocaleDateString('ar-IQ')} - {new Date(h.timestamp).toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              {h.note && <p className="text-stone-600 text-[11px] mt-1">{t(h.note)}</p>}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Items in order */}
                  <div className="space-y-2 pt-1">
                    <h4 className="text-xs font-bold text-stone-700">
                      المنتجات المطلوبة:
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {order.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2.5 p-2 rounded-xl bg-stone-50/60 border border-stone-100 text-xs"
                        >
                          <img
                            src={item.product.image}
                            alt={item.product.title}
                            className="w-10 h-10 rounded-lg object-cover bg-white"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-stone-900 truncate">
                              {item.product.title}
                            </p>
                            <p className="text-[11px] text-stone-500">
                              {item.quantity} × {item.product.price.toLocaleString('en-US')} {currencyLabel}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Delivery destination */}
                  <div className="text-[11px] text-stone-500 pt-2 border-t border-rose-50 flex items-center justify-between">
                    <span>
                      عنوان التسليم: {t(order.city)} - {t(order.address)}
                    </span>
                    <span>
                      المستلم: {order.customerName} ({order.customerPhone})
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
