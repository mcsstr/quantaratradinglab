import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer, Cell, LabelList
} from 'recharts';
import { hexToRgba, DEFAULT_THEME, DEFAULT_SETTINGS } from '../utils/constants';
import { Eye, TrendingUp, DollarSign, Percent, Activity, CalendarDays, Layers, AlertTriangle, Target, Shield, Banknote, List, Edit2, Trash2, ChevronLeft, ChevronRight, BarChart2 } from 'lucide-react';

// ─── helpers ────────────────────────────────────────────────────────────────

function getStartOfWeek(d: Date): Date {
  const day = d.getDay();
  const diff = d.getDate() - day;
  return new Date(d.getFullYear(), d.getMonth(), diff);
}

function formatCurrency(val: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency, maximumFractionDigits: 2, minimumFractionDigits: 2
  }).format(val);
}

function getGlassStyle(color: string, opacity = 0.85) {
  try {
    return { backgroundColor: hexToRgba(color, opacity) };
  } catch {
    return { backgroundColor: color };
  }
}

// ─── metrics calculator ──────────────────────────────────────────────────────

function calcMetrics(trades: any[], initialBalance: number) {
  const sorted = [...trades].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  let balance = initialBalance;
  let peak = initialBalance;
  let maxDrawdown = 0;
  let maxProfit = 0;
  let grossPnl = 0;
  let totalFees = 0;
  let winCount = 0;
  let lossCount = 0;
  
  // daily tracking
  const dailyPnl: Record<string, number> = {};
  
  const datesSet = new Set<string>();

  for (const t of sorted) {
    if (!t.date) continue;
    let dStr = t.date;
    if (dStr.includes('T')) dStr = dStr.split('T')[0];
    const d = dStr.slice(0,10);

    const gross = parseFloat(t.pnl) || 0;
    const fee = (parseFloat(t.commission_per_trade) || parseFloat(t.commission) || 0) * (parseInt(t.qty) || 1);
    const net = gross - fee;

    grossPnl += gross;
    totalFees += fee;
    balance += net;
    
    if (net >= 0) winCount++;
    else if (net < 0) lossCount++;
    
    peak = Math.max(peak, balance);
    maxDrawdown = Math.min(maxDrawdown, balance - peak);
    maxProfit = Math.max(maxProfit, balance - initialBalance);
    
    datesSet.add(d);
    if (!dailyPnl[d]) dailyPnl[d] = 0;
    dailyPnl[d] += net;
  }

  const netPnl = balance - initialBalance;
  const totalTrades = sorted.reduce((acc, t) => acc + (parseInt(t.qty) || 1), 0);
  const winRate = sorted.length > 0 ? (winCount / sorted.length) * 100 : 0;
  
  let bestDay = { date: '', pnl: -Infinity };
  let worstDay = { date: '', pnl: Infinity };
  
  Object.entries(dailyPnl).forEach(([d, pnl]) => {
     if (pnl > bestDay.pnl) bestDay = { date: d, pnl };
     if (pnl < worstDay.pnl) worstDay = { date: d, pnl };
  });
  if (bestDay.pnl === -Infinity) bestDay = { date: '', pnl: 0 };
  if (worstDay.pnl === Infinity) worstDay = { date: '', pnl: 0 };

  let lastDayPnl = 0;
  const pnlDates = Object.keys(dailyPnl).sort();
  if (pnlDates.length > 0) {
      lastDayPnl = dailyPnl[pnlDates[pnlDates.length - 1]];
  }
  
  const consistencyPct = netPnl > 0 ? (bestDay.pnl / netPnl) * 100 : 0;

  return {
    currentBalance: balance,
    netPnl,
    grossPnl,
    totalFees,
    winRate,
    totalTrades,
    winningTrades: winCount,
    losingTrades: lossCount,
    totalDays: datesSet.size,
    maxDrawdown: Math.abs(maxDrawdown),
    maxProfit,
    bestDay,
    worstDay,
    lastDayPnl,
    consistencyPct,
    dailyPnl,
  };
}

