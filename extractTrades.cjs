const fs = require('fs');
const path = require('path');

const srcPath = path.join(__dirname, 'src', 'pages', 'Dashboard.tsx');
let code = fs.readFileSync(srcPath, 'utf8');

const startMarker = "{activeTab === 'trades' && (";
const endMarker = "        )}";

const startIndex = code.indexOf(startMarker);
let endIndex = code.indexOf(endMarker, startIndex);
if (endIndex !== -1) {
  // Try to find the closing parenthesis after the div
  // The structure is:
  // {activeTab === 'trades' && (
  //   <div ...>
  //     ...
  //   </div>
  // )}
  // The endMarker we used might match multiple times, let's just find the next one
}
endIndex += endMarker.length;

if (startIndex === -1 || endIndex === -1) {
  console.log("Could not find blocks");
  process.exit(1);
}

const componentCode = code.substring(startIndex + startMarker.length, code.indexOf(endMarker, startIndex));

const viewCode = `import React from 'react';
import {
  ListIcon, Trash2, Search, ArrowDown, ArrowUp, Edit2
} from '../../components/Icons';
import { hexToRgba } from '../../utils/constants';

export default function TradesView({
  theme,
  getGlassStyle,
  settings,
  selectedTrades,
  setSelectedTrades,
  setTrades,
  filteredTrades,
  confirmDeleteAll,
  setConfirmDeleteAll,
  setToastMessage,
  searchTerm,
  setSearchTerm,
  sortOrder,
  setSortOrder,
  filterMonth,
  setFilterMonth,
  filterYear,
  setFilterYear,
  paginatedTrades,
  formatDate,
  userLocale,
  setEditFormData,
  setIsTradeModalOpen,
  historyPage,
  historyItemsPerPage,
  setHistoryPage,
  isMobile,
  formatCurrency
}) {
  return (
${componentCode}
  );
}
`;

fs.writeFileSync(path.join(__dirname, 'src', 'pages', 'DashboardViews', 'TradesView.tsx'), viewCode, 'utf8');

const usage = `        {activeTab === 'trades' && (
          <TradesView
            theme={theme}
            getGlassStyle={getGlassStyle}
            settings={settings}
            selectedTrades={selectedTrades}
            setSelectedTrades={setSelectedTrades}
            setTrades={setTrades}
            filteredTrades={filteredTrades}
            confirmDeleteAll={confirmDeleteAll}
            setConfirmDeleteAll={setConfirmDeleteAll}
            setToastMessage={setToastMessage}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
            filterMonth={filterMonth}
            setFilterMonth={setFilterMonth}
            filterYear={filterYear}
            setFilterYear={setFilterYear}
            paginatedTrades={paginatedTrades}
            formatDate={formatDate}
            userLocale={userLocale}
            setEditFormData={setEditFormData}
            setIsTradeModalOpen={setIsTradeModalOpen}
            historyPage={historyPage}
            historyItemsPerPage={historyItemsPerPage}
            setHistoryPage={setHistoryPage}
            isMobile={isMobile}
            formatCurrency={formatCurrency}
          />
        )}`;

const replacedCode = code.substring(0, startIndex) + usage + code.substring(endIndex);

// inject import at top
const lines = replacedCode.split('\\n');
const navigateImportIndex = lines.findIndex(l => l.includes("import AnalyticsView from './DashboardViews/AnalyticsView';"));
lines.splice(navigateImportIndex + 1, 0, "import TradesView from './DashboardViews/TradesView';");

fs.writeFileSync(srcPath, lines.join('\\n'), 'utf8');
console.log("Extraction TradesView complete.");
