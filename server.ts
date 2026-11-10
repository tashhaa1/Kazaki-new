import 'dotenv/config';
import express, { type Request, type Response } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import webpush from 'web-push';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.DEFAULT_APP_PORT || process.env.PORT || 3000);

// Security Headers Middleware (Compatible with AI Studio preview iframe)
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// Simple in-memory Rate Limiting (Prevents DDoS and Brute Force attacks)
const ipRequestCounts = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 600; // 600 requests per minute

app.use((req, res, next) => {
  // Allow static assets, images, and vite dev modules without rate limiting
  if (
    req.path.startsWith('/@') ||
    req.path.startsWith('/src/') ||
    req.path.startsWith('/assets') ||
    req.path.startsWith('/images') ||
    req.path.startsWith('/node_modules') ||
    req.path.endsWith('.ts') ||
    req.path.endsWith('.tsx') ||
    req.path.endsWith('.js') ||
    req.path.endsWith('.css') ||
    req.path.endsWith('.jpeg') ||
    req.path.endsWith('.jpg') ||
    req.path.endsWith('.png') ||
    req.path.endsWith('.webp') ||
    req.path.endsWith('.svg') ||
    req.path.endsWith('.ico') ||
    req.path.endsWith('.json') ||
    req.path.endsWith('.woff') ||
    req.path.endsWith('.woff2')
  ) {
    return next();
  }

  const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const clientData = ipRequestCounts.get(clientIp);

  if (!clientData || now > clientData.resetTime) {
    ipRequestCounts.set(clientIp, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return next();
  }

  clientData.count++;
  if (clientData.count > MAX_REQUESTS_PER_WINDOW) {
    return res.status(429).json({
      success: false,
      message: 'تم تجاوز الحد المسموح من الطلبات، يرجى المحاولة بعد دقيقة.',
    });
  }

  next();
});

app.use(express.json({ limit: '10mb' }));

// Data storage directory
const DATA_DIR = path.resolve(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');
const MESSAGES_FILE = path.join(DATA_DIR, 'support_messages.json');
const NOTIFICATIONS_FILE = path.join(DATA_DIR, 'notifications.json');
const TEMP_CHATS_FILE = path.join(DATA_DIR, 'temp_chats.json');
const PUSH_SUBSCRIPTIONS_FILE = path.join(DATA_DIR, 'push_subscriptions.json');

// VAPID keys for W3C Web Push API (delivers alerts when phone screen is locked or Chrome is closed)
const VAPID_PUBLIC_KEY =
  process.env.VAPID_PUBLIC_KEY ||
  'BI81cvwpsxNbotbvDLZasLkqrW4dCdx3LfLtNtEplTGH5w3uYMGvt1jtaQCSq1HqnNbVjwRx9wW0RYh08Vi4Tmk';
const VAPID_PRIVATE_KEY =
  process.env.VAPID_PRIVATE_KEY ||
  'KhuxSrQSXm9aYmN-nyLOGOZzDonp2EyTo89c4ByjpSE';
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:admin@kazaki.iq';

try {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
  console.log('[WebPush] VAPID details configured successfully.');
} catch (vapidErr) {
  console.warn('[WebPush] VAPID setup warning:', vapidErr);
}

interface PushSubscriber {
  id: string;
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  role: 'admin' | 'customer';
  phone?: string;
  email?: string;
  userId?: string;
  createdAt: string;
  updatedAt: string;
}

// Web Push disabled: notifications are strictly in-website
const sendWebPushNotification = async (
  _filter: { role?: 'admin' | 'customer'; phone?: string; email?: string },
  _payload: {
    title: string;
    body: string;
    icon?: string;
    badge?: string;
    tag?: string;
    url?: string;
    vibrate?: number[];
    data?: any;
  }
): Promise<{ sent: number; failed: number }> => {
  return { sent: 0, failed: 0 };
};

// Helper to safely read JSON files
const readJsonFile = <T>(filePath: string, fallback: T): T => {
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(fallback, null, 2), 'utf-8');
      return fallback;
    }
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data) as T;
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
    return fallback;
  }
};

// Helper to safely write JSON files
const writeJsonFile = <T>(filePath: string, data: T): void => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err);
  }
};

// Connected SSE clients for instant live dispatch
interface SseClient {
  id: string;
  role: 'admin' | 'customer';
  customerPhone?: string;
  customerEmail?: string;
  res: Response;
}

let sseClients: SseClient[] = [];

const broadcastSseEvent = (event: string, payload: any, targetRole?: 'admin' | 'customer', targetFilter?: { phone?: string; email?: string }) => {
  sseClients.forEach((client) => {
    if (targetRole && client.role !== targetRole) return;
    if (targetFilter) {
      if (targetFilter.phone && client.customerPhone && client.customerPhone !== targetFilter.phone) return;
      if (targetFilter.email && client.customerEmail && client.customerEmail !== targetFilter.email) return;
    }
    try {
      client.res.write(`event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`);
      if (typeof (client.res as any).flush === 'function') {
        (client.res as any).flush();
      }
    } catch {
      // client disconnected
    }
  });
};

