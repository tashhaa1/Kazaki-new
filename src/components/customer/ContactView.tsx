import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  Phone,
  Mail,
  Clock,
  Send,
  CheckCircle2,
  Instagram,
  Heart,
  Truck,
  CreditCard,
  MessageCircle,
  ShieldAlert,
  Headphones,
  Edit2,
  ExternalLink,
  MessageSquare,
  Banknote,
  Video,
  Trash2,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { checkClickAllowed, checkRateLimit } from '../../utils/antiSpam';
import { defaultCustomerServiceChannels } from '../../data/initialData';
import { CustomerServiceChannel } from '../../types';

export const ContactView: React.FC = () => {
  const {
    settings,
    sendSupportMessage,
    currentUser,
    getBtnText,
    setActiveView,
    activeCustomerChat,
    sendTempChatMessage,
    endTempChat,
  } = useStore();

  // Temporary Live Chat state (24-Hour session)
  const [liveChatMsg, setLiveChatMsg] = useState('');
  const [isSendingLiveMsg, setIsSendingLiveMsg] = useState(false);
  const [startChatForm, setStartChatForm] = useState({
    name: currentUser?.name || '',
    phone: currentUser?.phone || '',
    email: currentUser?.email || '',
    initialMessage: '',
  });
  const [isStartingChat, setIsStartingChat] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [chatTimeRemaining, setChatTimeRemaining] = useState<string>('');
  const [confirmEndModal, setConfirmEndModal] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeCustomerChat?.messages?.length) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeCustomerChat?.messages?.length]);

  useEffect(() => {
    const calculateTimeRemaining = () => {
      if (!activeCustomerChat?.expiresAt) {
        setChatTimeRemaining('');
        return;
      }
      const diff = new Date(activeCustomerChat.expiresAt).getTime() - Date.now();
      if (diff <= 0) {
        setChatTimeRemaining('انتهت مدة الجلسة (24 ساعة)');
        return;
      }
      const totalMinutes = Math.floor(diff / 60000);
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      if (hours > 0) {
        setChatTimeRemaining(`${hours} ساعة و ${minutes} دقيقة متبقية`);
      } else {
        setChatTimeRemaining(`${minutes} دقيقة متبقية`);
      }
    };

    calculateTimeRemaining();
    const timer = setInterval(calculateTimeRemaining, 10000);
    return () => clearInterval(timer);
  }, [activeCustomerChat?.expiresAt]);

  const handleStartChat = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!startChatForm.name.trim() || !startChatForm.initialMessage.trim() || isStartingChat) return;

    if (!checkClickAllowed('start_temp_chat', 1500, false)) return;

    setIsStartingChat(true);
    setChatError(null);
    const res = await sendTempChatMessage(startChatForm.initialMessage.trim(), {
      name: startChatForm.name.trim(),
      phone: startChatForm.phone.trim(),
      email: startChatForm.email.trim(),
    });
    setIsStartingChat(false);
    if (!res.success) {
      setChatError(res.message || 'تعذر بدء المحادثة');
    } else {
      setStartChatForm((prev) => ({ ...prev, initialMessage: '' }));
    }
  };

  const handleSendLiveMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!liveChatMsg.trim() || isSendingLiveMsg) return;

    if (!checkClickAllowed('send_live_chat_msg', 800, false)) return;

    const textToSend = liveChatMsg.trim();
    setLiveChatMsg('');
    setIsSendingLiveMsg(true);
    setChatError(null);
    const res = await sendTempChatMessage(textToSend);
    setIsSendingLiveMsg(false);
    if (!res.success) {
      setChatError(res.message || 'تعذر إرسال الرسالة');
      setLiveChatMsg(textToSend);
    }
  };

  const handleEndChat = () => {
    endTempChat();
    setConfirmEndModal(false);
  };

  const quickQuestions = [
    'استفسار عن موعد وطريقة التوصيل لعنواني',
    'هل الدفع عند الاستلام متاح في محافظتي؟',
    'أريد التأكد من توفر مقاس أو لون معين لمنتج',
    'متابعة تفاصيل وحالة طلب أرسلته سابقاً',
  ];

  const [form, setForm] = useState({
    name: currentUser?.name || '',
    phone: currentUser?.phone || '',
    email: currentUser?.email || '',
    subject: '',
    message: '',
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [spamMsg, setSpamMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message || isSending) return;

    // Anti-spam debounce
    if (!checkClickAllowed('contact_form_submit', 2000, false)) {
      setSpamMsg('تم استلام طلبكِ وجاري إرسال الرسالة! يرجى عدم تكرار الضغط.');
      setTimeout(() => setSpamMsg(null), 4000);
      return;
    }

    // Rate limit: max 2 messages per minute
    const rateCheck = checkRateLimit('contact_submission', 2, 60000, 30000);
    if (!rateCheck.allowed) {
      setSpamMsg(rateCheck.message || 'تم حظر المحاولات المتكررة مؤقتاً لحماية النظام. يرجى الانتظار.');
      setTimeout(() => setSpamMsg(null), 5000);
      return;
    }

    setIsSending(true);
    setSpamMsg(null);

    sendSupportMessage({
      customerName: form.name,
      customerPhone: form.phone,
      customerEmail: form.email,
      subject: form.subject || 'استفسار عام',
      message: form.message,
    });

    setTimeout(() => {
      setIsSending(false);
      setIsSubmitted(true);
      setForm({
        name: currentUser?.name || '',
        phone: currentUser?.phone || '',
        email: currentUser?.email || '',
        subject: '',
        message: '',
      });

      setTimeout(() => {
        setIsSubmitted(false);
      }, 6000);
    }, 600);
  };

  const isEnabled = settings.contactInfo?.enabled !== false;
  const rawChannels = settings.contactInfo?.channels && settings.contactInfo.channels.length > 0
    ? settings.contactInfo.channels
    : defaultCustomerServiceChannels;

  // Filter only enabled channels
  const activeChannels = rawChannels.filter((c) => c.enabled !== false);

  const renderChannelAction = (channel: CustomerServiceChannel) => {
    const val = channel.value || '';
    if (channel.type === 'whatsapp') {
      const clean = val.replace(/[^0-9]/g, '');
      return (
        <a
          href={`https://wa.me/${clean}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-bold transition-colors w-full justify-center"
        >
          <MessageCircle className="w-4 h-4 text-emerald-600" />
          <span>محادثة واتساب فورية ({val})</span>
        </a>
      );
    }
    if (channel.type === 'phone') {
      return (
        <a
          href={`tel:${val}`}
          dir="ltr"
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-bold transition-colors w-full justify-center"
        >
          <Phone className="w-4 h-4 text-rose-600" />
          <span>{val}</span>
        </a>
      );
    }
    if (channel.type === 'email') {
      return (
        <a
          href={`mailto:${val}`}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-pink-50 text-pink-700 hover:bg-pink-100 text-xs font-bold transition-colors w-full justify-center truncate"
        >
          <Mail className="w-4 h-4 text-pink-600 shrink-0" />
          <span className="truncate">{val}</span>
        </a>
      );
    }
    if (channel.type === 'instagram') {
      const link = val.startsWith('http') ? val : `https://instagram.com/${val.replace('@', '')}`;
      return (
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-pink-50 to-rose-50 text-pink-800 hover:bg-pink-100 text-xs font-bold transition-colors w-full justify-center"
        >
          <Instagram className="w-4 h-4 text-pink-600" />
          <span>متابعة انستغرام ({val.includes('instagram.com') ? '@kazaki.iq' : val})</span>
        </a>
      );
    }
    if (channel.type === 'tiktok') {
      const link = val.startsWith('http') ? val : `https://tiktok.com/@${val.replace('@', '')}`;
      return (
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-stone-100 text-stone-800 hover:bg-stone-200 text-xs font-bold transition-colors w-full justify-center"
        >
          <Video className="w-4 h-4 text-stone-700" />
          <span>حساب تيك توك الرسمي</span>
        </a>
      );
    }
    // telegram or custom
    const customLink = val.startsWith('http') ? val : `https://${val}`;
    return (
      <a
        href={customLink}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold transition-colors w-full justify-center"
      >
        <ExternalLink className="w-4 h-4 text-blue-600" />
        <span>زيارة الرابط / التواصل</span>
      </a>
    );
  };

  const getChannelIcon = (type: CustomerServiceChannel['type']) => {
    switch (type) {
      case 'whatsapp':
        return <MessageCircle className="w-6 h-6 text-emerald-600" />;
      case 'phone':
        return <Phone className="w-6 h-6 text-rose-600" />;
      case 'email':
        return <Mail className="w-6 h-6 text-pink-600" />;
      case 'instagram':
        return <Instagram className="w-6 h-6 text-pink-600" />;
      case 'tiktok':
        return <Video className="w-6 h-6 text-stone-700" />;
      case 'telegram':
        return <Send className="w-6 h-6 text-sky-600" />;
      default:
        return <Headphones className="w-6 h-6 text-rose-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-rose-50/20 py-12 px-4 sm:px-6 lg:px-8 text-right" dir="rtl">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Admin Quick Control Banner */}
        {currentUser?.role === 'admin' && (
          <div className="bg-gradient-to-r from-stone-900 to-stone-800 text-white rounded-2xl p-4 px-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg border border-stone-700">
            <div className="flex items-center gap-3 text-right">
              <div className="p-2 rounded-xl bg-amber-400/20 text-amber-300">
                <Headphones className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-amber-300">
                  لوحة تحكم المدير: حذف وتعديل وسائل وقنوات خدمة العملاء
                </h4>
                <p className="text-[11px] text-stone-300">
                  يمكنكِ إضافة، تعديل أرقام الهواتف أو الواتساب، أو حذف أي وسيلة تواصل أو إخفاء خدمة العملاء بالكامل.
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveView('admin')}
              className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-900 text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>إدارة وتعديل خدمة العملاء</span>
            </button>
          </div>
        )}

        {/* Global disabled banner if admin hid customer service */}
        {!isEnabled ? (
          <div className="bg-white rounded-3xl p-10 border border-rose-200 text-center space-y-4 shadow-sm">
            <div className="w-16 h-16 mx-auto rounded-full bg-rose-50 text-rose-500 flex items-center justify-center">
              <Headphones className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-stone-900">
              خدمة العملاء متوقفة مؤقتاً للتحديث
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto">
              تم إخفاء أو تعطيل قنوات خدمة العملاء مؤقتاً من قبل الإدارة. يمكنكم متابعة واستعراض الطلبات مباشرة من قسم التتبع.
            </p>
            {currentUser?.role === 'admin' && (
              <button
                onClick={() => setActiveView('admin')}
                className="px-6 py-2.5 rounded-full bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 transition-colors"
              >
                إعادة تفعيل خدمة العملاء من لوحة التحكم
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Header Section */}
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-100 text-rose-700 text-xs font-bold">
                <Heart className="w-3.5 h-3.5 fill-rose-500" />
                <span>خدمة العملاء والتواصل المباشر</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-stone-900 tracking-tight">
                {settings.contactInfo?.title || 'مركز خدمة عملاء KAZAKI.IQ'}
              </h1>
              <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
                {settings.contactInfo?.subtitle || 'نحن هنا للإجابة على استفساراتكِ ومساعدتكِ في كل خطوة لتجربة تسوق راقية تليق بكِ.'}
              </p>
            </div>

            {/* 24-HOUR TEMPORARY LIVE CHAT SCREEN */}
            <div className="bg-white rounded-3xl border border-rose-200/80 shadow-xl overflow-hidden transition-all">
              {/* Top Banner / Header */}
              <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-rose-950 text-white p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-2xl bg-rose-600/30 border border-rose-500/40 flex items-center justify-center text-rose-300">
                      <MessageSquare className="w-6 h-6" />
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-stone-900"></span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base sm:text-lg font-black text-white">
                        شاشة المحادثة المباشرة المؤقتة مع الإدارة
                      </h2>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        محادثة صالحة لمدة 24 ساعة
                      </span>
                    </div>
                    <p className="text-xs text-stone-300 mt-0.5">
                      جلسة محادثة مباشرة وفورية مع إدارة المتجر تُحفظ وتستمر لمدة 24 ساعة فقط.
                    </p>
                  </div>
                </div>

                {/* Left countdown & actions */}
                <div className="flex items-center gap-3">
                  {activeCustomerChat ? (
                    <div className="flex items-center gap-2.5">
                      <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-500/20 border border-rose-400/30 text-rose-200 text-xs font-bold">
                        <Clock className="w-4 h-4 text-rose-400 shrink-0" />
                        <span>{chatTimeRemaining || '24 ساعة'}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setConfirmEndModal(true)}
                        className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white border border-stone-700 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                        title="إنهاء هذه المحادثة"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-stone-400" />
                        <span>إنهاء</span>
                      </button>
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-400/20 border border-amber-300/30 text-amber-200 text-xs font-bold">
                      <Clock className="w-4 h-4 text-amber-300 shrink-0" />
                      <span>المدة: 24 ساعة من أول رسالة</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Body: Active Chat Session vs New Chat Launcher */}
              {activeCustomerChat ? (
                <div className="p-4 sm:p-6 space-y-4">
                  {/* Messages Feed */}
                  <div className="h-80 sm:h-96 overflow-y-auto space-y-3 p-4 bg-stone-50 rounded-2xl border border-stone-200/70">
                    {/* Welcome banner */}
                    <div className="p-3 rounded-xl bg-rose-100/60 border border-rose-200/80 text-rose-900 text-xs leading-relaxed flex items-start gap-2.5">
                      <Sparkles className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold">
                          بدأت المحادثة المباشرة المؤقتة بنجاح
                        </span>
                        <p className="text-[11px] text-rose-700 mt-0.5">
                          أهلاً بكِ! هذه المحادثة الفورية مع إدارة KAZAKI.IQ نشطة لمدة 24 ساعة. ردود الإدارة ستصلكِ هنا مباشرة.
                        </p>
                      </div>
                    </div>

                    {/* Chat Messages */}
                    {activeCustomerChat.messages.map((msg) => {
                      const isCustomer = msg.sender === 'customer';
                      return (
                        <div
                          key={msg.id}
                          className={`flex flex-col ${isCustomer ? 'items-end' : 'items-start'}`}
                        >
                          <div className="flex items-center gap-1.5 mb-1 px-1">
                            <span className="text-[10px] font-bold text-stone-500">
                              {isCustomer ? msg.senderName || 'أنتِ' : 'إدارة KAZAKI.IQ'}
                            </span>
                            <span className="text-[9px] text-stone-400">
                              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>

                          <div
                            className={`max-w-[85%] sm:max-w-[75%] p-3.5 rounded-2xl text-xs leading-relaxed font-medium shadow-2xs ${
                              isCustomer
                                ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white rounded-tr-xs'
                                : 'bg-white border border-stone-200 text-stone-800 rounded-tl-xs'
                            }`}
                          >
                            <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                          </div>
                        </div>
                      );
                    })}

                    <div ref={messagesEndRef} />
                  </div>

                  {/* Quick question suggestions */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                      أسئلة واستفسارات شائعة وسريعة:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {quickQuestions.map((q, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setLiveChatMsg(q)}
                          className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-rose-50 hover:text-rose-700 text-stone-600 text-[11px] font-medium transition-colors border border-stone-200/80 cursor-pointer"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Chat Error alert */}
                  {chatError && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>{chatError}</span>
                    </div>
                  )}

                  {/* Live Message Input */}
                  <form onSubmit={handleSendLiveMessage} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={liveChatMsg}
                      onChange={(e) => setLiveChatMsg(e.target.value)}
                      placeholder="اكتبي استفساركِ المباشر للإدارة هنا..."
                      className="flex-1 text-xs border border-stone-300 rounded-xl px-4 py-3 bg-white focus:outline-hidden focus:border-rose-500 shadow-2xs"
                    />
                    <button
                      type="submit"
                      disabled={isSendingLiveMsg || !liveChatMsg.trim()}
                      className="px-5 py-3 rounded-xl bg-gradient-to-r from-rose-600 to-pink-500 hover:from-rose-500 hover:to-pink-600 text-white font-bold text-xs shadow-md shadow-rose-200 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shrink-0"
                    >
                      <Send className={`w-4 h-4 ${isSendingLiveMsg ? 'animate-pulse' : ''} rotate-180`} />
                      <span>{isSendingLiveMsg ? 'جاري الإرسال...' : 'إرسال'}</span>
                    </button>
                  </form>
                </div>
              ) : (
                /* No Active Session - Start 24h Chat Form */
                <div className="p-6 sm:p-8 space-y-6">
                  <div className="max-w-xl space-y-2">
                    <h3 className="text-base sm:text-lg font-bold text-stone-900">
                      ابدأي جلسة محادثة مباشرة مؤقتة (24 ساعة)
                    </h3>
                    <p className="text-xs text-stone-500 leading-relaxed">
                      تواصلي مباشرة مع فريق إدارة المتجر من داخل الموقع. تبقى جلستكِ مفتوحة ومحفوظة لمدة 24 ساعة لتلقي الردود والمتابعة المباشرة لجميع استفساراتكِ.
                    </p>
                  </div>

                  {/* Chat Error alert */}
                  {chatError && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>{chatError}</span>
                    </div>
                  )}

                  <form onSubmit={handleStartChat} className="space-y-4 max-w-2xl">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">
                          الاسم الكريم <span className="text-rose-600">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={startChatForm.name}
                          onChange={(e) => setStartChatForm({ ...startChatForm, name: e.target.value })}
                          placeholder="مثال: سارة"
                          className="w-full text-xs border border-stone-200 rounded-xl px-3.5 py-2.5 bg-stone-50/50 focus:bg-white outline-hidden focus:border-rose-400"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">
                          رقم الهاتف أو واتساب (اختياري)
                        </label>
                        <input
                          type="tel"
                          dir="ltr"
                          value={startChatForm.phone}
                          onChange={(e) => setStartChatForm({ ...startChatForm, phone: e.target.value })}
                          placeholder="+964 770 123 4567"
                          className="w-full text-xs text-right border border-stone-200 rounded-xl px-3.5 py-2.5 bg-stone-50/50 focus:bg-white outline-hidden focus:border-rose-400"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        استفساركِ أو رسالتكِ الأولى للإدارة <span className="text-rose-600">*</span>
                      </label>
                      <textarea
                        rows={3}
                        required
                        value={startChatForm.initialMessage}
                        onChange={(e) => setStartChatForm({ ...startChatForm, initialMessage: e.target.value })}
                        placeholder="اكتبي استفساركِ هنا لبدء شاشة المحادثة المباشرة المؤقتة مع الإدارة..."
                        className="w-full text-xs border border-stone-200 rounded-xl px-3.5 py-2.5 bg-stone-50/50 focus:bg-white outline-hidden focus:border-rose-400"
                      />
                    </div>

                    {/* Quick chips to fill initialMessage */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                        أو اختاري استفساراً سريعاً:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {quickQuestions.map((q, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setStartChatForm({ ...startChatForm, initialMessage: q })}
                            className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-rose-50 hover:text-rose-700 text-stone-600 text-[11px] font-medium transition-colors border border-stone-200 cursor-pointer"
                          >
                            {q}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={isStartingChat || !startChatForm.name.trim() || !startChatForm.initialMessage.trim()}
                        className="px-6 py-3 rounded-full bg-gradient-to-r from-rose-600 to-pink-500 hover:from-rose-500 hover:to-pink-600 text-white font-bold text-xs shadow-md shadow-rose-200 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>
                          {isStartingChat ? 'جاري فتح جلسة المحادثة...' : 'بدء المحادثة المباشرة (24 ساعة)'}
                        </span>
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>

            {/* Confirm End Chat Modal */}
            {confirmEndModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
                <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl border border-stone-200 text-center">
                  <div className="w-12 h-12 mx-auto rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
                    <Trash2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-stone-900">
                      إنهاء جلسة المحادثة المؤقتة؟
                    </h4>
                    <p className="text-xs text-stone-500 mt-1">
                      سيتم إغلاق هذه المحادثة وحذف الجلسة المؤقتة. يمكنكِ دائماً بدء محادثة جديدة في أي وقت.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 justify-center pt-2">
                    <button
                      type="button"
                      onClick={() => setConfirmEndModal(false)}
                      className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition-colors cursor-pointer"
                    >
                      إلغاء
                    </button>
                    <button
                      type="button"
                      onClick={handleEndChat}
                      className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors cursor-pointer"
                    >
                      نعم، إنهاء المحادثة
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Dynamic Channels Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeChannels.map((channel) => (
                <div
                  key={channel.id}
                  className="bg-white rounded-3xl p-6 border border-rose-100 shadow-2xs hover:shadow-md transition-shadow space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center">
                      {getChannelIcon(channel.type)}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-stone-900 mb-1">
                        {channel.name}
                      </h3>
                      {channel.subtitle && (
                        <p className="text-xs text-stone-500 leading-relaxed mb-3">
                          {channel.subtitle}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="pt-2">
                    {renderChannelAction(channel)}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Accepted Payment Methods Banner */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-rose-100 shadow-2xs">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center sm:text-right">
              <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">
                طرق الدفع المعتمدة في KAZAKI.IQ
              </span>
              <h3 className="text-lg font-bold text-stone-900">
                تسوق آمن وموثوق مع خيارات دفع متعددة في العراق
              </h3>
              <p className="text-xs text-stone-500">
                الدفع محصور حصرياً بالدفع عند الاستلام وبطاقات ماستركارد مصرف الرافدين لضمان أعلى مستويات الأمان.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900">
                <Truck className="w-5 h-5 text-emerald-600" />
                <div>
                  <span className="text-xs font-bold flex items-center gap-1.5">
                    <Banknote className="w-4 h-4 text-emerald-600" />
                    <span>الدفع عند الاستلام (COD)</span>
                  </span>
                  <span className="text-[10px] text-emerald-700">
                    لكافة محافظات العراق
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900">
                <CreditCard className="w-5 h-5 text-amber-600" />
                <div>
                  <span className="text-xs font-bold flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-amber-600" />
                    <span>Mastercard – مصرف الرافدين</span>
                  </span>
                  <span className="text-[10px] text-amber-700">
                    دفع إلكتروني فوري وآمن
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form & Customer Service Message */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-rose-100 shadow-xl relative overflow-hidden">
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-xl sm:text-2xl font-black text-stone-900">
                أرسلي رسالة أو استفسار لفريقنا
              </h2>
              <p className="text-xs text-stone-500 leading-relaxed">
                {settings.contactInfo?.customerServiceNote || 'فريق الدعم الفني متواجد للإجابة على استفساراتكم ومتابعة طلباتكم بكل اهتمام.'}
              </p>
            </div>

            {spamMsg && (
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 text-xs font-bold flex items-center gap-2.5 animate-in fade-in">
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{spamMsg}</span>
              </div>
            )}

            {isSubmitted && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-3 animate-in fade-in">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>
                  تم إرسال رسالتكِ بنجاح! سيقوم فريق خدمة عملاء KAZAKI.IQ بالرد عليكِ في أقرب وقت.
                </span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    الاسم الكريم <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="سارة علي"
                    className="w-full text-xs border border-rose-200 rounded-xl px-3.5 py-2.5 bg-rose-50/20 focus:bg-white outline-hidden focus:border-rose-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    رقم الهاتف / واتساب
                  </label>
                  <input
                    type="tel"
                    dir="ltr"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+964 770 123 4567"
                    className="w-full text-xs text-right border border-rose-200 rounded-xl px-3.5 py-2.5 bg-rose-50/20 focus:bg-white outline-hidden focus:border-rose-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    البريد الإلكتروني <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="sara@example.com"
                    className="w-full text-xs border border-rose-200 rounded-xl px-3.5 py-2.5 bg-rose-50/20 focus:bg-white outline-hidden focus:border-rose-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    موضوع الرسالة
                  </label>
                  <input
                    type="text"
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    placeholder="استفسار عن توفر منتج أو موعد الشحن"
                    className="w-full text-xs border border-rose-200 rounded-xl px-3.5 py-2.5 bg-rose-50/20 focus:bg-white outline-hidden focus:border-rose-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  نص الرسالة أو الاستفسار <span className="text-rose-600">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="اكتبي تفاصيل استفساركِ هنا، ويسعدنا تقديم المساعدة فوراً..."
                  className="w-full text-xs border border-rose-200 rounded-xl px-3.5 py-2.5 bg-rose-50/20 focus:bg-white outline-hidden focus:border-rose-400"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isSending}
                  className="px-8 py-3 rounded-full bg-gradient-to-r from-rose-600 to-pink-500 hover:from-rose-500 hover:to-pink-600 text-white font-bold text-xs shadow-md shadow-rose-300 hover:shadow-lg transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
                >
                  <Send className={`w-4 h-4 ${isSending ? 'animate-pulse' : ''} rotate-180`} />
                  <span>
                    {isSending
                      ? 'جاري الإرسال بأمان...'
                      : getBtnText('sendMessage', 'إرسال الرسالة إلى خدمة العملاء')}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
