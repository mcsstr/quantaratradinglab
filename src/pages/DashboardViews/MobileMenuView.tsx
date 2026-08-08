import React, { startTransition } from 'react';
import {
    User, Palette, Folder, Download, LogOut, ChevronRight, Menu as MenuIcon
} from 'lucide-react';
import { supabase } from '../../utils/supabase';
import { t as tFunc } from '../../utils/i18n';

export default function MobileMenuView({
    theme,
    getGlassStyle,
    settings,
    setActiveTab,
    setActiveSettingsTab,
    setSettingsHideTabs,
    setShowLogoutConfirm,
    setPrevTab,
    activeTab,
    t: tProp,
    lang = 'en'
}: any) {
    const t = tProp || ((k: string) => tFunc(k, lang));

    return (
        <div key="mobile_menu" className="space-y-6 pb-20 animate-tab-enter max-w-md mx-auto w-full pt-4">
            {/* Main Pages */}
            <div className="space-y-3">
                <button
                    onClick={() => {
                        startTransition(() => {
                            setPrevTab(activeTab);
                            setActiveTab('setups');
                        });
                    }}
                    className="w-full flex items-center justify-between p-4 rounded-xl shadow-xl transition-all border border-white/5 active:scale-[0.98]"
                    style={getGlassStyle(theme.fundoCards)}
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg" style={{ backgroundColor: theme.linhaGrafico + '15', color: theme.linhaGrafico }}>
                            <Folder size={20} />
                        </div>
                        <span className="font-bold text-sm" style={{ color: theme.textoPrincipal }}>{t('nav.setups')}</span>
                    </div>
                    <ChevronRight size={18} style={{ color: theme.textoSecundario }} />
                </button>
            </div>

            {/* Settings Options */}
            <div className="space-y-3">
                {[
                    { id: 'account', title: t('settings.account'), icon: User, tab: 'settings' },
                    { id: 'theme', title: t('settings.theme'), icon: Palette, tab: 'settings' },
                    { id: 'database', title: t('settings.database'), icon: Folder, tab: 'settings' },
                    { id: 'backup', title: t('settings.backup'), icon: Download, tab: 'settings' }
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

                {/* Logout Button */}
                <button
                    onClick={async () => {
                        if (typeof (window as any).quantaraLogout === 'function') {
                            await (window as any).quantaraLogout();
                        } else {
                            try {
                                sessionStorage.clear();
                                localStorage.removeItem('quantara_auth_token');
                                await supabase.auth.signOut();
                            } catch (err) {
                                console.error('Error logging out:', err);
                            } finally {
                                window.location.href = '/';
                            }
                        }
                    }}
                    className="w-full flex items-center justify-between p-4 rounded-xl shadow-xl transition-all border border-red-500/20 active:scale-[0.98] bg-red-500/10"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-red-500/20 text-red-400">
                            <LogOut size={20} />
                        </div>
                        <span className="font-bold text-sm text-red-400">
                            {t('dash.profile.logout')}
                        </span>
                    </div>
                    <ChevronRight size={18} className="text-red-400" />
                </button>
            </div>
        </div>
    );
}
