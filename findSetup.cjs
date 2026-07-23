const fs = require('fs');
const setups = JSON.parse(fs.readFileSync('setups_dump.json', 'utf8'));

const target = setups.find(s => s.title.toLowerCase().includes('config. 6') || s.title.toLowerCase().includes('config 6'));
if (target) {
  console.log('FOUND SETUP:');
  console.log('ID:', target.id);
  console.log('Title:', target.title);
} else {
  console.log('NOT FOUND, available titles:');
  console.log(setups.map(s => s.title));
}
