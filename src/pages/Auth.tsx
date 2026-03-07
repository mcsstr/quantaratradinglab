import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Activity } from 'lucide-react';
import { supabase } from '../utils/supabase'; const countryCodes = [
  { code: '+1', country: 'United States', flag: '🇺🇸' },
  { code: '+44', country: 'United Kingdom', flag: '🇬🇧' },
  { code: '+55', country: 'Brazil', flag: '🇧🇷' },
  { code: '+49', country: 'Germany', flag: '🇩🇪' },
  { code: '+33', country: 'France', flag: '🇫🇷' },
  { code: '+81', country: 'Japan', flag: '🇯🇵' },
  { code: '+86', country: 'China', flag: '🇨🇳' },
  { code: '+91', country: 'India', flag: '🇮🇳' },
  { code: '+61', country: 'Australia', flag: '🇦🇺' },
  { code: '+351', country: 'Portugal', flag: '🇵🇹' },
  { code: '+34', country: 'Spain', flag: '🇪🇸' },
  { code: '+39', country: 'Italy', flag: '🇮🇹' },
  { code: '+7', country: 'Russia', flag: '🇷🇺' },
  { code: '+27', country: 'South Africa', flag: '🇿🇦' },
  { code: '+52', country: 'Mexico', flag: '🇲🇽' },
  { code: '+54', country: 'Argentina', flag: '🇦🇷' },
  { code: '+56', country: 'Chile', flag: '🇨🇱' },
  { code: '+57', country: 'Colombia', flag: '🇨🇴' },
  { code: '+51', country: 'Peru', flag: '🇵🇪' },
];

const countriesList = [...new Set(countryCodes.map(c => c.country))].sort();

