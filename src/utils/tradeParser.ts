/**
 * Universal Trade Parser Module
 * Extracted from ParserReference.js — provides column alias dictionaries,
 * Supabase mapping, and numeric cleaning utilities.
 */

// Column aliases: maps a canonical field name to known header variations across brokers
export const columnAliases: Record<string, string[]> = {
    symbol: ['symbol', 'Symbol', 'Ativo', 'Ticker', 'contract', 'instrument', 'símbolo'],
    qty: ['qty', 'Qty', 'Quantity', 'Quantidade', 'contracts', 'size', 'tamanho', 'volume'],
    buyPrice: ['buyPrice', 'Buy Price', 'Preço Compra', 'entry price', 'open price', 'avg buy price', 'preço de abertura'],
    buyTime: ['boughtTimestamp', 'Buy Time', 'Data Compra', 'buytime', 'entry time', 'open time', 'entry datetime', 'horário de abertura', 'data de abertura'],
    duration: ['duration', 'Duration', 'Tempo', 'duração'],
    sellTime: ['soldTimestamp', 'Sell Time', 'Data Venda', 'selltime', 'exit time', 'close time', 'exit datetime', 'horário de fechamento', 'data de fechamento'],
    sellPrice: ['sellPrice', 'Sell Price', 'Preço Venda', 'exit price', 'close price', 'avg sell price', 'preço de fechamento'],
    pnl: ['pnl', 'P&L', 'Net PnL', 'Lucro/Prejuízo', 'p/l', 'profit', 'profit/loss', 'realized pnl', 'lucro líquido', 'resultado'],
    direction: ['direction', 'side', 'direção', 'lado']
};

// Maps canonical field names to Supabase column names
export const supabaseMapping: Record<string, string> = {
    symbol: 'symbol',
    qty: 'qty',
    buyPrice: 'buy_price',
    buyTime: 'buy_time',
    duration: 'duration',
    sellTime: 'sell_time',
    sellPrice: 'sell_price',
    pnl: 'pnl'
};

/**
 * Cleans a numeric/financial string value.
 * Handles: $100.00, $(78.50), ($78.50), (78.50), -78.50, "1,234.56"
 */
export const cleanNumericValue = (str: string): number => {
    if (!str) return 0;
    let s = String(str).replace(/\s/g, '');
    let isNeg = false;

    // Accounting negative: $(78.50) or ($78.50) or (78.50)
    if (s.includes('(') && s.includes(')')) {
        isNeg = true;
        s = s.replace(/[()]/g, '');
    }

    // Remove currency symbols and commas
    s = s.replace(/[$,]/g, '');

    // Leading minus
    if (s.startsWith('-')) {
        isNeg = true;
        s = s.substring(1);
    }

    const num = parseFloat(s) || 0;
    return isNeg ? -num : num;
};

/**
 * Bulletproof date parser — manually deconstructs date strings with Regex.
 * Handles MM/DD/YYYY, DD/MM/YYYY, YYYY-MM-DD, and optional time HH:mm or HH:mm:ss.
 * Returns an ISO string (YYYY-MM-DDTHH:mm:ss.000Z) safe for Supabase TIMESTAMPTZ,
 * or null if the date cannot be parsed.
 *
 * Key rules:
 * - If P1 > 12 → it's DD/MM (BR/EU format)
 * - If P2 > 12 → it's MM/DD (US/Tradovate format)
 * - If both ≤ 12 → defaults to MM/DD (Tradovate convention)
 * - Injects 0 for missing seconds so timestamps are never truncated
 */
export const parseSmartDate = (dateStr: string | null | undefined): string | null => {
    if (!dateStr) return null;

    const safeDateStr = dateStr.trim();

    // --- Try ISO format first: YYYY-MM-DD[T]HH:mm[:ss] ---
    const isoRegex = /^(\d{4})-(\d{1,2})-(\d{1,2})(?:[\sT]+(\d{1,2}):(\d{2})(?::(\d{2}))?(?:\.\d+)?Z?)?$/;
    const isoMatch = safeDateStr.match(isoRegex);
    if (isoMatch) {
        const year = parseInt(isoMatch[1], 10);
        const month = parseInt(isoMatch[2], 10);
        const day = parseInt(isoMatch[3], 10);
        const hour = isoMatch[4] ? parseInt(isoMatch[4], 10) : 0;
        const minute = isoMatch[5] ? parseInt(isoMatch[5], 10) : 0;
        const second = isoMatch[6] ? parseInt(isoMatch[6], 10) : 0;

        const d = new Date(year, month - 1, day, hour, minute, second);
        if (!isNaN(d.getTime())) return d.toISOString();
    }

    // --- Try slash/dash date: (P1)/(P2)/(YYYY) [HH:mm[:ss]] ---
    const regex = /^(\d{1,2})[/-](\d{1,2})[/-](\d{4})(?:[\sT]+(\d{1,2}):(\d{2})(?::(\d{2}))?(?:\.\d+)?Z?)?$/;
    const match = safeDateStr.match(regex);

    if (match) {
        const p1 = parseInt(match[1], 10);
        const p2 = parseInt(match[2], 10);
        const year = parseInt(match[3], 10);
        const hour = match[4] ? parseInt(match[4], 10) : 0;
        const minute = match[5] ? parseInt(match[5], 10) : 0;
        const second = match[6] ? parseInt(match[6], 10) : 0;

        let month: number, day: number;

        if (p1 > 12) {
            // Definitely DD/MM (BR/EU)
            day = p1;
            month = p2;
        } else if (p2 > 12) {
            // Definitely MM/DD (US)
            month = p1;
            day = p2;
        } else {
            // Ambiguous — default MM/DD (Tradovate convention)
            month = p1;
            day = p2;
        }

        const parsedDate = new Date(year, month - 1, day, hour, minute, second);
        if (!isNaN(parsedDate.getTime())) return parsedDate.toISOString();
    }

    // --- Fallback for written dates like "Jan 02, 2026 13:45:10" ---
    const fallbackDate = new Date(safeDateStr);
    if (!isNaN(fallbackDate.getTime())) return fallbackDate.toISOString();

    return null;
};
