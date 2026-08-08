import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  Check, 
  Loader2, 
  Shield, 
  Activity, 
  ChevronDown,
  User,
  CreditCard,
  Lock
} from 'lucide-react';
import { supabase } from '../utils/supabase';
import { getStoredLanguage, setStoredLanguage, t as tFunc, type Lang } from '../utils/i18n';
import './Dashboard.css';

// Real Vector SVG Flags
const FlagUS = ({ className = "w-5 h-3.5" }: { className?: string }) => (
  <span className={`${className} inline-flex items-center justify-center rounded-[3px] overflow-hidden shadow-sm shrink-0 border border-white/20`}>
    <svg className="w-full h-full object-cover" viewBox="0 0 640 480">
      <g fillRule="evenodd">
        <path fill="#bd3d44" d="M0 0h640v480H0z"/>
        <path stroke="#fff" strokeWidth="37" d="M0 55.4h640M0 129.2h640M0 203h640M0 277h640M0 350.8h640M0 424.6h640"/>
        <path fill="#192f5d" d="M0 0h260v259H0z"/>
        <g fill="#fff">
          <circle cx="26" cy="24" r="8"/><circle cx="78" cy="24" r="8"/><circle cx="130" cy="24" r="8"/><circle cx="182" cy="24" r="8"/><circle cx="234" cy="24" r="8"/>
          <circle cx="52" cy="48" r="8"/><circle cx="104" cy="48" r="8"/><circle cx="156" cy="48" r="8"/><circle cx="208" cy="48" r="8"/>
        </g>
      </g>
    </svg>
  </span>
);

const FlagBR = ({ className = "w-5 h-3.5" }: { className?: string }) => (
  <span className={`${className} inline-flex items-center justify-center rounded-[3px] overflow-hidden shadow-sm shrink-0 border border-white/20`}>
    <svg className="w-full h-full object-cover" viewBox="0 0 640 480">
      <path fill="#009c3b" d="M0 0h640v480H0z"/>
      <path fill="#ffdf00" d="M320 40L600 240 320 440 40 240z"/>
      <circle fill="#002776" cx="320" cy="240" r="115"/>
      <path fill="#ffffff" d="M208 240c0-15 48-60 112-60s112 45 112 60c-25-10-60-20-112-20s-87 10-112 20z"/>
    </svg>
  </span>
);

const FlagES = ({ className = "w-5 h-3.5" }: { className?: string }) => (
  <span className={`${className} inline-flex items-center justify-center rounded-[3px] overflow-hidden shadow-sm shrink-0 border border-white/20`}>
    <svg className="w-full h-full object-cover" viewBox="0 0 640 480">
      <path fill="#aa151b" d="M0 0h640v480H0z"/>
      <path fill="#f1bf00" d="M0 120h640v240H0z"/>
      <g transform="translate(135, 170) scale(0.65)">
        <rect x="0" y="25" width="80" height="95" rx="8" fill="#aa151b" stroke="#ffffff" strokeWidth="5"/>
        <path d="M0 25 L40 -15 L80 25 Z" fill="#f1bf00"/>
        <circle cx="40" cy="65" r="18" fill="#f1bf00"/>
        <line x1="40" y1="52" x2="40" y2="78" stroke="#aa151b" strokeWidth="5"/>
        <line x1="27" y1="65" x2="53" y2="65" stroke="#aa151b" strokeWidth="5"/>
      </g>
    </svg>
  </span>
);

const LANGUAGES = [
  { code: 'en' as Lang, label: 'English', FlagComponent: FlagUS },
  { code: 'pt' as Lang, label: 'Português', FlagComponent: FlagBR },
  { code: 'es' as Lang, label: 'Español', FlagComponent: FlagES },
];

const countriesList = [
  'Argentina', 'Australia', 'Brazil', 'Canada', 'Chile', 'China', 'Colombia',
  'France', 'Germany', 'India', 'Italy', 'Japan', 'Mexico', 'Peru', 'Portugal',
  'Russia', 'South Africa', 'Spain', 'United Kingdom', 'United States'
].sort();

interface ProfileForm {
  first_name: string;
  last_name: string;
  email: string;
  postal_code: string;
  phone_number: string;
  country: string;
  how_heard_about_us: string;
}

