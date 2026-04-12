import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  ListIcon, Trash2, Search, ArrowDown, ArrowUp, Edit2, CalendarDays, X
} from '../../components/Icons';
import { hexToRgba } from '../../utils/constants';

const SectionTitle = ({ icon: Icon, title, theme, rightElement = null }: any) => (
  <div className="flex items-center justify-between mb-4 w-full">
    <div className="flex items-center gap-2">
      <Icon size={16} style={{ color: theme.textoSecundario }} />
      <span className="text-[15px] font-bold capitalize" style={{ color: theme.textoSecundario }}>{title}</span>
    </div>
    {rightElement && <div>{rightElement}</div>}
  </div>
);

export default function TradesView({
  theme,
  getGlassStyle,
  settings,
  selectedTrades,
  setSelectedTrades,
  setTrades,
  filteredTrades,
  searchTerm,
  setSearchTerm,
  sortOrder,
  setSortOrder,
  filterMonth,
  setFilterMonth,
  filterYear,
  setFilterYear,
  paginatedTrades,
  formatDate,
  userLocale,
  setEditFormData,
  setIsTradeModalOpen,
  historyPage,
  historyItemsPerPage,
  setHistoryPage,
  isMobile,
  formatCurrency,
  activeAccountId,
  handleExportCSV,
  supabase,
  session,
  setToastMessage,
  setups
}) {
  const [isConfirmDeleteAllOpen, setIsConfirmDeleteAllOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const moCol = settings?.mobileTableColumns || {};
  const getColClass = (key: string, desktopClass: string = '') => {
    if (!isMobile) return desktopClass;
    return moCol[key] !== false ? desktopClass.replace(/hidden (md|lg):table-cell/g, '').trim() : 'hidden';
  };

  const handleDeleteAll = async () => {
    setIsDeleting(true);
    try {
      if (session) {
        const { error } = await supabase
          .from('trades')
          .delete()
          .eq('account_id', activeAccountId);
        if (error) throw error;
      }
      setTrades(prev => prev.filter(t => t.accountId !== activeAccountId));
      setIsConfirmDeleteAllOpen(false);
      setToastMessage('All trades deleted successfully.');
      setTimeout(() => setToastMessage(''), 3000);
    } catch (err: any) {
      console.error('Delete All error:', err);
      setToastMessage(`Error deleting trades: ${err.message}`);
      setTimeout(() => setToastMessage(''), 4000);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedTrades.length === 0) return;
    setIsDeleting(true);
    try {
      if (session) {
        const { error } = await supabase
          .from('trades')
          .delete()
          .in('id', selectedTrades);
        if (error) throw error;
      }
      setTrades(prev => prev.filter(t => !selectedTrades.includes(t.id)));
      setSelectedTrades([]);
      setToastMessage(`${selectedTrades.length} trade(s) deleted successfully.`);
      setTimeout(() => setToastMessage(''), 3000);
    } catch (err: any) {
      console.error('Delete Selected error:', err);
      setToastMessage(`Error deleting trades: ${err.message}`);
      setTimeout(() => setToastMessage(''), 4000);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteSingle = async (tradeId: string) => {
    try {
      if (session) {
        const { error } = await supabase
          .from('trades')
          .delete()
          .eq('id', tradeId);
        if (error) throw error;
      }
      setTrades(prev => prev.filter(t => t.id !== tradeId));
    } catch (err: any) {
      console.error('Delete Single error:', err);
      setToastMessage(`Error deleting trade: ${err.message}`);
      setTimeout(() => setToastMessage(''), 4000);
    }
  };

  const filteredTradesPnl = filteredTrades.reduce((acc: number, t: any) => acc + t.pnl + Number(t.commission || 0), 0);

  return (
    <div key="trades" className="space-y-6 max-w-[1600px] mx-auto w-full animate-tab-enter">
      <div className="flex items-center gap-3 shrink-0 px-2 md:px-0 mb-2">
        <ListIcon size={26} className="text-yellow-500" />
        <h1 className="text-2xl md:text-3xl font-black font-display tracking-tight whitespace-nowrap" style={{ color: theme.textoPrincipal }}>
          Trades History
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-2">
        {/* Search and Sorting */}
        <div className="rounded-xl p-6 shadow-xl transition-all" style={getGlassStyle(theme.fundoCards)}>
          <SectionTitle
            icon={Search}
            title="Search & Sorting"
            theme={theme}
          />
          <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-4">
            <div className="relative group flex-1 w-full sm:min-w-[200px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 transition-colors" style={{ color: theme.textoSecundario }} />
              <input
                type="text"
                placeholder="Search symbol, notes..."
                className="rounded-lg py-2 pl-9 pr-4 text-xs w-full outline-none transition-all shadow-sm focus:ring-1 bg-transparent"
                style={{ borderColor: theme.contornoGeral, borderWidth: settings.borderWidthGeral, borderStyle: 'solid', color: theme.textoPrincipal }}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-[10px] font-bold opacity-50 uppercase" style={{ color: theme.textoSecundario }}>Order:</span>
              <div className="flex flex-1 sm:flex-none rounded-lg p-0.5 shadow-sm bg-transparent border-white/5" style={{ borderColor: theme.contornoGeral, borderWidth: settings.borderWidthGeral, borderStyle: 'solid' }}>
                <button onClick={() => setSortOrder('recent')} className="flex-1 sm:flex-none px-3 py-1.5 text-[10px] font-bold rounded-md transition-all text-center" style={{ backgroundColor: sortOrder === 'recent' ? hexToRgba(theme.fundoPrincipal, 0.5) : 'transparent', color: sortOrder === 'recent' ? theme.textoPrincipal : theme.textoSecundario }}>Recent</button>
                <button onClick={() => setSortOrder('oldest')} className="flex-1 sm:flex-none px-3 py-1.5 text-[10px] font-bold rounded-md transition-all text-center" style={{ backgroundColor: sortOrder === 'oldest' ? hexToRgba(theme.fundoPrincipal, 0.5) : 'transparent', color: sortOrder === 'oldest' ? theme.textoPrincipal : theme.textoSecundario }}>Oldest</button>
              </div>
            </div>
          </div>
        </div>

        {/* Date Filter & Actions */}
        <div className="rounded-xl p-6 shadow-xl transition-all" style={getGlassStyle(theme.fundoCards)}>
          <SectionTitle
            icon={CalendarDays}
            title="History Filter"
            theme={theme}
            rightElement={
              <span className="font-bold text-sm md:text-base" style={{ color: filteredTradesPnl >= 0 ? theme.textoPositivo : theme.textoNegativo }}>
                {filteredTradesPnl > 0 ? '+' : ''}{formatCurrency(filteredTradesPnl)}
              </span>
            }
          />
          <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-4">
            <div className="flex gap-2 w-full flex-1 sm:min-w-[200px]">
              <select
                className="flex-1 rounded-lg py-2 px-3 text-xs outline-none cursor-pointer bg-transparent w-full"
                style={{ borderColor: theme.contornoGeral, borderWidth: settings.borderWidthGeral, borderStyle: 'solid', color: theme.textoPrincipal }}
                value={filterMonth}
                onChange={e => setFilterMonth(e.target.value)}
              >
                <option value="all" className="bg-gray-800">Month: All</option>
                {Array.from({ length: 12 }, (_, i) => <option key={i + 1} value={(i + 1).toString().padStart(2, '0')} className="bg-gray-800">{new Date(2000, i).toLocaleString(userLocale, { month: 'long' })}</option>)}
              </select>
              <select
                className="flex-1 rounded-lg py-2 px-3 text-xs outline-none cursor-pointer bg-transparent w-full"
                style={{ borderColor: theme.contornoGeral, borderWidth: settings.borderWidthGeral, borderStyle: 'solid', color: theme.textoPrincipal }}
                value={filterYear}
                onChange={e => setFilterYear(e.target.value)}
              >
                <option value="all" className="bg-gray-800">Year: All</option>
                <option value="2024" className="bg-gray-800">2024</option>
                <option value="2025" className="bg-gray-800">2025</option>
                <option value="2026" className="bg-gray-800">2026</option>
              </select>
            </div>
            <div className="flex flex-col sm:flex-row flex-wrap gap-2 w-full sm:w-auto mt-1 sm:mt-0">
              {filteredTrades.length > 0 && (
                <button
                  onClick={() => setIsConfirmDeleteAllOpen(true)}
                  className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-sm bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30 whitespace-nowrap"
                >
                  <Trash2 size={14} /> Delete All
                </button>
              )}
              {selectedTrades.length > 0 && (
                <button
                  onClick={handleDeleteSelected}
                  disabled={isDeleting}
                  className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-sm bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30 whitespace-nowrap disabled:opacity-40"
                >
                  <Trash2 size={14} /> {isDeleting ? 'Deleting...' : `Delete Selected (${selectedTrades.length})`}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl overflow-hidden shadow-xl transition-all" style={getGlassStyle(theme.fundoCards)}>
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left text-[9px] sm:text-[10px] md:text-xs whitespace-nowrap">
            <thead className="text-[9px] sm:text-[10px] md:text-xs tracking-wider font-bold" style={{ backgroundColor: hexToRgba(theme.fundoPrincipal, settings.cardOpacity / 100), color: theme.textoSecundario }}>
              <tr>
                <th className="px-2 py-3 md:px-4 md:py-4 w-6 text-center"><input type="checkbox" className="cursor-pointer" checked={paginatedTrades.length > 0 && selectedTrades.length === paginatedTrades.length} onChange={(e) => { if (e.target.checked) setSelectedTrades(paginatedTrades.map(t => t.id)); else setSelectedTrades([]); }} /></th>
                <th className={`${getColClass('symbol')} px-2 py-3 md:px-4 md:py-4 text-center`}>Sym</th>
                <th className={`${getColClass('dateTime')} px-2 py-3 md:px-4 md:py-4 text-center`}>Date & Time</th>
                <th className={`${getColClass('direction')} px-2 py-3 md:px-4 md:py-4 text-center w-8 sm:w-12`}>Dir</th>
                <th className={`${getColClass('qty', 'hidden md:table-cell')} px-2 py-3 md:px-4 md:py-4 text-center`}>Contracts</th>
                <th className={`${getColClass('buyPrice', 'hidden lg:table-cell')} px-2 py-3 md:px-4 md:py-4 text-center`}>Buy Price</th>
                <th className={`${getColClass('buyTime', 'hidden lg:table-cell')} px-2 py-3 md:px-4 md:py-4 text-center`}>Buy Time</th>
                <th className={`${getColClass('duration', 'hidden md:table-cell')} px-2 py-3 md:px-4 md:py-4 text-center`}>Duration</th>
                <th className={`${getColClass('sellTime', 'hidden lg:table-cell')} px-2 py-3 md:px-4 md:py-4 text-center`}>Sell Time</th>
                <th className={`${getColClass('sellPrice', 'hidden lg:table-cell')} px-2 py-3 md:px-4 md:py-4 text-center`}>Sell Price</th>
                <th className={`${getColClass('fees', 'hidden md:table-cell')} px-2 py-3 md:px-4 md:py-4 text-center w-24`}>Fees</th>
                <th className={`${getColClass('pnl')} px-2 py-3 md:px-4 md:py-4 text-center w-28`}>Gross P&L</th>
                <th className="px-2 py-3 md:px-4 md:py-4 text-center w-28">Setup</th>
                <th className={`${getColClass('action')} px-2 py-3 md:px-4 md:py-4 text-center w-20`}>Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedTrades.map((trade, index) => (
                <tr key={trade.id} className="transition-colors hover:bg-white/10" style={{ backgroundColor: index % 2 === 0 ? 'transparent' : 'rgba(128, 128, 128, 0.04)' }}>
                  <td className="px-2 py-2.5 md:px-4 md:py-3 text-center">
                    <input type="checkbox" className="cursor-pointer" checked={selectedTrades.includes(trade.id)} onChange={() => { setSelectedTrades(prev => prev.includes(trade.id) ? prev.filter(id => id !== trade.id) : [...prev, trade.id]); }} />
                  </td>
                  <td className={`${getColClass('symbol')} px-2 py-2.5 md:px-4 md:py-3 text-center font-bold text-[9px] sm:text-[10px] md:text-xs truncate max-w-[40px] sm:max-w-none`}>
                    {trade.symbol || '-'}
                  </td>
                  <td className={`${getColClass('dateTime')} px-2 py-2.5 md:px-4 md:py-3 font-mono text-[8.5px] sm:text-[10px] md:text-xs leading-tight`}>
                    <div className="flex flex-col">
                      <span>{formatDate(trade.date)}</span>
                      {trade.entryTimestamp && <span className="opacity-70">{new Date(trade.entryTimestamp).toLocaleTimeString(userLocale, { hour: '2-digit', minute: '2-digit', hour12: false })}</span>}
                    </div>
                  </td>
                  <td className={`${getColClass('direction')} px-2 py-2.5 md:px-4 md:py-3 text-center`}>
                    <div className="flex items-center justify-center gap-1 font-bold text-[9px] sm:text-[10px] md:text-xs" style={{ color: trade.direction === 'Short' ? theme.textoNegativo : theme.textoPositivo }}>
                      {trade.direction === 'Short' ? <ArrowDown size={12} className="md:w-[14px] md:h-[14px]" /> : <ArrowUp size={12} className="md:w-[14px] md:h-[14px]" />}
                    </div>
                  </td>
                  <td className={`${getColClass('qty', 'hidden md:table-cell')} px-2 py-2.5 md:px-4 md:py-3 font-mono text-center text-[9px] sm:text-[10px] md:text-xs`}>
                    {trade.qty}
                  </td>
                  <td className={`${getColClass('buyPrice', 'hidden lg:table-cell')} px-2 py-2.5 md:px-4 md:py-3 font-mono text-center text-[9px] sm:text-[10px] md:text-xs opacity-70`}>
                    {trade.buyPrice ? trade.buyPrice.toLocaleString(userLocale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-'}
                  </td>
                  <td className={`${getColClass('buyTime', 'hidden lg:table-cell')} px-2 py-2.5 md:px-4 md:py-3 font-mono text-center text-[9px] sm:text-[10px] md:text-xs opacity-70`}>
                    {trade.buyTime || '-'}
                  </td>
                  <td className={`${getColClass('duration', 'hidden md:table-cell')} px-2 py-2.5 md:px-4 md:py-3 font-mono text-center text-[9px] sm:text-[10px] md:text-xs opacity-70`}>
                    {trade.duration || "00:00"}
                  </td>
                  <td className={`${getColClass('sellTime', 'hidden lg:table-cell')} px-2 py-2.5 md:px-4 md:py-3 font-mono text-center text-[9px] sm:text-[10px] md:text-xs opacity-70`}>
                    {trade.sellTime || '-'}
                  </td>
                  <td className={`${getColClass('sellPrice', 'hidden lg:table-cell')} px-2 py-2.5 md:px-4 md:py-3 font-mono text-center text-[9px] sm:text-[10px] md:text-xs opacity-70`}>
                    {trade.sellPrice ? trade.sellPrice.toLocaleString(userLocale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-'}
                  </td>
                  <td className={`${getColClass('fees', 'hidden md:table-cell')} px-2 py-2.5 md:px-4 md:py-3 font-mono text-center text-[10px] md:text-xs w-24`} style={{ color: theme.textoSecundario }}>
                    {trade.commission ? `-${formatCurrency(Math.abs(Number(trade.commission)))}` : '$0.00'}
                  </td>
                  <td className={`${getColClass('pnl')} px-2 py-2.5 md:px-4 md:py-3 font-bold text-center text-[10px] md:text-xs w-28`} style={{ color: trade.pnl >= 0 ? theme.textoPositivo : theme.textoNegativo }}>
                    {formatCurrency(trade.pnl)}
                  </td>
                  <td className="px-2 py-2.5 md:px-4 md:py-3 text-center">
                    <div style={{ transform: 'scale(0.72)', transformOrigin: 'center', display: 'inline-block', lineHeight: 1 }}>
                      <select 
                        value={trade.setup_id || ''}
                        onChange={async (e) => {
                           const val = e.target.value || null;
                           setTrades((prev:any) => prev.map((t:any) => t.id === trade.id ? {...t, setup_id: val} : t));
                           await supabase.from('trades').update({ setup_id: val }).eq('id', trade.id);
                        }}
                        className="bg-transparent text-center outline-none cursor-pointer font-mono border-none hover:opacity-80 transition-opacity appearance-none"
                        style={{ color: theme.textoSecundario, fontSize: '11px', minWidth: '80px' }}
                      >
                        <option value="">Price Action</option>
                        {setups?.map((s:any) => <option key={s.id} value={s.id}>{s.title}</option>)}
                      </select>
                    </div>
                  </td>
                  <td className={`${getColClass('action')} px-2 py-2.5 md:px-4 md:py-3 text-center flex justify-center gap-1 w-20`}>
                    <button onClick={() => { setEditFormData(trade); setIsTradeModalOpen(true); }} className="p-1 sm:p-1.5 md:p-2 rounded-md transition-colors hover:bg-white/20" style={{ color: theme.textoSecundario }}><Edit2 size={isMobile ? 12 : 14} /></button>
                    <button onClick={() => handleDeleteSingle(trade.id)} className="p-1 sm:p-1.5 md:p-2 rounded-md transition-colors hover:bg-white/20" style={{ color: theme.textoSecundario }}><Trash2 size={isMobile ? 12 : 14} /></button>
                  </td>
                </tr>
              ))}
              {paginatedTrades.length === 0 && (<tr><td colSpan="12" className="p-12 text-center italic" style={{ color: theme.textoSecundario }}>No trades found.</td></tr>)}
            </tbody>
          </table>
          {filteredTrades.length > historyItemsPerPage && (
            <div className="flex justify-between items-center p-3 md:p-4 border-t" style={{ borderColor: theme.contornoGeral, backgroundColor: hexToRgba(theme.fundoPrincipal, settings.cardOpacity / 100) }}>
              <span className="text-[10px] md:text-xs font-medium" style={{ color: theme.textoSecundario }}>
                Showing {(historyPage - 1) * historyItemsPerPage + 1} - {Math.min(historyPage * historyItemsPerPage, filteredTrades.length)} of {filteredTrades.length} trades
              </span>
              <div className="flex items-center gap-2">
                <button disabled={historyPage === 1} onClick={() => setHistoryPage(p => p - 1)} className="px-3 py-1.5 rounded-md text-[10px] md:text-xs font-bold transition-all disabled:opacity-30" style={{ backgroundColor: theme.linhaGrafico + '20', color: theme.linhaGrafico }}>Prev</button>
                <span className="text-[10px] md:text-xs font-bold" style={{ color: theme.textoPrincipal }}>{historyPage} / {Math.ceil(filteredTrades.length / historyItemsPerPage)}</span>
                <button disabled={historyPage === Math.ceil(filteredTrades.length / historyItemsPerPage)} onClick={() => setHistoryPage(p => p + 1)} className="px-3 py-1.5 rounded-md text-[10px] md:text-xs font-bold transition-all disabled:opacity-30" style={{ backgroundColor: theme.linhaGrafico + '20', color: theme.linhaGrafico }}>Next</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODAL DE CONFIRMAÇÃO DE APAGAR TODOS */}
      {isConfirmDeleteAllOpen && createPortal(
        <>
          <div className="fixed inset-0 z-[199] bg-black/60 backdrop-blur-sm" onClick={() => setIsConfirmDeleteAllOpen(false)} />
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div
              className="w-full max-sm:max-w-[calc(100%-2rem)] max-w-sm rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.7)] border overflow-hidden"
              style={{ backgroundColor: '#111114', borderColor: 'rgba(255,255,255,0.08)' }}
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6 text-center">
                <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto mb-4">
                  <Trash2 size={24} className="text-red-400" />
                </div>
                <p className="text-base font-bold text-white mb-1">Delete All Trades?</p>
                <p className="text-sm text-white/40 leading-relaxed">This will permanently delete <span className="text-red-400 font-bold">all trades</span> from this active account. This cannot be undone.</p>
              </div>
              <div className="px-5 pb-5 flex gap-3">
                <button
                  onClick={() => setIsConfirmDeleteAllOpen(false)}
                  className="flex-1 py-3 rounded-xl border border-white/10 text-sm font-bold text-white/40 hover:bg-white/5 transition-all"
                >Cancel</button>
                <button
                  onClick={handleDeleteAll}
                  disabled={isDeleting}
                  className="flex-1 py-3 rounded-xl text-sm font-bold transition-all hover:bg-red-600 bg-red-500 text-white active:scale-95 shadow-lg disabled:opacity-40"
                >{isDeleting ? 'Deleting...' : 'Delete All'}</button>
              </div>
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  );
}
