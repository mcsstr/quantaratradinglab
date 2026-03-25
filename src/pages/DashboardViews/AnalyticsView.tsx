import React from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell, LabelList, PieChart, Pie
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
  filteredTradeValuesData
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
    <div className="w-full lg:w-1/3 flex flex-col rounded-xl overflow-hidden shadow-xl transition-all h-auto lg:max-h-[948px]" style={getGlassStyle(theme.fundoCards)}>
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
            <div className="rounded-xl p-4 md:p-6 shadow-sm flex flex-col transition-all w-full h-[300px]" style={getGlassStyle(theme.fundoCards)}>
              <SectionTitle icon={BarChart2} title="Monthly P&L" theme={theme} />
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyPnlData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.contornoGeral} />
                  <XAxis dataKey="name" stroke={theme.textoSecundario} tickLine={false} axisLine={false} tick={{ fontSize: 10 }} />
                  <YAxis stroke={theme.textoSecundario} tickLine={false} axisLine={false} tick={{ fontSize: 10 }} tickFormatter={(val) => new Intl.NumberFormat(userLocale, { notation: "compact", compactDisplay: "short", style: "currency", currency: settings.brokerCurrency, currencyDisplay: "narrowSymbol" }).format(val)} />
                  <RechartsTooltip cursor={{ fill: 'rgba(128,128,128,0.1)' }} contentStyle={{ backgroundColor: hexToRgba(theme.fundoCards, 0.9), borderColor: theme.contornoGeral, borderRadius: '8px' }} itemStyle={{ color: theme.textoPrincipal, fontWeight: 'bold' }} labelStyle={{ color: theme.textoSecundario }} formatter={(val) => formatCurrency(val)} />
                  <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
                    {monthlyPnlData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.pnl >= 0 ? theme.textoPositivo : theme.textoNegativo} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* CHART 2: Performance by Symbol */}
            <div className="rounded-xl p-4 md:p-6 shadow-sm flex flex-col transition-all w-full h-[300px]" style={getGlassStyle(theme.fundoCards)}>
              <SectionTitle icon={ListIcon} title="Performance by Symbol" theme={theme} />
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={symbolData} layout="vertical" margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={theme.contornoGeral} />
                  <XAxis type="number" stroke={theme.textoSecundario} tickLine={false} axisLine={false} tick={{ fontSize: 10 }} tickFormatter={(val) => new Intl.NumberFormat(userLocale, { notation: "compact", compactDisplay: "short", style: "currency", currency: settings.brokerCurrency, currencyDisplay: "narrowSymbol" }).format(val)} />
                  <YAxis type="category" dataKey="name" stroke={theme.textoSecundario} tickLine={false} axisLine={false} tick={{ fontSize: 10 }} width={60} />
                  <RechartsTooltip cursor={{ fill: 'rgba(128,128,128,0.1)' }} contentStyle={{ backgroundColor: hexToRgba(theme.fundoCards, 0.9), borderColor: theme.contornoGeral, borderRadius: '8px' }} itemStyle={{ color: theme.textoPrincipal, fontWeight: 'bold' }} labelStyle={{ color: theme.textoSecundario }} formatter={(val) => formatCurrency(val)} />
                  <Bar dataKey="pnl" radius={[0, 4, 4, 0]}>
                    {symbolData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.pnl >= 0 ? theme.linhaGrafico : theme.textoNegativo} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>


            <div className="rounded-xl p-4 md:p-6 shadow-sm flex flex-col transition-all w-full h-[300px]" style={getGlassStyle(theme.fundoCards)}>
              <SectionTitle icon={Target} title="Win Rate" theme={theme} />
              <div className="flex-1 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={winLossData} cx="50%" cy="50%" innerRadius="60%" outerRadius="80%" paddingAngle={5} dataKey="value" stroke="none">
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
            <div className="rounded-xl p-4 md:p-6 shadow-sm flex flex-col transition-all w-full h-[300px]" style={getGlassStyle(theme.fundoCards)}>
              <SectionTitle icon={ArrowUp} title="P&L by Direction" theme={theme} />
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={directionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.contornoGeral} />
                  <XAxis dataKey="name" stroke={theme.textoSecundario} tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                  <YAxis stroke={theme.textoSecundario} tickLine={false} axisLine={false} tick={{ fontSize: 10 }} tickFormatter={(val) => new Intl.NumberFormat(userLocale, { notation: "compact", compactDisplay: "short", style: "currency", currency: settings.brokerCurrency, currencyDisplay: "narrowSymbol" }).format(val)} />
                  <RechartsTooltip cursor={{ fill: 'rgba(128,128,128,0.1)' }} contentStyle={{ backgroundColor: hexToRgba(theme.fundoCards, 0.9), borderColor: theme.contornoGeral, borderRadius: '8px' }} itemStyle={{ color: theme.textoPrincipal, fontWeight: 'bold' }} labelStyle={{ color: theme.textoSecundario }} formatter={(val) => formatCurrency(val)} />
                  <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
                    {directionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.name === 'Long' ? theme.textoPositivo : theme.textoNegativo} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* CHART 5: Most Traded Hours (Ocupa 2 colunas para fechar o grid perfeitamente) */}
            <div className="rounded-xl p-4 md:p-6 shadow-sm flex flex-col transition-all w-full h-[300px] sm:col-span-2" style={getGlassStyle(theme.fundoCards)}>
              <div className="flex justify-between items-center mb-4 gap-2">
                <SectionTitle icon={CalendarDays} title="Most Traded Hours" theme={theme} />
                <select value={timeGrouping} onChange={e => setTimeGrouping(e.target.value)} className="filter-select outline-none bg-transparent cursor-pointer font-bold px-2 py-1 rounded hover:bg-white/10" style={{ color: theme.linhaGrafico, border: `1px solid ${theme.linhaGrafico}40` }}>
                  <option value="60" className="bg-gray-900">1 Hour</option>
                  <option value="30" className="bg-gray-900">30 Mins</option>
                  <option value="15" className="bg-gray-900">15 Mins</option>
                </select>
              </div>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={timeDistributionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.contornoGeral} />
                  <XAxis dataKey="name" stroke={theme.textoSecundario} tickLine={false} axisLine={false} tick={{ fontSize: 10 }} />
                  <YAxis stroke={theme.textoSecundario} tickLine={false} axisLine={false} tick={{ fontSize: 10 }} allowDecimals={false} />
                  <RechartsTooltip cursor={{ fill: 'rgba(128,128,128,0.1)' }} contentStyle={{ backgroundColor: hexToRgba(theme.fundoCards, 0.9), borderColor: theme.contornoGeral, borderRadius: '8px' }} itemStyle={{ color: theme.textoPrincipal, fontWeight: 'bold' }} labelStyle={{ color: theme.textoSecundario }} formatter={(val) => [`${val} Trades`, 'Volume']} />
                  <Bar dataKey="count" fill={theme.linhaGrafico} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Trade Values Chart */}
        <div className="rounded-xl p-4 md:p-6 shadow-sm flex flex-col transition-all w-full h-[300px] md:h-[400px]" style={getGlassStyle(theme.fundoCards)}>
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
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={filteredTradeValuesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.contornoGeral} />
                <XAxis dataKey="name" hide />
                <YAxis stroke={theme.textoSecundario} tickLine={false} axisLine={false} tick={{ fontSize: 10 }} tickFormatter={(val) => new Intl.NumberFormat(userLocale, { notation: "compact", compactDisplay: "short", style: "currency", currency: settings.brokerCurrency, currencyDisplay: "narrowSymbol" }).format(val)} />
                <RechartsTooltip cursor={{ fill: 'rgba(128,128,128,0.1)' }} contentStyle={{ backgroundColor: hexToRgba(theme.fundoCards, 0.9), borderColor: theme.contornoGeral, borderRadius: '8px' }} itemStyle={{ color: theme.textoPrincipal, fontWeight: 'bold' }} labelStyle={{ color: theme.textoSecundario }} formatter={(val) => formatCurrency(val)} labelFormatter={(label, entries) => (entries && entries.length) ? entries[0].payload.date : label} />
                <Bar dataKey="pnl" radius={[2, 2, 2, 2]}>
                  {filteredTradeValuesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.pnl >= 0 ? theme.textoPositivo : theme.textoNegativo} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tabela de Dados (Mobile Bottom) */}
        {isMobile && evaluationTableBlock}

      </div>
    </div>
  );
}
