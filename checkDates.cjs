const fs = require('fs');
const data = JSON.parse(fs.readFileSync('frontend_dump.json', 'utf8'));

const setupId = '3f976156-7ff7-43ee-bab7-876cc6b38bd8';
const config6Trades = data.filter(t => t.setup_id === setupId);

const datesToCheck = ['2026-03-16', '2026-03-17', '2026-03-18', '2026-03-19'];
datesToCheck.forEach(d => {
  const matches = config6Trades.filter(t => t.date && t.date.startsWith(d));
  console.log(`${d}: ${matches.length} trades`);
  if (matches.length > 0) console.log(matches.map(m => `  Takes: ${m.takes}, Stops: ${m.stops}, PnL: ${m.pnl}`));
});