export default function Auth() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // Campos de Perfil adicionais
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneCode, setPhoneCode] = useState('+1');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [howHeard, setHowHeard] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
        if (authError) throw authError;
      } else {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/loading`
          }
        });
        if (authError) throw authError;

        if (authData?.user) {
          // Atualiza a tabela profiles com os dados capturados
          const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
              id: authData.user.id,
              first_name: firstName,
              last_name: lastName,
              email: email,
              phone_code: phoneCode,
              phone_number: phone,
              country: country,
              postal_code: postalCode,
              how_heard_about_us: howHeard,
              updated_at: new Date().toISOString()
            });
          if (profileError) console.error('Erro ao salvar profile:', profileError);
        }

        alert('Cadastro realizado! Se o e-mail de confirmação estiver habilitado, verifique sua caixa de entrada.');
      }
      navigate('/loading');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/loading`
        }
      });
      if (authError) throw authError;
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white font-sans flex flex-col md:flex-row">
      {/* Left Side - Branding */}
      <div className="hidden md:flex flex-1 flex-col justify-center p-12 lg:p-24 relative overflow-hidden">
        {/* Abstract Chart Background */}
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
          <svg viewBox="0 0 800 600" preserveAspectRatio="none" className="w-full h-full">
            <path d="M0,400 L100,350 L200,450 L300,200 L400,300 L500,100 L600,250 L700,50 L800,150" fill="none" stroke="#00B0F0" strokeWidth="4" />
            {/* Candlesticks */}
            <rect x="95" y="300" width="10" height="100" fill="#22c55e" />
            <rect x="195" y="400" width="10" height="80" fill="#ef4444" />
            <rect x="295" y="150" width="10" height="120" fill="#22c55e" />
            <rect x="395" y="250" width="10" height="90" fill="#ef4444" />
            <rect x="495" y="50" width="10" height="150" fill="#22c55e" />
          </svg>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-10 h-10 bg-[#00B0F0] rounded-xl flex items-center justify-center text-black font-bold">
              <Activity size={24} />
            </div>
            <span className="text-2xl font-bold font-display">Quantara</span>
          </div>

          <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight font-display leading-tight mb-6">
            "Constância é a chave para o sucesso no trading.<br />
            <span className="text-[#00B0F0]">Domine seus padrões com a Quantara.</span>"
          </h1>
          <p className="text-gray-400 text-lg">Quantara: Trading Lab</p>
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-6 relative">
        {/* Glow effect behind card */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[#00B0F0]/5 blur-[100px] rounded-full pointer-events-none"></div>

        <div className="w-full max-w-md bg-[#111114] border border-white/10 rounded-2xl p-8 shadow-2xl relative z-10">

          {/* Toggle Login/Signup */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <span className={`text-sm font-bold ${isLogin ? 'text-white' : 'text-gray-500'}`}>Entrar</span>
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="relative w-12 h-6 bg-white/10 rounded-full transition-colors"
            >
              <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${!isLogin ? 'translate-x-6' : ''}`}></div>
            </button>
            <span className={`text-sm font-bold ${!isLogin ? 'text-white' : 'text-gray-500'}`}>Criar Conta</span>
          </div>

          {error && (
            <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-5">
            {!isLogin && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400">First Name</label>
                  <input
                    type="text"
                    className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-sm outline-none focus:border-[#00B0F0] transition-colors"
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                    required={!isLogin}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400">Last Name</label>
                  <input
                    type="text"
                    className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-sm outline-none focus:border-[#00B0F0] transition-colors"
                    value={lastName}
                    onChange={e => setLastName(e.target.value)}
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400">E-mail</label>
              <input
                type="email"
                placeholder="seu@email.com"
                className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-sm outline-none focus:border-[#00B0F0] transition-colors"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>

            {!isLogin && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400">Phone</label>
                    <div className="flex gap-2">
                      <select
                        value={phoneCode}
                        onChange={e => setPhoneCode(e.target.value)}
                        className="w-[90px] sm:w-[100px] bg-black/20 border border-white/10 rounded-lg p-3 text-sm outline-none focus:border-[#00B0F0] transition-colors cursor-pointer appearance-none"
                      >
                        {countryCodes.map(c => (
                          <option key={`${c.country}-${c.code}`} value={c.code}>{c.flag} {c.code}</option>
                        ))}
                      </select>
                      <input
                        type="text"
                        className="flex-1 bg-black/20 border border-white/10 rounded-lg p-3 text-sm outline-none focus:border-[#00B0F0] transition-colors"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400">Postal Code</label>
                    <input
                      type="text"
                      className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-sm outline-none focus:border-[#00B0F0] transition-colors"
                      value={postalCode}
                      onChange={e => setPostalCode(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400">Country</label>
                    <select
                      value={country}
                      onChange={e => setCountry(e.target.value)}
                      className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-sm outline-none focus:border-[#00B0F0] transition-colors cursor-pointer"
                    >
                      <option value="">Select a country</option>
                      {countriesList.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400">How heard about us?</label>
                    <select
                      value={howHeard}
                      onChange={e => setHowHeard(e.target.value)}
                      className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-sm outline-none focus:border-[#00B0F0] transition-colors cursor-pointer"
                    >
                      <option value="">Select an option</option>
                      <option value="Google">Google</option>
                      <option value="Social Media">Social Media</option>
                      <option value="Friend">Friend recommendation</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400">Senha</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="********"
                  className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-sm outline-none focus:border-[#00B0F0] transition-colors pr-10"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {isLogin && (
              <div className="flex justify-end">
                <a href="#" className="text-xs font-bold text-[#00B0F0] hover:text-[#00B0F0]/80 transition-colors">
                  Esqueci minha senha
                </a>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#00B0F0] text-white font-bold py-3 rounded-lg hover:brightness-110 active:scale-95 transition-all mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
              ) : (
                isLogin ? 'Entrar' : 'Criar Conta'
              )}
            </button>
          </form>

          <div className="mt-8 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-[#111114] px-2 text-gray-500">Ou entre com:</span>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <button
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 bg-white/5 border border-white/10 rounded-lg py-2.5 text-sm font-bold hover:bg-white/10 transition-colors"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
              Google
            </button>
            <button className="w-full flex items-center justify-center gap-3 bg-white/5 border border-white/10 rounded-lg py-2.5 text-sm font-bold hover:bg-white/10 transition-colors">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="#1877F2" xmlns="http://www.w3.org/2000/svg"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
              Facebook
            </button>
            <button className="w-full flex items-center justify-center gap-3 bg-white/5 border border-white/10 rounded-lg py-2.5 text-sm font-bold hover:bg-white/10 transition-colors">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12c0-5.523-4.477-10-10-10z" className="hidden" /><path d="M16.365 1.43c0 0-2.083.068-3.83 2.147-.037.043-1.611 1.966-1.526 4.122 0 0 2.267-.165 4.023-2.135.042-.047 1.57-1.895 1.333-4.134zm-4.38 6.44c-2.613-.227-4.634 1.472-5.715 1.472-1.082 0-2.71-1.41-4.81-1.37-2.75.05-5.29 1.6-6.7 4.06-2.85 4.93-.73 12.22 2.05 16.24 1.36 1.96 2.97 4.16 5.1 4.08 2.05-.08 2.83-1.33 5.3-1.33 2.45 0 3.17 1.33 5.34 1.29 2.21-.04 3.61-2.04 4.96-4 1.56-2.28 2.2-4.49 2.23-4.6-.05-.02-4.3-1.65-4.33-6.6-.03-4.15 3.39-6.14 3.55-6.23-1.94-2.84-4.95-3.23-6.03-3.35z" transform="scale(0.8) translate(3, 2)" /></svg>
              Apple
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

