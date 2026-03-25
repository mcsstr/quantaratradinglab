import { Import, Edit2, FileText, Building2 } from '../../components/Icons';

const SectionTitle = ({ icon: Icon, title, theme }) => (
  <div className="flex items-center gap-2 mb-4">
    <Icon size={16} style={{ color: theme.textoSecundario }} />
    <span className="text-[15px] font-bold capitalize" style={{ color: theme.textoSecundario }}>{title}</span>
  </div>
);

export default function ImportView({
  theme,
  getGlassStyle,
  settings,
  manualTrade,
  setManualTrade,
  handleManualTradeAdd,
  handleCSVUpload,
  importText,
  setImportText,
  handleImport,
  isMobile,
  accounts,
  selectedImportAccountId,
  setSelectedImportAccountId,
  activeAccount,
  t = (k: string, _l?: string) => k,
  lang = 'en',
}) {
  const inputStyle = {
    borderColor: theme.contornoGeral,
    borderWidth: settings.borderWidthGeral,
    borderStyle: 'solid',
    color: theme.textoPrincipal
  };

  const hasAccount = !!selectedImportAccountId;

  const CustomDateTimeInput = ({ value, onChange }) => {
    const [dateStr, timeStr] = value ? value.split('T') : ['', ''];
    const [h, m, s] = timeStr ? timeStr.split(':') : ['', '', ''];

    const handleDateChange = (e) => {
      const nd = e.target.value;
      if (!nd) return onChange('');
      onChange(`${nd}T${h || '00'}:${m || '00'}:${s || '00'}`);
    };

    const updateTime = (unit, val) => {
      if (!dateStr) return;
      let newH = h || '00';
      let newM = m || '00';
      let newS = s || '00';
      if (unit === 'h') newH = val;
      if (unit === 'm') newM = val;
      if (unit === 's') newS = val;
      onChange(`${dateStr}T${newH}:${newM}:${newS}`);
    };

    const selectCls = "min-w-0 w-full rounded-md px-1 py-1.5 outline-none text-[11px] bg-transparent cursor-pointer text-center appearance-none";

    return (
      <div className="flex flex-col gap-1.5 w-full overflow-hidden">
        <input type="date" value={dateStr} onChange={handleDateChange} className="w-full rounded-lg p-2 outline-none text-xs bg-transparent" style={{ ...inputStyle, colorScheme: 'dark' }} />
        <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr] items-center gap-0.5 w-full">
          <select value={h || ""} onChange={(e) => updateTime('h', e.target.value)} className={selectCls} style={inputStyle}>
            <option value="" disabled>HH</option>
            {Array.from({ length: 24 }).map((_, i) => <option key={i} value={String(i).padStart(2, '0')} className="bg-gray-900">{String(i).padStart(2, '0')}</option>)}
          </select>
          <span className="text-white/40 text-[10px] font-bold px-0.5">:</span>
          <select value={m || ""} onChange={(e) => updateTime('m', e.target.value)} className={selectCls} style={inputStyle}>
            <option value="" disabled>MM</option>
            {Array.from({ length: 60 }).map((_, i) => <option key={i} value={String(i).padStart(2, '0')} className="bg-gray-900">{String(i).padStart(2, '0')}</option>)}
          </select>
          <span className="text-white/40 text-[10px] font-bold px-0.5">:</span>
          <select value={s || ""} onChange={(e) => updateTime('s', e.target.value)} className={selectCls} style={inputStyle}>
            <option value="" disabled>SS</option>
            {Array.from({ length: 60 }).map((_, i) => <option key={i} value={String(i).padStart(2, '0')} className="bg-gray-900">{String(i).padStart(2, '0')}</option>)}
          </select>
        </div>
      </div>
    );
  };

  return (
    <div key="import" className="max-w-4xl space-y-6 mx-auto w-full animate-tab-enter">
      {!isMobile && (
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 p-4 rounded-xl shadow-sm transition-all" style={getGlassStyle(theme.fundoCards)}>
          <div>
            <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
              <Import size={24} style={{ color: theme.textoAlerta }} /> {t('import.title', lang)}
            </h2>
            <p className="text-xs md:text-sm mt-1" style={{ color: theme.textoSecundario }}>{t('import.subtitle', lang)}</p>
          </div>
        </header>
      )}

      {/* Step 1: Account — Read-only (usa conta ativa global) */}
      <div className="rounded-xl p-4 md:p-5 shadow-xl transition-all" style={getGlassStyle(theme.fundoCards)}>
        <div className="flex items-center gap-2 mb-3">
          <Building2 size={16} style={{ color: theme.textoAlerta }} />
          <span className="text-sm font-bold capitalize tracking-wider" style={{ color: theme.textoSecundario }}>
            {t('import.step1', lang)}
          </span>
        </div>
        {activeAccount ? (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl border" style={{ borderColor: 'rgba(251,191,36,0.4)', backgroundColor: 'rgba(251,191,36,0.08)' }}>
            <span className="w-8 h-8 rounded-full text-sm flex items-center justify-center font-bold shrink-0" style={{ backgroundColor: 'rgba(251,191,36,0.3)', color: '#fde68a' }}>
              {activeAccount.name.charAt(0).toUpperCase()}
            </span>
            <div className="flex flex-col">
              <span className="text-sm font-bold" style={{ color: '#fde68a' }}>{activeAccount.name}</span>
              <span className="text-[10px] font-medium opacity-70" style={{ color: theme.textoSecundario }}>{lang === 'pt' ? 'Os dados serão mesclados com a conta global ativa selecionada.' : 'Data will be merged into this active global account.'}</span>
            </div>
            <div className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(251,191,36,0.2)', color: '#fde68a' }}>ACTIVE</div>
          </div>
        ) : (
          <div className="text-center py-6 opacity-50 text-sm" style={{ color: theme.textoSecundario }}>
            {t('import.noAccounts', lang)}
          </div>
        )}
      </div>

      {/* Step 2: Import Options (revealed only after account selection) */}
      {hasAccount && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-20">
          {/* Manual Trade Entry */}
          <div className="rounded-xl p-4 md:p-6 shadow-xl transition-all flex flex-col" style={getGlassStyle(theme.fundoCards)}>
            <SectionTitle icon={Edit2} title={t('import.manualEntry', lang)} theme={theme} />
            <div className="space-y-4 flex-1 flex flex-col overflow-hidden">
              <div className="grid grid-cols-2 gap-3 min-w-0">
                <div className="space-y-1 min-w-0">
                  <label className="text-[10px] md:text-xs font-bold" style={{ color: theme.textoSecundario }}>{t('field.symbol', lang)}</label>
                  <input type="text" placeholder="Ex: MNQ" className="w-full rounded-lg p-2 outline-none text-xs bg-transparent uppercase" style={inputStyle} value={manualTrade.symbol} onChange={e => setManualTrade({ ...manualTrade, symbol: e.target.value.toUpperCase() })} />
                </div>
                <div className="space-y-1 min-w-0">
                  <label className="text-[10px] md:text-xs font-bold" style={{ color: theme.textoSecundario }}>{t('field.qty', lang)}</label>
                  <input type="number" placeholder="Ex: 1" className="w-full rounded-lg p-2 outline-none text-xs bg-transparent" style={inputStyle} value={manualTrade.qty === 0 ? '' : manualTrade.qty} onChange={e => setManualTrade({ ...manualTrade, qty: e.target.value === '' ? '' : e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 min-w-0">
                <div className="space-y-1 min-w-0">
                  <label className="text-[10px] md:text-xs font-bold" style={{ color: theme.textoSecundario }}>{t('field.buyPrice', lang)}</label>
                  <input type="number" step="0.01" placeholder="Ex: 25393.50" className="w-full rounded-lg p-2 outline-none text-xs bg-transparent" style={inputStyle} value={manualTrade.buyPrice === 0 ? '' : manualTrade.buyPrice} onChange={e => setManualTrade({ ...manualTrade, buyPrice: e.target.value === '' ? '' : e.target.value })} />
                </div>
                <div className="space-y-1 min-w-0">
                  <label className="text-[10px] md:text-xs font-bold" style={{ color: theme.textoSecundario }}>{t('field.buyTime', lang)}</label>
                  <CustomDateTimeInput value={manualTrade.buyTime} onChange={(val) => setManualTrade({ ...manualTrade, buyTime: val })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 min-w-0">
                <div className="space-y-1 min-w-0">
                  <label className="text-[10px] md:text-xs font-bold" style={{ color: theme.textoSecundario }}>{t('field.duration', lang)}</label>
                  <input type="text" placeholder="Ex: 7m 12s" className="w-full rounded-lg p-2 outline-none text-xs bg-transparent" style={inputStyle} value={manualTrade.duration} onChange={e => setManualTrade({ ...manualTrade, duration: e.target.value })} />
                </div>
                <div className="space-y-1 min-w-0">
                  <label className="text-[10px] md:text-xs font-bold" style={{ color: theme.textoSecundario }}>{t('field.sellTime', lang)}</label>
                  <CustomDateTimeInput value={manualTrade.sellTime} onChange={(val) => setManualTrade({ ...manualTrade, sellTime: val })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 min-w-0">
                <div className="space-y-1 min-w-0">
                  <label className="text-[10px] md:text-xs font-bold" style={{ color: theme.textoSecundario }}>{t('field.sellPrice', lang)}</label>
                  <input type="number" step="0.01" placeholder="Ex: 25354.25" className="w-full rounded-lg p-2 outline-none text-xs bg-transparent" style={inputStyle} value={manualTrade.sellPrice === 0 ? '' : manualTrade.sellPrice} onChange={e => setManualTrade({ ...manualTrade, sellPrice: e.target.value === '' ? '' : e.target.value })} />
                </div>
                <div className="space-y-1 min-w-0">
                  <label className="text-[10px] md:text-xs font-bold" style={{ color: theme.textoSecundario }}>{t('field.pnl', lang)}</label>
                  <input type="number" step="0.01" placeholder="Ex: -78.50" className="w-full rounded-lg p-2 outline-none text-xs bg-transparent" style={inputStyle} value={manualTrade.pnl === 0 ? '' : manualTrade.pnl} onChange={e => setManualTrade({ ...manualTrade, pnl: e.target.value === '' ? '' : e.target.value })} />
                </div>
              </div>
              <button onClick={handleManualTradeAdd} className="w-full py-3 rounded-lg font-bold transition-opacity hover:opacity-80 shadow-md mt-auto" style={{ backgroundColor: theme.linhaGrafico, color: '#fff' }}>{t('import.addTrade', lang)}</button>
            </div>
          </div>

          {/* CSV Import */}
          <div className="rounded-xl p-4 md:p-6 shadow-xl transition-all flex flex-col" style={getGlassStyle(theme.fundoCards)}>
            <SectionTitle icon={FileText} title={t('import.csvBulk', lang)} theme={theme} />
            <div className="space-y-6 flex-1 flex flex-col">
              <div>
                <div className="flex items-center gap-2 mb-2 opacity-60">
                  <Import size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">{t('import.csvUpload', lang)}</span>
                </div>
                <p className="text-[10px] opacity-60 mb-4" style={{ color: theme.textoSecundario }}>{t('import.csvDesc', lang)}</p>
                <input type="file" accept=".csv" onChange={handleCSVUpload} className="w-full rounded-lg p-2 outline-none text-xs md:text-sm bg-transparent file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-gray-700 file:text-white hover:file:bg-gray-600" style={inputStyle} />
              </div>
              <div className="flex-1 flex flex-col">
                <div className="flex items-center gap-2 mb-2 opacity-60">
                  <FileText size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">{t('import.bulkRawText', lang)}</span>
                </div>
                <p className="text-[10px] opacity-60 mb-4" style={{ color: theme.textoSecundario }}>{t('import.bulkDesc', lang)}</p>
                <textarea className="w-full flex-1 min-h-[120px] rounded-lg p-3 font-mono text-xs outline-none bg-transparent" style={inputStyle} placeholder={"MNQ 2024-05-15 150.00 Long\nMES 2024-05-15 -45.50 Short"} value={importText} onChange={e => setImportText(e.target.value)} />
                <button onClick={handleImport} className="w-full py-3 rounded-lg font-bold transition-opacity hover:opacity-80 shadow-md mt-4" style={{ backgroundColor: theme.contornoHoje, color: '#000' }}>{t('import.importText', lang)}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Placeholder when no account selected */}
      {!hasAccount && accounts.length > 0 && (
        <div className="text-center py-16 opacity-40 text-sm" style={{ color: theme.textoSecundario }}>
          {t('import.selectAccount', lang)}
        </div>
      )}
    </div>
  );
}
