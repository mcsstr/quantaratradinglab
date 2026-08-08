import React, { useState, useMemo, useEffect } from 'react';
import { 
  CalendarDays, Flame, Scale, Snowflake, Tornado, Plus, 
  Tag, Save, ChevronRight, ChevronLeft, Smile, Frown, Meh, Zap, Coffee, Trash2, ArrowUp, ArrowDown,
  Globe, ListFilter, RefreshCw
} from 'lucide-react';
import RichTextEditor from '../../components/RichTextEditor';
import { t as tFunc } from '../../utils/i18n';
import { TradingViewEconomicCalendar, TradingViewMarketNews } from '../../components/TradingViewWidgets';
import { fetchEconomicEvents, fetchMarketRssNews, EcoEventItem, MarketNewsItem } from '../../utils/economicData';

export default function JournalView({
  theme,
  getGlassStyle,
  settings,
  t: tProp,
  lang = 'en',
  trades,
  activeAccountId,
  journals,
  saveJournal,
  deleteJournal,
  setups,
  formatDate
}: any) {
  const t = tProp || ((k: string) => tFunc(k, lang));
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [accountMode] = useState<'general'>('general');
  const [leftNavSelection, setLeftNavSelection] = useState<string>('All Entries');
  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date());
  const [isEditing, setIsEditing] = useState(false);
  
  // News & Calendar States
  const [newsViewMode, setNewsViewMode] = useState<'live' | 'rss'>('live');
  const [rssNews, setRssNews] = useState<MarketNewsItem[]>([]);
  const [ecoViewMode, setEcoViewMode] = useState<'live' | 'list'>('live');
  const [ecoDate, setEcoDate] = useState<string>(new Date().toLocaleDateString('en-CA'));
  const [ecoEvents, setEcoEvents] = useState<EcoEventItem[]>([]);
  const [ecoLoading, setEcoLoading] = useState(false);
  const [ecoFilterCurrency, setEcoFilterCurrency] = useState('ALL');
  const [ecoFilterImpact, setEcoFilterImpact] = useState('ALL');
  const [keyTradesSort, setKeyTradesSort] = useState<'asc' | 'desc'>('desc');

  // Load In-App Events with robust fallback
  const loadEcoEvents = async (targetDate?: string) => {
    setEcoLoading(true);
    try {
      const data = await fetchEconomicEvents(targetDate || ecoDate);
      setEcoEvents(data);
    } catch {
      // Handled gracefully in economicData.ts
    } finally {
      setEcoLoading(false);
    }
  };

  // Load In-App RSS News with robust fallback
  const loadRssNews = async () => {
    try {
      const data = await fetchMarketRssNews();
      setRssNews(data);
    } catch {
      // Handled gracefully
    }
  };

  useEffect(() => {
    loadEcoEvents(ecoDate);
  }, [ecoDate]);

  useEffect(() => {
    loadRssNews();
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

  const handleSave = () => {
    saveJournal({
      id: currentJournal?.id || crypto.randomUUID(),
      account_id: accountMode === 'general' ? null : activeAccountId,
      date: selectedDate,
      sentiment: marketSentiment,
      trader_mood: traderMood,
      notes: notes,
      tags: tags
    });
    setIsEditing(true);
  };

  // Nav Items
  const navItems = ['All Entries', 'Recap', 'Setups', 'Emotional', 'Reports'];
  const navLabels: Record<string, string> = {
    'All Entries': t('journal.allEntries'),
    'Recap': t('journal.recap'),
    'Setups': t('journal.setups'),
    'Emotional': t('journal.emotional'),
    'Reports': t('journal.reports')
  };

  const marketSentiments = [
    { id: 'Bullish', icon: Flame, color: '#22c55e', label: t('journal.bullish') },
    { id: 'Neutral', icon: Scale, color: '#eab308', label: t('journal.neutral') },
    { id: 'Bearish', icon: Snowflake, color: '#ef4444', label: t('journal.bearish') },
    { id: 'Volatile', icon: Tornado, color: '#a855f7', label: t('journal.volatile') }
  ];

  const traderMoods = [
    { id: 'Focused', icon: Zap, color: '#3b82f6', label: t('journal.focused') },
    { id: 'Calm', icon: Coffee, color: '#06b6d4', label: t('journal.calm') },
    { id: 'Good', icon: Smile, color: '#22c55e', label: t('journal.good') },
    { id: 'Bad', icon: Frown, color: '#ef4444', label: t('journal.bad') }
  ];

  const getMarketSentimentIcon = (id: string, size = 12) => {
    const s = marketSentiments.find(x => x.id === id);
    if (!s) return null;
    const Icon = s.icon;
    return <Icon size={size} color={s.color} />;
  };

  const getTraderMoodIcon = (id: string, size = 12) => {
    const m = traderMoods.find(x => x.id === id);
    if (!m) return null;
    const Icon = m.icon;
    return <Icon size={size} color={m.color} />;
  };

  const renderCalendar = () => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = [];

    const weekDays = lang === 'pt' 
      ? ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
      : lang === 'es'
      ? ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
      : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-6 w-full" />);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const isSelected = selectedDate === dateStr;
      const jEntry = journals.find((j: any) => j.date === dateStr);
      const isToday = new Date().toISOString().split('T')[0] === dateStr;

      days.push(
        <button
          key={d}
          onClick={() => handleCalendarClick(dateStr)}
          className={`h-6 w-full rounded-md text-[10px] font-bold flex flex-col items-center justify-center transition-all relative ${
            isSelected 
              ? 'bg-yellow-500 text-black shadow-md scale-105 z-10' 
              : isToday 
              ? 'border border-yellow-500/50 text-yellow-400 hover:bg-white/10' 
              : jEntry 
              ? 'bg-white/10 hover:bg-white/20' 
              : 'hover:bg-white/5 opacity-60'
          }`}
          style={{ color: isSelected ? '#000' : isToday ? '#eab308' : theme.textoPrincipal }}
        >
          <span>{d}</span>
          {jEntry && !isSelected && (
            <span className="w-1 h-1 rounded-full bg-yellow-500 absolute bottom-0.5" />
          )}
        </button>
      );
    }

    return (
      <div className="flex flex-col h-full">
        <div className="flex justify-between items-center mb-1.5 px-1">
          <span className="text-[11px] font-black uppercase tracking-wider" style={{ color: theme.textoPrincipal }}>
            {calendarMonth.toLocaleDateString(lang, { month: 'short', year: 'numeric' })}
          </span>
          <div className="flex items-center gap-1">
            <button 
              onClick={() => setCalendarMonth(new Date(year, month - 1, 1))}
              className="p-1 rounded hover:bg-white/10 opacity-70 hover:opacity-100"
              style={{ color: theme.textoPrincipal }}
            >
              <ChevronLeft size={14} />
            </button>
            <button 
              onClick={() => setCalendarMonth(new Date(year, month + 1, 1))}
              className="p-1 rounded hover:bg-white/10 opacity-70 hover:opacity-100"
              style={{ color: theme.textoPrincipal }}
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center mb-1">
          {weekDays.map(w => (
            <span key={w} className="text-[8px] font-bold opacity-40 uppercase" style={{ color: theme.textoPrincipal }}>{w}</span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1 flex-1 items-center">
          {days}
        </div>
      </div>
    );
  };

  return (
    <div className="flex w-full min-h-[calc(100vh-140px)] animate-tab-enter relative" style={{ background: theme.fundoGeral }}>

      {/* LEFT SIDEBAR: Market News */}
      <div className="w-16 md:w-64 self-stretch border-r shrink-0 hidden sm:flex flex-col pt-5 pb-0 px-2 md:px-4" style={{ ...getGlassStyle(theme.fundoCards), borderColor: theme.contornoGeral }}>
        <button
          onClick={handleNewEntry}
          className="w-full flex items-center justify-center gap-2 py-3 md:px-4 mb-4 rounded-xl font-bold text-black transition-transform active:scale-95 shadow-[0_0_15px_rgba(234,179,8,0.3)] shrink-0"
          style={{ background: '#eab308' }}
        >
          <Plus size={18} />
          <span className="hidden md:block uppercase tracking-wider text-xs text-center">{t('journal.newEntry')}</span>
        </button>

        {/* Sidebar Header & Mode Switcher */}
        <div className="flex items-center justify-between mb-2 px-1 shrink-0">
          <h3 className="text-[9px] font-bold tracking-widest uppercase opacity-60" style={{ color: theme.textoPrincipal }}>
            {t('journal.marketNews')}
          </h3>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setNewsViewMode(m => m === 'live' ? 'rss' : 'live')}
              className="p-1 rounded bg-black/20 hover:bg-white/10 text-[9px] font-bold flex items-center gap-1 opacity-70 hover:opacity-100"
              style={{ color: theme.textoSecundario }}
              title={newsViewMode === 'live' ? 'Feed RSS' : 'TradingView Live'}
            >
              {newsViewMode === 'live' ? <Globe size={11} className="text-blue-400" /> : <ListFilter size={11} />}
              <span className="hidden md:inline text-[8px] uppercase">{newsViewMode === 'live' ? 'LIVE' : 'RSS'}</span>
            </button>
          </div>
        </div>

        {/* News Content Area */}
        <div className="flex-1 overflow-y-auto hide-scrollbar flex flex-col gap-2 pb-5 min-h-[300px]">
          {newsViewMode === 'live' ? (
            <TradingViewMarketNews lang={lang} height="100%" feedMode="all_symbols" />
          ) : (
            rssNews.map((news, i) => (
              <a
                key={i}
                href={news.link}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-xl border border-l-4 cursor-pointer transition-all hover:bg-white/5 opacity-80 hover:opacity-100 flex flex-col gap-1 shrink-0"
                style={{ borderColor: theme.contornoGeral, borderLeftColor: '#3b82f6' }}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[10px] font-bold leading-snug" style={{ color: theme.textoPrincipal }}>{news.title}</span>
                  <span className="shrink-0 opacity-40 mt-0.5">🔍</span>
                </div>
                {news.description && (
                  <span className="text-[9px] opacity-50 line-clamp-2 leading-snug font-normal" style={{ color: theme.textoPrincipal }}>
                    {news.description}
                  </span>
                )}
                {news.author && (
                  <span className="text-[8px] opacity-30 font-bold uppercase tracking-widest mt-1" style={{ color: theme.textoPrincipal }}>
                    {news.author}
                  </span>
                )}
              </a>
            ))
          )}
        </div>
      </div>

      {/* MAIN VIEW */}
      <div className="flex-1 flex flex-col gap-2 p-2 md:p-4 w-full max-w-full min-w-0">

        <div className="flex items-center gap-3 shrink-0 mb-2 mt-1">
          <CalendarDays size={26} className="text-yellow-500" />
          <h1 className="text-2xl md:text-3xl font-black font-display tracking-tight whitespace-nowrap" style={{ color: theme.textoPrincipal }}>
            {t('journal.title')}
          </h1>
        </div>

        {/* ROW 1: 3-Column Top Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 shrink-0" style={{ height: '340px' }}>

          {/* Col 1: Mini Calendar & Tabs */}
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

          {/* Col 2: Key Trades */}
          <div className="flex flex-col p-4 rounded-2xl border shadow-sm overflow-hidden h-full" style={{ ...getGlassStyle(theme.fundoCards), borderColor: theme.contornoGeral }}>
            <div className="flex justify-between items-center mb-2 shrink-0">
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold tracking-widest uppercase opacity-50" style={{ color: theme.textoPrincipal }}>{t('journal.keyTrades')}</h3>
                <button onClick={() => setKeyTradesSort(s => s === 'asc' ? 'desc' : 'asc')} className="text-[8px] bg-black/20 px-1.5 py-0.5 rounded opacity-50 hover:opacity-100 uppercase tracking-widest" style={{ color: theme.textoPrincipal }}>
                  {keyTradesSort === 'asc' ? t('journal.oldestFirst') : t('journal.recentFirst')}
                </button>
              </div>
              <div className="flex items-baseline gap-1">
                <span className={`text-base font-black font-display ${dailyPnl >= 0 ? 'text-[#eab308]' : 'text-red-500'}`}>
                  {dailyPnl >= 0 ? '+' : ''}${Math.abs(dailyPnl).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {dayTrades.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-[10px] opacity-40 italic" style={{ color: theme.textoPrincipal }}>{t('journal.noTradesDay')}</div>
            ) : (
              <div className="flex flex-col gap-1.5 overflow-y-auto hide-scrollbar flex-1">
                <div className="grid grid-cols-[1.5fr_1fr_1fr_1.5fr_1fr] text-[10px] font-bold tracking-wider uppercase opacity-40 pb-1 text-center items-center" style={{ color: theme.textoPrincipal }}>
                  <div className="text-left pl-1">{t('journal.asset')}</div><div>{t('journal.time')}</div><div>{t('journal.dir')}</div><div className="truncate">{t('journal.setup')}</div><div className="text-right pr-1">{t('journal.gross')}</div>
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

          {/* Col 3: Economic Calendar Card */}
          <div className="flex flex-col p-3 rounded-2xl border shadow-sm overflow-hidden h-full" style={{ ...getGlassStyle(theme.fundoCards), borderColor: theme.contornoGeral }}>
            <div className="flex justify-between items-center mb-2 shrink-0 relative z-10 flex-wrap gap-1">
              <div className="flex items-center gap-2">
                <h3 className="text-[9px] font-bold tracking-widest uppercase flex items-center gap-1.5" style={{ color: theme.textoPrincipal }}>
                  {t('journal.economicCalendar')}
                </h3>
              </div>

              {/* View Switcher: Live Widget vs In-App List */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setEcoViewMode('live')}
                  className={`px-2 py-0.5 rounded text-[8px] font-bold flex items-center gap-1 transition-all ${
                    ecoViewMode === 'live' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-black/20 text-white/50 hover:text-white'
                  }`}
                >
                  <Globe size={10} />
                  <span>{t('widget.liveFeed')}</span>
                </button>
                <button
                  onClick={() => setEcoViewMode('list')}
                  className={`px-2 py-0.5 rounded text-[8px] font-bold flex items-center gap-1 transition-all ${
                    ecoViewMode === 'list' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-black/20 text-white/50 hover:text-white'
                  }`}
                >
                  <ListFilter size={10} />
                  <span>{t('widget.customEvents')}</span>
                </button>
              </div>
            </div>
            
            {/* Calendar Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden relative z-10">
              {ecoViewMode === 'live' ? (
                <div className="w-full h-full min-h-[220px]">
                  <TradingViewEconomicCalendar lang={lang} height="100%" />
                </div>
              ) : (
                <div className="flex flex-col h-full gap-1.5">
                  {/* Filters for In-App List */}
                  <div className="flex items-center gap-1 flex-wrap mb-1 shrink-0">
                    <input
                      type="date"
                      value={ecoDate}
                      onChange={e => setEcoDate(e.target.value)}
                      className="bg-black/20 font-bold outline-none rounded px-1 py-0.5 cursor-pointer border-none shrink-0"
                      style={{ color: theme.textoSecundario, colorScheme: 'dark', fontSize: '9px', minWidth: '95px' }}
                    />
                    <select 
                      value={ecoFilterCurrency} 
                      onChange={e => setEcoFilterCurrency(e.target.value)}
                      className="bg-black/20 font-bold outline-none rounded px-1 py-0.5 appearance-none cursor-pointer"
                      style={{ color: theme.textoSecundario, fontSize: '9px' }}
                    >
                      <option value="ALL">{t('news.all')}</option>
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
                      <option value="ALL">{t('news.all')}</option>
                      <option value="HIGH">{t('news.highImpact')}</option>
                      <option value="MEDIUM">{t('news.medImpact')}</option>
                      <option value="LOW">{t('news.lowImpact')}</option>
                    </select>
                    <button
                      onClick={() => loadEcoEvents(ecoDate)}
                      className="p-1 rounded bg-black/20 hover:bg-white/10 ml-auto opacity-70 hover:opacity-100"
                      title="Reload Events"
                    >
                      <RefreshCw size={10} className={ecoLoading ? 'animate-spin text-amber-400' : ''} style={{ color: theme.textoSecundario }} />
                    </button>
                  </div>

                  <div className="flex-1 flex flex-col gap-1 overflow-y-auto hide-scrollbar">
                    {(() => {
                      const filteredEvents = ecoEvents.filter(e => {
                        if (ecoFilterCurrency !== 'ALL' && e.currency !== ecoFilterCurrency) return false;
                        if (ecoFilterImpact !== 'ALL' && e.impact !== ecoFilterImpact) return false;
                        return true;
                      });

                      if (ecoLoading && ecoEvents.length === 0) {
                        return <div className="flex-1 flex items-center justify-center text-[10px] font-bold italic opacity-40 p-4" style={{ color: theme.textoPrincipal }}>{t('journal.loadingNews')}</div>;
                      }

                      if (filteredEvents.length === 0) {
                        return <div className="flex-1 flex items-center justify-center text-[10px] font-bold italic opacity-40 p-4 text-center" style={{ color: theme.textoPrincipal }}>{t('news.noNews')}</div>;
                      }

                      return filteredEvents.map((eco, i) => (
                        <div key={i} className="flex items-center justify-between p-2 rounded-lg border hover:bg-white/5 transition-colors group" style={{ borderColor: theme.contornoGeral, backgroundColor: 'rgba(0,0,0,0.1)' }}>
                          <div className="flex items-center gap-3">
                            <div className="flex flex-col items-center justify-center w-8 shrink-0">
                              <span className="text-[8px] font-black uppercase opacity-60" style={{ color: theme.textoPrincipal }}>{eco.time || '-:-'}</span>
                              <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: theme.textoPrincipal }}>{eco.currency || '?'}</span>
                            </div>
                            <span className={`w-1 h-6 rounded-full shrink-0 ${eco.impact === 'HIGH' ? 'bg-red-500' : eco.impact === 'MEDIUM' ? 'bg-yellow-500' : 'bg-blue-500'}`} title={`Impact: ${eco.impact}`} />
                            <span className="text-[10px] sm:text-[11px] font-bold leading-tight group-hover:text-yellow-500 transition-colors line-clamp-1" style={{ color: theme.textoPrincipal }}>{eco.title}</span>
                          </div>
                          {eco.forecast && <span className="text-[9px] font-bold uppercase tracking-wider opacity-50 shrink-0 ml-2" style={{ color: theme.textoPrincipal }}>Est: {eco.forecast}</span>}
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              )}
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
              <span className="text-[8px] font-bold tracking-widest uppercase opacity-40" style={{ color: theme.textoPrincipal }}>{t('journal.market')}</span>
              <div className="flex flex-wrap gap-2">
                {marketSentiments.map(s => (
                  <button key={s.id} onClick={() => setMarketSentiment(v => v === s.id ? '' : s.id)} title={s.label}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-colors ${marketSentiment === s.id ? 'bg-white/10 opacity-100' : 'bg-black/20 opacity-40 hover:opacity-80'}`}
                    style={{ borderColor: marketSentiment === s.id ? s.color : theme.contornoGeral }}
                  >
                    <s.icon size={15} color={s.color} />
                    <span className="text-[9px] sm:text-[10px] font-bold uppercase hidden sm:block" style={{ color: theme.textoPrincipal }}>{s.label}</span>
                  </button>
                 ))}
              </div>
            </div>

            <div className="w-px self-stretch bg-white/10" />

            <div className="flex flex-col gap-1.5 flex-1 min-w-[200px]">
              <span className="text-[8px] font-bold tracking-widest uppercase opacity-40" style={{ color: theme.textoPrincipal }}>{t('journal.emotionalState')}</span>
              <div className="flex flex-wrap gap-2">
                {traderMoods.map(m => (
                  <button key={m.id} onClick={() => setTraderMood(v => v === m.id ? '' : m.id)} title={m.label}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-colors ${traderMood === m.id ? 'bg-white/10 opacity-100' : 'bg-black/20 opacity-40 hover:opacity-80'}`}
                    style={{ borderColor: traderMood === m.id ? m.color : theme.contornoGeral }}
                  >
                    <m.icon size={15} color={m.color} />
                    <span className="text-[9px] sm:text-[10px] font-bold uppercase hidden sm:block" style={{ color: theme.textoPrincipal }}>{m.label}</span>
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
              {isEditing ? `${t('journal.editingSaved')} — ${selectedDate}` : t('journal.newEntry')}
            </h3>
            {isEditing && (
              <button onClick={() => { setIsEditing(false); setNotes(''); setMarketSentiment(''); setTraderMood(''); }}
                className="text-[8px] font-bold uppercase tracking-widest opacity-50 hover:opacity-100 px-2 py-1 rounded-md bg-white/5 transition-colors"
                style={{ color: theme.textoPrincipal }}>
                {t('journal.clearNew')}
              </button>
            )}
          </div>

          <div className="flex-1 flex flex-col h-full w-full relative">
            <RichTextEditor value={notes} onChange={setNotes} theme={theme} />
          </div>

          <div className="flex justify-between items-center mt-3 pt-3 border-t shrink-0" style={{ borderColor: theme.contornoGeral }}>
            <span className="text-[9px] opacity-40 italic" style={{ color: theme.textoPrincipal }}>
              {isEditing ? t('journal.editingSaved') : t('journal.writingNew')}
            </span>
            
            <div className="flex items-center gap-2">
              {isEditing && (
                 <button
                   onClick={() => { if (window.confirm(t('journal.deleteConfirm'))) { deleteJournal(currentJournal.id); handleNewEntry(); } }}
                   className="px-4 py-2 rounded-lg flex items-center gap-2 font-bold text-xs text-red-500 bg-red-500/10 hover:bg-red-500/20 transition-all"
                 >
                   <Trash2 size={13} /> {t('dash.delete')}
                 </button>
              )}
              <button
                onClick={handleSave}
                className="px-5 py-2 rounded-lg flex items-center gap-2 font-bold text-xs text-black transition-all hover:brightness-110 active:scale-95 shadow-[0_0_20px_rgba(234,179,8,0.2)]"
                style={{ background: '#eab308' }}
              >
                <Save size={13} /> {t('journal.saveJournal')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDEBAR — History */}
      <div className="w-60 self-stretch border-l shrink-0 hidden lg:flex flex-col pt-5 pb-0" style={{ ...getGlassStyle(theme.fundoCards), borderColor: theme.contornoGeral }}>
        <h3 className="text-[9px] font-bold tracking-widest uppercase mb-3 px-4 opacity-40" style={{ color: theme.textoPrincipal }}>{t('journal.history')}</h3>
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
                  {j.notes?.replace(/<[^>]*>/g, '') || t('journal.noNotes')}
                </p>
                <div className="absolute bottom-0 left-0 right-0 flex justify-end px-2 py-1 border-t rounded-b-xl" style={{ borderColor: theme.contornoGeral, background: 'rgba(0,0,0,0.3)' }}>
                  <button
                    onClick={(e) => { e.stopPropagation(); if (window.confirm(t('journal.deleteConfirm'))) deleteJournal(j.id); }}
                    className="flex items-center gap-1 text-[9px] font-bold text-red-400 hover:text-red-300 transition-colors"
                  >
                    <Trash2 size={11} /> {t('dash.delete')}
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