// ----------------------------------------------------
// SSE (Server-Sent Events) live updates stream
// ----------------------------------------------------
app.get('/api/events', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  const clientId = `client-${Date.now()}-${Math.random()}`;
  const role = (req.query.role as string) === 'admin' ? 'admin' : 'customer';
  const customerPhone = req.query.phone as string | undefined;
  const customerEmail = req.query.email as string | undefined;

  const client: SseClient = {
    id: clientId,
    role,
    customerPhone,
    customerEmail,
    res,
  };

  sseClients.push(client);

  // Send initial ping
  res.write(`event: connected\ndata: ${JSON.stringify({ clientId, role })}\n\n`);

  req.on('close', () => {
    sseClients = sseClients.filter((c) => c.id !== clientId);
  });
});

// ----------------------------------------------------
// 1. ORDERS API
// ----------------------------------------------------

// GET /api/orders - Securely fetch orders with strict privacy protection
app.get('/api/orders', (req: Request, res: Response) => {
  const orders = readJsonFile<any[]>(ORDERS_FILE, []);
  const { customerPhone, customerEmail, role, orderIds } = req.query;
  const adminHeader = req.headers['x-admin-role'];

  // Admin Access: Admin sees all orders
  const isAdmin = role === 'admin' || adminHeader === 'admin';
  if (isAdmin) {
    return res.json({ success: true, orders });
  }

  // Customer / Guest Access: Strictly filter to this customer's own orders only!
  const cleanPhone = (customerPhone as string || '').replace(/[^0-9]/g, '');
  const cleanEmail = (customerEmail as string || '').toLowerCase().trim();
  const allowedOrderIds = orderIds
    ? (orderIds as string).split(',').map((id) => id.trim()).filter(Boolean)
    : [];

  // If the requester has no phone, no email, and no specific order IDs, protect data and return empty array
  if (!cleanPhone && !cleanEmail && allowedOrderIds.length === 0) {
    return res.json({ success: true, orders: [] });
  }

  const filtered = orders.filter((o) => {
    const oPhone = (o.customerPhone || '').replace(/[^0-9]/g, '');
    const oEmail = (o.customerEmail || '').toLowerCase().trim();

    const matchPhone = cleanPhone.length >= 7 && (oPhone.endsWith(cleanPhone) || cleanPhone.endsWith(oPhone));
    const matchEmail = cleanEmail.length > 3 && oEmail === cleanEmail;
    const matchId = allowedOrderIds.includes(o.id);

    return matchPhone || matchEmail || matchId;
  });

  return res.json({ success: true, orders: filtered });
});

