import React from 'react';
import {
  ComposedChart, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell, PieChart, Pie, ReferenceLine, AreaChart, Area
} from 'recharts';
import {
  Activity, TrendingUp, DollarSign, Percent, Layers, CalendarDays, Target, AlertTriangle, ShieldAlert, Sun, Banknote, Check,
  BarChart2, ChevronLeft, ChevronRight, ChevronDown, Search, ArrowDown, ArrowUp, ListIcon
} from '../../components/Icons';
import { hexToRgba } from '../../utils/constants';

const SectionTitle = ({ icon: Icon, title, theme }) => (
  <div className="flex items-center gap-2 mb-4">
    <Icon size={16} style={{ color: theme.textoSecundario }} />
    <span className="text-[15px] font-bold capitalize" style={{ color: theme.textoSecundario }}>{title}</span>
  </div>
);

export default function AnalyticsView({
  theme,
  settings,
  getGlassStyle,
  getFullDateString,
  activeAccountDays,
  exchangeRate,
  metricRows,
  isEvalTableExpanded,
  setIsEvalTableExpanded,
  isMobile,
  monthlyPnlData,
  userLocale,
  formatCurrency,
  symbolData,
  winLossData,
  metrics,
  formatPercent,
  directionData,
  timeGrouping,
  setTimeGrouping,
  timeDistributionData,
  tradeValuesFilter,
  setTradeValuesFilter,
  availableTradePeriods,
  filteredTradeValuesData,
  cumulativePnlData,
  dayOfWeekData
}) {

  const activeInfoBlock = (
    <div className="rounded-xl px-4 py-3 md:py-4 flex flex-col md:flex-row items-center md:items-center justify-center lg:justify-between text-center shadow-sm transition-all w-full gap-3 md:gap-4 overflow-x-auto hide-scrollbar" style={getGlassStyle(theme.fundoCards)}>
      <div className="flex items-center justify-center gap-2 shrink-0 w-full md:w-auto">
        <CalendarDays size={16} style={{ color: theme.textoSecundario }} />
        <span className="text-xs sm:text-sm font-bold tracking-wider" style={{ color: theme.textoPrincipal }}>{getFullDateString()}</span>
      </div>
      <div className="hidden md:block w-px h-4 opacity-30 shrink-0" style={{ backgroundColor: theme.contornoGeral }}></div>
      <div className="flex items-center justify-center gap-2 shrink-0 w-full md:w-auto">
        <Activity size={16} style={{ color: theme.textoSecundario }} />
        <span className="text-xs sm:text-sm font-bold tracking-wider" style={{ color: theme.textoPrincipal }}>{activeAccountDays} {activeAccountDays === 1 ? 'day' : 'days'} active account</span>
      </div>
      <div className="hidden md:block w-px h-4 opacity-30 shrink-0" style={{ backgroundColor: theme.contornoGeral }}></div>
      <div className="flex items-center justify-center gap-2 shrink-0 w-full md:w-auto">
        <DollarSign size={16} style={{ color: theme.linhaGrafico }} />
        <span className="text-xs sm:text-sm font-bold tracking-tight" style={{ color: theme.linhaGrafico }}>USD/{settings.paymentCurrency}: {exchangeRate ? exchangeRate : '...'}</span>
      </div>
    </div>
  );

  const evaluationTableBlock = (
    <div className="w-full lg:w-1/3 flex flex-col rounded-xl overflow-hidden shadow-xl transition-all h-auto lg:max-h-[1028px]" style={getGlassStyle(theme.fundoCards)}>
      <div className="p-4 border-b shrink-0 flex justify-between items-center cursor-pointer lg:cursor-default" style={{ borderColor: theme.contornoGeral }} onClick={() => isMobile && setIsEvalTableExpanded(!isEvalTableExpanded)}>
        <h3 className="font-bold text-sm" style={{ color: theme.textoSecundario }}>Evaluation</h3>
        {isMobile && <ChevronDown className={`transition-transform duration-300 ${isEvalTableExpanded ? 'rotate-180' : ''}`} size={16} style={{ color: theme.textoSecundario }} />}
      </div>
      <div className={`w-full flex-1 overflow-y-auto hide-scrollbar transition-all ${isMobile && !isEvalTableExpanded ? 'hidden' : 'block'}`}>
        <table className="w-full text-left text-[10px] sm:text-[11px] md:text-xs whitespace-nowrap">
          <tbody>
            {metricRows.map((row, idx) => (
              <tr key={idx} className="transition-colors hover:bg-white/5" style={{ backgroundColor: idx % 2 === 0 ? 'transparent' : 'rgba(128, 128, 128, 0.04)' }}>
                <td className="p-3 sm:p-4 md:p-5 font-semibold w-1/2" style={{ color: theme.textoPrincipal }}>{row.label}</td>
                <td className="p-3 sm:p-4 md:p-5 text-right font-bold w-1/2 text-[9px] sm:text-[10px] md:text-xs" style={{ color: row.color || theme.textoPrincipal }}>{row.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div key="analytics" className="max-w-[1600px] mx-auto w-full animate-tab-enter space-y-6">

      {!isMobile && (
        <header className="flex flex-col p-4 rounded-xl shadow-sm transition-all" style={getGlassStyle(theme.fundoCards)}>
          <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2"><BarChart2 size={24} style={{ color: theme.linhaGrafico }} /> Analytics Dashboard</h2>
          <p className="text-xs md:text-sm mt-1" style={{ color: theme.textoSecundario }}>Deep dive into your trading statistics and performance charts.</p>
        </header>
      )}

      {activeInfoBlock}

      <div className="flex flex-col gap-4">
        <div className="flex flex-col lg:flex-row gap-4 items-stretch w-full">

          {/* Tabela de Dados (Desktop Top Left) */}
          {!isMobile && evaluationTableBlock}

          {/* 5 Gráficos (Grid) */}
          <div className="w-full lg:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* CHART 1: Monthly P&L */}
            <div className="rounded-xl p-4 md:p-6 shadow-sm flex flex-col transition-all w-full" style={{ ...getGlassStyle(theme.fundoCards), height: 300 }}>
              <SectionTitle icon={BarChart2} title="Monthly P&L" theme={theme} />
              <ResponsiveContainer width="100%" height="100%" minHeight={200}>
                <BarChart data={monthlyPnlData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.contornoGeral} />
                  <XAxis dataKey="name" stroke={theme.textoSecundario} tickLine={false} axisLine={false} tick={{ fontSize: 10 }} />
                  <YAxis stroke={theme.textoSecundario} tickLine={false} axisLine={false} tick={{ fontSize: 10 }} tickFormatter={(val) => new Intl.NumberFormat(userLocale, { notation: "compact", compactDisplay: "short", style: "currency", currency: settings.brokerCurrency, currencyDisplay: "narrowSymbol" }).format(val)} />
                  <RechartsTooltip cursor={{ fill: 'rgba(128,128,128,0.1)' }} contentStyle={{ backgroundColor: hexToRgba(theme.fundoCards, 0.9), borderColor: theme.contornoGeral, borderRadius: '8px' }} itemStyle={{ color: theme.textoPrincipal, fontWeight: 'bold' }} labelStyle={{ color: theme.textoSecundario }} formatter={(val) => formatCurrency(val)} />
                  <Bar dataKey="pnl" radius={[4, 4, 0, 0]} isAnimationActive={false}>
                    {monthlyPnlData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.pnl >= 0 ? theme.textoPositivo : theme.textoNegativo} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* CHART 2: Performance by Symbol */}
            <div className="rounded-xl p-4 md:p-6 shadow-sm flex flex-col transition-all w-full" style={{ ...getGlassStyle(theme.fundoCards), height: 300 }}>
              <SectionTitle icon={ListIcon} title="Performance by Symbol" theme={theme} />
              <ResponsiveContainer width="100%" height="100%" minHeight={200}>
                <BarChart data={symbolData} layout="vertical" margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={theme.contornoGeral} />
                  <XAxis type="number" stroke={theme.textoSecundario} tickLine={false} axisLine={false} tick={{ fontSize: 10 }} tickFormatter={(val) => new Intl.NumberFormat(userLocale, { notation: "compact", compactDisplay: "short", style: "currency", currency: settings.brokerCurrency, currencyDisplay: "narrowSymbol" }).format(val)} />
                  <YAxis type="category" dataKey="name" stroke={theme.textoSecundario} tickLine={false} axisLine={false} tick={{ fontSize: 10 }} width={60} />
                  <RechartsTooltip cursor={{ fill: 'rgba(128,128,128,0.1)' }} contentStyle={{ backgroundColor: hexToRgba(theme.fundoCards, 0.9), borderColor: theme.contornoGeral, borderRadius: '8px' }} itemStyle={{ color: theme.textoPrincipal, fontWeight: 'bold' }} labelStyle={{ color: theme.textoSecundario }} formatter={(val) => formatCurrency(val)} />
                  <Bar dataKey="pnl" radius={[0, 4, 4, 0]} isAnimationActive={false}>
                    {symbolData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.pnl >= 0 ? theme.linhaGrafico : theme.textoNegativo} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>


            <div className="rounded-xl p-4 md:p-6 shadow-sm flex flex-col transition-all w-full" style={{ ...getGlassStyle(theme.fundoCards), height: 300 }}>
              <SectionTitle icon={Target} title="Win Rate" theme={theme} />
              <div className="flex-1 relative" style={{ minHeight: 200 }}>
                <ResponsiveContainer width="100%" height="100%" minHeight={200}>
                  <PieChart>
                    <Pie data={winLossData} cx="50%" cy="50%" innerRadius="60%" outerRadius="80%" paddingAngle={5} dataKey="value" stroke="none" isAnimationActive={false}>
                      {winLossData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <RechartsTooltip contentStyle={{ backgroundColor: hexToRgba(theme.fundoCards, 0.9), borderColor: theme.contornoGeral, borderRadius: '8px', borderWidth: settings.borderWidthGeral }} itemStyle={{ color: theme.textoPrincipal, fontWeight: 'bold' }} formatter={(val) => `${val} Trades`} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-bold" style={{ color: theme.textoPrincipal }}>{formatPercent(metrics.winRate)}</span>
                  <span className="text-xs" style={{ color: theme.textoSecundario }}>Win Rate</span>
                </div>
              </div>
            </div>

            {/* CHART 4: P&L by Direction */}
            <div className="rounded-xl p-4 md:p-6 shadow-sm flex flex-col transition-all w-full" style={{ ...getGlassStyle(theme.fundoCards), height: 300 }}>
              <SectionTitle icon={ArrowUp} title="P&L by Direction" theme={theme} />
              <ResponsiveContainer width="100%" height="100%" minHeight={200}>
                <BarChart data={directionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.contornoGeral} />
                  <XAxis dataKey="name" stroke={theme.textoSecundario} tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                  <YAxis stroke={theme.textoSecundario} tickLine={false} axisLine={false} tick={{ fontSize: 10 }} tickFormatter={(val) => new Intl.NumberFormat(userLocale, { notation: "compact", compactDisplay: "short", style: "currency", currency: settings.brokerCurrency, currencyDisplay: "narrowSymbol" }).format(val)} />
                  <RechartsTooltip cursor={{ fill: 'rgba(128,128,128,0.1)' }} contentStyle={{ backgroundColor: hexToRgba(theme.fundoCards, 0.9), borderColor: theme.contornoGeral, borderRadius: '8px' }} itemStyle={{ color: theme.textoPrincipal, fontWeight: 'bold' }} labelStyle={{ color: theme.textoSecundario }} formatter={(val) => formatCurrency(val)} />
                  <Bar dataKey="pnl" radius={[4, 4, 0, 0]} isAnimationActive={false}>
                    {directionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.name === 'Long' ? theme.textoPositivo : theme.textoNegativo} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* CHART 5: Most Traded Hours */}
            <div className="rounded-xl p-4 md:p-6 shadow-sm flex flex-col transition-all w-full sm:col-span-2" style={{ ...getGlassStyle(theme.fundoCards), height: 400 }}>
              <div className="flex justify-between items-center mb-4 gap-2">
                <SectionTitle icon={CalendarDays} title="Most Traded Hours" theme={theme} />
                <div className="flex items-center gap-4">
                  <div className="hidden sm:flex items-center gap-3 text-[11px] font-bold" style={{ color: theme.textoSecundario }}>
                    <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: theme.textoPositivo }}></span>Wins</span>
                    <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: theme.textoNegativo }}></span>Losses</span>
                  </div>
                  <select value={timeGrouping} onChange={e => setTimeGrouping(e.target.value)} className="filter-select outline-none bg-transparent cursor-pointer font-bold px-2 py-1 rounded hover:bg-white/10" style={{ color: theme.linhaGrafico, border: `1px solid ${theme.linhaGrafico}40` }}>
                    <option value="60" className="bg-gray-900">1 Hour</option>
                    <option value="30" className="bg-gray-900">30 Mins</option>
                    <option value="15" className="bg-gray-900">15 Mins</option>
                  </select>
                </div>
              </div>
              <div className="sm:hidden flex items-center gap-3 text-[10px] font-bold mb-4" style={{ color: theme.textoSecundario }}>
                <span className="flex items-center gap-1.5"><span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: theme.textoPositivo }}></span>Wins</span>
                <span className="flex items-center gap-1.5"><span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: theme.textoNegativo }}></span>Losses</span>
              </div>
              <ResponsiveContainer width="100%" height="100%" minHeight={250}>
                <BarChart data={timeDistributionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.contornoGeral} />
                  <XAxis dataKey="name" stroke={theme.textoSecundario} tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                  <YAxis stroke={theme.textoSecundario} tickLine={false} axisLine={false} tick={{ fontSize: 11 }} allowDecimals={false} />
                  <RechartsTooltip
                    cursor={{ fill: 'rgba(128,128,128,0.1)' }}
                    contentStyle={{ backgroundColor: hexToRgba(theme.fundoCards, 0.9), borderColor: theme.contornoGeral, borderRadius: '8px' }}
                    itemStyle={{ fontWeight: 'bold' }}
                    labelStyle={{ color: theme.textoSecundario, marginBottom: 4 }}
                    formatter={(val, name) => {
                      if (name === 'wins') return [`${val}`, 'Wins (Green)'];
                      if (name === 'losses') return [`${val}`, 'Losses (Red)'];
                      if (name === 'count') return [`${val}`, 'Total Trades'];
                      return [val, name];
                    }}
                  />
                  <Bar dataKey="wins" stackId="a" fill={theme.textoPositivo} stroke={theme.fundoCards} strokeWidth={2} isAnimationActive={false} maxBarSize={50} />
                  <Bar dataKey="losses" stackId="a" fill={theme.textoNegativo} stroke={theme.fundoCards} strokeWidth={2} radius={[4, 4, 0, 0]} isAnimationActive={false} maxBarSize={50} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Trade Values Chart */}
        <div className="rounded-xl p-4 md:p-6 shadow-sm flex flex-col transition-all w-full" style={{ ...getGlassStyle(theme.fundoCards), height: isMobile ? 300 : 400 }}>
          <div className="flex justify-between items-center mb-4 gap-2 shrink-0">
            <SectionTitle icon={TrendingUp} title="Trade Values" theme={theme} />
            <select value={tradeValuesFilter} onChange={e => setTradeValuesFilter(e.target.value)} className="filter-select outline-none bg-transparent cursor-pointer font-bold px-2 py-1 rounded hover:bg-white/10" style={{ color: theme.linhaGrafico, border: `1px solid ${theme.linhaGrafico}40` }}>
              <option value="all" className="bg-gray-900">All History</option>
              <option value="today" className="bg-gray-900">Today</option>
              <option value="yesterday" className="bg-gray-900">Yesterday</option>
              <option value="this_week" className="bg-gray-900">This Week</option>
              <option value="last_week" className="bg-gray-900">Last Week</option>
              <option value="this_month" className="bg-gray-900">This Month</option>
              <option value="last_month" className="bg-gray-900">Last Month</option>
              {availableTradePeriods.map(p => {
                const isYear = p.length === 4;
                const label = isYear ? p : new Date(`${p}-01T00:00:00`).toLocaleString(userLocale, { month: 'long', year: 'numeric' });
                return <option key={p} value={p} className="bg-gray-900 capitalize">{label}</option>;
              })}
            </select>
          </div>
          <div className="w-full flex-1" style={{ minHeight: 0, height: '100%' }}>
            <ResponsiveContainer width="100%" height="100%" minHeight={200}>
              <BarChart data={filteredTradeValuesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.contornoGeral} />
                <XAxis dataKey="name" hide />
                <YAxis stroke={theme.textoSecundario} tickLine={false} axisLine={false} tick={{ fontSize: 10 }} tickFormatter={(val) => new Intl.NumberFormat(userLocale, { notation: "compact", compactDisplay: "short", style: "currency", currency: settings.brokerCurrency, currencyDisplay: "narrowSymbol" }).format(val)} />
                <RechartsTooltip cursor={{ fill: 'rgba(128,128,128,0.1)' }} contentStyle={{ backgroundColor: hexToRgba(theme.fundoCards, 0.9), borderColor: theme.contornoGeral, borderRadius: '8px' }} itemStyle={{ color: theme.textoPrincipal, fontWeight: 'bold' }} labelStyle={{ color: theme.textoSecundario }} formatter={(val) => formatCurrency(val)} labelFormatter={(label, entries) => (entries && entries.length) ? entries[0].payload.date : label} />
                <Bar dataKey="pnl" radius={[2, 2, 2, 2]} isAnimationActive={false}>
                  {filteredTradeValuesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.pnl >= 0 ? theme.textoPositivo : theme.textoNegativo} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 items-stretch w-full">
          {/* CHART 7: Cumulative P&L (Equity Curve) */}
          <div className="rounded-xl p-4 md:p-6 shadow-sm flex flex-col transition-all w-full lg:w-1/2" style={{ ...getGlassStyle(theme.fundoCards), height: isMobile ? 300 : 400 }}>
            <div className="flex justify-between items-center mb-4 gap-2 shrink-0">
              <SectionTitle icon={TrendingUp} title="Cumulative P&L" theme={theme} />
            </div>
            <div className="w-full flex-1" style={{ minHeight: 0, height: '100%' }}>
              <ResponsiveContainer width="100%" height="100%" minHeight={200}>
                <AreaChart data={cumulativePnlData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCumulative" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={theme.linhaGrafico} stopOpacity={0.4}/>
                      <stop offset="95%" stopColor={theme.linhaGrafico} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.contornoGeral} />
                  <XAxis dataKey="name" hide />
                  <YAxis stroke={theme.textoSecundario} tickLine={false} axisLine={false} tick={{ fontSize: 10 }} tickFormatter={(val) => new Intl.NumberFormat(userLocale, { notation: "compact", compactDisplay: "short", style: "currency", currency: settings.brokerCurrency, currencyDisplay: "narrowSymbol" }).format(val)} />
                  <RechartsTooltip cursor={{ stroke: theme.contornoGeral, strokeWidth: 1, strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: hexToRgba(theme.fundoCards, 0.9), borderColor: theme.contornoGeral, borderRadius: '8px' }} itemStyle={{ color: theme.textoPrincipal, fontWeight: 'bold' }} labelStyle={{ color: theme.textoSecundario }} formatter={(val) => formatCurrency(val)} />
                  <ReferenceLine y={0} stroke={theme.contornoGeral} />
                  <Area type="monotone" dataKey="cumulativePnl" stroke={theme.linhaGrafico} strokeWidth={2} fillOpacity={1} fill="url(#colorCumulative)" isAnimationActive={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* CHART 8: Performance by Day of Week */}
          <div className="rounded-xl p-4 md:p-6 shadow-sm flex flex-col transition-all w-full lg:w-1/2" style={{ ...getGlassStyle(theme.fundoCards), height: isMobile ? 300 : 400 }}>
            <div className="flex justify-between items-center mb-4 gap-2 shrink-0">
              <SectionTitle icon={BarChart2} title="Performance by Day of Week" theme={theme} />
            </div>
            <div className="w-full flex-1" style={{ minHeight: 0, height: '100%' }}>
              <ResponsiveContainer width="100%" height="100%" minHeight={200}>
                <BarChart data={dayOfWeekData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.contornoGeral} />
                  <XAxis dataKey="name" stroke={theme.textoSecundario} tickLine={false} axisLine={false} tick={{ fontSize: 10 }} />
                  <YAxis stroke={theme.textoSecundario} tickLine={false} axisLine={false} tick={{ fontSize: 10 }} tickFormatter={(val) => new Intl.NumberFormat(userLocale, { notation: "compact", compactDisplay: "short", style: "currency", currency: settings.brokerCurrency, currencyDisplay: "narrowSymbol" }).format(val)} />
                  <RechartsTooltip cursor={{ fill: 'rgba(128,128,128,0.1)' }} contentStyle={{ backgroundColor: hexToRgba(theme.fundoCards, 0.9), borderColor: theme.contornoGeral, borderRadius: '8px' }} itemStyle={{ color: theme.textoPrincipal, fontWeight: 'bold' }} labelStyle={{ color: theme.textoSecundario }} formatter={(val) => formatCurrency(val)} />
                  <ReferenceLine y={0} stroke={theme.contornoGeral} />
                  <Bar dataKey="pnl" radius={[4, 4, 0, 0]} isAnimationActive={false}>
                    {dayOfWeekData?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.pnl >= 0 ? theme.textoPositivo : theme.textoNegativo} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Tabela de Dados (Mobile Bottom - sempre por último) */}
        {isMobile && evaluationTableBlock}

      </div>
    </div>
  );
}
