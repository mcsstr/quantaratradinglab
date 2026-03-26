import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, ChevronLeft, Check, Loader2, Shield, Activity } from 'lucide-react';
import { supabase } from '../utils/supabase';
import './Dashboard.css';

const countriesList = [
  'Argentina', 'Australia', 'Brazil', 'Canada', 'Chile', 'China', 'Colombia',
  'France', 'Germany', 'India', 'Italy', 'Japan', 'Mexico', 'Peru', 'Portugal',
  'Russia', 'South Africa', 'Spain', 'United Kingdom', 'United States'
].sort();

const howHeardOptions = [
  'Google Search', 'Social Media', 'YouTube', 'Friend / Referral',
  'Blog / Article', 'Advertisement', 'Discord / Telegram', 'Other'
];

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
  const [activeTab, setActiveTab] = useState('info');
  const [session, setSession] = useState<any>(null);
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

  // --- PASSWORD CHANGE ---
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // --- AUTH SESSION CHECK ---
  useEffect(() => {
    const init = async () => {
      const { data: { session: s } } = await supabase.auth.getSession();
      setSession(s);
      if (!s) {
        navigate('/auth');
        return;
      }
      // Fetch profile data
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
      showToast('Perfil atualizado com sucesso!', 'success');
    } catch (err: any) {
      console.error('Error saving profile:', err);
      showToast(`Erro ao salvar: ${err.message}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      showToast('As senhas não coincidem.', 'error');
      return;
    }
    if (newPassword.length < 6) {
      showToast('A nova senha deve ter pelo menos 6 caracteres.', 'error');
      return;
    }
    setIsSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      showToast('Senha atualizada com sucesso!', 'success');
    } catch (err: any) {
      showToast(`Erro: ${err.message}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const inputClass = "w-full bg-black/20 border border-white/10 rounded-lg p-3 text-sm outline-none focus:border-yellow-500 transition-colors text-white";
  const labelClass = "text-xs font-bold text-gray-400";

  return (
    <div className="min-h-screen bg-[#09090b] text-white font-sans flex flex-col">
      {/* Toast */}
      {toastMessage && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-lg shadow-lg font-bold flex items-center gap-2 animate-tab-enter ${toastType === 'success' ? 'bg-green-500 text-black' : 'bg-red-500 text-white'}`}>
          <Check size={18} /> {toastMessage}
        </div>
      )}

      {/* Header */}
      <header className="fixed top-0 left-0 w-full z-50 flex items-center justify-between px-4 lg:px-6 h-[var(--header-height-mob)] lg:h-[var(--header-height-desk)] border-b border-white/10 bg-[#0c0c0e] shadow-sm transition-all header-safe">
        <div className="flex items-center gap-2">
          {/* Mobile: back link */}
          <div className="md:hidden">
            <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 py-1 pr-4 active:opacity-70 transition-opacity" style={{ color: '#00B0F0' }}>
              <ChevronLeft size={24} />
              <span className="font-bold text-lg font-display">Back</span>
            </button>
          </div>
          {/* Desktop: logo original */}
          <div className="hidden md:flex items-center gap-2 cursor-pointer" onClick={() => navigate('/dashboard')}>
            <img src="/logo.png" alt="Quantara Logo" className="w-8 h-8 lg:w-9 lg:h-9 object-contain drop-shadow-md z-10 rounded-xl" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
            <div style={{ display: 'none' }} className="w-8 h-8 bg-yellow-500 rounded flex items-center justify-center text-black font-bold">
              <Activity size={20} />
            </div>
            <h2 className="text-white text-lg font-black tracking-tighter font-display">Quantara</h2>
          </div>
        </div>

        {/* Desktop only: Back button */}
        <div className="hidden md:flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm font-bold transition-opacity hover:opacity-70" style={{ color: '#00B0F0' }}>
            <ChevronLeft size={18} /> Back
          </button>
        </div>
      </header>

      <div className="flex flex-1 max-w-7xl mx-auto w-full p-6 lg:p-12 gap-12 mt-[60px] lg:mt-[72px]">
        {/* Sidebar */}
        <aside className="w-64 hidden md:flex flex-col gap-8">
          <div>
            <h2 className="text-3xl font-bold font-display capitalize mb-8 text-white">Conta</h2>
            <nav className="flex flex-col gap-2">
              <button onClick={() => setActiveTab('info')} className={`text-left px-4 py-3 rounded-lg text-sm font-bold transition-colors ${activeTab === 'info' ? 'bg-[#EAB308] text-black' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
                Informações Pessoais
              </button>
              <button onClick={() => setActiveTab('sub')} className={`text-left px-4 py-3 rounded-lg text-sm font-bold transition-colors ${activeTab === 'sub' ? 'bg-[#EAB308] text-black' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
                Assinatura
              </button>
              <button onClick={() => setActiveTab('sec')} className={`text-left px-4 py-3 rounded-lg text-sm font-bold transition-colors ${activeTab === 'sec' ? 'bg-[#EAB308] text-black' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
                Segurança
              </button>
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          <h1 className="text-3xl font-bold font-display capitalize mb-8 text-white">
            {activeTab === 'info' && 'Informações Pessoais'}
            {activeTab === 'sub' && 'Assinatura'}
            {activeTab === 'sec' && 'Segurança'}
          </h1>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={32} className="animate-spin text-yellow-500" />
              <span className="ml-3 text-gray-400">Carregando dados...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column — Personal Info Form */}
              {activeTab === 'info' && (
                <div className="space-y-8 lg:col-span-2">
                  <div className="bg-[#111114] border border-white/10 rounded-xl p-6">
                    <h3 className="text-lg font-bold font-display capitalize mb-6 text-white">Dados do Usuário</h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className={labelClass}>Nome</label>
                          <input type="text" placeholder="Seu nome" className={inputClass} value={form.first_name} onChange={e => setForm({ ...form, first_name: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                          <label className={labelClass}>Sobrenome</label>
                          <input type="text" placeholder="Seu sobrenome" className={inputClass} value={form.last_name} onChange={e => setForm({ ...form, last_name: e.target.value })} />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className={labelClass}>E-mail</label>
                        <input type="email" disabled className={`${inputClass} opacity-50 cursor-not-allowed`} value={form.email} />
                        <p className="text-[10px] text-gray-500">O e-mail não pode ser alterado por aqui.</p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className={labelClass}>Telefone</label>
                          <input type="tel" placeholder="+55 11 99999-9999" className={inputClass} value={form.phone_number} onChange={e => setForm({ ...form, phone_number: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                          <label className={labelClass}>CEP / Código Postal</label>
                          <input type="text" placeholder="Ex: 01001-000" className={inputClass} value={form.postal_code} onChange={e => setForm({ ...form, postal_code: e.target.value })} />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className={labelClass}>País</label>
                          <select className={`${inputClass} cursor-pointer`} value={form.country} onChange={e => setForm({ ...form, country: e.target.value })}>
                            <option value="" className="bg-[#111]">Selecione um país</option>
                            {countriesList.map(c => <option key={c} value={c} className="bg-[#111]">{c}</option>)}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className={labelClass}>Como nos conheceu?</label>
                          <select className={`${inputClass} cursor-pointer`} value={form.how_heard_about_us} onChange={e => setForm({ ...form, how_heard_about_us: e.target.value })}>
                            <option value="" className="bg-[#111]">Selecione uma opção</option>
                            {howHeardOptions.map(o => <option key={o} value={o} className="bg-[#111]">{o}</option>)}
                          </select>
                        </div>
                      </div>

                      <button
                        onClick={handleSaveProfile}
                        disabled={isSaving}
                        className="w-full bg-yellow-500 text-black font-bold py-3 rounded-lg hover:bg-yellow-400 transition-colors mt-4 disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                        {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Subscription Tab */}
              {activeTab === 'sub' && (
                <div className="space-y-8 lg:col-span-2">
                  <div className="bg-[#111114] border border-white/10 rounded-xl p-6">
                    <h3 className="text-lg font-bold font-display capitalize mb-6 text-white">Assinatura Atual</h3>
                    <div className="bg-black/20 border border-white/10 rounded-lg p-5">
                      <h4 className="font-bold text-lg mb-2">Plano Free</h4>
                      <p className="text-sm text-gray-400 mb-4 leading-relaxed">
                        Você está no plano gratuito. Faça upgrade para desbloquear recursos avançados de análise e armazenamento na nuvem.
                      </p>
                      <button onClick={() => navigate('/pricing')} className="w-full bg-yellow-500 text-black font-bold py-3 rounded-lg hover:bg-yellow-400 transition-colors">
                        Fazer Upgrade
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === 'sec' && (
                <div className="space-y-8 lg:col-span-2">
                  <div className="bg-[#111114] border border-white/10 rounded-xl p-6">
                    <h3 className="text-lg font-bold font-display capitalize mb-6 text-white flex items-center gap-2">
                      <Shield size={20} className="text-yellow-500" /> Alterar Senha
                    </h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className={labelClass}>Nova Senha</label>
                        <input type="password" placeholder="••••••••" className={inputClass} value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <label className={labelClass}>Confirmar Nova Senha</label>
                        <input type="password" placeholder="••••••••" className={inputClass} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
                      </div>
                      <button
                        onClick={handlePasswordChange}
                        disabled={isSaving}
                        className="w-full bg-transparent border border-white/10 text-white font-bold py-3 rounded-lg hover:bg-white/5 transition-colors mt-4 disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {isSaving ? <Loader2 size={18} className="animate-spin" /> : null}
                        {isSaving ? 'Atualizando...' : 'Atualizar Senha'}
                      </button>
                    </div>
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