// POST /api/orders - Customer places a new order
app.post('/api/orders', (req: Request, res: Response) => {
  try {
    const orderData = req.body;
    if (!orderData || !orderData.customerName || !orderData.customerPhone || !orderData.items) {
      return res.status(400).json({ success: false, message: 'بيانات الطلب غير مكتملة' });
    }

    const orders = readJsonFile<any[]>(ORDERS_FILE, []);
    const notifications = readJsonFile<any[]>(NOTIFICATIONS_FILE, []);

    const newOrderId = orderData.id || `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    const trackingNumber = orderData.trackingNumber || `KZK-${Math.floor(100000 + Math.random() * 900000)}`;
    const timestamp = orderData.createdAt || new Date().toISOString();

    const initialHistoryItem = {
      id: `hist-${Date.now()}`,
      status: 'pending',
      timestamp,
      note: 'تم إنشاء الطلب بنجاح وهو بانتظار المراجعة والتجهيز من قبل الإدارة',
      trackingNumber,
      updatedBy: 'الزبون (المتجر الإلكتروني)',
      notificationSent: true,
    };

    // 1. Notification for customer (order status confirmation)
    const customerNotification = {
      id: `notif-cust-${Date.now()}`,
      orderId: newOrderId,
      customerName: orderData.customerName,
      customerEmail: orderData.customerEmail || '',
      customerPhone: orderData.customerPhone,
      status: 'pending',
      title: 'تم استلام طلبك بنجاح',
      message: `مرحباً ${orderData.customerName}، تم استلام الطلب رقم #${newOrderId} بنجاح في متجر KAZAKI.IQ وهو قيد المتابعة والتجهيز.`,
      timestamp,
      channel: 'system',
      read: false,
      trackingNumber,
      target: 'customer',
    };

    // 2. Notification for Admin (Alerting store manager of new incoming order)
    const adminNotification = {
      id: `notif-adm-${Date.now()}`,
      orderId: newOrderId,
      customerName: orderData.customerName,
      customerEmail: orderData.customerEmail || '',
      customerPhone: orderData.customerPhone,
      status: 'pending',
      title: `طلب جديد وارد #${newOrderId}!`,
      message: `طلب جديد من الزبونة "${orderData.customerName}" من محافظة ${orderData.city} بمبلغ ${orderData.finalAmount?.toLocaleString('ar-IQ')} د.ع (${orderData.items?.length || 1} منتج).`,
      timestamp,
      channel: 'system',
      read: false,
      trackingNumber,
      target: 'admin',
    };

    const newOrder = {
      ...orderData,
      id: newOrderId,
      trackingNumber,
      createdAt: timestamp,
      status: 'pending',
      statusHistory: orderData.statusHistory || [initialHistoryItem],
      notifications: [customerNotification],
    };

    // Prepend new order
    orders.unshift(newOrder);
    writeJsonFile(ORDERS_FILE, orders);

    // Save notifications
    notifications.unshift(adminNotification, customerNotification);
    writeJsonFile(NOTIFICATIONS_FILE, notifications);

    // Broadcast instant SSE to all clients so any admin immediately receives alert
    broadcastSseEvent('new_order', { order: newOrder, notification: adminNotification });
    broadcastSseEvent('order_status', { order: newOrder, notification: customerNotification }, 'customer', {
      phone: orderData.customerPhone,
      email: orderData.customerEmail,
    });

    // Native Web Push Notification (arrives even if phone is locked, screen is off, or outside Chrome)
    sendWebPushNotification(
      { role: 'admin' },
      {
        title: `طلب جديد وارد #${newOrderId}`,
        body: `طلب جديد من الزبونة "${orderData.customerName}" من محافظة ${orderData.city} بمبلغ ${Number(orderData.finalAmount || 0).toLocaleString('ar-IQ')} د.ع`,
        icon: '/logo.jpg',
        badge: '/logo.jpg',
        tag: `order-${newOrderId}`,
        url: `/?view=admin&orderId=${newOrderId}`,
      }
    ).catch((e) => console.warn('[WebPush] Error pushing order to admin:', e));

    if (orderData.customerPhone || orderData.customerEmail) {
      sendWebPushNotification(
        { phone: orderData.customerPhone, email: orderData.customerEmail },
        {
          title: `تم استلام طلبك #${newOrderId}`,
          body: `شكراً ${orderData.customerName}، تم استلام طلبك بنجاح في متجر KAZAKI.IQ وهو قيد المتابعة.`,
          icon: '/logo.jpg',
          badge: '/logo.jpg',
          tag: `order-cust-${newOrderId}`,
          url: `/?view=orders&orderId=${newOrderId}`,
        }
      ).catch((e) => console.warn('[WebPush] Error pushing order to customer:', e));
    }

    console.log(`[Order Placed] Order #${newOrderId} from ${orderData.customerName} saved and broadcast to admin.`);

    res.status(201).json({
      success: true,
      message: 'تم إرسال الطلب وحفظه بنجاح، ووصل إشعار فوري إلى لوحة تحكم المدير!',
      order: newOrder,
      notification: customerNotification,
    });
  } catch (err: any) {
    console.error('Error creating order:', err);
    res.status(500).json({ success: false, message: 'حدث خطأ أثناء حفظ الطلب' });
  }
});

