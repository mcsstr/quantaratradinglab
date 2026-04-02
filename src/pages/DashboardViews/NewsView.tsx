import React from 'react';
import { Newspaper, Trash2, Edit2, Plus, Search, FileText, ListIcon, Folder } from '../../components/Icons';

const SectionTitle = ({ icon: Icon, title, theme }) => (
  <div className="flex items-center gap-2 mb-4">
    <Icon size={16} style={{ color: theme.textoSecundario }} />
    <span className="text-[15px] font-bold capitalize" style={{ color: theme.textoSecundario }}>{title}</span>
  </div>
);
import { hexToRgba } from '../../utils/constants';

export default function NewsView({
  theme,
  getGlassStyle,
  settings,
  isMobile,
  newNewsItem,
  setNewNewsItem,
  handleAddNews,
  newsImportImpact,
  setNewsImportImpact,
  newsImportText,
  setNewsImportText,
  handleImportNews,
  newsFilter,
  setNewsFilter,
  filteredNewsList,
  formatDate,
  getImpactColor,
  setEditNewsData,
  setIsNewsModalOpen,
  saveNews,
  deleteNews,
  news
}) {
  const [isAddNewsOpen, setIsAddNewsOpen] = React.useState(false);

  return (
    <div key="news" className="max-w-4xl space-y-6 mx-auto w-full animate-tab-enter">
      {!isMobile && (
        <header className="flex flex-col lg:flex-row justify-between lg:items-center gap-4 p-2 rounded-xl transition-all bg-transparent">
          <div className="flex items-center gap-3 shrink-0 mb-2">
            <Newspaper size={26} className="text-yellow-500" />
            <h1 className="text-2xl md:text-3xl font-black font-display tracking-tight whitespace-nowrap" style={{ color: theme.textoPrincipal }}>
              Economic Calendar & News
            </h1>
          </div>
          {!isAddNewsOpen && (
            <button onClick={() => setIsAddNewsOpen(true)} className="py-2 px-6 rounded-lg flex items-center justify-center gap-2 text-sm font-bold transition-opacity hover:opacity-80 shadow-md h-[40px]" style={{ backgroundColor: theme.linhaGrafico, color: '#fff' }}>
              <Plus size={18} /> Add News
            </button>
          )}
        </header>
      )}

      {isMobile && !isAddNewsOpen && (
        <button onClick={() => setIsAddNewsOpen(true)} className="py-2.5 px-6 rounded-lg flex items-center justify-center gap-2 text-sm font-bold transition-opacity hover:opacity-80 shadow-md w-full h-[46px]" style={{ backgroundColor: theme.linhaGrafico, color: '#fff' }}>
          <Plus size={18} /> Add News
        </button>
      )}

      {isAddNewsOpen && (
        <div className="flex flex-col gap-4 animate-fade-in relative z-10">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold text-lg" style={{ color: theme.textoPrincipal }}>Add New Event</h3>
            <button onClick={() => setIsAddNewsOpen(false)} className="px-4 py-2 text-xs md:text-sm font-bold rounded-lg hover:bg-white/10 transition-colors" style={{ color: theme.textoSecundario }}>Cancel</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Register Economic News */}
            <div className="rounded-xl p-4 md:p-6 shadow-xl transition-all flex flex-col" style={getGlassStyle(theme.fundoCards)}>
              <SectionTitle
                icon={Plus}
                title="Register News"
                theme={theme}
              />
              <div className="space-y-4 flex-1 flex flex-col">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1"><label className="text-[10px] font-bold" style={{ color: theme.textoSecundario }}>Date</label><input type="date" className="w-full rounded-lg p-2.5 outline-none text-xs bg-transparent" style={{ borderColor: theme.contornoGeral, borderWidth: settings.borderWidthGeral, borderStyle: 'solid', color: theme.textoPrincipal }} value={newNewsItem.date} onChange={e => setNewNewsItem({ ...newNewsItem, date: e.target.value })} /></div>
                  <div className="space-y-1"><label className="text-[10px] font-bold" style={{ color: theme.textoSecundario }}>Time</label><input type="text" placeholder="Ex: 14:30 or All Day" className="w-full rounded-lg p-2.5 outline-none text-xs bg-transparent" style={{ borderColor: theme.contornoGeral, borderWidth: settings.borderWidthGeral, borderStyle: 'solid', color: theme.textoPrincipal }} value={newNewsItem.time} onChange={e => setNewNewsItem({ ...newNewsItem, time: e.target.value })} /></div>
                  <div className="space-y-1"><label className="text-[10px] font-bold" style={{ color: theme.textoSecundario }}>Currency</label><input type="text" placeholder="Ex: USD, EUR..." className="w-full rounded-lg p-2.5 outline-none text-xs bg-transparent uppercase" style={{ borderColor: theme.contornoGeral, borderWidth: settings.borderWidthGeral, borderStyle: 'solid', color: theme.textoPrincipal }} value={newNewsItem.currency} onChange={e => setNewNewsItem({ ...newNewsItem, currency: e.target.value.toUpperCase() })} /></div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold" style={{ color: theme.textoSecundario }}>Impact</label>
                    <select className="w-full rounded-lg p-2.5 outline-none text-xs cursor-pointer bg-transparent" style={{ borderColor: theme.contornoGeral, borderWidth: settings.borderWidthGeral, borderStyle: 'solid', color: theme.textoPrincipal }} value={newNewsItem.impact} onChange={e => setNewNewsItem({ ...newNewsItem, impact: e.target.value })}>
                      <option value="High" className="bg-gray-800">High Impact</option>
                      <option value="Medium" className="bg-gray-800">Medium Impact</option>
                      <option value="Low" className="bg-gray-800">Low Impact</option>
                      <option value="Holiday" className="bg-gray-800">Bank Holiday</option>
                    </select>
                  </div>

                  <div className="space-y-1 sm:col-span-2"><label className="text-[10px] font-bold" style={{ color: theme.textoSecundario }}>Description</label><input type="text" placeholder="Ex: CPI Data Release..." className="w-full rounded-lg p-2.5 outline-none text-xs bg-transparent" style={{ borderColor: theme.contornoGeral, borderWidth: settings.borderWidthGeral, borderStyle: 'solid', color: theme.textoPrincipal }} value={newNewsItem.description} onChange={e => setNewNewsItem({ ...newNewsItem, description: e.target.value })} /></div>
                </div>

                <button onClick={handleAddNews} className="py-2.5 px-8 rounded-lg flex items-center justify-center gap-2 text-sm font-bold transition-opacity hover:opacity-80 w-full shadow-md mt-auto" style={{ backgroundColor: theme.linhaGrafico, color: '#fff' }}><Plus size={18} /> Add Event</button>
              </div>
            </div>

            {/* RAW TEXT IMPORT CARD */}
            <div className="rounded-xl p-4 md:p-6 shadow-xl transition-all flex flex-col" style={getGlassStyle(theme.fundoCards)}>
              <div>
                <SectionTitle
                  icon={ListIcon}
                  title="Raw Text Paste"
                  theme={theme}
                />
                <p className="text-[10px] opacity-60 mb-4" style={{ color: theme.textoSecundario }}>Paste bulk news here. The lines should contain: Date, Time, Currency, and Description.</p>
              </div>
              <div className="flex flex-col gap-4 flex-1">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold" style={{ color: theme.textoSecundario }}>General Impact for this Import</label>
                  <select className="w-full rounded-lg p-2.5 outline-none text-xs cursor-pointer bg-transparent" style={{ borderColor: theme.contornoGeral, borderWidth: settings.borderWidthGeral, borderStyle: 'solid', color: theme.textoPrincipal }} value={newsImportImpact} onChange={e => setNewsImportImpact(e.target.value)}>
                    <option value="High" className="bg-gray-800">High Impact</option>
                    <option value="Medium" className="bg-gray-800">Medium Impact</option>
                    <option value="Low" className="bg-gray-800">Low Impact</option>
                    <option value="Holiday" className="bg-gray-800">Bank Holiday</option>
                  </select>
                </div>
                <textarea className="w-full flex-1 min-h-[120px] rounded-lg p-3 font-mono text-[10px] outline-none shadow-sm transition-all bg-transparent" style={{ borderColor: theme.contornoGeral, borderWidth: settings.borderWidthGeral, borderStyle: 'solid', color: theme.textoPrincipal }} placeholder={"Sun Feb 1\nMon Feb 2\n10:00\nUSD\nISM Manufacturing PMI"} value={newsImportText} onChange={e => setNewsImportText(e.target.value)} />
                <button onClick={handleImportNews} className="font-bold py-2.5 px-8 rounded-lg transition-opacity hover:opacity-80 w-full shadow-lg mt-auto" style={{ backgroundColor: theme.contornoHoje, color: '#000' }}>Process Raw Data</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center overflow-x-auto hide-scrollbar rounded-lg p-1.5 shadow-sm bg-transparent w-full" style={{ borderColor: theme.contornoGeral, borderWidth: settings.borderWidthGeral, borderStyle: 'solid', backgroundColor: hexToRgba(theme.fundoCards, settings.cardOpacity / 100) }}>
        {[
          { id: 'today', label: 'Today' },
          { id: 'tomorrow', label: 'Tomorrow' },
          { id: 'today_tomorrow', label: 'Today & Tomorrow' },
          { id: 'yesterday', label: 'Yesterday' },
          { id: 'this_week', label: 'This Week' },
          { id: 'next_week', label: 'Next Week' },
          { id: 'this_month', label: 'This Month' },
          { id: 'next_month', label: 'Next Month' },
          { id: 'all', label: 'All' }
        ].map(f => (
          <button key={f.id} onClick={() => setNewsFilter(f.id)} className="px-4 py-2 text-[10px] md:text-xs font-bold rounded-md transition-all whitespace-nowrap" style={{ backgroundColor: newsFilter === f.id ? hexToRgba(theme.fundoPrincipal, 0.8) : 'transparent', color: newsFilter === f.id ? theme.textoPrincipal : theme.textoSecundario }}>
            {f.label}
          </button>
        ))}
      </div>

      <div className="rounded-xl overflow-hidden w-full shadow-sm transition-all" style={getGlassStyle(theme.fundoCards)}>
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left text-[9px] sm:text-[10px] md:text-xs">
            <thead className="text-[9px] md:text-[10px] lg:text-xs tracking-wider font-bold" style={{ backgroundColor: hexToRgba(theme.fundoPrincipal, settings.cardOpacity / 100), color: theme.textoSecundario, borderBottomWidth: settings.borderWidthGeral, borderColor: theme.contornoGeral, borderBottomStyle: 'solid' }}>
              <tr>
                <th className="px-2 py-2 sm:px-3 sm:py-3 md:px-5 md:py-4 w-16 sm:w-28">Date & Time</th>
                <th className="px-1.5 py-2 sm:px-3 sm:py-3 md:px-5 md:py-4 w-10 sm:w-16 text-center">Cur.</th>
                <th className="px-1.5 py-2 sm:px-3 sm:py-3 md:px-5 md:py-4 w-8 sm:w-14 text-center">Imp.</th>
                <th className="px-2 py-2 sm:px-3 sm:py-3 md:px-5 md:py-4">Description</th>
                <th className="px-1.5 py-2 sm:px-3 sm:py-3 md:px-5 md:py-4 text-right w-14 sm:w-20">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredNewsList.map((n, index) => {
                const timeStr = (!n.time || n.time.toLowerCase() === 'all day') ? 'All Day' : n.time;

                return (
                  <tr key={n.id} className="transition-colors hover:bg-white/10" style={{ backgroundColor: index % 2 === 0 ? 'transparent' : 'rgba(128, 128, 128, 0.04)' }}>
                    <td className="px-2 py-2 sm:px-3 sm:py-3 md:px-5 md:py-4 font-mono text-[8px] sm:text-[9px] md:text-[10px] lg:text-xs whitespace-nowrap">
                      <div className="flex flex-col">
                        <span style={{ color: theme.textoPrincipal }}>{formatDate(n.date)}</span>
                        <span style={{ color: theme.textoSecundario }}>{timeStr}</span>
                      </div>
                    </td>
                    <td className="px-1.5 py-2 sm:px-3 sm:py-3 md:px-5 md:py-4 text-center font-bold align-middle text-[8px] sm:text-[9px] lg:text-xs" style={{ color: theme.textoPrincipal }}>
                      {n.currency}
                    </td>
                    <td className="px-1.5 py-2 sm:px-3 sm:py-3 md:px-5 md:py-4 text-center align-middle">
                      <div className="flex justify-center items-center w-full h-full" title={n.impact}>
                        <Folder size={isMobile ? 12 : 18} style={{ color: getImpactColor(n.impact) }} />
                      </div>
                    </td>
                    <td className="px-2 py-2 sm:px-3 sm:py-3 md:px-5 md:py-4 font-medium whitespace-normal break-words min-w-[80px] sm:min-w-[150px] align-middle text-[8px] sm:text-[9px] lg:text-xs" style={{ color: theme.textoPrincipal }}>
                      {n.description}
                    </td>
                    <td className="px-1.5 py-2 sm:px-3 sm:py-3 md:px-5 md:py-4 text-right align-middle">
                      <div className="flex justify-end gap-0.5 sm:gap-1">
                        <button onClick={() => { setEditNewsData(n); setIsNewsModalOpen(true); }} className="p-1 sm:p-1.5 md:p-2 rounded-md hover:bg-white/20 transition-colors" style={{ color: theme.textoSecundario }}><Edit2 size={isMobile ? 12 : 16} /></button>
                        <button onClick={async () => { await deleteNews(n.id); }} className="p-1 sm:p-1.5 md:p-2 rounded-md hover:bg-white/20 transition-colors" style={{ color: theme.textoSecundario }}><Trash2 size={isMobile ? 12 : 16} /></button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {filteredNewsList.length === 0 && (<tr><td colSpan="5" className="p-8 text-center italic" style={{ color: theme.textoSecundario }}>No news events found for this filter.</td></tr>)}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
