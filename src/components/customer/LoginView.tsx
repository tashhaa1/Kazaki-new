import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  User,
  Lock,
  Mail,
  Phone,
  MapPin,
  Eye,
  EyeOff,
  CheckCircle2,
  LogIn,
  LogOut,
  ChevronLeft,
  ArrowRight,
  ShieldCheck,
  ShoppingBag,
  UserPlus,
} from 'lucide-react';

const IRAQI_CITIES = [
  'بغداد',
  'أربيل',
  'البصرة',
  'النجف الأشرف',
  'كربلاء المقدسة',
  'السليمانية',
  'دهوك',
  'كركوك',
  'بابل / الحلة',
  'ديالى',
  'الأنبار',
  'صلاح الدين',
  'واسط / الكوت',
  'المثنى / السماوة',
  'ميسان / العمارة',
  'ذي قار / الناصرية',
  'نينوى / الموصل',
  'الديوانية / القادسية',
];

export const LoginView: React.FC = () => {
  const {
    currentUser,
    login,
    register,
    loginAdminAsync,
    logout,
    setActiveView,
    getBtnText,
    orders,
  } = useStore();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regCity, setRegCity] = useState('بغداد');
  const [regPassword, setRegPassword] = useState('');

  // Count user orders if logged in
  const userOrdersCount = orders.filter((o) => {
    if (!currentUser) return false;
    if (currentUser.role === 'admin') return true;
    const matchEmail = o.customerEmail && currentUser.email && o.customerEmail.toLowerCase() === currentUser.email.toLowerCase();
    const matchPhone = o.customerPhone && currentUser.phone && o.customerPhone.trim() === currentUser.phone.trim();
    return Boolean(matchEmail || matchPhone);
  }).length;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const email = loginEmail.trim();
    const password = loginPassword.trim();

    if (!email || !password) {
      setErrorMessage('يرجى إدخال البريد الإلكتروني أو رقم الهاتف وكلمة المرور');
      return;
    }

    setIsLoading(true);

    try {
      // First attempt admin check
      const adminRes = await loginAdminAsync(email, password);
      if (adminRes.success) {
        setSuccessMessage('تم تسجيل الدخول بنجاح كمدير للمتجر');
        setTimeout(() => {
          setActiveView('admin');
        }, 700);
        return;
      }
    } catch {
      // fallback to regular customer login
    }

    // Regular customer login
    const success = login(email, password);
    setIsLoading(false);

    if (success) {
      setSuccessMessage('تم تسجيل الدخول بنجاح! أهلاً بك في متجر KAZAKI.IQ');
      setTimeout(() => {
        setActiveView('home');
      }, 700);
    } else {
      setErrorMessage('بيانات تسجيل الدخول أو رمز المرور غير صحيحة، يرجى التأكد وإعادة المحاولة');
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const name = regName.trim();
    const email = regEmail.trim().toLowerCase();
    const phone = regPhone.trim();
    const password = regPassword.trim();

    if (!name || !email || !password) {
      setErrorMessage('يرجى ملء جميع الحقول المطلوبة (الاسم، البريد الإلكتروني، كلمة المرور)');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('يجب أن تتكون كلمة المرور من 6 أحرف أو أرقام على الأقل');
      return;
    }

    const success = register({
      name,
      email,
      phone,
      city: regCity,
      password,
    });

    if (success) {
      setSuccessMessage('تم إنشاء حسابك بنجاح! مرحباً بك في متجر KAZAKI.IQ');
      setTimeout(() => {
        setActiveView('home');
      }, 800);
    } else {
      setErrorMessage('حدث خطأ أثناء إنشاء الحساب، يرجى المحاولة مرة أخرى');
    }
  };

  return (
    <div
      className="min-h-[80vh] bg-gradient-to-b from-rose-50/60 via-white to-pink-50/30 py-10 px-4 sm:px-6 lg:px-8 text-right font-cairo"
      dir="rtl"
    >
      <div className="max-w-xl mx-auto">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-rose-100">
          <div className="flex items-center gap-2 text-xs text-stone-500 font-medium">
            <button
              onClick={() => setActiveView('home')}
              className="hover:text-rose-600 transition-colors cursor-pointer"
            >
              الرئيسية
            </button>
            <ChevronLeft className="w-3.5 h-3.5 rotate-180 text-stone-400" />
            <span className="text-stone-900 font-bold">
              {currentUser
                ? 'ملف الحساب الشخصي'
                : mode === 'login'
                ? 'تسجيل دخول الزبون'
                : 'إنشاء حساب زبون جديد'}
            </span>
          </div>

          <button
            onClick={() => setActiveView('home')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3.5 py-1.5 rounded-full transition-colors cursor-pointer shadow-2xs"
          >
            <span>العودة للمتجر</span>
            <ArrowRight className="w-3.5 h-3.5 rotate-180" />
          </button>
        </div>

        {/* When user is already logged in */}
        {currentUser ? (
          <div className="bg-white rounded-3xl border border-rose-100 shadow-xl overflow-hidden p-8 sm:p-10 text-center space-y-6 animate-in fade-in">
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-tr from-rose-500 to-pink-400 flex items-center justify-center text-white shadow-lg shadow-rose-200">
              {currentUser.role === 'admin' ? (
                <ShieldCheck className="w-10 h-10" />
              ) : (
                <User className="w-10 h-10" />
              )}
            </div>

            <div>
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold mb-2 bg-rose-100 text-rose-700">
                {currentUser.role === 'admin'
                  ? 'صلاحية: المدير العام'
                  : 'حساب زبون مسجل'}
              </span>
              <h2 className="text-2xl font-extrabold text-stone-900">
                أهلاً بك، {currentUser.name}
              </h2>
              <p className="text-xs sm:text-sm text-stone-500 mt-1 font-mono">
                {currentUser.email}
              </p>
            </div>

            {/* Customer Details Summary Card */}
            <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-100 space-y-2.5 text-xs text-right">
              <h3 className="font-bold text-stone-800 text-sm border-b border-rose-100 pb-2">
                بيانات حسابك المسجلة:
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-stone-600">
                <div>
                  <span className="font-semibold text-stone-900">
                    الاسم الكامل: 
                  </span>
                  <span> {currentUser.name}</span>
                </div>
                <div>
                  <span className="font-semibold text-stone-900">
                    البريد الإلكتروني: 
                  </span>
                  <span className="font-mono text-[11px]"> {currentUser.email}</span>
                </div>
                {currentUser.phone && (
                  <div>
                    <span className="font-semibold text-stone-900">
                      رقم الهاتف: 
                    </span>
                    <span dir="ltr"> {currentUser.phone}</span>
                  </div>
                )}
                {currentUser.city && (
                  <div>
                    <span className="font-semibold text-stone-900">
                      المحافظة / المدينة: 
                    </span>
                    <span> {currentUser.city}</span>
                  </div>
                )}
                <div>
                  <span className="font-semibold text-stone-900">
                    عدد الطلبات: 
                  </span>
                  <span className="font-bold text-rose-600">
                    {userOrdersCount} طلب
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs font-bold">
              {currentUser.role === 'admin' && (
                <button
                  onClick={() => setActiveView('admin')}
                  className="py-3 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-amber-400 shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>لوحة تحكم الإدارة</span>
                </button>
              )}

              <button
                onClick={() => setActiveView('products')}
                className="py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-200 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>تصفح تشكيلة ورد الليكو</span>
              </button>

              <button
                onClick={() => {
                  logout();
                  setSuccessMessage('تم تسجيل الخروج بنجاح');
                }}
                className="col-span-full py-2.5 px-4 rounded-xl bg-stone-100 hover:bg-red-50 text-stone-600 hover:text-red-600 border border-stone-200 transition-colors flex items-center justify-center gap-2 cursor-pointer text-xs"
              >
                <LogOut className="w-4 h-4" />
                <span>تسجيل الخروج من الحساب</span>
              </button>
            </div>
          </div>
        ) : (
          /* Main Authentication Container */
          <div className="bg-white rounded-3xl border border-rose-100 shadow-xl overflow-hidden p-6 sm:p-10">
            {/* Clean 2-Way Switcher */}
            <div className="grid grid-cols-2 p-1.5 bg-stone-100/80 rounded-2xl mb-8 border border-stone-200/60">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMessage('');
                  setSuccessMessage('');
                }}
                className={`py-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  mode === 'login'
                    ? 'bg-white text-rose-700 shadow-sm'
                    : 'text-stone-600 hover:text-rose-600'
                }`}
              >
                <LogIn className="w-4 h-4" />
                <span>تسجيل الدخول</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setErrorMessage('');
                  setSuccessMessage('');
                }}
                className={`py-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  mode === 'register'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-stone-600 hover:text-rose-600'
                }`}
              >
                <UserPlus className="w-4 h-4 text-white" />
                <span>إنشاء حساب</span>
              </button>
            </div>

            {/* Error & Success Messages */}
            {errorMessage && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs sm:text-sm flex items-center gap-2.5 animate-in fade-in">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs sm:text-sm flex items-center gap-2.5 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* 1. LOGIN FORM */}
            {mode === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">
                    البريد الإلكتروني أو رقم الهاتف
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="name@example.com أو 07701234567"
                      className="w-full pr-10 pl-4 text-right py-3 text-xs sm:text-sm rounded-xl border border-stone-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 outline-none transition-all"
                    />
                    <Mail className="w-4 h-4 text-stone-400 absolute right-3.5 top-3.5 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">
                    كلمة المرور
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pr-10 pl-10 text-right py-3 text-xs sm:text-sm rounded-xl border border-stone-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 outline-none transition-all"
                    />
                    <Lock className="w-4 h-4 text-stone-400 absolute right-3.5 top-3.5 pointer-events-none" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="p-1 text-stone-400 hover:text-stone-600 absolute left-3 top-3 cursor-pointer"
                      aria-label="إظهار كلمة المرور"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-4 py-3.5 rounded-xl bg-gradient-to-r from-rose-600 via-pink-600 to-rose-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold text-sm shadow-md shadow-rose-300 hover:shadow-lg transition-all duration-300 cursor-pointer flex items-center justify-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  <span>
                    {isLoading
                      ? 'جاري التحقق...'
                      : getBtnText('login', 'تسجيل الدخول')}
                  </span>
                </button>

                <div className="text-center pt-4 text-xs text-stone-600">
                  ليس لديك حساب حتى الآن؟{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('register');
                      setErrorMessage('');
                      setSuccessMessage('');
                    }}
                    className="text-rose-600 font-bold hover:underline cursor-pointer"
                  >
                    إنشاء حساب جديد
                  </button>
                </div>
              </form>
            )}

            {/* 2. REGISTER FORM */}
            {mode === 'register' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">
                    الاسم الكامل <span className="text-rose-600">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="أدخل اسمك الكريم"
                      className="w-full pr-10 pl-4 text-right py-3 text-xs sm:text-sm rounded-xl border border-stone-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 outline-none transition-all"
                    />
                    <User className="w-4 h-4 text-stone-400 absolute right-3.5 top-3.5 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">
                    البريد الإلكتروني <span className="text-rose-600">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full pr-10 pl-4 text-right py-3 text-xs sm:text-sm rounded-xl border border-stone-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 outline-none transition-all"
                    />
                    <Mail className="w-4 h-4 text-stone-400 absolute right-3.5 top-3.5 pointer-events-none" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1.5">
                      رقم الهاتف <span className="text-stone-400 font-normal">(للتوصيل)</span>
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        placeholder="07701234567"
                        className="w-full pr-10 pl-4 py-3 text-xs sm:text-sm rounded-xl border border-stone-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 outline-none transition-all text-left"
                        dir="ltr"
                      />
                      <Phone className="w-4 h-4 text-stone-400 absolute right-3.5 top-3.5 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1.5">
                      المحافظة / المدينة
                    </label>
                    <div className="relative">
                      <select
                        value={regCity}
                        onChange={(e) => setRegCity(e.target.value)}
                        className="w-full pr-10 pl-4 text-right py-3 text-xs sm:text-sm rounded-xl border border-stone-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 outline-none transition-all cursor-pointer bg-white"
                      >
                        {IRAQI_CITIES.map((city) => (
                          <option key={city} value={city}>
                            {city}
                          </option>
                        ))}
                      </select>
                      <MapPin className="w-4 h-4 text-stone-400 absolute right-3.5 top-3.5 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">
                    كلمة المرور <span className="text-rose-600">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="أدخل كلمة مرور لا تقل عن 6 أحرف"
                      className="w-full pr-10 pl-10 text-right py-3 text-xs sm:text-sm rounded-xl border border-stone-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 outline-none transition-all"
                    />
                    <Lock className="w-4 h-4 text-stone-400 absolute right-3.5 top-3.5 pointer-events-none" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="p-1 text-stone-400 hover:text-stone-600 absolute left-3 top-3 cursor-pointer"
                      aria-label="إظهار كلمة المرور"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full mt-4 py-3.5 rounded-xl bg-gradient-to-r from-rose-600 via-pink-600 to-rose-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold text-sm shadow-md shadow-rose-300 hover:shadow-lg transition-all duration-300 cursor-pointer flex items-center justify-center gap-2"
                >
                  <UserPlus className="w-4 h-4 text-white" />
                  <span>إنشاء حساب زبون جديد</span>
                </button>

                <div className="text-center pt-4 text-xs text-stone-600">
                  لديك حساب بالفعل؟{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setErrorMessage('');
                      setSuccessMessage('');
                    }}
                    className="text-rose-600 font-bold hover:underline cursor-pointer"
                  >
                    تسجيل الدخول
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
