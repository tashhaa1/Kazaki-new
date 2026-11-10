import { Order, StoreSettings } from '../types';

/**
 * Play a luxury audio chime for new orders using the Web Audio API.
 * Synthesizes clear, harmonic bells without requiring external MP3 files.
 */
let sharedAudioCtx: AudioContext | null = null;

export const getOrCreateAudioContext = (): AudioContext | null => {
  if (typeof window === 'undefined') return null;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return null;
    if (!sharedAudioCtx) {
      sharedAudioCtx = new AudioContextClass();
    }
    if (sharedAudioCtx && sharedAudioCtx.state === 'suspended') {
      sharedAudioCtx.resume().catch(() => {});
    }
    return sharedAudioCtx;
  } catch (err) {
    console.warn('AudioContext initialization bypassed safely:', err);
    return null;
  }
};

// Explicit audio unlock on user interaction
export const unlockAudio = (): void => {
  try {
    const ctx = getOrCreateAudioContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
  } catch {}
};

export const playNotificationChime = (): void => {
  try {
    const ctx = getOrCreateAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Harmonic bell tones: Note 1 (E5), Note 2 (G#5), Note 3 (B5)
    const notes = [
      { freq: 659.25, time: 0.0, duration: 0.8 },
      { freq: 830.61, time: 0.15, duration: 0.9 },
      { freq: 987.77, time: 0.3, duration: 1.2 },
    ];

    notes.forEach(({ freq, time, duration }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + time);

      // Attack and gentle exponential decay
      gain.gain.setValueAtTime(0.0001, now + time);
      gain.gain.exponentialRampToValueAtTime(0.3, now + time + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + time + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + time);
      osc.stop(now + time + duration);
    });
  } catch (err) {
    console.warn('Could not play notification sound:', err);
  }
};

/**
 * Play a dedicated melody for incoming customer support messages & chats
 */
export const playSupportMessageChime = (): void => {
  try {
    const ctx = getOrCreateAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Pleasant 2-note message ping (F#5 -> A#5)
    const notes = [
      { freq: 739.99, time: 0.0, duration: 0.4 },
      { freq: 932.33, time: 0.12, duration: 0.6 },
    ];

    notes.forEach(({ freq, time, duration }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + time);

      gain.gain.setValueAtTime(0.0001, now + time);
      gain.gain.exponentialRampToValueAtTime(0.25, now + time + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + time + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + time);
      osc.stop(now + time + duration);
    });
  } catch (err) {
    console.warn('Could not play support message sound:', err);
  }
};

/**
 * Check if browser notifications are supported (disabled by design: notifications are purely in-website)
 */
export const isNotificationSupported = (): boolean => {
  return false;
};

/**
 * Get notification permission state safely across all browsers
 */
export const getNotificationPermission = (): NotificationPermission | 'unsupported' => {
  return 'default';
};

/**
 * Request permission for native browser notifications safely (disabled by design).
 * Returns false so the browser never shows external permission popups.
 */
export const requestBrowserNotificationPermission = async (): Promise<boolean> => {
  return false;
};

/**
 * Show browser notification (disabled: notifications remain strictly inside the website).
 */
export const showBrowserNotification = (_title: string, _options?: NotificationOptions): boolean => {
  return false;
};

/**
 * Format order details into HTML message for Telegram.
 */
export const formatOrderForTelegram = (order: Order, storeName = 'KAZAKI.IQ'): string => {
  const itemsList = order.items
    .map(
      (item, idx) =>
        `  ${idx + 1}. <b>${item.product.title}</b> × ${item.quantity} (${(
          item.product.price * item.quantity
        ).toLocaleString('ar-IQ')} د.ع)`
    )
    .join('\n');

  const paymentText =
    order.paymentMethod === 'cod'
      ? 'الدفع عند الاستلام (COD)'
      : 'ماستركارد / مصرف الرافدين الإلكتروني';

  return `
<b>طلب جديد وارد في ${storeName}</b>
━━━━━━━━━━━━━━━━━━━━
<b>رقم الطلب:</b> <code>#${order.id}</code>
<b>رمز التتبع:</b> <code>${order.trackingNumber || order.id}</code>
<b>الزبون:</b> ${order.customerName}
<b>رقم الهاتف:</b> <code>${order.customerPhone}</code>
<b>المحافظة / المدينة:</b> ${order.city}
<b>العنوان التفصيلي:</b> ${order.address}
${order.notes ? `<b>ملاحظات الزبون:</b> ${order.notes}\n` : ''}━━━━━━━━━━━━━━━━━━━━
<b>المنتجات المطلوبة:</b>
${itemsList}

<b>مجموع المنتجات:</b> ${order.totalAmount.toLocaleString('ar-IQ')} د.ع
${order.discountAmount > 0 ? `<b>الخصم:</b> -${order.discountAmount.toLocaleString('ar-IQ')} د.ع\n` : ''}<b>أجور التوصيل:</b> ${order.shippingFee.toLocaleString('ar-IQ')} د.ع
<b>المبلغ النهائي المستحق:</b> <b>${order.finalAmount.toLocaleString('ar-IQ')} د.ع</b>
<b>طريقة الدفع:</b> ${paymentText}
<b>الوقت:</b> ${new Date(order.createdAt).toLocaleString('ar-IQ')}
━━━━━━━━━━━━━━━━━━━━
<i>إشعار مباشر من متجر KAZAKI</i>
`.trim();
};

