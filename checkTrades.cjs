const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://jjttzlyxiumjnilqufpi.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpqdHR6bHl4aXVtam5pbHF1ZnBpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIzNDI0MDMsImV4cCI6MjA4NzkxODQwM30.utXAR6MBgA0qOe1xOdqbH9fDLLwcBKUAdCrszSYiHIs';
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const { data: trades, error } = await supabase.from('trades').select('*');
  if (error) {
    console.error('Error fetching trades:', error);
    return;
  }
  
  console.log(`Fetched ${trades.length} trades.`);
  const setupId = '3f976156-7ff7-43ee-bab7-876cc6b38bd8';
  const config6Trades = trades.filter(t => t.setup_id === setupId);
  console.log(`Found ${config6Trades.length} trades for config 6 in the TRADES table.`);
  
  if (config6Trades.length > 0) {
    const dates = config6Trades.map(t => t.date).sort();
    console.log(`Dates range for config 6 trades: ${dates[0]} to ${dates[dates.length-1]}`);
  }
}

main();
