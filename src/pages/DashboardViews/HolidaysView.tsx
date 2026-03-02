import { CalendarDays, Trash2, Edit2, Plus, Search, Check, X } from '../../components/Icons';

const SectionTitle = ({ icon: Icon, title, theme }) => (
  <div className="flex items-center gap-2 mb-4">
    <Icon size={16} style={{ color: theme.textoSecundario }} />
    <span className="text-[15px] font-bold capitalize" style={{ color: theme.textoSecundario }}>{title}</span>
  </div>
);
import { hexToRgba } from '../../utils/constants';

export default function HolidaysView({
  theme,
  getGlassStyle,
  settings,
  holidaySortOrder,
  setHolidaySortOrder,
  newHoliday,
  setNewHoliday,
  addHoliday,
  holidays,
  editingHoliday,
  setEditingHoliday,
  editHolidayData,
  setEditHolidayData,
  formatDate,
  setHolidays,
  isMobile
}) {
  return (
    <div key="holidays" className="max-w-4xl space-y-6 mx-auto w-full animate-tab-enter">
      {!isMobile && (
        <header className="flex flex-col md:flex-row justify-between p-4 rounded-xl shadow-sm transition-all" style={getGlassStyle(theme.fundoCards)}>
          <div>
            <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2"><CalendarDays size={24} style={{ color: theme.contornoFeriado }} /> Manage Holidays</h2>
            <p className="text-xs md:text-sm mt-1" style={{ color: theme.textoSecundario }}>Registered dates here will have a highlighted border in the calendar.</p>
          </div>
          <div className="flex rounded-lg p-0.5 shadow-sm bg-transparent mt-4 md:mt-0 h-fit" style={{ borderColor: theme.contornoGeral, borderWidth: settings.borderWidthGeral, borderStyle: 'solid' }}>
            <button onClick={() => setHolidaySortOrder('recent')} className="px-3 py-1.5 text-[10px] md:text-xs font-bold rounded-md transition-all" style={{ backgroundColor: holidaySortOrder === 'recent' ? hexToRgba(theme.fundoPrincipal, 0.5) : 'transparent', color: holidaySortOrder === 'recent' ? theme.textoPrincipal : theme.textoSecundario }}>Recent</button>
            <button onClick={() => setHolidaySortOrder('oldest')} className="px-3 py-1.5 text-[10px] md:text-xs font-bold rounded-md transition-all" style={{ backgroundColor: holidaySortOrder === 'oldest' ? hexToRgba(theme.fundoPrincipal, 0.5) : 'transparent', color: holidaySortOrder === 'oldest' ? theme.textoPrincipal : theme.textoSecundario }}>Oldest</button>
          </div>
        </header>
      )}
      <div className="w-full">
        {/* Add New Holiday */}
        <div className="rounded-xl p-6 shadow-xl transition-all" style={getGlassStyle(theme.fundoCards)}>
          <SectionTitle
            icon={Plus}
            title="Register Holiday"
            theme={theme}
          />
          <div className="flex flex-col md:flex-row items-end gap-4 w-full">
            <div className="space-y-2 w-full md:w-1/4"><label className="text-[10px] md:text-xs font-bold" style={{ color: theme.textoSecundario }}>Holiday Date</label><input type="date" className="w-full rounded-lg p-2.5 outline-none text-xs md:text-sm bg-transparent" style={{ borderColor: theme.contornoGeral, borderWidth: settings.borderWidthGeral, borderStyle: 'solid', color: theme.textoPrincipal }} value={newHoliday.date} onChange={e => setNewHoliday({ ...newHoliday, date: e.target.value })} /></div>
            <div className="space-y-2 w-full md:w-1/2"><label className="text-[10px] md:text-xs font-bold" style={{ color: theme.textoSecundario }}>Description</label><input type="text" className="w-full rounded-lg p-2.5 outline-none text-xs md:text-sm bg-transparent" placeholder="Ex: Memorial Day..." style={{ borderColor: theme.contornoGeral, borderWidth: settings.borderWidthGeral, borderStyle: 'solid', color: theme.textoPrincipal }} value={newHoliday.description} onChange={e => setNewHoliday({ ...newHoliday, description: e.target.value })} /></div>
            <button onClick={addHoliday} className="py-2.5 px-6 rounded-lg flex items-center justify-center gap-2 text-sm font-bold transition-opacity hover:opacity-80 w-full md:w-1/4 shadow-md h-[42px]" style={{ backgroundColor: theme.linhaGrafico, color: '#fff' }}><Plus size={18} /> Save Holiday</button>
          </div>
        </div>
      </div>
      <div className="rounded-xl overflow-hidden w-full mx-auto shadow-sm transition-all" style={getGlassStyle(theme.fundoCards)}>
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left text-[9px] sm:text-[10px] md:text-xs whitespace-nowrap">
            <thead className="text-[9px] sm:text-[10px] md:text-xs tracking-wider font-bold" style={{ backgroundColor: hexToRgba(theme.fundoPrincipal, settings.cardOpacity / 100), color: theme.textoSecundario, borderBottomWidth: settings.borderWidthGeral, borderColor: theme.contornoGeral, borderBottomStyle: 'solid' }}>
              <tr>
                <th className="px-3 py-3 md:px-5 md:py-4 w-24 sm:w-32">Date</th>
                <th className="px-3 py-3 md:px-5 md:py-4">Description</th>
                <th className="px-3 py-3 md:px-5 md:py-4 text-right w-16 sm:w-20">Action</th>
              </tr>
            </thead>
            <tbody>
              {[...holidays].sort((a, b) => holidaySortOrder === 'recent' ? new Date(b.date).getTime() - new Date(a.date).getTime() : new Date(a.date).getTime() - new Date(b.date).getTime()).map((h, index) => {
                const isEditingHoliday = editingHoliday === h.id;
                return (
                  <tr key={h.id} className="transition-colors hover:bg-white/10" style={{ backgroundColor: index % 2 === 0 ? 'transparent' : 'rgba(128, 128, 128, 0.04)' }}>
                    <td className="px-3 py-3 md:px-5 md:py-4 font-mono text-[9px] sm:text-[10px] md:text-xs">
                      {isEditingHoliday ? <input type="date" className="bg-transparent border-b outline-none text-[9px] sm:text-[10px] md:text-xs w-[90px] md:w-[110px]" style={{ borderColor: theme.contornoGeral, color: theme.textoPrincipal }} value={editHolidayData.date} onChange={e => setEditHolidayData({ ...editHolidayData, date: e.target.value })} /> : formatDate(h.date)}
                    </td>
                    <td className="px-3 py-3 md:px-5 md:py-4 font-medium whitespace-normal break-words min-w-[120px] sm:min-w-[200px] text-[9px] sm:text-[10px] md:text-xs" style={{ color: theme.contornoFeriado }}>
                      {isEditingHoliday ? <input type="text" className="bg-transparent border-b outline-none w-full text-[9px] sm:text-[10px] md:text-xs" style={{ borderColor: theme.contornoGeral, color: theme.textoPrincipal }} value={editHolidayData.description} onChange={e => setEditHolidayData({ ...editHolidayData, description: e.target.value })} /> : h.description}
                    </td>
                    <td className="px-3 py-3 md:px-5 md:py-4 text-right flex justify-end gap-1">
                      {isEditingHoliday ? (
                        <>
                          <button onClick={() => { setHolidays(holidays.map(item => item.id === h.id ? editHolidayData : item)); setEditingHoliday(null); }} className="p-1 sm:p-1.5 rounded-md hover:bg-green-500/20 text-green-500"><Check size={isMobile ? 12 : 16} /></button>
                          <button onClick={() => setEditingHoliday(null)} className="p-1 sm:p-1.5 rounded-md hover:bg-red-500/20 text-red-500"><X size={isMobile ? 12 : 16} /></button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => { setEditingHoliday(h.id); setEditHolidayData(h); }} className="p-1 sm:p-1.5 md:p-2 rounded-md transition-colors hover:bg-white/20" style={{ color: theme.textoSecundario }}><Edit2 size={isMobile ? 12 : 14} /></button>
                          <button onClick={() => setHolidays(holidays.filter(item => item.id !== h.id))} className="p-1 sm:p-1.5 md:p-2 rounded-md hover:bg-white/20" style={{ color: theme.textoSecundario }}><Trash2 size={isMobile ? 12 : 16} /></button>
                        </>
                      )}
                    </td>
                  </tr>
                )
              })}
              {holidays.length === 0 && (<tr><td colSpan="4" className="p-8 text-center italic" style={{ color: theme.textoSecundario }}>No holidays added.</td></tr>)}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
