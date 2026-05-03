import React, { useState } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell, LabelList
} from 'recharts';
import {
  Activity, TrendingUp, DollarSign, Percent, Layers, CalendarDays, Target, AlertTriangle, ShieldAlert, Sun, Banknote, Check,
  BarChart2, ChevronLeft, ChevronRight, Search, ArrowDown, ArrowUp, ListIcon, Newspaper, ZoomIn, X
} from '../../components/Icons';
import { Crown } from 'lucide-react';
import { hexToRgba } from '../../utils/constants';

// Overlay shown when a sub-module is blocked by Admin
const PremiumLockOverlay = ({ label, onUpgrade }: { label: string; onUpgrade: () => void }) => (
  <div className="absolute inset-0 z-30 rounded-xl flex flex-col items-center justify-center gap-3 backdrop-blur-sm" style={{ backgroundColor: 'rgba(0,0,0,0.65)' }}>
    <Crown size={28} className="text-yellow-400" />
    <p className="text-sm font-bold text-white text-center px-4">Upgrade to unlock<br/><span className="text-yellow-400">{label}</span></p>
    <button onClick={onUpgrade} className="px-4 py-1.5 rounded-lg text-xs font-bold bg-yellow-500 text-black hover:bg-yellow-400 transition-colors">
      Upgrade Plan
    </button>
  </div>
);

const SectionTitle = ({ icon: Icon, title, theme, hideTextOnMobile = false }: any) => (
  <div className="flex items-center gap-2">
    <Icon size={16} style={{ color: theme.textoSecundario }} />
    <span className={`${hideTextOnMobile ? 'hidden md:inline' : ''} text-[15px] font-bold capitalize`} style={{ color: theme.textoSecundario }}>{title}</span>
  </div>
);

