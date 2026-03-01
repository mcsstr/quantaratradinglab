const fs = require('fs');
const path = require('path');

const srcPath = path.join(__dirname, 'src', 'pages', 'Dashboard.tsx');
let code = fs.readFileSync(srcPath, 'utf8');

const startMarker = "{activeTab === 'holidays' && (";
const endMarker = "        )}";

const startIndex = code.indexOf(startMarker);
let endIndex = code.indexOf(endMarker, startIndex);
if (endIndex !== -1) endIndex += endMarker.length;

if (startIndex === -1 || endIndex === -1) {
    console.log("Could not find blocks");
    process.exit(1);
}

const componentCode = code.substring(startIndex + startMarker.length, code.indexOf(endMarker, startIndex));

const viewCode = `import React from 'react';
import {
  CalendarDays, Edit2, Check, X, Trash2
} from '../../components/Icons';
import { hexToRgba } from '../../utils/constants';
import { Plus } from 'lucide-react';

export default function HolidaysView({
  theme,
  getGlassStyle,
  settings,
  holidaySortOrder,
  setHolidaySortOrder,
  newHoliday,
  setNewHoliday,
  addHoliday,
  holidays,
  editingHoliday,
  setEditingHoliday,
  editHolidayData,
  setEditHolidayData,
  formatDate,
  setHolidays,
  isMobile
}) {
  return (
${componentCode}
  );
}
`;

fs.writeFileSync(path.join(__dirname, 'src', 'pages', 'DashboardViews', 'HolidaysView.tsx'), viewCode, 'utf8');

const usage = `        {activeTab === 'holidays' && (
          <HolidaysView
            theme={theme}
            getGlassStyle={getGlassStyle}
            settings={settings}
            holidaySortOrder={holidaySortOrder}
            setHolidaySortOrder={setHolidaySortOrder}
            newHoliday={newHoliday}
            setNewHoliday={setNewHoliday}
            addHoliday={addHoliday}
            holidays={holidays}
            editingHoliday={editingHoliday}
            setEditingHoliday={setEditingHoliday}
            editHolidayData={editHolidayData}
            setEditHolidayData={setEditHolidayData}
            formatDate={formatDate}
            setHolidays={setHolidays}
            isMobile={isMobile}
          />
        )}`;

const replacedCode = code.substring(0, startIndex) + usage + code.substring(endIndex);

// inject import at top
const lines = replacedCode.split('\\n');
const navigateImportIndex = lines.findIndex(l => l.includes("import NewsView from './DashboardViews/NewsView';"));
lines.splice(navigateImportIndex + 1, 0, "import HolidaysView from './DashboardViews/HolidaysView';");

fs.writeFileSync(srcPath, lines.join('\\n'), 'utf8');
console.log("Extraction HolidaysView complete.");
