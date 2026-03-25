// FICHEIRO DE REFERÊNCIA PARA A IA: Lógica Híbrida de Leitura de Trades
// ATUALIZAÇÃO DEFINITIVA: Desconstrução manual de datas para evitar perda de segundos 
// e confusões de formato (MM/DD/YYYY vs DD/MM/YYYY) quando o dia é < 12.

// SANITIZADOR INTELIGENTE DE DATAS (À PROVA DE BALAS)
// Recorta cada componente exato da string para garantir que os segundos nunca se percam.

export const columnAliases = {
  symbol: ['symbol', 'Ativo', 'Ticker', 'contract', 'instrument', 'símbolo', 'ativo'],
  qty: ['qty', 'Quantity', 'Quantidade', 'contracts', 'tamanho', 'volume', 'lotes'],
  buyPrice: ['buyPrice', 'Buy Price', 'Preço Compra', 'entry price', 'open price', 'avg buy price', 'preço de abertura'],
  buyTime: ['boughtTimestamp', 'Buy Time', 'Data Compra', 'buytime', 'entry time', 'open time', 'entry datetime', 'horário de abertura', 'data de abertura'],
  duration: ['duration', 'Duration', 'Tempo', 'duração'],
  sellTime: ['soldTimestamp', 'Sell Time', 'Data Venda', 'selltime', 'exit time', 'close time', 'exit datetime', 'horário de fechamento', 'data de fechamento'],
  sellPrice: ['sellPrice', 'Sell Price', 'Preço Venda', 'exit price', 'close price', 'avg sell price', 'preço de fechamento'],
  pnl: ['pnl', 'P&L', 'Net PnL', 'Lucro/Prejuízo', 'p/l', 'profit', 'realized pnl', 'lucro líquido', 'resultado'],
  direction: ['direction', 'side', 'direção', 'lado', 'tipo']
};

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

