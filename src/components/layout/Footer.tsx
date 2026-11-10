import React from 'react';
import { useStore } from '../../context/StoreContext';
import { Heart, Phone, Mail, Instagram, ShieldCheck, Award, MessageSquare, Video } from 'lucide-react';

export const Footer: React.FC = () => {
  const { settings, setActiveView, getBtnText } = useStore();

  return (
    <footer
      className="bg-white/70 backdrop-blur-md text-stone-700 pt-16 pb-12 border-t border-rose-200/60 shadow-2xs text-right font-cairo"
      dir="rtl"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10 pb-12 border-b border-rose-100/80">
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img
                src={settings.logoUrl || '/logo.jpg'}
                alt={settings.storeName || 'KAZAKI.IQ'}
                className="w-10 h-10 rounded-full object-cover border-2 border-rose-200 shadow-sm shrink-0"
                onError={(e) => {
                  e.currentTarget.src = '/logo.jpg';
                }}
              />
              <span className="text-xl font-black text-stone-900 tracking-tight">
                {settings.storeName}
              </span>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed max-w-sm">
              {settings.tagline} - وجهتكم الأولى لأرقى تشكيلات ورد الليكو الفاخرة، صُممت لتبقى معكم للأبد مع ضمان الجودة والتغليف الفاخر لجميع الطلبات.
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-stone-700 pt-2">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-rose-600" />
                <span>منتجات أصلية 100%</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Award className="w-4 h-4 text-rose-600" />
                <span>ضمان الجودة الذهبي</span>
              </div>
            </div>
          </div>

          {/* Customer Service & Contact */}
          <div className="space-y-3">
            <h4
              onClick={() => {
                setActiveView('contact');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="text-xs font-bold text-stone-900 uppercase tracking-wider hover:text-rose-600 cursor-pointer transition-colors flex items-center justify-between"
            >
              <span>{getBtnText('customerService', 'خدمة العملاء')}</span>
            </h4>

            {settings.contactInfo?.enabled === false ? (
              <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-[11px] space-y-1">
                <span className="text-amber-800 font-bold block">
                  خدمة العملاء مغلقة حالياً
                </span>
                <span className="text-stone-600 leading-relaxed block">
                  قنوات الدعم متوقفة مؤقتاً للصيانة، جميع عمليات الطلب والشراء تعمل تلقائياً.
                </span>
              </div>
            ) : (
              <div className="space-y-2 text-xs">
                {settings.phone && (
                  <p className="flex items-center gap-2 text-stone-600">
                    <Phone className="w-4 h-4 text-rose-600 shrink-0" />
                    <span dir="ltr">{settings.phone}</span>
                  </p>
                )}
                {settings.whatsapp && (
                  <a
                    href={`https://wa.me/${(settings.whatsapp || '').replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-stone-600 hover:text-emerald-600 transition-colors"
                  >
                    <MessageSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      واتساب: <span dir="ltr">{settings.whatsapp}</span>
                    </span>
                  </a>
                )}
                {settings.email && (
                  <p className="flex items-center gap-2 text-stone-600">
                    <Mail className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{settings.email}</span>
                  </p>
                )}
                <button
                  onClick={() => {
                    setActiveView('contact');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="mt-1 text-xs text-rose-600 hover:text-rose-700 underline font-semibold cursor-pointer block"
                >
                  {getBtnText('sendMessage', 'إرسال رسالة أو استفسار مباشر')} ←
                </button>
              </div>
            )}
          </div>

          {/* Social Media Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
              تابعينا على السوشيال ميديا
            </h4>
            <div className="space-y-2.5 text-xs">
              <a
                href={
                  (settings.instagram || 'https://instagram.com/kazaki.iq').startsWith('http')
                    ? settings.instagram || 'https://instagram.com/kazaki.iq'
                    : `https://instagram.com/${(settings.instagram || 'kazaki.iq').replace('@', '')}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 text-stone-700 hover:text-pink-600 transition-colors p-2.5 rounded-xl bg-rose-50/50 hover:bg-rose-100/60 border border-rose-100 shadow-2xs"
              >
                <Instagram className="w-4 h-4 text-pink-600 shrink-0" />
                <span className="font-semibold">
                  Instagram: {(settings.instagram || 'kazaki.iq').replace('https://instagram.com/', '')}
                </span>
              </a>

              <a
                href={
                  (settings.tiktok || 'https://tiktok.com/@kazaki.iq').startsWith('http')
                    ? settings.tiktok || 'https://tiktok.com/@kazaki.iq'
                    : `https://tiktok.com/@${(settings.tiktok || 'kazaki.iq').replace('@', '')}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 text-stone-700 hover:text-stone-900 transition-colors p-2.5 rounded-xl bg-rose-50/50 hover:bg-rose-100/60 border border-rose-100 shadow-2xs"
              >
                <Video className="w-4 h-4 text-rose-600 shrink-0" />
                <span className="font-semibold">
                  TikTok: {(settings.tiktok || 'kazaki.iq').replace('https://tiktok.com/@', '')}
                </span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500 text-center sm:text-right">
          <p>
            © {new Date().getFullYear()} {settings.storeName}. جميع الحقوق محفوظة لمتجر {settings.storeName}.
          </p>
        </div>
      </div>
    </footer>
  );
};
