import React, { useState } from 'react';
import { useStore, isCurrentSessionAdmin } from '../../context/StoreContext';
import {
  X,
  Bell,
  Package,
  Truck,
  CheckCircle2,
  Copy,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Eye,
  ShoppingBag,
  ExternalLink,
} from 'lucide-react';
import { OrderStatus } from '../../types';

interface CustomerNotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenOrders?: () => void;
}

export const CustomerNotificationsModal: React.FC<CustomerNotificationsModalProps> = ({
  isOpen,
  onClose,
  onOpenOrders,
}) => {
  const {
    currentUser,
    activeView,
    customerNotifications,
    adminNotifications,
    markNotificationAsRead,
    clearNotifications,
    setActiveView,
    myOrderIds,
    products,
    setSelectedProduct,
    setTargetOrderFilter,
    t,
  } = useStore();

  const [copiedTracking, setCopiedTracking] = useState<string | null>(null);
  const [adminTab, setAdminTab] = useState<'all' | 'orders' | 'messages'>('all');

  if (!isOpen) return null;

  const isAdmin = currentUser?.role === 'admin' || isCurrentSessionAdmin(currentUser, activeView);

  const orderNotifs = adminNotifications.filter(
    (n) => n.orderId || n.title?.includes('طلب') || n.title?.includes('Order')
  );
  const messageNotifs = adminNotifications.filter(
    (n) => !n.orderId && (n.title?.includes('رسالة') || n.title?.includes('استفسار') || n.title?.includes('شات') || n.title?.includes('Message'))
  );

  const displayedAdminNotifs =
    adminTab === 'orders'
      ? orderNotifs
      : adminTab === 'messages'
      ? messageNotifs
      : adminNotifications;

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedTracking(code);
    setTimeout(() => setCopiedTracking(null), 2000);
  };

  const getStatusBadge = (status?: OrderStatus) => {
    switch (status) {
      case 'pending':
        return {
          label: 'قيد الانتظار',
          color: 'bg-amber-100 text-amber-800 border-amber-200',
        };
      case 'processing':
        return {
          label: 'جاري التجهيز والتغليف',
          color: 'bg-rose-100 text-rose-800 border-rose-200',
        };
      case 'shipped':
        return {
          label: 'انطلقت مع مندوب التوصيل',
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
      default:
        return {
          label: 'تحديث حالة',
          color: 'bg-stone-100 text-stone-700 border-stone-200',
        };
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        className="relative bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-rose-100 animate-in fade-in zoom-in-95 duration-200 text-right font-cairo"
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-rose-100 flex items-center justify-between bg-gradient-to-r from-rose-50/90 via-pink-50/50 to-white">
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-2xl ${
                isAdmin
                  ? 'bg-stone-900 text-white shadow-md'
                  : 'bg-rose-500 text-white shadow-md shadow-rose-200'
              }`}
            >
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-stone-900">
                  {isAdmin
                    ? 'مركز تنبيهات وإشعارات الإدارة'
                    : 'إشعارات وتحديثات طلباتي'}
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-rose-100 text-rose-800">
                  {isAdmin
                    ? 'الإدارة العامة'
                    : 'خاص بحالة طلباتكِ فقط'}
                </span>
              </div>
              <p className="text-[11px] text-stone-500 mt-0.5">
                {isAdmin
                  ? 'متابعة الطلبات الجديدة، استفسارات الدعم، وحركة المتجر'
                  : 'تتبعي مسار شحناتكِ وإشعارات التوصيل لحظة بلحظة'}
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

        {/* Content Body */}
        <div className="p-5 max-h-[70vh] overflow-y-auto space-y-4">
          {/* If Manager */}
          {isAdmin ? (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-amber-900 font-bold">
                  <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    أنت مسجّل دخولك بصلاحية المدير العام للمتجر
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    setActiveView('admin');
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs cursor-pointer shadow-xs"
                >
                  فتح لوحة التحكم
                </button>
              </div>

              {/* Admin Filter Tabs & Clear Actions */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-rose-100 pb-2">
                <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setAdminTab('all')}
                    className={`py-1 px-2.5 rounded-lg transition-colors cursor-pointer ${
                      adminTab === 'all' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-500 hover:text-stone-800'
                    }`}
                  >
                    الكل ({adminNotifications.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdminTab('orders')}
                    className={`py-1 px-2.5 rounded-lg transition-colors cursor-pointer ${
                      adminTab === 'orders' ? 'bg-rose-600 text-white shadow-2xs' : 'text-stone-500 hover:text-stone-800'
                    }`}
                  >
                    الطلبات الجديدة ({orderNotifs.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdminTab('messages')}
                    className={`py-1 px-2.5 rounded-lg transition-colors cursor-pointer ${
                      adminTab === 'messages' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-500 hover:text-stone-800'
                    }`}
                  >
                    الرسائل ({messageNotifs.length})
                  </button>
                </div>

                {adminNotifications.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('هل تود مسح جميع تنبيهات الإدارة؟')) {
                        clearNotifications();
                      }
                    }}
                    className="text-[11px] font-bold text-stone-400 hover:text-rose-600 transition-colors cursor-pointer"
                  >
                    مسح السجل
                  </button>
                )}
              </div>

              {displayedAdminNotifs.length === 0 ? (
                <div className="text-center py-10 space-y-2">
                  <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-400 mx-auto flex items-center justify-center">
                    <Bell className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-stone-700 text-sm">
                    {adminTab === 'orders'
                      ? 'لا توجد طلبات جديدة معلقة حالياً'
                      : 'لا توجد تنبيهات إدارية جديدة حالياً'}
                  </h4>
                  <p className="text-xs text-stone-400">
                    ستصلك التنبيهات الفورية هنا فور ورود أي طلب جديد.
                  </p>
                </div>
              ) : (
                displayedAdminNotifs.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-4 rounded-2xl border text-xs space-y-2 transition-all ${
                      notif.read
                        ? 'bg-stone-50/60 border-stone-200 text-stone-700'
                        : 'bg-gradient-to-r from-rose-50/90 via-pink-50/40 to-white border-rose-300 text-stone-900 shadow-sm ring-1 ring-rose-400/20'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-rose-900 flex items-center gap-1.5">
                        <span className={`p-1 rounded-lg ${notif.read ? 'bg-stone-200 text-stone-600' : 'bg-rose-600 text-white'}`}>
                          {notif.orderId ? <ShoppingBag className="w-3.5 h-3.5" /> : <Bell className="w-3.5 h-3.5" />}
                        </span>
                        <span className="text-sm font-extrabold">{t(notif.title)}</span>
                        {!notif.read && (
                          <span className="px-1.5 py-0.2 rounded-full bg-rose-600 text-white text-[10px] font-bold">
                            جديد
                          </span>
                        )}
                      </span>
                      <span className="text-[10px] text-stone-400 font-mono">
                        {new Date(notif.timestamp).toLocaleTimeString('ar-IQ', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <p className="text-stone-700 leading-relaxed font-medium">{t(notif.message)}</p>

                    <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-rose-100/60">
                      <div className="flex items-center gap-2 text-[11px] text-stone-500">
                        {notif.customerName && <span>الزبون: <strong>{notif.customerName}</strong></span>}
                        {notif.customerPhone && <span className="font-mono">({notif.customerPhone})</span>}
                      </div>

                      <div className="flex items-center gap-2">
                        {notif.orderId && (
                          <button
                            type="button"
                            onClick={() => {
                              onClose();
                              setActiveView('admin');
                              if (setTargetOrderFilter) {
                                setTargetOrderFilter(notif.orderId || null);
                              }
                            }}
                            className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs cursor-pointer shadow-xs flex items-center gap-1"
                          >
                            <span>معاينة وتجهيز الطلب</span>
                            <ArrowRight className="w-3 h-3 rotate-180" />
                          </button>
                        )}

                        {!notif.read && (
                          <button
                            type="button"
                            onClick={() => markNotificationAsRead(notif.id)}
                            className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-600 font-bold text-[11px] cursor-pointer"
                          >
                            تحديد كمقروء
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            /* Customer View */
            <div className="space-y-4">
              {/* Informative Security Banner */}
              <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200/80 text-[11px] text-stone-600 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>
                  نظام الإشعارات المخصص: تظهر هنا حصرياً تحديثات شحناتكِ وطلباتكِ من ورد الليكو.
                </span>
              </div>

              {customerNotifications.length === 0 ? (
                <div className="text-center py-10 space-y-3">
                  <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-300 mx-auto flex items-center justify-center">
                    <Package className="w-7 h-7" />
                  </div>
                  <h4 className="font-bold text-stone-800 text-sm">
                    لا توجد إشعارات لطلباتكِ حالياً
                  </h4>
                  <p className="text-xs text-stone-500 max-w-sm mx-auto leading-relaxed">
                    عند إتمام أي طلب في المتجر، ستصلكِ هنا تنبيهات فورية بحالة التجهيز والشحن مع مندوب التوصيل لحظة بلحظة.
                  </p>
                  {myOrderIds.length > 0 && onOpenOrders && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenOrders();
                      }}
                      className="px-5 py-2 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-colors cursor-pointer shadow-xs inline-flex items-center gap-1.5"
                    >
                      <Package className="w-3.5 h-3.5" />
                      <span>
                        عرض سجل طلباتي السابقة ({myOrderIds.length})
                      </span>
                    </button>
                  )}
                </div>
              ) : (
                customerNotifications.map((notif) => {
                  const isNewProduct = notif.type === 'new_product' || Boolean(notif.productId && !notif.orderId);
                  const matchingProduct = notif.productId ? products.find((p) => p.id === notif.productId) : null;
                  const statusInfo = getStatusBadge(notif.status);

                  if (isNewProduct) {
                    return (
                      <div
                        key={notif.id}
                        className="p-4 rounded-3xl border-2 border-rose-200/90 bg-gradient-to-br from-rose-50/40 via-pink-50/20 to-white shadow-xs hover:shadow-md transition-shadow space-y-3"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-rose-100 pb-2.5">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full border bg-rose-100 text-rose-800 border-rose-200 flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-rose-600" />
                              <span>وصل حديثاً</span>
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono">
                              متوفر الآن
                            </span>
                          </div>
                          <span className="text-[10px] text-stone-400 font-mono">
                            {new Date(notif.timestamp).toLocaleDateString('ar-IQ')} -{' '}
                            {new Date(notif.timestamp).toLocaleTimeString('ar-IQ', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>

                        <div className="flex items-start gap-3">
                          {(notif.productImage || matchingProduct?.image) && (
                            <div className="w-16 h-16 rounded-2xl overflow-hidden border border-rose-200 shrink-0 bg-white shadow-xs">
                              <img
                                src={notif.productImage || matchingProduct?.image}
                                alt={notif.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}

                          <div className="flex-1 space-y-1 min-w-0">
                            <h4 className="font-bold text-stone-900 text-xs sm:text-sm flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                              <span className="truncate">{t(notif.title)}</span>
                            </h4>
                            <p className="text-xs text-stone-600 leading-relaxed line-clamp-2">{t(notif.message)}</p>
                            {matchingProduct && (
                              <div className="pt-1">
                                <span className="text-xs font-extrabold text-rose-600 font-mono">
                                  {matchingProduct.price.toLocaleString('ar-IQ')} د.ع
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="pt-2 flex items-center justify-between border-t border-rose-100">
                          <button
                            type="button"
                            onClick={() => {
                              if (matchingProduct) {
                                setSelectedProduct(matchingProduct);
                              } else if (notif.productId) {
                                const found = products.find((p) => p.id === notif.productId);
                                if (found) setSelectedProduct(found);
                              }
                              onClose();
                            }}
                            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>معاينة المنتج والطلب</span>
                          </button>

                          {!notif.read && (
                            <button
                              type="button"
                              onClick={() => markNotificationAsRead(notif.id)}
                              className="text-[11px] font-bold text-stone-500 hover:text-stone-800 cursor-pointer"
                            >
                              تحديد كمقروء
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={notif.id}
                      className="p-4 rounded-3xl border border-rose-100 bg-white shadow-xs hover:shadow-md transition-shadow space-y-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-rose-50 pb-2.5">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${statusInfo.color}`}
                          >
                            {statusInfo.label}
                          </span>
                          {notif.orderId && (
                            <span className="font-mono text-xs font-extrabold text-stone-900 bg-stone-100 px-2 py-0.5 rounded-md">
                              #{notif.orderId}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-stone-400 font-mono">
                          {new Date(notif.timestamp).toLocaleDateString('ar-IQ')} -{' '}
                          {new Date(notif.timestamp).toLocaleTimeString('ar-IQ', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <h4 className="font-bold text-stone-900 text-xs flex items-center gap-1.5">
                          <Bell className="w-3.5 h-3.5 text-rose-500" />
                          <span>{t(notif.title)}</span>
                        </h4>
                        <p className="text-xs text-stone-600 leading-relaxed">{t(notif.message)}</p>
                      </div>

                      {/* Tracking number copy if available */}
                      {notif.trackingNumber && (
                        <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-rose-50/50 border border-rose-100 text-xs">
                          <div className="flex items-center gap-1.5">
                            <Truck className="w-3.5 h-3.5 text-rose-600" />
                            <span className="text-stone-600 text-[11px]">
                              رقم التتبع:
                            </span>
                            <strong className="font-mono font-bold text-rose-700 bg-white px-2 py-0.5 rounded-md border border-rose-200" dir="ltr">
                              {notif.trackingNumber}
                            </strong>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCopy(notif.trackingNumber || '')}
                            className="px-2.5 py-1 rounded-lg bg-white hover:bg-stone-50 border border-stone-200 text-[10px] font-bold text-stone-600 cursor-pointer flex items-center gap-1"
                          >
                            <Copy className="w-3 h-3" />
                            <span>
                              {copiedTracking === notif.trackingNumber
                                ? 'تم النسخ!'
                                : 'نسخ'}
                            </span>
                          </button>
                        </div>
                      )}

                      {/* Link to open orders modal */}
                      {onOpenOrders && (
                        <div className="pt-1 flex justify-end">
                          <button
                            type="button"
                            onClick={() => {
                              onClose();
                              onOpenOrders();
                            }}
                            className="text-[11px] font-bold text-rose-600 hover:text-rose-800 flex items-center gap-1 cursor-pointer"
                          >
                            <span>تتبع مسار الشحنة بالكامل</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs text-stone-500 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>التنبيهات الفورية داخل المتجر مفعلة</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="py-2 px-6 rounded-full bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs transition-colors cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
