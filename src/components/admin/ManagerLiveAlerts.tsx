import React from 'react';
import { useStore, isCurrentSessionAdmin } from '../../context/StoreContext';
import {
  BellRing,
  ShoppingBag,
  MessageSquare,
  X,
  ArrowRight,
  ExternalLink,
  MapPin,
  Clock,
  Volume2,
} from 'lucide-react';

export const ManagerLiveAlerts: React.FC = () => {
  const {
    currentUser,
    activeView,
    newOrderAlert,
    clearNewOrderAlert,
    newSupportAlert,
    clearNewSupportAlert,
    setActiveView,
    setTargetOrderFilter,
  } = useStore();

  // Strictly for logged-in admin or active admin session
  const isAdmin = currentUser?.role === 'admin' || isCurrentSessionAdmin(currentUser, activeView);
  if (!isAdmin) {
    return null;
  }

  if (!newOrderAlert && !newSupportAlert) {
    return null;
  }

  return (
    <div
      dir="rtl"
      className="fixed bottom-6 left-6 z-50 max-w-sm w-full space-y-3 pointer-events-auto animate-in slide-in-from-bottom-5 fade-in duration-300"
    >
      {/* 1. New Incoming Order Alert */}
      {newOrderAlert && (
        <div className="bg-stone-950 text-white rounded-3xl p-5 shadow-2xl border-2 border-rose-500/80 backdrop-blur-xl relative overflow-hidden ring-4 ring-rose-500/20">
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/20 rounded-full blur-2xl pointer-events-none" />

          {/* Alert Header */}
          <div className="flex items-center justify-between gap-2 pb-3 border-b border-stone-800">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-rose-600 text-white flex items-center justify-center animate-pulse shadow-md shadow-rose-600/50">
                <BellRing className="w-5 h-5 animate-bounce" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-white flex items-center gap-1.5">
                  <span>طلب جديد وارد للمتجر!</span>
                  <span className="text-[10px] bg-rose-500 text-white px-2 py-0.2 rounded-full font-mono">
                    فوري
                  </span>
                </h4>
                <span className="text-[11px] text-stone-400 font-mono">
                  #{newOrderAlert.orderId} • {newOrderAlert.time}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={clearNewOrderAlert}
              className="p-1 rounded-full text-stone-400 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer"
              aria-label="إغلاق"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Details */}
          <div className="py-3 space-y-1 text-xs">
            <div className="flex items-center justify-between text-stone-300">
              <span>الزبونة:</span>
              <strong className="text-white font-bold">{newOrderAlert.customerName}</strong>
            </div>
            <div className="flex items-center justify-between text-stone-300">
              <span>المبلغ الإجمالي:</span>
              <strong className="text-rose-400 font-extrabold font-mono text-sm">
                {newOrderAlert.amount?.toLocaleString('ar-IQ')} د.ع
              </strong>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-stone-800">
            <button
              type="button"
              onClick={() => {
                setTargetOrderFilter(newOrderAlert.orderId);
                setActiveView('admin');
                clearNewOrderAlert();
              }}
              className="py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-all shadow-md shadow-rose-600/30 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>تجهيز الطلب الآن</span>
            </button>

            <button
              type="button"
              onClick={clearNewOrderAlert}
              className="py-2.5 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold text-xs transition-all flex items-center justify-center cursor-pointer"
            >
              حسناً، تم الاطلاع
            </button>
          </div>
        </div>
      )}

      {/* 2. New Support Chat Alert */}
      {newSupportAlert && (
        <div className="bg-stone-950 text-white rounded-3xl p-5 shadow-2xl border-2 border-emerald-500/80 backdrop-blur-xl relative overflow-hidden ring-4 ring-emerald-500/20">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />

          {/* Header */}
          <div className="flex items-center justify-between gap-2 pb-3 border-b border-stone-800">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/50">
                <MessageSquare className="w-5 h-5 animate-bounce" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-white flex items-center gap-1.5">
                  <span>محادثة دعم جديدة!</span>
                  <span className="text-[10px] bg-emerald-500 text-white px-2 py-0.2 rounded-full">
                    جديد
                  </span>
                </h4>
                <span className="text-[11px] text-stone-400">
                  من الزبونة: <b className="text-white">{newSupportAlert.customerName}</b>
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={clearNewSupportAlert}
              className="p-1 rounded-full text-stone-400 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer"
              aria-label="إغلاق"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Message preview */}
          <div className="py-2.5 text-xs text-stone-300 space-y-1">
            <span className="text-[11px] text-stone-400 block font-semibold">
              الموضوع: {newSupportAlert.subject}
            </span>
            <p className="line-clamp-2 text-stone-200 leading-relaxed bg-stone-900/60 p-2 rounded-xl border border-stone-800">
              «{newSupportAlert.message}»
            </p>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-stone-800">
            <button
              type="button"
              onClick={() => {
                setActiveView('admin');
                clearNewSupportAlert();
              }}
              className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-md shadow-emerald-600/30 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>فتح المحادثة والرد</span>
            </button>

            <button
              type="button"
              onClick={clearNewSupportAlert}
              className="py-2.5 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold text-xs transition-all flex items-center justify-center cursor-pointer"
            >
              تخطي
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
