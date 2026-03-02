import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const htmlPath = path.join(__dirname, 'aplicativo.html');
const tsxPath = path.join(__dirname, 'src', 'pages', 'Dashboard.tsx');
const cssPath = path.join(__dirname, 'src', 'pages', 'Dashboard.css');

const html = fs.readFileSync(htmlPath, 'utf8');

const scriptStart = html.indexOf('<script type="text/babel">') + '<script type="text/babel">'.length;
const scriptEnd = html.indexOf('</script>', scriptStart);

let reactCode = '';
if (scriptStart > -1 && scriptEnd > scriptStart) {
    reactCode = html.substring(scriptStart, scriptEnd);
}

const styleStart = html.indexOf('<style id="main-custom-style">') + '<style id="main-custom-style">'.length;
const styleEnd = html.indexOf('</style>', styleStart);

let cssCode = '';
if (styleStart > -1 && styleEnd > styleStart) {
    cssCode = html.substring(styleStart, styleEnd);
}

// Remove Recharts and React destructuring
reactCode = reactCode.replace(/const { useState.*? } = React;/g, '');
reactCode = reactCode.replace(/const { LineChart.*? } = window\.Recharts;/g, '');

// The render logic is at the end:
// const root = ReactDOM.createRoot(document.getElementById('root'));
// root.render(<App />);
reactCode = reactCode.replace(/const root = ReactDOM\.createRoot[\s\S]*?;/g, '');
reactCode = reactCode.replace(/root\.render\([\s\S]*?\);/g, '');
reactCode = reactCode.replace(/ReactDOM\.render\([\s\S]*?\);/g, '');

// Rename App to Dashboard
reactCode = reactCode.replace(/function App\(\) \{/, 'export default function Dashboard() {');

// Clean up standard imports
const imports = `// @ts-nocheck
import React, { useState, useEffect, useMemo, useRef, useTransition } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell, LabelList, PieChart, Pie, AreaChart, Area } from 'recharts';
import './Dashboard.css';

`;

fs.writeFileSync(tsxPath, imports + reactCode.trim(), 'utf8');
fs.writeFileSync(cssPath, cssCode.trim(), 'utf8');

console.log('Successfully extracted and ported the app!');
