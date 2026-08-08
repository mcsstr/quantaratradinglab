import React from 'react';
import { Newspaper, Trash2, Edit2, Plus, ListIcon, Folder } from '../../components/Icons';
import { Globe, ListFilter } from 'lucide-react';
import { hexToRgba } from '../../utils/constants';
import { t as tFunc } from '../../utils/i18n';
import { TradingViewEconomicCalendar } from '../../components/TradingViewWidgets';

const SectionTitle = ({ icon: Icon, title, theme }: any) => (
  <div className="flex items-center gap-2 mb-4">
    <Icon size={16} style={{ color: theme.textoSecundario }} />
    <span className="text-[15px] font-bold capitalize" style={{ color: theme.textoSecundario }}>{title}</span>
  </div>
);

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
  deleteNews,
  t: tProp,
  lang = 'en'
}: any) {
  const t = tProp || ((k: string) => tFunc(k, lang));
  const [isAddNewsOpen, setIsAddNewsOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<'live' | 'custom'>('live');

  return (
    <div key="news" className="max-w-4xl space-y-6 mx-auto w-full animate-tab-enter">
      <header className="flex flex-col lg:flex-row justify-between lg:items-center gap-4 p-2 rounded-xl transition-all bg-transparent">
        <div className="flex items-center gap-3 shrink-0 mb-2">
          <Newspaper size={26} className="text-yellow-500" />
          <h1 className="text-2xl md:text-3xl font-black font-display tracking-tight whitespace-nowrap" style={{ color: theme.textoPrincipal }}>
            {t('news.title')}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {/* Tab switcher: Live TradingView vs Custom Events */}
          <div className="flex items-center p-1 rounded-xl bg-black/30 border border-white/5">
            <button
              onClick={() => setActiveTab('live')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeTab === 'live' ? 'bg-amber-500 text-black shadow-md' : 'text-white/60 hover:text-white'
              }`}
            >
              <Globe size={13} />
              <span>{t('widget.liveCalendar')}</span>
            </button>
            <button
              onClick={() => setActiveTab('custom')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeTab === 'custom' ? 'bg-amber-500 text-black shadow-md' : 'text-white/60 hover:text-white'
              }`}
            >
              <ListFilter size={13} />
              <span>{t('widget.customEvents')}</span>
            </button>
          </div>

          {activeTab === 'custom' && !isAddNewsOpen && (
            <button onClick={() => setIsAddNewsOpen(true)} className="py-2 px-5 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-opacity hover:opacity-80 shadow-md h-[36px]" style={{ backgroundColor: theme.linhaGrafico, color: '#fff' }}>
              <Plus size={16} /> {t('news.addNews')}
            </button>
          )}
        </div>
      </header>

      {/* TAB 1: Live Real-time Calendar */}
      {activeTab === 'live' && (
        <div className="rounded-2xl overflow-hidden p-4 shadow-xl transition-all border min-h-[600px] flex flex-col" style={{ ...getGlassStyle(theme.fundoCards), borderColor: theme.contornoGeral }}>
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-2">
              <Globe size={16} className="text-amber-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">{t('widget.liveFeed')}</span>
            </div>
            <span className="text-[10px] opacity-40 uppercase font-mono" style={{ color: theme.textoPrincipal }}>Real-Time Global Feed</span>
          </div>
          <div className="flex-1 w-full min-h-[540px]">
            <TradingViewEconomicCalendar lang={lang} height={540} />
          </div>
        </div>
      )}

      {/* TAB 2: Custom / Registered News */}
      {activeTab === 'custom' && (
        <div className="space-y-6">
          {isAddNewsOpen && (
            <div className="flex flex-col gap-4 animate-fade-in relative z-10">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-lg" style={{ color: theme.textoPrincipal }}>{t('news.addEvent')}</h3>
                <button onClick={() => setIsAddNewsOpen(false)} className="px-4 py-2 text-xs md:text-sm font-bold rounded-lg hover:bg-white/10 transition-colors" style={{ color: theme.textoSecundario }}>{t('accountForm.cancel')}</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Register Economic News */}
                <div className="rounded-xl p-4 md:p-6 shadow-xl transition-all flex flex-col" style={getGlassStyle(theme.fundoCards)}>
                  <SectionTitle
                    icon={Plus}
                    title={t('news.register')}
                    theme={theme}
                  />
                  <div className="space-y-4 flex-1 flex flex-col">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1"><label className="text-[10px] font-bold" style={{ color: theme.textoSecundario }}>{t('news.date')}</label><input type="date" className="w-full rounded-lg p-2.5 outline-none text-xs bg-transparent" style={{ borderColor: theme.contornoGeral, borderWidth: settings.borderWidthGeral, borderStyle: 'solid', color: theme.textoPrincipal }} value={newNewsItem.date} onChange={e => setNewNewsItem({ ...newNewsItem, date: e.target.value })} /></div>
                      <div className="space-y-1"><label className="text-[10px] font-bold" style={{ color: theme.textoSecundario }}>{t('news.time')}</label><input type="text" placeholder="Ex: 14:30 or All Day" className="w-full rounded-lg p-2.5 outline-none text-xs bg-transparent" style={{ borderColor: theme.contornoGeral, borderWidth: settings.borderWidthGeral, borderStyle: 'solid', color: theme.textoPrincipal }} value={newNewsItem.time} onChange={e => setNewNewsItem({ ...newNewsItem, time: e.target.value })} /></div>
                      <div className="space-y-1"><label className="text-[10px] font-bold" style={{ color: theme.textoSecundario }}>{t('news.currency')}</label><input type="text" placeholder="Ex: USD, EUR..." className="w-full rounded-lg p-2.5 outline-none text-xs bg-transparent uppercase" style={{ borderColor: theme.contornoGeral, borderWidth: settings.borderWidthGeral, borderStyle: 'solid', color: theme.textoPrincipal }} value={newNewsItem.currency} onChange={e => setNewNewsItem({ ...newNewsItem, currency: e.target.value.toUpperCase() })} /></div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold" style={{ color: theme.textoSecundario }}>{t('news.impact')}</label>
                        <select className="w-full rounded-lg p-2.5 outline-none text-xs cursor-pointer bg-transparent" style={{ borderColor: theme.contornoGeral, borderWidth: settings.borderWidthGeral, borderStyle: 'solid', color: theme.textoPrincipal }} value={newNewsItem.impact} onChange={e => setNewNewsItem({ ...newNewsItem, impact: e.target.value })}>
                          <option value="High" className="bg-gray-800">{t('news.highImpact')}</option>
                          <option value="Medium" className="bg-gray-800">{t('news.medImpact')}</option>
                          <option value="Low" className="bg-gray-800">{t('news.lowImpact')}</option>
                          <option value="Holiday" className="bg-gray-800">{t('news.bankHoliday')}</option>
                        </select>
                      </div>

                      <div className="space-y-1 sm:col-span-2"><label className="text-[10px] font-bold" style={{ color: theme.textoSecundario }}>{t('news.description')}</label><input type="text" placeholder={t('news.descPlaceholder')} className="w-full rounded-lg p-2.5 outline-none text-xs bg-transparent" style={{ borderColor: theme.contornoGeral, borderWidth: settings.borderWidthGeral, borderStyle: 'solid', color: theme.textoPrincipal }} value={newNewsItem.description} onChange={e => setNewNewsItem({ ...newNewsItem, description: e.target.value })} /></div>
                    </div>

                    <button onClick={handleAddNews} className="py-2.5 px-8 rounded-lg flex items-center justify-center gap-2 text-sm font-bold transition-opacity hover:opacity-80 w-full shadow-md mt-auto" style={{ backgroundColor: theme.linhaGrafico, color: '#fff' }}><Plus size={18} /> {t('news.addEventBtn')}</button>
                  </div>
                </div>

                {/* RAW TEXT IMPORT CARD */}
                <div className="rounded-xl p-4 md:p-6 shadow-xl transition-all flex flex-col" style={getGlassStyle(theme.fundoCards)}>
                  <div>
                    <SectionTitle
                      icon={ListIcon}
                      title={t('news.rawTextImport')}
                      theme={theme}
                    />
                    <p className="text-[10px] opacity-60 mb-4" style={{ color: theme.textoSecundario }}>{t('news.rawTextHelper')}</p>
                  </div>
                  <div className="flex flex-col gap-4 flex-1">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold" style={{ color: theme.textoSecundario }}>{t('news.generalImpact')}</label>
                      <select className="w-full rounded-lg p-2.5 outline-none text-xs cursor-pointer bg-transparent" style={{ borderColor: theme.contornoGeral, borderWidth: settings.borderWidthGeral, borderStyle: 'solid', color: theme.textoPrincipal }} value={newsImportImpact} onChange={e => setNewsImportImpact(e.target.value)}>
                        <option value="High" className="bg-gray-800">{t('news.highImpact')}</option>
                        <option value="Medium" className="bg-gray-800">{t('news.medImpact')}</option>
                        <option value="Low" className="bg-gray-800">{t('news.lowImpact')}</option>
                        <option value="Holiday" className="bg-gray-800">{t('news.bankHoliday')}</option>
                      </select>
                    </div>
                    <textarea className="w-full flex-1 min-h-[120px] rounded-lg p-3 font-mono text-[10px] outline-none shadow-sm transition-all bg-transparent" style={{ borderColor: theme.contornoGeral, borderWidth: settings.borderWidthGeral, borderStyle: 'solid', color: theme.textoPrincipal }} placeholder={"Sun Feb 1\nMon Feb 2\n10:00\nUSD\nISM Manufacturing PMI"} value={newsImportText} onChange={e => setNewsImportText(e.target.value)} />
                    <button onClick={handleImportNews} className="font-bold py-2.5 px-8 rounded-lg transition-opacity hover:opacity-80 w-full shadow-lg mt-auto" style={{ backgroundColor: theme.contornoHoje, color: '#000' }}>{t('news.importNews')}</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center overflow-x-auto hide-scrollbar rounded-lg p-1.5 shadow-sm bg-transparent w-full" style={{ borderColor: theme.contornoGeral, borderWidth: settings.borderWidthGeral, borderStyle: 'solid', backgroundColor: hexToRgba(theme.fundoCards, settings.cardOpacity / 100) }}>
            {[
              { id: 'today', label: t('dash.today') },
              { id: 'tomorrow', label: t('filter.tomorrow') },
              { id: 'today_tomorrow', label: t('filter.todayTomorrow') },
              { id: 'yesterday', label: t('dash.yesterday') },
              { id: 'this_week', label: t('dash.thisWeek') },
              { id: 'next_week', label: t('filter.nextWeek') },
              { id: 'this_month', label: t('dash.thisMonth') },
              { id: 'next_month', label: t('filter.nextMonth') },
              { id: 'all', label: t('dash.all') }
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
                    <th className="px-2 py-2 sm:px-3 sm:py-3 md:px-5 md:py-4 w-16 sm:w-28">{t('news.date')} & {t('news.time')}</th>
                    <th className="px-1.5 py-2 sm:px-3 sm:py-3 md:px-5 md:py-4 w-10 sm:w-16 text-center">{t('news.currency')}</th>
                    <th className="px-1.5 py-2 sm:px-3 sm:py-3 md:px-5 md:py-4 w-8 sm:w-14 text-center">{t('news.impact')}</th>
                    <th className="px-2 py-2 sm:px-3 sm:py-3 md:px-5 md:py-4">{t('news.description')}</th>
                    <th className="px-1.5 py-2 sm:px-3 sm:py-3 md:px-5 md:py-4 text-right w-14 sm:w-20">{t('news.action')}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredNewsList.map((n: any, index: number) => {
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
                    );
                  })}
                  {filteredNewsList.length === 0 && (<tr><td colSpan={5} className="p-8 text-center italic" style={{ color: theme.textoSecundario }}>{t('news.noNews')}</td></tr>)}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
