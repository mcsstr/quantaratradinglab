// FICHEIRO DE REFERÊNCIA PARA A IA: Lógica Híbrida de Leitura de Trades
// ATUALIZAÇÃO DEFINITIVA: Desconstrução manual de datas para evitar perda de segundos 
// e confusões de formato (MM/DD/YYYY vs DD/MM/YYYY) quando o dia é < 12.

export const columnAliases = {
  Symbol: ['symbol', 'Symbol', 'Ativo', 'Ticker'],
  Qty: ['qty', 'Qty', 'Quantity', 'Quantidade'],
  'Buy Price': ['buyPrice', 'Buy Price', 'Preço Compra', 'Entry Price'],
  'Buy Time': ['boughtTimestamp', 'Buy Time', 'Data Compra'],
  Duration: ['duration', 'Duration', 'Tempo'],
  'Sell Time': ['soldTimestamp', 'Sell Time', 'Data Venda', 'Exit Time'],
  'Sell Price': ['sellPrice', 'Sell Price', 'Preço Venda'],
  'P&L': ['pnl', 'P&L', 'Net PnL', 'Lucro/Prejuízo']
};

export const supabaseMapping = {
  'Symbol': 'symbol',
  'Qty': 'qty',
  'Buy Price': 'buy_price',
  'Buy Time': 'buy_time',
  'Duration': 'duration',
  'Sell Time': 'sell_time',
  'Sell Price': 'sell_price',
  'P&L': 'pnl'
};

// SANITIZADOR INTELIGENTE DE DATAS (À PROVA DE BALAS)
// Recorta cada componente exato da string para garantir que os segundos nunca se percam.
const parseSmartDate = (dateStr) => {
  if (!dateStr) return null;

  let safeDateStr = dateStr.trim();

  // Captura explicitamente (MM/DD/YYYY ou DD/MM/YYYY) + Hora Opcional (suporta 13:45 ou 13:45:10)
  const regex = /^(\d{1,2})[/-](\d{1,2})[/-](\d{4})(?:[\sT]+(\d{1,2}):(\d{2})(?::(\d{2}))?(?:\.\d+)?Z?)?$/;
  const match = safeDateStr.match(regex);

  if (match) {
    let p1 = parseInt(match[1], 10);
    let p2 = parseInt(match[2], 10);
    let year = parseInt(match[3], 10);
    let hour = match[4] ? parseInt(match[4], 10) : 0;
    let minute = match[5] ? parseInt(match[5], 10) : 0;
    // Garante que se não houver segundos no CSV, ele seja 0 (evitando undefined/falhas)
    let second = match[6] ? parseInt(match[6], 10) : 0;

    let month = p1;
    let day = p2;

    // Se P1 > 12, é definitivamente padrão BR/Europeu (DD/MM).
    if (p1 > 12) {
      day = p1;
      month = p2;
    } else if (p2 > 12) {
      // Se P2 > 12, é definitivamente padrão US/Tradovate (MM/DD).
      month = p1;
      day = p2;
    }
    // Se ambos forem <= 12, assumimos MM/DD por padrão (pois Tradovate usa US Format).

    // Criamos a data explicitamente componente por componente (o mês em JS começa no 0, por isso month - 1)
    const parsedDate = new Date(year, month - 1, day, hour, minute, second);

    if (!isNaN(parsedDate.getTime())) {
      return parsedDate.toISOString(); // Retorna no formato YYYY-MM-DDTHH:mm:ss.000Z
    }
  }

  // Fallback de emergência caso a data venha escrita por extenso (ex: "Jan 02, 2026")
  const fallbackDate = new Date(safeDateStr);
  if (!isNaN(fallbackDate.getTime())) return fallbackDate.toISOString();

  return null;
};

export const processCSVLogic = (csvText, activeAccount) => {
  const targetColumns = Object.keys(columnAliases);
  const lines = csvText.split('\n').map(line => line.trim()).filter(line => line);

  if (lines.length < 2) throw new Error("Ficheiro vazio ou inválido.");

  const headers = lines[0].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(h => h.replace(/(^"|"$)/g, '').trim());

  const headerIndexes = {};
  targetColumns.forEach(targetCol => {
    const aliases = columnAliases[targetCol];
    const foundIndex = headers.findIndex(header => aliases.includes(header));
    if (foundIndex !== -1) headerIndexes[targetCol] = foundIndex;
  });

  if (headerIndexes['Symbol'] === undefined) {
    throw new Error("Não foi possível identificar as colunas padrão neste ficheiro.");
  }

  const dbTrades = [];
  for (let i = 1; i < lines.length; i++) {
    const rowValues = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(val => val.replace(/(^"|"$)/g, '').trim());
    const dbTrade = {};

    targetColumns.forEach(col => {
      const index = headerIndexes[col];
      let value = index !== undefined ? rowValues[index] : '';

      if ((col.includes('Price') || col === 'P&L' || col === 'Qty') && value) {
        let cleanValue = value.replace(/[$\s,]/g, '');
        if (cleanValue.includes('(') && cleanValue.includes(')')) {
          cleanValue = '-' + cleanValue.replace(/[()]/g, '');
        }
        value = cleanValue;
      }

      if (col === 'Buy Time' || col === 'Sell Time') {
        value = parseSmartDate(value);
      }


      const dbKey = supabaseMapping[col];
      dbTrade[dbKey] = value;
    });

    dbTrade['account_id'] = activeAccount?.id || 'default_account';

    const qtyLotes = parseFloat(dbTrade['qty']) || 0;
    const feePorContrato = parseFloat(activeAccount?.feePerContract) || 0;

    dbTrade['commission'] = (Math.abs(qtyLotes) * feePorContrato).toFixed(2);

    dbTrades.push(dbTrade);
  }

  return dbTrades;
};