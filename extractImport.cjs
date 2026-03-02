const fs = require('fs');
const path = require('path');

const srcPath = path.join(__dirname, 'src', 'pages', 'Dashboard.tsx');
let code = fs.readFileSync(srcPath, 'utf8');

const startMarker = "{activeTab === 'import' && (";
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
  Import, Edit2, Download, FileText, ListIcon
} from '../../components/Icons';
import { hexToRgba } from '../../utils/constants';

export default function ImportView({
  theme,
  getGlassStyle,
  settings,
  manualTrade,
  setManualTrade,
  handleManualTradeAdd,
  handleCSVUpload,
  importText,
  setImportText,
  handleImport
}) {
  return (
${componentCode}
  );
}
`;

fs.writeFileSync(path.join(__dirname, 'src', 'pages', 'DashboardViews', 'ImportView.tsx'), viewCode, 'utf8');

const usage = `        {activeTab === 'import' && (
          <ImportView
            theme={theme}
            getGlassStyle={getGlassStyle}
            settings={settings}
            manualTrade={manualTrade}
            setManualTrade={setManualTrade}
            handleManualTradeAdd={handleManualTradeAdd}
            handleCSVUpload={handleCSVUpload}
            importText={importText}
            setImportText={setImportText}
            handleImport={handleImport}
          />
        )}`;

const replacedCode = code.substring(0, startIndex) + usage + code.substring(endIndex);

// inject import at top
const lines = replacedCode.split('\\n');
const navigateImportIndex = lines.findIndex(l => l.includes("import HolidaysView from './DashboardViews/HolidaysView';"));
lines.splice(navigateImportIndex + 1, 0, "import ImportView from './DashboardViews/ImportView';");

fs.writeFileSync(srcPath, lines.join('\\n'), 'utf8');
console.log("Extraction ImportView complete.");