export default function DashboardHomeView({
  metrics,
  timeMetrics,
  settings,
  theme,
  formatCurrency,
  formatCurrencyDash,
  formatPaymentDash,
  formatPercent,
  formatPercentDecimals,
  exchangeRate,
  t,
  lang,
  getGlassStyle,
  isTrendUp,
  chartData,
  userLocale,
  equityFilter,
  setEquityFilter,
  selectedWeekDate,
  setSelectedWeekDate,
  getStartOfWeek,
  performanceWeeklyData,
  calendarData,
  currentDate,
  setCurrentDate,
  IconTooltip,
  renderHolidaysTooltip,
  renderNewsTooltip,
  setDayTradesModalData,
  miniHistorySort,
  setMiniHistorySort,
  miniSortedTrades,
  formatDate,
  isMobile,
  blockedModules = [],
  onUpgradeClick = (_feature: string) => {}
}) {

  

  const latestResultsData = [
    { label: 'Today', value: timeMetrics.profitToday },
    { label: 'Yesterday', value: timeMetrics.profitYesterday },
    { label: 'This Week', value: timeMetrics.profitThisWeek },
    { label: 'Last Week', value: timeMetrics.profitLastWeek },
    { label: 'This Month', value: timeMetrics.profitThisMonth },
    { label: 'Last Month', value: timeMetrics.profitLastMonth },
    { label: `Profit Split ${settings.paymentCurrency}`, value: metrics.netPnl * (exchangeRate || 0) * (settings.profitSplit / 100), isBrl: true, customColor: theme.linhaGrafico }
  ];

  const latestResultsBlock = (
    <div className="rounded-xl px-3 py-2 md:py-2.5 flex items-center justify-between shadow-sm transition-all w-full gap-2 md:gap-4" style={getGlassStyle(theme.fundoCards)}>
      <div className="p-1.5 rounded-md flex items-center justify-center shrink-0" style={{ backgroundColor: hexToRgba(theme.linhaGrafico, 0.15), color: theme.linhaGrafico }}>
        <Activity size={16} className="shrink-0" />
      </div>

      <div className="flex-1 flex items-center justify-start lg:justify-evenly gap-6 lg:gap-2 overflow-x-auto hide-scrollbar w-full">
        {latestResultsData.map((item, idx) => (
          <React.Fragment key={item.label}>
            <div className="flex flex-col text-center shrink-0">
              <span className="font-bold text-sm leading-none"
                style={{ color: item.customColor ? item.customColor : (item.value >= 0 ? theme.textoPositivo : theme.textoNegativo) }}>
                {item.isBrl ? formatPaymentDash(item.value) : formatCurrencyDash(item.value)}
              </span>
              <span className="text-[8px] md:text-[9px] font-medium opacity-80 mt-1.5 leading-none uppercase tracking-wider" style={{ color: theme.textoSecundario }}>{item.label}</span>
            </div>
            {idx < latestResultsData.length - 1 && (
              <div className="hidden lg:block w-px h-6 opacity-30 shrink-0" style={{ backgroundColor: theme.contornoGeral }}></div>
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="p-1.5 rounded-md flex items-center justify-center shrink-0" style={{ backgroundColor: hexToRgba(theme.linhaGrafico, 0.15), color: theme.linhaGrafico }}>
        <Activity size={16} className="shrink-0" />
      </div>
    </div>
  );

  const renderEquityBlock = () => (
    <div className="rounded-xl p-4 md:p-6 shadow-sm transition-all w-full h-full flex flex-col overflow-hidden" style={getGlassStyle(theme.fundoCards)}>
      <div className="flex items-center justify-between mb-4 shrink-0 gap-3">
        <SectionTitle
          icon={TrendingUp}
          title={t('dash.equityEvolution', lang)}
          theme={theme}
          hideTextOnMobile={true}
        />
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex gap-3 text-[10px] font-bold" style={{ color: theme.textoSecundario }}>
            <div className="flex items-center gap-1"><div className="w-3 h-[2px] rounded" style={{ backgroundColor: theme.linhaGrafico }}></div> Balance</div>
            <div className="flex items-center gap-1"><div className="w-3 h-0 border-t border-dashed" style={{ borderColor: isTrendUp ? theme.textoPositivo : theme.textoNegativo }}></div> Trend</div>
          </div>
          <select value={equityFilter} onChange={e => setEquityFilter(e.target.value)} className="filter-select outline-none bg-transparent cursor-pointer font-bold px-2 py-1 rounded-lg hover:bg-white/10 transition-all shadow-sm border" style={{ color: theme.linhaGrafico, borderColor: theme.contornoGeral }}>
            <option value="all" className="bg-gray-900">All History</option>
            <option value="daily" className="bg-gray-900">Daily View</option>
            <option value="weekly" className="bg-gray-900">Weekly View</option>
            <option value="monthly" className="bg-gray-900">Monthly View</option>
            <option value="yearly" className="bg-gray-900">Yearly View</option>
          </select>
          
        </div>
      </div>
      <div className={`w-full flex-1 overflow-hidden min-h-[150px]`}>
        <ResponsiveContainer  width="100%" height="99%"><LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.contornoGeral} />
            <XAxis dataKey="name" hide />
            <YAxis domain={['auto', 'auto']} stroke={theme.textoSecundario} fontSize={10} tickFormatter={(value) => new Intl.NumberFormat(userLocale, { style: 'currency', currency: settings.brokerCurrency, currencyDisplay: 'narrowSymbol', maximumFractionDigits: 0 }).format(value)} axisLine={false} tickLine={false} />
            <RechartsTooltip contentStyle={{ backgroundColor: hexToRgba(theme.fundoCards, 0.9), borderColor: theme.contornoGeral, borderRadius: '8px', color: theme.textoPrincipal, borderWidth: settings.borderWidthGeral }} itemStyle={{ color: theme.textoPrincipal, fontWeight: 'bold' }} labelStyle={{ display: 'none' }} formatter={(value) => [formatCurrency(value), 'Value']} />
            <Line type="monotone" dataKey="balance" stroke={theme?.linhaGrafico || '#3b82f6'} strokeWidth={(isMobile || settings?.dashboardLayout === 'layout2') ? 1.5 : 3} dot={false} activeDot={{ r: 6, strokeWidth: 0, fill: theme?.linhaGrafico || '#3b82f6' }} />
            {chartData.length > 1 && (<Line type="monotone" dataKey="trend" stroke={isTrendUp ? (theme?.textoPositivo || '#22c55e') : (theme?.textoNegativo || '#ef4444')} strokeWidth={(isMobile || settings?.dashboardLayout === 'layout2') ? 1.5 : 2} strokeDasharray="5 5" dot={false} activeDot={false} />)}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  const weeklyControls = (
    <div className="flex gap-1 items-center rounded-lg p-1 shadow-sm border shrink-0" style={{ backgroundColor: hexToRgba(theme.fundoPrincipal, settings.cardOpacity / 100), borderColor: theme.contornoGeral }}>
      <button onClick={() => setSelectedWeekDate(prev => prev ? new Date(prev.getTime() - 7 * 86400000) : getStartOfWeek(new Date(new Date().getTime() - 7 * 86400000)))} className="p-1 rounded transition-colors hover:bg-white/10" style={{ color: theme.textoSecundario }}><ChevronLeft size={14} /></button>
      <span className="text-[10px] font-bold min-w-[45px] text-center" style={{ color: theme.textoPrincipal }}>
        {selectedWeekDate ? new Intl.DateTimeFormat(userLocale, { day: '2-digit', month: 'short' }).format(selectedWeekDate) : 'All'}
      </span>
      <button onClick={() => setSelectedWeekDate(prev => prev ? new Date(prev.getTime() + 7 * 86400000) : getStartOfWeek(new Date()))} className="p-1 rounded transition-colors hover:bg-white/10" style={{ color: theme.textoSecundario }}><ChevronRight size={14} /></button>
      <div className="w-px h-3 opacity-30 mx-1" style={{ backgroundColor: theme.contornoGeral }}></div>
      <button onClick={() => setSelectedWeekDate(getStartOfWeek(new Date()))} className="text-[10px] px-2 py-1 font-bold rounded-md hover:bg-white/10 transition-colors whitespace-nowrap" style={{ color: theme.linhaGrafico }}>
        This Week
      </button>
      <button onClick={() => setSelectedWeekDate(null)} className="text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-1 font-bold rounded-md hover:bg-white/10 transition-colors" style={{ color: selectedWeekDate === null ? theme.textoPrincipal : theme.textoSecundario }}>All</button>
    </div>
  );

  const renderTradesByDayBlock = () => (
    <div className="rounded-xl p-4 md:p-6 shadow-sm flex flex-col transition-all w-full h-full overflow-hidden" style={getGlassStyle(theme.fundoCards)}>
      <div className="flex items-center justify-between mb-4 shrink-0 gap-3 w-full">
        <SectionTitle
          icon={BarChart2}
          title={t('dash.weeklyTrades', lang)}
          theme={theme}
          hideTextOnMobile={true}
        />
        <div className="flex items-center gap-2">
          {weeklyControls}
          
        </div>
      </div>
      <div className={`w-full flex-1 overflow-hidden min-h-[150px]`}>
        <ResponsiveContainer  width="100%" height="99%"><BarChart data={performanceWeeklyData.daysData} margin={{ top: 25, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.contornoGeral} />
            <XAxis dataKey="name" stroke={theme.textoSecundario} tickLine={false} axisLine={false} tick={{ fontSize: 13, fontWeight: 'normal' }} />
            <YAxis stroke={theme.textoSecundario} tickLine={false} axisLine={false} tick={{ fontSize: 13, fontWeight: 'normal' }} />
            <RechartsTooltip cursor={{ fill: 'rgba(128,128,128,0.1)' }} contentStyle={{ backgroundColor: hexToRgba(theme.fundoCards, 0.9), borderColor: theme.contornoGeral, borderRadius: '8px', borderWidth: settings.borderWidthGeral }} itemStyle={{ color: theme.textoPrincipal, fontWeight: 'bold' }} labelStyle={{ color: theme.textoSecundario, marginBottom: '4px' }} />
            <Bar dataKey="trades" name="Trades" radius={[4, 4, 0, 0]} isAnimationActive={false}>
              <LabelList dataKey="trades" position="top" offset={10} fill="#FFD700" fontSize={14} fontWeight="bold" />
              {performanceWeeklyData.daysData.map((entry, index) => (<Cell key={`cell-${index}`} fill={theme.contornoHoje} />))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  const renderPnlByDayBlock = () => (
    <div className="rounded-xl p-4 md:p-6 shadow-sm flex flex-col transition-all w-full h-full overflow-hidden" style={getGlassStyle(theme.fundoCards)}>
      <div className="flex items-center justify-between mb-4 shrink-0 gap-3 w-full">
        <SectionTitle
          icon={DollarSign}
          title={t('dash.weeklyPnl', lang)}
          theme={theme}
          hideTextOnMobile={true}
        />
        <div className="flex items-center gap-2">
          {weeklyControls}
          
        </div>
      </div>
      <div className={`w-full flex flex-col flex-1 gap-4 justify-center min-h-[200px]`}>
        {performanceWeeklyData.daysData.map((day) => {
          const widthPct = (Math.abs(day.pnl) / performanceWeeklyData.maxAbsPnl) * 100;
          const isPositive = day.pnl >= 0;
          return (
            <div key={day.id} className="flex items-center w-full">
              <div className="min-w-[30px] md:min-w-[40px] text-xs md:text-sm text-right pr-2 md:pr-4 font-normal whitespace-nowrap" style={{ color: theme.textoSecundario }}>{day.name}</div>
              <div className="flex-1 flex items-center h-5 md:h-6">
                <div className="w-1/2 flex justify-end pr-[1px] h-full z-10">{!isPositive && day.pnl !== 0 && (<div className="h-full rounded-l-sm" style={{ width: `${widthPct}%`, backgroundColor: theme.textoNegativo, opacity: 0.9 }}></div>)}</div>
                <div className="w-1/2 flex justify-start pl-[1px] h-full z-10">{isPositive && day.pnl !== 0 && (<div className="h-full rounded-r-sm" style={{ width: `${widthPct}%`, backgroundColor: theme.textoPositivo, opacity: 0.9 }}></div>)}</div>
              </div>
              <div className="min-w-[70px] md:min-w-[90px] text-[10px] md:text-xs text-right font-bold tracking-tight pl-2 md:pl-4 whitespace-nowrap" style={{ color: isPositive ? theme.textoPositivo : theme.textoNegativo }}>{isPositive ? '' : '-'} {formatCurrency(Math.abs(day.pnl))}</div>
            </div>
          )
        })}
      </div>
    </div>
  );

  const currentMonthPnl = calendarData.flatMap(w => w.days).filter(d => d.isCurrentMonth).reduce((sum, d) => sum + d.netPnl, 0);

  const renderCalendarBlock = () => (
    <div className="relative rounded-xl p-4 md:p-6 shadow-sm w-full transition-all h-full flex flex-col" style={getGlassStyle(theme.fundoCards)}>
      {blockedModules.includes('dashboard_calendar') && (
        <PremiumLockOverlay label="Performance Calendar" onUpgrade={() => onUpgradeClick('Performance Calendar')} />
      )}
      <div className="flex items-center justify-between mb-4 gap-3 shrink-0 w-full">
        {/* Title + inline badge for mobile/tablet */}
        <div className="flex items-center gap-2 min-w-0">
          <SectionTitle icon={CalendarDays} title={t('dash.performanceCalendar', lang)} theme={theme} hideTextOnMobile={true} />
          {/* Mobile/tablet: inline P&L badge next to title */}
          <span className="xl:hidden text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full whitespace-nowrap"
            style={{ color: currentMonthPnl >= 0 ? theme.textoPositivo : theme.textoNegativo, backgroundColor: currentMonthPnl >= 0 ? `${theme.textoPositivo}18` : `${theme.textoNegativo}18` }}>
            {formatCurrency(currentMonthPnl)}
          </span>
        </div>

        {/* Desktop: centered month P&L */}
        <div className="hidden xl:flex flex-1 justify-center items-center gap-2">
          <span className="text-xs font-semibold" style={{ color: theme.textoSecundario }}>Month P&L:</span>
          <span className="text-base font-bold" style={{ color: currentMonthPnl >= 0 ? theme.textoPositivo : theme.textoNegativo }}>
            {formatCurrency(currentMonthPnl)}
          </span>
        </div>

        {/* Nav controls always on right */}
        <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar">
          
          <div className="flex gap-1 items-center rounded-lg p-1 w-auto justify-between shadow-sm border shrink-0" style={{ backgroundColor: hexToRgba(theme.fundoPrincipal, settings.cardOpacity / 100), borderColor: theme.contornoGeral }}>
          <div className="flex items-center">
              <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))} className="p-1 rounded transition-colors hover:bg-white/10" style={{ color: theme.textoSecundario }}><ChevronLeft size={14} /></button>
              <span className="capitalize font-bold px-1 lg:px-2 min-w-[85px] lg:min-w-[110px] text-center text-[10px]" style={{ color: theme.textoPrincipal }}>{new Intl.DateTimeFormat(userLocale, { month: 'short', year: 'numeric' }).format(currentDate)}</span>
              <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))} className="p-1 rounded transition-colors hover:bg-white/10" style={{ color: theme.textoSecundario }}><ChevronRight size={14} /></button>
            </div>
            <div className="w-px h-3 opacity-30 mx-1" style={{ backgroundColor: theme.contornoGeral }}></div>
            <button onClick={() => setCurrentDate(new Date())} className="text-[10px] px-1.5 lg:px-2 py-1 font-bold rounded-md hover:bg-white/10 transition-colors whitespace-nowrap" style={{ color: theme.linhaGrafico }}>This Month</button>
          </div>
        </div>
      </div>

      {/* DESKTOP CALENDAR (GRID FORMAT - Quadrados Perfeitos) */}
      <div className="hidden lg:block w-full mt-2 flex-1">
        <div className="grid grid-cols-8 gap-2 h-full content-start">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Week'].map((d, i) => (<div key={d} className="text-center text-xs font-bold tracking-wider mb-2" style={{ color: theme.textoSecundario }}>{i === 7 ? 'Week' : new Intl.DateTimeFormat(userLocale, { weekday: 'short' }).format(new Date(2024, 0, i + 7))}</div>))}
          {calendarData.map((week, widx) => {
            const baseBgSemana = week.summary.pnl > 0 ? theme.fundoDiaPositivo : week.summary.pnl < 0 ? theme.fundoDiaNegativo : theme.fundoPrincipal;
            const bgSemana = settings.enableGlassEffect ? hexToRgba(baseBgSemana, settings.cardOpacity / 100) : baseBgSemana;
            const corContornoSemana = week.summary.pnl > 0 ? theme.contornoPositivo : week.summary.pnl < 0 ? theme.contornoNegativo : theme.contornoGeral;
            const espessuraSemana = week.summary.pnl > 0 ? settings.borderWidthPositivo : week.summary.pnl < 0 ? settings.borderWidthNegativo : settings.borderWidthGeral;

            let weekPctText = "";
            if (week.summary.trades > 0) {
              weekPctText = `${Math.round(week.summary.winRate)}%`;
            }

            return (
              <React.Fragment key={`week-${widx}`}>
                {week.days.map((day, didx) => {
                  const baseBgDia = day.netPnl > 0 ? theme.fundoDiaPositivo : day.netPnl < 0 ? theme.fundoDiaNegativo : 'transparent';
                  const bgDia = baseBgDia === 'transparent' ? 'transparent' : (settings.enableGlassEffect ? hexToRgba(baseBgDia, settings.cardOpacity / 100) : baseBgDia);

                  let corContorno = theme.contornoGeral;
                  let espessuraContorno = settings.borderWidthGeral;

                  // A NotÃƒÆ’Ã‚Â­cia nÃƒÆ’Ã‚Â£o altera mais a cor do contorno
                  if (day.isToday) { corContorno = theme.contornoHoje; espessuraContorno = settings.borderWidthHoje; }
                  else if (day.isHoliday) { corContorno = theme.contornoFeriado; espessuraContorno = settings.borderWidthFeriado; }
                  else if (day.netPnl > 0) { corContorno = theme.contornoPositivo; espessuraContorno = settings.borderWidthPositivo; }
                  else if (day.netPnl < 0) { corContorno = theme.contornoNegativo; espessuraContorno = settings.borderWidthNegativo; }

                  let dayPctText = "";
                  if (day.tradesCount > 0) {
                    dayPctText = `${Math.round(day.winRate)}%`;
                  }

                  return (
                    <div key={`day-${day.dateStr}-${didx}`} style={{ backgroundColor: day.isCurrentMonth ? bgDia : 'transparent', borderColor: corContorno, borderWidth: (day.isToday || day.isHoliday || day.netPnl !== 0) ? espessuraContorno : settings.borderWidthGeral, borderStyle: 'solid', opacity: day.isCurrentMonth ? 1 : 0.1 }} className={`relative p-1 lg:p-2 rounded-lg flex flex-col aspect-square justify-between transition-all shadow-sm hover:scale-[1.03] hover:z-50`}>
                      <div className="flex justify-between items-start w-full">
                        <span className="text-xs font-bold flex items-center gap-1.5" style={{ color: theme.textoSecundario }}>
                          {day.date.getDate()}
                          <div className="flex items-center gap-1">
                            {day.isHoliday && (
                              <IconTooltip content={renderHolidaysTooltip(day.dayHolidays)}>
                                <CalendarDays size={12} style={{ color: theme.contornoFeriado }} />
                              </IconTooltip>
                            )}
                            {day.hasNews && (
                              <IconTooltip content={renderNewsTooltip(day.dayNews)}>
                                <Newspaper size={12} style={{ color: theme.textoAlerta }} />
                              </IconTooltip>
                            )}
                          </div>
                        </span>
                      </div>
                      <div className="flex flex-col items-center flex-1 justify-center gap-0.5 w-full text-center">
                        <div className="text-[11px] lg:text-[13px] font-bold tracking-tighter leading-none" style={{ color: day.netPnl > 0 ? theme.textoPositivo : day.netPnl < 0 ? theme.textoNegativo : theme.textoSecundario }}>{formatCurrency(day.netPnl)}</div>
                        <div className="text-[9px] lg:text-[10px] leading-none whitespace-nowrap" style={{ color: theme.textoSecundario }}>{day.tradesCount} Trades</div>
                        {day.tradesCount > 0 && <div className="text-[9px] lg:text-[10px] font-bold leading-none mt-0.5" style={{ color: day.netPnl >= 0 ? theme.textoPositivo : theme.textoNegativo }}>{dayPctText}</div>}
                      </div>
                      {day.tradesCount > 0 && day.isCurrentMonth && (
                        <div className="absolute bottom-1 left-1 lg:bottom-1.5 lg:left-1.5 z-10">
                          <button onClick={(e) => { e.stopPropagation(); setDayTradesModalData({ dateStr: day.dateStr, trades: day.dayTrades }); }} className="p-1 rounded-md transition-colors hover:bg-white/20" title="View Trades" style={{ color: theme.textoSecundario }}>
                            <Search size={12} />
                          </button>
                        </div>
                      )}
                    </div>
                  )
                })}
                <div key={`summary-${widx}`} className={`relative p-1 lg:p-2 rounded-lg flex flex-col aspect-square justify-between transition-all shadow-sm hover:scale-[1.03] hover:z-50`} style={{ backgroundColor: bgSemana, borderColor: corContornoSemana, borderWidth: week.summary.pnl !== 0 ? espessuraSemana : settings.borderWidthGeral, borderStyle: 'solid' }}>
                  <div className="flex justify-between items-start w-full">
                    <span className="text-xs font-bold flex items-center gap-1.5" style={{ color: theme.textoSecundario }}>
                      W{widx + 1}
                    </span>
                  </div>
                  <div className="flex flex-col items-center flex-1 justify-center gap-0.5 w-full text-center">
                    <div className="text-[11px] lg:text-[13px] font-bold tracking-tighter leading-none" style={{ color: week.summary.pnl >= 0 ? theme.textoPositivo : week.summary.pnl < 0 ? theme.textoNegativo : theme.textoSecundario }}>{formatCurrency(week.summary.pnl)}</div>
                    <div className="text-[9px] lg:text-[10px] leading-none whitespace-nowrap mt-0.5" style={{ color: theme.textoSecundario }}>{week.summary.trades} Trades</div>
                    {week.summary.trades > 0 && <div className="text-[9px] lg:text-[10px] font-bold leading-none mt-0.5" style={{ color: week.summary.pnl >= 0 ? theme.textoPositivo : theme.textoNegativo }}>{weekPctText}</div>}
                  </div>
                </div>
              </React.Fragment>
            )
          })}
        </div>
      </div>

      {/* MOBILE/TABLET CALENDAR (LIST FORMAT) */}
      <div className="block lg:hidden w-full mt-6">
        <div className="flex flex-col gap-2">
          {calendarData.flatMap(week => week.days).filter(day => day.isCurrentMonth).map((day, didx) => {
            const baseBgDia = day.netPnl > 0 ? theme.fundoDiaPositivo : day.netPnl < 0 ? theme.fundoDiaNegativo : 'transparent';
            const bgDia = baseBgDia === 'transparent' ? 'transparent' : (settings.enableGlassEffect ? hexToRgba(baseBgDia, settings.cardOpacity / 100) : baseBgDia);

            let corContorno = theme.contornoGeral;
            let espessuraContorno = settings.borderWidthGeral;

            // A NotÃƒÆ’Ã‚Â­cia nÃƒÆ’Ã‚Â£o altera mais a cor do contorno
            if (day.isToday) { corContorno = theme.contornoHoje; espessuraContorno = settings.borderWidthHoje; }
            else if (day.isHoliday) { corContorno = theme.contornoFeriado; espessuraContorno = settings.borderWidthFeriado; }
            else if (day.netPnl > 0) { corContorno = theme.contornoPositivo; espessuraContorno = settings.borderWidthPositivo; }
            else if (day.netPnl < 0) { corContorno = theme.contornoNegativo; espessuraContorno = settings.borderWidthNegativo; }

            return (
              <div key={didx} className="flex justify-between items-center p-3 sm:px-6 rounded-lg transition-all shadow-sm hover:scale-[1.01] relative hover:z-50" style={{ backgroundColor: bgDia, borderColor: corContorno, borderWidth: (day.isToday || day.isHoliday || day.netPnl !== 0) ? espessuraContorno : settings.borderWidthGeral, borderStyle: 'solid' }}>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-base w-6 text-center" style={{ color: theme.textoPrincipal }}>{day.date.getDate().toString().padStart(2, '0')}</span>
                  <span className="text-xs font-bold uppercase w-10 text-center" style={{ color: theme.textoSecundario }}>{new Intl.DateTimeFormat(userLocale, { weekday: 'short' }).format(day.date)}</span>
                  <div className="flex items-center gap-1.5">
                    {day.isHoliday && (
                      <IconTooltip content={renderHolidaysTooltip(day.dayHolidays)}>
                        <CalendarDays size={16} style={{ color: theme.contornoFeriado }} />
                      </IconTooltip>
                    )}
                    {day.hasNews && (
                      <IconTooltip content={renderNewsTooltip(day.dayNews)}>
                        <Newspaper size={16} style={{ color: theme.textoAlerta }} />
                      </IconTooltip>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:gap-6 text-right">
                  {day.tradesCount > 0 && (
                    <button onClick={(e) => { e.stopPropagation(); setDayTradesModalData({ dateStr: day.dateStr, trades: day.dayTrades }); }} className="p-1.5 md:p-2 rounded-md hover:bg-white/20 transition-colors" title="View Trades" style={{ color: theme.textoSecundario }}>
                      <Search size={14} />
                    </button>
                  )}
                  <div className="text-[10px] md:text-xs tracking-wider hidden sm:block" style={{ color: theme.textoSecundario }}>{day.tradesCount} Trades</div>
                  <div className="text-[11px] md:text-sm font-bold tracking-tight min-w-[70px]" style={{ color: day.netPnl > 0 ? theme.textoPositivo : day.netPnl < 0 ? theme.textoNegativo : theme.textoSecundario }}>
                    {formatCurrency(day.netPnl)}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  );

  const miniHistoryBlock = (
    <div className="relative rounded-xl p-6 shadow-xl transition-all h-full flex flex-col" style={getGlassStyle(theme.fundoCards)}>
      {blockedModules.includes('dashboard_keytrades') && (
        <PremiumLockOverlay label="Key Trades" onUpgrade={() => onUpgradeClick('Key Trades')} />
      )}
      <div className="flex items-start justify-between mb-2 shrink-0">
        <SectionTitle
          icon={ListIcon}
          title={`${t('dash.monthTrades', lang)}: ${new Intl.DateTimeFormat(userLocale, { month: 'long', year: 'numeric' }).format(currentDate)}`}
          theme={theme}
        />
        <button onClick={() => setMiniHistorySort(prev => prev === 'recent' ? 'oldest' : 'recent')} className="text-[10px] px-2 py-1 rounded-lg font-bold transition-all hover:bg-white/10 shadow-sm border" style={{ color: theme.linhaGrafico, borderColor: theme.contornoGeral }}>
          {miniHistorySort === 'recent' ? 'Recent' : 'Oldest'}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto hide-scrollbar relative rounded-lg min-h-0" style={{ backgroundColor: hexToRgba(theme.fundoPrincipal, settings.cardOpacity / 100) }}>
        <table className="w-full text-left text-[9px] sm:text-[10px] md:text-xs whitespace-nowrap">
          <thead className="sticky top-0 z-10 font-bold tracking-wider text-[9px] md:text-[10px] uppercase shadow-sm" style={{ backgroundColor: theme.fundoCards, color: theme.textoSecundario }}>
            <tr>
              <th className="px-2 py-3 md:px-4 md:py-4 text-center">Sym</th>
              <th className="px-2 py-3 md:px-4 md:py-4">Date</th>
              <th className="px-2 py-3 md:px-4 md:py-4 text-center">Dir</th>
              <th className="px-2 py-3 md:px-4 md:py-4 text-center">Qty</th>
              <th className="px-2 py-3 md:px-4 md:py-4 text-right">Gross P&L</th>
            </tr>
          </thead>
          <tbody>
            {miniSortedTrades.map((t, index) => (
              <tr key={t.id} className="transition-colors hover:bg-white/10" style={{ backgroundColor: index % 2 === 0 ? 'transparent' : 'rgba(128, 128, 128, 0.04)' }}>
                <td className="px-2 py-2.5 md:px-4 md:py-3 font-bold text-center text-[9px] md:text-[11px] truncate max-w-[40px] md:max-w-none">{t.symbol || '-'}</td>
                <td className="px-2 py-2.5 md:px-4 md:py-3 font-mono text-[8px] sm:text-[9px] md:text-[10px] leading-tight">
                  <div className="flex flex-col">
                    <span>{formatDate(t.date)}</span>
                    {t.entryTimestamp && <span className="opacity-70">{new Date(t.entryTimestamp).toLocaleTimeString(userLocale, { hour: '2-digit', minute: '2-digit', hour12: false })}</span>}
                  </div>
                </td>
                <td className="px-2 py-2.5 md:px-4 md:py-3 flex justify-center items-center h-full">
                  {t.direction === 'Short' ? <ArrowDown size={12} className="md:w-[14px] md:h-[14px]" style={{ color: theme.textoNegativo }} /> : <ArrowUp size={12} className="md:w-[14px] md:h-[14px]" style={{ color: theme.textoPositivo }} />}
                </td>
                <td className="px-2 py-2.5 md:px-4 md:py-3 font-mono text-center text-[9px] md:text-xs">{t.qty}</td>
                <td className="px-2 py-2.5 md:px-4 md:py-3 font-bold text-right text-[10px] md:text-xs" style={{ color: t.pnl >= 0 ? theme.textoPositivo : theme.textoNegativo }}>
                  {formatCurrency(t.pnl)}
                </td>
              </tr>
            ))}
            {miniSortedTrades.length === 0 && (
              <tr><td colSpan="5" className="p-8 text-center italic" style={{ color: theme.textoSecundario }}>No trades found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="space-y-3 md:space-y-4 max-w-[1600px] mx-auto">
      {/* Account stats section */}
      <div className="relative">
        {blockedModules.includes('dashboard_account_stats') && (
          <div className="absolute inset-0 z-30 rounded-xl flex flex-col items-center justify-center gap-3 backdrop-blur-sm" style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}>
            <Crown size={24} className="text-yellow-400" />
            <p className="text-sm font-bold text-white">Upgrade to see Account Stats</p>
            <button onClick={() => onUpgradeClick('Account Statistics')} className="px-4 py-1.5 rounded-lg text-xs font-bold bg-yellow-500 text-black hover:bg-yellow-400 transition-colors">Upgrade Plan</button>
          </div>
        )}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 md:gap-4 auto-rows-fr">

        {/* 1. Current Balance */}
        <div className="rounded-xl p-3 md:p-4 flex flex-col justify-between shadow-sm group transition-all duration-300 hover:-translate-y-1 w-full h-full min-h-[105px]" style={getGlassStyle(theme.fundoCards)}>
          <div className="flex items-start justify-between mb-2 gap-2" style={{ color: theme.textoSecundario }}>
            <span className="text-[11px] font-bold capitalize tracking-wide mt-1 whitespace-normal leading-tight">Current Balance</span>
            <div className="p-1.5 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110 shrink-0" style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>
              <DollarSign size={14} className="shrink-0" />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center sm:items-end justify-center sm:justify-between my-auto sm:my-0 sm:mt-auto w-full gap-1.5 sm:gap-0">
            <div className="flex flex-col items-center sm:items-start w-full">
              <span className="font-bold leading-tight text-center sm:text-left" style={{ fontSize: 'clamp(1.1rem, 1.2vw + 0.5rem, 1.5rem)', color: theme.linhaGrafico }}>{formatCurrency(metrics.currentBalance)}</span>
              <span className="text-[10px] break-words font-medium mt-1 opacity-80 text-center sm:text-left" style={{ color: theme.textoSecundario }}>Initial: {formatCurrency(settings.initialBalance)}</span>
            </div>
          </div>
        </div>

        {/* 2. Net P&L */}
        <div className="rounded-xl p-3 md:p-4 flex flex-col justify-between shadow-sm group transition-all duration-300 hover:-translate-y-1 w-full h-full min-h-[105px]" style={getGlassStyle(theme.fundoCards)}>
          <div className="flex items-start justify-between mb-2 gap-2" style={{ color: theme.textoSecundario }}>
            <span className="text-[11px] font-bold capitalize tracking-wide mt-1 whitespace-normal leading-tight">Net P&L</span>
            <div className="p-1.5 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110 shrink-0" style={{ backgroundColor: metrics.netPnl >= 0 ? `${theme.textoPositivo}25` : `${theme.textoNegativo}25`, color: metrics.netPnl >= 0 ? theme.textoPositivo : theme.textoNegativo }}>
              <TrendingUp size={14} className="shrink-0" />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center sm:items-end justify-center sm:justify-between my-auto sm:my-0 sm:mt-auto w-full gap-2 sm:gap-0">
            <div className="flex flex-col items-center sm:items-start w-full">
              <span className="font-bold leading-tight text-center sm:text-left" style={{ fontSize: 'clamp(1.1rem, 1.2vw + 0.5rem, 1.5rem)', color: metrics.netPnl >= 0 ? theme.textoPositivo : theme.textoNegativo }}>{formatCurrency(metrics.netPnl)}</span>
              <span className="text-[10px] break-words font-medium mt-1 opacity-80 text-center sm:text-left" style={{ color: theme.textoSecundario }}>Fees: {formatCurrency(metrics.totalFees)}</span>
            </div>
            <div className="w-full h-px sm:hidden opacity-30 my-1" style={{ backgroundColor: theme.contornoGeral }}></div>
            <div className="flex flex-col justify-center items-center sm:justify-end sm:items-end sm:-mb-1 sm:-mr-1 md:-mb-1.5 md:-mr-1.5 shrink-0 w-full sm:w-auto">
              <span className="text-sm sm:text-base lg:text-lg font-bold leading-none" style={{ color: metrics.netPnl >= 0 ? theme.textoPositivo : theme.textoNegativo }}>{formatPercent(settings.initialBalance > 0 ? (metrics.netPnl / settings.initialBalance) * 100 : 0)}</span>
            </div>
          </div>
        </div>

        {/* 3. Win Rate */}
        <div className="rounded-xl p-3 md:p-4 flex flex-col justify-between shadow-sm group transition-all duration-300 hover:-translate-y-1 w-full h-full min-h-[105px]" style={getGlassStyle(theme.fundoCards)}>
          <div className="flex items-start justify-between mb-2 gap-2" style={{ color: theme.textoSecundario }}>
            <span className="text-[11px] font-bold capitalize tracking-wide mt-1 whitespace-normal leading-tight">Win Rate</span>
            <div className="p-1.5 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110 shrink-0" style={{ backgroundColor: 'rgba(168, 85, 247, 0.15)', color: '#a855f7' }}>
              <Percent size={14} className="shrink-0" />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center sm:items-end justify-center sm:justify-between my-auto sm:my-0 sm:mt-auto w-full gap-2 sm:gap-0">
            <div className="flex flex-col items-center sm:items-start w-full">
              <span className="font-bold text-xl sm:text-2xl lg:text-2xl leading-none text-center sm:text-left" style={{ color: theme.textoPrincipal }}>{formatPercent(metrics.winRate)}</span>
              <span className="text-[10px] break-words font-medium mt-1 opacity-80 text-center sm:text-left" style={{ color: theme.textoSecundario }}>{metrics.totalTrades} Trades</span>
            </div>
            <div className="w-full h-px sm:hidden opacity-30 my-1" style={{ backgroundColor: theme.contornoGeral }}></div>
            <div className="flex gap-4 items-center justify-center sm:items-end sm:justify-end sm:-mb-1 sm:-mr-1 md:-mb-1.5 md:-mr-1.5 shrink-0 w-full sm:w-auto">
              <div className="flex flex-col items-center">
                <span className="text-[9px] font-bold" style={{ color: theme.textoPositivo }}>LONG</span>
                <span className="text-[11px] font-bold" style={{ color: theme.textoPrincipal }}>{metrics.longWins}/{metrics.longTrades}</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[9px] font-bold" style={{ color: theme.textoNegativo }}>SHORT</span>
                <span className="text-[11px] font-bold" style={{ color: theme.textoPrincipal }}>{metrics.shortWins}/{metrics.shortTrades}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Metrics */}
        <div className="rounded-xl p-3 md:p-4 flex flex-col justify-between shadow-sm group transition-all duration-300 hover:-translate-y-1 w-full h-full min-h-[105px]" style={getGlassStyle(theme.fundoCards)}>
          <div className="flex items-start justify-between mb-2 gap-2" style={{ color: theme.textoSecundario }}>
            <span className="text-[11px] font-bold capitalize tracking-wide mt-1 whitespace-normal leading-tight">Metrics</span>
            <div className="p-1.5 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110 shrink-0" style={{ backgroundColor: 'rgba(168, 85, 247, 0.15)', color: '#a855f7' }}>
              <Activity size={14} className="shrink-0" />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row w-full items-center justify-center sm:justify-between my-auto sm:my-0 sm:mt-auto gap-1 sm:gap-0">
            <div className="flex-1 flex flex-col items-center justify-center text-center w-full">
              <span className="font-bold text-xl sm:text-2xl lg:text-2xl leading-none" style={{ color: metrics.profitFactor >= 1 ? theme.textoPositivo : theme.textoNegativo }}>
                {Number(metrics.profitFactor).toFixed(2)}
              </span>
              <span className="text-[9px] font-medium opacity-80 mt-1" style={{ color: theme.textoSecundario }}>Profit Factor</span>
            </div>
            <div className="w-full h-px sm:w-px sm:h-6 opacity-30 my-2 sm:my-0 sm:mx-1" style={{ backgroundColor: theme.contornoGeral }}></div>
            <div className="flex-1 flex flex-col items-center justify-center text-center w-full">
              <span className="font-bold text-xl sm:text-2xl lg:text-2xl leading-none" style={{ color: metrics.avgRR >= 1 ? theme.textoPositivo : theme.textoNegativo }}>
                {Number(metrics.avgRR).toFixed(2)}
              </span>
              <span className="text-[9px] font-medium opacity-80 mt-1" style={{ color: theme.textoSecundario }}>Average RR</span>
            </div>
          </div>
        </div>

        {/* 5. Trades */}
        <div className="rounded-xl p-3 md:p-4 flex flex-col justify-between shadow-sm group transition-all duration-300 hover:-translate-y-1 w-full h-full min-h-[105px]" style={getGlassStyle(theme.fundoCards)}>
          <div className="flex items-start justify-between mb-2 gap-2" style={{ color: theme.textoSecundario }}>
            <span className="text-[11px] font-bold capitalize tracking-wide mt-1 whitespace-normal leading-tight">Trades</span>
            <div className="p-1.5 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110 shrink-0" style={{ backgroundColor: 'rgba(99, 102, 241, 0.15)', color: '#6366f1' }}>
              <Layers size={14} className="shrink-0" />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center sm:items-end justify-center sm:justify-between my-auto sm:my-0 sm:mt-auto w-full gap-2 sm:gap-0">
            <div className="flex flex-col items-center sm:items-start w-full">
              <span className="font-bold text-xl sm:text-2xl lg:text-2xl leading-none text-center sm:text-left" style={{ color: theme.textoPrincipal }}>{metrics.totalTrades}</span>
            </div>
            <div className="w-full h-px sm:hidden opacity-30 my-2" style={{ backgroundColor: theme.contornoGeral }}></div>
            <div className="flex gap-4 items-center justify-center sm:items-end sm:justify-end sm:-mb-1 sm:-mr-1 md:-mb-1.5 md:-mr-1.5 shrink-0 w-full sm:w-auto">
              <div className="flex flex-col items-center">
                <span className="text-[9px] font-bold" style={{ color: theme.textoPositivo }}>WIN</span>
                <span className="text-[11px] font-bold" style={{ color: theme.textoPrincipal }}>{metrics.winningTrades}</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[9px] font-bold" style={{ color: theme.textoNegativo }}>LOSS</span>
                <span className="text-[11px] font-bold" style={{ color: theme.textoPrincipal }}>{metrics.losingTrades}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 6. Traded Days */}
        <div className="rounded-xl p-3 md:p-4 flex flex-col justify-between shadow-sm group transition-all duration-300 hover:-translate-y-1 w-full h-full min-h-[105px]" style={getGlassStyle(theme.fundoCards)}>
          <div className="flex items-start justify-between mb-2 gap-2" style={{ color: theme.textoSecundario }}>
            <span className="text-[11px] font-bold capitalize tracking-wide mt-1 whitespace-normal leading-tight">Traded Days</span>
            <div className="p-1.5 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110 shrink-0" style={{ backgroundColor: 'rgba(236, 72, 153, 0.15)', color: '#ec4899' }}>
              <CalendarDays size={14} className="shrink-0" />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center sm:items-end justify-center sm:justify-between my-auto sm:my-0 sm:mt-auto w-full gap-2 sm:gap-0">
            <div className="flex flex-col items-center sm:items-start w-full">
              <span className="font-bold text-xl sm:text-2xl lg:text-2xl leading-none text-center sm:text-left" style={{ color: theme.textoPrincipal }}>{metrics.totalDays}</span>
            </div>
            <div className="w-full h-px sm:hidden opacity-30 my-2" style={{ backgroundColor: theme.contornoGeral }}></div>
            <div className="flex gap-4 items-center justify-center sm:items-end sm:justify-end sm:-mb-1 sm:-mr-1 md:-mb-1.5 md:-mr-1.5 shrink-0 w-full sm:w-auto">
              <div className="flex flex-col items-center">
                <span className="text-[9px] font-bold" style={{ color: theme.textoPositivo }}>WIN</span>
                <span className="text-[11px] font-bold" style={{ color: theme.textoPrincipal }}>{metrics.winDays}</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[9px] font-bold" style={{ color: theme.textoNegativo }}>LOSS</span>
                <span className="text-[11px] font-bold" style={{ color: theme.textoPrincipal }}>{metrics.lossDays}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 7. Daily Limit */}
        <div className="rounded-xl p-3 md:p-4 flex flex-col justify-between shadow-sm group transition-all duration-300 hover:-translate-y-1 w-full h-full min-h-[105px]" style={getGlassStyle(theme.fundoCards)}>
          <div className="flex items-start justify-between mb-2 gap-2" style={{ color: theme.textoSecundario }}>
            <span className="text-[11px] font-bold capitalize tracking-wide mt-1 whitespace-normal leading-tight">Daily Limit</span>
            <div className="p-1.5 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110 shrink-0" style={{ backgroundColor: 'rgba(6, 182, 212, 0.15)', color: '#06b6d4' }}>
              <Target size={14} className="shrink-0" />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center sm:items-end justify-center sm:justify-between my-auto sm:my-0 sm:mt-auto w-full gap-2 sm:gap-0">
            <div className="flex flex-col items-center sm:items-start w-full">
              <span className="font-bold leading-tight text-center sm:text-left" style={{ fontSize: 'clamp(1.1rem, 1.2vw + 0.5rem, 1.5rem)', color: metrics.remainingDailyLimit < 0 ? theme.textoNegativo : (metrics.remainingDailyLimit < settings.dailyLossLimit ? theme.textoAlerta : theme.textoPositivo) }}>
                {formatCurrency(metrics.remainingDailyLimit)}
              </span>
              <span className="text-[10px] break-words font-medium mt-1 opacity-80 text-center sm:text-left" style={{ color: theme.textoSecundario }}>Base Limit: {formatCurrency(settings.dailyLossLimit)}</span>
            </div>
            <div className="w-full h-px sm:hidden opacity-30 my-1" style={{ backgroundColor: theme.contornoGeral }}></div>
            <div className="flex flex-col justify-center items-center sm:justify-end sm:items-end sm:-mb-1 sm:-mr-1 md:-mb-1.5 md:-mr-1.5 shrink-0 w-full sm:w-auto">
              <span className="text-sm sm:text-base lg:text-lg font-bold leading-none" style={{ color: theme.textoPrincipal }}>{formatPercent(settings.dailyLossLimit > 0 ? (metrics.remainingDailyLimit / settings.dailyLossLimit) * 100 : 0)}</span>
            </div>
          </div>
        </div>

        {/* 8. Account Drawdown */}
        <div className="rounded-xl p-3 md:p-4 flex flex-col justify-between shadow-sm group transition-all duration-300 hover:-translate-y-1 w-full h-full min-h-[105px]" style={getGlassStyle(theme.fundoCards)}>
          <div className="flex items-start justify-between mb-2 gap-2" style={{ color: theme.textoSecundario }}>
            <span className="text-[11px] font-bold capitalize tracking-wide mt-1 whitespace-normal leading-tight">Account Drawdown</span>
            <div className="p-1.5 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110 shrink-0" style={{ backgroundColor: 'rgba(244, 63, 94, 0.15)', color: '#f43f5e' }}>
              <AlertTriangle size={14} className="shrink-0" />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center sm:items-end justify-center sm:justify-between my-auto sm:my-0 sm:mt-auto w-full gap-2 sm:gap-0">
            <div className="flex flex-col items-center sm:items-start w-full">
              <span className="font-bold leading-tight text-center sm:text-left" style={{ fontSize: 'clamp(1.1rem, 1.2vw + 0.5rem, 1.5rem)', color: metrics.accountStopColor }}>
                {formatCurrency(metrics.accountStopRemaining)}
              </span>
              <span className="text-[10px] break-words font-medium mt-1 opacity-80 text-center sm:text-left" style={{ color: theme.textoSecundario }}>Stop Limit: {formatCurrency(settings.totalStopLoss)}</span>
            </div>
            <div className="w-full h-px sm:hidden opacity-30 my-1" style={{ backgroundColor: theme.contornoGeral }}></div>
            <div className="flex flex-col justify-center items-center sm:justify-end sm:items-end sm:-mb-1 sm:-mr-1 md:-mb-1.5 md:-mr-1.5 shrink-0 w-full sm:w-auto">
              <span className="text-sm sm:text-base lg:text-lg font-bold leading-none" style={{ color: theme.textoPrincipal }}>{formatPercent(metrics.accountStopRemainingPct)}</span>
            </div>
          </div>
        </div>

        {/* 9. Max Profit / Drawdown */}
        <div className="rounded-xl p-3 md:p-4 flex flex-col justify-between shadow-sm group transition-all duration-300 hover:-translate-y-1 w-full h-full min-h-[105px]" style={getGlassStyle(theme.fundoCards)}>
          <div className="flex items-start justify-between mb-2 gap-2" style={{ color: theme.textoSecundario }}>
            <span className="text-[11px] font-bold capitalize tracking-wide mt-1 whitespace-normal leading-tight">Max Profit / Drawdown</span>
            <div className="p-1.5 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110 shrink-0" style={{ backgroundColor: 'rgba(244, 63, 94, 0.15)', color: '#f43f5e' }}>
              <ShieldAlert size={14} className="shrink-0" />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row w-full items-center justify-center sm:justify-between my-auto sm:my-0 sm:mt-auto gap-2 sm:gap-0">
            <div className="flex-1 flex flex-col items-center justify-center text-center w-full">
              <span className="font-bold text-sm lg:text-base leading-tight" style={{ color: theme.textoPositivo }}>{formatCurrency(metrics.maxProfit)}</span>
              <span className="text-[9px] font-medium opacity-80 mt-0.5" style={{ color: theme.textoSecundario }}>{formatPercent(settings.initialBalance > 0 ? (metrics.maxProfit / settings.initialBalance) * 100 : 0)}</span>
            </div>
            <div className="w-full h-px sm:w-px sm:h-6 opacity-30 my-2 sm:my-0 sm:mx-1" style={{ backgroundColor: theme.contornoGeral }}></div>
            <div className="flex-1 flex flex-col items-center justify-center text-center w-full">
              <span className="font-bold text-sm lg:text-base leading-tight" style={{ color: theme.textoNegativo }}>{formatCurrency(metrics.maxDrawdown)}</span>
              <span className="text-[9px] font-medium opacity-80 mt-0.5" style={{ color: theme.textoSecundario }}>{formatPercent(metrics.peakBalance > 0 ? (metrics.maxDrawdown / metrics.peakBalance) * 100 : 0)}</span>
            </div>
          </div>
        </div>

        {/* 10. Better / Bad Day */}
        <div className="rounded-xl p-3 md:p-4 flex flex-col justify-between shadow-sm group transition-all duration-300 hover:-translate-y-1 w-full h-full min-h-[105px]" style={getGlassStyle(theme.fundoCards)}>
          <div className="flex items-start justify-between mb-2 gap-2" style={{ color: theme.textoSecundario }}>
            <span className="text-[11px] font-bold capitalize tracking-wide mt-1 whitespace-normal leading-tight">Better / Bad Day</span>
            <div className="p-1.5 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110 shrink-0" style={{ backgroundColor: 'rgba(234, 179, 8, 0.15)', color: '#eab308' }}>
              <Sun size={14} className="shrink-0" />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row w-full items-center justify-center sm:justify-between my-auto sm:my-0 sm:mt-auto gap-2 sm:gap-0">
            <div className="flex-1 flex flex-col items-center justify-center text-center w-full">
              <span className="font-bold text-sm lg:text-base leading-tight" style={{ color: theme.textoPositivo }}>{formatCurrency(metrics.betterDay)}</span>
              <span className="text-[9px] font-medium opacity-80 mt-0.5" style={{ color: theme.textoSecundario }}>{formatPercent(metrics.betterDayPct)}</span>
            </div>
            <div className="w-full h-px sm:w-px sm:h-6 opacity-30 my-2 sm:my-0 sm:mx-1" style={{ backgroundColor: theme.contornoGeral }}></div>
            <div className="flex-1 flex flex-col items-center justify-center text-center w-full">
              <span className="font-bold text-sm lg:text-base leading-tight" style={{ color: theme.textoNegativo }}>{metrics.badDay < 0 ? '' : '-'}{formatCurrency(Math.abs(metrics.badDay))}</span>
              <span className="text-[9px] font-medium opacity-80 mt-0.5" style={{ color: theme.textoSecundario }}>{formatPercent(metrics.badDayPct)}</span>
            </div>
          </div>
        </div>

        {/* 11. Gross / Fees */}
        <div className="rounded-xl p-3 md:p-4 flex flex-col justify-between shadow-sm group transition-all duration-300 hover:-translate-y-1 w-full h-full min-h-[105px]" style={getGlassStyle(theme.fundoCards)}>
          <div className="flex items-start justify-between mb-2 gap-2" style={{ color: theme.textoSecundario }}>
            <span className="text-[11px] font-bold capitalize tracking-wide mt-1 whitespace-normal leading-tight">Gross P&L / Fees</span>
            <div className="p-1.5 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110 shrink-0" style={{ backgroundColor: 'rgba(34, 197, 94, 0.15)', color: '#22c55e' }}>
              <Banknote size={14} className="shrink-0" />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row w-full items-center justify-center sm:justify-between my-auto sm:my-0 sm:mt-auto gap-2 sm:gap-0">
            <div className="flex-1 flex flex-col items-center justify-center text-center w-full">
              <span className="font-bold text-sm lg:text-base leading-tight" style={{ color: theme.textoPositivo }}>{formatCurrency(metrics.totalGrossProfit)}</span>
              <span className="text-[9px] font-medium opacity-80 mt-0.5" style={{ color: theme.textoSecundario }}>Gross Win</span>
            </div>
            <div className="w-full h-px sm:w-px sm:h-6 opacity-30 my-2 sm:my-0 sm:mx-1" style={{ backgroundColor: theme.contornoGeral }}></div>
            <div className="flex-1 flex flex-col items-center justify-center text-center w-full">
              <span className="font-bold text-sm lg:text-base leading-tight" style={{ color: theme.textoNegativo }}>-{formatCurrency(metrics.totalGrossLoss)}</span>
              <span className="text-[9px] font-medium opacity-80 mt-0.5" style={{ color: theme.textoSecundario }}>Gross Loss</span>
            </div>
          </div>
        </div>

        {/* 12. Consistency */}
        <div className="rounded-xl p-3 md:p-4 flex flex-col justify-between shadow-sm group transition-all duration-300 hover:-translate-y-1 w-full h-full min-h-[105px]" style={getGlassStyle(theme.fundoCards)}>
          <div className="flex items-start justify-between mb-2 gap-2" style={{ color: theme.textoSecundario }}>
            <span className="text-[11px] font-bold capitalize tracking-wide mt-1 whitespace-normal leading-tight">Consistency Target</span>
            <div className="p-1.5 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110 shrink-0" style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>
              <Check size={14} className="shrink-0" />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center sm:items-end justify-center sm:justify-between my-auto sm:my-0 sm:mt-auto w-full gap-2 sm:gap-0">
            <div className="flex flex-col items-center sm:items-start w-full">
              <span className="font-bold leading-tight text-center sm:text-left" style={{ fontSize: 'clamp(1.1rem, 1.2vw + 0.5rem, 1.5rem)', color: metrics.consistencyPct <= settings.consistencyTarget ? theme.textoPositivo : theme.textoNegativo }}>
                {formatPercent(metrics.consistencyPct)}
              </span>
              <span className="text-[10px] break-words font-medium mt-1 opacity-80 text-center sm:text-left" style={{ color: theme.textoSecundario }}>Target: {settings.consistencyTarget}%</span>
            </div>
          </div>
        </div>
        </div>
      </div>{/* end relative stats wrapper */}

      {latestResultsBlock}

      {settings.dashboardLayout === 'layout1' ? (
        <div className="space-y-4 mt-4">
          <div className="h-[300px] md:h-[400px]">
            {renderEquityBlock()}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-[300px] md:h-[350px]">{renderTradesByDayBlock()}</div>
            <div className="h-[300px] md:h-[350px]">{renderPnlByDayBlock()}</div>
          </div>
          {renderCalendarBlock()}
        </div>
      ) : (
        <div className="space-y-4 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 auto-rows-fr">
            <div className="lg:col-span-1 h-[300px] md:h-[350px]">
              {renderEquityBlock()}
            </div>
            <div className="lg:col-span-1 h-[300px] md:h-[350px]">
              {renderTradesByDayBlock()}
            </div>
            <div className="lg:col-span-1 h-[300px] md:h-[350px]">
              {renderPnlByDayBlock()}
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className={isMobile ? "lg:col-span-3" : "lg:col-span-2"}>
              {renderCalendarBlock()}
            </div>
            {!isMobile && (
              <div className="lg:col-span-1 h-[400px] lg:h-auto relative">
                <div className="lg:absolute lg:inset-0 w-full h-full">
                  {miniHistoryBlock}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}





