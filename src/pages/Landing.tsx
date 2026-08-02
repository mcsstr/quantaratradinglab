import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Play,
  Activity,
  BarChart2,
  TrendingUp,
  Shield,
  Calendar,
  Layers,
  BookOpen,
  UploadCloud,
  CheckCircle2,
  DollarSign,
  PieChart,
  Lock,
  ChevronRight,
  Zap,
  Globe,
  Award,
  Sliders,
  FileText,
  Clock,
  Sparkles,
  HelpCircle,
  ChevronDown,
  ExternalLink,
  Target,
  ArrowUpRight,
  Check,
  X
} from 'lucide-react';

type Lang = 'pt' | 'en' | 'es';

export default function Landing() {
  const navigate = useNavigate();
  const [lang, setLang] = useState<Lang>('pt');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'analytics' | 'calendar' | 'trades' | 'setups' | 'journal' | 'import'>('dashboard');
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // Simulator State
  const [simAccountSize, setSimAccountSize] = useState<number>(50000);
  const [simWinRate, setSimWinRate] = useState<number>(55);
  const [simAvgWin, setSimAvgWin] = useState<number>(350);
  const [simAvgLoss, setSimAvgLoss] = useState<number>(200);
  const [simTradesMonth, setSimTradesMonth] = useState<number>(30);

  // Calculations for Simulator
  const winFraction = simWinRate / 100;
  const lossFraction = 1 - winFraction;
  const expectancy = (winFraction * simAvgWin) - (lossFraction * simAvgLoss);
  const estimatedMonthlyNet = Math.round(expectancy * simTradesMonth);
  const estimatedBrl = Math.round(estimatedMonthlyNet * 5.15);
  const profitFactor = (simAvgLoss * lossFraction) > 0 
    ? ((simAvgWin * winFraction) / (simAvgLoss * lossFraction)).toFixed(2) 
    : '9.99';

  // Language texts
  const t = {
    pt: {
      badge: 'NOVA VERSÃO 2.0 • SUÍTE COMPLETA PARA TRADERS PROFISSIONAIS',
      heroTitlePrefix: 'Domine Seus Trades com ',
      heroTitleHighlight: 'Métricas Institucionais',
      heroTitleSuffix: ' de Alta Precisão',
      heroDesc: 'O workspace definitivo para traders de Futuros, Forex, Ações e Cripto. Valide setups matemáticos, monitore drawdowns em tempo real, proteja seu capital e conquiste aprovações em mesas proprietárias.',
      ctaPrimary: 'Começar Gratuitamente',
      ctaSecondary: 'Explorar Demonstração',
      trustedBy: 'INTEGRAÇÃO & COMPATIBILIDADE COM AS PRINCIPAIS PLATAFORMAS & MESAS',
      tabs: {
        dashboard: 'Executive Dashboard',
        analytics: 'Analytics Avançado',
        calendar: 'Calendário de Performance',
        trades: 'Histórico & Execução',
        setups: 'Setups & Expectativa',
        journal: 'Diário & Psicologia',
        import: 'Importação & Plataformas'
      },
      showcaseTitles: {
        dashboard: 'Visão Executiva & Controle de Risco em Tempo Real',
        dashboardDesc: 'Monitore Saldo Atual, P&L Líquido, Curva de Equidade com Linha de Tendência, Trailing Drawdown e Trava de Limite Diário (Stop Diário) para nunca violar regras de gestão.',
        analytics: 'Diagnóstico Profundo de Performance & Avaliações',
        analyticsDesc: 'Descubra sua taxa de acerto por direção (Long vs Short), P&L por Ativo (MNQ, NQ, ES, CL), evolução mensal e metas de consistência exigidas por mesas proprietárias.',
        calendar: 'Calendário Interativo com Heatmap & Resumos Semanais',
        calendarDesc: 'Visualize instantaneamente seus dias de ganho e perda no mês, taxa de acerto diária, volume de trades e resumos semanais de W1 a W6 com zoom detalhado de operações.',
        trades: 'Tabela de Trades Inteligente com Filtros Instantâneos',
        tradesDesc: 'Histórico completo de ordens com preço de entrada/saída, comissões descontadas, direção (Buy/Sell) e filtros inteligentes por ativo, mês e dias da semana.',
        setups: 'Laboratório de Validação de Estratégias & Relatórios PDF',
        setupsDesc: 'Compare a curva de equidade de cada setup contra a conta geral, calcule a expectativa matemática ($/trade) e gere relatórios executivos em PDF com 1 clique.',
        journal: 'Diário Emocional & Registro de Operações',
        journalDesc: 'Registre reflexões diárias, estado psicológico, notas de pré/pós-mercado, prints de gráficos e sincronização com eventos econômicos de alto impacto.',
        import: 'Importação Automática & Modo Simplificado',
        importDesc: 'Conecte arquivos CSV do Tradovate, NinjaTrader, MetaTrader 4/5 ou insira trades manualmente sem complicações através do formulário simplificado.'
      },
      featuresTitle: 'Recursos Criados para a Sua Consistência',
      featuresSubtitle: 'Cada ferramenta do Quantara foi desenvolvida para solucionar as maiores dores de traders individuais e participantes de mesas proprietárias.',
      features: [
        {
          icon: Shield,
          title: 'Proteção Anti-Quebra & Regras de Mesa',
          desc: 'Configure limites de perda diária ($ ou %) e acompanhe o drawdown restante em tempo real para evitar desqualificações acidentais.'
        },
        {
          icon: Target,
          title: 'Expectativa Matemática de Setups',
          desc: 'Descubra exatamente quais estratégias colocam dinheiro no seu bolso e quais estão drenando seu capital através da fórmula de Expectancy.'
        },
        {
          icon: Calendar,
          title: 'Heatmap de Melhores Dias e Horários',
          desc: 'Identifique seus dias mais lucrativos da semana e as melhores janelas horárias de operação para focar seu tempo onde o retorno é máximo.'
        },
        {
          icon: UploadCloud,
          title: 'Importação Rápida Multi-Plataforma',
          desc: 'Suporte a Tradovate, NinjaTrader, MetaTrader, TradingView, planilhas CSV personalizadas e formulário manual ultra simplificado.'
        },
        {
          icon: DollarSign,
          title: 'Conversão em Tempo Real & Split BRL',
          desc: 'Cálculo automático de comissões por contrato, taxa de câmbio USD/BRL e visualização do seu profit split líquido real.'
        },
        {
          icon: FileText,
          title: 'Relatórios Executivos em PDF',
          desc: 'Exporte relatórios completos em alta resolução para investidores, mentores ou comprovação de histórico com layout impecável.'
        }
      ],
      simTitle: 'Simulador Interativo de Lucro & Expectativa',
      simSubtitle: 'Ajuste os parâmetros abaixo e veja o impacto da consistência matemática no seu resultado mensal:',
      simAccount: 'Tamanho da Conta:',
      simWinRateLabel: 'Taxa de Acerto (Win Rate):',
      simAvgWinLabel: 'Ganho Médio por Trade ($):',
      simAvgLossLabel: 'Perda Média por Trade ($):',
      simTradesLabel: 'Trades por Mês:',
      simResNet: 'P&L Líquido Estimado:',
      simResBrl: 'Equivalente em Reais (BRL):',
      simResExp: 'Expectativa Matemática:',
      simResPF: 'Profit Factor Projetado:',
      compareTitle: 'Por que o Quantara supera planilhas comuns?',
      compareSubtitle: 'Compare a experiência profissional do Quantara contra soluções improvisadas.',
      faqTitle: 'Perguntas Frequentes',
      ctaBottomTitle: 'Pronto para Transformar Seus Resultados?',
      ctaBottomDesc: 'Crie sua conta agora e comece a analisar seus trades com a precisão dos melhores fundos e traders institucionais.',
      ctaBottomBtn: 'Começar Agora Gratuitamente',
      loginBtn: 'Entrar na Conta'
    },
    en: {
      badge: 'NEW VERSION 2.0 • COMPLETE SUITE FOR PROFESSIONAL TRADERS',
      heroTitlePrefix: 'Master Your Trades with ',
      heroTitleHighlight: 'Institutional-Grade',
      heroTitleSuffix: ' Precision Analytics',
      heroDesc: 'The ultimate workspace for Futures, Forex, Stock and Crypto traders. Validate mathematical setups, monitor real-time drawdowns, protect capital and pass prop firm challenges.',
      ctaPrimary: 'Start Free Trial',
      ctaSecondary: 'Explore Live Demo',
      trustedBy: 'SEAMLESS COMPATIBILITY WITH LEADING BROKERS & PROP FIRMS',
      tabs: {
        dashboard: 'Executive Dashboard',
        analytics: 'Deep Analytics',
        calendar: 'Performance Calendar',
        trades: 'Trades & Execution',
        setups: 'Setups & Expectancy',
        journal: 'Journal & Psychology',
        import: 'Import & Brokers'
      },
      showcaseTitles: {
        dashboard: 'Executive Overview & Real-Time Risk Control',
        dashboardDesc: 'Monitor Current Balance, Net P&L, Equity Curve with Linear Trendline, Trailing Drawdown, and Daily Loss Limit stop guard.',
        analytics: 'Deep Performance Diagnostics & Prop Firm Evaluations',
        analyticsDesc: 'Break down your win rate by direction (Long vs Short), P&L by Symbol (MNQ, NQ, ES, CL), monthly histograms and consistency scores.',
        calendar: 'Interactive Calendar with Heatmap & Weekly Summaries',
        calendarDesc: 'Instantly view daily win/loss distribution, win rates, trade volume, and weekly summaries (W1 to W6) with 1-click day zoom.',
        trades: 'Smart Execution Table with Instant Filters',
        tradesDesc: 'Comprehensive execution log with fill prices, commissions subtracted, direction tags (Buy/Sell), and symbol/date filters.',
        setups: 'Strategy Validation Lab & Printable PDF Reports',
        setupsDesc: 'Overlay setup equity curves on top of account equity, calculate mathematical expectancy ($/trade), and export clean PDF reports.',
        journal: 'Psychological Journal & Daily Notes',
        journalDesc: 'Record pre/post market reflections, mental states, trade chart attachments, and synced high-impact economic news events.',
        import: 'Automated Broker Import & Simplified Input',
        importDesc: 'Seamlessly upload CSVs from Tradovate, NinjaTrader, MetaTrader 4/5, or use the fast streamlined manual trade entry form.'
      },
      featuresTitle: 'Built for Serious Consistency',
      featuresSubtitle: 'Every tool in Quantara was engineered to solve real pains faced by retail traders and prop firm participants.',
      features: [
        {
          icon: Shield,
          title: 'Risk Protection & Prop Firm Rules',
          desc: 'Set custom daily stop limits ($ or %) and track trailing drawdown buffer in real-time to avoid blowing funded challenges.'
        },
        {
          icon: Target,
          title: 'Mathematical Expectancy Edge',
          desc: 'Quantify which setups are truly profitable and prune losing strategies using rigorous mathematical expectancy formulas.'
        },
        {
          icon: Calendar,
          title: 'Optimal Day & Hour Heatmaps',
          desc: 'Discover your most profitable trading weekdays and specific market hour sessions to optimize screen time.'
        },
        {
          icon: UploadCloud,
          title: 'Fast Multi-Platform Import',
          desc: 'Effortlessly import from Tradovate, NinjaTrader, MetaTrader, TradingView, custom CSV files, or fast manual mode.'
        },
        {
          icon: DollarSign,
          title: 'Real-time Currency & Payout Splits',
          desc: 'Automatic commission calculation, live USD/BRL/EUR currency conversions, and net payout split monitoring.'
        },
        {
          icon: FileText,
          title: 'Executive PDF Reports',
          desc: 'Generate high-resolution executive summary PDFs to share with investors, mentors, or for personal documentation.'
        }
      ],
      simTitle: 'Interactive Profit & Expectancy Simulator',
      simSubtitle: 'Adjust parameters to project the mathematical power of consistent trading over time:',
      simAccount: 'Account Size:',
      simWinRateLabel: 'Win Rate (%):',
      simAvgWinLabel: 'Average Win ($):',
      simAvgLossLabel: 'Average Loss ($):',
      simTradesLabel: 'Trades per Month:',
      simResNet: 'Estimated Monthly Net:',
      simResBrl: 'Converted in BRL (R$):',
      simResExp: 'Math Expectancy:',
      simResPF: 'Projected Profit Factor:',
      compareTitle: 'Why Quantara Outperforms Spreadsheets?',
      compareSubtitle: 'Compare the specialized power of Quantara against ordinary spreadsheet solutions.',
      faqTitle: 'Frequently Asked Questions',
      ctaBottomTitle: 'Ready to Level Up Your Trading Edge?',
      ctaBottomDesc: 'Create your free account today and start analyzing your performance with institutional clarity.',
      ctaBottomBtn: 'Get Started for Free',
      loginBtn: 'Account Login'
    },
    es: {
      badge: 'NUEVA VERSIÓN 2.0 • SUITE COMPLETA PARA TRADERS PROFESIONALES',
      heroTitlePrefix: 'Domina Tus Operaciones con ',
      heroTitleHighlight: 'Métricas Institucionales',
      heroTitleSuffix: ' de Alta Precisión',
      heroDesc: 'El workspace definitivo para traders de Futuros, Forex, Acciones y Cripto. Valida setups matemáticos, monitorea drawdowns en tiempo real, protege tu capital y aprueba evaluaciones de fondeo.',
      ctaPrimary: 'Comenzar Gratis',
      ctaSecondary: 'Explorar Demostración',
      trustedBy: 'COMPATIBILIDAD CON LAS PRINCIPALES PLATAFORMAS Y EMPRESAS DE FONDEO',
      tabs: {
        dashboard: 'Executive Dashboard',
        analytics: 'Analytics Avanzado',
        calendar: 'Calendario de Rendimiento',
        trades: 'Historial & Ejecución',
        setups: 'Setups & Esperanza',
        journal: 'Diario & Psicología',
        import: 'Importación & Brokers'
      },
      showcaseTitles: {
        dashboard: 'Visión Ejecutiva y Control de Riesgo en Tiempo Real',
        dashboardDesc: 'Monitorea Saldo Actual, P&L Neto, Curva de Equidad con Línea de Tendencia, Trailing Drawdown y Límite de Pérdida Diario.',
        analytics: 'Diagnóstico Profundo de Rendimiento y Evaluaciones',
        analyticsDesc: 'Descubre tu tasa de acierto por dirección (Long vs Short), P&L por Símbolo (MNQ, NQ, ES, CL), histogramas mensuales y metas de consistencia.',
        calendar: 'Calendario Interactivo con Heatmap y Resúmenes Semanales',
        calendarDesc: 'Visualiza al instante tus días ganadores y perdedores, tasa de acierto, volumen de operaciones y resúmenes semanales de W1 a W6.',
        trades: 'Tabla de Operaciones Inteligente con Filtros Rápidos',
        tradesDesc: 'Historial detallado con precios de ejecución, comisiones deducidas, dirección (Buy/Sell) y filtros por activo y fechas.',
        setups: 'Laboratorio de Validación de Estrategias e Informes PDF',
        setupsDesc: 'Compara la curva de equidad de cada setup con la cuenta general, calcula la esperanza matemática ($/trade) y genera informes en PDF.',
        journal: 'Diario Emocional y Registro de Operaciones',
        journalDesc: 'Registra reflexiones diarias, estado psicológico, notas de mercado, capturas de gráficos y noticias económicas clave.',
        import: 'Importación Rápida Multi-Plataforma y Modo Simple',
        importDesc: 'Importa archivos CSV de Tradovate, NinjaTrader, MetaTrader 4/5 o inserta operaciones manualmente de forma simplificada.'
      },
      featuresTitle: 'Herramientas Diseñadas para tu Consistencia',
      featuresSubtitle: 'Cada módulo fue creado para resolver los desafíos reales de traders individuales y de cuentas de fondeo.',
      features: [
        {
          icon: Shield,
          title: 'Protección Anti-Pérdida y Reglas de Fondeo',
          desc: 'Configura límites diarios de pérdida y monitorea el margen de drawdown restante en tiempo real.'
        },
        {
          icon: Target,
          title: 'Esperanza Matemática de Setups',
          desc: 'Identifica qué estrategias son rentables y elimina las perdedoras usando fórmulas estadísticas precisas.'
        },
        {
          icon: Calendar,
          title: 'Heatmap de Mejores Días y Horarios',
          desc: 'Descubre los días de la semana y franjas horarias con mejor rendimiento para maximizar tu rentabilidad.'
        },
        {
          icon: UploadCloud,
          title: 'Importación Automática Multi-Plataforma',
          desc: 'Compatible con Tradovate, NinjaTrader, MetaTrader, TradingView, CSVs personalizados o modo manual rápido.'
        },
        {
          icon: DollarSign,
          title: 'Conversión de Moneda y Split en Vivo',
          desc: 'Cálculo de comisiones por contrato, tipo de cambio en tiempo real y división de beneficios neta.'
        },
        {
          icon: FileText,
          title: 'Informes Ejecutivos en PDF',
          desc: 'Genera informes completos en PDF de alta resolución con un solo clic para mentores o inversores.'
        }
      ],
      simTitle: 'Simulador Interactivo de Beneficio y Esperanza',
      simSubtitle: 'Ajusta los parámetros para proyectar el poder matemático de la consistencia en el trading:',
      simAccount: 'Tamaño de Cuenta:',
      simWinRateLabel: 'Tasa de Acierto (%):',
      simAvgWinLabel: 'Ganancia Media ($):',
      simAvgLossLabel: 'Pérdida Media ($):',
      simTradesLabel: 'Operaciones por Mes:',
      simResNet: 'P&L Neto Estimado:',
      simResBrl: 'Equivalente en BRL (R$):',
      simResExp: 'Esperanza Matemática:',
      simResPF: 'Profit Factor Proyectado:',
      compareTitle: '¿Por qué Quantara supera a las hojas de cálculo?',
      compareSubtitle: 'Compara la experiencia profesional de Quantara frente a métodos tradicionales.',
      faqTitle: 'Preguntas Frecuentes',
      ctaBottomTitle: '¿Listo para Llevar tu Trading al Siguiente Nivel?',
      ctaBottomDesc: 'Crea tu cuenta gratis hoy mismo y analiza tus operaciones con precisión institucional.',
      ctaBottomBtn: 'Comenzar Gratis Ahora',
      loginBtn: 'Iniciar Sesión'
    }
  }[lang];

  const faqs = [
    {
      q: lang === 'pt' ? 'Quantara funciona com quais corretoras e plataformas?' : lang === 'es' ? '¿Con qué brokers y plataformas funciona Quantara?' : 'Which brokers and trading platforms does Quantara support?',
      a: lang === 'pt' ? 'Quantara suporta arquivos e exportações do Tradovate, NinjaTrader 8, MetaTrader 4/5, TradingView, CQG, planilhas CSV personalizadas e também possui um modo de inserção manual simplificado ultra-rápido.' : lang === 'es' ? 'Quantara es compatible con exportaciones de Tradovate, NinjaTrader 8, MetaTrader 4/5, TradingView, CQG, hojas CSV y modo manual rápido.' : 'Quantara supports CSV exports from Tradovate, NinjaTrader 8, MetaTrader 4/5, TradingView, CQG, custom spreadsheets, as well as a fast simplified manual entry mode.'
    },
    {
      q: lang === 'pt' ? 'Posso usar o Quantara para contas de mesas proprietárias (Apex, Topstep, etc.)?' : lang === 'es' ? '¿Puedo usar Quantara para cuentas de fondeo (Apex, Topstep, etc.)?' : 'Can I use Quantara for Prop Firm evaluations (Apex, Topstep, etc.)?',
      a: lang === 'pt' ? 'Sim! O Quantara conta com medidores de Trailing Drawdown, Trava de Limite Diário (Stop Diário) e Métricas de Consistência (% do melhor dia sobre o lucro total) desenvolvidos exatamente para você nunca violar regras de avaliação.' : lang === 'es' ? '¡Sí! Incluye medidores de Trailing Drawdown, Límite Diario y Consistencia diseñados para cumplir las reglas de empresas de fondeo.' : 'Yes! Quantara includes dedicated Trailing Drawdown gauges, Daily Loss Limit guards, and Consistency Target trackers specifically tailored for funded challenge rules.'
    },
    {
      q: lang === 'pt' ? 'Como funciona a validação e curva de equidade de Setups?' : lang === 'es' ? '¿Cómo funciona la validación y curva de equidad de Setups?' : 'How does Setup validation and Equity Curve comparison work?',
      a: lang === 'pt' ? 'Você pode criar e marcar seus trades com estratégias específicas (ex: Breakout, Pullback, Scalp 1m). O Quantara gera uma curva de equidade exclusiva para cada setup e calcula a Expectativa Matemática em dólares por operação.' : lang === 'es' ? 'Puedes etiquetar operaciones por estrategia para generar curvas de equidad independientes y calcular la esperanza matemática de cada setup.' : 'You can tag trades with specific strategies (e.g. Breakout, Pullback, Scalp). Quantara overlays an independent equity curve for each setup and computes mathematical expectancy in $/trade.'
    },
    {
      q: lang === 'pt' ? 'Meus dados ficam seguros?' : lang === 'es' ? '¿Mis datos están seguros?' : 'Is my trading data secure?',
      a: lang === 'pt' ? 'Sim. Seus dados são criptografados e você tem total controle sobre suas contas, além de poder exportar backups completos ou relatórios em PDF a qualquer momento.' : lang === 'es' ? 'Sí. Tus datos están cifrados y puedes exportar copias de seguridad o informes PDF en cualquier momento.' : 'Yes. All data is encrypted with enterprise-grade security and you can export full backups or PDF reports at any time.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#09090b] text-white font-sans relative overflow-x-hidden selection:bg-amber-500 selection:text-black">
      {/* Dynamic Ambient Background Glows */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-15%] left-[-10%] w-[60vw] h-[60vw] bg-amber-500/10 blur-[150px] rounded-full"></div>
        <div className="absolute top-[40%] right-[-15%] w-[50vw] h-[50vw] bg-cyan-500/5 blur-[160px] rounded-full"></div>
        <div className="absolute bottom-[-10%] left-[20%] w-[50vw] h-[50vw] bg-amber-600/10 blur-[140px] rounded-full"></div>
        
        {/* Subtle grid background */}
        <div 
          className="absolute inset-0 opacity-[0.03]" 
          style={{ backgroundImage: `radial-gradient(rgba(255,255,255,0.4) 1px, transparent 1px)`, backgroundSize: '32px 32px' }}
        />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#09090b]/80 border-b border-white/5 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="relative flex items-center justify-center">
              <img src="/logo.png" alt="Quantara Logo" className="w-9 h-9 rounded-xl object-contain drop-shadow-[0_0_12px_rgba(245,158,11,0.5)]" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black font-display tracking-tight text-white flex items-center gap-1.5">
                Quantara <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">Lab</span>
              </span>
            </div>
          </div>

          <nav className="hidden lg:flex items-center gap-8 text-sm font-semibold text-gray-300">
            <a href="#showcase" className="hover:text-amber-400 transition-colors">Dashboard</a>
            <a href="#features" className="hover:text-amber-400 transition-colors">Recursos</a>
            <a href="#simulator" className="hover:text-amber-400 transition-colors">Simulador</a>
            <a href="#comparison" className="hover:text-amber-400 transition-colors">Comparativo</a>
            <a href="#faq" className="hover:text-amber-400 transition-colors">FAQ</a>
          </nav>

          <div className="flex items-center gap-3 sm:gap-4">
            {/* Language Selector */}
            <div className="flex items-center bg-white/5 border border-white/10 rounded-lg p-1 text-xs font-bold">
              <button 
                onClick={() => setLang('pt')} 
                className={`px-2 py-1 rounded transition-colors ${lang === 'pt' ? 'bg-amber-500 text-black shadow' : 'text-gray-400 hover:text-white'}`}
              >
                PT
              </button>
              <button 
                onClick={() => setLang('en')} 
                className={`px-2 py-1 rounded transition-colors ${lang === 'en' ? 'bg-amber-500 text-black shadow' : 'text-gray-400 hover:text-white'}`}
              >
                EN
              </button>
              <button 
                onClick={() => setLang('es')} 
                className={`px-2 py-1 rounded transition-colors ${lang === 'es' ? 'bg-amber-500 text-black shadow' : 'text-gray-400 hover:text-white'}`}
              >
                ES
              </button>
            </div>

            <button 
              onClick={() => navigate('/auth')} 
              className="text-sm font-bold text-gray-300 hover:text-white px-3 py-2 rounded-xl transition-colors hidden sm:block"
            >
              {t.loginBtn}
            </button>
            <button 
              onClick={() => navigate('/auth')} 
              className="bg-gradient-to-r from-amber-500 to-yellow-400 text-black px-5 py-2.5 rounded-xl text-sm font-extrabold shadow-[0_0_25px_rgba(245,158,11,0.4)] hover:shadow-[0_0_35px_rgba(245,158,11,0.6)] hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5"
            >
              {t.ctaPrimary} <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 pt-16 md:pt-24 pb-16 px-4 max-w-7xl mx-auto flex flex-col items-center text-center">
        {/* Top Pulsing Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold tracking-wider uppercase mb-8 shadow-[0_0_20px_rgba(245,158,11,0.15)] animate-pulse">
          <Sparkles size={14} className="text-amber-400" />
          {t.badge}
        </div>

        {/* Grand Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight font-display max-w-5xl leading-[1.1] mb-6">
          {t.heroTitlePrefix}
          <span className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(245,158,11,0.3)]">
            {t.heroTitleHighlight}
          </span>
          {t.heroTitleSuffix}
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg md:text-xl text-gray-300 max-w-3xl mb-10 leading-relaxed font-normal">
          {t.heroDesc}
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto justify-center mb-16">
          <button 
            onClick={() => navigate('/auth')} 
            className="w-full sm:w-auto bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-black px-8 py-4 rounded-2xl font-black text-base shadow-[0_0_35px_rgba(245,158,11,0.5)] hover:shadow-[0_0_50px_rgba(245,158,11,0.7)] hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Zap size={20} className="fill-black" />
            {t.ctaPrimary}
            <ArrowRight size={18} />
          </button>
          
          <a 
            href="#showcase" 
            className="w-full sm:w-auto bg-white/5 hover:bg-white/10 border border-white/10 text-white px-8 py-4 rounded-2xl font-bold text-base transition-all flex items-center justify-center gap-2 backdrop-blur-md"
          >
            <Play size={18} className="text-amber-400 fill-amber-400" />
            {t.ctaSecondary}
          </a>
        </div>

        {/* Quick Highlights Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl pt-8 border-t border-white/5">
          <div className="flex flex-col items-center p-3 rounded-xl bg-white/[0.02] border border-white/5">
            <span className="text-2xl font-black text-amber-400">$50,829.50</span>
            <span className="text-xs text-gray-400 font-medium">Controle de Saldo & P&L</span>
          </div>
          <div className="flex flex-col items-center p-3 rounded-xl bg-white/[0.02] border border-white/5">
            <span className="text-2xl font-black text-emerald-400">100% Real-Time</span>
            <span className="text-xs text-gray-400 font-medium">Proteção de Drawdown</span>
          </div>
          <div className="flex flex-col items-center p-3 rounded-xl bg-white/[0.02] border border-white/5">
            <span className="text-2xl font-black text-amber-400">1-Click</span>
            <span className="text-xs text-gray-400 font-medium">Importação Tradovate / NT8</span>
          </div>
          <div className="flex flex-col items-center p-3 rounded-xl bg-white/[0.02] border border-white/5">
            <span className="text-2xl font-black text-cyan-400">PDF Report</span>
            <span className="text-xs text-gray-400 font-medium">Relatórios Executivos</span>
          </div>
        </div>
      </section>

      {/* Trust & Broker Compatibility Section */}
      <section className="relative z-10 py-8 border-y border-white/5 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-6">
            {t.trustedBy}
          </p>
          <div className="flex flex-wrap justify-center items-center gap-6 sm:gap-12 opacity-70">
            <span className="text-sm font-bold text-gray-300 tracking-wider flex items-center gap-1.5"><Award size={16} className="text-amber-400" /> TRADOVATE</span>
            <span className="text-sm font-bold text-gray-300 tracking-wider flex items-center gap-1.5"><Award size={16} className="text-amber-400" /> NINJATRADER 8</span>
            <span className="text-sm font-bold text-gray-300 tracking-wider flex items-center gap-1.5"><Award size={16} className="text-amber-400" /> METATRADER 4/5</span>
            <span className="text-sm font-bold text-gray-300 tracking-wider flex items-center gap-1.5"><Award size={16} className="text-amber-400" /> TRADINGVIEW</span>
            <span className="text-sm font-bold text-gray-300 tracking-wider flex items-center gap-1.5"><Award size={16} className="text-amber-400" /> TOPSTEP & APEX</span>
          </div>
        </div>
      </section>

      {/* Interactive App Showcase Section (MAIN PRODUCT SHOWCASE) */}
      <section id="showcase" className="relative z-10 py-20 px-4 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl sm:text-5xl font-black font-display tracking-tight text-white mb-4">
            A Experiência Completa do <span className="text-amber-400">Quantara</span>
          </h2>
          <p className="text-gray-300 text-base sm:text-lg">
            Navegue pelas abas abaixo e explore cada módulo do software em detalhes com base em dados de operações reais.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-5 py-3 rounded-xl font-bold text-sm whitespace-nowrap transition-all flex items-center gap-2 border ${
              activeTab === 'dashboard'
                ? 'bg-amber-500 text-black border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.4)]'
                : 'bg-white/5 text-gray-400 border-white/5 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Activity size={18} />
            {t.tabs.dashboard}
          </button>
          
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-5 py-3 rounded-xl font-bold text-sm whitespace-nowrap transition-all flex items-center gap-2 border ${
              activeTab === 'analytics'
                ? 'bg-amber-500 text-black border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.4)]'
                : 'bg-white/5 text-gray-400 border-white/5 hover:bg-white/10 hover:text-white'
            }`}
          >
            <BarChart2 size={18} />
            {t.tabs.analytics}
          </button>

          <button
            onClick={() => setActiveTab('calendar')}
            className={`px-5 py-3 rounded-xl font-bold text-sm whitespace-nowrap transition-all flex items-center gap-2 border ${
              activeTab === 'calendar'
                ? 'bg-amber-500 text-black border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.4)]'
                : 'bg-white/5 text-gray-400 border-white/5 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Calendar size={18} />
            {t.tabs.calendar}
          </button>

          <button
            onClick={() => setActiveTab('trades')}
            className={`px-5 py-3 rounded-xl font-bold text-sm whitespace-nowrap transition-all flex items-center gap-2 border ${
              activeTab === 'trades'
                ? 'bg-amber-500 text-black border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.4)]'
                : 'bg-white/5 text-gray-400 border-white/5 hover:bg-white/10 hover:text-white'
            }`}
          >
            <TrendingUp size={18} />
            {t.tabs.trades}
          </button>

          <button
            onClick={() => setActiveTab('setups')}
            className={`px-5 py-3 rounded-xl font-bold text-sm whitespace-nowrap transition-all flex items-center gap-2 border ${
              activeTab === 'setups'
                ? 'bg-amber-500 text-black border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.4)]'
                : 'bg-white/5 text-gray-400 border-white/5 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Layers size={18} />
            {t.tabs.setups}
          </button>

          <button
            onClick={() => setActiveTab('journal')}
            className={`px-5 py-3 rounded-xl font-bold text-sm whitespace-nowrap transition-all flex items-center gap-2 border ${
              activeTab === 'journal'
                ? 'bg-amber-500 text-black border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.4)]'
                : 'bg-white/5 text-gray-400 border-white/5 hover:bg-white/10 hover:text-white'
            }`}
          >
            <BookOpen size={18} />
            {t.tabs.journal}
          </button>

          <button
            onClick={() => setActiveTab('import')}
            className={`px-5 py-3 rounded-xl font-bold text-sm whitespace-nowrap transition-all flex items-center gap-2 border ${
              activeTab === 'import'
                ? 'bg-amber-500 text-black border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.4)]'
                : 'bg-white/5 text-gray-400 border-white/5 hover:bg-white/10 hover:text-white'
            }`}
          >
            <UploadCloud size={18} />
            {t.tabs.import}
          </button>
        </div>

        {/* Tab Showcase Card & Preview Window */}
        <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-b from-[#16161a] to-[#0d0e12] border border-amber-500/20 shadow-[0_20px_80px_rgba(0,0,0,0.8)] relative overflow-hidden">
          {/* Subtle top glow bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent"></div>

          {/* Tab Header Info */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-white/5">
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2 mb-2">
                <Sparkles size={20} className="text-amber-400" />
                {t.showcaseTitles[activeTab]}
              </h3>
              <p className="text-gray-300 text-sm max-w-2xl leading-relaxed">
                {t.showcaseTitles[`${activeTab}Desc` as keyof typeof t.showcaseTitles]}
              </p>
            </div>
            
            <button 
              onClick={() => navigate('/auth')} 
              className="self-start md:self-center bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all"
            >
              Testar Este Módulo <ArrowRight size={14} />
            </button>
          </div>

          {/* Visual Display Container */}
          <div className="rounded-2xl overflow-hidden border border-white/10 bg-black/40 shadow-inner relative group">
            {activeTab === 'dashboard' && (
              <div className="flex flex-col gap-4">
                <img 
                  src="/screenshots/dashboard-preview.png" 
                  alt="Quantara Executive Dashboard Preview" 
                  className="w-full h-auto object-cover rounded-xl shadow-2xl transition-transform duration-500 group-hover:scale-[1.005]" 
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex items-start gap-3">
                    <CheckCircle2 size={20} className="text-amber-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-gray-300 leading-relaxed">
                      <strong className="text-white">Curva de Equidade & Linha de Tendência:</strong> Acompanhe a evolução do seu patrimônio com filtros de período e média linear de crescimento.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex items-start gap-3">
                    <CheckCircle2 size={20} className="text-emerald-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-gray-300 leading-relaxed">
                      <strong className="text-white">Distribuição Semanal (VOL & P&L):</strong> Descubra o volume de contratos e o P&L líquido gerado em cada dia útil da semana.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="flex flex-col gap-4">
                <img 
                  src="/screenshots/analytics-preview.png" 
                  alt="Quantara Analytics Dashboard Preview" 
                  className="w-full h-auto object-cover rounded-xl shadow-2xl transition-transform duration-500 group-hover:scale-[1.005]" 
                />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                    <span className="text-xs text-amber-400 font-bold block mb-1">Métricas de Avaliação</span>
                    <p className="text-xs text-gray-300">Initial Balance, Drawdowns, Profit Factor e Expectancy calculados automaticamente.</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                    <span className="text-xs text-cyan-400 font-bold block mb-1">Performance por Ativo</span>
                    <p className="text-xs text-gray-300">Ranking visual comparando lucros e perdas no MNQ, NQ, ES, CL e outros símbolos.</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                    <span className="text-xs text-emerald-400 font-bold block mb-1">Long vs Short Ratio</span>
                    <p className="text-xs text-gray-300">Taxa de acerto e P&L isolados por compras e vendas para calibrar seu viés de mercado.</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'calendar' && (
              <div className="flex flex-col gap-4">
                <img 
                  src="/screenshots/calendar-preview.png" 
                  alt="Quantara Performance Calendar Preview" 
                  className="w-full h-auto object-cover rounded-xl shadow-2xl transition-transform duration-500 group-hover:scale-[1.005]" 
                />
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Calendar size={20} className="text-amber-400" />
                    <span className="text-xs text-gray-300">Resumo de Semanas W1 a W6 com saldo acumulado e zoom de trades ao clicar em qualquer dia.</span>
                  </div>
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">Mês Atual: +$535.00</span>
                </div>
              </div>
            )}

            {activeTab === 'trades' && (
              <div className="flex flex-col md:flex-row items-center gap-6 p-4">
                <div className="w-full md:w-1/2">
                  <img 
                    src="/screenshots/trades-list-preview.png" 
                    alt="Quantara Trades Execution List Preview" 
                    className="w-full h-auto object-cover rounded-xl shadow-2xl border border-white/10" 
                  />
                </div>
                <div className="w-full md:w-1/2 flex flex-col gap-4">
                  <h4 className="text-lg font-bold text-white">Transparência Total em Cada Ordem Executada</h4>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2 text-xs text-gray-300">
                      <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                      <span><strong>Indicação Buy / Sell:</strong> Visualização instantânea da direção de cada trade (compra ou venda).</span>
                    </li>
                    <li className="flex items-start gap-2 text-xs text-gray-300">
                      <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                      <span><strong>Cálculo Real de Taxas:</strong> Desconto de comissões e taxas de corretora por contrato operado.</span>
                    </li>
                    <li className="flex items-start gap-2 text-xs text-gray-300">
                      <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                      <span><strong>Filtros por Dias Úteis & Símbolos:</strong> Isole dias específicos ou analise apenas o histórico de determinado ativo.</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'setups' && (
              <div className="p-8 flex flex-col items-center text-center max-w-2xl mx-auto">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-4 text-amber-400">
                  <Layers size={32} />
                </div>
                <h4 className="text-2xl font-black text-white mb-2">Laboratório de Setups & Validação Estatística</h4>
                <p className="text-gray-300 text-sm mb-6 leading-relaxed">
                  Crie estratégias customizadas (ex: Abertura NY, Pullback VWAP, Reversão 5m) e compare a curva de patrimônio do setup contra o saldo geral da conta.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full mb-6">
                  <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                    <span className="text-xs text-gray-400 block">Expectancy Formula</span>
                    <strong className="text-amber-400 text-sm">$2.64 / trade</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                    <span className="text-xs text-gray-400 block">Takes vs Stops</span>
                    <strong className="text-emerald-400 text-sm">289 Takes / 335 Stops</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                    <span className="text-xs text-gray-400 block">Relatório PDF</span>
                    <strong className="text-cyan-400 text-sm">Exportação 1-Click</strong>
                  </div>
                </div>
                <button 
                  onClick={() => navigate('/auth')} 
                  className="bg-amber-500 text-black px-6 py-3 rounded-xl font-bold text-sm hover:bg-yellow-400 transition-all flex items-center gap-2"
                >
                  Criar Meu Primeiro Setup <ArrowRight size={16} />
                </button>
              </div>
            )}

            {activeTab === 'journal' && (
              <div className="p-8 flex flex-col items-center text-center max-w-2xl mx-auto">
                <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mb-4 text-cyan-400">
                  <BookOpen size={32} />
                </div>
                <h4 className="text-2xl font-black text-white mb-2">Diário de Bordo & Gestão Psicológica</h4>
                <p className="text-gray-300 text-sm mb-6 leading-relaxed">
                  O sucesso no trading depende 80% do controle emocional. Registre notas diárias, auto-avaliação disciplinar e anexe capturas de tela do TradingView ou NinjaTrader.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full mb-6 text-left">
                  <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center gap-3">
                    <CheckCircle2 size={18} className="text-amber-400 shrink-0" />
                    <span className="text-xs text-gray-300">Calendário de Notícias Econômicas integrado (USD / High Impact).</span>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center gap-3">
                    <CheckCircle2 size={18} className="text-amber-400 shrink-0" />
                    <span className="text-xs text-gray-300">Mapeamento de Feriados e Half-Days do mercado CME / NYSE.</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'import' && (
              <div className="p-8 flex flex-col items-center text-center max-w-2xl mx-auto">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-4 text-emerald-400">
                  <UploadCloud size={32} />
                </div>
                <h4 className="text-2xl font-black text-white mb-2">Importação Instantânea & Mapeamento Inteligente</h4>
                <p className="text-gray-300 text-sm mb-6 leading-relaxed">
                  Suba seus arquivos CSV do Tradovate ou NinjaTrader com detecção automática de colunas, ou use nosso formulário manual simplificado para lançar operações em segundos.
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  <span className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-bold text-gray-300">CSV Tradovate</span>
                  <span className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-bold text-gray-300">CSV NinjaTrader 8</span>
                  <span className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-bold text-gray-300">MetaTrader 4 & 5</span>
                  <span className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-bold text-gray-300">Modo Manual Simplificado</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Interactive Simulator Section */}
      <section id="simulator" className="relative z-10 py-20 px-4 max-w-7xl mx-auto border-t border-white/5">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-400 mb-2 block">Matemática & Consistência</span>
          <h2 className="text-3xl sm:text-5xl font-black font-display tracking-tight text-white mb-4">
            {t.simTitle}
          </h2>
          <p className="text-gray-300 text-base sm:text-lg">
            {t.simSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-gradient-to-br from-[#16161a] to-[#0d0e12] border border-amber-500/20 p-6 sm:p-10 rounded-3xl shadow-2xl">
          {/* Controls (Left 7 Cols) */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-bold text-gray-300">{t.simAccount}</span>
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
                <span className="text-sm font-bold text-gray-300">{t.simWinRateLabel}</span>
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
                <label className="text-xs font-bold text-gray-400 block mb-1">{t.simAvgWinLabel}</label>
                <input 
                  type="number" 
                  value={simAvgWin} 
                  onChange={(e) => setSimAvgWin(Number(e.target.value))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm font-bold text-white focus:border-amber-500 outline-none" 
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 block mb-1">{t.simAvgLossLabel}</label>
                <input 
                  type="number" 
                  value={simAvgLoss} 
                  onChange={(e) => setSimAvgLoss(Number(e.target.value))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm font-bold text-white focus:border-amber-500 outline-none" 
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-bold text-gray-300">{t.simTradesLabel}</span>
                <span className="text-sm font-black text-amber-400">{simTradesMonth} trades / mês</span>
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

          {/* Results Box (Right 5 Cols) */}
          <div className="lg:col-span-5 bg-black/50 border border-amber-500/30 rounded-2xl p-6 flex flex-col gap-5 shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">{t.simResNet}</span>
              <span className={`text-2xl sm:text-3xl font-black ${estimatedMonthlyNet >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {estimatedMonthlyNet >= 0 ? `+$${estimatedMonthlyNet.toLocaleString()}` : `-$${Math.abs(estimatedMonthlyNet).toLocaleString()}`}
              </span>
            </div>

            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">{t.simResBrl}</span>
              <span className="text-xl font-bold text-amber-400">
                R$ {estimatedBrl.toLocaleString()}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-[10px] text-gray-400 uppercase font-bold block mb-1">{t.simResExp}</span>
                <strong className={`text-base font-black ${expectancy >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  ${expectancy.toFixed(2)} / trade
                </strong>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-[10px] text-gray-400 uppercase font-bold block mb-1">{t.simResPF}</span>
                <strong className="text-base font-black text-amber-400">
                  {profitFactor}
                </strong>
              </div>
            </div>

            <button 
              onClick={() => navigate('/auth')} 
              className="w-full mt-2 bg-gradient-to-r from-amber-500 to-yellow-400 text-black py-3.5 rounded-xl font-black text-sm hover:brightness-110 active:scale-95 transition-all shadow-[0_0_20px_rgba(245,158,11,0.4)]"
            >
              Aplicar ao Meu Portfólio
            </button>
          </div>
        </div>
      </section>

      {/* Feature Grid Pillars */}
      <section id="features" className="relative z-10 py-20 px-4 max-w-7xl mx-auto border-t border-white/5">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-400 mb-2 block">Diferenciais Quantara</span>
          <h2 className="text-3xl sm:text-5xl font-black font-display tracking-tight text-white mb-4">
            {t.featuresTitle}
          </h2>
          <p className="text-gray-300 text-base sm:text-lg">
            {t.featuresSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {t.features.map((feat, i) => {
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
                  <span>Saiba mais</span> <ChevronRight size={14} />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Comparison Table Section */}
      <section id="comparison" className="relative z-10 py-20 px-4 max-w-7xl mx-auto border-t border-white/5">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-5xl font-black font-display tracking-tight text-white mb-4">
            {t.compareTitle}
          </h2>
          <p className="text-gray-300 text-base sm:text-lg">
            {t.compareSubtitle}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse rounded-2xl overflow-hidden bg-gradient-to-b from-[#16161a] to-[#0d0e12] border border-white/10 text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02]">
                <th className="p-4 sm:p-6 font-bold text-gray-400">Funcionalidade</th>
                <th className="p-4 sm:p-6 font-black text-amber-400 text-base bg-amber-500/5">Quantara Lab</th>
                <th className="p-4 sm:p-6 font-bold text-gray-500">Planilhas Excel Comuns</th>
                <th className="p-4 sm:p-6 font-bold text-gray-500">Outros Softwares Genéricos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <tr>
                <td className="p-4 sm:p-6 font-semibold text-white">Trava de Limite Diário & Trailing Drawdown em Tempo Real</td>
                <td className="p-4 sm:p-6 bg-amber-500/5"><Check className="text-emerald-400" size={20} /></td>
                <td className="p-4 sm:p-6"><X className="text-red-500/50" size={20} /></td>
                <td className="p-4 sm:p-6 text-gray-500 text-xs">Limitado / Manual</td>
              </tr>
              <tr>
                <td className="p-4 sm:p-6 font-semibold text-white">Comparativo de Curvas de Equidade por Setup</td>
                <td className="p-4 sm:p-6 bg-amber-500/5"><Check className="text-emerald-400" size={20} /></td>
                <td className="p-4 sm:p-6"><X className="text-red-500/50" size={20} /></td>
                <td className="p-4 sm:p-6"><X className="text-red-500/50" size={20} /></td>
              </tr>
              <tr>
                <td className="p-4 sm:p-6 font-semibold text-white">Cálculo Automático de Expectativa Matemática ($/trade)</td>
                <td className="p-4 sm:p-6 bg-amber-500/5"><Check className="text-emerald-400" size={20} /></td>
                <td className="p-4 sm:p-6 text-gray-500 text-xs">Fórmulas complexas</td>
                <td className="p-4 sm:p-6"><Check className="text-emerald-400" size={20} /></td>
              </tr>
              <tr>
                <td className="p-4 sm:p-6 font-semibold text-white">Calendário com Heatmap & Resumos W1-W6</td>
                <td className="p-4 sm:p-6 bg-amber-500/5"><Check className="text-emerald-400" size={20} /></td>
                <td className="p-4 sm:p-6"><X className="text-red-500/50" size={20} /></td>
                <td className="p-4 sm:p-6 text-gray-500 text-xs">Básico</td>
              </tr>
              <tr>
                <td className="p-4 sm:p-6 font-semibold text-white">Exportação de Relatórios Executivos em PDF de Alta Resolução</td>
                <td className="p-4 sm:p-6 bg-amber-500/5"><Check className="text-emerald-400" size={20} /></td>
                <td className="p-4 sm:p-6"><X className="text-red-500/50" size={20} /></td>
                <td className="p-4 sm:p-6"><X className="text-red-500/50" size={20} /></td>
              </tr>
              <tr>
                <td className="p-4 sm:p-6 font-semibold text-white">Suporte Tradovate, NinjaTrader e Modo Simplificado</td>
                <td className="p-4 sm:p-6 bg-amber-500/5"><Check className="text-emerald-400" size={20} /></td>
                <td className="p-4 sm:p-6 text-gray-500 text-xs">Apenas digitação manual</td>
                <td className="p-4 sm:p-6 text-gray-500 text-xs">Configuração complexa</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="relative z-10 py-20 px-4 max-w-4xl mx-auto border-t border-white/5">
        <div className="text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-400 mb-2 block">Dúvidas Comuns</span>
          <h2 className="text-3xl sm:text-4xl font-black font-display tracking-tight text-white mb-4">
            {t.faqTitle}
          </h2>
        </div>

        <div className="flex flex-col gap-4">
          {faqs.map((faq, i) => {
            const isOpen = activeFaq === i;
            return (
              <div 
                key={i} 
                className="rounded-2xl border border-white/5 bg-[#16161a] overflow-hidden transition-all"
              >
                <button 
                  onClick={() => setActiveFaq(isOpen ? null : i)} 
                  className="w-full p-6 text-left font-bold text-base text-white flex items-center justify-between gap-4 hover:text-amber-400 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown size={18} className={`shrink-0 transition-transform ${isOpen ? 'rotate-180 text-amber-400' : 'text-gray-400'}`} />
                </button>
                {isOpen && (
                  <div className="px-6 pb-6 text-sm text-gray-300 leading-relaxed border-t border-white/5 pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="relative z-10 py-20 px-4 max-w-7xl mx-auto">
        <div className="rounded-3xl p-8 sm:p-14 bg-gradient-to-r from-amber-500/20 via-yellow-500/10 to-amber-500/20 border border-amber-500/30 text-center relative overflow-hidden shadow-[0_0_80px_rgba(245,158,11,0.2)]">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-amber-400/20 blur-[100px] rounded-full"></div>
          
          <h2 className="text-3xl sm:text-5xl font-black font-display tracking-tight text-white mb-4 max-w-3xl mx-auto">
            {t.ctaBottomTitle}
          </h2>
          <p className="text-gray-300 text-base sm:text-lg max-w-2xl mx-auto mb-8">
            {t.ctaBottomDesc}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={() => navigate('/auth')} 
              className="w-full sm:w-auto bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-black px-10 py-4 rounded-2xl font-black text-base shadow-[0_0_35px_rgba(245,158,11,0.5)] hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Zap size={20} className="fill-black" />
              {t.ctaBottomBtn}
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 py-12 bg-black/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-gray-500">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Quantara Logo" className="w-7 h-7 rounded-lg object-contain" />
            <span className="font-bold text-white">Quantara Trading Lab</span>
            <span className="text-xs">&copy; 2026. Todos os direitos reservados.</span>
          </div>

          <div className="flex items-center gap-6 text-xs text-gray-400 font-medium">
            <a href="#" className="hover:text-amber-400 transition-colors">Termos de Uso</a>
            <a href="#" className="hover:text-amber-400 transition-colors">Política de Privacidade</a>
            <a href="#showcase" className="hover:text-amber-400 transition-colors">Recursos</a>
            <button onClick={() => navigate('/auth')} className="hover:text-amber-400 transition-colors">Login</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
