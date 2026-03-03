import React, { startTransition } from 'react';
import {
  Settings, Palette, Folder, Download, LayoutDashboard, ListIcon, ShieldAlert, Layers, Banknote, Target, TrendingUp, Monitor, Braces, User, CreditCard, Building2, Plus, Edit2, Trash2, CheckCircle2, Loader2
} from 'lucide-react';
import { hexToRgba, THEME_GROUPS } from '../../utils/constants';

export default function SettingsView({
  theme,
  getGlassStyle,
  settings,
  activeSettingsTab,
  setActiveSettingsTab,
  SearchableSelect,
  setSettings,
  CURRENCIES_LIST,
  TIMEZONES_LIST,
  setTheme,
  DEFAULT_THEME,
  DEFAULT_SETTINGS,
  THEME_GROUPS: themeGroups,
  handleResetAllData,
  isMobile,
  settingsHideTabs,
  accounts = [],
  activeAccountId,
  onCreateAccount,
  onEditAccount,
  onDeleteAccount,
  onSaveSettings,
  isSyncing = false,
  t = (k: string, _l?: string) => k,
  lang = 'en',
}) {
  const tg = themeGroups || THEME_GROUPS;

  return (
    <div key="settings" className="max-w-6xl space-y-6 mx-auto w-full animate-tab-enter">
      {!isMobile && (
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 p-4 rounded-xl shadow-sm transition-all" style={getGlassStyle(theme.fundoCards)}>
          <div>
            <h2 className="text-xl md:text-2xl font-bold font-display capitalize flex items-center gap-2" style={{ color: theme.textoPrincipal }}><Settings size={22} style={{ color: theme.textoSecundario }} /> {t('settings.title', lang)}</h2>
            <p className="text-xs md:text-sm mt-1" style={{ color: theme.textoSecundario }}>{t('settings.subtitle', lang)}</p>
          </div>
        </header>
      )}

      {/* Sub-Navegação por Abas (4 abas, estilo inline centralizado) */}
      {(!isMobile || !settingsHideTabs) && (
        <div className="flex justify-center overflow-x-auto no-scrollbar border-b" style={{ borderColor: theme.contornoGeral }}>
          {[
            { id: 'account', title: t('settings.account', lang), icon: Settings },
            { id: 'theme', title: t('settings.theme', lang), icon: Palette },
            { id: 'database', title: t('settings.database', lang), icon: Folder },
            { id: 'backup', title: t('settings.backup', lang), icon: Download }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => startTransition(() => setActiveSettingsTab(tab.id))}
              className={`flex items-center gap-2 px-5 py-3 text-xs font-bold transition-all whitespace-nowrap border-b-2 ${activeSettingsTab === tab.id ? '' : 'opacity-50 hover:opacity-80'}`}
              style={{
                backgroundColor: 'transparent',
                color: activeSettingsTab === tab.id ? theme.textoPrincipal : theme.textoSecundario,
                borderBottomColor: activeSettingsTab === tab.id ? theme.linhaGrafico : 'transparent'
              }}
            >
              <tab.icon size={14} />
              {tab.title}
            </button>
          ))}
        </div>
      )}

      <div className="animate-tab-enter">

        {/* ===== TAB 1: SETTINGS ACCOUNT (General Settings) ===== */}
        {activeSettingsTab === 'account' && (
          <div className="space-y-6 animate-opacity-enter">
            {/* General Settings - 4-column grid */}
            <div className="rounded-xl p-6 shadow-xl transition-all" style={getGlassStyle(theme.fundoCards)}>
              <h3 className="text-[15px] font-bold capitalize mb-4" style={{ color: theme.textoSecundario }}>{t('settings.general', lang)}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold" style={{ color: theme.textoSecundario }}>{t('settings.appLanguage', lang)}</label>
                  <select
                    className="w-full rounded-lg py-2.5 px-3 outline-none text-sm bg-transparent cursor-pointer"
                    style={{ borderColor: theme.contornoGeral, borderWidth: settings.borderWidthGeral || 1, borderStyle: 'solid', color: theme.textoPrincipal }}
                    value={settings.appLanguage || 'en'}
                    onChange={(e) => setSettings(prev => ({ ...prev, appLanguage: e.target.value }))}
                  >
                    <option value="en" className="bg-gray-800">English</option>
                    <option value="pt" className="bg-gray-800">Português</option>
                    <option value="es" className="bg-gray-800">Español</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold" style={{ color: theme.textoSecundario }}>{t('settings.dateFormat', lang)}</label>
                  <select
                    className="w-full rounded-lg py-2.5 px-3 outline-none text-sm bg-transparent cursor-pointer"
                    style={{ borderColor: theme.contornoGeral, borderWidth: settings.borderWidthGeral || 1, borderStyle: 'solid', color: theme.textoPrincipal }}
                    value={settings.dateFormat || 'BR'}
                    onChange={(e) => setSettings(prev => ({ ...prev, dateFormat: e.target.value }))}
                  >
                    <option value="BR" className="bg-gray-800">DD/MM/YYYY (BR)</option>
                    <option value="US" className="bg-gray-800">MM/DD/YYYY (US)</option>
                    <option value="ISO" className="bg-gray-800">YYYY-MM-DD (ISO)</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end mt-6 pt-4 border-t" style={{ borderColor: theme.contornoGeral }}>
                <button
                  onClick={onSaveSettings}
                  disabled={isSyncing}
                  className="px-6 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all hover:opacity-80 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: theme.linhaGrafico, color: '#fff' }}
                >
                  {isSyncing
                    ? <><Loader2 size={16} className="animate-spin" /> Saving...</>
                    : <><CheckCircle2 size={16} /> {t('settings.saveChanges', lang)}</>
                  }
                </button>
              </div>
            </div>

            {/* ===== Account Management (Replaces old Financial Parameters) ===== */}
            <div className="rounded-xl p-6 shadow-xl transition-all" style={getGlassStyle(theme.fundoCards)}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-[15px] font-bold flex items-center gap-2" style={{ color: theme.textoSecundario }}>
                  <Building2 size={18} /> {t('settings.manageAccounts', lang)}
                </h3>
                <button
                  onClick={onCreateAccount}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all hover:brightness-110 shadow-sm"
                  style={{ backgroundColor: '#facc15', color: '#121C30' }}
                >
                  <Plus size={16} /> {t('settings.newAccount', lang)}
                </button>
              </div>

              {accounts.length === 0 ? (
                <div className="text-center py-10 opacity-50 border-2 border-dashed rounded-xl" style={{ borderColor: theme.contornoGeral, color: theme.textoSecundario }}>
                  <p className="text-sm">{t('settings.noAccounts', lang)}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {accounts.map(acc => {
                    const isActive = acc.id === activeAccountId;
                    return (
                      <div
                        key={acc.id}
                        className={`relative rounded-xl p-5 border transition-all ${isActive ? 'border-yellow-500/60 bg-yellow-500/5' : 'border-white/10 hover:border-white/20'
                          }`}
                        style={{ backgroundColor: isActive ? hexToRgba('#facc15', 0.05) : hexToRgba(theme.fundoCards, 0.4) }}
                      >
                        {isActive && (
                          <div className="absolute top-3 right-3 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded-full">
                            <CheckCircle2 size={12} /> {t('settings.active', lang)}
                          </div>
                        )}
                        <h4 className="text-lg font-bold mb-1" style={{ color: isActive ? '#facc15' : theme.textoPrincipal }}>{acc.name}</h4>
                        <p className="text-xs mb-4 opacity-60" style={{ color: theme.textoSecundario }}>Balance: ${Number(acc.initialBalance).toLocaleString()} • Split: {acc.profitSplit}%</p>

                        <div className="flex gap-2 mt-auto pt-4 border-t border-white/10">
                          <button
                            onClick={() => onEditAccount(acc)}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-bold transition-all text-white/80"
                          >
                            <Edit2 size={14} /> {t('settings.edit', lang)}
                          </button>
                          <button
                            onClick={() => onDeleteAccount(acc.id)}
                            className="flex items-center justify-center p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all group"
                          >
                            <Trash2 size={16} className="group-hover:scale-110 transition-transform" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===== TAB 2: THEME ===== */}
        {activeSettingsTab === 'theme' && (
          <div className="space-y-6 animate-opacity-enter">

            {/* Dashboard Layout */}
            <div className="rounded-xl p-6 shadow-xl transition-all" style={getGlassStyle(theme.fundoCards)}>
              <h3 className="text-[15px] font-bold capitalize mb-4" style={{ color: theme.textoSecundario }}>{t('settings.dashboardLayout', lang)}</h3>
              <div className="max-w-sm">
                <select
                  className="w-full rounded-lg py-2.5 px-3 outline-none text-sm bg-transparent cursor-pointer"
                  style={{ borderColor: theme.contornoGeral, borderWidth: settings.borderWidthGeral, borderStyle: 'solid', color: theme.textoPrincipal }}
                  value={settings.dashboardLayout}
                  onChange={(e) => setSettings(prev => ({ ...prev, dashboardLayout: e.target.value }))}
                >
                  <option value="layout1" className="bg-gray-800">Layout 1 - Standard</option>
                  <option value="layout2" className="bg-gray-800">Layout 2 - Compact</option>
                  <option value="layout3" className="bg-gray-800">Layout 3 - Wide</option>
                </select>
              </div>
            </div>

            {/* Background & Glass Effect */}
            <div className="rounded-xl p-6 shadow-xl transition-all" style={getGlassStyle(theme.fundoCards)}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-[15px] font-bold capitalize flex items-center gap-2" style={{ color: theme.textoSecundario }}>
                  <Palette size={16} style={{ color: theme.textoSecundario }} /> {t('settings.backgroundGlass', lang)}
                </h3>
                <label className="flex items-center gap-2 cursor-pointer">
                  <span className="text-xs font-bold" style={{ color: theme.textoSecundario }}>{t('settings.enableGlass', lang)}</span>
                  <button
                    onClick={() => setSettings(prev => ({ ...prev, enableGlassEffect: !prev.enableGlassEffect }))}
                    className={`w-12 h-6 rounded-full transition-all relative ${settings.enableGlassEffect ? 'bg-green-500' : 'bg-gray-600'}`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${settings.enableGlassEffect ? 'left-6' : 'left-0.5'}`} />
                  </button>
                </label>
              </div>

              <div className="space-y-6">
                {/* Background Image Upload */}
                <div className="space-y-2">
                  <label className="text-xs font-bold" style={{ color: theme.textoSecundario }}>{t('settings.bgImageUpload', lang)}</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                          setTheme(prev => ({ ...prev, backgroundImage: ev.target?.result as string }));
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="w-full rounded-lg p-2.5 outline-none text-xs bg-transparent file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-500 file:text-white hover:file:bg-blue-600"
                    style={{ borderColor: theme.contornoGeral, borderWidth: settings.borderWidthGeral, borderStyle: 'solid', color: theme.textoPrincipal }}
                  />
                </div>

                {/* Card Opacity and Glass Blur */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold flex justify-between" style={{ color: theme.textoSecundario }}>
                      <span>{t('settings.cardOpacity', lang)}</span>
                      <span className="font-bold">{settings.cardOpacity}%</span>
                    </label>
                    <input
                      type="range" min="10" max="100" className="w-full accent-blue-500"
                      value={settings.cardOpacity}
                      onChange={(e) => setSettings(prev => ({ ...prev, cardOpacity: parseInt(e.target.value) }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold flex justify-between" style={{ color: theme.textoSecundario }}>
                      <span>{t('settings.glassBlur', lang)}</span>
                      <span className="font-bold">{settings.glassBlur}px</span>
                    </label>
                    <input
                      type="range" min="0" max="25" className="w-full accent-blue-500"
                      value={settings.glassBlur}
                      onChange={(e) => setSettings(prev => ({ ...prev, glassBlur: parseInt(e.target.value) }))}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Background Gradient */}
            <div className="rounded-xl p-6 shadow-xl transition-all" style={getGlassStyle(theme.fundoCards)}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-[15px] font-bold capitalize flex items-center gap-2" style={{ color: theme.textoSecundario }}>
                  <Palette size={16} style={{ color: theme.textoSecundario }} /> {t('settings.bgGradient', lang)}
                </h3>
                <label className="flex items-center gap-2 cursor-pointer">
                  <span className="text-xs font-bold" style={{ color: theme.textoSecundario }}>{t('settings.enableGradient', lang)}</span>
                  <button
                    onClick={() => setSettings(prev => ({ ...prev, enableGradient: !prev.enableGradient }))}
                    className={`w-12 h-6 rounded-full transition-all relative ${settings.enableGradient ? 'bg-green-500' : 'bg-gray-600'}`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${settings.enableGradient ? 'left-6' : 'left-0.5'}`} />
                  </button>
                </label>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold" style={{ color: theme.textoSecundario }}>{t('settings.gradientType', lang)}</label>
                    <select
                      className="w-full rounded-lg py-2.5 px-3 outline-none text-sm bg-transparent cursor-pointer"
                      style={{ borderColor: theme.contornoGeral, borderWidth: settings.borderWidthGeral, borderStyle: 'solid', color: theme.textoPrincipal }}
                      value={settings.gradientType}
                      onChange={(e) => setSettings(prev => ({ ...prev, gradientType: e.target.value }))}
                    >
                      <option value="linear" className="bg-gray-800">Linear (Angles)</option>
                      <option value="radial" className="bg-gray-800">Radial (Circle)</option>
                    </select>
                  </div>
                  {settings.gradientType === 'linear' && (
                    <div className="space-y-2">
                      <label className="text-xs font-bold flex justify-between" style={{ color: theme.textoSecundario }}>
                        <span>Angle Rotation (Top to Bottom, Left to Right, etc.)</span>
                        <span className="font-bold">{settings.gradientAngle}°</span>
                      </label>
                      <input
                        type="range" min="0" max="360" className="w-full accent-blue-500"
                        value={settings.gradientAngle}
                        onChange={(e) => setSettings(prev => ({ ...prev, gradientAngle: parseInt(e.target.value) }))}
                      />
                    </div>
                  )}
                </div>

                {/* Gradient Colors */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {[
                    { key: 'gradColor1', label: 'Color 1 (Start/Top/Left)' },
                    { key: 'gradColor2', label: 'Color 2 (Middle)' },
                    { key: 'gradColor3', label: 'Color 3 (End/Bottom/Right)' }
                  ].map(c => (
                    <div key={c.key} className="space-y-2">
                      <label className="text-xs font-bold" style={{ color: theme.textoSecundario }}>{c.label}</label>
                      <div className="flex items-center gap-3 p-2 rounded-lg border" style={{ borderColor: theme.contornoGeral }}>
                        <input
                          type="color"
                          value={theme[c.key] || '#000000'}
                          onChange={(e) => setTheme(prev => ({ ...prev, [c.key]: e.target.value }))}
                          className="w-8 h-8 rounded-lg cursor-pointer border-0"
                        />
                        <span className="text-xs font-mono" style={{ color: theme.textoSecundario }}>{theme[c.key] || '#000000'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Theme Customization */}
            <div className="rounded-xl p-6 shadow-xl transition-all" style={getGlassStyle(theme.fundoCards)}>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <h3 className="text-[15px] font-bold capitalize flex items-center gap-2" style={{ color: theme.textoSecundario }}>
                  <Palette size={16} style={{ color: theme.textoSecundario }} /> {t('settings.themeCustomization', lang)}
                </h3>
                <button
                  onClick={() => { setTheme(DEFAULT_THEME); setSettings(prev => ({ ...prev, ...DEFAULT_SETTINGS })); }}
                  className="px-4 py-2 rounded-lg text-xs font-bold transition-all hover:opacity-80"
                  style={{ backgroundColor: theme.linhaGrafico, color: '#fff' }}
                >
                  {t('settings.restoreDefault', lang)}
                </button>
              </div>

              {/* Border Thickness */}
              <div className="mb-8">
                <h4 className="text-sm font-bold mb-4" style={{ color: theme.textoSecundario }}>{t('settings.borderThickness', lang)}</h4>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                  {[
                    { key: 'borderWidthGeral', label: t('border.general', lang) },
                    { key: 'borderWidthHoje', label: t('border.today', lang) },
                    { key: 'borderWidthFeriado', label: t('border.holiday', lang) },
                    { key: 'borderWidthPositivo', label: t('border.positive', lang) },
                    { key: 'borderWidthNegativo', label: t('border.negative', lang) }
                  ].map(b => (
                    <div key={b.key} className="space-y-1">
                      <label className="text-[10px] font-bold" style={{ color: theme.textoSecundario }}>{b.label}</label>
                      <input
                        type="number" min="0" max="5"
                        className="w-full rounded-lg py-2 px-3 text-center text-sm outline-none bg-transparent"
                        style={{ borderColor: theme.contornoGeral, borderWidth: settings.borderWidthGeral, borderStyle: 'solid', color: theme.textoPrincipal }}
                        value={settings[b.key]}
                        onChange={(e) => setSettings(prev => ({ ...prev, [b.key]: parseInt(e.target.value) || 0 }))}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Color Groups */}
              {tg.map(group => (
                <div key={group.name} className="mb-8">
                  <h4 className="text-sm font-bold mb-4" style={{ color: theme.textoSecundario }}>{group.name}</h4>
                  <div className="rounded-xl overflow-hidden border" style={{ borderColor: theme.contornoGeral }}>
                    {group.keys.map((colorKey, idx) => (
                      <div
                        key={colorKey}
                        className="flex items-center justify-between p-4 transition-colors hover:bg-white/5"
                        style={{ backgroundColor: idx % 2 === 0 ? 'transparent' : 'rgba(128,128,128,0.04)' }}
                      >
                        <span className="text-sm font-medium capitalize" style={{ color: theme.textoPrincipal }}>
                          {colorKey.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}
                        </span>
                        <div className="flex items-center gap-4">
                          <span className="text-xs font-mono" style={{ color: theme.textoSecundario }}>{theme[colorKey]}</span>
                          <div className="relative">
                            <div className="w-8 h-8 rounded-lg shadow-inner border" style={{ backgroundColor: theme[colorKey], borderColor: theme.contornoGeral }} />
                            <input
                              type="color"
                              value={theme[colorKey]}
                              onChange={(e) => setTheme(prev => ({ ...prev, [colorKey]: e.target.value }))}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Save Changes button for Theme tab */}
            <div className="flex justify-end pt-2">
              <button
                onClick={onSaveSettings}
                disabled={isSyncing}
                className="px-6 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all hover:opacity-80 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: theme.linhaGrafico, color: '#fff' }}
              >
                {isSyncing
                  ? <><Loader2 size={16} className="animate-spin" /> Saving...</>
                  : <><CheckCircle2 size={16} /> {t('settings.saveChanges', lang)}</>
                }
              </button>
            </div>
          </div>
        )}

        {/* ===== TAB 3: DATABASE ===== */}
        {activeSettingsTab === 'database' && (
          <div className="space-y-6 animate-opacity-enter">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Export */}
              <div className="rounded-xl p-6 shadow-xl transition-all flex flex-col items-center text-center" style={getGlassStyle(theme.fundoCards)}>
                <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: hexToRgba(theme.linhaGrafico, 0.15) }}>
                  <Download size={28} style={{ color: theme.linhaGrafico }} />
                </div>
                <h3 className="text-[15px] font-bold capitalize mb-2" style={{ color: theme.textoSecundario }}>{t('settings.exportJson', lang)}</h3>
                <p className="text-xs mb-6 opacity-60" style={{ color: theme.textoSecundario }}>{t('settings.exportJsonDesc', lang)}</p>
                <button className="px-6 py-2.5 rounded-lg text-sm font-bold transition-all hover:opacity-80" style={{ backgroundColor: theme.linhaGrafico, color: '#fff' }}>Export JSON</button>
              </div>
              {/* Import */}
              <div className="rounded-xl p-6 shadow-xl transition-all flex flex-col items-center text-center" style={getGlassStyle(theme.fundoCards)}>
                <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: hexToRgba('#EAB308', 0.15) }}>
                  <Folder size={28} style={{ color: '#EAB308' }} />
                </div>
                <h3 className="text-[15px] font-bold capitalize mb-2" style={{ color: theme.textoSecundario }}>{t('settings.importJson', lang)}</h3>
                <p className="text-xs mb-6 opacity-60" style={{ color: theme.textoSecundario }}>{t('settings.importJsonDesc', lang)}</p>
                <button className="px-6 py-2.5 rounded-lg text-sm font-bold transition-all hover:opacity-80" style={{ backgroundColor: '#EAB308', color: '#000' }}>Upload JSON File</button>
              </div>
            </div>
          </div>
        )}

        {/* ===== TAB 4: BACKUP & PORTABLE APP ===== */}
        {activeSettingsTab === 'backup' && (
          <div className="space-y-6 animate-opacity-enter">
            <div className="rounded-xl p-6 shadow-xl transition-all" style={getGlassStyle(theme.fundoCards)}>
              <h3 className="text-[15px] font-bold capitalize mb-4" style={{ color: theme.textoSecundario }}>{t('settings.backupTitle', lang)}</h3>
              <p className="text-sm opacity-60 mb-6" style={{ color: theme.textoSecundario }}>{t('settings.backupDesc', lang)}</p>
              <div className="flex gap-4">
                <button className="flex-1 p-4 rounded-xl border transition-all hover:bg-white/5 flex flex-col items-center gap-2" style={{ borderColor: theme.contornoGeral }}>
                  <Download size={24} style={{ color: theme.linhaGrafico }} />
                  <span className="text-xs font-bold" style={{ color: theme.textoPrincipal }}>{t('settings.exportData', lang)}</span>
                </button>
                <button className="flex-1 p-4 rounded-xl border transition-all hover:bg-white/5 flex flex-col items-center gap-2" style={{ borderColor: theme.contornoGeral }}>
                  <Folder size={24} style={{ color: theme.linhaGrafico }} />
                  <span className="text-xs font-bold" style={{ color: theme.textoPrincipal }}>{t('settings.importBackup', lang)}</span>
                </button>
              </div>
            </div>
          </div>
        )}


      </div>
    </div >
  );
}
