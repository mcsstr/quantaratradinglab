const fs = require('fs');
const data = JSON.parse(fs.readFileSync('frontend_dump.json', 'utf8'));

// Find setups that have trades
const allSetups = [...new Set(data.map(t => t.setup_id))];

for (const sid of allSetups) {
  const targets = data.filter(t => t.setup_id === sid);
  const groups = [...new Set(targets.map(t => t.group_name))];
  console.log(`Setup ID: ${sid}, Groups: ${groups.join(' | ')}`);
  
  // For each group, print the date range and count
  for (const g of groups) {
    const groupTargets = targets.filter(t => t.group_name === g);
    const dates = groupTargets.map(t => t.date).filter(Boolean).sort();
    if (dates.length > 0) {
      console.log(`  Group [${g}]: ${dates.length} trades, from ${dates[0]} to ${dates[dates.length - 1]}`);
    } else {
      console.log(`  Group [${g}]: ${groupTargets.length} trades, NO DATES`);
    }
  }
}
