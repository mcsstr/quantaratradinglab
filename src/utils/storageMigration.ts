/**
 * storageMigration.ts
 * Utilities to migrate trade data between LocalStorage (Basic plan) and Supabase (Premium plan).
 * 
 * migrateLocalToCloud  — Called when a user upgrades from Basic to Premium.
 * migrateCloudToLocal  — Called when a user downgrades from Premium to Basic.
 */
import { supabase } from './supabase';

export interface TradeRecord {
  id?: string;
  user_id?: string;
  account?: string;
  symbol?: string;
  qty?: number;
  side?: string;
  buy_price?: number;
  sell_price?: number;
  pnl?: number;
  buy_time?: string;
  sell_time?: string;
  duration?: string;
  notes?: string;
  [key: string]: any;
}

/**
 * Reads all accounts/trades stored in LocalStorage under the key `quantara_accounts`.
 * Shape: { accounts: { id, name, trades: TradeRecord[] }[] }
 */
function readLocalTrades(userId: string): { account: string; trades: TradeRecord[] }[] {
  try {
    const raw = localStorage.getItem(`quantara_accounts_${userId}`);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    // Support both array and object shapes used in the app
    if (Array.isArray(parsed)) {
      return parsed.map((acc: any) => ({
        account: acc.id || acc.name || 'default',
        trades: (acc.trades || [])
      }));
    }
    return [];
  } catch {
    return [];
  }
}

/**
 * UPGRADE: Local → Cloud
 * Pushes all local trades to Supabase `trades` table, then removes them from localStorage.
 */
export async function migrateLocalToCloud(userId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const accountGroups = readLocalTrades(userId);
  let totalMigrated = 0;

  for (const group of accountGroups) {
    for (const trade of group.trades) {
      const { error } = await supabase.from('trades').upsert({
        ...trade,
        user_id: userId,
        account: group.account,
        id: trade.id || undefined, // let Supabase generate if missing
      }, { onConflict: 'id' });

      if (!error) totalMigrated++;
      else console.warn('Failed to migrate trade:', trade.id, error.message);
    }
  }

  // Clear local storage after successful migration
  if (totalMigrated > 0) {
    localStorage.removeItem(`quantara_accounts_${userId}`);
    // Also clear legacy key if it exists
    localStorage.removeItem('quantara_accounts');
  }

  return { migrated: totalMigrated };
}

/**
 * DOWNGRADE: Cloud → Local
 * Pulls all Supabase trades to localStorage, then deletes them from Supabase.
 */
export async function migrateCloudToLocal(userId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data: cloudTrades, error } = await supabase
    .from('trades')
    .select('*')
    .eq('user_id', userId);

  if (error) throw error;
  if (!cloudTrades || cloudTrades.length === 0) return { migrated: 0 };

  // Group by account
  const accountMap: Record<string, TradeRecord[]> = {};
  for (const trade of cloudTrades) {
    const acc = trade.account || 'default';
    if (!accountMap[acc]) accountMap[acc] = [];
    accountMap[acc].push(trade);
  }

  // Build local storage structure
  const localStructure = Object.entries(accountMap).map(([name, trades]) => ({
    id: name,
    name,
    trades,
  }));

  localStorage.setItem(`quantara_accounts_${userId}`, JSON.stringify(localStructure));

  // Delete from Supabase (user owns the data — they chose local)
  const { error: deleteError } = await supabase
    .from('trades')
    .delete()
    .eq('user_id', userId);

  if (deleteError) {
    console.warn('Data saved locally but could not delete cloud copy:', deleteError.message);
  }

  return { migrated: cloudTrades.length };
}
