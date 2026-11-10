import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  Heart,
  Award,
  ArrowLeft,
  Edit2,
  Gift,
  Truck,
  Camera,
  CheckCircle2,
} from 'lucide-react';
import { defaultAboutUs } from '../../data/initialData';
import { optimizeImageFile } from '../../utils/mediaUpload';

export const AboutHomeSection: React.FC = () => {
  const {
    settings,
    updateSettings,
    setActiveView,
    setSelectedCategory,
    currentUser,
    getBtnText,
  } = useStore();

  const about = settings.aboutUs || defaultAboutUs;

  const badgeText = about.badge;
  const titleText = about.title;
  const subtitleText = about.subtitle;
  const storyText = about.story;

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleQuickStudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const optimized = await optimizeImageFile(file, 400);
      updateSettings({
        aboutUs: {
          ...about,
          imageUrl: optimized,
        },
      });
      setToastMessage('تم تحديث صورة «من نحن» من استوديو جهازك بنجاح!');
      setTimeout(() => setToastMessage(null), 3500);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-full bg-stone-900/95 text-white border border-rose-500/50 shadow-2xl backdrop-blur-md text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div
        className="bg-white/90 backdrop-blur-sm rounded-3xl border border-rose-100 p-8 sm:p-12 shadow-sm relative overflow-hidden text-right"
        dir="rtl"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          {/* Text Content */}
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-bold border border-rose-100">
                <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                <span>{badgeText || 'من نحن وقصتنا'}</span>
              </span>

              {currentUser?.role === 'admin' && (
                <div className="flex items-center gap-1.5">
                  <label className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold shadow-xs transition-colors cursor-pointer">
                    <Camera className="w-3 h-3 text-amber-300" />
                    <span>{isUploading ? 'جاري الرفع...' : 'رفع صورة من الاستوديو'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleQuickStudioUpload}
                      disabled={isUploading}
                      className="hidden"
                    />
                  </label>

                  <button
                    type="button"
                    onClick={() => setActiveView('admin')}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-stone-900 text-amber-300 text-[11px] font-bold shadow-xs hover:bg-stone-800 transition-colors cursor-pointer"
                    title="تعديل صفحة وقسم من نحن كمدير"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>تعديل «من نحن» كمدير</span>
                  </button>
                </div>
              )}
            </div>

            <h2 className="text-2xl sm:text-4xl font-extrabold text-stone-900 tracking-tight leading-tight">
              {titleText || 'عالم ورد الليكو الفاخر • إبداع يدوم للأبد'}
            </h2>

            <p className="text-rose-700 font-semibold text-xs sm:text-sm">
              {subtitleText || 'حيث تلتقي دقة التركيب مع سحر الورد الخالد الذي لا يذبل أبداً.'}
            </p>

            <p className="text-stone-600 text-xs sm:text-sm leading-relaxed line-clamp-4">
              {storyText}
            </p>

            {/* Value Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3 rounded-2xl bg-rose-50/50 border border-rose-100 flex items-center gap-2.5">
                <Heart className="w-5 h-5 text-rose-500 shrink-0" />
                <span className="text-[11px] font-bold text-stone-800">
                  لا يذبل للأبد
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-pink-50/50 border border-pink-100 flex items-center gap-2.5">
                <Gift className="w-5 h-5 text-pink-500 shrink-0" />
                <span className="text-[11px] font-bold text-stone-800">
                  تغليف فاخر ومميز
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-amber-50/50 border border-amber-100 flex items-center gap-2.5 col-span-2 sm:col-span-1">
                <Truck className="w-5 h-5 text-amber-600 shrink-0" />
                <span className="text-[11px] font-bold text-stone-800">
                  شحن لكل العراق
                </span>
              </div>
            </div>

            {/* Action Button */}
            <div className="pt-3 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setActiveView('products');
                  setSelectedCategory('all');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="px-6 py-2.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <span>{getBtnText('shop', 'تصفح ورود ليغو')}</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Visual Showcase */}
          <div className="relative group">
            <div className="aspect-4/3 rounded-3xl overflow-hidden shadow-lg border-4 border-white bg-rose-50 relative">
              <img
                src={about.imageUrl || 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=1000&q=80'}
                alt={titleText}
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
              />

              {/* Admin Quick Studio Upload Trigger Overlay */}
              {currentUser?.role === 'admin' && (
                <div className="absolute top-4 right-4 z-20">
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stone-900/90 hover:bg-stone-900 text-white text-xs font-bold shadow-lg border border-white/20 backdrop-blur-md cursor-pointer transition-all hover:scale-105">
                    <Camera className="w-3.5 h-3.5 text-rose-400" />
                    <span>{isUploading ? 'جاري الرفع...' : 'تغيير الصورة من الاستوديو'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleQuickStudioUpload}
                      disabled={isUploading}
                      className="hidden"
                    />
                  </label>
                </div>
              )}
            </div>

            {/* Floating Quality Badge */}
            <div className="absolute bottom-2 sm:-bottom-4 right-2 sm:-right-4 bg-stone-900/95 sm:bg-stone-900 text-white p-3 sm:p-4 rounded-2xl shadow-xl flex items-center gap-2.5 sm:gap-3 border border-stone-700 max-w-[calc(100%-1rem)] sm:max-w-xs backdrop-blur-xs">
              <Award className="w-7 h-7 text-amber-400 shrink-0" />
              <div>
                <span className="block font-black text-xs text-white">
                  ورد ليكو أصلي ومضمون
                </span>
                <span className="text-[10px] text-stone-300">
                  صُممت بعناية لتبقى معك للأبد دون أن تذبل
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
