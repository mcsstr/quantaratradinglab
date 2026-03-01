import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, LogOut, User, CreditCard, Shield, Settings, ArrowLeft, ChevronLeft, ChevronDown } from 'lucide-react';

export default function Account() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('info');
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    setShowLogoutModal(false);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white font-sans flex flex-col">
      <header className="fixed top-0 left-0 w-full z-50 flex items-center justify-between px-4 lg:px-6 py-2.5 lg:py-3 border-b border-white/10 bg-[#0c0c0e] shadow-sm transition-all">
        <div className="flex items-center gap-2 cursor-pointer md:flex" onClick={() => navigate(-1)}>
          <div className="md:hidden">
            <button onClick={(e) => { e.stopPropagation(); navigate(-1); }} className="flex items-center gap-1.5 py-1 pr-4 active:opacity-70 transition-opacity" style={{ color: '#00B0F0' }}>
              <ChevronLeft size={24} />
              <span className="font-bold text-lg font-display">Back</span>
            </button>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center text-black font-bold">
              <Activity size={20} />
            </div>
            <span className="text-xl font-bold font-display">Quantara</span>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
          <a href="#" className="hover:text-white transition-colors">Resources</a>
          <a href="#" className="hover:text-white transition-colors">How it Works</a>
          <a href="#" className="hover:text-white transition-colors">Pricing</a>
        </nav>

        <div className="flex items-center gap-4">

          <div className="hidden md:flex items-center gap-4">
            <button onClick={() => navigate('/dashboard')} className="bg-white/5 border border-white/10 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-white/10 transition-colors flex items-center gap-2">
              <ArrowLeft size={16} /> Voltar
            </button>
            <button onClick={() => {
              if (window.confirm('Are you sure you want to sign out?')) {
                localStorage.clear();
                window.location.href = '/';
              }
            }} className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-500/20 transition-colors flex items-center gap-2">
              <LogOut size={16} /> Sair
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 max-w-7xl mx-auto w-full p-6 lg:p-12 gap-12 mt-[60px] lg:mt-[72px]">
        {/* Sidebar */}
        <aside className="w-64 hidden md:flex flex-col gap-8">
          <div>
            <h2 className="text-2xl font-bold font-display capitalize mb-6 text-white">Conta</h2>
            <nav className="flex flex-col gap-2">
              <button
                onClick={() => setActiveTab('info')}
                className={`text-left px-4 py-3 rounded-lg text-sm font-bold transition-colors ${activeTab === 'info' ? 'bg-[#EAB308] text-black' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
              >
                Informações Pessoais
              </button>
              <button
                onClick={() => setActiveTab('sub')}
                className={`text-left px-4 py-3 rounded-lg text-sm font-bold transition-colors ${activeTab === 'sub' ? 'bg-[#EAB308] text-black' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
              >
                Assinatura
              </button>
              <button
                onClick={() => setActiveTab('pay')}
                className={`text-left px-4 py-3 rounded-lg text-sm font-bold transition-colors ${activeTab === 'pay' ? 'bg-[#EAB308] text-black' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
              >
                Métodos de Pagamento
              </button>
              <button
                onClick={() => setActiveTab('sec')}
                className={`text-left px-4 py-3 rounded-lg text-sm font-bold transition-colors ${activeTab === 'sec' ? 'bg-[#EAB308] text-black' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
              >
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
            {activeTab === 'pay' && 'Métodos de Pagamento'}
            {activeTab === 'sec' && 'Segurança'}
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-8">
              {/* Dados do Usuário */}
              <div className="bg-[#111114] border border-white/10 rounded-xl p-6">
                <h3 className="text-lg font-bold font-display capitalize mb-6 text-white">Dados do Usuário</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400">Nome Completo</label>
                    <input type="text" defaultValue="João Silva" className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-sm outline-none focus:border-yellow-500 transition-colors" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400">E-mail</label>
                    <input type="email" defaultValue="joao.silva@exemplo.com" className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-sm outline-none focus:border-yellow-500 transition-colors" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400">Telefone</label>
                    <input type="tel" defaultValue="+55 11 98765-4321" className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-sm outline-none focus:border-yellow-500 transition-colors" />
                  </div>
                  <button className="w-full bg-yellow-500 text-black font-bold py-3 rounded-lg hover:bg-yellow-400 transition-colors mt-4">
                    Salvar Alterações
                  </button>
                </div>
              </div>

              {/* Dados do Usuário (Extra) */}
              <div className="bg-[#111114] border border-white/10 rounded-xl p-6">
                <h3 className="text-lg font-bold font-display capitalize mb-4 text-white">Dados do Usuário</h3>
                <p className="text-sm text-gray-400 mb-6 leading-relaxed">
                  Descubra os latrs ves onolos o seus erros, empilhas, tores cem aesenovada performance.
                </p>
                <div className="space-y-3">
                  <button className="w-full bg-transparent border border-white/10 text-white font-bold py-3 rounded-lg hover:bg-white/5 transition-colors flex items-center justify-center gap-2">
                    + Adicionar Novo Cartão
                  </button>
                  <button className="w-full bg-transparent border border-white/10 text-white font-bold py-3 rounded-lg hover:bg-white/5 transition-colors flex items-center justify-center gap-2">
                    Confirmar Nova Senha
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-8">
              {/* Assinatura Atual */}
              <div className="bg-[#111114] border border-white/10 rounded-xl p-6">
                <h3 className="text-lg font-bold font-display capitalize mb-6 text-white">Assinatura Atual</h3>
                <div className="bg-black/20 border border-white/10 rounded-lg p-5">
                  <h4 className="font-bold text-lg mb-2">Plano Pro (Mensal)</h4>
                  <p className="text-sm text-gray-400 mb-4 leading-relaxed">
                    Plano Pro (Mensal) - Cszse de noutino no trading, ntanatura inteira comepa tataal.
                  </p>
                  <p className="text-sm font-bold text-gray-400 mb-6">Destas details: $3 Mensal</p>
                  <button className="w-full bg-yellow-500 text-black font-bold py-3 rounded-lg hover:bg-yellow-400 transition-colors">
                    Fazer Upgrade
                  </button>
                </div>
              </div>

              {/* Métodos de Pagamento Salvos */}
              <div className="bg-[#111114] border border-white/10 rounded-xl p-6">
                <h3 className="text-[15px] font-bold capitalize mb-6 text-gray-400">Métodos de Pagamento Salvos</h3>
                <div className="bg-black/20 border border-white/10 rounded-lg p-4 flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-white px-2 py-1 rounded text-black font-bold text-xs">VISA</div>
                    <span className="text-sm font-medium">Visa **** 4242</span>
                  </div>
                  <div className="w-8 h-5 bg-red-500 rounded-sm relative overflow-hidden">
                    <div className="absolute w-5 h-5 bg-yellow-500 rounded-full -left-1 opacity-80 mix-blend-multiply"></div>
                  </div>
                </div>
                <button className="w-full bg-transparent border border-white/10 text-white font-bold py-3 rounded-lg hover:bg-white/5 transition-colors">
                  Adicionar Novo Cartão
                </button>
              </div>

              {/* Segurança */}
              <div className="bg-[#111114] border border-white/10 rounded-xl p-6">
                <h3 className="text-[15px] font-bold capitalize mb-6 text-gray-400">Segurança</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400">Senha Atual</label>
                    <input type="password" placeholder="••••••••" className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-sm outline-none focus:border-yellow-500 transition-colors" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400">Nova Senha</label>
                    <input type="password" placeholder="••••••••" className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-sm outline-none focus:border-yellow-500 transition-colors" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400">Confirmar Nova Senha</label>
                    <input type="password" placeholder="••••••••" className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-sm outline-none focus:border-yellow-500 transition-colors" />
                  </div>
                  <button className="w-full bg-transparent border border-white/10 text-white font-bold py-3 rounded-lg hover:bg-white/5 transition-colors mt-4">
                    Atualizar Senha
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Modal de Logout */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#111114] border border-white/10 rounded-xl p-6 w-full max-w-sm shadow-2xl animate-fade-in">
            <h3 className="text-xl font-bold mb-2 flex items-center gap-2 text-white">
              <LogOut className="text-red-500" size={24} /> Deseja mesmo sair?
            </h3>
            <p className="text-gray-400 text-sm mb-6">
              Você será desconectado da sua conta e redirecionado para a página inicial.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="px-4 py-2 rounded-lg text-sm font-bold text-gray-300 hover:bg-white/5 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleLogout}
                className="px-5 py-2 rounded-lg text-sm font-bold bg-red-500 text-white hover:bg-red-600 transition-colors shadow-lg"
              >
                Sim, Sair
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
