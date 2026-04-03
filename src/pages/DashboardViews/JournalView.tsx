import React, { useState, useMemo, useEffect } from 'react';
import { 
  CalendarDays, Flame, Scale, Snowflake, Tornado, Plus, 
  Tag, Save, ChevronRight, ChevronLeft, Smile, Frown, Meh, Zap, Coffee, Trash2, ArrowUp, ArrowDown
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
  setups,
  formatDate
}: any) {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [accountMode] = useState<'general'>('general');
  const [leftNavSelection, setLeftNavSelection] = useState<string>('All Entries');
  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date());
  const [isEditing, setIsEditing] = useState(false);
  const [rssNews, setRssNews] = useState<any[]>([]);
  const [ecoDate, setEcoDate] = useState<string>(new Date().toLocaleDateString('en-CA'));
  const [ecoEvents, setEcoEvents] = useState<any[]>([]);
  const [ecoLoading, setEcoLoading] = useState(true);
  const [ecoError, setEcoError] = useState(false);
  const [ecoFilterCurrency, setEcoFilterCurrency] = useState('ALL');
  const [ecoFilterImpact, setEcoFilterImpact] = useState('ALL');
  const [keyTradesSort, setKeyTradesSort] = useState<'asc' | 'desc'>('desc');

  const fetchEconPulse = async (targetDate?: string) => {
    try {
      setEcoLoading(true);
      setEcoError(false);
      const dateStr = targetDate || ecoDate || new Date().toLocaleDateString('en-CA');
      
      const urls = [
        'https://nfs.faireconomy.media/ff_calendar_thisweek.json',
        'https://nfs.faireconomy.media/ff_calendar_nextweek.json',
      ];

      let allEvents: any[] = [];
      for (const url of urls) {
        try {
          const res = await fetch(`https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`);
          if (!res.ok) continue;
          const data = await res.json();
          if (Array.isArray(data)) allEvents = [...allEvents, ...data];
        } catch { /* skip if a week fails */ }
      }

      const dayEvents = allEvents.filter((e: any) => e.date && e.date.startsWith(dateStr));
      
      const formatted = dayEvents.map((e: any) => {
        const dateObj = new Date(e.date);
        const nyTime = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'America/New_York' });
        return {
           title: e.title,
           currency: e.country,
           impact: e.impact ? e.impact.toUpperCase() : 'LOW',
           time: nyTime,
           forecast: e.forecast || '-'
        };
      });
      setEcoEvents(formatted);
      if (formatted.length === 0) setEcoError(true);
    } catch (err) {
      console.warn("EconPulse API Error:", err);
      setEcoEvents([]);
      setEcoError(true);
    } finally {
      setEcoLoading(false);
    }
  };

  useEffect(() => {
    fetchEconPulse(ecoDate);
    const interval = setInterval(() => fetchEconPulse(ecoDate), 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [ecoDate]);
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const sources = [
      'https://feeds.cnbc.com/rss/section/100727362',
      'https://feeds.cnbc.com/rss/section/10000664',
      'https://www.marketwatch.com/rss/topstories',
    ];
    const fetches = sources.map(rss =>
      fetch(`https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(rss)}`)
        .then(response => response.text())
        .then(str => new window.DOMParser().parseFromString(str, 'text/xml'))
        .catch(() => null)
    );

    Promise.all(fetches).then(results => {
      let combined: any[] = [];
      results.forEach(xmlDoc => {
        if (!xmlDoc) return;
        const items = xmlDoc.querySelectorAll('item');
        items.forEach(item => {
          const title = item.querySelector('title')?.textContent || '';
          const description = item.querySelector('description')?.textContent || '';
          const link = item.querySelector('link')?.textContent || '';
          const pubDate = item.querySelector('pubDate')?.textContent || '';
          const author = item.querySelector('creator')?.textContent || item.querySelector('author')?.textContent || 'Financial News';
          
          if (!pubDate) return;
          const pubDateObj = new Date(pubDate);
          if (pubDateObj.toISOString().split('T')[0] === today) {
            combined.push({ title, description, link, pubDate, author });
          }
        });
      });
      combined.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
      setRssNews(combined.slice(0, 8)); // Top 8 today
    });
  }, []);

  const currentJournal = useMemo(() => {
    return journals.find((j: any) => j.date === selectedDate);
  }, [journals, selectedDate, activeAccountId]);

  const [marketSentiment, setMarketSentiment] = useState<string>('');
  const [traderMood, setTraderMood] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [tags, setTags] = useState<string>('');

  const handleSelectDate = (dateStr: string) => {
    setSelectedDate(dateStr);
    const j = journals.find((jj: any) => jj.date === dateStr);
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

  const handleCalendarClick = (dateStr: string) => {
    setSelectedDate(dateStr);
    setIsEditing(false);
    setMarketSentiment('');
    setTraderMood('');
    setNotes('');
    setTags('');
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
    return trades
      .filter((t: any) => t.date === selectedDate && t.accountId === activeAccountId)
      .sort((a: any, b: any) => {
        const timeA = a.buyTime || '00:00';
        const timeB = b.buyTime || '00:00';
        return keyTradesSort === 'asc' ? timeA.localeCompare(timeB) : timeB.localeCompare(timeA);
      });
  }, [trades, selectedDate, activeAccountId, keyTradesSort]);

  const dailyPnl = dayTrades.reduce((acc: number, cur: any) => {
    const fee = Math.abs(parseFloat(cur.commission) || 0);
    return acc + (parseFloat(cur.pnl) || 0) - fee;
  }, 0);

  const winRate = dayTrades.length > 0
    ? (dayTrades.filter((t: any) => {
        const fee = Math.abs(parseFloat(t.commission) || 0);
        return (parseFloat(t.pnl) || 0) - fee > 0;
      }).length / dayTrades.length) * 100
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

  const navLabels: Record<string,string> = { 'All Entries': 'Entries', 'Daily Recap': 'Recap', 'Strategies': 'Setups', 'Emotional Stats': 'Emotional', 'Reports': 'Reports' };
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
      <div className="flex flex-col h-full w-full">
        <div className="flex items-center justify-between mb-2">
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
        <div className="grid grid-cols-7 gap-0.5 flex-1">
          {['S','M','T','W','T','F','S'].map((d, i) => (
            <div key={i} className="text-center text-[9px] font-bold opacity-30 pb-0.5" style={{ color: theme.textoPrincipal }}>{d}</div>
          ))}
          {days.map((d, i) => {
            if (!d) return <div key={i} className="min-h-[28px]" />;

            const dateStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            const isSelected = selectedDate === dateStr;

            let info = null;
            if (leftNavSelection === 'All Entries') {
              const cnt = trades.filter((tt: any) => tt.date === dateStr && tt.accountId === activeAccountId).length;
              if (cnt > 0) info = <span className="text-yellow-400 font-black" style={{ fontSize: '11px' }}>{cnt}</span>;
            } else if (leftNavSelection === 'Daily Recap') {
              const dTr = trades.filter((tt: any) => tt.date === dateStr && tt.accountId === activeAccountId);
              const pnl = dTr.reduce((a: number, c: any) => a + (parseFloat(c.pnl) || 0) - Math.abs(parseFloat(c.commission) || 0), 0);
              if (dTr.length > 0) info = <span className={`font-black ${pnl >= 0 ? 'text-green-500' : 'text-red-500'}`} style={{ fontSize: '10px' }}>{pnl >= 0 ? '+' : '-'}${Math.abs(pnl).toFixed(0)}</span>;
            } else if (leftNavSelection === 'Strategies') {
              const has = trades.some((tt: any) => tt.date === dateStr && tt.accountId === activeAccountId && tt.setup_id);
              if (has) info = <Tag size={9} className="text-blue-400" />;
            } else if (leftNavSelection === 'Emotional Stats') {
              const jj = journals.find((jjj: any) => jjj.date === dateStr);
              if (jj?.sentiment) info = getMarketSentimentIcon(jj.sentiment, 10);
              else if (jj?.trader_mood) info = getTraderMoodIcon(jj.trader_mood, 10);
            } else if (leftNavSelection === 'Reports') {
              const jj = journals.find((jjj: any) => jjj.date === dateStr);
              if (jj) info = <span className="text-yellow-500 font-bold" style={{ fontSize: '10px' }}>✓</span>;
            }

            return (
              <div
                key={i}
                onClick={() => handleCalendarClick(dateStr)}
                className="flex flex-col items-center justify-start pt-1 pb-0.5 rounded cursor-pointer border transition-all min-h-[28px] hover:bg-white/5"
                style={{ borderColor: isSelected ? '#eab308' : 'transparent', background: isSelected ? 'rgba(234,179,8,0.07)' : 'transparent' }}
              >
                <div className="text-[11px] font-bold leading-none" style={{ color: isSelected ? '#eab308' : theme.textoPrincipal }}>{d.getDate()}</div>
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

      <div className="w-16 md:w-64 self-stretch border-r shrink-0 hidden sm:flex flex-col pt-5 pb-0 px-2 md:px-4" style={{ ...getGlassStyle(theme.fundoCards), borderColor: theme.contornoGeral }}>
        <button
          onClick={handleNewEntry}
          className="w-full flex items-center justify-center gap-2 py-3 md:px-4 mb-5 rounded-xl font-bold text-black transition-transform active:scale-95 shadow-[0_0_15px_rgba(234,179,8,0.3)]"
          style={{ background: '#eab308' }}
        >
          <Plus size={18} />
          <span className="hidden md:block uppercase tracking-wider text-xs text-center">New Journal</span>
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
                 className="p-3 rounded-xl border border-l-4 cursor-pointer transition-all hover:bg-white/5 opacity-70 hover:opacity-100 flex flex-col gap-1 shrink-0"
                 style={{ borderColor: theme.contornoGeral, borderLeftColor: '#3b82f6' }}
               >
                 <div className="flex items-start justify-between gap-2">
                   <span className="text-[10px] font-bold leading-snug" style={{ color: theme.textoPrincipal }}>{news.title}</span>
                   <span className="shrink-0 opacity-40 mt-0.5">🔍</span>
                 </div>
                 {news.description && <span className="text-[9px] opacity-50 line-clamp-2 leading-snug font-normal" style={{ color: theme.textoPrincipal }} dangerouslySetInnerHTML={{__html: news.description?.replace(/<[^>]*>/g,'').slice(0,120)}} />}
                 {news.author && <span className="text-[8px] opacity-30 font-bold uppercase tracking-widest" style={{ color: theme.textoPrincipal }}>{news.author}</span>}
               </a>
             ))
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-2 p-2 md:p-4 w-full max-w-full min-w-0">

        <div className="flex items-center gap-3 shrink-0 mb-2 mt-1">
          <CalendarDays size={26} className="text-yellow-500" />
          <h1 className="text-2xl md:text-3xl font-black font-display tracking-tight whitespace-nowrap" style={{ color: theme.textoPrincipal }}>
            Trading Journal
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 shrink-0" style={{ height: '340px' }}>

          <div className="p-3 rounded-2xl border shadow-sm flex flex-col h-full overflow-hidden" style={{ ...getGlassStyle(theme.fundoCards), borderColor: theme.contornoGeral }}>
            <div className="flex flex-wrap items-center gap-1 border-b border-white/5 pb-2 mb-2 shrink-0">
              {navItems.map(item => (
                <button
                  key={item}
                  onClick={() => setLeftNavSelection(item)}
                  className={`flex flex-1 justify-center shrink-0 items-center py-1 px-1.5 rounded-md transition-all text-center ${leftNavSelection === item ? 'bg-white/10 opacity-100' : 'hover:bg-white/5 opacity-50 hover:opacity-90'}`}
                >
                  <span className="text-[7px] sm:text-[8px] font-bold tracking-widest uppercase leading-none" style={{ color: leftNavSelection === item ? '#eab308' : theme.textoPrincipal }}>{navLabels[item]}</span>
                </button>
              ))}
            </div>
            
            <div className="flex-1 w-full min-w-0 overflow-hidden">
              {renderCalendar()}
            </div>
          </div>

          <div className="flex flex-col p-4 rounded-2xl border shadow-sm overflow-hidden h-full" style={{ ...getGlassStyle(theme.fundoCards), borderColor: theme.contornoGeral }}>
            <div className="flex justify-between items-center mb-2 shrink-0">
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold tracking-widest uppercase opacity-50" style={{ color: theme.textoPrincipal }}>Key trades</h3>
                <button onClick={() => setKeyTradesSort(s => s === 'asc' ? 'desc' : 'asc')} className="text-[8px] bg-black/20 px-1.5 py-0.5 rounded opacity-50 hover:opacity-100 uppercase tracking-widest" style={{ color: theme.textoPrincipal }}>
                  {keyTradesSort === 'asc' ? 'Oldest First' : 'Recent First'}
                </button>
              </div>
              <div className="flex items-baseline gap-1">
                <span className={`text-base font-black font-display ${dailyPnl >= 0 ? 'text-[#eab308]' : 'text-red-500'}`}>
                  {dailyPnl >= 0 ? '+' : ''}${Math.abs(dailyPnl).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {dayTrades.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-[10px] opacity-40 italic" style={{ color: theme.textoPrincipal }}>No trades this day.</div>
            ) : (
              <div className="flex flex-col gap-1.5 overflow-y-auto hide-scrollbar flex-1">
                <div className="grid grid-cols-[1.5fr_1fr_1fr_1.5fr_1fr] text-[10px] font-bold tracking-wider uppercase opacity-40 pb-1 text-center items-center" style={{ color: theme.textoPrincipal }}>
                  <div className="text-left pl-1">Asset</div><div>Time</div><div>Dir</div><div className="truncate">Setup</div><div className="text-right pr-1">Gross</div>
                </div>
                {dayTrades.map((tt: any) => {
                  const setupMatch = setups?.find((s: any) => s.id === tt.setup_id);
                  const setupName = setupMatch ? setupMatch.title : 'PA';
                  const gross = parseFloat(tt.pnl) || 0;
                  const isLong = !tt.direction || tt.direction.toLowerCase().includes('long') || tt.direction.toLowerCase() === 'buy';
                  return (
                    <div key={tt.id} className="grid grid-cols-[1.5fr_1fr_1fr_1.5fr_1fr] flex-1 items-center text-center px-1 py-1.5 rounded-lg gap-1 border-b border-white/5 hover:bg-white/5 transition-colors">
                      <span className="text-[10px] font-bold truncate text-left" style={{ color: theme.textoPrincipal }} title={tt.symbol}>{tt.symbol}</span>
                      <span className="text-[9px] opacity-70" style={{ color: theme.textoPrincipal }}>{tt.buyTime || '-'}</span>
                      <span className={`flex justify-center ${isLong ? 'text-green-500' : 'text-red-500'}`}>
                        {isLong ? <ArrowUp size={12} strokeWidth={3} /> : <ArrowDown size={12} strokeWidth={3} />}
                      </span>
                      <span className="text-[9px] truncate opacity-80 text-center" style={{ color: theme.textoPrincipal }} title={setupName}>{setupName}</span>
                      <span className={`font-black text-[11px] text-right ${gross >= 0 ? 'text-green-500' : 'text-red-500'}`}>{gross < 0 ? '-' : ''}${Math.abs(gross).toFixed(2)}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex flex-col p-3 rounded-2xl border shadow-sm overflow-hidden h-full" style={{ ...getGlassStyle(theme.fundoCards), borderColor: theme.contornoGeral }}>
            <div className="flex justify-between items-center mb-2 shrink-0 relative z-10 flex-wrap gap-1">
              <h3 className="text-[9px] font-bold tracking-widest uppercase flex items-center gap-1.5" style={{ color: theme.textoPrincipal }}>
                Economic calendar
                {ecoLoading && <span className="w-2 h-2 rounded-full border-2 border-yellow-500 border-t-transparent animate-spin ml-1" />}
              </h3>
              
              <div className="flex items-center gap-1 flex-wrap">
                <input
                  type="date"
                  value={ecoDate}
                  onChange={e => { setEcoDate(e.target.value); }}
                  className="bg-black/20 font-bold outline-none rounded px-1 py-0.5 cursor-pointer border-none shrink-0"
                  style={{ color: theme.textoSecundario, colorScheme: 'dark', fontSize: '9px', minWidth: '100px' }}
                />
                <select 
                  value={ecoFilterCurrency} 
                  onChange={e => setEcoFilterCurrency(e.target.value)}
                  className="bg-black/20 font-bold outline-none rounded px-1 py-0.5 appearance-none cursor-pointer"
                  style={{ color: theme.textoSecundario, fontSize: '9px' }}
                >
                  <option value="ALL">All</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="JPY">JPY</option>
                  <option value="BRL">BRL</option>
                </select>
                <select 
                  value={ecoFilterImpact} 
                  onChange={e => setEcoFilterImpact(e.target.value)}
                  className="bg-black/20 font-bold outline-none rounded px-1 py-0.5 appearance-none cursor-pointer"
                  style={{ color: theme.textoSecundario, fontSize: '9px' }}
                >
                  <option value="ALL">All</option>
                  <option value="HIGH">High</option>
                  <option value="MEDIUM">Med</option>
                  <option value="LOW">Low</option>
                </select>
              </div>
            </div>
            
            <div className="flex-1 flex flex-col gap-1 overflow-y-auto hide-scrollbar relative z-10">
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
        <div className="flex flex-wrap lg:flex-nowrap items-stretch gap-4 p-3 rounded-2xl border shrink-0 shadow-sm" style={{ ...getGlassStyle(theme.fundoCards), borderColor: theme.contornoGeral }}>
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

        {/* ROW 3: Journal / Notes — tall by default */}
        <div
          className="p-4 rounded-2xl border flex flex-col flex-1"
          style={{ ...getGlassStyle(theme.fundoCards), borderColor: theme.contornoGeral, minHeight: '800px' }}
        >
          <div className="flex justify-between items-center mb-3 shrink-0 min-h-[28px]">
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
            
            <div className="flex items-center gap-2">
              {isEditing && (
                 <button
                   onClick={() => { if (window.confirm('Delete this journal entry?')) { deleteJournal(currentJournal.id); handleNewEntry(); } }}
                   className="px-4 py-2 rounded-lg flex items-center gap-2 font-bold text-xs text-red-500 bg-red-500/10 hover:bg-red-500/20 transition-all"
                 >
                   <Trash2 size={13} /> Delete
                 </button>
              )}
              <button
                onClick={handleSave}
                className="px-5 py-2 rounded-lg flex items-center gap-2 font-bold text-xs text-black transition-all hover:brightness-110 active:scale-95 shadow-[0_0_20px_rgba(234,179,8,0.2)]"
                style={{ background: '#eab308' }}
              >
                <Save size={13} /> Save Journal
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDEBAR — History */}
      <div className="w-60 self-stretch border-l shrink-0 hidden lg:flex flex-col pt-5 pb-0" style={{ ...getGlassStyle(theme.fundoCards), borderColor: theme.contornoGeral }}>
        <h3 className="text-[9px] font-bold tracking-widest uppercase mb-3 px-4 opacity-40" style={{ color: theme.textoPrincipal }}>History</h3>
        <div className="flex-1 overflow-y-auto hide-scrollbar px-4 flex flex-col gap-2 pb-5">
        {journals.slice(0, 50).map((j: any) => {
            const d = new Date(j.date + 'T12:00:00Z');
            const displayDate = formatDate ? formatDate(j.date) : d.toLocaleDateString(lang, { month: 'short', day: 'numeric', year: 'numeric' });
            return (
              <div
                key={j.id}
                onClick={() => handleSelectDate(j.date)}
                className={`relative pt-3 px-3 pb-10 rounded-xl border border-l-4 cursor-pointer transition-all ${selectedDate === j.date ? 'opacity-100' : 'hover:bg-white/5 opacity-70'}`}
                style={{
                  borderColor: theme.contornoGeral,
                  borderLeftColor: j.sentiment ? (marketSentiments.find(s => s.id === j.sentiment)?.color || theme.linhaGrafico) : theme.linhaGrafico,
                  background: selectedDate === j.date ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.25)'
                }}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-bold" style={{ color: theme.textoPrincipal }}>{displayDate}</span>
                  <div className="flex items-center gap-1">
                    {j.sentiment && <span title={`Market: ${j.sentiment}`}>{getMarketSentimentIcon(j.sentiment, 10)}</span>}
                    {j.trader_mood && <span title={`Mood: ${j.trader_mood}`}>{getTraderMoodIcon(j.trader_mood, 10)}</span>}
                  </div>
                </div>
                <p className="text-[9px] opacity-50 line-clamp-2 leading-snug" style={{ color: theme.textoPrincipal }}>
                  {j.notes?.replace(/<[^>]*>/g, '') || 'No notes entered.'}
                </p>
                {/* Trash at the bottom — always visible, does NOT overlap text due to pb-10 */}
                <div className="absolute bottom-0 left-0 right-0 flex justify-end px-2 py-1 border-t rounded-b-xl" style={{ borderColor: theme.contornoGeral, background: 'rgba(0,0,0,0.3)' }}>
                  <button
                    onClick={(e) => { e.stopPropagation(); if (window.confirm('Delete this entry?')) deleteJournal(j.id); }}
                    className="flex items-center gap-1 text-[9px] font-bold text-red-400 hover:text-red-300 transition-colors"
                  >
                    <Trash2 size={11} /> Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
