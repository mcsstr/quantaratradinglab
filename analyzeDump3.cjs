const fs = require('fs');
const data = JSON.parse(fs.readFileSync('frontend_dump.json', 'utf8'));

// Check for disabled trades
const disabledTrades = data.filter(t => t.disabled === true);
console.log(`Total disabled trades: ${disabledTrades.length}`);

// Let's also check if there are any trades in Jan-Mar for Setup 3f976156-7ff7-43ee-bab7-876cc6b38bd8
const setupId = '3f976156-7ff7-43ee-bab7-876cc6b38bd8';
const config6Trades = data.filter(t => t.setup_id === setupId);
console.log(`Total trades for Config 6 / 4: ${config6Trades.length}`);
