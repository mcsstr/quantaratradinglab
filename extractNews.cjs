const fs = require('fs');
const path = require('path');

const srcPath = path.join(__dirname, 'src', 'pages', 'Dashboard.tsx');
let code = fs.readFileSync(srcPath, 'utf8');

const startMarker = "{activeTab === 'news' && (";
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
  Newspaper, Edit2, ListIcon, Folder, Trash2
} from '../../components/Icons';
import { hexToRgba } from '../../utils/constants';
import { Plus } from 'lucide-react';

export default function NewsView({
  theme,
  getGlassStyle,
  settings,
  isMobile,
  newNewsItem,
  setNewNewsItem,
  handleAddNews,
  newsImportImpact,
  setNewsImportImpact,
  newsImportText,
  setNewsImportText,
  handleImportNews,
  newsFilter,
  setNewsFilter,
  filteredNewsList,
  formatDate,
  getImpactColor,
  setEditNewsData,
  setIsNewsModalOpen,
  setNews,
  news
}) {
  return (
${componentCode}
  );
}
`;

fs.writeFileSync(path.join(__dirname, 'src', 'pages', 'DashboardViews', 'NewsView.tsx'), viewCode, 'utf8');

const usage = `        {activeTab === 'news' && (
          <NewsView
            theme={theme}
            getGlassStyle={getGlassStyle}
            settings={settings}
            isMobile={isMobile}
            newNewsItem={newNewsItem}
            setNewNewsItem={setNewNewsItem}
            handleAddNews={handleAddNews}
            newsImportImpact={newsImportImpact}
            setNewsImportImpact={setNewsImportImpact}
            newsImportText={newsImportText}
            setNewsImportText={setNewsImportText}
            handleImportNews={handleImportNews}
            newsFilter={newsFilter}
            setNewsFilter={setNewsFilter}
            filteredNewsList={filteredNewsList}
            formatDate={formatDate}
            getImpactColor={getImpactColor}
            setEditNewsData={setEditNewsData}
            setIsNewsModalOpen={setIsNewsModalOpen}
            setNews={setNews}
            news={news}
          />
        )}`;

const replacedCode = code.substring(0, startIndex) + usage + code.substring(endIndex);

// inject import at top
const lines = replacedCode.split('\\n');
const navigateImportIndex = lines.findIndex(l => l.includes("import TradesView from './DashboardViews/TradesView';"));
lines.splice(navigateImportIndex + 1, 0, "import NewsView from './DashboardViews/NewsView';");

fs.writeFileSync(srcPath, lines.join('\\n'), 'utf8');
console.log("Extraction NewsView complete.");