/**
 * Send an order notification to Telegram Bot.
 */
export const sendTelegramOrderAlert = async (
  botToken: string,
  chatId: string,
  order: Order,
  storeName?: string
): Promise<{ success: boolean; message: string }> => {
  if (!botToken || !chatId) {
    return { success: false, message: 'بيانات خدمة إشعارات تيليجرام غير مكتملة (Token أو Chat ID).' };
  }

  const cleanToken = botToken.trim();
  const cleanChatId = chatId.trim();
  const text = formatOrderForTelegram(order, storeName);

  try {
    const url = `https://api.telegram.org/bot${cleanToken}/sendMessage`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: cleanChatId,
        text,
        parse_mode: 'HTML',
      }),
    });

    const result = await response.json();
    if (result.ok) {
      return { success: true, message: 'تم إرسال إشعار الطلب إلى تيليجرام بنجاح!' };
    } else {
      return { success: false, message: result.description || 'فشل إرسال إشعار تيليجرام.' };
    }
  } catch (error: any) {
    console.error('Telegram notification error:', error);
    return { success: false, message: error.message || 'خطأ في الاتصال بسيرفر تيليجرام.' };
  }
};

/**
 * Test Telegram connection by sending a welcome test message.
 */
export const testTelegramBot = async (
  botToken: string,
  chatId: string,
  storeName = 'KAZAKI.IQ'
): Promise<{ success: boolean; message: string }> => {
  if (!botToken || !chatId) {
    return { success: false, message: 'يرجى إدخال Token و Chat ID أولاً.' };
  }

  const cleanToken = botToken.trim();
  const cleanChatId = chatId.trim();

  const text = `
<b>تم اختبار الاتصال بنجاح</b>
━━━━━━━━━━━━━━━━━━━━
مرحباً بك! خدمة إشعارات متجر <b>${storeName}</b> متصلة بحسابك وجاهزة الآن.
ستصلك رسالة فورية مع كل طلب جديد يتضمن:
• اسم الزبون ورقم هاتفه
• العنوان والمحافظة
• تفاصيل المنتجات والأسعار
• المبلغ الإجمالي وطريقة الدفع

<b>وقت الاختبار:</b> ${new Date().toLocaleTimeString('ar-IQ')}
━━━━━━━━━━━━━━━━━━━━
`.trim();

  try {
    const url = `https://api.telegram.org/bot${cleanToken}/sendMessage`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: cleanChatId,
        text,
        parse_mode: 'HTML',
      }),
    });

    const result = await response.json();
    if (result.ok) {
      return { success: true, message: 'وصلتك رسالة التجربة على تيليجرام الآن! الاتصال يعمل بنجاح تام.' };
    } else {
      return { success: false, message: `تيليجرام رفض الطلب: ${result.description}` };
    }
  } catch (error: any) {
    return { success: false, message: `فشل الاتصال بتيليجرام: ${error.message}` };
  }
};

/**
 * Dispatch all active notifications for a new order.
 */
export const notifyStoreOwnerOfNewOrder = async (
  order: Order,
  settings: StoreSettings
): Promise<void> => {
  const notifConfig = settings.notificationSettings;

  // 1. Play bell audio chime (unconditionally to ensure manager hears every incoming order)
  playNotificationChime();

  // 2. Trigger tactile vibration on mobile
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate([200, 100, 200]);
    } catch {}
  }

  // 3. Send Telegram Alert if configured
  if (
    notifConfig?.enableTelegram &&
    notifConfig.telegramBotToken &&
    notifConfig.telegramChatId
  ) {
    sendTelegramOrderAlert(
      notifConfig.telegramBotToken,
      notifConfig.telegramChatId,
      order,
      settings.storeName
    ).catch((err) => console.warn('Telegram notification background error:', err));
  }
};