export const processCSVLogic = (csvText, activeAccount, importSource = 'paste') => {
  // 1. Identificação do Array de Mapeamento
  const mapping = importSource === 'csv' ? activeAccount.csv_mapping : activeAccount.paste_mapping;

  // 2. Validação Exigente (Evita Importações Erradas)
  if (!mapping || !Array.isArray(mapping) || mapping.length === 0) {
    throw new Error(`Sem configuração de Cabeçalhos para ${importSource.toUpperCase()}. Atualize a conta '${activeAccount.name}' e defina a ordem das colunas.`);
  }

  const lines = csvText.split('\n').map(line => line.trim()).filter(line => line);
  if (lines.length === 0) throw new Error("Ficheiro vazio ou inválido.");

  // Regex para CSV e identificação passiva de delimitador TSV no Paste
  let delimiterRegex = /,(?=(?:(?:[^"]*"){2})*[^"]*$)/;
  if (lines[0].includes('\t') && importSource === 'paste') {
    delimiterRegex = /\t/;
  }

  let startRow = importSource === 'csv' ? 1 : 0;

  const dbTrades = [];

  // 3. Tratamento Financeiro Independente Seguro
  const sanitizeNum = (str) => {
    let cleanStr = String(str || '').replace(/[$,\s]/g, '');
    let val = parseFloat(cleanStr);

    // Suporte rigoroso para notações de dívida (100) -> -100
    if ((cleanStr.includes('(') && cleanStr.includes(')')) || cleanStr.includes('-')) {
      if (val > 0) val = -val;
    }
    return isNaN(val) ? 0 : val;
  };

  // 4. Processamento estritamente Baseado por Índice
  for (let i = startRow; i < lines.length; i++) {
    const rowValues = lines[i].split(delimiterRegex).map(val => val.replace(/(^"|"$)/g, '').trim());

    let tradeData = {};
    let rawMetadata = {};

    mapping.forEach((colName, idx) => {
      if (!colName || colName.toLowerCase() === 'ignore') return;
      const val = rowValues[idx] !== undefined ? rowValues[idx] : '';

      const key = colName.trim().toLowerCase();
      const checkAlias = (aliasList) => aliasList.some(s => s.toLowerCase() === key);

      if (checkAlias(columnAliases.symbol)) tradeData.symbol = val;
      else if (checkAlias(columnAliases.qty)) tradeData.qty = val;
      else if (checkAlias(columnAliases.buyPrice)) tradeData.buyPrice = val;
      else if (checkAlias(columnAliases.buyTime)) tradeData.buyTime = val;
      else if (checkAlias(columnAliases.sellTime)) tradeData.sellTime = val;
      else if (checkAlias(columnAliases.sellPrice)) tradeData.sellPrice = val;
      else if (checkAlias(columnAliases.duration)) tradeData.duration = val;
      else if (checkAlias(columnAliases.pnl)) tradeData.pnl = val;
      else if (checkAlias(columnAliases.direction)) tradeData.direction = val;
      else rawMetadata[colName.trim()] = val; // Extra fields stored separately
    });

    let pnlRaw = tradeData.pnl || '';
    if (pnlRaw) {
      pnlRaw = pnlRaw.replace(/\s/g, '');
      if (pnlRaw.startsWith('$(') && pnlRaw.endsWith(')')) pnlRaw = '-' + pnlRaw.replace('$(', '').replace(')', '');
      else if (pnlRaw.startsWith('($') && pnlRaw.endsWith(')')) pnlRaw = '-' + pnlRaw.replace('($', '').replace(')', '');
      else if (pnlRaw.startsWith('(') && pnlRaw.endsWith(')')) pnlRaw = '-' + pnlRaw.replace('(', '').replace(')', '');
      else if (pnlRaw.startsWith('$')) pnlRaw = pnlRaw.replace('$', '');
    }

    const qty = sanitizeNum(tradeData.qty);
    let pnlValue = sanitizeNum(pnlRaw);
    if ((String(pnlRaw).includes('-') || String(pnlRaw).includes('(')) && pnlValue > 0) pnlValue = -pnlValue;

    const symbol = tradeData.symbol ? tradeData.symbol.toUpperCase() : '-';
    const buyPrice = tradeData.buyPrice ? sanitizeNum(tradeData.buyPrice) : 0;
    const sellPrice = tradeData.sellPrice ? sanitizeNum(tradeData.sellPrice) : 0;
    const duration = tradeData.duration || '00:00';

    let direction = 'Long', entryTimestamp = null, dateStr = null;

    if (tradeData.direction && (tradeData.direction.toLowerCase().includes('short') || tradeData.direction.toLowerCase().includes('venda'))) {
      direction = 'Short';
    }

    const d1Iso = parseSmartDate(tradeData.buyTime);
    const d2Iso = parseSmartDate(tradeData.sellTime);
    const d1 = d1Iso ? new Date(d1Iso).getTime() : NaN;
    const d2 = d2Iso ? new Date(d2Iso).getTime() : NaN;

    if (!isNaN(d1) && !isNaN(d2)) {
      if (d1 > d2 && direction !== 'Short') { direction = 'Short'; entryTimestamp = d2; }
      else { entryTimestamp = d1; }
    } else {
      entryTimestamp = !isNaN(d1) ? d1 : (!isNaN(d2) ? d2 : null);
    }

    if (entryTimestamp) {
      const ed = new Date(entryTimestamp);
      dateStr = `${ed.getFullYear()}-${String(ed.getMonth() + 1).padStart(2, '0')}-${String(ed.getDate()).padStart(2, '0')}`;
    }

    // Apenas insere se Qty e PnL estiverem presentes (Requisito Mínimo Vital)
    if (!isNaN(qty) && qty > 0 && !isNaN(pnlValue) && dateStr) {
      dbTrades.push({
        account_id: activeAccount?.id || 'default_account',
        date: dateStr,
        qty,
        pnl: pnlValue,
        duration: duration,
        direction,
        entry_timestamp: entryTimestamp ? new Date(entryTimestamp).toISOString() : null,
        symbol,
        buy_price: buyPrice,
        sell_price: sellPrice,
        buy_time: tradeData.buyTime ? (parseSmartDate(tradeData.buyTime) || tradeData.buyTime) : null,
        sell_time: tradeData.sellTime ? (parseSmartDate(tradeData.sellTime) || tradeData.sellTime) : null,
        raw_metadata: rawMetadata
      });
    }
  }

  return dbTrades;
};