const fs = require('fs');
const data = JSON.parse(fs.readFileSync('frontend_dump.json', 'utf8'));

// The dump contains ALL setup_targets. 
// We need to find the setup ID for 'ema 80 config. 6'.
// Wait, we don't know the exact setup ID, but we can look for group_names or just print all unique group_names and setup_ids
// Or we can find dates that are in Jan-Mar 2026 or 2025?

const janToMar = data.filter(t => {
  if (!t.date) return false;
  const match = t.date.match(/-0[123]-/);
  return !!match;
});

console.log(`Total targets: ${data.length}`);
console.log(`Total Jan-Mar targets: ${janToMar.length}`);

// Group by setup_id to see which setups have Jan-Mar targets
const bySetup = {};
for (const t of janToMar) {
  if (!bySetup[t.setup_id]) bySetup[t.setup_id] = 0;
  bySetup[t.setup_id]++;
}
console.log('Jan-Mar targets by setup_id:', bySetup);

// Let's also group ALL targets by setup_id to see if ema 80 config 6 exists
const allBySetup = {};
for (const t of data) {
  if (!allBySetup[t.setup_id]) allBySetup[t.setup_id] = 0;
  allBySetup[t.setup_id]++;
}
console.log('ALL targets by setup_id:', allBySetup);

// Let's print out the first few Jan-Mar targets for the largest setup_id
const largestSetupId = Object.keys(bySetup).sort((a,b) => bySetup[b] - bySetup[a])[0];
if (largestSetupId) {
  const sample = janToMar.filter(t => t.setup_id === largestSetupId).slice(0, 5);
  console.log('Sample from largest setup:', sample.map(t => ({ id: t.id, date: t.date, account_id: t.account_id, group: t.group_name })));
}