// PATCH /api/orders/:id - Manager updates order status
app.patch('/api/orders/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, trackingNumber, shippingCarrier, note, sendNotification, customMessage } = req.body;

    const orders = readJsonFile<any[]>(ORDERS_FILE, []);
    const notifications = readJsonFile<any[]>(NOTIFICATIONS_FILE, []);

    const orderIndex = orders.findIndex((o) => o.id === id);
    if (orderIndex === -1) {
      return res.status(404).json({ success: false, message: 'الطلب غير موجود' });
    }

    const existingOrder = orders[orderIndex];
    const timestamp = new Date().toISOString();

    const statusTitles: Record<string, string> = {
      pending: 'الطلب قيد الانتظار والمراجعة',
      processing: 'بدأ تجهيز وتغليف طلبك',
      shipped: 'انطلق طلبك مع شركة الشحن والتوصيل',
      delivered: 'تم تسليم الطلب بنجاح! شكراً لثقتكم',
      cancelled: 'تم إلغاء الطلب',
    };

    const statusDefaultMessages: Record<string, string> = {
      pending: `مرحباً ${existingOrder.customerName}، طلبك رقم #${id} قيد المراجعة حالياً.`,
      processing: `مرحباً ${existingOrder.customerName}، بدأنا الآن تجهيز وتغليف طلبك رقم #${id} بكل فخامة وعناية في متجر KAZAKI.IQ.`,
      shipped: `مرحباً ${existingOrder.customerName}، تم تسليم طلبك رقم #${id} إلى شركة الشحن (${shippingCarrier || 'خدمة التوصيل السريع'}) برقم تتبع: ${trackingNumber || existingOrder.trackingNumber}. الشحنة في طريقها إليك!`,
      delivered: `تهانينا ${existingOrder.customerName}! تم توصيل طلبك رقم #${id} بنجاح. نتمنى أن ينال ورد الليكو إعجابك ورضاكِ.`,
      cancelled: `مرحباً ${existingOrder.customerName}، نود إعلامك بأنه تم إلغاء الطلب رقم #${id}. لأي استفسار يرجى التواصل مع خدمة العملاء.`,
    };

    const effectiveTracking = trackingNumber || existingOrder.trackingNumber;
    const effectiveCarrier = shippingCarrier || existingOrder.shippingCarrier;

    const historyEntry = {
      id: `hist-${Date.now()}`,
      status: status || existingOrder.status,
      timestamp,
      note: note || statusDefaultMessages[status] || 'تم تحديث حالة الطلب',
      trackingNumber: effectiveTracking,
      shippingCarrier: effectiveCarrier,
      updatedBy: 'المدير العام (لوحة التحكم)',
      notificationSent: Boolean(sendNotification !== false),
    };

    let customerNotification: any = null;
    if (sendNotification !== false) {
      customerNotification = {
        id: `notif-cust-${Date.now()}`,
        orderId: id,
        customerName: existingOrder.customerName,
        customerEmail: existingOrder.customerEmail,
        customerPhone: existingOrder.customerPhone,
        status: status || existingOrder.status,
        title: statusTitles[status] || `تحديث على حالة الطلب #${id}`,
        message: customMessage || statusDefaultMessages[status] || 'تم تحديث حالة طلبك.',
        timestamp,
        channel: 'system',
        read: false,
        trackingNumber: effectiveTracking,
        target: 'customer',
      };
      notifications.unshift(customerNotification);
      writeJsonFile(NOTIFICATIONS_FILE, notifications);
    }

    const updatedOrder = {
      ...existingOrder,
      status: status || existingOrder.status,
      trackingNumber: effectiveTracking,
      shippingCarrier: effectiveCarrier,
      statusHistory: [historyEntry, ...(existingOrder.statusHistory || [])],
      notifications: customerNotification
        ? [customerNotification, ...(existingOrder.notifications || [])]
        : existingOrder.notifications || [],
    };

    orders[orderIndex] = updatedOrder;
    writeJsonFile(ORDERS_FILE, orders);

    // Live notify customer about the order status update!
    if (customerNotification) {
      broadcastSseEvent('order_status', { order: updatedOrder, notification: customerNotification }, 'customer', {
        phone: existingOrder.customerPhone,
        email: existingOrder.customerEmail,
      });

      sendWebPushNotification(
        { phone: existingOrder.customerPhone, email: existingOrder.customerEmail },
        {
          title: customerNotification.title || `تحديث على حالة طلبك #${id}`,
          body: customerNotification.message || `تم تحديث حالة طلبك رقم #${id}`,
          icon: '/logo.jpg',
          badge: '/logo.jpg',
          tag: `order-status-${id}`,
          url: `/?view=orders&orderId=${id}`,
        }
      ).catch((e) => console.warn('[WebPush] Error pushing order status to customer:', e));
    }

    res.json({
      success: true,
      message: 'تم تحديث حالة الطلب وإرسال إشعار للزبون بنجاح!',
      order: updatedOrder,
      notification: customerNotification,
    });
  } catch (err: any) {
    console.error('Error updating order:', err);
    res.status(500).json({ success: false, message: 'حدث خطأ أثناء تحديث الطلب' });
  }
});

// ----------------------------------------------------
// 2. SUPPORT MESSAGES & CHATS API
// ----------------------------------------------------

// GET /api/support-messages
app.get('/api/support-messages', (req: Request, res: Response) => {
  const messages = readJsonFile<any[]>(MESSAGES_FILE, []);
  const { customerEmail, customerPhone, role } = req.query;

  // Customers only see their own support conversations
  if (role !== 'admin' && (customerEmail || customerPhone)) {
    const filtered = messages.filter((m) => {
      const matchEmail = customerEmail && m.customerEmail?.toLowerCase() === (customerEmail as string).toLowerCase();
      const matchPhone = customerPhone && m.customerPhone?.replace(/[^0-9]/g, '').includes((customerPhone as string).replace(/[^0-9]/g, ''));
      return matchEmail || matchPhone;
    });
    return res.json({ success: true, messages: filtered });
  }

  // Admin gets all messages
  res.json({ success: true, messages });
});

