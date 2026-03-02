const fs = require('fs');
const path = require('path');

const srcPath = path.join(__dirname, 'src', 'pages', 'Dashboard.tsx');
let code = fs.readFileSync(srcPath, 'utf8');

const startMarker = "{activeTab === 'settings' && (";
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
  Settings, Palette, Folder, Download, LayoutDashboard, ListIcon
} from '../../components/Icons';
import { hexToRgba } from '../../utils/constants';

export default function SettingsView({
  theme,
  getGlassStyle,
  settings,
  activeSettingsTab,
  handleSaveSettings,
  setActiveSettingsTab,
  SearchableSelect,
  COUNTRIES_LIST,
  setSettings,
  CURRENCIES_LIST,
  TIMEZONES_LIST,
  handleImageUpload,
  fileInputRef,
  setTheme,
  DEFAULT_THEME,
  DEFAULT_SETTINGS,
  handleExportJSON,
  handleImportJSON,
  handleExportSite,
  handleExportAllTradesCSV,
  THEME_GROUPS,
  isMobile
}) {
  return (
${componentCode}
  );
}
`;

fs.writeFileSync(path.join(__dirname, 'src', 'pages', 'DashboardViews', 'SettingsView.tsx'), viewCode, 'utf8');

const usage = `        {activeTab === 'settings' && (
          <SettingsView
            theme={theme}
            getGlassStyle={getGlassStyle}
            settings={settings}
            activeSettingsTab={activeSettingsTab}
            handleSaveSettings={handleSaveSettings}
            setActiveSettingsTab={setActiveSettingsTab}
            SearchableSelect={SearchableSelect}
            COUNTRIES_LIST={COUNTRIES_LIST}
            setSettings={setSettings}
            CURRENCIES_LIST={CURRENCIES_LIST}
            TIMEZONES_LIST={TIMEZONES_LIST}
            handleImageUpload={handleImageUpload}
            fileInputRef={fileInputRef}
            setTheme={setTheme}
            DEFAULT_THEME={DEFAULT_THEME}
            DEFAULT_SETTINGS={DEFAULT_SETTINGS}
            handleExportJSON={handleExportJSON}
            handleImportJSON={handleImportJSON}
            handleExportSite={handleExportSite}
            handleExportAllTradesCSV={handleExportAllTradesCSV}
            THEME_GROUPS={THEME_GROUPS}
            isMobile={isMobile}
          />
        )}`;

const replacedCode = code.substring(0, startIndex) + usage + code.substring(endIndex);

// inject import at top
const lines = replacedCode.split('\\n');
const navigateImportIndex = lines.findIndex(l => l.includes("import ImportView from './DashboardViews/ImportView';"));
lines.splice(navigateImportIndex + 1, 0, "import SettingsView from './DashboardViews/SettingsView';");

fs.writeFileSync(srcPath, lines.join('\\n'), 'utf8');
console.log("Extraction SettingsView complete.");
