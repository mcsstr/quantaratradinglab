import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  Shield, 
  Target, 
  Calendar, 
  BarChart2, 
  ArrowRight, 
  Sparkles, 
  ChevronRight, 
  ChevronDown,
  UploadCloud, 
  Check, 
  X, 
  Menu,
  DollarSign, 
  Zap, 
  Award, 
  Layers, 
  FileText, 
  Activity, 
  Globe
} from 'lucide-react';
import { usePlanConfig } from '../hooks/usePlanConfig';
import { getStoredLanguage, setStoredLanguage, t as tFunc, type Lang } from '../utils/i18n';

// Real Vector SVG Flags for 100% universal OS compatibility (Windows, Mac, iOS, Android)
const FlagUS = ({ className = "w-5 h-3.5" }: { className?: string }) => (
  <span className={`${className} inline-flex items-center justify-center rounded-[3px] overflow-hidden shadow-sm shrink-0 border border-white/20`}>
    <svg className="w-full h-full object-cover" viewBox="0 0 640 480">
      <g fillRule="evenodd">
        <path fill="#bd3d44" d="M0 0h640v480H0z"/>
        <path stroke="#fff" strokeWidth="37" d="M0 55.4h640M0 129.2h640M0 203h640M0 277h640M0 350.8h640M0 424.6h640"/>
        <path fill="#192f5d" d="M0 0h260v259H0z"/>
        <g fill="#fff">
          <circle cx="26" cy="24" r="8"/>
          <circle cx="78" cy="24" r="8"/>
          <circle cx="130" cy="24" r="8"/>
          <circle cx="182" cy="24" r="8"/>
          <circle cx="234" cy="24" r="8"/>
          <circle cx="52" cy="48" r="8"/>
          <circle cx="104" cy="48" r="8"/>
          <circle cx="156" cy="48" r="8"/>
          <circle cx="208" cy="48" r="8"/>
          <circle cx="26" cy="72" r="8"/>
          <circle cx="78" cy="72" r="8"/>
          <circle cx="130" cy="72" r="8"/>
          <circle cx="182" cy="72" r="8"/>
          <circle cx="234" cy="72" r="8"/>
          <circle cx="52" cy="96" r="8"/>
          <circle cx="104" cy="96" r="8"/>
          <circle cx="156" cy="96" r="8"/>
          <circle cx="208" cy="96" r="8"/>
          <circle cx="26" cy="120" r="8"/>
          <circle cx="78" cy="120" r="8"/>
          <circle cx="130" cy="120" r="8"/>
          <circle cx="182" cy="120" r="8"/>
          <circle cx="234" cy="120" r="8"/>
          <circle cx="52" cy="144" r="8"/>
          <circle cx="104" cy="144" r="8"/>
          <circle cx="156" cy="144" r="8"/>
          <circle cx="208" cy="144" r="8"/>
          <circle cx="26" cy="168" r="8"/>
          <circle cx="78" cy="168" r="8"/>
          <circle cx="130" cy="168" r="8"/>
          <circle cx="182" cy="168" r="8"/>
          <circle cx="234" cy="168" r="8"/>
          <circle cx="52" cy="192" r="8"/>
          <circle cx="104" cy="192" r="8"/>
          <circle cx="156" cy="192" r="8"/>
          <circle cx="208" cy="192" r="8"/>
          <circle cx="26" cy="216" r="8"/>
          <circle cx="78" cy="216" r="8"/>
          <circle cx="130" cy="216" r="8"/>
          <circle cx="182" cy="216" r="8"/>
          <circle cx="234" cy="216" r="8"/>
          <circle cx="52" cy="240" r="8"/>
          <circle cx="104" cy="240" r="8"/>
          <circle cx="156" cy="240" r="8"/>
          <circle cx="208" cy="240" r="8"/>
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

interface LanguageOption {
  code: Lang;
  label: string;
  FlagComponent: React.ComponentType<{ className?: string }>;
}

const LANGUAGES: LanguageOption[] = [
  { code: 'en', label: 'English', FlagComponent: FlagUS },
  { code: 'pt', label: 'Português', FlagComponent: FlagBR },
  { code: 'es', label: 'Español', FlagComponent: FlagES },
];

interface SimCurrency {
  code: string;
  symbol: string;
  rate: number;
  label: string;
}

const SIMULATOR_CURRENCIES: SimCurrency[] = [
  { code: 'BRL', symbol: 'R$', rate: 5.65, label: 'BRL (R$)' },
  { code: 'EUR', symbol: '€', rate: 0.92, label: 'EUR (€)' },
  { code: 'GBP', symbol: '£', rate: 0.79, label: 'GBP (£)' },
  { code: 'CAD', symbol: 'C$', rate: 1.36, label: 'CAD (C$)' },
  { code: 'AUD', symbol: 'A$', rate: 1.52, label: 'AUD (A$)' },
  { code: 'JPY', symbol: '¥', rate: 155.0, label: 'JPY (¥)' },
  { code: 'CHF', symbol: 'Fr', rate: 0.89, label: 'CHF (Fr)' },
  { code: 'MXN', symbol: 'Mex$', rate: 19.5, label: 'MXN ($)' },
  { code: 'CNY', symbol: '¥', rate: 7.23, label: 'CNY (¥)' },
  { code: 'INR', symbol: '₹', rate: 83.5, label: 'INR (₹)' },
  { code: 'USD', symbol: '$', rate: 1.0, label: 'USD ($)' },
];

export default function Landing() {
  const navigate = useNavigate();
  const [lang, setLang] = useState<Lang>(getStoredLanguage());
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState<boolean>(false);
  const langDropdownRef = useRef<HTMLDivElement>(null);

  // Dynamic Free Plan / Trial promotion from Admin configuration
  const { getFreePlan } = usePlanConfig();
  const freePlan = getFreePlan();
  const trialValue = freePlan?.trial_duration_value || freePlan?.trial_days || 0;
  const trialUnit = freePlan?.trial_duration_unit || 'days';
  const hasTrialPromo = trialValue > 0;

  // Language Change Handler
  const handleSelectLanguage = (newLang: Lang) => {
    setLang(newLang);
    setStoredLanguage(newLang);
    setLangDropdownOpen(false);
  };

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target as Node)) {
        setLangDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Interactive Simulator State
  const [simAccountSize, setSimAccountSize] = useState<number>(50000);
  const [simWinRate, setSimWinRate] = useState<number>(62);
  const [simAvgWin, setSimAvgWin] = useState<number>(380);
  const [simAvgLoss, setSimAvgLoss] = useState<number>(210);
  const [simTradesMonth, setSimTradesMonth] = useState<number>(32);
  const [simCurrencyCode, setSimCurrencyCode] = useState<string>('BRL');

  // Simulator Calculations
  const winRateDec = simWinRate / 100;
  const lossRateDec = (100 - simWinRate) / 100;
  const expectancy = (winRateDec * simAvgWin) - (lossRateDec * simAvgLoss);
  const estimatedMonthlyNet = Math.round(expectancy * simTradesMonth);
  const profitFactor = simAvgLoss > 0 && lossRateDec > 0 
    ? ((winRateDec * simAvgWin) / (lossRateDec * simAvgLoss)).toFixed(2) 
    : '0.00';

  const activeCurrencyObj = SIMULATOR_CURRENCIES.find(c => c.code === simCurrencyCode) || SIMULATOR_CURRENCIES[0];
  const estimatedConverted = Math.round(estimatedMonthlyNet * activeCurrencyObj.rate);

  // Dynamic CTA labels based on Admin Plan Promotion
  const getCtaLabel = (l: Lang) => {
    if (hasTrialPromo) {
      if (l === 'pt') {
        const unitLabel = trialUnit === 'days' ? (trialValue === 1 ? 'Dia' : 'Dias') : trialUnit === 'hours' ? 'Horas' : trialUnit === 'minutes' ? 'Minutos' : trialUnit === 'months' ? 'Meses' : 'Dias';
        return `Teste Grátis de ${trialValue} ${unitLabel}`;
      }
      if (l === 'es') {
        const unitLabel = trialUnit === 'days' ? (trialValue === 1 ? 'Día' : 'Días') : trialUnit === 'hours' ? 'Horas' : 'Días';
        return `Prueba Gratis de ${trialValue} ${unitLabel}`;
      }
      return `Start Free ${trialValue}-${trialUnit.replace(/s$/, '')} Trial`;
    }
    if (l === 'pt') return 'Começar Gratuitamente';
    if (l === 'es') return 'Comenzar Gratis';
    return 'Get Started Free';
  };

  const ctaPrimary = getCtaLabel(lang);
  const currentLangObj = LANGUAGES.find(l => l.code === lang) || LANGUAGES[0];

  // Helper shortcut for translations
  const t = (key: string) => tFunc(key, lang);

  // Features list
  const featuresList = [
    { icon: Shield, title: lang === 'pt' ? 'Proteção Anti-Pérdida & Regras de Mesa' : lang === 'es' ? 'Protección Anti-Pérdida y Reglas de Fondeo' : 'Drawdown Guard & Prop Compliance', desc: lang === 'pt' ? 'Configure limites diários de perda e monitore a margem de drawdown em tempo real.' : lang === 'es' ? 'Configura límites diarios de pérdida y monitorea el margen de drawdown restante en tiempo real.' : 'Configure dynamic daily loss limits and monitor trailing drawdown headroom in real time.' },
    { icon: Target, title: lang === 'pt' ? 'Esperança Matemática de Setups' : lang === 'es' ? 'Esperanza Matemática de Setups' : 'Mathematical Expectancy ($/Trade)', desc: lang === 'pt' ? 'Identifique quais estratégias são lucrativas e elimine as perdedoras com fórmulas estatísticas precisas.' : lang === 'es' ? 'Identifica qué estrategias son rentables y elimina las perdedoras con fórmulas estadísticas precisas.' : 'Isolate profitable strategies and eliminate losers with exact $/trade expectancy modeling.' },
    { icon: Calendar, title: lang === 'pt' ? 'Heatmap de Melhores Dias e Horários' : lang === 'es' ? 'Heatmap de Mejores Días y Horarios' : 'Time-of-Day & Day Heatmaps', desc: lang === 'pt' ? 'Descubra os dias da semana e franjas horárias mais lucrativas para maximizar seus ganhos.' : lang === 'es' ? 'Descubre los días de la semana y franjas horarias con mejor rendimiento para maximizar tu rentabilidad.' : 'Discover the most profitable days of the week and hourly windows to trade with confidence.' },
    { icon: UploadCloud, title: lang === 'pt' ? 'Importação Automática Multi-Plataforma' : lang === 'es' ? 'Importación Automática Multi-Plataforma' : 'Multi-Broker 1-Click Import', desc: lang === 'pt' ? 'Compatível com Tradovate, NinjaTrader, MetaTrader, CSVs customizados ou modo manual rápido.' : lang === 'es' ? 'Compatible con Tradovate, NinjaTrader, MetaTrader, CSVs personalizados o modo manual rápido.' : 'Seamless support for Tradovate, NinjaTrader 8, MetaTrader 4/5, custom CSVs, and manual entry.' },
    { icon: DollarSign, title: lang === 'pt' ? 'Conversão de Moeda e Profit Split' : lang === 'es' ? 'Conversión de Moneda y Split en Vivo' : 'Live Multi-Currency & Profit Split', desc: lang === 'pt' ? 'Cálculo de comissões por contrato, cotação cambial em tempo real e divisão líquida de lucros.' : lang === 'es' ? 'Cálculo de comisiones por contrato, tipo de cambio en tiempo real y división de beneficios neta.' : 'Exact per-contract fee deduction, live exchange rate conversions, and net payout splits.' },
    { icon: FileText, title: lang === 'pt' ? 'Relatórios Executivos em PDF' : lang === 'es' ? 'Informes Ejecutivos en PDF' : 'Executive PDF Performance Reports', desc: lang === 'pt' ? 'Gere relatórios completos em PDF de alta resolução com 1 clique para mentores ou investidores.' : lang === 'es' ? 'Genera informes completos en PDF de alta resolución con un solo clic para mentores o inversores.' : 'Export crystal-clear, high-resolution audit reports in a single click for investors and mentors.' }
  ];

  // FAQs
  const faqs = [
    { q: t('landing.faq.q1'), a: t('landing.faq.a1') },
    { q: t('landing.faq.q2'), a: t('landing.faq.a2') },
    { q: t('landing.faq.q3'), a: t('landing.faq.a3') },
    { q: t('landing.faq.q4'), a: t('landing.faq.a4') }
  ];

  return (
    <div className="min-h-screen bg-[#070709] text-white font-sans relative overflow-x-hidden select-none cursor-default">
      
      {/* Dynamic Ambient Background Glows */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] bg-amber-500/10 blur-[170px] rounded-full" />
        <div className="absolute top-[35%] right-[-10%] w-[55vw] h-[55vw] bg-yellow-500/5 blur-[180px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[20%] w-[50vw] h-[50vw] bg-amber-600/10 blur-[160px] rounded-full" />
      </div>

      {/* Fixed Navigation Header */}
      <header 
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-2xl bg-[#070709]/95 border-b border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.6)] transition-all"
        style={{
          paddingTop: 'env(safe-area-inset-top, 0px)',
          paddingLeft: 'env(safe-area-inset-left, 0px)',
          paddingRight: 'env(safe-area-inset-right, 0px)',
        }}
      >
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 h-16 sm:h-20 flex items-center justify-between gap-4">
          
          {/* Left: Logo Quantara */}
          <div 
            className="flex items-center gap-2.5 lg:gap-3 cursor-pointer active:opacity-70 transition-opacity shrink-0" 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <img
              src="/logo.png"
              alt="Quantara Logo"
              className="w-8 h-8 lg:w-9 lg:h-9 object-contain drop-shadow-md z-10 rounded-xl"
              onError={(e: any) => {
                e.target.style.display = 'none';
                if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
              }}
            />
            <div style={{ display: 'none' }} className="w-8 h-8 lg:w-9 lg:h-9 bg-yellow-500 rounded-xl items-center justify-center text-[#121C30] z-0 drop-shadow-md font-bold text-base">
              🐾
            </div>
            <h1 className="text-lg lg:text-xl font-extrabold tracking-tight font-display text-white">
              Quantara
            </h1>
          </div>

          {/* Center: Jump Nav Links (Desktop) */}
          <nav className="hidden lg:flex items-center justify-center gap-1 xl:gap-2 flex-1 mx-4">
            <a href="#dashboard-section" className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-gray-300 hover:text-amber-400 hover:bg-white/5 transition-all">{t('nav.dashboard')}</a>
            <a href="#analytics-section" className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-gray-300 hover:text-amber-400 hover:bg-white/5 transition-all">{t('nav.analytics')}</a>
            <a href="#calendar-section" className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-gray-300 hover:text-amber-400 hover:bg-white/5 transition-all">{t('nav.calendar')}</a>
            <a href="#trades-section" className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-gray-300 hover:text-amber-400 hover:bg-white/5 transition-all">{t('nav.trades')}</a>
            <a href="#setups-section" className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-gray-300 hover:text-amber-400 hover:bg-white/5 transition-all">{t('nav.setups')}</a>
            <a href="#news-section" className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-gray-300 hover:text-amber-400 hover:bg-white/5 transition-all">{t('nav.news')}</a>
            <a href="#import-section" className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-gray-300 hover:text-amber-400 hover:bg-white/5 transition-all">{t('nav.import')}</a>
            <a href="#simulator" className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-gray-300 hover:text-amber-400 hover:bg-white/5 transition-all">{t('nav.simulator')}</a>
            <a href="#faq" className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-gray-300 hover:text-amber-400 hover:bg-white/5 transition-all">{t('nav.faq')}</a>
          </nav>

          {/* Right: Flag Language Selector + Auth Buttons */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            
            {/* Language Selector Dropdown with Real Vector Flags */}
            <div className="relative" ref={langDropdownRef}>
              <button
                type="button"
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-xs font-bold text-gray-200 transition-all cursor-pointer shadow-sm active:scale-95 select-none"
                title="Select Language"
              >
                <currentLangObj.FlagComponent className="w-5 h-3.5" />
                <span className="uppercase text-[11px] font-extrabold text-gray-200">{currentLangObj.code}</span>
                <ChevronDown size={12} className={`text-gray-400 transition-transform ${langDropdownOpen ? 'rotate-180 text-amber-400' : ''}`} />
              </button>

              {langDropdownOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-[#0e0e14]/98 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-2xl py-1.5 z-50 animate-fadeIn select-none">
                  {LANGUAGES.map((l) => {
                    const Flag = l.FlagComponent;
                    return (
                      <button
                        key={l.code}
                        type="button"
                        onClick={() => handleSelectLanguage(l.code)}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-bold transition-colors cursor-pointer ${
                          lang === l.code ? 'bg-amber-500/15 text-amber-400' : 'text-gray-300 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
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

            {/* Sign In Button */}
            <button
              onClick={() => navigate('/auth')}
              className="text-xs font-bold text-gray-300 hover:text-white px-3 py-2 transition-colors hidden sm:block cursor-pointer select-none"
            >
              {t('nav.login')}
            </button>

            {/* Dynamic CTA Button */}
            <button
              onClick={() => navigate('/auth')}
              className="bg-gradient-to-r from-amber-500 to-yellow-400 text-black text-xs font-extrabold px-3.5 sm:px-5 py-2.5 rounded-xl shadow-[0_0_25px_rgba(245,158,11,0.35)] hover:shadow-[0_0_35px_rgba(245,158,11,0.5)] hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer select-none"
            >
              <span>{ctaPrimary}</span>
              <ArrowRight size={14} />
            </button>

            {/* Mobile Hamburger Menu Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-amber-400 hover:bg-white/10 transition-colors lg:hidden cursor-pointer select-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#0a0a0e]/98 border-b border-white/10 px-6 py-6 space-y-4 backdrop-blur-2xl shadow-2xl animate-fadeIn select-none">
            
            {/* Language Selector in Mobile Drawer */}
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t('settings.appLanguage')}:</span>
              <div className="flex items-center gap-2">
                {LANGUAGES.map((l) => {
                  const Flag = l.FlagComponent;
                  return (
                    <button
                      key={l.code}
                      onClick={() => handleSelectLanguage(l.code)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        lang === l.code ? 'bg-amber-500 text-black shadow-md' : 'bg-white/5 text-gray-300 hover:bg-white/10'
                      }`}
                    >
                      <Flag className="w-4 h-3" />
                      <span className="uppercase text-[11px] font-extrabold">{l.code}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-bold">
              <a 
                href="#dashboard-section" 
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-gray-200 hover:text-amber-400 hover:border-amber-500/30 transition-all flex items-center gap-2"
              >
                <Activity size={14} className="text-amber-400" />
                <span>{t('nav.dashboard')}</span>
              </a>
              <a 
                href="#analytics-section" 
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-gray-200 hover:text-cyan-400 hover:border-cyan-500/30 transition-all flex items-center gap-2"
              >
                <BarChart2 size={14} className="text-cyan-400" />
                <span>{t('nav.analytics')}</span>
              </a>
              <a 
                href="#calendar-section" 
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-gray-200 hover:text-emerald-400 hover:border-emerald-500/30 transition-all flex items-center gap-2"
              >
                <Calendar size={14} className="text-emerald-400" />
                <span>{t('nav.calendar')}</span>
              </a>
              <a 
                href="#trades-section" 
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-gray-200 hover:text-amber-400 hover:border-amber-500/30 transition-all flex items-center gap-2"
              >
                <TrendingUp size={14} className="text-amber-400" />
                <span>{t('nav.trades')}</span>
              </a>
              <a 
                href="#setups-section" 
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-gray-200 hover:text-yellow-400 hover:border-yellow-500/30 transition-all flex items-center gap-2"
              >
                <Layers size={14} className="text-yellow-400" />
                <span>{t('nav.setups')}</span>
              </a>
              <a 
                href="#news-section" 
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-gray-200 hover:text-amber-400 hover:border-amber-500/30 transition-all flex items-center gap-2"
              >
                <Globe size={14} className="text-amber-400" />
                <span>{t('nav.news')}</span>
              </a>
              <a 
                href="#import-section" 
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-gray-200 hover:text-emerald-400 hover:border-emerald-500/30 transition-all flex items-center gap-2"
              >
                <UploadCloud size={14} className="text-emerald-400" />
                <span>{t('nav.import')}</span>
              </a>
              <a 
                href="#simulator" 
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-gray-200 hover:text-amber-400 hover:border-amber-500/30 transition-all flex items-center gap-2"
              >
                <Zap size={14} className="text-amber-400" />
                <span>{t('nav.simulator')}</span>
              </a>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={() => { setMobileMenuOpen(false); navigate('/auth'); }}
                className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-xs hover:bg-white/10 transition-colors"
              >
                {t('nav.login')}
              </button>
              <button
                onClick={() => { setMobileMenuOpen(false); navigate('/auth'); }}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-black text-xs shadow-lg shadow-amber-500/20"
              >
                {ctaPrimary}
              </button>
            </div>
          </div>
        )}
      </header>

      {/* HERO SECTION */}
      <section 
        className="relative z-10 pb-16 px-4 max-w-7xl mx-auto flex flex-col items-center text-center"
        style={{
          paddingTop: 'calc(80px + env(safe-area-inset-top, 0px) + 2.5rem)'
        }}
      >
        
        {/* Top Eyebrow Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold tracking-wider uppercase mb-6 shadow-[0_0_30px_rgba(245,158,11,0.15)] animate-pulse">
          <Sparkles size={14} className="text-amber-400" />
          <span>{t('landing.badge')}</span>
        </div>

        {/* Main Hero Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black font-display tracking-tight text-white max-w-5xl leading-[1.1] mb-6">
          {t('landing.heroTitlePrefix')}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500">
            {t('landing.heroTitleHighlight')}
          </span>
          {t('landing.heroTitleSuffix')}
        </h1>

        {/* Subtitle */}
        <p className="text-gray-300 text-base sm:text-xl max-w-3xl leading-relaxed mb-10">
          {t('landing.heroDesc')}
        </p>

        {/* Hero CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center max-w-md mb-12">
          <button 
            onClick={() => navigate('/auth')} 
            className="w-full sm:w-auto bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 text-black px-8 py-4 rounded-2xl font-black text-base shadow-[0_0_35px_rgba(245,158,11,0.45)] hover:shadow-[0_0_50px_rgba(245,158,11,0.6)] hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{ctaPrimary}</span>
            <ArrowRight size={18} />
          </button>
          
          <a 
            href="#dashboard-section" 
            className="w-full sm:w-auto bg-white/5 hover:bg-white/10 border border-white/10 text-white px-8 py-4 rounded-2xl font-bold text-base transition-all flex items-center justify-center gap-2 backdrop-blur-md cursor-pointer"
          >
            <span>{t('landing.ctaSecondary')}</span>
            <ChevronRight size={18} className="text-amber-400" />
          </a>
        </div>

        {/* Quick Highlights KPI Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl pt-8 border-t border-white/5 mb-16">
          <div className="flex flex-col items-center p-4 rounded-2xl bg-white/[0.02] border border-white/5">
            <span className="text-2xl font-black text-amber-400">{t('landing.stats.pnlVal')}</span>
            <span className="text-xs text-gray-400 font-medium mt-1">{t('landing.stats.pnlTitle')}</span>
          </div>
          <div className="flex flex-col items-center p-4 rounded-2xl bg-white/[0.02] border border-white/5">
            <span className="text-2xl font-black text-emerald-400">{t('landing.stats.ddVal')}</span>
            <span className="text-xs text-gray-400 font-medium mt-1">{t('landing.stats.ddTitle')}</span>
          </div>
          <div className="flex flex-col items-center p-4 rounded-2xl bg-white/[0.02] border border-white/5">
            <span className="text-2xl font-black text-yellow-400">{t('landing.stats.importVal')}</span>
            <span className="text-xs text-gray-400 font-medium mt-1">{t('landing.stats.importTitle')}</span>
          </div>
          <div className="flex flex-col items-center p-4 rounded-2xl bg-white/[0.02] border border-white/5">
            <span className="text-2xl font-black text-cyan-400">{t('landing.stats.reportVal')}</span>
            <span className="text-xs text-gray-400 font-medium mt-1">{t('landing.stats.reportTitle')}</span>
          </div>
        </div>

        {/* Hero Featured Image Showcase */}
        <div className="w-full max-w-6xl rounded-3xl p-3 sm:p-4 bg-gradient-to-b from-[#18181e] via-[#101014] to-[#0a0a0c] border border-amber-500/30 shadow-[0_0_100px_rgba(245,158,11,0.15)] relative group">
          <div className="absolute top-0 left-1/4 right-1/4 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent"></div>
          <img
            src="/screenshots/dashboard-preview.png"
            alt="Quantara Institutional Trading Dashboard"
            className="w-full h-auto object-cover rounded-2xl border border-white/10 shadow-2xl transition-transform duration-700 group-hover:scale-[1.008]"
          />
        </div>

      </section>

      {/* TRUSTED PLATFORMS & BROKERS BAR */}
      <section className="relative z-10 py-10 border-y border-white/5 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-6">
            {t('landing.trustedBy')}
          </p>
          <div className="flex flex-wrap justify-center items-center gap-6 sm:gap-12 opacity-80">
            <span className="text-sm font-bold text-gray-300 tracking-wider flex items-center gap-1.5"><Award size={16} className="text-amber-400" /> TRADOVATE</span>
            <span className="text-sm font-bold text-gray-300 tracking-wider flex items-center gap-1.5"><Award size={16} className="text-amber-400" /> NINJATRADER 8</span>
            <span className="text-sm font-bold text-gray-300 tracking-wider flex items-center gap-1.5"><Award size={16} className="text-amber-400" /> METATRADER 4/5</span>
            <span className="text-sm font-bold text-gray-300 tracking-wider flex items-center gap-1.5"><Award size={16} className="text-amber-400" /> TRADINGVIEW</span>
            <span className="text-sm font-bold text-gray-300 tracking-wider flex items-center gap-1.5"><Award size={16} className="text-amber-400" /> APEX TRADER FUNDING</span>
            <span className="text-sm font-bold text-gray-300 tracking-wider flex items-center gap-1.5"><Award size={16} className="text-amber-400" /> TOPSTEP</span>
            <span className="text-sm font-bold text-gray-300 tracking-wider flex items-center gap-1.5"><Award size={16} className="text-amber-400" /> B3 FUTURES</span>
          </div>
        </div>
      </section>

      {/* EXTENSIVE VERTICAL PRODUCT SHOWCASE (ALL MODULES STACKED) */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-16 space-y-28">

        {/* ---------------------------------------------------- */}
        {/* MODULE 1: EXECUTIVE DASHBOARD */}
        {/* ---------------------------------------------------- */}
        <section id="dashboard-section" className="scroll-mt-32">
          <div className="rounded-3xl p-6 sm:p-10 lg:p-12 bg-gradient-to-b from-[#141419] to-[#09090c] border border-amber-500/25 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent"></div>

            {/* Section Header */}
            <div className="max-w-3xl mb-8">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold tracking-wider uppercase mb-3">
                <Activity size={14} />
                <span>{t('landing.module1.badge')}</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black font-display text-white mb-3">
                {t('landing.module1.title')}
              </h2>
              <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                {t('landing.module1.desc')}
              </p>
            </div>

            {/* Image Preview */}
            <div className="rounded-2xl overflow-hidden border border-white/10 bg-black/60 shadow-2xl mb-8 group">
              <img
                src="/screenshots/dashboard-preview.png"
                alt="Quantara Executive Dashboard"
                className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-[1.005]"
              />
            </div>

            {/* Action CTA */}
            <div className="pt-6 border-t border-white/5 flex items-center justify-between flex-wrap gap-4">
              <span className="text-xs text-gray-400 font-medium">{t('landing.module1.tag')}</span>
              <button 
                onClick={() => navigate('/auth')}
                className="bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 px-5 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer"
              >
                <span>{t('landing.module1.cta')}</span>
                <ArrowRight size={14} />
              </button>
            </div>

          </div>
        </section>

        {/* ---------------------------------------------------- */}
        {/* MODULE 2: DEEP ANALYTICS */}
        {/* ---------------------------------------------------- */}
        <section id="analytics-section" className="scroll-mt-32">
          <div className="rounded-3xl p-6 sm:p-10 lg:p-12 bg-gradient-to-b from-[#141419] to-[#09090c] border border-cyan-500/20 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent"></div>

            {/* Section Header */}
            <div className="max-w-3xl mb-8">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold tracking-wider uppercase mb-3">
                <BarChart2 size={14} />
                <span>{t('landing.module2.badge')}</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black font-display text-white mb-3">
                {t('landing.module2.title')}
              </h2>
              <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                {t('landing.module2.desc')}
              </p>
            </div>

            {/* Image Preview */}
            <div className="rounded-2xl overflow-hidden border border-white/10 bg-black/60 shadow-2xl mb-8 group">
              <img
                src="/screenshots/analytics-preview.png"
                alt="Quantara Deep Analytics"
                className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-[1.005]"
              />
            </div>

            {/* Action CTA */}
            <div className="pt-6 border-t border-white/5 flex items-center justify-between flex-wrap gap-4">
              <span className="text-xs text-gray-400 font-medium">{t('landing.module2.tag')}</span>
              <button 
                onClick={() => navigate('/auth')}
                className="bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 px-5 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer"
              >
                <span>{t('landing.module2.cta')}</span>
                <ArrowRight size={14} />
              </button>
            </div>

          </div>
        </section>

        {/* ---------------------------------------------------- */}
        {/* MODULE 3: PERFORMANCE CALENDAR */}
        {/* ---------------------------------------------------- */}
        <section id="calendar-section" className="scroll-mt-32">
          <div className="rounded-3xl p-6 sm:p-10 lg:p-12 bg-gradient-to-b from-[#141419] to-[#09090c] border border-emerald-500/20 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent"></div>

            {/* Section Header */}
            <div className="max-w-3xl mb-8">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold tracking-wider uppercase mb-3">
                <Calendar size={14} />
                <span>{t('landing.module3.badge')}</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black font-display text-white mb-3">
                {t('landing.module3.title')}
              </h2>
              <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                {t('landing.module3.desc')}
              </p>
            </div>

            {/* Image Preview */}
            <div className="rounded-2xl overflow-hidden border border-white/10 bg-black/60 shadow-2xl mb-8 group">
              <img
                src="/screenshots/calendar-preview.png"
                alt="Quantara Performance Calendar"
                className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-[1.005]"
              />
            </div>

            {/* Action CTA */}
            <div className="pt-6 border-t border-white/5 flex items-center justify-between flex-wrap gap-4">
              <span className="text-xs text-gray-400 font-medium">{t('landing.module3.tag')}</span>
              <button 
                onClick={() => navigate('/auth')}
                className="bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 px-5 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer"
              >
                <span>{t('landing.module3.cta')}</span>
                <ArrowRight size={14} />
              </button>
            </div>

          </div>
        </section>

        {/* ---------------------------------------------------- */}
        {/* MODULE 4: TRADES EXECUTION LOG */}
        {/* ---------------------------------------------------- */}
        <section id="trades-section" className="scroll-mt-32">
          <div className="rounded-3xl p-6 sm:p-10 lg:p-12 bg-gradient-to-b from-[#141419] to-[#09090c] border border-amber-500/25 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent"></div>

            {/* Section Header */}
            <div className="max-w-3xl mb-8">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold tracking-wider uppercase mb-3">
                <TrendingUp size={14} />
                <span>{t('landing.module4.badge')}</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black font-display text-white mb-3">
                {t('landing.module4.title')}
              </h2>
              <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                {t('landing.module4.desc')}
              </p>
            </div>

            {/* Image Preview */}
            <div className="rounded-2xl overflow-hidden border border-white/10 bg-black/60 shadow-2xl mb-8 group">
              <img
                src="/screenshots/trades-history-preview.jpg"
                alt="Quantara Trades Execution History"
                className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-[1.005]"
              />
            </div>

            {/* Action CTA */}
            <div className="pt-6 border-t border-white/5 flex items-center justify-between flex-wrap gap-4">
              <span className="text-xs text-gray-400 font-medium">{t('landing.module4.tag')}</span>
              <button 
                onClick={() => navigate('/auth')}
                className="bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 px-5 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer"
              >
                <span>{t('landing.module4.cta')}</span>
                <ArrowRight size={14} />
              </button>
            </div>

          </div>
        </section>

        {/* ---------------------------------------------------- */}
        {/* MODULE 5: SETUPS LAB */}
        {/* ---------------------------------------------------- */}
        <section id="setups-section" className="scroll-mt-32">
          <div className="rounded-3xl p-6 sm:p-10 lg:p-12 bg-gradient-to-b from-[#141419] to-[#09090c] border border-yellow-500/25 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent"></div>

            {/* Section Header */}
            <div className="max-w-3xl mb-8">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-xs font-bold tracking-wider uppercase mb-3">
                <Layers size={14} />
                <span>{t('landing.module5.badge')}</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black font-display text-white mb-3">
                {t('landing.module5.title')}
              </h2>
              <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                {t('landing.module5.desc')}
              </p>
            </div>

            {/* Image Preview */}
            <div className="rounded-2xl overflow-hidden border border-white/10 bg-black/60 shadow-2xl mb-8 group">
              <img
                src="/screenshots/setups-curves-preview.png"
                alt="Quantara Setups Multi-Curve Strategy Lab"
                className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-[1.005]"
              />
            </div>

            {/* Action CTA */}
            <div className="pt-6 border-t border-white/5 flex items-center justify-between flex-wrap gap-4">
              <span className="text-xs text-gray-400 font-medium">{t('landing.module5.tag')}</span>
              <button 
                onClick={() => navigate('/auth')}
                className="bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 px-5 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer"
              >
                <span>{t('landing.module5.cta')}</span>
                <ArrowRight size={14} />
              </button>
            </div>

          </div>
        </section>

        {/* ---------------------------------------------------- */}
        {/* MODULE 6: ECONOMIC CALENDAR & NEWS */}
        {/* ---------------------------------------------------- */}
        <section id="news-section" className="scroll-mt-32">
          <div className="rounded-3xl p-6 sm:p-10 lg:p-12 bg-gradient-to-b from-[#141419] to-[#09090c] border border-amber-500/25 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent"></div>

            {/* Section Header */}
            <div className="max-w-3xl mb-8">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold tracking-wider uppercase mb-3">
                <Globe size={14} />
                <span>{t('landing.module6.badge')}</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black font-display text-white mb-3">
                {t('landing.module6.title')}
              </h2>
              <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                {t('landing.module6.desc')}
              </p>
            </div>

            {/* Image Preview */}
            <div className="rounded-2xl overflow-hidden border border-white/10 bg-black/60 shadow-2xl mb-8 group">
              <img
                src="/screenshots/news-calendar-preview.jpg"
                alt="Quantara Economic News Calendar"
                className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-[1.005]"
              />
            </div>

            {/* Action CTA */}
            <div className="pt-6 border-t border-white/5 flex items-center justify-between flex-wrap gap-4">
              <span className="text-xs text-gray-400 font-medium">{t('landing.module6.tag')}</span>
              <button 
                onClick={() => navigate('/auth')}
                className="bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 px-5 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer"
              >
                <span>{t('landing.module6.cta')}</span>
                <ArrowRight size={14} />
              </button>
            </div>

          </div>
        </section>

        {/* ---------------------------------------------------- */}
        {/* MODULE 7: IMPORT & PLATFORM ENGINE */}
        {/* ---------------------------------------------------- */}
        <section id="import-section" className="scroll-mt-32">
          <div className="rounded-3xl p-6 sm:p-10 lg:p-12 bg-gradient-to-b from-[#141419] to-[#09090c] border border-emerald-500/25 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent"></div>

            {/* Section Header */}
            <div className="max-w-3xl mb-8">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold tracking-wider uppercase mb-3">
                <UploadCloud size={14} />
                <span>{t('landing.module7.badge')}</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black font-display text-white mb-3">
                {t('landing.module7.title')}
              </h2>
              <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                {t('landing.module7.desc')}
              </p>
            </div>

            {/* Interactive Platform Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="p-6 rounded-2xl bg-black/40 border border-white/10 flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 mb-4">
                  <UploadCloud size={24} />
                </div>
                <h3 className="text-base font-bold text-white mb-1">{t('landing.platform.tradovate.title')}</h3>
                <p className="text-xs text-gray-400">{t('landing.platform.tradovate.desc')}</p>
              </div>

              <div className="p-6 rounded-2xl bg-black/40 border border-white/10 flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 mb-4">
                  <UploadCloud size={24} />
                </div>
                <h3 className="text-base font-bold text-white mb-1">{t('landing.platform.ninja.title')}</h3>
                <p className="text-xs text-gray-400">{t('landing.platform.ninja.desc')}</p>
              </div>

              <div className="p-6 rounded-2xl bg-black/40 border border-white/10 flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center text-yellow-400 mb-4">
                  <UploadCloud size={24} />
                </div>
                <h3 className="text-base font-bold text-white mb-1">{t('landing.platform.mt.title')}</h3>
                <p className="text-xs text-gray-400">{t('landing.platform.mt.desc')}</p>
              </div>

              <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-500/15 to-transparent border border-amber-500/40 flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 mb-4">
                  <Zap size={24} />
                </div>
                <h3 className="text-base font-black text-amber-400 mb-1">{t('landing.platform.manual.title')}</h3>
                <p className="text-xs text-gray-300">{t('landing.platform.manual.desc')}</p>
              </div>
            </div>

            {/* Action CTA */}
            <div className="pt-6 border-t border-white/5 flex items-center justify-between flex-wrap gap-4">
              <span className="text-xs text-gray-400 font-medium">{t('landing.module7.tag')}</span>
              <button 
                onClick={() => navigate('/auth')}
                className="bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 px-5 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer"
              >
                <span>{t('landing.module7.cta')}</span>
                <ArrowRight size={14} />
              </button>
            </div>

          </div>
        </section>

      </div>

      {/* INTERACTIVE MATHEMATICAL SIMULATOR */}
      <section id="simulator" className="relative z-10 py-20 px-4 max-w-7xl mx-auto border-t border-white/5 scroll-mt-32">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-400 mb-2 block">{t('landing.sim.eyebrow')}</span>
          <h2 className="text-3xl sm:text-5xl font-black font-display tracking-tight text-white mb-4">
            {t('landing.sim.title')}
          </h2>
          <p className="text-gray-300 text-base sm:text-lg">
            {t('landing.sim.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-gradient-to-br from-[#16161a] to-[#0d0e12] border border-amber-500/20 p-6 sm:p-10 rounded-3xl shadow-2xl">
          {/* Controls */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-bold text-gray-300">{t('landing.sim.accountSize')}</span>
                <span className="text-sm font-black text-amber-400">${simAccountSize.toLocaleString()}</span>
              </div>
              <input 
                type="range" 
                min="10000" 
                max="300000" 
                step="5000" 
                value={simAccountSize} 
                onChange={(e) => setSimAccountSize(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer h-2 bg-white/10 rounded-lg" 
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-bold text-gray-300">{t('landing.sim.winRate')}</span>
                <span className="text-sm font-black text-amber-400">{simWinRate}%</span>
              </div>
              <input 
                type="range" 
                min="30" 
                max="85" 
                step="1" 
                value={simWinRate} 
                onChange={(e) => setSimWinRate(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer h-2 bg-white/10 rounded-lg" 
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-400 block mb-1 select-none">{t('landing.sim.avgWin')}</label>
                <input 
                  type="number" 
                  value={simAvgWin} 
                  onChange={(e) => setSimAvgWin(Number(e.target.value))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm font-bold text-white focus:border-amber-500 outline-none select-text cursor-text" 
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 block mb-1 select-none">{t('landing.sim.avgLoss')}</label>
                <input 
                  type="number" 
                  value={simAvgLoss} 
                  onChange={(e) => setSimAvgLoss(Number(e.target.value))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm font-bold text-white focus:border-amber-500 outline-none select-text cursor-text" 
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-bold text-gray-300">{t('landing.sim.tradesMonth')}</span>
                <span className="text-sm font-black text-amber-400">{simTradesMonth}</span>
              </div>
              <input 
                type="range" 
                min="5" 
                max="120" 
                step="1" 
                value={simTradesMonth} 
                onChange={(e) => setSimTradesMonth(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer h-2 bg-white/10 rounded-lg" 
              />
            </div>
          </div>

          {/* Results Box */}
          <div className="lg:col-span-5 bg-black/50 border border-amber-500/30 rounded-2xl p-6 flex flex-col gap-5 shadow-2xl relative overflow-hidden">
            
            {/* Currency Selector Row */}
            <div className="flex items-center justify-between bg-white/[0.03] p-2.5 rounded-xl border border-white/5">
              <span className="text-xs text-gray-300 font-bold flex items-center gap-1.5">
                <Globe size={14} className="text-amber-400" />
                {t('landing.sim.selectCurrency')}
              </span>
              <select
                value={simCurrencyCode}
                onChange={(e) => setSimCurrencyCode(e.target.value)}
                className="bg-[#121216] border border-amber-500/30 text-amber-400 font-bold text-xs px-2.5 py-1 rounded-lg outline-none cursor-pointer hover:border-amber-400 transition-colors"
              >
                {SIMULATOR_CURRENCIES.map(c => (
                  <option key={c.code} value={c.code} className="bg-[#121216] text-white">
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">{t('landing.sim.monthlyNet')} (USD)</span>
              <span className={`text-2xl sm:text-3xl font-black ${estimatedMonthlyNet >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {estimatedMonthlyNet >= 0 ? `+$${estimatedMonthlyNet.toLocaleString()}` : `-$${Math.abs(estimatedMonthlyNet).toLocaleString()}`}
              </span>
            </div>

            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">{t('landing.sim.converted')} ({simCurrencyCode})</span>
              <span className="text-xl font-bold text-amber-400">
                {activeCurrencyObj.symbol} {estimatedConverted.toLocaleString()}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-[10px] text-gray-400 uppercase font-bold block mb-1">{t('landing.sim.expectancy')}</span>
                <strong className={`text-base font-black ${expectancy >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  ${expectancy.toFixed(2)} / trade
                </strong>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-[10px] text-gray-400 uppercase font-bold block mb-1">{t('landing.sim.profitFactor')}</span>
                <strong className="text-base font-black text-amber-400">
                  {profitFactor}
                </strong>
              </div>
            </div>

            <button 
              onClick={() => navigate('/auth')} 
              className="w-full mt-2 bg-gradient-to-r from-amber-500 to-yellow-400 text-black py-3.5 rounded-xl font-black text-sm hover:brightness-110 active:scale-95 transition-all shadow-[0_0_20px_rgba(245,158,11,0.4)] cursor-pointer"
            >
              {t('landing.sim.applyBtn')}
            </button>
          </div>
        </div>
      </section>

      {/* CORE FEATURES GRID */}
      <section id="features" className="relative z-10 py-20 px-4 max-w-7xl mx-auto border-t border-white/5 scroll-mt-32">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-400 mb-2 block">{t('landing.features.eyebrow')}</span>
          <h2 className="text-3xl sm:text-5xl font-black font-display tracking-tight text-white mb-4">
            {t('landing.features.title')}
          </h2>
          <p className="text-gray-300 text-base sm:text-lg">
            {t('landing.features.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuresList.map((feat, i) => {
            const Icon = feat.icon;
            return (
              <div 
                key={i} 
                className="p-6 rounded-2xl bg-gradient-to-b from-[#16161a] to-[#0d0e12] border border-white/5 hover:border-amber-500/40 transition-all hover:-translate-y-1 shadow-lg group flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                    <Icon size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{feat.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed mb-4">{feat.desc}</p>
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-amber-400 opacity-80 group-hover:opacity-100 transition-opacity">
                  <span>{t('landing.features.learnMore')}</span> <ChevronRight size={14} />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* COMPARISON TABLE */}
      <section id="compare" className="relative z-10 py-20 px-4 max-w-6xl mx-auto border-t border-white/5 scroll-mt-32">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl sm:text-4xl font-black font-display text-white mb-3">
            {t('landing.compare.title')}
          </h2>
          <p className="text-gray-400 text-sm sm:text-base">
            {t('landing.compare.subtitle')}
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 overflow-hidden bg-[#101014] shadow-2xl">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02]">
                <th className="p-4 sm:p-6 text-gray-400 font-bold">{t('landing.compare.featureCol')}</th>
                <th className="p-4 sm:p-6 text-amber-400 font-black bg-amber-500/10 text-center">{t('landing.compare.quantaraCol')}</th>
                <th className="p-4 sm:p-6 text-gray-500 font-medium text-center">{t('landing.compare.sheetsCol')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <tr>
                <td className="p-4 sm:p-6 font-bold text-white">{t('landing.compare.row1.feature')}</td>
                <td className="p-4 sm:p-6 text-center bg-amber-500/5 text-emerald-400 font-bold">{t('landing.compare.row1.quantara')}</td>
                <td className="p-4 sm:p-6 text-center text-gray-500">{t('landing.compare.row1.sheets')}</td>
              </tr>
              <tr>
                <td className="p-4 sm:p-6 font-bold text-white">{t('landing.compare.row2.feature')}</td>
                <td className="p-4 sm:p-6 text-center bg-amber-500/5 text-emerald-400 font-bold">{t('landing.compare.row2.quantara')}</td>
                <td className="p-4 sm:p-6 text-center text-gray-500">{t('landing.compare.row2.sheets')}</td>
              </tr>
              <tr>
                <td className="p-4 sm:p-6 font-bold text-white">{t('landing.compare.row3.feature')}</td>
                <td className="p-4 sm:p-6 text-center bg-amber-500/5 text-emerald-400 font-bold">{t('landing.compare.row3.quantara')}</td>
                <td className="p-4 sm:p-6 text-center text-gray-500">{t('landing.compare.row3.sheets')}</td>
              </tr>
              <tr>
                <td className="p-4 sm:p-6 font-bold text-white">{t('landing.compare.row4.feature')}</td>
                <td className="p-4 sm:p-6 text-center bg-amber-500/5 text-emerald-400 font-bold">{t('landing.compare.row4.quantara')}</td>
                <td className="p-4 sm:p-6 text-center text-gray-500">{t('landing.compare.row4.sheets')}</td>
              </tr>
              <tr>
                <td className="p-4 sm:p-6 font-bold text-white">{t('landing.compare.row5.feature')}</td>
                <td className="p-4 sm:p-6 text-center bg-amber-500/5 text-emerald-400 font-bold">{t('landing.compare.row5.quantara')}</td>
                <td className="p-4 sm:p-6 text-center text-gray-500">{t('landing.compare.row5.sheets')}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section id="faq" className="relative z-10 py-16 px-4 max-w-4xl mx-auto border-t border-white/5 scroll-mt-32">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-black font-display text-white mb-3">
            {t('landing.faq.title')}
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div 
              key={i} 
              className="rounded-2xl border border-white/10 bg-[#121216] overflow-hidden transition-all"
            >
              <button
                type="button"
                onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                className="w-full p-5 text-left font-bold text-sm sm:text-base text-white flex items-center justify-between gap-4 hover:text-amber-400 transition-colors cursor-pointer"
              >
                <span>{faq.q}</span>
                <ChevronRight 
                  size={18} 
                  className={`text-amber-400 transition-transform ${activeFaq === i ? 'rotate-90' : ''}`} 
                />
              </button>
              {activeFaq === i && (
                <div className="px-5 pb-5 text-xs sm:text-sm text-gray-400 leading-relaxed border-t border-white/5 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* FINAL CALL TO ACTION BANNER */}
      <section className="relative z-10 py-20 px-4 max-w-6xl mx-auto">
        <div className="rounded-3xl p-8 sm:p-16 bg-gradient-to-r from-amber-600/30 via-yellow-500/20 to-amber-600/30 border border-amber-500/40 text-center relative overflow-hidden shadow-[0_0_80px_rgba(245,158,11,0.25)]">
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-3xl sm:text-5xl font-black font-display text-white">
              {t('landing.ctaBottom.title')}
            </h2>
            <p className="text-gray-200 text-sm sm:text-lg">
              {t('landing.ctaBottom.desc')}
            </p>
            <button
              onClick={() => navigate('/auth')}
              className="bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 text-black font-black px-10 py-4 rounded-2xl text-base shadow-[0_0_35px_rgba(245,158,11,0.5)] hover:shadow-[0_0_50px_rgba(245,158,11,0.7)] hover:brightness-110 active:scale-95 transition-all inline-flex items-center gap-2 cursor-pointer"
            >
              <span>{ctaPrimary}</span>
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 py-12 border-t border-white/5 bg-[#050507]">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 flex flex-col md:flex-row items-center justify-between gap-6">
          
          <div 
            className="flex items-center gap-2.5 lg:gap-3 cursor-pointer active:opacity-70 transition-opacity" 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <img
              src="/logo.png"
              alt="Quantara Logo"
              className="w-8 h-8 lg:w-9 lg:h-9 object-contain drop-shadow-md z-10 rounded-xl"
              onError={(e: any) => {
                e.target.style.display = 'none';
                if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
              }}
            />
            <div style={{ display: 'none' }} className="w-8 h-8 lg:w-9 lg:h-9 bg-yellow-500 rounded-xl items-center justify-center text-[#121C30] z-0 drop-shadow-md font-bold text-base">
              🐾
            </div>
            <h1 className="text-lg lg:text-xl font-extrabold tracking-tight font-display text-white">
              Quantara
            </h1>
          </div>

          <div className="text-xs text-gray-500 text-center">
            © {new Date().getFullYear()} Quantara Trading Lab. All rights reserved. Precision analytics for modern traders.
          </div>

          <div className="flex items-center gap-4 text-xs font-bold text-gray-400">
            <a href="#dashboard-section" className="hover:text-amber-400 transition-colors">{t('nav.dashboard')}</a>
            <a href="#simulator" className="hover:text-amber-400 transition-colors">{t('nav.simulator')}</a>
            <button onClick={() => navigate('/auth')} className="hover:text-amber-400 transition-colors cursor-pointer">{t('nav.login')}</button>
          </div>

        </div>
      </footer>

    </div>
  );
}