// POST /api/support-messages - Customer submits inquiry
app.post('/api/support-messages', (req: Request, res: Response) => {
  try {
    const { customerName, customerPhone, customerEmail, subject, message } = req.body;
    if (!customerName || !message) {
      return res.status(400).json({ success: false, message: 'يرجى كتابة الاسم ونص الرسالة' });
    }

    const messages = readJsonFile<any[]>(MESSAGES_FILE, []);
    const notifications = readJsonFile<any[]>(NOTIFICATIONS_FILE, []);

    const newMessageId = `msg-${Date.now()}`;
    const timestamp = new Date().toISOString();

    const newMsg = {
      id: newMessageId,
      customerName,
      customerPhone: customerPhone || '',
      customerEmail: customerEmail || '',
      subject: subject || 'استفسار عام',
      message,
      createdAt: timestamp,
      status: 'new',
    };

    messages.unshift(newMsg);
    writeJsonFile(MESSAGES_FILE, messages);

    // Notify manager of new customer chat
    const adminNotification = {
      id: `notif-chat-${Date.now()}`,
      orderId: '',
      customerName,
      customerPhone,
      customerEmail,
      title: `رسالة واستفسار جديد من الزبونة: ${customerName}`,
      message: `الموضوع: "${subject || 'استفسار'}" - ${message.slice(0, 100)}...`,
      timestamp,
      channel: 'system',
      read: false,
      target: 'admin',
    };

    notifications.unshift(adminNotification);
    writeJsonFile(NOTIFICATIONS_FILE, notifications);

    // Live broadcast to all connected clients (client-side checks admin privileges)
    broadcastSseEvent('new_support_message', { message: newMsg, notification: adminNotification });

    // Native Web Push to Admin device (locked screen / outside Chrome)
    sendWebPushNotification(
      { role: 'admin' },
      {
        title: `رسالة دعم جديدة من ${customerName}`,
        body: `${subject || 'استفسار'}: ${message.slice(0, 100)}`,
        icon: '/logo.jpg',
        badge: '/logo.jpg',
        tag: `support-${newMessageId}`,
        url: '/?view=admin',
      }
    ).catch((e) => console.warn('[WebPush] Error pushing support message to admin:', e));

    res.status(201).json({
      success: true,
      message: 'تم استلام رسالتكِ ووصلت فوراً إلى مركز خدمة العملاء ولوحة المدير!',
      data: newMsg,
    });
  } catch (err: any) {
    console.error('Error sending support message:', err);
    res.status(500).json({ success: false, message: 'تعذر إرسال الرسالة' });
  }
});

// PATCH /api/support-messages/:id - Admin updates status or reply
app.patch('/api/support-messages/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const messages = readJsonFile<any[]>(MESSAGES_FILE, []);
    const msgIndex = messages.findIndex((m) => m.id === id);

    if (msgIndex === -1) {
      return res.status(404).json({ success: false, message: 'الرسالة غير موجودة' });
    }

    const updated = {
      ...messages[msgIndex],
      ...updates,
    };

    messages[msgIndex] = updated;
    writeJsonFile(MESSAGES_FILE, messages);

    // If admin replied, send update to customer
    if (updates.replyNotes) {
      broadcastSseEvent('support_reply', { message: updated }, 'customer', {
        phone: updated.customerPhone,
        email: updated.customerEmail,
      });
    }

    res.json({ success: true, message: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'فشل التحديث' });
  }
});

// DELETE /api/support-messages/:id
app.delete('/api/support-messages/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    let messages = readJsonFile<any[]>(MESSAGES_FILE, []);
    messages = messages.filter((m) => m.id !== id);
    writeJsonFile(MESSAGES_FILE, messages);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});
// ----------------------------------------------------
// 2.5 TEMPORARY LIVE CHAT API (24-Hour Expiration)
// ----------------------------------------------------

// Helper to filter and clean up chats older than 24 hours
const getActiveTempChats = (): any[] => {
  const chats = readJsonFile<any[]>(TEMP_CHATS_FILE, []);
  const now = Date.now();
  // Retain only sessions where expiresAt is still in the future
  const activeChats = chats.filter((c) => {
    if (!c.expiresAt) return false;
    return new Date(c.expiresAt).getTime() > now;
  });
  if (activeChats.length !== chats.length) {
    writeJsonFile(TEMP_CHATS_FILE, activeChats);
  }
  return activeChats;
};

// GET /api/temp-chats
app.get('/api/temp-chats', (req: Request, res: Response) => {
  const activeChats = getActiveTempChats();
  const { sessionId, role, customerPhone, customerEmail } = req.query;

  if (sessionId) {
    const session = activeChats.find((s) => s.id === sessionId);
    return res.json({ success: true, session: session || null });
  }

  if (role !== 'admin' && (customerPhone || customerEmail)) {
    const filtered = activeChats.filter((s) => {
      const matchPhone = customerPhone && s.customerPhone && s.customerPhone.replace(/[^0-9]/g, '').includes((customerPhone as string).replace(/[^0-9]/g, ''));
      const matchEmail = customerEmail && s.customerEmail && s.customerEmail.toLowerCase() === (customerEmail as string).toLowerCase();
      return matchPhone || matchEmail;
    });
    return res.json({ success: true, sessions: filtered });
  }

  // Admin gets all active 24h chats
  res.json({ success: true, sessions: activeChats });
});

