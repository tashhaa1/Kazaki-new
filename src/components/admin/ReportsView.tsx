import React, { useState, useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  PieChart as PieChartIcon,
  Store,
  DollarSign,
  Truck,
  RotateCcw,
  CheckCircle2,
  Clock,
  MapPin,
  TrendingUp,
  Filter,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Search,
  Package,
  Award,
  ChevronDown,
  Building2,
  FileSpreadsheet,
} from 'lucide-react';
import { defaultIraqiShippingRates } from '../../data/initialData';

// Format number with K or M suffix or comma separation
const formatNumberAbbr = (num: number): string => {
  if (num >= 1_000_000) {
    const formatted = (num / 1_000_000).toFixed(1).replace(/\.0$/, '');
    return `${formatted}M`;
  }
  if (num >= 1_000) {
    const formatted = (num / 1_000).toFixed(1).replace(/\.0$/, '');
    return `${formatted}k`;
  }
  return num.toLocaleString('en-US');
};

const formatCurrencyIQD = (amount: number): string => {
  if (amount >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(1).replace(/\.0$/, '')}M IQD`;
  }
  if (amount >= 1_000) {
    return `${(amount / 1_000).toFixed(1).replace(/\.0$/, '')}k IQD`;
  }
  return `${amount.toLocaleString('en-US')} IQD`;
};

const formatCurrencyUSD = (amountIQD: number): string => {
  if (amountIQD <= 0) return '0 USD';
  // Iraqi market exchange rate estimate: 1 USD ~ 1,310 IQD
  const usd = amountIQD / 1310;
  if (usd >= 1_000_000) {
    return `${(usd / 1_000_000).toFixed(1).replace(/\.0$/, '')}M USD`;
  }
  if (usd >= 1_000) {
    return `${(usd / 1_000).toFixed(1).replace(/\.0$/, '')}k USD`;
  }
  return `${Math.round(usd).toLocaleString('en-US')} USD`;
};

export const ReportsView: React.FC = () => {
  const { orders, settings } = useStore();

  const [activeReportTab, setActiveReportTab] = useState<'operations' | 'stores'>('operations');
  const [timeframe, setTimeframe] = useState<'all' | 'two_months' | 'month' | 'week' | 'today'>('all');
  const [invoicesScope, setInvoicesScope] = useState<'two_months' | 'all'>('two_months');
  const [searchQuery, setSearchQuery] = useState('');

  // 1. STATS & PROFITS METRICS: Full report period by default (الأرباح والمبيعات تبقى محفوظة كأرقام تراكمية)
  const statsOrders = useMemo(() => {
    const now = new Date();
    return orders.filter((order) => {
      if (timeframe === 'all') return true;
      const orderDate = new Date(order.createdAt);
      if (isNaN(orderDate.getTime())) return true;

      if (timeframe === 'today') {
        return (
          orderDate.getDate() === now.getDate() &&
          orderDate.getMonth() === now.getMonth() &&
          orderDate.getFullYear() === now.getFullYear()
        );
      }
      if (timeframe === 'week') {
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return orderDate >= oneWeekAgo;
      }
      if (timeframe === 'month') {
        const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return orderDate >= oneMonthAgo;
      }
      if (timeframe === 'two_months') {
        const twoMonthsAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
        return orderDate >= twoMonthsAgo;
      }
      return true;
    });
  }, [orders, timeframe]);

  // Operational metrics from statsOrders (all-time / complete saved record)
  const totalShipmentsCount = statsOrders.length;
  
  // Delivered / Received
  const deliveredOrders = statsOrders.filter((o) => o.status === 'delivered');
  const deliveredCount = deliveredOrders.length;
  const deliveredAmountIQD = deliveredOrders.reduce((sum, o) => sum + (o.finalAmount || 0), 0);

  // Returned / Cancelled
  const returnedOrders = statsOrders.filter((o) => o.status === 'cancelled' || o.status === 'returned');
  const returnedCount = returnedOrders.length;
  const returnedAmountIQD = returnedOrders.reduce((sum, o) => sum + (o.finalAmount || 0), 0);

  // With Courier (عند المندوب - shipped)
  const withCourierOrders = statsOrders.filter((o) => o.status === 'shipped');
  const withCourierCount = withCourierOrders.length;

  // In Transit / Processing (النقل والمعالجة - processing or pending)
  const processingOrders = statsOrders.filter((o) => o.status === 'processing' || o.status === 'pending');
  const processingCount = processingOrders.length;

  // Total Sales & Profits (المبيعات والأرباح المحفوظة)
  const netSalesIQD = statsOrders
    .filter((o) => o.status !== 'cancelled' && o.status !== 'returned')
    .reduce((sum, o) => sum + (o.finalAmount || 0), 0);

  // Percentages for radial cards
  const courierPercentage = totalShipmentsCount > 0 ? Math.round((withCourierCount / totalShipmentsCount) * 100) : 0;
  const processingPercentage = totalShipmentsCount > 0 ? Math.round((processingCount / totalShipmentsCount) * 100) : 0;

  // Day-of-week bar chart distribution
  const chartDays = useMemo(() => {
    // 7 days: Thu, Fri, Sat, Sun, Mon, Tue, Wed
    const daysMeta = [
      { key: 4, nameAr: 'الخميس', nameEn: 'Thu' },
      { key: 5, nameAr: 'الجمعة', nameEn: 'Fri' },
      { key: 6, nameAr: 'السبت', nameEn: 'Sat' },
      { key: 0, nameAr: 'الأحد', nameEn: 'Sun' },
      { key: 1, nameAr: 'الإثنين', nameEn: 'Mon' },
      { key: 2, nameAr: 'الثلاثاء', nameEn: 'Tue' },
      { key: 3, nameAr: 'الأربعاء', nameEn: 'Wed' },
    ];

    const distribution = daysMeta.map((d) => {
      const dayOrders = statsOrders.filter((o) => {
        const dObj = new Date(o.createdAt);
        return !isNaN(dObj.getTime()) && dObj.getDay() === d.key;
      });
      const count = dayOrders.length;
      const amount = dayOrders.reduce((acc, curr) => acc + (curr.finalAmount || 0), 0);
      return {
        ...d,
        count,
        amount,
      };
    });

    const maxCount = Math.max(...distribution.map((d) => d.count), 1);
    return distribution.map((d) => ({
      ...d,
      heightPercent: d.count > 0 ? Math.max(Math.round((d.count / maxCount) * 100), 14) : 8,
    }));
  }, [statsOrders]);

  // Top 5 Iraqi Governorates (أعلى خمس محافظات) calculated across saved records
  const topGovernorates = useMemo(() => {
    const cityMap: Record<
      string,
      {
        cityName: string;
        totalOrders: number;
        deliveredOrders: number;
        returnedOrders: number;
        totalSales: number;
      }
    > = {};

    statsOrders.forEach((o) => {
      const city = o.city?.trim() || 'بغداد';
      if (!cityMap[city]) {
        cityMap[city] = {
          cityName: city,
          totalOrders: 0,
          deliveredOrders: 0,
          returnedOrders: 0,
          totalSales: 0,
        };
      }
      cityMap[city].totalOrders += 1;
      if (o.status === 'delivered') {
        cityMap[city].deliveredOrders += 1;
      }
      if (o.status === 'cancelled' || o.status === 'returned') {
        cityMap[city].returnedOrders += 1;
      }
      if (o.status !== 'cancelled' && o.status !== 'returned') {
        cityMap[city].totalSales += o.finalAmount || 0;
      }
    });

    let list = Object.values(cityMap).sort((a, b) => b.totalOrders - a.totalOrders || b.totalSales - a.totalSales);

    // Fallback if system has fewer than 5 governorates with orders yet
    if (list.length < 5) {
      const standardGovernorates = ['بغداد', 'البصرة', 'أربيل', 'النجف', 'كركوك', 'السليمانية', 'نينوى'];
      for (const govName of standardGovernorates) {
        if (!list.some((l) => l.cityName === govName)) {
          list.push({
            cityName: govName,
            totalOrders: 0,
            deliveredOrders: 0,
            returnedOrders: 0,
            totalSales: 0,
          });
        }
        if (list.length >= 5) break;
      }
    }

    const top5 = list.slice(0, 5);
    const maxOrdersInTop = Math.max(...top5.map((g) => g.totalOrders), 1);

    return top5.map((gov, idx) => ({
      ...gov,
      rank: idx + 1,
      sharePercent: totalShipmentsCount > 0 ? Math.round((gov.totalOrders / totalShipmentsCount) * 100) : 0,
      relativeBarWidth: gov.totalOrders > 0 ? Math.round((gov.totalOrders / maxOrdersInTop) * 100) : 6,
      deliverySuccessRate:
        gov.totalOrders > 0 ? Math.round((gov.deliveredOrders / gov.totalOrders) * 100) : 100,
    }));
  }, [statsOrders, totalShipmentsCount]);

  // 2. INVOICES TABLE SCOPE: Strictly the last 2 months (60 days) by default as requested
  const twoMonthsAgoDate = useMemo(() => new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), []);

  const invoicesInScope = useMemo(() => {
    if (invoicesScope === 'all') return orders;
    return orders.filter((o) => {
      const d = new Date(o.createdAt);
      if (isNaN(d.getTime())) return true;
      return d >= twoMonthsAgoDate;
    });
  }, [orders, invoicesScope, twoMonthsAgoDate]);

  // Filtered invoices according to search query
  const tableOrders = useMemo(() => {
    if (!searchQuery.trim()) return invoicesInScope.slice(0, 20);
    const q = searchQuery.toLowerCase();
    return invoicesInScope.filter(
      (o) =>
        o.id.toLowerCase().includes(q) ||
        o.customerName?.toLowerCase().includes(q) ||
        o.customerPhone?.includes(q) ||
        o.city?.toLowerCase().includes(q)
    );
  }, [invoicesInScope, searchQuery]);

  return (
    <div className="space-y-6 animate-in fade-in pb-12 font-sans" dir="rtl">
      {/* ======================================================== */}
      {/* 1. TOP CONTROLS & PILL TAB SWITCHER                      */}
      {/* ======================================================== */}
      <div className="bg-white rounded-3xl border border-blue-100/80 p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Operations vs Stores Switcher (Exact image style) */}
          <div className="w-full sm:w-auto inline-flex items-center p-1.5 rounded-2xl bg-stone-100/90 border border-stone-200/80 shadow-2xs">
            <button
              onClick={() => setActiveReportTab('operations')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeReportTab === 'operations'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'text-stone-600 hover:text-blue-600'
              }`}
            >
              <PieChartIcon className="w-4 h-4" />
              <span>تقارير العمليات</span>
            </button>

            <button
              onClick={() => setActiveReportTab('stores')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeReportTab === 'stores'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'text-stone-600 hover:text-blue-600'
              }`}
            >
              <Store className="w-4 h-4" />
              <span>تقارير المتاجر</span>
            </button>
          </div>

          {/* Timeframe Filter Dropdown */}
          <div className="w-full sm:w-auto flex items-center justify-between sm:justify-end gap-2.5">
            <span className="text-xs font-bold text-stone-500 hidden sm:inline-block">فترة الإحصائيات:</span>
            <div className="inline-flex items-center gap-1 p-1 bg-stone-100/90 rounded-2xl border border-stone-200/80 text-xs font-semibold">
              <button
                onClick={() => setTimeframe('all')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  timeframe === 'all' ? 'bg-white text-blue-700 font-bold shadow-2xs' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                كامل الفترة (دائم)
              </button>
              <button
                onClick={() => setTimeframe('two_months')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  timeframe === 'two_months' ? 'bg-white text-blue-700 font-bold shadow-2xs' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                آخر شهرين
              </button>
              <button
                onClick={() => setTimeframe('month')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  timeframe === 'month' ? 'bg-white text-blue-700 font-bold shadow-2xs' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                هذا الشهر
              </button>
              <button
                onClick={() => setTimeframe('week')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  timeframe === 'week' ? 'bg-white text-blue-700 font-bold shadow-2xs' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                هذا الأسبوع
              </button>
              <button
                onClick={() => setTimeframe('today')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  timeframe === 'today' ? 'bg-white text-blue-700 font-bold shadow-2xs' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                اليوم
              </button>
            </div>
          </div>
        </div>

        {/* Store Context & Retention Banner */}
        <div className="flex flex-wrap items-center justify-between text-xs text-stone-500 pt-3 border-t border-stone-100 gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span className="font-semibold text-stone-700">
              أرقام الأرباح والمبيعات والشحنات محفوظة ومسجلة دائمياً لكامل فترة المتجر
            </span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-blue-700 bg-blue-50 px-2.5 py-1 rounded-xl border border-blue-100 font-medium">
            <span>فواتير الشحنات بالأسفل: محددة بفترة آخر شهرين (60 يوماً)</span>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. BAR CHART CARD (Weekly Activity Histogram)            */}
      {/* ======================================================== */}
      <div className="bg-white rounded-3xl border border-blue-100/80 p-5 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />
            <h3 className="font-extrabold text-stone-900 text-sm sm:text-base">
              حركة الشحنات اليومية خلال الأسبوع
            </h3>
          </div>
          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
            {timeframe === 'all'
              ? 'الكل'
              : timeframe === 'week'
              ? 'آخر 7 أيام'
              : timeframe === 'month'
              ? 'آخر 30 يوماً'
              : 'اليوم فقط'}
          </span>
        </div>

        {/* SVG/CSS Bar Chart Grid */}
        <div className="h-44 sm:h-52 w-full flex items-end justify-between gap-2 sm:gap-4 pt-4 px-2 border-b border-stone-200">
          {chartDays.map((d, idx) => (
            <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer">
              {/* Tooltip on hover */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity mb-2 px-2 py-1 bg-stone-900 text-white text-[10px] rounded-lg shadow-lg pointer-events-none whitespace-nowrap text-center z-10 font-mono">
                <div>{d.count} شحنة</div>
                <div>{formatNumberAbbr(d.amount)} د.ع</div>
              </div>

              {/* Bar Column */}
              <div
                className="w-full max-w-[42px] bg-indigo-500/80 group-hover:bg-blue-600 transition-all rounded-t-lg shadow-2xs relative"
                style={{ height: `${d.heightPercent}%` }}
              >
                <div className="absolute inset-x-0 top-0 h-1 bg-white/40 rounded-t-lg" />
              </div>

              {/* Day Labels */}
              <div className="mt-3 text-center">
                <span className="block text-[11px] sm:text-xs font-bold text-stone-700">
                  {d.nameEn}
                </span>
                <span className="block text-[9px] sm:text-[10px] text-stone-400">
                  {d.nameAr}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. RADIAL / CIRCULAR SHIPMENT STATUS CARDS               */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Card 1: عند المندوب */}
        <div className="bg-white rounded-3xl border border-blue-100/80 p-6 shadow-sm flex flex-col items-center justify-center text-center relative overflow-hidden">
          <h4 className="text-xs sm:text-sm font-extrabold text-stone-800 mb-4 tracking-tight">
            عند المندوب
          </h4>

          {/* Circular SVG Gauge */}
          <div className="relative w-32 h-32 flex items-center justify-center my-2">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                className="stroke-stone-100"
                strokeWidth="7"
                fill="none"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                className="stroke-blue-600 transition-all duration-700"
                strokeWidth="7"
                strokeDasharray="251.2"
                strokeDashoffset={251.2 - (251.2 * (courierPercentage || 25)) / 100}
                strokeLinecap="round"
                fill="none"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-black text-stone-900 font-mono tracking-tight">
                {withCourierCount}
              </span>
              <span className="text-xs text-stone-500 font-bold mt-0.5">شحنة</span>
            </div>
          </div>

          {/* Growth / Status Badge */}
          <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+{courierPercentage > 0 ? courierPercentage : 4}% جاري التوصيل</span>
          </div>
        </div>

        {/* Card 2: النقل بين الفروع / قيد التجهيز */}
        <div className="bg-white rounded-3xl border border-blue-100/80 p-6 shadow-sm flex flex-col items-center justify-center text-center relative overflow-hidden">
          <h4 className="text-xs sm:text-sm font-extrabold text-stone-800 mb-4 tracking-tight">
            النقل بين الفروع والمعالجة
          </h4>

          {/* Circular SVG Gauge */}
          <div className="relative w-32 h-32 flex items-center justify-center my-2">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                className="stroke-stone-100"
                strokeWidth="7"
                fill="none"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                className="stroke-emerald-500 transition-all duration-700"
                strokeWidth="7"
                strokeDasharray="251.2"
                strokeDashoffset={251.2 - (251.2 * (processingPercentage || 18)) / 100}
                strokeLinecap="round"
                fill="none"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-black text-stone-900 font-mono tracking-tight">
                {processingCount}
              </span>
              <span className="text-xs text-stone-500 font-bold mt-0.5">شحنة</span>
            </div>
          </div>

          {/* Growth / Status Badge */}
          <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-100">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+{processingPercentage > 0 ? processingPercentage : 2}% قيد التجهيز</span>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 4. METRIC STATS CARDS GRID (Exact options from image)    */}
      {/* ======================================================== */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
        {/* مبلغ الشحنات الناجحة (IQD) */}
        <div className="bg-white rounded-3xl border border-blue-100/80 p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-extrabold text-stone-700">مبلغ الشحنات الناجحة</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h4 className="text-base sm:text-xl font-black text-stone-900 font-mono tracking-tight">
              {formatCurrencyIQD(deliveredAmountIQD)}
            </h4>
            <span className="text-[10px] text-emerald-600 font-semibold block mt-1">
              مجموع المستلم الفعلي
            </span>
          </div>
        </div>

        {/* مبلغ الشحنات الناجحة (USD) */}
        <div className="bg-white rounded-3xl border border-blue-100/80 p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-extrabold text-stone-700">مبلغ الشحنات الناجحة</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h4 className="text-base sm:text-xl font-black text-stone-900 font-mono tracking-tight">
              {formatCurrencyUSD(deliveredAmountIQD)}
            </h4>
            <span className="text-[10px] text-stone-400 font-semibold block mt-1">
              التعادل بالدولار الأمريكي
            </span>
          </div>
        </div>

        {/* مبلغ الشحنات الراجعة (IQD) */}
        <div className="bg-white rounded-3xl border border-blue-100/80 p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-extrabold text-stone-700">مبلغ الشحنات الراجعة</span>
            <div className="w-8 h-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
              <RotateCcw className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h4 className="text-base sm:text-xl font-black text-rose-600 font-mono tracking-tight">
              {formatCurrencyIQD(returnedAmountIQD)}
            </h4>
            <span className="text-[10px] text-rose-500 font-semibold block mt-1">
              قيمة المرتجعات والملغاة
            </span>
          </div>
        </div>

        {/* مبلغ الشحنات الراجعة (USD) */}
        <div className="bg-white rounded-3xl border border-blue-100/80 p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-extrabold text-stone-700">مبلغ الشحنات الراجعة</span>
            <div className="w-8 h-8 rounded-xl bg-stone-100 text-stone-600 flex items-center justify-center font-bold">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h4 className="text-base sm:text-xl font-black text-stone-800 font-mono tracking-tight">
              {formatCurrencyUSD(returnedAmountIQD)}
            </h4>
            <span className="text-[10px] text-stone-400 font-semibold block mt-1">
              المرتجع بالدولار
            </span>
          </div>
        </div>

        {/* إجمالي الشحنات الكلية */}
        <div className="bg-white rounded-3xl border border-blue-100/80 p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-extrabold text-stone-700">إجمالي الشحنات الكلية</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h4 className="text-xl sm:text-2xl font-black text-blue-700 font-mono tracking-tight">
              {formatNumberAbbr(totalShipmentsCount)}
            </h4>
            <span className="text-[10px] text-stone-400 font-semibold block mt-1">
              كافة الطلبات المسجلة
            </span>
          </div>
        </div>

        {/* إجمالي المستلمة */}
        <div className="bg-white rounded-3xl border border-blue-100/80 p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-extrabold text-stone-700">إجمالي المستلمة</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h4 className="text-xl sm:text-2xl font-black text-emerald-600 font-mono tracking-tight">
              {formatNumberAbbr(deliveredCount)}
            </h4>
            <span className="text-[10px] text-emerald-700 font-semibold block mt-1">
              تسليم ناجح للزبائن
            </span>
          </div>
        </div>

        {/* إجمالي المرتجعات */}
        <div className="bg-white rounded-3xl border border-blue-100/80 p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-extrabold text-stone-700">إجمالي المرتجعات</span>
            <div className="w-8 h-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
              <RotateCcw className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h4 className="text-xl sm:text-2xl font-black text-red-600 font-mono tracking-tight">
              {formatNumberAbbr(returnedCount)}
            </h4>
            <span className="text-[10px] text-red-500 font-semibold block mt-1">
              شحنات راجعة أو ملغاة
            </span>
          </div>
        </div>

        {/* إجمالي المعالجة والتجهيز */}
        <div className="bg-white rounded-3xl border border-blue-100/80 p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-extrabold text-stone-700">إجمالي المعالجة</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h4 className="text-xl sm:text-2xl font-black text-amber-600 font-mono tracking-tight">
              {formatNumberAbbr(processingCount)}
            </h4>
            <span className="text-[10px] text-amber-700 font-semibold block mt-1">
              قيد التحضير والشحن
            </span>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 5. TOP 5 GOVERNORATES SECTION (أعلى خمس محافظات)          */}
      {/* ======================================================== */}
      <div className="bg-white rounded-3xl border border-blue-100/80 p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-stone-900 text-sm sm:text-base">
                أعلى خمس محافظات بالطلبات والمبيعات
              </h3>
              <p className="text-[11px] text-stone-500">
                ترتيب المحافظات الأكثر طلباً مع نسبة التسليم وحجم المبيعات الفعلي
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-stone-600 bg-stone-100 px-3 py-1 rounded-full">
            Top 5 Iraqi Governorates
          </span>
        </div>

        <div className="space-y-3 pt-2">
          {topGovernorates.map((gov) => {
            const rankBadgeColor =
              gov.rank === 1
                ? 'bg-amber-500 text-white shadow-xs shadow-amber-200'
                : gov.rank === 2
                ? 'bg-stone-300 text-stone-800'
                : gov.rank === 3
                ? 'bg-amber-700/80 text-white'
                : 'bg-stone-100 text-stone-600';

            return (
              <div
                key={gov.cityName}
                className="p-3.5 sm:p-4 rounded-2xl bg-stone-50/70 border border-stone-200/70 hover:bg-white hover:border-blue-200 hover:shadow-xs transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-2.5">
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${rankBadgeColor}`}
                    >
                      {gov.rank}
                    </span>
                    <div>
                      <span className="font-extrabold text-stone-900 text-sm block">
                        {gov.cityName}
                      </span>
                      <span className="text-[10px] text-stone-400">
                        {gov.totalOrders} شحنة إجمالية • نسبة التسليم الناجح: {gov.deliverySuccessRate}%
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 text-xs font-mono">
                    <div className="text-right sm:text-left">
                      <span className="text-[10px] text-stone-400 block font-sans">قيمة المبيعات:</span>
                      <span className="font-black text-blue-700">
                        {gov.totalSales.toLocaleString('en-US')} {settings.currency}
                      </span>
                    </div>
                    <span className="font-bold text-stone-600 bg-white px-2.5 py-1 rounded-xl border border-stone-200 text-xs">
                      {gov.sharePercent}%
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-stone-200/80 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      gov.rank === 1
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-500'
                        : gov.rank === 2
                        ? 'bg-gradient-to-r from-blue-500 to-cyan-400'
                        : 'bg-stone-400'
                    }`}
                    style={{ width: `${gov.relativeBarWidth}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 6. TOTAL SALES HERO SUMMARY (إجمالي المبيعات)            */}
      {/* ======================================================== */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-blue-500/15 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1.5 text-center sm:text-right">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold backdrop-blur-md">
            <DollarSign className="w-3.5 h-3.5" />
            <span>صافي المبيعات المحققة</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black font-mono tracking-tight drop-shadow-sm">
            {netSalesIQD.toLocaleString('en-US')} {settings.currency}
          </h2>
          <p className="text-blue-100 text-xs">
            ما يعادل تقريباً {formatCurrencyUSD(netSalesIQD)} • محسوب بعد استبعاد كافة الشحنات الراجعة والملغاة
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 px-4 py-3 rounded-2xl text-center min-w-[110px]">
            <span className="text-[10px] text-blue-200 block">شحنات مستلمة</span>
            <span className="text-lg font-black font-mono">{deliveredCount}</span>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/20 px-4 py-3 rounded-2xl text-center min-w-[110px]">
            <span className="text-[10px] text-blue-200 block">شحنات راجعة</span>
            <span className="text-lg font-black font-mono">{returnedCount}</span>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/20 px-4 py-3 rounded-2xl text-center min-w-[110px]">
            <span className="text-[10px] text-blue-200 block">معدل الإنجاز</span>
            <span className="text-lg font-black font-mono">
              {totalShipmentsCount > 0 ? Math.round((deliveredCount / totalShipmentsCount) * 100) : 100}%
            </span>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 7. QUICK SHIPMENTS & INVOICES AUDIT LOG TABLE            */}
      {/* ======================================================== */}
      <div className="bg-white rounded-3xl border border-blue-100/80 p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3 border-b border-stone-100">
          <div>
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-blue-600" />
              <h3 className="font-extrabold text-stone-900 text-sm sm:text-base">
                سجل فواتير الطلبات والشحنات
              </h3>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
                {invoicesScope === 'two_months' ? 'فواتير آخر شهرين (60 يوماً)' : 'كافة الفواتير المسجلة'}
              </span>
            </div>
            <p className="text-[11px] text-stone-500 mt-1">
              يظهر هنا فواتير آخر شهرين فقط لتسريع التصفح والتدقيق الميداني، بينما إجمالي الأرباح والمبيعات كرقم يبقى محفوظاً بالكامل في النظام.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* Scope switcher button */}
            <div className="w-full sm:w-auto inline-flex items-center p-1 bg-stone-100 rounded-xl border border-stone-200 text-xs font-semibold">
              <button
                onClick={() => setInvoicesScope('two_months')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  invoicesScope === 'two_months'
                    ? 'bg-white text-blue-700 font-bold shadow-2xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                آخر شهرين ({invoicesInScope.length})
              </button>
              <button
                onClick={() => setInvoicesScope('all')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  invoicesScope === 'all'
                    ? 'bg-white text-blue-700 font-bold shadow-2xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                كل الفواتير ({orders.length})
              </button>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-60">
              <input
                type="text"
                placeholder="بحث برقم الفاتورة، الزبون، المدينة..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs pr-8 pl-3 py-2 rounded-xl border border-stone-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
              />
              <Search className="w-3.5 h-3.5 text-stone-400 absolute right-2.5 top-2.5" />
            </div>
          </div>
        </div>

        {tableOrders.length === 0 ? (
          <div className="py-10 text-center text-xs text-stone-400 bg-stone-50 rounded-2xl border border-dashed border-stone-200">
            لا توجد فواتير مسجلة مطابقة لبحثك في فترة آخر شهرين.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-right">
              <thead>
                <tr className="text-stone-400 border-b border-stone-100 pb-2">
                  <th className="py-2.5 font-bold">رقم الفاتورة</th>
                  <th className="py-2.5 font-bold">التاريخ</th>
                  <th className="py-2.5 font-bold">الزبون والهاتف</th>
                  <th className="py-2.5 font-bold">المحافظة</th>
                  <th className="py-2.5 font-bold">المنتجات</th>
                  <th className="py-2.5 font-bold">مبلغ الفاتورة</th>
                  <th className="py-2.5 font-bold">حالة الفاتورة</th>
                  <th className="py-2.5 font-bold">رقم التتبع</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {tableOrders.map((ord) => {
                  const isDelivered = ord.status === 'delivered';
                  const isReturned = ord.status === 'cancelled' || ord.status === 'returned';
                  const isShipped = ord.status === 'shipped';

                  const badgeClass = isDelivered
                    ? 'bg-emerald-100 text-emerald-800'
                    : isReturned
                    ? 'bg-red-100 text-red-800'
                    : isShipped
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-amber-100 text-amber-800';

                  const statusLabel = isDelivered
                    ? 'مستلمة'
                    : isReturned
                    ? 'راجعة / ملغاة'
                    : isShipped
                    ? 'عند المندوب'
                    : 'قيد التجهيز';

                  const dateStr = ord.createdAt
                    ? new Date(ord.createdAt).toLocaleDateString('ar-IQ', {
                        year: 'numeric',
                        month: 'numeric',
                        day: 'numeric',
                      })
                    : '-';

                  const totalItems = (ord.items || []).reduce((acc, it) => acc + (it.quantity || 1), 0);

                  return (
                    <tr key={ord.id} className="hover:bg-blue-50/40 transition-colors">
                      <td className="py-3 font-bold font-mono text-stone-900">{ord.id}</td>
                      <td className="py-3 font-mono text-[11px] text-stone-500 whitespace-nowrap">
                        {dateStr}
                      </td>
                      <td className="py-3">
                        <span className="font-semibold block text-stone-800">{ord.customerName}</span>
                        <span className="text-[10px] text-stone-400 font-mono" dir="ltr">{ord.customerPhone}</span>
                      </td>
                      <td className="py-3 font-medium text-stone-700">{ord.city || 'بغداد'}</td>
                      <td className="py-3 font-mono text-stone-600">
                        {totalItems} {totalItems > 1 ? 'قطع' : 'قطعة'}
                      </td>
                      <td className="py-3 font-bold font-mono text-stone-900 whitespace-nowrap">
                        {ord.finalAmount?.toLocaleString('en-US')} {settings.currency}
                      </td>
                      <td className="py-3 whitespace-nowrap">
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${badgeClass}`}>
                          {statusLabel}
                        </span>
                      </td>
                      <td className="py-3 font-mono text-[11px] text-stone-500 whitespace-nowrap">
                        {ord.trackingNumber || 'KZK-' + ord.id.slice(-4)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
