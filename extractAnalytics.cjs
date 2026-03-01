const fs = require('fs');
const path = require('path');

const srcPath = path.join(__dirname, 'src', 'pages', 'Dashboard.tsx');
let code = fs.readFileSync(srcPath, 'utf8');

const startMarker = "{activeTab === 'analytics' && (() => {";
const endMarker = "        })()}";

const startIndex = code.indexOf(startMarker);
const endIndex = code.indexOf(endMarker, startIndex) + endMarker.length;

if (startIndex === -1 || endIndex === -1) {
    console.log("Could not find blocks");
    process.exit(1);
}

const componentCode = code.substring(startIndex + startMarker.length, code.indexOf(endMarker, startIndex));

const viewCode = `import React from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell, LabelList, PieChart, Pie
} from 'recharts';
import {
  Activity, TrendingUp, DollarSign, Percent, Layers, CalendarDays, Target, AlertTriangle, ShieldAlert, Sun, Banknote, Check,
  BarChart2, ChevronLeft, ChevronRight, ChevronDown, Search, ArrowDown, ArrowUp, ListIcon
} from '../../components/Icons';
import { hexToRgba } from '../../utils/constants';

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
${componentCode}
}
`;

fs.writeFileSync(path.join(__dirname, 'src', 'pages', 'DashboardViews', 'AnalyticsView.tsx'), viewCode, 'utf8');

const usage = `        {activeTab === 'analytics' && (
          <AnalyticsView
            theme={theme}
            settings={settings}
            getGlassStyle={getGlassStyle}
            getFullDateString={getFullDateString}
            activeAccountDays={activeAccountDays}
            exchangeRate={exchangeRate}
            metricRows={metricRows}
            isEvalTableExpanded={isEvalTableExpanded}
            setIsEvalTableExpanded={setIsEvalTableExpanded}
            isMobile={isMobile}
            monthlyPnlData={monthlyPnlData}
            userLocale={userLocale}
            formatCurrency={formatCurrency}
            symbolData={symbolData}
            winLossData={winLossData}
            metrics={metrics}
            formatPercent={formatPercent}
            directionData={directionData}
            timeGrouping={timeGrouping}
            setTimeGrouping={setTimeGrouping}
            timeDistributionData={timeDistributionData}
            tradeValuesFilter={tradeValuesFilter}
            setTradeValuesFilter={setTradeValuesFilter}
            availableTradePeriods={availableTradePeriods}
            filteredTradeValuesData={filteredTradeValuesData}
          />
        )}`;

const replacedCode = code.substring(0, startIndex) + usage + code.substring(endIndex);

// inject import at top
const lines = replacedCode.split('\\n');
const navigateImportIndex = lines.findIndex(l => l.includes("import DashboardHomeView from './DashboardViews/DashboardHomeView';"));
lines.splice(navigateImportIndex + 1, 0, "import AnalyticsView from './DashboardViews/AnalyticsView';");

fs.writeFileSync(srcPath, lines.join('\\n'), 'utf8');
console.log("Extraction complete.");
