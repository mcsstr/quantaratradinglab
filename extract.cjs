const fs = require('fs');
const path = require('path');

const srcPath = path.join(__dirname, 'src', 'pages', 'Dashboard.tsx');
let code = fs.readFileSync(srcPath, 'utf8');

const startMarker = "{activeTab === 'dashboard' && (() => {";
const endMarker = "        })()}";

const startIndex = code.indexOf(startMarker);
const endIndex = code.indexOf(endMarker, startIndex) + endMarker.length;

if (startIndex === -1 || endIndex === -1) {
    console.log("Could not find blocks");
    process.exit(1);
}

const componentCode = code.substring(startIndex + startMarker.length, code.indexOf(endMarker, startIndex));

const homeViewCode = `import React from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell, LabelList
} from 'recharts';
import {
  Activity, TrendingUp, DollarSign, Percent, Layers, CalendarDays, Target, AlertTriangle, ShieldAlert, Sun, Banknote, Check,
  BarChart2, ChevronLeft, ChevronRight, Search, ArrowDown, ArrowUp, ListIcon
} from '../../components/Icons';
import { hexToRgba } from '../../utils/constants';

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
  isMobile
}) {
${componentCode}
}
`;

fs.writeFileSync(path.join(__dirname, 'src', 'pages', 'DashboardViews', 'DashboardHomeView.tsx'), homeViewCode, 'utf8');

const usage = `        {activeTab === 'dashboard' && (
          <DashboardHomeView
            metrics={metrics}
            timeMetrics={timeMetrics}
            settings={settings}
            theme={theme}
            formatCurrency={formatCurrency}
            formatCurrencyDash={formatCurrencyDash}
            formatPaymentDash={formatPaymentDash}
            formatPercent={formatPercent}
            formatPercentDecimals={formatPercentDecimals}
            exchangeRate={exchangeRate}
            getGlassStyle={getGlassStyle}
            isTrendUp={isTrendUp}
            chartData={chartData}
            userLocale={userLocale}
            equityFilter={equityFilter}
            setEquityFilter={setEquityFilter}
            selectedWeekDate={selectedWeekDate}
            setSelectedWeekDate={setSelectedWeekDate}
            getStartOfWeek={getStartOfWeek}
            performanceWeeklyData={performanceWeeklyData}
            calendarData={calendarData}
            currentDate={currentDate}
            setCurrentDate={setCurrentDate}
            IconTooltip={IconTooltip}
            renderHolidaysTooltip={renderHolidaysTooltip}
            renderNewsTooltip={renderNewsTooltip}
            setDayTradesModalData={setDayTradesModalData}
            miniHistorySort={miniHistorySort}
            setMiniHistorySort={setMiniHistorySort}
            miniSortedTrades={miniSortedTrades}
            formatDate={formatDate}
            isMobile={isMobile}
          />
        )}`;

const replacedCode = code.substring(0, startIndex) + usage + code.substring(endIndex);

// inject import at top
const lines = replacedCode.split('\\n');
const navigateImportIndex = lines.findIndex(l => l.includes('import { useNavigate }'));
lines.splice(navigateImportIndex + 1, 0, "import DashboardHomeView from './DashboardViews/DashboardHomeView';");

fs.writeFileSync(srcPath, lines.join('\\n'), 'utf8');
console.log("Extraction complete.");
