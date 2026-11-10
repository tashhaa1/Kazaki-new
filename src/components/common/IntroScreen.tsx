import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { ArrowLeft, Heart } from 'lucide-react';
import { FloatingFlowersCanvas } from './FloatingFlowersCanvas';

/**
 * Botanical Vector Rose SVG for ambient background decoration.
 * Pure vector art (no emojis), beautifully shaded with royal crimson gradients.
 */
const AmbientVectorRose: React.FC<{
  className?: string;
  size?: number;
  rotation?: number;
  opacity?: number;
}> = ({ className = '', size = 160, rotation = 0, opacity = 0.25 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        transform: `rotate(${rotation}deg)`,
        opacity,
      }}
      className={`pointer-events-none filter drop-shadow-[0_8px_24px_rgba(225,29,72,0.2)] transition-transform duration-1000 ${className}`}
    >
      <defs>
        <radialGradient id="roseGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fda4af" stopOpacity="0.8" />
          <stop offset="45%" stopColor="#e11d48" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#881337" stopOpacity="1" />
        </radialGradient>
        <linearGradient id="petalGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f43f5e" />
          <stop offset="100%" stopColor="#9f1239" />
        </linearGradient>
        <linearGradient id="petalGrad2" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#be123c" />
          <stop offset="100%" stopColor="#fda4af" />
        </linearGradient>
        <linearGradient id="leafGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#059669" />
          <stop offset="100%" stopColor="#064e3b" />
        </linearGradient>
      </defs>

      {/* Botanical Leaves */}
      <path
        d="M20 70 C 15 50 30 40 45 48 C 40 65 30 72 20 70 Z"
        fill="url(#leafGrad)"
        opacity="0.75"
      />
      <path
        d="M80 70 C 85 50 70 40 55 48 C 60 65 70 72 80 70 Z"
        fill="url(#leafGrad)"
        opacity="0.75"
      />

      {/* Layer 1: Outer Petals */}
      <circle cx="50" cy="50" r="38" fill="url(#roseGlow)" opacity="0.6" />
      <path
        d="M50 14 C 68 14 78 28 72 44 C 64 36 56 34 50 34 C 44 34 36 36 28 44 C 22 28 32 14 50 14 Z"
        fill="url(#petalGrad1)"
      />
      <path
        d="M16 52 C 14 36 26 22 42 26 C 36 34 36 44 38 52 C 34 56 22 66 16 52 Z"
        fill="url(#petalGrad2)"
      />
      <path
        d="M84 52 C 86 36 74 22 58 26 C 64 34 64 44 62 52 C 66 56 78 66 84 52 Z"
        fill="url(#petalGrad1)"
      />
      <path
        d="M28 74 C 22 60 30 46 44 48 C 42 58 48 64 54 68 C 44 76 34 82 28 74 Z"
        fill="url(#petalGrad2)"
      />
      <path
        d="M72 74 C 78 60 70 46 56 48 C 58 58 52 64 46 68 C 56 76 66 82 72 74 Z"
        fill="url(#petalGrad1)"
      />

      {/* Layer 2: Mid Petals */}
      <circle cx="50" cy="50" r="24" fill="url(#petalGrad2)" />
      <path
        d="M50 28 C 60 28 66 38 60 48 C 54 44 46 44 40 48 C 34 38 40 28 50 28 Z"
        fill="url(#petalGrad1)"
        opacity="0.95"
      />
      <path
        d="M32 54 C 30 44 38 36 48 38 C 46 46 50 50 54 54 C 44 58 36 60 32 54 Z"
        fill="url(#petalGrad2)"
      />
      <path
        d="M68 54 C 70 44 62 36 52 38 C 54 46 50 50 46 54 C 56 58 64 60 68 54 Z"
        fill="url(#petalGrad1)"
      />

      {/* Layer 3: Velvet Rose Center Spiral */}
      <circle cx="50" cy="50" r="14" fill="#881337" />
      <path
        d="M50 40 C 56 40 60 45 58 51 C 54 48 48 48 44 52 C 43 45 46 40 50 40 Z"
        fill="#f43f5e"
      />
      <path
        d="M45 48 C 48 44 54 46 55 50 C 53 54 47 54 45 50 Z"
        fill="#ffe4e6"
        opacity="0.9"
      />
      <path
        d="M48 50 C 50 48 53 49 53 51 C 52 53 49 53 48 51 Z"
        fill="#ffffff"
        opacity="0.8"
      />
    </svg>
  );
};