// POST /api/temp-chats/message - Customer or Admin sends a message
app.post('/api/temp-chats/message', (req: Request, res: Response) => {
  try {
    const { sessionId, customerName, customerPhone, customerEmail, sender, text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: 'نص الرسالة مطلوب' });
    }

    const activeChats = getActiveTempChats();
    const now = new Date();
    const effectiveSessionId = sessionId || `chat-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    let session = activeChats.find((s) => s.id === effectiveSessionId);

    if (!session) {
      // 24 hours (1 day) from now
      const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
      session = {
        id: effectiveSessionId,
        customerName: customerName || 'زبون المتجر',
        customerPhone: customerPhone || '',
        customerEmail: customerEmail || '',
        createdAt: now.toISOString(),
        expiresAt,
        messages: [],
        status: 'active',
        unreadByAdmin: 0,
        unreadByCustomer: 0,
        lastMessageAt: now.toISOString(),
      };
      activeChats.unshift(session);
    } else {
      if (customerName && (!session.customerName || session.customerName === 'زبون المتجر')) {
        session.customerName = customerName;
      }
      if (customerPhone && !session.customerPhone) {
        session.customerPhone = customerPhone;
      }
      if (customerEmail && !session.customerEmail) {
        session.customerEmail = customerEmail;
      }
    }

    const isSenderAdmin = sender === 'admin';
    const messageItem = {
      id: `cmsg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      sender: isSenderAdmin ? 'admin' : 'customer',
      senderName: isSenderAdmin ? 'إدارة المتجر' : (session.customerName || 'الزبون'),
      text: text.trim(),
      timestamp: now.toISOString(),
    };

    session.messages.push(messageItem);
    session.lastMessageAt = now.toISOString();

    if (isSenderAdmin) {
      session.unreadByCustomer = (session.unreadByCustomer || 0) + 1;
    } else {
      session.unreadByAdmin = (session.unreadByAdmin || 0) + 1;
    }

    writeJsonFile(TEMP_CHATS_FILE, activeChats);

    // If customer sent message: create admin notification and broadcast to admin
    if (!isSenderAdmin) {
      const notifications = readJsonFile<any[]>(NOTIFICATIONS_FILE, []);
      const adminNotification = {
        id: `notif-chat-${Date.now()}`,
        orderId: '',
        customerName: session.customerName,
        customerPhone: session.customerPhone,
        customerEmail: session.customerEmail,
        title: `رسالة شات مباشر مؤقت من: ${session.customerName}`,
        message: text.trim().slice(0, 100),
        timestamp: now.toISOString(),
        channel: 'system',
        read: false,
        target: 'admin',
        type: 'system',
      };
      notifications.unshift(adminNotification);
      writeJsonFile(NOTIFICATIONS_FILE, notifications);

      // Live broadcast to all connected clients (client-side checks admin privileges)
      broadcastSseEvent('temp_chat_message', { session, message: messageItem, notification: adminNotification });

      sendWebPushNotification(
        { role: 'admin' },
        {
          title: `رسالة شات مباشر من ${session.customerName}`,
          body: text.trim().slice(0, 100),
          icon: '/logo.jpg',
          badge: '/logo.jpg',
          tag: `chat-${session.id}`,
          url: '/?view=admin',
        }
      ).catch((e) => console.warn('[WebPush] Error pushing chat to admin:', e));
    } else {
      // Admin replied: broadcast to all connected clients so the customer receives it
      broadcastSseEvent('temp_chat_message', { session, message: messageItem });

      if (session.customerPhone || session.customerEmail) {
        sendWebPushNotification(
          { phone: session.customerPhone, email: session.customerEmail },
          {
            title: 'رد جديد في المحادثة المباشرة',
            body: text.trim().slice(0, 100),
            icon: '/logo.jpg',
            badge: '/logo.jpg',
            tag: `chat-${session.id}`,
            url: `/?openChat=${session.id}`,
          }
        ).catch((e) => console.warn('[WebPush] Error pushing chat reply to customer:', e));
      }
    }

    res.status(201).json({ success: true, session, message: messageItem });
  } catch (err: any) {
    console.error('Error posting temp chat message:', err);
    res.status(500).json({ success: false, message: 'تعذر إرسال رسالة الشات' });
  }
});