function getPeriodStats(dailyPnl: Record<string, number>, netPnl: number, profitSplit: number) {
  const today = new Date();
  const todayStr = today.toISOString().slice(0,10);
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yestStr = yesterday.toISOString().slice(0,10);
  
  const thisWeekStart = getStartOfWeek(today).toISOString().slice(0,10);
  
  const lastWeekEnd = new Date(getStartOfWeek(today));
  lastWeekEnd.setDate(lastWeekEnd.getDate() - 1);
  const lastWeekStart = getStartOfWeek(lastWeekEnd).toISOString().slice(0,10);
  const lastWeekEndStr = lastWeekEnd.toISOString().slice(0,10);
  
  const thisMonthStart = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-01`;
  
  const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
  const lastMonthStart = `${lastMonthEnd.getFullYear()}-${String(lastMonthEnd.getMonth()+1).padStart(2,'0')}-01`;
  const lastMonthEndStr = lastMonthEnd.toISOString().slice(0,10);
  
  let todayPnl = 0, yestPnl = 0, weekPnl = 0, lastWeekPnl = 0, monthPnl = 0, lastMonthPnl = 0;
  
  Object.entries(dailyPnl).forEach(([d, pnl]) => {
    if (d === todayStr) todayPnl += pnl;
    if (d === yestStr) yestPnl += pnl;
    if (d >= thisWeekStart && d <= todayStr) weekPnl += pnl;
    if (d >= lastWeekStart && d <= lastWeekEndStr) lastWeekPnl += pnl;
    if (d >= thisMonthStart && d <= todayStr) monthPnl += pnl;
    if (d >= lastMonthStart && d <= lastMonthEndStr) lastMonthPnl += pnl;
  });
  
  const profitSplitVal = netPnl * ((profitSplit || 0) / 100);
  
  return { todayPnl, yestPnl, weekPnl, lastWeekPnl, monthPnl, lastMonthPnl, profitSplitVal };
}


// ─── calendar & weekly builder ───────────────────────────────────────────────

function buildCalendar(trades: any[], currentDate: Date) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  // group trades by date
  const byDate: Record<string, { pnl: number; count: number }> = {};
  for (const t of trades) {
    if (!t.date) continue;
    const k = t.date.slice(0, 10);
    if (!byDate[k]) byDate[k] = { pnl: 0, count: 0 };
    
    const gross = parseFloat(t.pnl) || 0;
    const fee = (parseFloat(t.commission_per_trade) || 0) * (parseInt(t.qty) || 1);
    byDate[k].pnl += (gross - fee);
    byDate[k].count += (parseInt(t.qty) || 1);
  }

  const startSun = new Date(firstDay);
  startSun.setDate(startSun.getDate() - startSun.getDay());

  const weeks: any[] = [];
  let cur = new Date(startSun);

  while (cur <= lastDay || cur.getDay() !== 0) {
    const week: any = { days: [], summary: { pnl: 0, trades: 0, winRate: 0 } };
    let wWin = 0, wTotal = 0;
    for (let d = 0; d < 7; d++) {
      const dateStr = `${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, '0')}-${String(cur.getDate()).padStart(2, '0')}`;
      const data = byDate[dateStr];
      const isCurrentMonth = cur.getMonth() === month;
      const isToday = dateStr === new Date().toISOString().slice(0, 10);
      const netPnl = data?.pnl ?? 0;
      const tradesCount = data?.count ?? 0;
      if (isCurrentMonth) {
        week.summary.pnl += netPnl;
        week.summary.trades += tradesCount;
        if (netPnl > 0) wWin++;
        wTotal += tradesCount > 0 ? 1 : 0;
      }
      week.days.push({ date: new Date(cur), dateStr, netPnl, tradesCount, isCurrentMonth, isToday });
      cur = new Date(cur.getFullYear(), cur.getMonth(), cur.getDate() + 1);
    }
    week.summary.winRate = wTotal > 0 ? (wWin / wTotal) * 100 : 0;
    weeks.push(week);
    if (cur > lastDay && cur.getDay() === 0) break;
  }

  return weeks;
}

function buildWeeklyData(trades: any[], weekStart: Date | null) {
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const daysData = dayNames.map((name, i) => ({ id: i, name, pnl: 0, trades: 0 }));
  const refDate = weekStart ?? getStartOfWeek(new Date());

  for (const t of trades) {
    if (!t.date) continue;
    const [y, m, d] = t.date.split('-').map(Number);
    const td = new Date(y, m - 1, d);
    const ws = getStartOfWeek(td);
    if (weekStart && ws.toDateString() !== refDate.toDateString()) continue;
    const dow = td.getDay();
    
    const gross = parseFloat(t.pnl) || 0;
    const fee = (parseFloat(t.commission_per_trade) || 0) * (parseInt(t.qty) || 1);
    daysData[dow].pnl += (gross - fee);
    daysData[dow].trades += (parseInt(t.qty) || 1);
  }

  const maxAbsPnl = Math.max(...daysData.map(d => Math.abs(d.pnl)), 0.01);
  return { daysData, maxAbsPnl };
}


// ─── main component ──────────────────────────────────────────────────────────

export default function SetupPreviewPage() {
  const [searchParams] = useSearchParams();
  const key = searchParams.get('key') || '';

  const [payload, setPayload] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!key) {
      setLoading(false);
      return;
    }

    const request = indexedDB.open('QuantaraPreviewDB', 1);
    request.onupgradeneeded = (e: any) => {
      e.target.result.createObjectStore('previews');
    };
    request.onsuccess = (e: any) => {
      const db = e.target.result;
      const tx = db.transaction('previews', 'readonly');
      const store = tx.objectStore('previews');
      const getReq = store.get(key);
      getReq.onsuccess = () => {
        if (getReq.result) {
          setPayload(getReq.result);
        } else {
          try {
            const raw = sessionStorage.getItem(key);
            if (raw) setPayload(JSON.parse(raw));
          } catch {}
        }
        setLoading(false);
      };
      getReq.onerror = () => {
        try {
          const raw = sessionStorage.getItem(key);
          if (raw) setPayload(JSON.parse(raw));
        } catch {}
        setLoading(false);
      };
    };
    request.onerror = () => {
      try {
        const raw = sessionStorage.getItem(key);
        if (raw) setPayload(JSON.parse(raw));
      } catch {}
      setLoading(false);
    };
  }, [key]);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedWeekDate, setSelectedWeekDate] = useState<Date | null>(null);
  
  const [renderError, setRenderError] = useState<any>(null);

  if (renderError) {
    return (
      <div className="min-h-screen p-8 text-white bg-red-900 flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">Erro de Renderização</h1>
        <pre className="bg-black/50 p-4 rounded text-xs overflow-auto max-w-full">
          {renderError.toString()}
        </pre>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white">
        <div className="text-center space-y-3">
          <p className="text-2xl font-bold opacity-60">Carregando preview...</p>
        </div>
      </div>
    );
  }

  if (!payload) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white">
        <div className="text-center space-y-3">
          <p className="text-2xl font-bold opacity-60">Nenhum dado de preview encontrado.</p>
          <p className="text-sm opacity-40">A chave expirou ou a aba foi aberta sem dados.</p>
        </div>
      </div>
    );
  }

  const { syntheticTrades, accountHistory, setupTitle, groupName, settings: rawSettings, theme: rawTheme } = payload;
  const theme = { ...DEFAULT_THEME, ...(rawTheme || {}) };
  const settings = { ...DEFAULT_SETTINGS, ...(rawSettings || {}) };
  const initialBalance = settings.initialBalance ?? 10000;

  try {
    return (
      <PreviewDashboard
        trades={syntheticTrades}
        accountHistory={accountHistory || []}
        initialBalance={initialBalance}
        setupTitle={setupTitle}
        groupName={groupName}
        theme={theme}
        settings={settings}
        currentDate={currentDate}
        setCurrentDate={setCurrentDate}
        selectedWeekDate={selectedWeekDate}
        setSelectedWeekDate={setSelectedWeekDate}
      />
    );
  } catch (err: any) {
    setRenderError(err.message || 'Erro desconhecido');
    return null;
  }
} // Closes SetupPreviewPage

// ─── PreviewDashboard ─────────────────────────────────────────────────────────

function PreviewDashboard({
  trades, accountHistory, initialBalance, setupTitle, groupName,
  theme, settings,
  currentDate, setCurrentDate,
  selectedWeekDate, setSelectedWeekDate
}: any) {
  const metrics = useMemo(() => calcMetrics(trades, initialBalance), [trades, initialBalance]);
  const calendarData = useMemo(() => buildCalendar(trades, currentDate), [trades, currentDate]);
  const periods = useMemo(() => getPeriodStats(metrics.dailyPnl, metrics.netPnl, settings.profitSplit || 0), [metrics.dailyPnl, metrics.netPnl, settings.profitSplit]);
  const weeklyData = useMemo(() => buildWeeklyData(trades, selectedWeekDate), [trades, selectedWeekDate]);

  // COMBINE curves
  const chartPoints = useMemo(() => {
    const normalizeDate = (dStr: any): string => {
       if (!dStr) return '';
       const s = String(dStr);
       if (s.includes('T')) return s.split('T')[0].slice(0, 10);
       return s.slice(0, 10);
    };

    // Build setup (synthetic) daily P&L map
    const sPnls: Record<string, number> = {};
    for(const t of trades) {
      const d = normalizeDate(t.date);
      if(!d) continue;
      const gross = Number(t.pnl) || 0;
      const fee = (Number(t.commission_per_trade) || 0) * (Number(t.qty) || 1);
      sPnls[d] = (sPnls[d] ?? 0) + (gross - fee);
    }

    // Build account daily P&L map
    // accountHistory was normalized in SetupsView: { date: 'YYYY-MM-DD', pnl: number }
    const aPnls: Record<string, number> = {};
    for(const t of accountHistory) {
      const d = normalizeDate(t.date);
      if(!d) continue;
      // pnl is already net (normalized before passing from SetupsView)
      const net = Number(t.pnl) || 0;
      aPnls[d] = (aPnls[d] ?? 0) + net;
    }

    const allDates = Array.from(new Set([
      ...Object.keys(sPnls),
      ...Object.keys(aPnls)
    ])).filter(Boolean).sort();

    let sBal = initialBalance;
    let aBal = initialBalance;
    
    const pts: { name: string; balance: number; accountBalance: number }[] =
      [{ name: 'Start', balance: initialBalance, accountBalance: initialBalance }];

    for(const d of allDates) {
       // Use ?? 0 to handle days that only exist in one of the maps
       if(Object.prototype.hasOwnProperty.call(sPnls, d)) sBal += sPnls[d];
       if(Object.prototype.hasOwnProperty.call(aPnls, d)) aBal += aPnls[d];
       pts.push({ name: d, balance: parseFloat(sBal.toFixed(2)), accountBalance: parseFloat(aBal.toFixed(2)) });
    }
    
    return pts;
  }, [trades, accountHistory, initialBalance]);


  const currency = settings.brokerCurrency || 'USD';
  const fmt = (v: number) => formatCurrency(v, currency);
  const fmtPct = (v: number) => `${v.toFixed(1)}%`;
  const glass = (c: string) => getGlassStyle(c);
  const isTrendUp = metrics.netPnl >= 0;

  // Render Table values
  const tableRows = [...trades].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  const grandTotal = useMemo(() => {
     return tableRows.reduce((acc, r: any) => {
        const op = r.qty || 1;
        const take = r.takes || 0;
        const loss = r.stops || 0;
        const gross = parseFloat(r.pnl) || 0;
        const fee = (parseFloat(r.commission_per_trade) || 0) * op;
        return {
           takes: acc.takes + take,
           stops: acc.stops + loss,
           gross: acc.gross + gross,
           fee: acc.fee + fee,
           net: acc.net + (gross - fee)
        };
     }, { takes: 0, stops: 0, gross: 0, fee: 0, net: 0 });
  }, [tableRows]);

  // Make sure we have a good background mapping from what's stored in App
  const bgStyle = theme.backgroundImage 
     ? { backgroundImage: `url(${theme.backgroundImage})` }
     : { backgroundColor: theme.fundoGeral || '#0a0a0a' };

  return (
    <div className="min-h-screen bg-cover bg-center bg-fixed" style={bgStyle}>
      <div className="min-h-screen relative backdrop-blur-[2px]">
      
      {/* Header Bar */}
      <div className="sticky top-0 z-50 flex items-center justify-between px-6 py-3 border-b shadow-md"
        style={{ backgroundColor: hexToRgba(theme.fundoCards || '#111', 0.95), borderColor: theme.contornoGeral }}>
        
        {/* LOGO na esquerda */}
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Quantara Logo" className="w-8 h-8 object-contain rounded-lg drop-shadow-md" onError={(e: any) => { e.target.style.display = 'none'; if(e.target.nextSibling) e.target.nextSibling.style.display = 'flex'; }} />
          <div className="hidden items-center justify-center w-8 h-8 rounded-xl" style={{ backgroundColor: theme.fundoPerfil || '#222' }}>
            <span className="font-bold text-xs" style={{ color: theme.textoPerfil || '#fff' }}>Q</span>
          </div>
          <span className="font-black tracking-widest uppercase hidden md:block text-sm" style={{ color: theme.textoPrincipal }}>Quantara</span>
        </div>

        {/* DADOs na direita */}
        <div className="flex items-center justify-end text-right">
           <span className="mr-4 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest bg-purple-500/20 text-purple-400 border border-purple-500/30 hidden sm:inline-block">
             Preview Temporário
           </span>
           <div className="flex items-center gap-3 sm:border-l sm:pl-4" style={{ borderColor: theme.contornoGeral }}>
             <div className="flex flex-col items-end">
               <span className="text-sm font-black" style={{ color: theme.textoPrincipal }}>{setupTitle}</span>
               <span className="text-[10px] font-bold opacity-50 uppercase tracking-widest" style={{ color: theme.textoSecundario }}>{groupName}</span>
             </div>
             <Eye size={18} style={{ color: '#a855f7' }} />
           </div>
        </div>
      </div>

      <div className="w-full max-w-[1600px] mx-auto px-4 md:px-8 py-4 md:py-6 space-y-4">
        
        {/* METRICS GRID - 2 ROWS OF 6 CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <MetricCard theme={theme} color="#3b82f6" icon={DollarSign} label="Current balance" main={fmt(metrics.currentBalance)} sub={`Start: ${fmt(initialBalance)}`} />
          <MetricCard theme={theme} color={metrics.netPnl >= 0 ? theme.textoPositivo : theme.textoNegativo} icon={TrendingUp} label="Net p&l" main={fmt(metrics.netPnl)} sub={fmtPct(initialBalance > 0 ? (metrics.netPnl / initialBalance) * 100 : 0)} />
          <MetricCard theme={theme} color={metrics.grossPnl >= 0 ? theme.textoPositivo : theme.textoNegativo} icon={Banknote} label="Gross p&l" main={fmt(metrics.grossPnl)} sub={`Fees: ${fmt(metrics.totalFees)}`} />
          <MetricCard theme={theme} color={metrics.winRate >= 50 ? theme.textoPositivo : theme.textoNegativo} icon={Percent} label="Win rate" main={fmtPct(metrics.winRate)} sub={`W: ${metrics.winningTrades} / L: ${metrics.losingTrades}`} />
          <MetricCard theme={theme} color={theme.textoPositivo} icon={Layers} label="Trades" main={String(metrics.totalTrades)} sub="Tot Ops" />
          <MetricCard theme={theme} color={theme.textoPositivo} icon={CalendarDays} label="Traded days" main={String(metrics.totalDays)} sub="Dias c/ Op" />
          
          <MetricCard theme={theme} color={theme.textoPositivo} icon={Activity} label="Best day" main={fmt(metrics.bestDay.pnl)} sub={metrics.bestDay.date || 'N/A'} />
          <MetricCard theme={theme} color={theme.textoNegativo} icon={AlertTriangle} label="Worst day" main={metrics.worstDay.pnl === 0 ? '$0.00' : `-${fmt(Math.abs(metrics.worstDay.pnl))}`} sub={metrics.worstDay.date || 'N/A'} />
          <MetricCard theme={theme} color={theme.textoPositivo} icon={TrendingUp} label="Max profit" main={fmt(metrics.maxProfit)} sub={fmtPct(initialBalance > 0 ? (metrics.maxProfit / initialBalance) * 100 : 0)} />
          <MetricCard theme={theme} color={theme.textoNegativo} icon={AlertTriangle} label="Max drawdown" main={`-${fmt(metrics.maxDrawdown)}`} sub={fmtPct(metrics.peakBalance > 0 ? (metrics.maxDrawdown / metrics.peakBalance) * 100 : 0)} />
          <MetricCard theme={theme} color={metrics.consistencyPct <= (settings.consistencyTarget || 30) ? theme.textoPositivo : theme.textoNegativo} icon={Target} label="Consistent target" main={`${metrics.consistencyPct.toFixed(1)}%`} sub={`Target: ${settings.consistencyTarget || 30}%`} />
          <MetricCard theme={theme} color={theme.textoNegativo} icon={AlertTriangle} label="Account drawdown" main={fmt(parseFloat(settings.totalStopLoss || 0))} sub={`Último dia: ${fmt(metrics.lastDayPnl)}`} />
        </div>

        {/* LATEST RESULTS BAR - below cards (matches Dashboard position) */}
        <div className="rounded-xl px-3 py-2 md:py-2.5 flex items-center justify-between shadow-sm transition-all w-full gap-2 md:gap-4" style={glass(theme.fundoCards)}>
          <div className="p-1.5 rounded-md flex items-center justify-center shrink-0" style={{ backgroundColor: hexToRgba(theme.linhaGrafico || '#3b82f6', 0.15), color: theme.linhaGrafico || '#3b82f6' }}>
            <Activity size={16} className="shrink-0" />
          </div>
          <div className="flex-1 flex items-center justify-start lg:justify-evenly gap-6 lg:gap-2 overflow-x-auto hide-scrollbar w-full">
            {[
              { label: 'Today', value: periods.todayPnl },
              { label: 'Yesterday', value: periods.yestPnl },
              { label: 'This Week', value: periods.weekPnl },
              { label: 'Last Week', value: periods.lastWeekPnl },
              { label: 'This Month', value: periods.monthPnl },
              { label: 'Last Month', value: periods.lastMonthPnl },
              { label: 'Profit Split', value: periods.profitSplitVal, customColor: theme.linhaGrafico },
            ].map((item: any, idx, arr) => (
              <React.Fragment key={item.label}>
                <div className="flex flex-col text-center shrink-0">
                  <span className="font-bold text-sm leading-none"
                    style={{ color: item.customColor ? item.customColor : (item.value >= 0 ? theme.textoPositivo : theme.textoNegativo) }}>
                    {fmt(item.value)}
                  </span>
                  <span className="text-[8px] md:text-[9px] font-medium opacity-80 mt-1.5 leading-none uppercase tracking-wider" style={{ color: theme.textoSecundario }}>{item.label}</span>
                </div>
                {idx < arr.length - 1 && (
                  <div className="hidden lg:block w-px h-6 opacity-30 shrink-0" style={{ backgroundColor: theme.contornoGeral }}></div>
                )}
              </React.Fragment>
            ))}
          </div>
          <div className="p-1.5 rounded-md flex items-center justify-center shrink-0" style={{ backgroundColor: hexToRgba(theme.linhaGrafico || '#3b82f6', 0.15), color: theme.linhaGrafico || '#3b82f6' }}>
            <Activity size={16} className="shrink-0" />
          </div>
        </div>

        {/* ROW 2: EQUITY CHART + WEEKLY CHARTS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 auto-rows-fr">
           {/* EQUITY CURVE */}
           <div className="lg:col-span-1 h-[300px] md:h-[350px]">
             <div className="rounded-xl p-4 md:p-6 shadow-sm transition-all w-full h-full flex flex-col overflow-hidden" style={glass(theme.fundoCards)}>
               <div className="flex items-center gap-2 mb-4 shrink-0">
                 <TrendingUp size={14} style={{ color: theme.textoSecundario }} />
                 <span className="text-[15px] font-bold capitalize" style={{ color: theme.textoSecundario }}>Curva de capital</span>
               </div>
               <div className="flex gap-3 text-[10px] font-bold mb-2 shrink-0" style={{ color: theme.textoSecundario }}>
                 <div className="flex items-center gap-1"><div className="w-3 h-[2px] rounded" style={{ backgroundColor: isTrendUp ? theme.textoPositivo : theme.textoNegativo }}></div> Setup</div>
                 <div className="flex items-center gap-1"><div className="w-3 h-0 border-t border-dashed" style={{ borderColor: theme.linhaGrafico || '#a855f7' }}></div> Master Account</div>
               </div>
               <div className="w-full flex-1 min-h-[150px] overflow-hidden">
                 <ResponsiveContainer width="100%" height="100%">
                   <LineChart data={chartPoints} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.contornoGeral} />
                     <XAxis dataKey="name" hide />
                     <YAxis domain={['auto', 'auto']} stroke={theme.textoSecundario} fontSize={10}
                       tickFormatter={v => formatCurrency(v, currency).replace(/[.]\d+/, '')} axisLine={false} tickLine={false} />
                     <RechartsTooltip
                       contentStyle={{ backgroundColor: hexToRgba(theme.fundoCards, 0.9), borderColor: theme.contornoGeral, borderRadius: '8px' }}
                       itemStyle={{ color: theme.textoPrincipal, fontWeight: 'bold' }}
                       labelStyle={{ display: 'none' }}
                       formatter={(v: number, name: string) => [fmt(v), name === 'balance' ? 'Setup Net' : 'Account']}
                     />
                     <Line type="monotone" name="balance" dataKey="balance" stroke={isTrendUp ? theme.textoPositivo : theme.textoNegativo} strokeWidth={3} dot={false} activeDot={{ r: 5 }} />
                     <Line type="monotone" name="accountBalance" dataKey="accountBalance" stroke={theme.linhaGrafico || '#a855f7'} strokeWidth={1.5} strokeDasharray="5 5" dot={false} activeDot={false} opacity={0.6} />
                   </LineChart>
                 </ResponsiveContainer>
               </div>
             </div>
           </div>

           {/* Trades por Dia */}
           <div className="lg:col-span-1 h-[300px] md:h-[350px]">
             <div className="rounded-xl p-4 md:p-6 shadow-sm flex flex-col transition-all w-full h-full overflow-hidden" style={glass(theme.fundoCards)}>
               <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 shrink-0 gap-3">
                 <div className="flex items-center gap-2">
                   <BarChart2 size={16} style={{ color: theme.textoSecundario }} />
                   <span className="text-[15px] font-bold capitalize" style={{ color: theme.textoSecundario }}>Trades por dia</span>
                 </div>
                 <WeekNav selectedWeekDate={selectedWeekDate} setSelectedWeekDate={setSelectedWeekDate} theme={theme} />
               </div>
               <div className="w-full flex-1 min-h-[150px] overflow-hidden">
                 <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={weeklyData.daysData} margin={{ top: 25, right: 10, left: -20, bottom: 0 }}>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.contornoGeral} />
                     <XAxis dataKey="name" stroke={theme.textoSecundario} tickLine={false} axisLine={false} tick={{ fontSize: 13, fontWeight: 'normal' }} />
                     <YAxis stroke={theme.textoSecundario} tickLine={false} axisLine={false} tick={{ fontSize: 13, fontWeight: 'normal' }} />
                     <RechartsTooltip cursor={{ fill: 'rgba(128,128,128,0.1)' }}
                       contentStyle={{ backgroundColor: hexToRgba(theme.fundoCards, 0.9), borderRadius: '8px', borderColor: theme.contornoGeral }}
                       itemStyle={{ color: theme.textoPrincipal, fontWeight: 'bold' }} />
                     <Bar dataKey="trades" name="Trades" radius={[4, 4, 0, 0]} isAnimationActive={false} fill={theme.contornoHoje || '#3b82f6'}>
                       <LabelList dataKey="trades" position="top" offset={10} fill="#FFD700" fontSize={14} fontWeight="bold" />
                     </Bar>
                   </BarChart>
                 </ResponsiveContainer>
               </div>
             </div>
           </div>

           {/* P&L por Dia */}
           <div className="lg:col-span-1 h-[300px] md:h-[350px]">
             <div className="rounded-xl p-4 md:p-6 shadow-sm flex flex-col transition-all w-full h-full overflow-hidden" style={glass(theme.fundoCards)}>
               <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 shrink-0 gap-3">
                 <div className="flex items-center gap-2">
                   <DollarSign size={16} style={{ color: theme.textoSecundario }} />
                   <span className="text-[15px] font-bold capitalize" style={{ color: theme.textoSecundario }}>P&l por dia</span>
                 </div>
                 <WeekNav selectedWeekDate={selectedWeekDate} setSelectedWeekDate={setSelectedWeekDate} theme={theme} />
               </div>
               <div className="w-full flex flex-col gap-4 flex-1 justify-center min-h-[200px]">
                 {weeklyData.daysData.map((day: any) => {
                   const widthPct = weeklyData.maxAbsPnl > 0 ? (Math.abs(day.pnl) / weeklyData.maxAbsPnl) * 100 : 0;
                   const pos = day.pnl >= 0;
                   return (
                     <div key={day.id} className="flex items-center w-full">
                       <div className="min-w-[30px] md:min-w-[40px] text-xs md:text-sm text-right pr-2 md:pr-4 font-normal whitespace-nowrap" style={{ color: theme.textoSecundario }}>{day.name}</div>
                       <div className="flex-1 flex items-center h-5 md:h-6">
                         <div className="w-1/2 flex justify-end pr-[1px] h-full z-10">{!pos && day.pnl !== 0 && (<div className="h-full rounded-l-sm" style={{ width: `${widthPct}%`, backgroundColor: theme.textoNegativo, opacity: 0.9 }}></div>)}</div>
                         <div className="w-1/2 flex justify-start pl-[1px] h-full z-10">{pos && day.pnl !== 0 && (<div className="h-full rounded-r-sm" style={{ width: `${widthPct}%`, backgroundColor: theme.textoPositivo, opacity: 0.9 }}></div>)}</div>
                       </div>
                       <div className="min-w-[70px] md:min-w-[90px] text-[10px] md:text-xs text-right font-bold tracking-tight pl-2 md:pl-4 whitespace-nowrap" style={{ color: pos ? theme.textoPositivo : theme.textoNegativo }}>{pos ? '' : '-'} {fmt(Math.abs(day.pnl))}</div>
                     </div>
                   );
                 })}
               </div>
             </div>
           </div>
        </div>

        {/* BOTTOM SECTION: CALENDAR + LIST */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Calendar (2 Columns) */}
          <div className="lg:col-span-2">
            <div className="relative rounded-xl p-4 md:p-6 shadow-sm w-full transition-all h-full flex flex-col" style={glass(theme.fundoCards)}>
              <div className="flex flex-col xl:flex-row xl:items-center justify-between mb-4 gap-3 shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex items-center gap-2">
                    <CalendarDays size={16} style={{ color: theme.textoSecundario }} />
                    <span className="text-[15px] font-bold capitalize" style={{ color: theme.textoSecundario }}>Calendário</span>
                  </div>
                  <span className="xl:hidden text-xs font-bold px-2 py-0.5 rounded-full whitespace-nowrap"
                    style={{ color: calendarData.reduce((a: number, w: any) => a + w.summary.pnl, 0) >= 0 ? theme.textoPositivo : theme.textoNegativo, backgroundColor: calendarData.reduce((a: number, w: any) => a + w.summary.pnl, 0) >= 0 ? `${theme.textoPositivo}18` : `${theme.textoNegativo}18` }}>
                    {fmt(calendarData.reduce((a: number, w: any) => a + w.summary.pnl, 0))}
                  </span>
                </div>
                <div className="hidden xl:flex flex-1 justify-center items-center gap-2">
                  <span className="text-xs font-semibold" style={{ color: theme.textoSecundario }}>Month P&L:</span>
                  <span className="text-base font-bold" style={{ color: calendarData.reduce((a: number, w: any) => a + w.summary.pnl, 0) >= 0 ? theme.textoPositivo : theme.textoNegativo }}>
                    {fmt(calendarData.reduce((a: number, w: any) => a + w.summary.pnl, 0))}
                  </span>
                </div>
                <div className="flex gap-1 items-center rounded-lg p-1 w-full xl:w-auto justify-between shadow-sm border" style={{ backgroundColor: hexToRgba(theme.fundoPrincipal || '#000', 0.4), borderColor: theme.contornoGeral }}>
                  <div className="flex items-center">
                    <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
                      className="p-1 rounded transition-colors hover:bg-white/10" style={{ color: theme.textoSecundario }}><ChevronLeft size={14} /></button>
                    <span className="capitalize font-bold px-2 min-w-[110px] text-center text-[10px]" style={{ color: theme.textoPrincipal }}>{new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(currentDate)}</span>
                    <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
                      className="p-1 rounded transition-colors hover:bg-white/10" style={{ color: theme.textoSecundario }}><ChevronRight size={14} /></button>
                  </div>
                  <div className="w-px h-3 opacity-30 mx-1" style={{ backgroundColor: theme.contornoGeral }}></div>
                  <button onClick={() => setCurrentDate(new Date())} className="text-[10px] px-2 py-1 font-bold rounded-md hover:bg-white/10 transition-colors whitespace-nowrap" style={{ color: theme.linhaGrafico }}>This Month</button>
                </div>
              </div>
              <div className="hidden lg:block w-full mt-2 flex-1">
                <div className="grid grid-cols-8 gap-2 h-full content-start">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Week'].map((d, i) => (
                    <div key={d} className="text-center text-xs font-bold tracking-wider mb-2" style={{ color: theme.textoSecundario }}>
                      {i === 7 ? 'Week' : new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(new Date(2024, 0, i + 7))}
                    </div>
                  ))}
                  {calendarData.map((week: any, widx: number) => {
                    const wPnl = week.summary.pnl;
                    const wBg = wPnl > 0 ? theme.fundoDiaPositivo : wPnl < 0 ? theme.fundoDiaNegativo : theme.fundoPrincipal;
                    return (
                      <React.Fragment key={widx}>
                        {week.days.map((day: any, didx: number) => {
                          const bg = day.netPnl > 0 ? theme.fundoDiaPositivo : day.netPnl < 0 ? theme.fundoDiaNegativo : 'transparent';
                          const border = day.isToday ? theme.contornoHoje : day.netPnl > 0 ? theme.contornoPositivo : day.netPnl < 0 ? theme.contornoNegativo : theme.contornoGeral;
                          return (
                            <div key={`${day.dateStr}-${didx}`}
                              style={{ backgroundColor: day.isCurrentMonth ? bg : 'transparent', borderColor: border, borderWidth: 1, borderStyle: 'solid', opacity: day.isCurrentMonth ? 1 : 0.1 }}
                              className="relative p-1 lg:p-2 rounded-lg aspect-square flex flex-col justify-between transition-all shadow-sm hover:scale-[1.03] hover:z-50">
                              <div className="flex justify-between items-start w-full">
                                <span className="text-xs font-bold" style={{ color: theme.textoSecundario }}>{day.date.getDate()}</span>
                              </div>
                              <div className="flex flex-col items-center flex-1 justify-center gap-0.5 w-full text-center">
                                <div className="text-[11px] lg:text-[13px] font-bold tracking-tighter leading-none" style={{ color: day.netPnl > 0 ? theme.textoPositivo : day.netPnl < 0 ? theme.textoNegativo : theme.textoSecundario }}>
                                  {day.tradesCount > 0 ? fmt(day.netPnl) : ''}
                                </div>
                                {day.tradesCount > 0 && <div className="text-[9px] lg:text-[10px] leading-none whitespace-nowrap" style={{ color: theme.textoSecundario }}>{day.tradesCount} Trades</div>}
                              </div>
                            </div>
                          );
                        })}
                        <div key={`summary-${widx}`} className="relative p-1 lg:p-2 rounded-lg aspect-square flex flex-col justify-between transition-all shadow-sm hover:scale-[1.03] hover:z-50"
                          style={{ backgroundColor: hexToRgba(wBg || theme.fundoPrincipal, 0.6), borderColor: theme.contornoGeral, borderWidth: 1, borderStyle: 'solid' }}>
                          <div className="flex justify-between items-start w-full">
                            <span className="text-xs font-bold" style={{ color: theme.textoSecundario }}>W{widx + 1}</span>
                          </div>
                          <div className="flex flex-col items-center flex-1 justify-center gap-0.5 w-full text-center">
                            <div className="text-[11px] lg:text-[13px] font-bold tracking-tighter leading-none" style={{ color: wPnl >= 0 ? theme.textoPositivo : theme.textoNegativo }}>
                              {wPnl !== 0 ? fmt(wPnl) : ''}
                            </div>
                            {week.summary.trades > 0 && <div className="text-[9px] lg:text-[10px] leading-none whitespace-nowrap mt-0.5" style={{ color: theme.textoSecundario }}>{week.summary.trades} Trades</div>}
                          </div>
                        </div>
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Trade List (1 Column) - matches miniHistoryBlock */}
          <div className="lg:col-span-1 h-[400px] lg:h-auto relative">
            <div className="lg:absolute lg:inset-0 w-full h-full">
            <div className="rounded-xl shadow-sm border flex flex-col h-full" style={{ ...glass(theme.fundoCards), borderColor: theme.contornoGeral }}>
            <div className="flex items-center gap-2 p-4 border-b shrink-0" style={{ borderColor: theme.contornoGeral }}>
              <List size={14} style={{ color: theme.textoSecundario }} />
              <span className="text-[11px] font-bold tracking-wide capitalize" style={{ color: theme.textoSecundario }}>Lançamentos diários</span>
            </div>
            <div className="flex-1 relative bg-black/10 rounded-b-xl overflow-hidden">
               <div className="absolute inset-0 overflow-y-auto hide-scrollbar">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="sticky top-0 z-10 shadow-sm" style={{ backgroundColor: '#000000FA' }}>
                    <tr className="border-b uppercase font-bold tracking-widest opacity-80" style={{ borderColor: theme.contornoGeral, color: theme.textoPrincipal }}>
                      <th className="py-3 px-3 text-center">Data</th>
                      <th className="py-3 px-2 text-center text-green-400">Take</th>
                      <th className="py-3 px-2 text-center text-red-400">Loss</th>
                      <th className="py-3 px-3 text-right">Gross</th>
                      <th className="py-3 px-3 text-right text-orange-400">Fee</th>
                      <th className="py-3 px-3 text-right">Net</th>
                  </tr>
                </thead>
                <tbody>
                  {tableRows.map((r: any) => {
                      const op = r.qty;
                      const take = r.takes || 0;
                      const loss = r.stops || 0;
                      const gross = parseFloat(r.pnl) || 0;
                      const fee = (parseFloat(r.commission_per_trade) || 0) * op;
                      const net = gross - fee;
                      return (
                        <tr key={r.id} className="border-b transition-colors hover:bg-white/5 group" style={{ borderColor: theme.contornoGeral }}>
                          <td className="py-3 px-3 text-center font-semibold text-xs" style={{ color: theme.textoPrincipal }}>{r.date}</td>
                          <td className="py-3 px-2 text-center font-bold text-sm" style={{ color: theme.textoPositivo }}>{take}</td>
                          <td className="py-3 px-2 text-center font-bold text-sm" style={{ color: theme.textoNegativo }}>{loss}</td>
                          <td className="py-3 px-3 text-right font-bold text-xs" style={{ color: gross >= 0 ? theme.textoPositivo : theme.textoNegativo }}>
                            {gross < 0 ? '-' : ''}${Math.abs(gross).toFixed(2)}
                          </td>
                          <td className="py-3 px-3 text-right text-xs font-semibold" style={{ color: 'rgba(251, 146, 60, 0.9)' }}>
                            ${fee.toFixed(2)}
                          </td>
                          <td className="py-3 px-3 text-right font-bold text-xs" style={{ color: net >= 0 ? theme.textoPositivo : theme.textoNegativo }}>
                            {net < 0 ? '-' : ''}${Math.abs(net).toFixed(2)}
                          </td>
                        </tr>
                      )
                  })}
                  {tableRows.length === 0 && (
                    <tr><td colSpan={6} className="text-center py-6 opacity-50">Sem dados operacionais para listar.</td></tr>
                  )}
                </tbody>
                {tableRows.length > 0 && (
                  <tfoot className="sticky bottom-0 z-10" style={{ backgroundColor: theme.fundoCards || '#0a0a0a' }}>
                    <tr className="border-t uppercase font-bold tracking-widest" style={{ borderColor: theme.contornoGeral, color: theme.textoPrincipal }}>
                      <td className="py-3 px-3 text-center text-xs">TOTAL</td>
                      <td className="py-3 px-2 text-center text-sm font-bold text-green-400">{grandTotal.takes}</td>
                      <td className="py-3 px-2 text-center text-sm font-bold text-red-400">{grandTotal.stops}</td>
                      <td className="py-3 px-3 text-right text-xs font-bold" style={{ color: grandTotal.gross >= 0 ? theme.textoPositivo : theme.textoNegativo }}>
                        {grandTotal.gross < 0 ? '-' : ''}${Math.abs(grandTotal.gross).toFixed(2)}
                      </td>
                      <td className="py-3 px-3 text-right text-xs font-semibold" style={{ color: 'rgba(251, 146, 60, 0.9)' }}>
                        ${grandTotal.fee.toFixed(2)}
                      </td>
                      <td className="py-3 px-3 text-right text-xs font-bold" style={{ color: grandTotal.net >= 0 ? theme.textoPositivo : theme.textoNegativo }}>
                        {grandTotal.net < 0 ? '-' : ''}${Math.abs(grandTotal.net).toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
               </div>
            </div>
            </div>
            </div>
          </div>

        </div>

      </div>
      </div>
    </div>
  );
}

function MetricCard({ theme, color, icon: Icon, label, main, sub, sub2 }: any) {
   const glass = (c: string) => getGlassStyle(c);
   return (
      <div className="rounded-xl p-3 md:p-4 flex flex-col justify-between shadow-sm group transition-all duration-300 hover:-translate-y-1 w-full h-full min-h-[105px]"
           style={glass(theme.fundoCards)}>
        <div className="flex items-start justify-between mb-2 gap-2" style={{ color: theme.textoSecundario }}>
          <span className="text-[11px] font-bold capitalize tracking-wide mt-1 whitespace-normal leading-tight">{label}</span>
          <div className="p-1.5 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110 shrink-0"
               style={{ backgroundColor: hexToRgba(color, 0.15), color: color }}>
            <Icon size={14} className="shrink-0" />
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-center sm:items-end justify-center sm:justify-between my-auto sm:my-0 sm:mt-auto w-full gap-1.5 sm:gap-0">
          <div className="flex flex-col items-center sm:items-start w-full">
            <span className="font-bold leading-tight text-center sm:text-left" style={{ fontSize: 'clamp(1.1rem, 1.2vw + 0.5rem, 1.5rem)', color }}>{main}</span>
            {sub && <span className="text-[10px] break-words font-medium mt-1 opacity-80 text-center sm:text-left" style={{ color: theme.textoSecundario }}>{sub}</span>}
          </div>
          {sub2 && (
            <div className="flex flex-col justify-center items-center sm:justify-end sm:items-end sm:-mb-1 sm:-mr-1 md:-mb-1.5 md:-mr-1.5 shrink-0 w-full sm:w-auto">
              <span className="text-sm sm:text-base lg:text-lg font-bold leading-none" style={{ color }}>{sub2}</span>
            </div>
          )}
        </div>
      </div>
   );
}

function WeekNav({ selectedWeekDate, setSelectedWeekDate, theme }: any) {
  return (
    <div className="flex gap-1 items-center rounded-lg p-0.5 border text-[10px] bg-black/40" style={{ borderColor: theme.contornoGeral }}>
      <button onClick={() => setSelectedWeekDate((prev: Date | null) => prev ? new Date(prev.getTime() - 7 * 86400000) : getStartOfWeek(new Date()))}
        className="p-1 rounded hover:bg-white/10 transition" style={{ color: theme.textoSecundario }}><ChevronLeft size={10} /></button>
      <span className="font-bold min-w-[32px] text-center uppercase tracking-widest" style={{ color: theme.textoPrincipal }}>
        {selectedWeekDate ? new Intl.DateTimeFormat('en-US', { day: '2-digit', month: 'short' }).format(selectedWeekDate) : 'ALL'}
      </span>
      <button onClick={() => setSelectedWeekDate((prev: Date | null) => prev ? new Date(prev.getTime() + 7 * 86400000) : getStartOfWeek(new Date()))}
        className="p-1 rounded hover:bg-white/10 transition" style={{ color: theme.textoSecundario }}><ChevronRight size={10} /></button>
      {selectedWeekDate !== null && (
         <button onClick={() => setSelectedWeekDate(null)} className="px-1 py-1 rounded hover:bg-white/10 font-bold ml-1 transition"
                 style={{ color: theme.textoPrincipal }}><ChevronLeft size={10} className="rotate-45" /></button>
      )}
    </div>
  );
}
