import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  Heart,
  Gift,
  Truck,
  ShieldCheck,
  Award,
  Clock,
  ArrowRight,
  Edit2,
  CheckCircle2,
  ShoppingBag,
  Camera,
} from 'lucide-react';
import { defaultAboutUs } from '../../data/initialData';
import { optimizeImageFile } from '../../utils/mediaUpload';

export const AboutView: React.FC = () => {
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
  const missionText = about.mission;

  const features = about.features || defaultAboutUs.features || [];
  const gallery = about.gallery && about.gallery.length > 0 ? about.gallery : (defaultAboutUs.gallery || []);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const getFeatureIcon = (iconName: string) => {
    switch (iconName) {
      case 'Gift':
        return <Gift className="w-5 h-5 text-rose-500" />;
      case 'Truck':
        return <Truck className="w-5 h-5 text-rose-500" />;
      case 'ShieldCheck':
        return <ShieldCheck className="w-5 h-5 text-rose-500" />;
      case 'Award':
        return <Award className="w-5 h-5 text-rose-500" />;
      case 'Clock':
        return <Clock className="w-5 h-5 text-rose-500" />;
      default:
        return <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />;
    }
  };

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

  const handleAddGalleryStudioImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const optimized = await optimizeImageFile(file, 400);
      const currentGallery = about.gallery || defaultAboutUs.gallery || [];
      updateSettings({
        aboutUs: {
          ...about,
          gallery: [...currentGallery, optimized],
        },
      });
      setToastMessage('تمت إضافة الصورة إلى معرض صور «من نحن» من الاستوديو بنجاح!');
      setTimeout(() => setToastMessage(null), 3500);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div className="min-h-screen pb-20 text-right" dir="rtl">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-full bg-stone-900/95 text-white border border-rose-500/50 shadow-2xl backdrop-blur-md text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner / Breadcrumb */}
      <div className="bg-gradient-to-b from-rose-100/50 via-pink-50/30 to-transparent py-10 sm:py-16 border-b border-rose-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <button
              onClick={() => setActiveView('home')}
              className="inline-flex items-center gap-2 text-xs font-bold text-stone-500 hover:text-rose-600 transition-colors cursor-pointer"
            >
              <ArrowRight className="w-4 h-4" />
              <span>العودة للرئيسية</span>
            </button>

            {currentUser?.role === 'admin' && (
              <div className="flex items-center gap-2">
                <label className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer">
                  <Camera className="w-3.5 h-3.5" />
                  <span>رفع صورة من الاستوديو</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleQuickStudioUpload}
                    className="hidden"
                  />
                </label>

                <button
                  onClick={() => {
                    setActiveView('admin');
                  }}
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-stone-900 hover:bg-stone-800 text-amber-400 text-xs font-bold shadow-sm transition-all cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>لوحة تعديل من نحن كمدير</span>
                </button>
              </div>
            )}
          </div>

          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-100 text-rose-700 text-xs font-bold">
              <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
              <span>{badgeText}</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-stone-900 tracking-tight leading-tight">
              {titleText}
            </h1>

            <p className="text-sm sm:text-base text-stone-600 leading-relaxed font-medium">
              {subtitleText}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 space-y-16">
        {/* Story Section: Story text & Image */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-600">
                فلسفة البداية والشغف
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 leading-snug">
                ورد الليكو الفاخر الذي لا يذبل • صُمم ليبقى معك للأبد
              </h2>
            </div>

            <p className="text-stone-700 text-sm sm:text-base leading-relaxed whitespace-pre-line bg-white p-6 sm:p-8 rounded-3xl border border-rose-100 shadow-2xs">
              {storyText}
            </p>

            {/* Mission Statement */}
            <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-r from-rose-50 to-pink-50/70 border border-rose-200/80 space-y-2.5">
              <div className="flex items-center gap-2 text-rose-800 font-bold text-sm">
                <Heart className="w-4 h-4 text-rose-600 fill-rose-600" />
                <span>رسالتنا ووعدنا لكل عميل</span>
              </div>
              <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
                {missionText}
              </p>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-4">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-rose-50 aspect-4/3 sm:aspect-square group">
              <img
                src={about.imageUrl || defaultAboutUs.imageUrl}
                alt={titleText}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
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

              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-transparent to-transparent flex items-end p-6">
                <div className="text-white space-y-1">
                  <span className="text-[11px] font-bold text-rose-300 uppercase tracking-widest block">
                    KAZAKI.IQ BOUTIQUE
                  </span>
                  <p className="text-sm sm:text-base font-bold">
                    دقة هندسية وجمال خالد لا يبهت
                  </p>
                </div>
              </div>
            </div>

            {/* Statistics Banner */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white p-4 rounded-2xl border border-rose-100 shadow-2xs text-center space-y-1">
                <span className="text-lg sm:text-xl font-black text-rose-600 block">
                  {about.experienceYears || '+3'}
                </span>
                <span className="text-[11px] text-stone-500 block font-medium">
                  سنوات من التميز
                </span>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-rose-100 shadow-2xs text-center space-y-1">
                <span className="text-lg sm:text-xl font-black text-rose-600 block">
                  {about.satisfiedCustomers || '+10K'}
                </span>
                <span className="text-[11px] text-stone-500 block font-medium">
                  زبون يثق بنا
                </span>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-rose-100 shadow-2xs text-center space-y-1">
                <span className="text-lg sm:text-xl font-black text-rose-600 block">
                  {about.everlastingGuarantee || '100%'}
                </span>
                <span className="text-[11px] text-stone-500 block font-medium">
                  ورد لا يذبل للأبد
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Studio Photo Gallery Showcase */}
        {gallery && gallery.length > 0 && (
          <div className="space-y-6 bg-gradient-to-b from-white via-rose-50/20 to-white p-6 sm:p-10 rounded-3xl border border-rose-100 shadow-2xs">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-rose-600 block mb-1">
                  معرض صور المتجر والورشة
                </span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-stone-900">
                  لقطات ورد الليكو
                </h3>
              </div>

              {currentUser?.role === 'admin' && (
                <label className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md cursor-pointer transition-all hover:scale-105">
                  <Camera className="w-4 h-4 text-amber-300" />
                  <span>{isUploading ? 'جاري الإضافة...' : 'إضافة صورة من الاستوديو +'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAddGalleryStudioImage}
                    disabled={isUploading}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {gallery.map((imgUrl, idx) => (
                <div
                  key={idx}
                  className="group relative rounded-2xl overflow-hidden aspect-square border-2 border-white shadow-md bg-stone-100"
                >
                  <img
                    src={imgUrl}
                    alt={`Studio photo ${idx + 1}`}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3 text-white text-xs font-bold">
                    <span>ورد ليكو KAZAKI.IQ</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Core Values & Advantages */}
        <div className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-600">
              لماذا يختار الجميع KAZAKI.IQ؟
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-stone-900">
              مزايا فريدة صنعت لأجمل لحظات العمر
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((feat) => {
              const featTitle = feat.title;
              const featDesc = feat.description;

              return (
                <div
                  key={feat.id}
                  className="bg-white p-6 rounded-3xl border border-rose-100 shadow-2xs hover:border-rose-300 hover:shadow-md transition-all space-y-3"
                >
                  <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center">
                    {getFeatureIcon(feat.icon)}
                  </div>
                  <h4 className="font-bold text-stone-900 text-sm sm:text-base">
                    {featTitle}
                  </h4>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    {featDesc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Call to Action Banner */}
        <div className="rounded-3xl bg-gradient-to-r from-rose-600 via-pink-600 to-rose-700 text-white p-8 sm:p-12 relative overflow-hidden shadow-xl">
          <div className="relative z-10 max-w-2xl space-y-4">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-xs font-semibold backdrop-blur-xs">
              <Heart className="w-3.5 h-3.5 fill-white" />
              <span>اجعل هديتك تدوم للأبد</span>
            </span>

            <h3 className="text-2xl sm:text-4xl font-extrabold leading-snug">
              جاهز لاختيار بوكس أو ورود ليغو التي تناسب ذوقك؟
            </h3>

            <p className="text-rose-100 text-xs sm:text-sm leading-relaxed max-w-xl">
              تصفح تشكيلتنا الحصرية مع خدمة التوصيل السريع لكافة محافظات العراق والتغليف الفاخر والمميز.
            </p>

            <div className="pt-2 flex flex-wrap gap-3">
              <button
                onClick={() => {
                  setActiveView('products');
                  setSelectedCategory('all');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="px-8 py-3.5 rounded-full bg-white hover:bg-rose-50 text-rose-700 font-bold text-xs shadow-lg transition-colors cursor-pointer flex items-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{getBtnText('shop', 'تسوق الآن واستكشف ورود ليغو والبوكسات')}</span>
              </button>

              <button
                onClick={() => {
                  setActiveView('contact');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="px-6 py-3.5 rounded-full bg-white/20 hover:bg-white/30 text-white font-bold text-xs border border-white/30 backdrop-blur-xs transition-colors cursor-pointer"
              >
                {getBtnText('contactUs', 'تواصل مع خدمة العملاء')}
              </button>
            </div>
          </div>

          <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-1/3 w-64 h-64 bg-pink-400/20 rounded-full blur-2xl pointer-events-none" />
        </div>
      </div>
    </div>
  );
};
