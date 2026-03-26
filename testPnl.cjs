const fs = require('fs');

const cleanNumericValue = (val) => {
  if (!val) return 0;
  const clean = val.replace(/[^\d.-]/g, '');
  return Number(clean) || 0;
};

const parseDateOnly = (val) => {
  if (!val) return '';
  const dateObj = new Date(val);
  if (!isNaN(dateObj.getTime())) {
    return `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
  }
  return '';
};

// SIMULATE PASTE MAPPING
const pasteMap = [
  { name: 'Symbol', mapTo: 'symbol' },
  { name: 'Qty', mapTo: 'qty' },
  { name: 'Buy Price', mapTo: 'buyPrice' },
  { name: 'Buy Time', mapTo: 'buyTime' },
  { name: 'Duration', mapTo: 'duration' },
  { name: 'Sell Time', mapTo: 'sellTime' },
  { name: 'Sell Price', mapTo: 'sellPrice' },
  { name: 'P&L', mapTo: 'pnl' }
];

const text = fs.readFileSync('test_trades.txt', 'utf-8');
const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);

const activeTrades = [];

for (let i = 0; i < lines.length; i++) {
  const rowValues = lines[i].split('\t').map(v => v.replace(/(^"|"$)/g, '').trim());
  const tradeData = {};

  pasteMap.forEach((rule, idx) => {
    const val = rowValues[idx] ?? '';
    const mapTo = rule.mapTo;
    
    if (mapTo === 'qty' || mapTo === 'buyPrice' || mapTo === 'sellPrice') {
      tradeData[mapTo] = cleanNumericValue(val);
    } else if (mapTo === 'pnl') {
      let pnlValue = cleanNumericValue(val);
      if ((val.includes('-') || val.includes('(')) && pnlValue > 0) pnlValue = -pnlValue;
      tradeData.pnlValue = pnlValue;
    } else if (mapTo === 'buyTime' || mapTo === 'sellTime') {
      const parsed = new Date(val);
      tradeData[mapTo] = String(parsed.getTime());
    } else {
      tradeData[mapTo] = val;
    }
  });

  let entryTimestamp = Number(tradeData.buyTime || tradeData.sellTime || 0);
  let ed = new Date(entryTimestamp);
  let dateStr = `${ed.getFullYear()}-${String(ed.getMonth() + 1).padStart(2, '0')}-${String(ed.getDate()).padStart(2, '0')}`;
  
  if (!tradeData.direction && tradeData.buyPrice && tradeData.sellPrice) {
    tradeData.direction = (Number(tradeData.buyPrice) < Number(tradeData.sellPrice)) ? 'Long' : 'Short';
  }

  activeTrades.push({
    qty: tradeData.qty,
    pnl: tradeData.pnlValue,
    date: dateStr,
    direction: tradeData.direction,
    commission: null
  });
}

console.log(`Parsed ${activeTrades.length} trades.`);

let grossPnl = 0, totalQty = 0, totalGrossProfit = 0, totalGrossLoss = 0;
let winningTrades = 0, losingTrades = 0, maxTradeWin = 0, maxTradeLoss = 0;
let longTrades = 0, longWins = 0, shortTrades = 0, shortWins = 0;
let peakBalance = 50000, maxDrawdown = 0, runningBalance = 50000;
let totalFees = 0;

const sortedChronological = [...activeTrades].sort((a, b) => new Date(a.date + 'T00:00:00').getTime() - new Date(b.date + 'T00:00:00').getTime());

const feeAmount = 2.04;

sortedChronological.forEach(trade => {
  const rawPnl = Number(trade.pnl || 0);
  grossPnl += rawPnl; totalQty += trade.qty;
  
  const fee = trade.commission !== null ? Math.abs(Number(trade.commission)) : trade.qty * Math.abs(feeAmount);
  totalFees += fee;
  
  const netTradePnl = rawPnl - fee;

  if (rawPnl >= 0) {
    winningTrades++; totalGrossProfit += rawPnl;
    if (rawPnl > maxTradeWin) maxTradeWin = rawPnl;
  } else {
    losingTrades++; totalGrossLoss += Math.abs(rawPnl);
    if (Math.abs(rawPnl) > maxTradeLoss) maxTradeLoss = Math.abs(rawPnl);
  }

  if (trade.direction === 'Short') {
    shortTrades++;
    if (rawPnl >= 0) shortWins++;
  } else {
    longTrades++;
    if (rawPnl >= 0) longWins++;
  }

  runningBalance += netTradePnl;
  if (runningBalance > peakBalance) peakBalance = runningBalance;
  const currentDrawdown = peakBalance - runningBalance;
  if (currentDrawdown > maxDrawdown) maxDrawdown = currentDrawdown;
});

const netPnl = runningBalance - 50000;
const currentBalance = runningBalance;

console.log("====== METRICS RESULT ======");
console.log({
  grossPnl,
  totalFees,
  netPnl,
  currentBalance,
  totalTrades: activeTrades.length,
  winningTrades,
  losingTrades,
  totalGrossProfit,
  totalGrossLoss,
  maxDrawdown,
  peakBalance
});
