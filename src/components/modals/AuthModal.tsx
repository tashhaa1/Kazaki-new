import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  X,
  User,
  Lock,
  Mail,
  Phone,
  MapPin,
  LogIn,
  UserPlus,
  Eye,
  EyeOff,
  CheckCircle2,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

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

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialMode = 'login' }) => {
  const { login, register, loginAdminAsync, getBtnText } = useStore();

  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [showPassword, setShowPassword] = useState(false);

  // Login fields
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register fields
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regCity, setRegCity] = useState('بغداد');
  const [regPassword, setRegPassword] = useState('');

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setErrorMessage('');
      setSuccessMessage('');
      setShowPassword(false);
      setIsSubmitting(false);
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const identifier = loginIdentifier.trim();
    const password = loginPassword.trim();

    if (!identifier || !password) {
      setErrorMessage('يرجى إدخال البريد الإلكتروني أو رقم الهاتف وكلمة المرور');
      return;
    }

    setIsSubmitting(true);

    try {
      // Check admin credentials if applicable
      const adminRes = await loginAdminAsync(identifier, password);
      if (adminRes.success) {
        setSuccessMessage('تم تسجيل الدخول بنجاح كمدير للمتجر');
        setTimeout(() => {
          setIsSubmitting(false);
          onClose();
        }, 600);
        return;
      }
    } catch {
      // proceed to normal customer login
    }

    // Customer login
    const success = login(identifier, password);
    setIsSubmitting(false);

    if (success) {
      setSuccessMessage('تم تسجيل الدخول بنجاح! أهلاً بك في متجر KAZAKI.IQ');
      setTimeout(() => {
        onClose();
      }, 700);
    } else {
      setErrorMessage('بيانات تسجيل الدخول أو رمز المرور غير صحيحة، يرجى المحاولة ثانية');
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
      setErrorMessage('يرجى ملء جميع الحقول الإلزامية (الاسم، البريد الإلكتروني، كلمة المرور)');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('يجب أن تتكون كلمة المرور من 6 أحرف أو أرقام على الأقل');
      return;
    }

    setIsSubmitting(true);

    const success = register({
      name,
      email,
      phone,
      city: regCity,
      password,
    });

    setIsSubmitting(false);

    if (success) {
      setSuccessMessage('تم إنشاء حسابك بنجاح! مرحباً بك في KAZAKI.IQ');
      setTimeout(() => {
        onClose();
      }, 800);
    } else {
      setErrorMessage('حدث خطأ أثناء إنشاء الحساب، يرجى المحاولة ثانية');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex min-h-full items-center justify-center p-2.5 sm:p-4">
      <div
        className="my-auto relative bg-white rounded-2xl sm:rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-rose-100 animate-in fade-in zoom-in-95 duration-200 text-right font-cairo"
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
      >
        {/* Header */}
        <div className="p-5 border-b border-rose-100 flex items-center justify-between bg-gradient-to-r from-rose-50/80 via-pink-50/50 to-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-500 text-white shadow-md shadow-rose-200">
              {mode === 'login' ? <LogIn className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-base font-extrabold text-stone-900">
                {mode === 'login' ? 'تسجيل دخول الزبون' : 'إنشاء حساب زبون جديد'}
              </h2>
              <p className="text-[11px] text-stone-500">
                {mode === 'login'
                  ? 'سجل دخولك لمتابعة مشترياتك وتتبع شحناتك'
                  : 'انضم لزبائن KAZAKI.IQ واستمتع بأجمل تشكيلات ورد الليكو'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-rose-100 text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="p-3 bg-stone-50/80 border-b border-rose-100">
          <div className="grid grid-cols-2 p-1 bg-white rounded-2xl border border-rose-100 shadow-2xs">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMessage('');
                setSuccessMessage('');
              }}
              className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                mode === 'login'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-stone-600 hover:text-rose-600'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>تسجيل الدخول</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMessage('');
                setSuccessMessage('');
              }}
              className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                mode === 'register'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-stone-600 hover:text-rose-600'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>إنشاء حساب</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 text-right">
          {/* Feedback Messages */}
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
              <div className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {mode === 'login' ? (
            /* LOGIN FORM */
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  البريد الإلكتروني أو رقم الهاتف
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    placeholder="مثال: name@example.com أو 07701234567"
                    className="w-full text-xs border border-rose-200 rounded-xl px-3.5 py-2.5 pr-9 pl-3 text-right bg-rose-50/20 focus:bg-white outline-hidden focus:border-rose-400 focus:ring-2 focus:ring-rose-200 transition-all"
                  />
                  <Mail className="w-4 h-4 text-stone-400 absolute right-3 top-2.5 pointer-events-none" />
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
                    className="w-full text-xs border border-rose-200 rounded-xl px-3.5 py-2.5 pr-9 pl-9 text-right bg-rose-50/20 focus:bg-white outline-hidden focus:border-rose-400 focus:ring-2 focus:ring-rose-200 transition-all"
                  />
                  <Lock className="w-4 h-4 text-stone-400 absolute right-3 top-2.5 pointer-events-none" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-2.5 text-stone-400 hover:text-stone-600 cursor-pointer"
                    aria-label="إظهار أو إخفاء كلمة المرور"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-full bg-gradient-to-r from-rose-600 via-pink-600 to-rose-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold text-xs shadow-md shadow-rose-200 transition-all cursor-pointer flex items-center justify-center gap-2 hover:shadow-lg disabled:opacity-50"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>
                  {isSubmitting
                    ? 'جاري التحقق...'
                    : getBtnText('login', 'تسجيل الدخول')}
                </span>
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setErrorMessage('');
                    setSuccessMessage('');
                  }}
                  className="text-xs text-rose-600 font-bold hover:underline cursor-pointer"
                >
                  ليس لديك حساب؟ اضغط هنا لإنشاء حساب جديد
                </button>
              </div>
            </form>
          ) : (
            /* REGISTER FORM */
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  الاسم الكامل <span className="text-rose-600">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="مثال: مروان العراقي"
                    className="w-full text-xs border border-rose-200 rounded-xl px-3.5 py-2.5 pr-9 pl-3 text-right bg-rose-50/20 focus:bg-white outline-hidden focus:border-rose-400 focus:ring-2 focus:ring-rose-200 transition-all"
                  />
                  <User className="w-4 h-4 text-stone-400 absolute right-3 top-2.5 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  البريد الإلكتروني <span className="text-rose-600">*</span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full text-xs border border-rose-200 rounded-xl px-3.5 py-2.5 pr-9 pl-3 text-right bg-rose-50/20 focus:bg-white outline-hidden focus:border-rose-400 focus:ring-2 focus:ring-rose-200 transition-all"
                  />
                  <Mail className="w-4 h-4 text-stone-400 absolute right-3 top-2.5 pointer-events-none" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    رقم الهاتف <span className="text-stone-400 font-normal">(للتوصيل)</span>
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="07701234567"
                      className="w-full text-xs border border-rose-200 rounded-xl px-3.5 py-2.5 pr-9 pl-3 bg-rose-50/20 focus:bg-white outline-hidden focus:border-rose-400 focus:ring-2 focus:ring-rose-200 transition-all text-left"
                      dir="ltr"
                    />
                    <Phone className="w-4 h-4 text-stone-400 absolute right-3 top-2.5 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    المحافظة / المدينة
                  </label>
                  <div className="relative">
                    <select
                      value={regCity}
                      onChange={(e) => setRegCity(e.target.value)}
                      className="w-full text-xs border border-rose-200 rounded-xl px-3.5 py-2.5 pr-9 pl-3 text-right bg-rose-50/20 focus:bg-white outline-hidden focus:border-rose-400 focus:ring-2 focus:ring-rose-200 transition-all cursor-pointer"
                    >
                      {IRAQI_CITIES.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                    <MapPin className="w-4 h-4 text-stone-400 absolute right-3 top-2.5 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  كلمة المرور <span className="text-rose-600">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="كلمة مرور لا تقل عن 6 أحرف"
                    className="w-full text-xs border border-rose-200 rounded-xl px-3.5 py-2.5 pr-9 pl-9 text-right bg-rose-50/20 focus:bg-white outline-hidden focus:border-rose-400 focus:ring-2 focus:ring-rose-200 transition-all"
                  />
                  <Lock className="w-4 h-4 text-stone-400 absolute right-3 top-2.5 pointer-events-none" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-2.5 text-stone-400 hover:text-stone-600 cursor-pointer"
                    aria-label="إظهار أو إخفاء كلمة المرور"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-full bg-gradient-to-r from-rose-600 via-pink-600 to-rose-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold text-xs shadow-md shadow-rose-200 transition-all cursor-pointer flex items-center justify-center gap-2 hover:shadow-lg disabled:opacity-50"
              >
                <UserPlus className="w-3.5 h-3.5 text-white" />
                <span>
                  {isSubmitting
                    ? 'جاري الإنشاء...'
                    : 'إنشاء حساب الزبون'}
                </span>
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMessage('');
                    setSuccessMessage('');
                  }}
                  className="text-xs text-rose-600 font-bold hover:underline cursor-pointer"
                >
                  لديك حساب بالفعل؟ اضغط هنا لتسجيل الدخول
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