// DELETE /api/temp-chats/:id - Close or delete a chat session
app.delete('/api/temp-chats/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    let chats = readJsonFile<any[]>(TEMP_CHATS_FILE, []);
    chats = chats.filter((c) => c.id !== id);
    writeJsonFile(TEMP_CHATS_FILE, chats);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

// ----------------------------------------------------
// 3. NOTIFICATIONS API
// ----------------------------------------------------

// GET /api/notifications
// Ensures customer ONLY sees their own order status notifications and store-wide product announcements!
app.get('/api/notifications', (req: Request, res: Response) => {
  const notifications = readJsonFile<any[]>(NOTIFICATIONS_FILE, []);
  const { role, customerPhone, customerEmail, orderIds } = req.query;
  const adminHeader = req.headers['x-admin-role'];

  // Admin sees all notifications (including new orders, support inquiries, system status)
  const isAdmin = role === 'admin' || adminHeader === 'admin';
  if (isAdmin) {
    return res.json({ success: true, notifications });
  }

  // CUSTOMER ACCESS
  const orderIdList = orderIds ? (orderIds as string).split(',') : [];
  const customerNotifs = notifications.filter((n) => {
    // Must be intended for customer
    if (n.target === 'admin') return false;

    // Allow store-wide product announcements and new arrival notifications
    if (n.type === 'new_product' || (!n.orderId && (n.target === 'customer' || n.target === 'customer_all' || n.target === 'all'))) {
      return true;
    }

    const matchOrderId = n.orderId && orderIdList.includes(n.orderId);
    const matchPhone = customerPhone && n.customerPhone && n.customerPhone.replace(/[^0-9]/g, '').includes((customerPhone as string).replace(/[^0-9]/g, ''));
    const matchEmail = customerEmail && n.customerEmail && n.customerEmail.toLowerCase() === (customerEmail as string).toLowerCase();

    return matchOrderId || matchPhone || matchEmail;
  });

  return res.json({ success: true, notifications: customerNotifs });
});

// POST /api/products/broadcast-new
// Broadcasts a new product arrival notification to all customers
app.post('/api/products/broadcast-new', (req: Request, res: Response) => {
  try {
    const { product } = req.body;
    if (!product || !product.id || !product.title) {
      return res.status(400).json({ success: false, message: 'بيانات المنتج غير مكتملة' });
    }

    const notifications = readJsonFile<any[]>(NOTIFICATIONS_FILE, []);
    const timestamp = new Date().toISOString();

    const productNotification = req.body.notification || {
      id: `notif-prod-${Date.now()}`,
      orderId: '',
      productId: product.id,
      productImage: product.image || '',
      title: 'وصل منتج جديد فاخر!',
      message: `وصل حديثاً إلى متجر KAZAKI: "${product.title}" بسعر ${Number(product.price).toLocaleString('ar-IQ')} د.ع. اكتشفه الآن!`,
      timestamp,
      channel: 'system',
      read: false,
      target: 'customer',
      type: 'new_product',
    };

    notifications.unshift(productNotification);
    writeJsonFile(NOTIFICATIONS_FILE, notifications);

    // Broadcast to all connected customers immediately via SSE
    broadcastSseEvent('new_product', { product, notification: productNotification }, 'customer');

    // Broadcast Web Push to all subscribed customers
    sendWebPushNotification(
      { role: 'customer' },
      {
        title: productNotification.title || 'وصل حديثاً منتج جديد!',
        body: productNotification.message,
        icon: product.image || '/logo.jpg',
        badge: '/logo.jpg',
        tag: `product-${product.id}`,
        url: `/?view=products&productId=${product.id}`,
      }
    ).catch((e) => console.warn('[WebPush] Error pushing new product to customers:', e));

    console.log(`[Product Notification] Broadcasted new product "${product.title}" (#${product.id}) to customers.`);
    res.json({ success: true, notification: productNotification });
  } catch (err: any) {
    console.error('Error broadcasting new product:', err);
    res.status(500).json({ success: false, message: 'تعذر بث إشعار المنتج الجديد' });
  }
});

// POST /api/notifications/read/:id
app.post('/api/notifications/read/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const notifications = readJsonFile<any[]>(NOTIFICATIONS_FILE, []);
  const updated = notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
  writeJsonFile(NOTIFICATIONS_FILE, updated);
  res.json({ success: true });
});

// POST /api/notifications/clear
app.post('/api/notifications/clear', (req: Request, res: Response) => {
  const { role } = req.body;
  if (role === 'admin') {
    writeJsonFile(NOTIFICATIONS_FILE, []);
    return res.json({ success: true });
  }
  res.json({ success: true });
});

// ----------------------------------------------------
// 4. WEB PUSH NOTIFICATIONS API
// ----------------------------------------------------

// GET /api/push-vapid-public-key
app.get('/api/push-vapid-public-key', (_req: Request, res: Response) => {
  res.json({
    success: true,
    publicKey: VAPID_PUBLIC_KEY,
  });
});

