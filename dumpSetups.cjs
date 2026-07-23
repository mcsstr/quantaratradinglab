const fs = require('fs');

async function dumpSetups() {
  const data = JSON.parse(fs.readFileSync('frontend_dump.json', 'utf8'));
  // I will write a quick script that fetches setups via fetch if I could.
  // But wait, the frontend dump ONLY contains setup_targets!
  
}
