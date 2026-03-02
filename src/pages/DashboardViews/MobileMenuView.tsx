import React, { startTransition } from 'react';
import {
    User, Palette, Folder, Download, LogOut, ChevronRight, Menu as MenuIcon
} from 'lucide-react';

export default function MobileMenuView({
    theme,
    getGlassStyle,
    settings,
    setActiveTab,
    setActiveSettingsTab,
    setSettingsHideTabs,
    setShowLogoutConfirm,
    setPrevTab,
    activeTab
}) {
    return (
        <div key="mobile_menu" className="space-y-6 pb-20 animate-tab-enter max-w-md mx-auto w-full">
            {/* Settings Options */}
            <div className="space-y-3">
                {[
                    { id: 'account', title: 'Settings Account', icon: User, tab: 'settings' },
                    { id: 'theme', title: 'Theme Settings', icon: Palette, tab: 'settings' },
                    { id: 'database', title: 'Database Settings', icon: Folder, tab: 'settings' },
                    { id: 'backup', title: 'Backup Settings', icon: Download, tab: 'settings' }
                ].map((item) => (
                    <button
                        key={item.id}
                        onClick={() => {
                            startTransition(() => {
                                setPrevTab(activeTab);
                                setActiveSettingsTab(item.id);
                                setSettingsHideTabs(true);
                                setActiveTab('settings');
                            });
                        }}
                        className="w-full flex items-center justify-between p-4 rounded-xl shadow-xl transition-all border border-white/5 active:scale-[0.98]"
                        style={getGlassStyle(theme.fundoCards)}
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg" style={{ backgroundColor: theme.linhaGrafico + '15', color: theme.linhaGrafico }}>
                                <item.icon size={20} />
                            </div>
                            <span className="font-bold text-sm" style={{ color: theme.textoPrincipal }}>{item.title}</span>
                        </div>
                        <ChevronRight size={18} style={{ color: theme.textoSecundario }} />
                    </button>
                ))}

            </div>
        </div>
    );
}