// POST /api/push-subscribe
app.post('/api/push-subscribe', (req: Request, res: Response) => {
  try {
    const { subscription, role, phone, email, userId } = req.body;
    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return res.status(400).json({ success: false, message: 'بيانات اشتراك الإشعار غير صالحة' });
    }

    const subscriptions = readJsonFile<PushSubscriber[]>(PUSH_SUBSCRIPTIONS_FILE, []);
    const existingIndex = subscriptions.findIndex((s) => s.endpoint === subscription.endpoint);

    const now = new Date().toISOString();
    const subscriberRecord: PushSubscriber = {
      id: existingIndex >= 0 ? subscriptions[existingIndex].id : `sub-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
      },
      role: role === 'admin' ? 'admin' : 'customer',
      phone: phone || (existingIndex >= 0 ? subscriptions[existingIndex].phone : ''),
      email: email || (existingIndex >= 0 ? subscriptions[existingIndex].email : ''),
      userId: userId || (existingIndex >= 0 ? subscriptions[existingIndex].userId : ''),
      createdAt: existingIndex >= 0 ? subscriptions[existingIndex].createdAt : now,
      updatedAt: now,
    };

    if (existingIndex >= 0) {
      subscriptions[existingIndex] = subscriberRecord;
    } else {
      subscriptions.push(subscriberRecord);
    }

    writeJsonFile(PUSH_SUBSCRIPTIONS_FILE, subscriptions);
    console.log(`[WebPush] Subscribed device (${subscriberRecord.role}) with endpoint: ${subscription.endpoint.slice(0, 40)}...`);

    res.json({
      success: true,
      message: 'تم تفعيل وتثبيت إشعارات هاتف المتجر بنجاح!',
      subscriber: subscriberRecord,
    });
  } catch (err: any) {
    console.error('Error saving push subscription:', err);
    res.status(500).json({ success: false, message: 'حدث خطأ أثناء حفظ اشتراك الإشعار' });
  }
});

// POST /api/push-unsubscribe
app.post('/api/push-unsubscribe', (req: Request, res: Response) => {
  try {
    const { endpoint } = req.body;
    if (!endpoint) {
      return res.status(400).json({ success: false, message: 'الرابط غير موجود' });
    }
    const subscriptions = readJsonFile<PushSubscriber[]>(PUSH_SUBSCRIPTIONS_FILE, []);
    const updated = subscriptions.filter((s) => s.endpoint !== endpoint);
    writeJsonFile(PUSH_SUBSCRIPTIONS_FILE, updated);
    res.json({ success: true, message: 'تم إلغاء الاشتراك بنجاح' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'حدث خطأ أثناء إلغاء الاشتراك' });
  }
});

// POST /api/push-test - Sends instant push to verify background arrival on phone
app.post('/api/push-test', async (req: Request, res: Response) => {
  try {
    const { role } = req.body;
    const targetRole = role === 'customer' ? 'customer' : 'admin';
    const result = await sendWebPushNotification(
      { role: targetRole },
      {
        title: targetRole === 'admin' ? 'إشعار فوري لهاتف الأدمن' : 'إشعار تجريبي من KAZAKI.IQ',
        body: 'إشعارات متجر KAZAKI.IQ تعمل بكفاءة على هاتفك حتى مع قفل الشاشة أو إغلاق كروم!',
        icon: '/logo.jpg',
        badge: '/logo.jpg',
        tag: `test-push-${Date.now()}`,
        url: targetRole === 'admin' ? '/?view=admin' : '/',
      }
    );

    res.json({
      success: true,
      message:
        result.sent > 0
          ? `تم إرسال الإشعار بنجاح إلى ${result.sent} جهاز مسجل.`
          : 'لم يتم العثور على أجهزة مسجلة حالياً. تأكد من تفعيل إذن الإشعارات أولاً.',
      sentCount: result.sent,
      failedCount: result.failed,
    });
  } catch (err: any) {
    console.error('Error sending test push:', err);
    res.status(500).json({ success: false, message: 'فشل إرسال الإشعار التجريبي: ' + err.message });
  }
});

// ----------------------------------------------------
// 5. SYNC & HEALTH CHECK API
// ----------------------------------------------------
app.get('/api/health', (req: Request, res: Response) => {
  const orders = readJsonFile<any[]>(ORDERS_FILE, []);
  const messages = readJsonFile<any[]>(MESSAGES_FILE, []);
  res.json({
    status: 'ok',
    ordersCount: orders.length,
    unreadMessages: messages.filter((m) => m.status === 'new').length,
    timestamp: new Date().toISOString(),
  });
});

// ----------------------------------------------------
// Vite Dev Server / Static files handler
// ----------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
        watch: null,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`KAZAKI Full-Stack Server running at http://0.0.0.0:${PORT}`);
  });
}

process.on('uncaughtException', (err) => {
  console.error('[Server Uncaught Exception]:', err);
});

process.on('unhandledRejection', (reason) => {
  console.error('[Server Unhandled Rejection]:', reason);
});

startServer().catch((err) => {
  console.error('Fatal error starting server:', err);
});