export default function Account() {
  const navigate = useNavigate();
  const [lang, setLang] = useState<Lang>(getStoredLanguage());
  const [langDropdownOpen, setLangDropdownOpen] = useState<boolean>(false);
  const langDropdownRef = useRef<HTMLDivElement>(null);

  const [activeTab, setActiveTab] = useState<'info' | 'sub' | 'sec'>('info');
  const [session, setSession] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const [form, setForm] = useState<ProfileForm>({
    first_name: '',
    last_name: '',
    email: '',
    postal_code: '',
    phone_number: '',
    country: '',
    how_heard_about_us: '',
  });

  // Password change
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSelectLanguage = (newLang: Lang) => {
    setLang(newLang);
    setStoredLanguage(newLang);
    setLangDropdownOpen(false);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target as Node)) {
        setLangDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const init = async () => {
      const { data: { session: s } } = await supabase.auth.getSession();
      setSession(s);
      if (!s) {
        navigate('/auth');
        return;
      }
      await loadProfile(s.user.id, s.user.email);
    };
    init();
  }, []);

  const loadProfile = async (userId: string, email?: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setUserProfile(data);
        if (data.plan === 'free' && data.trial_end) {
          const trialEndTime = new Date(data.trial_end).getTime();
          const now = Date.now();
          if (now > trialEndTime) {
            navigate('/pricing?reason=trial_expired');
            return;
          }
        }

        setForm({
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          email: email || data.email || '',
          postal_code: data.postal_code || '',
          phone_number: data.phone_number || '',
          country: data.country || '',
          how_heard_about_us: data.how_heard_about_us || '',
        });
      } else {
        setForm(prev => ({ ...prev, email: email || '' }));
      }
    } catch (err: any) {
      console.error('Error loading profile:', err);
      showToast(`Error loading profile: ${err.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!session) return;
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: session.user.id,
          first_name: form.first_name,
          last_name: form.last_name,
          postal_code: form.postal_code,
          phone_number: form.phone_number,
          country: form.country,
          how_heard_about_us: form.how_heard_about_us,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      showToast(lang === 'pt' ? 'Perfil atualizado com sucesso!' : lang === 'es' ? '¡Perfil actualizado con éxito!' : 'Profile updated successfully!', 'success');
    } catch (err: any) {
      console.error('Error saving profile:', err);
      showToast(`Error: ${err.message}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      showToast(lang === 'pt' ? 'As senhas não coincidem.' : lang === 'es' ? 'Las contraseñas no coinciden.' : 'Passwords do not match.', 'error');
      return;
    }
    if (newPassword.length < 6) {
      showToast(lang === 'pt' ? 'A nova senha deve ter pelo menos 6 caracteres.' : lang === 'es' ? 'La nueva contraseña debe tener al menos 6 caracteres.' : 'Password must be at least 6 characters.', 'error');
      return;
    }
    setIsSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setNewPassword('');
      setConfirmPassword('');
      showToast(lang === 'pt' ? 'Senha atualizada com sucesso!' : lang === 'es' ? '¡Contraseña actualizada con éxito!' : 'Password updated successfully!', 'success');
    } catch (err: any) {
      showToast(`Error: ${err.message}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const t = (k: string) => tFunc(k, lang);
  const currentLangObj = LANGUAGES.find(l => l.code === lang) || LANGUAGES[0];

  const howHeardOptions = [
    { value: 'Google Search', label: lang === 'pt' ? 'Busca no Google' : lang === 'es' ? 'Búsqueda en Google' : 'Google Search' },
    { value: 'Social Media', label: lang === 'pt' ? 'Redes Sociais' : lang === 'es' ? 'Redes Sociales' : 'Social Media' },
    { value: 'YouTube', label: 'YouTube' },
    { value: 'Friend / Referral', label: lang === 'pt' ? 'Amigo / Indicação' : lang === 'es' ? 'Amigo / Recomendación' : 'Friend / Referral' },
    { value: 'Blog / Article', label: lang === 'pt' ? 'Blog / Artigo' : lang === 'es' ? 'Blog / Artículo' : 'Blog / Article' },
    { value: 'Discord / Telegram', label: 'Discord / Telegram' },
    { value: 'Other', label: lang === 'pt' ? 'Outro' : lang === 'es' ? 'Otro' : 'Other' }
  ];

  const inputClass = "w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/40 text-white transition-all select-text cursor-text";
  const labelClass = "text-xs font-bold text-gray-400 block mb-1";

  const currentPlanName = userProfile?.plan ? userProfile.plan.toUpperCase() : 'FREE';

  return (
    <div className="min-h-screen bg-[#070709] text-white font-sans flex flex-col select-none">
      {/* Toast */}
      {toastMessage && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-xl shadow-2xl font-bold flex items-center gap-2 animate-tab-enter ${toastType === 'success' ? 'bg-emerald-500 text-black' : 'bg-red-500 text-white'}`}>
          <Check size={18} /> {toastMessage}
        </div>
      )}

      {/* Header */}
      <header className="fixed top-0 left-0 w-full z-50 flex items-center justify-between px-4 lg:px-8 shadow-sm transition-all border-b border-white/10 bg-[#0c0c0e]/95 backdrop-blur-md h-20"
        style={{
          paddingTop: 'env(safe-area-inset-top, 0px)',
        }}
      >
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/dashboard')} 
            className="flex items-center gap-1.5 text-xs font-bold text-gray-300 hover:text-amber-400 px-3 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer"
          >
            <ChevronLeft size={16} />
            <span>{t('nav.back')}</span>
          </button>
          
          <div className="hidden sm:flex items-center gap-2.5 cursor-pointer ml-2" onClick={() => navigate('/dashboard')}>
            <img src="/logo.png" alt="Quantara Logo" className="w-8 h-8 object-contain drop-shadow-md rounded-xl" onError={(e: any) => { e.target.style.display = 'none'; }} />
            <h2 className="text-white text-base font-black tracking-tight font-display">Quantara</h2>
          </div>
        </div>

        {/* Flag Language Dropdown on Header */}
        <div className="relative" ref={langDropdownRef}>
          <button
            type="button"
            onClick={() => setLangDropdownOpen(!langDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-xs font-bold text-gray-200 transition-all cursor-pointer shadow-sm active:scale-95"
            title="Select Language"
          >
            <currentLangObj.FlagComponent className="w-5 h-3.5" />
            <span className="uppercase text-[11px] font-extrabold text-gray-200">{currentLangObj.code}</span>
            <ChevronDown size={12} className={`text-gray-400 transition-transform ${langDropdownOpen ? 'rotate-180 text-amber-400' : ''}`} />
          </button>

          {langDropdownOpen && (
            <div className="absolute right-0 mt-2 w-36 bg-[#0e0e14]/98 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-2xl py-1.5 z-50 animate-fadeIn">
              {LANGUAGES.map((l) => {
                const Flag = l.FlagComponent;
                return (
                  <button
                    key={l.code}
                    type="button"
                    onClick={() => handleSelectLanguage(l.code)}
                    className={`w-full flex items-center justify-between px-3.5 py-2 text-xs font-bold transition-colors cursor-pointer ${
                      lang === l.code ? 'bg-amber-500/15 text-amber-400' : 'text-gray-300 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Flag className="w-5 h-3.5" />
                      <span>{l.label}</span>
                    </div>
                    {lang === l.code && <Check size={14} className="text-amber-400" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </header>

      <div className="flex flex-1 max-w-7xl mx-auto w-full p-6 lg:p-12 gap-10 mt-[80px]">
        
        {/* Desktop Sidebar Tabs */}
        <aside className="w-64 hidden md:flex flex-col gap-6">
          <div>
            <h1 className="text-2xl font-black font-display mb-6 text-white">{t('account.title')}</h1>
            <nav className="flex flex-col gap-2">
              <button 
                onClick={() => setActiveTab('info')} 
                className={`flex items-center gap-3 text-left px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === 'info' ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-black shadow-lg shadow-amber-500/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
              >
                <User size={16} />
                <span>{t('account.tabPersonal')}</span>
              </button>
              <button 
                onClick={() => setActiveTab('sub')} 
                className={`flex items-center gap-3 text-left px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === 'sub' ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-black shadow-lg shadow-amber-500/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
              >
                <CreditCard size={16} />
                <span>{t('account.tabSubscription')}</span>
              </button>
              <button 
                onClick={() => setActiveTab('sec')} 
                className={`flex items-center gap-3 text-left px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === 'sec' ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-black shadow-lg shadow-amber-500/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
              >
                <Lock size={16} />
                <span>{t('account.tabSecurity')}</span>
              </button>
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          
          {/* Mobile Tabs */}
          <div className="md:hidden flex overflow-x-auto gap-2 mb-6 pb-2">
            <button 
              onClick={() => setActiveTab('info')} 
              className={`whitespace-nowrap px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'info' ? 'bg-amber-500 text-black shadow-md' : 'text-gray-400 border border-white/10 bg-[#111114]'}`}
            >
              {t('account.tabPersonal')}
            </button>
            <button 
              onClick={() => setActiveTab('sub')} 
              className={`whitespace-nowrap px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'sub' ? 'bg-amber-500 text-black shadow-md' : 'text-gray-400 border border-white/10 bg-[#111114]'}`}
            >
              {t('account.tabSubscription')}
            </button>
            <button 
              onClick={() => setActiveTab('sec')} 
              className={`whitespace-nowrap px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'sec' ? 'bg-amber-500 text-black shadow-md' : 'text-gray-400 border border-white/10 bg-[#111114]'}`}
            >
              {t('account.tabSecurity')}
            </button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={32} className="animate-spin text-amber-400" />
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* Tab 1: Personal Info */}
              {activeTab === 'info' && (
                <div className="bg-[#111114] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-xl">
                  <h3 className="text-lg font-black font-display mb-6 text-white">{t('account.userProfileTitle')}</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>{t('account.firstName')}</label>
                        <input type="text" className={inputClass} value={form.first_name} onChange={e => setForm({ ...form, first_name: e.target.value })} />
                      </div>
                      <div>
                        <label className={labelClass}>{t('account.lastName')}</label>
                        <input type="text" className={inputClass} value={form.last_name} onChange={e => setForm({ ...form, last_name: e.target.value })} />
                      </div>
                    </div>

                    <div>
                      <label className={labelClass}>{t('account.email')}</label>
                      <input type="email" disabled className={`${inputClass} opacity-50 cursor-not-allowed`} value={form.email} />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>{t('account.phone')}</label>
                        <input type="tel" placeholder="+1 (555) 000-0000" className={inputClass} value={form.phone_number} onChange={e => setForm({ ...form, phone_number: e.target.value })} />
                      </div>
                      <div>
                        <label className={labelClass}>{t('account.postalCode')}</label>
                        <input type="text" className={inputClass} value={form.postal_code} onChange={e => setForm({ ...form, postal_code: e.target.value })} />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>{t('account.country')}</label>
                        <select className={`${inputClass} cursor-pointer`} value={form.country} onChange={e => setForm({ ...form, country: e.target.value })}>
                          <option value="" className="bg-[#111]">{t('account.selectCountry')}</option>
                          {countriesList.map(c => <option key={c} value={c} className="bg-[#111]">{c}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className={labelClass}>{t('account.howHeard')}</label>
                        <select className={`${inputClass} cursor-pointer`} value={form.how_heard_about_us} onChange={e => setForm({ ...form, how_heard_about_us: e.target.value })}>
                          <option value="" className="bg-[#111]">{t('account.selectOption')}</option>
                          {howHeardOptions.map(o => <option key={o.value} value={o.value} className="bg-[#111]">{o.label}</option>)}
                        </select>
                      </div>
                    </div>

                    <button
                      onClick={handleSaveProfile}
                      disabled={isSaving}
                      className="w-full bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-black py-3.5 rounded-xl shadow-lg shadow-amber-500/20 hover:brightness-110 active:scale-[0.98] transition-all mt-4 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isSaving ? <Loader2 size={18} className="animate-spin text-black" /> : <Check size={18} />}
                      <span>{isSaving ? t('account.saving') : t('account.saveChanges')}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Tab 2: Subscription */}
              {activeTab === 'sub' && (
                <div className="bg-[#111114] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-xl">
                  <h3 className="text-lg font-black font-display mb-6 text-white">{t('account.currentSubscription')}</h3>
                  <div className="bg-black/30 border border-white/10 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-black text-xl text-amber-400 font-display">Plan {currentPlanName}</h4>
                      <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                        {t('pricing.activeBadge')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-300 mb-6 leading-relaxed">
                      {lang === 'pt'
                        ? 'Acesse a página de planos para atualizar para armazenamento em nuvem ou estender sua capacidade institucional.'
                        : lang === 'es'
                        ? 'Acceda a la página de planes para actualizar al almacenamiento en la nube o extender su capacidad institucional.'
                        : 'Visit the pricing page to upgrade to cloud sync or expand your institutional capacity.'}
                    </p>
                    <button 
                      onClick={() => navigate('/pricing')} 
                      className="w-full sm:w-auto px-8 bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-black py-3 rounded-xl hover:brightness-110 active:scale-95 transition-all shadow-md cursor-pointer"
                    >
                      {t('account.upgradePlan')}
                    </button>
                  </div>
                </div>
              )}

              {/* Tab 3: Security */}
              {activeTab === 'sec' && (
                <div className="bg-[#111114] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-xl">
                  <h3 className="text-lg font-black font-display mb-6 text-white flex items-center gap-2">
                    <Shield size={20} className="text-amber-400" />
                    <span>{t('account.changePasswordTitle')}</span>
                  </h3>
                  <div className="space-y-4 max-w-md">
                    <div>
                      <label className={labelClass}>{t('account.newPassword')}</label>
                      <input type="password" placeholder="••••••••" className={inputClass} value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                    </div>
                    <div>
                      <label className={labelClass}>{t('account.confirmNewPassword')}</label>
                      <input type="password" placeholder="••••••••" className={inputClass} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
                    </div>
                    <button
                      onClick={handlePasswordChange}
                      disabled={isSaving}
                      className="w-full bg-white/5 border border-white/10 hover:border-amber-500/40 text-white font-black py-3.5 rounded-xl transition-all mt-4 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isSaving ? <Loader2 size={18} className="animate-spin text-amber-400" /> : null}
                      <span>{isSaving ? t('account.updating') : t('account.updatePassword')}</span>
                    </button>
                  </div>
                </div>
              )}

            </div>
          )}
        </main>
      </div>
    </div>
  );
}