export const IntroScreen: React.FC = () => {
  const { settings, isIntroActive, dismissIntro } = useStore();
  const [isExiting, setIsExiting] = useState(false);

  if (!isIntroActive) {
    return null;
  }

  const handleEnterStore = () => {
    setIsExiting(true);
    setTimeout(() => {
      dismissIntro();
    }, 450);
  };

  return (
    <div
      dir="rtl"
      className={`fixed inset-0 z-50 flex items-center justify-center bg-[#09070A] text-white overflow-hidden select-none transition-all duration-500 ease-out font-cairo ${
        isExiting ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* ========================================================= */}
      {/* 1. SILKY-SMOOTH BOTANICAL FLOWER CANVAS BACKGROUND */}
      {/* Procedural velvet roses & tumbling petals (Zero Emojis!) */}
      {/* ========================================================= */}
      <FloatingFlowersCanvas className="opacity-95" />

      {/* ========================================================= */}
      {/* 2. DYNAMIC AMBIENT ROSE AURAS & LIGHTS */}
      {/* ========================================================= */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Core royal rose aura glow */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[720px] h-[720px] rounded-full blur-[140px] opacity-25 animate-pulse pointer-events-none"
          style={{
            background: 'radial-gradient(circle, #e11d48 0%, #be123c 45%, rgba(15, 6, 12, 0) 75%)',
            animationDuration: '6s',
          }}
        />

        {/* Top-right soft champagne aura */}
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-rose-500/15 rounded-full blur-[110px] pointer-events-none" />

        {/* Bottom-left golden amber aura */}
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />

        {/* Top-left soft crimson aura */}
        <div className="absolute -top-24 -left-24 w-80 h-80 bg-rose-700/15 rounded-full blur-[100px] pointer-events-none" />

        {/* ======================================================= */}
        {/* 3. CINEMATIC LARGE CORNER VECTOR ROSES (No Emojis) */}
        {/* ======================================================= */}
        {/* Top-Left Floating Vector Rose */}
        <div className="absolute -top-12 -left-12 sm:top-6 sm:left-6 animate-pulse pointer-events-none" style={{ animationDuration: '8s' }}>
          <AmbientVectorRose size={210} rotation={-15} opacity={0.22} />
        </div>

        {/* Bottom-Right Floating Vector Rose */}
        <div className="absolute -bottom-16 -right-16 sm:bottom-6 sm:right-6 animate-pulse pointer-events-none" style={{ animationDuration: '10s' }}>
          <AmbientVectorRose size={250} rotation={25} opacity={0.25} />
        </div>

        {/* Top-Right Floating Vector Rose */}
        <div className="absolute top-10 right-4 sm:top-14 sm:right-16 hidden md:block animate-pulse pointer-events-none" style={{ animationDuration: '9s' }}>
          <AmbientVectorRose size={150} rotation={45} opacity={0.16} />
        </div>

        {/* Bottom-Left Floating Vector Rose */}
        <div className="absolute bottom-12 left-6 sm:bottom-16 sm:left-20 hidden md:block animate-pulse pointer-events-none" style={{ animationDuration: '11s' }}>
          <AmbientVectorRose size={160} rotation={-35} opacity={0.18} />
        </div>

        {/* Architectural subtle grid pattern overlay for Lego precision feel */}
        <div
          className="absolute inset-0 opacity-[0.025] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.5) 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
          }}
        />
      </div>

      {/* ========================================================= */}
      {/* 4. CENTER SANCTUARY CARD */}
      {/* ========================================================= */}
      <div className="relative z-10 max-w-xl w-full mx-4 sm:mx-6 px-6 py-9 sm:px-10 sm:py-11 rounded-3xl bg-stone-950/75 border border-rose-500/25 backdrop-blur-2xl shadow-2xl shadow-black/90 text-center animate-in fade-in zoom-in-95 duration-700 flex flex-col items-center justify-center">
        
        {/* Centered Brand Logo Medallion */}
        <div className="relative flex items-center justify-center mx-auto mb-5 sm:mb-6">
          {/* Pulsing ambient halo ring */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-rose-500 via-pink-500 to-amber-300 blur-xl opacity-50 animate-pulse" />
          
          {/* Metallic border wrapper */}
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full p-[2.5px] bg-gradient-to-tr from-rose-500 via-rose-300 to-amber-300 shadow-2xl shadow-rose-950/80">
            <div className="w-full h-full rounded-full overflow-hidden bg-stone-950 flex items-center justify-center border border-white/20 group">
              <img
                src={settings.logoUrl || '/logo.jpg'}
                alt={settings.storeName || 'KAZAKI.IQ'}
                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                onError={(e) => {
                  // Elegant vector rose crest fallback if image isn't loaded
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          </div>

          {/* Mini golden heart badge */}
          <span className="absolute -bottom-1 -right-1 bg-gradient-to-tr from-rose-600 to-pink-500 text-white p-1.5 rounded-full shadow-lg border border-white/20">
            <Heart className="w-3.5 h-3.5 text-amber-200 fill-amber-200" />
          </span>
        </div>

        {/* Brand Name Title (Prominent and Clear with Luxury Cinzel Font) */}
        <h1
          dir="ltr"
          className="text-2xl sm:text-3xl md:text-5xl font-extrabold tracking-[0.22em] uppercase text-white mb-4 drop-shadow-[0_4px_24px_rgba(244,63,94,0.35)]"
          style={{ fontFamily: "'Cinzel', 'Playfair Display', serif" }}
        >
          <span className="bg-gradient-to-r from-rose-100 via-white to-amber-100 bg-clip-text text-transparent">
            kazaki iq
          </span>
        </h1>

        {/* Narrative Subtitle */}
        <p className="text-stone-300 text-xs sm:text-sm leading-relaxed mb-7 max-w-lg mx-auto font-normal">
          نبتكر من قطع الليكو الفاخرة تحفاً فنية وأزهاراً أبدية لا تذبل أبداً. تجربة إهداء فاخرة مصممة لتخليد أجمل اللحظات والمناسبات.
        </p>

        {/* Main CTA Enter Store Button */}
        <div className="relative group inline-block w-full max-w-xs sm:max-w-sm">
          {/* Radiant glow behind button */}
          <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-rose-600 via-pink-500 to-rose-600 opacity-70 blur-md group-hover:opacity-100 transition-opacity duration-300" />

          <button
            type="button"
            onClick={handleEnterStore}
            className="relative w-full py-4 px-8 rounded-full bg-gradient-to-r from-rose-600 via-pink-600 to-rose-500 hover:from-rose-500 hover:via-pink-500 hover:to-rose-600 text-white font-black text-sm sm:text-base tracking-wide shadow-xl transition-all duration-300 transform group-hover:-translate-y-0.5 active:translate-y-0 cursor-pointer flex items-center justify-center gap-3"
          >
            <Heart className="w-4 h-4 text-rose-200 fill-rose-200" />
            <span>دخول إلى المتجر</span>
            <ArrowLeft className="w-4 h-4 text-rose-100 transition-transform duration-300 group-hover:-translate-x-1" />
          </button>
        </div>

        {/* Footer Subtext (Clean text without emojis) */}
        <p className="mt-4 text-[10px] sm:text-[11px] text-stone-500">
          متجر كازاكي الرسمي • تجهيز وتوصيل مباشر لكافة محافظات العراق
        </p>

      </div>
    </div>
  );
};
