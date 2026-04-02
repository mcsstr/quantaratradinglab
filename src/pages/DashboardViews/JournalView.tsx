import React, { useState, useMemo, useEffect } from 'react';
import { 
  CalendarDays, Flame, Scale, Snowflake, Tornado, Plus, 
  Tag, Save, ChevronRight, ChevronLeft, Smile, Frown, Meh, Zap, Coffee
} from 'lucide-react';
import RichTextEditor from '../../components/RichTextEditor';

export default function JournalView({
  theme,
  getGlassStyle,
  settings,
  t,
  lang,
  trades,
  activeAccountId,
  journals,
  saveJournal,
  deleteJournal,
  setups
}: any) {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [accountMode, setAccountMode] = useState<'specific' | 'general'>('specific');
  const [leftNavSelection, setLeftNavSelection] = useState<string>('All Entries');
  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date());
  const [isEditing, setIsEditing] = useState(false);
  const [rssNews, setRssNews] = useState<any[]>([]);
  const [ecoEvents, setEcoEvents] = useState<any[]>([]);
  const [ecoLoading, setEcoLoading] = useState(true);
  const [ecoError, setEcoError] = useState(false);
  const [ecoFilterCurrency, setEcoFilterCurrency] = useState('ALL');
  const [ecoFilterImpact, setEcoFilterImpact] = useState('ALL');

  const fetchEconPulse = async () => {
    try {
      setEcoLoading(true);
      setEcoError(false);
      // Fetches real economic data from public ForexFactory API proxy
      const res = await fetch('https://nfs.faireconomy.media/ff_calendar_thisweek.json');
      if (!res.ok) throw new Error('API Error');
      const data = await res.json();

      const todayStr = new Date().toLocaleDateString('en-CA'); // Gets YYYY-MM-DD reliably
      const todayEvents = data.filter((e:any) => e.date && e.date.startsWith(todayStr));
      
      const formatted = todayEvents.map((e:any) => {
        const dateObj = new Date(e.date);
        const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return {
           title: e.title,
           currency: e.country,
           impact: e.impact.toUpperCase(), 
           time: timeStr,
           forecast: e.forecast || '-'
        };
      });
      setEcoEvents(formatted);
    } catch (err) {
      console.warn("EconPulse API Error:", err);
      setEcoEvents([]);
      setEcoError(true);
    } finally {
      setEcoLoading(false);
    }
  };

  useEffect(() => {
    fetchEconPulse();
    const interval = setInterval(fetchEconPulse, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);
  useEffect(() => {
    fetch('https://api.rss2json.com/v1/api.json?rss_url=https://www.cnbc.com/id/10000664/device/rss/rss.html')
      .then(res => res.json())
      .then(data => {
        if (data.items) setRssNews(data.items.slice(0, 10));
      }).catch(err => console.error("News fetch error:", err));
  }, []);

  const currentJournal = useMemo(() => {
    return journals.find((j: any) =>
      j.date === selectedDate &&
      (accountMode === 'general' ? j.account_id === null : j.account_id === activeAccountId)
    );
  }, [journals, selectedDate, activeAccountId, accountMode]);

  const [marketSentiment, setMarketSentiment] = useState<string>('');
  const [traderMood, setTraderMood] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [tags, setTags] = useState<string>('');

  const handleSelectDate = (dateStr: string) => {
    setSelectedDate(dateStr);
    const j = journals.find((jj: any) =>
      jj.date === dateStr &&
      (accountMode === 'general' ? jj.account_id === null : jj.account_id === activeAccountId)
    );
    if (j) {
      setIsEditing(true);
      setMarketSentiment(j.sentiment || '');
      setTraderMood(j.trader_mood || '');
      setNotes(j.notes || '');
      setTags(j.tags || '');
    } else {
      setIsEditing(false);
      setMarketSentiment('');
      setTraderMood('');
      setNotes('');
      setTags('');
    }
  };

  const handleNewEntry = () => {
    const today = new Date().toISOString().split('T')[0];
    setSelectedDate(today);
    setIsEditing(false);
    setMarketSentiment('');
    setTraderMood('');
    setNotes('');
    setTags('');
  };

  const dayTrades = useMemo(() => {
    return trades.filter((t: any) => 
      t.date === selectedDate && 
      (accountMode === 'general' ? true : t.accountId === activeAccountId)
    );
  }, [trades, selectedDate, activeAccountId, accountMode]);

  // Net P&L (deducting fees)
  const dailyPnl = dayTrades.reduce((acc: number, cur: any) => {
    return acc + (parseFloat(cur.pnl) || 0) - Math.abs(parseFloat(cur.commission) || 0);
  }, 0);

  const winRate = dayTrades.length > 0
    ? (dayTrades.filter((t: any) => parseFloat(t.pnl) > 0).length / dayTrades.length) * 100
    : 0;

  const handleSave = () => {
    saveJournal({
      id: currentJournal?.id || crypto.randomUUID(),
      account_id: accountMode === 'general' ? null : activeAccountId,
      date: selectedDate,
      sentiment: marketSentiment,
      trader_mood: traderMood,
      notes,
      tags,
      screenshot_url: currentJournal?.screenshot_url || ''
    });
    if (!isEditing) {
      setNotes('');
      setMarketSentiment('');
      setTraderMood('');
      setTags('');
    }
  };

  const marketSentiments = [
    { id: 'Bullish', icon: Flame, color: '#f97316' },
    { id: 'Neutral', icon: Scale, color: '#60a5fa' },
    { id: 'Bearish', icon: Snowflake, color: '#38bdf8' },
    { id: 'Volatile', icon: Tornado, color: '#9ca3af' }
  ];

  const traderMoods = [
    { id: 'Focused', icon: Zap, color: '#eab308' },
    { id: 'Calm', icon: Coffee, color: '#10b981' },
    { id: 'Good', icon: Smile, color: '#22c55e' },
    { id: 'Neutral', icon: Meh, color: '#94a3b8' },
    { id: 'Bad', icon: Frown, color: '#ef4444' },
  ];

  const getMarketSentimentIcon = (sentId: string, size: number = 14) => {
    const s = marketSentiments.find(x => x.id === sentId);
    if (!s) return null;
    const Icon = s.icon;
    return <Icon size={size} color={s.color} />;
  };

  const getTraderMoodIcon = (moodId: string, size: number = 14) => {
    const m = traderMoods.find(x => x.id === moodId);
    if (!m) return null;
    const Icon = m.icon;
    return <Icon size={size} color={m.color} />;
  };

  const navItems = ['All Entries', 'Daily Recap', 'Strategies', 'Emotional Stats', 'Reports'];

  const renderCalendar = () => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    let days: (Date | null)[] = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));

    return (
      <div>
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => setCalendarMonth(new Date(year, month - 1, 1))} className="opacity-50 hover:opacity-100 p-0.5">
            <ChevronLeft size={13} style={{ color: theme.textoPrincipal }} />
          </button>
          <span className="text-[10px] font-bold tracking-wider uppercase" style={{ color: theme.textoPrincipal }}>
            {calendarMonth.toLocaleDateString(lang, { month: 'long', year: 'numeric' })}
          </span>
          <button onClick={() => setCalendarMonth(new Date(year, month + 1, 1))} className="opacity-50 hover:opacity-100 p-0.5">
            <ChevronRight size={13} style={{ color: theme.textoPrincipal }} />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-0.5">
          {['S','M','T','W','T','F','S'].map((d, i) => (
            <div key={i} className="text-center text-[9px] font-bold opacity-30 pb-0.5" style={{ color: theme.textoPrincipal }}>{d}</div>
          ))}
          {days.map((d, i) => {
            if (!d) return <div key={i} className="min-h-[38px]" />;

            const dateStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            const isSelected = selectedDate === dateStr;

            let info = null;
            if (leftNavSelection === 'All Entries') {
              const cnt = trades.filter((tt: any) => tt.date === dateStr && tt.accountId === activeAccountId).length;
              if (cnt > 0) info = <span className="text-yellow-400 font-black" style={{ fontSize: '10px' }}>{cnt}</span>;
            } else if (leftNavSelection === 'Daily Recap') {
              const dTr = trades.filter((tt: any) => tt.date === dateStr && tt.accountId === activeAccountId);
              const pnl = dTr.reduce((a: number, c: any) => a + (parseFloat(c.pnl) || 0), 0);
              if (dTr.length > 0) info = <span className={`font-black ${pnl >= 0 ? 'text-green-500' : 'text-red-500'}`} style={{ fontSize: '9px' }}>{pnl >= 0 ? '+' : '-'}${Math.abs(pnl).toFixed(0)}</span>;
            } else if (leftNavSelection === 'Strategies') {
              const has = trades.some((tt: any) => tt.date === dateStr && tt.accountId === activeAccountId && tt.setup_id);
              if (has) info = <Tag size={8} className="text-blue-400" />;
            } else if (leftNavSelection === 'Emotional Stats') {
              const jj = journals.find((jjj: any) => jjj.date === dateStr && (accountMode === 'specific' ? jjj.account_id === activeAccountId : jjj.account_id === null));
              if (jj?.sentiment) info = getMarketSentimentIcon(jj.sentiment, 9);
              else if (jj?.trader_mood) info = getTraderMoodIcon(jj.trader_mood, 9);
            } else if (leftNavSelection === 'Reports') {
              const jj = journals.find((jjj: any) => jjj.date === dateStr && (accountMode === 'specific' ? jjj.account_id === activeAccountId : jjj.account_id === null));
              if (jj) info = <span className="text-yellow-500 font-bold" style={{ fontSize: '9px' }}>✓</span>;
            }

            return (
              <div
                key={i}
                onClick={() => handleSelectDate(dateStr)}
                className="flex flex-col items-center justify-start pt-1 pb-0.5 rounded cursor-pointer border transition-all min-h-[38px] hover:bg-white/5"
                style={{ borderColor: isSelected ? '#eab308' : 'transparent', background: isSelected ? 'rgba(234,179,8,0.07)' : 'transparent' }}
              >
                <div className="text-[10px] font-bold leading-none" style={{ color: isSelected ? '#eab308' : theme.textoPrincipal }}>{d.getDate()}</div>
                <div className="flex items-center justify-center mt-0.5 h-3.5">{info}</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="flex w-full min-h-[calc(100vh-140px)] animate-tab-enter relative" style={{ background: theme.fundoGeral }}>

      {/* LEFT SIDEBAR — navigation and cnbc news */}
      <div className="w-16 md:w-64 self-stretch border-r shrink-0 hidden sm:flex flex-col pt-5 pb-0 px-2 md:px-4" style={{ borderColor: theme.contornoGeral, background: theme.fundoCards }}>
        <button
          onClick={handleNewEntry}
          className="w-full flex items-center justify-center md:justify-start gap-2 py-3 md:px-4 mb-5 rounded-xl font-bold text-black transition-transform active:scale-95 shadow-[0_0_15px_rgba(234,179,8,0.3)]"
          style={{ background: '#eab308' }}
        >
          <Plus size={18} />
          <span className="hidden md:block uppercase tracking-wider text-xs">New Entry</span>
        </button>

        <h3 className="text-[9px] font-bold tracking-widest uppercase mb-3 px-2 opacity-40 mt-4" style={{ color: theme.textoPrincipal }}>Market news</h3>
        <div className="flex-1 overflow-y-auto hide-scrollbar px-2 flex flex-col gap-2 pb-5">
          {rssNews.length === 0 ? (
             <div className="text-[10px] opacity-40 italic text-center mt-5" style={{ color: theme.textoPrincipal }}>Loading news...</div>
          ) : (
             rssNews.map((news, i) => (
                 <a
                 key={i}
                 href={news.link}
                 target="_blank"
                 rel="noopener noreferrer"
                 className="p-3 rounded-xl border border-l-4 cursor-pointer transition-all hover:bg-white/5 opacity-70 hover:opacity-100 flex flex-col justify-center shrink-0 min-h-[64px]"
                 style={{ borderColor: theme.contornoGeral, borderLeftColor: '#3b82f6' }}
               >
                 <span className="text-[10px] font-bold line-clamp-3 leading-snug" style={{ color: theme.textoPrincipal }}>{news.title}</span>
               </a>
             ))
          )}
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col gap-4 p-2 md:p-4 pb-12 w-full max-w-full min-w-0">

        {/* Icon + Title + Account Mode */}
        <div className="flex items-center justify-between shrink-0 mb-2">
          <div className="flex items-center gap-3">
            <CalendarDays size={26} className="text-yellow-500" />
            <h1 className="text-2xl md:text-3xl font-black font-display tracking-tight whitespace-nowrap" style={{ color: theme.textoPrincipal }}>
              Trading Journal
            </h1>
          </div>
          <div className="flex bg-black/40 p-1 rounded-xl border w-40 h-10" style={{ borderColor: theme.contornoGeral }}>
            <button onClick={() => setAccountMode('specific')} className={`flex-1 text-[10px] font-bold uppercase rounded-lg transition-all ${accountMode === 'specific' ? 'bg-white/10 text-white' : 'text-gray-500'}`}>Account</button>
            <button onClick={() => setAccountMode('general')} className={`flex-1 text-[10px] font-bold uppercase rounded-lg transition-all ${accountMode === 'general' ? 'bg-white/10 text-yellow-500' : 'text-gray-500'}`}>General</button>
          </div>
        </div>

        {/* ROW 1: Calendar card + Key Trades card + Market News card — 3 columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 shrink-0">

          {/* Calendar card */}
          <div className="p-3 rounded-2xl border shadow-sm flex flex-col gap-3" style={{ background: theme.fundoCards, borderColor: theme.contornoGeral }}>
            {/* Top: Nav tabs horizontal */}
            <div className="flex flex-wrap items-center gap-2 border-b border-white/5 pb-3">
              {navItems.map(item => (
                <button
                  key={item}
                  onClick={() => setLeftNavSelection(item)}
                  className={`flex flex-1 justify-center shrink-0 items-center gap-1.5 py-1.5 px-2 rounded-lg transition-all text-center min-w-[50px] ${leftNavSelection === item ? 'bg-white/10 opacity-100' : 'hover:bg-white/5 opacity-50 hover:opacity-90'}`}
                >
                  <CalendarDays size={10} className="hidden sm:block" style={{ color: leftNavSelection === item ? '#eab308' : theme.textoSecundario, flexShrink: 0 }} />
                  <span className="text-[8px] sm:text-[9px] font-bold tracking-widest uppercase leading-none break-words" style={{ color: leftNavSelection === item ? '#eab308' : theme.textoPrincipal }}>{item}</span>
                </button>
              ))}
            </div>
            
            {/* Bottom: Calendar grid */}
            <div className="flex-1 w-full min-w-0 flex flex-col items-center">
              {renderCalendar()}
            </div>
          </div>

          {/* Key Trades card */}
          <div className="flex flex-col p-4 rounded-2xl border shadow-sm" style={{ background: theme.fundoCards, borderColor: theme.contornoGeral }}>
            <div className="flex justify-between items-center mb-2 shrink-0">
              <h3 className="text-[9px] font-bold tracking-widest uppercase opacity-50" style={{ color: theme.textoPrincipal }}>Key trades</h3>
              <div className="flex items-baseline gap-1">
                <span className={`text-base font-black font-display ${dailyPnl >= 0 ? 'text-[#eab308]' : 'text-red-500'}`}>
                  {dailyPnl >= 0 ? '+' : ''}${Math.abs(dailyPnl).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className="text-[9px] font-bold opacity-50" style={{ color: theme.textoPrincipal }}>net · {winRate.toFixed(0)}%W</span>
              </div>
            </div>

            {dayTrades.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-[10px] opacity-40 italic" style={{ color: theme.textoPrincipal }}>No trades this day.</div>
            ) : (
              <div className="flex flex-col gap-1 overflow-y-auto hide-scrollbar" style={{ maxHeight: '280px' }}>
                <div className="grid grid-cols-4 text-[10px] font-bold tracking-wider uppercase opacity-30 pb-1" style={{ color: theme.textoPrincipal }}>
                  <div>Asset</div><div>Dir</div><div>Setup</div><div className="text-right">Net P&L</div>
                </div>
                {dayTrades.map((tt: any) => {
                  const setupMatch = setups?.find((s: any) => s.id === tt.setup_id);
                  const setupName = setupMatch ? setupMatch.title : 'PA';
                  const net = (parseFloat(tt.pnl) || 0) - Math.abs(parseFloat(tt.commission) || 0);
                  return (
                    <div key={tt.id} className="grid grid-cols-4 items-center bg-black/20 p-2 rounded-lg gap-1">
                      <span className="text-[11px] md:text-xs font-bold truncate" style={{ color: theme.textoPrincipal }}>{tt.symbol}</span>
                      <span className={`text-[10px] md:text-xs font-bold uppercase ${(parseFloat(tt.pnl) || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>{tt.direction || 'LNG'}</span>
                      <span className="text-[10px] md:text-xs truncate opacity-70" style={{ color: theme.textoPrincipal }} title={setupName}>{setupName}</span>
                      <span className={`text-right font-black text-[11px] md:text-xs ${net >= 0 ? 'text-green-500' : 'text-red-500'}`}>{net >= 0 ? '+' : ''}${net.toFixed(2)}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Economic Calendar card */}
          <div className="flex flex-col p-4 flex-1 rounded-2xl border shadow-sm relative overflow-hidden" style={{ background: theme.fundoCards, borderColor: theme.contornoGeral }}>
            <div className="flex justify-between items-center mb-3 shrink-0 relative z-10 flex-wrap gap-2">
              <h3 className="text-[9px] font-bold tracking-widest uppercase flex items-center gap-2" style={{ color: theme.textoPrincipal }}>
                EconPulse
                {ecoLoading && <span className="w-2 h-2 rounded-full border-2 border-yellow-500 border-t-transparent animate-spin ml-1" />}
              </h3>
              
              {/* FILTERS */}
              <div className="flex items-center gap-2">
                <select 
                  value={ecoFilterCurrency} 
                  onChange={e => setEcoFilterCurrency(e.target.value)}
                  className="bg-black/20 text-[8px] font-bold uppercase outline-none rounded-md px-2 py-1 appearance-none cursor-pointer"
                  style={{ color: theme.textoSecundario }}
                >
                  <option value="ALL">ALL CURR</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="JPY">JPY</option>
                  <option value="BRL">BRL</option>
                </select>
                <select 
                  value={ecoFilterImpact} 
                  onChange={e => setEcoFilterImpact(e.target.value)}
                  className="bg-black/20 text-[8px] font-bold uppercase outline-none rounded-md px-2 py-1 appearance-none cursor-pointer"
                  style={{ color: theme.textoSecundario }}
                >
                  <option value="ALL">ALL IMPCT</option>
                  <option value="HIGH">HIGH</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="LOW">LOW</option>
                </select>
              </div>
            </div>
            
            <div className="flex-1 flex flex-col gap-1.5 overflow-y-auto hide-scrollbar relative z-10 min-h-[280px]">
              {(() => {
                const filteredEvents = ecoEvents.filter(e => {
                  if (ecoFilterCurrency !== 'ALL' && e.currency !== ecoFilterCurrency) return false;
                  if (ecoFilterImpact !== 'ALL' && e.impact !== ecoFilterImpact) return false;
                  return true;
                });

                if (ecoLoading && ecoEvents.length === 0) {
                  return <div className="flex-1 flex items-center justify-center text-[10px] font-bold italic opacity-40 p-4" style={{ color: theme.textoPrincipal }}>Carregando eventos...</div>;
                }

                if (ecoError || filteredEvents.length === 0) {
                  return <div className="flex-1 flex items-center justify-center text-[10px] font-bold italic opacity-40 p-4 text-center" style={{ color: theme.textoPrincipal }}>Nenhum evento disponível no momento</div>;
                }

                return filteredEvents.map((eco, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-lg border hover:bg-white/5 transition-colors group" style={{ borderColor: theme.contornoGeral, backgroundColor: 'rgba(0,0,0,0.1)' }}>
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col items-center justify-center w-8 shrink-0">
                        <span className="text-[8px] font-black uppercase opacity-60" style={{ color: theme.textoPrincipal }}>{eco.time || '-:-'}</span>
                        <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: theme.textoPrincipal }}>{eco.currency || '?'}</span>
                      </div>
                      <span className={`w-1 h-6 rounded-full shrink-0 ${eco.impact === 'HIGH' ? 'bg-red-500' : eco.impact === 'MEDIUM' ? 'bg-yellow-500' : 'bg-blue-500'}`} title={`Impact: ${eco.impact}`} />
                      <span className="text-[10px] sm:text-[11px] font-bold leading-tight group-hover:text-yellow-500 transition-colors line-clamp-1" style={{ color: theme.textoPrincipal }}>{eco.title || eco.name || 'Economic Event'}</span>
                    </div>
                    {eco.forecast && <span className="text-[9px] font-bold uppercase tracking-wider opacity-50 shrink-0 ml-2" style={{ color: theme.textoPrincipal }}>Est: {eco.forecast}</span>}
                  </div>
                ));
              })()}
            </div>
          </div>
        </div>

        {/* ROW 2: Date Picker + Sentiments (Consolidated Card) */}
        <div className="flex flex-wrap lg:flex-nowrap items-stretch gap-4 p-3 rounded-2xl border shadow-sm" style={{ background: theme.fundoCards, borderColor: theme.contornoGeral }}>
          {/* Date Picker Section */}
          <div className="flex flex-col gap-1.5 shrink-0 justify-center">
            <input
              type="date"
              value={selectedDate}
              onChange={e => handleSelectDate(e.target.value)}
              className="bg-black/30 px-3 py-2.5 rounded-xl border text-xs font-bold outline-none cursor-pointer"
              style={{ color: theme.textoPrincipal, colorScheme: 'dark', borderColor: theme.contornoGeral }}
            />
          </div>

          <div className="hidden lg:block w-px self-stretch bg-white/10" />

          {/* Market & Mood Section */}
          <div className="flex-1 flex flex-wrap items-center gap-x-6 gap-y-3">
            <div className="flex flex-col gap-1.5 flex-1 min-w-[200px]">
              <span className="text-[8px] font-bold tracking-widest uppercase opacity-40" style={{ color: theme.textoPrincipal }}>Market</span>
              <div className="flex flex-wrap gap-2">
                {marketSentiments.map(s => (
                  <button key={s.id} onClick={() => setMarketSentiment(v => v === s.id ? '' : s.id)} title={s.id}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-colors ${marketSentiment === s.id ? 'bg-white/10 opacity-100' : 'bg-black/20 opacity-40 hover:opacity-80'}`}
                    style={{ borderColor: marketSentiment === s.id ? s.color : theme.contornoGeral }}
                  >
                    <s.icon size={15} color={s.color} />
                    <span className="text-[9px] sm:text-[10px] font-bold uppercase hidden sm:block" style={{ color: theme.textoPrincipal }}>{s.id}</span>
                  </button>
                 ))}
              </div>
            </div>

            <div className="w-px self-stretch bg-white/10" />

            <div className="flex flex-col gap-1.5 flex-1 min-w-[200px]">
              <span className="text-[8px] font-bold tracking-widest uppercase opacity-40" style={{ color: theme.textoPrincipal }}>Emotional State</span>
              <div className="flex flex-wrap gap-2">
                {traderMoods.map(m => (
                  <button key={m.id} onClick={() => setTraderMood(v => v === m.id ? '' : m.id)} title={m.id}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-colors ${traderMood === m.id ? 'bg-white/10 opacity-100' : 'bg-black/20 opacity-40 hover:opacity-80'}`}
                    style={{ borderColor: traderMood === m.id ? m.color : theme.contornoGeral }}
                  >
                    <m.icon size={15} color={m.color} />
                    <span className="text-[9px] sm:text-[10px] font-bold uppercase hidden sm:block" style={{ color: theme.textoPrincipal }}>{m.id}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ROW 3: Journal / Notes — resizable vertically by user, tall by default (A4 limit) */}
        <div
          className="p-4 rounded-2xl border flex flex-col mt-1 mb-8"
          style={{ background: theme.fundoCards, borderColor: theme.contornoGeral, resize: 'vertical', minHeight: '800px', maxHeight: 'max-content' }}
        >
          <div className="flex justify-between items-center mb-3 shrink-0">
            <h3 className="text-[9px] font-bold tracking-widest uppercase opacity-50" style={{ color: theme.textoPrincipal }}>
              {isEditing ? `Editing diary — ${selectedDate}` : 'New diary'}
            </h3>
            {isEditing && (
              <button onClick={() => { setIsEditing(false); setNotes(''); setMarketSentiment(''); setTraderMood(''); }}
                className="text-[8px] font-bold uppercase tracking-widest opacity-50 hover:opacity-100 px-2 py-1 rounded-md bg-white/5 transition-colors"
                style={{ color: theme.textoPrincipal }}>
                Clear / New
              </button>
            )}
          </div>

          <div className="flex-1 flex flex-col h-full w-full relative">
            <RichTextEditor value={notes} onChange={setNotes} theme={theme} />
          </div>

          <div className="flex justify-between items-center mt-3 pt-3 border-t shrink-0" style={{ borderColor: theme.contornoGeral }}>
            <span className="text-[9px] opacity-40 italic" style={{ color: theme.textoPrincipal }}>
              {isEditing ? 'Editing saved entry' : 'Writing new entry'}
            </span>
            <button
              onClick={handleSave}
              className="px-5 py-2 rounded-lg flex items-center gap-2 font-bold text-xs text-black transition-all hover:brightness-110 active:scale-95 shadow-[0_0_20px_rgba(234,179,8,0.2)]"
              style={{ background: '#eab308' }}
            >
              <Save size={13} /> Save Entry
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT SIDEBAR — History */}
      <div className="w-60 self-stretch border-l shrink-0 hidden lg:flex flex-col pt-5 pb-0" style={{ borderColor: theme.contornoGeral, background: theme.fundoCards }}>
        <h3 className="text-[9px] font-bold tracking-widest uppercase mb-3 px-4 opacity-40" style={{ color: theme.textoPrincipal }}>History</h3>
        <div className="flex-1 overflow-y-auto hide-scrollbar px-4 flex flex-col gap-2 pb-5">
          {journals.slice(0, 50).map((j: any) => {
            const d = new Date(j.date + 'T12:00:00Z');
            const displayDate = d.toLocaleDateString(lang, { month: 'short', day: 'numeric', year: 'numeric' });
            return (
              <div
                key={j.id}
                onClick={() => handleSelectDate(j.date)}
                className={`p-3 rounded-xl border border-l-4 cursor-pointer transition-all hover:bg-white/5 ${selectedDate === j.date ? 'bg-white/5 opacity-100' : 'opacity-60'}`}
                style={{ borderColor: theme.contornoGeral, borderLeftColor: selectedDate === j.date ? '#eab308' : theme.contornoGeral }}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-bold" style={{ color: theme.textoPrincipal }}>{displayDate}</span>
                  <div className="flex items-center gap-0.5">
                    {j.sentiment && <span title={`Market: ${j.sentiment}`}>{getMarketSentimentIcon(j.sentiment, 10)}</span>}
                    {j.trader_mood && <span title={`Mood: ${j.trader_mood}`}>{getTraderMoodIcon(j.trader_mood, 10)}</span>}
                  </div>
                </div>
                <p className="text-[9px] opacity-50 line-clamp-2 leading-snug" style={{ color: theme.textoPrincipal }}>
                  {j.notes?.replace(/<[^>]*>/g, '') || 'No notes entered.'}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
