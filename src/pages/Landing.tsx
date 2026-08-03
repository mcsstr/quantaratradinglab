import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  Shield, 
  Target, 
  Calendar, 
  BarChart2, 
  BookOpen, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  ChevronRight, 
  ChevronDown,
  Play, 
  Download, 
  UploadCloud, 
  Check, 
  X, 
  Menu,
  HelpCircle, 
  DollarSign, 
  Zap, 
  Award, 
  Layers, 
  FileText, 
  PieChart, 
  Activity, 
  Cpu, 
  Globe, 
  Clock, 
  Lock, 
  Sliders
} from 'lucide-react';
import { usePlanConfig } from '../hooks/usePlanConfig';

type Lang = 'en' | 'pt' | 'es';

interface LanguageOption {
  code: Lang;
  label: string;
  flag: string;
  country: string;
}

const LANGUAGES: LanguageOption[] = [
  { code: 'en', label: 'English', flag: '🇺🇸', country: 'US' },
  { code: 'pt', label: 'Português', flag: '🇧🇷', country: 'BR' },
  { code: 'es', label: 'Español', flag: '🇪🇸', country: 'ES' },
];

export default function Landing() {
  const navigate = useNavigate();
  const [lang, setLang] = useState<Lang>('en');
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

  // Simulator Calculations
  const winRateDec = simWinRate / 100;
  const lossRateDec = (100 - simWinRate) / 100;
  const expectancy = (winRateDec * simAvgWin) - (lossRateDec * simAvgLoss);
  const estimatedMonthlyNet = Math.round(expectancy * simTradesMonth);
  const profitFactor = simAvgLoss > 0 && lossRateDec > 0 
    ? ((winRateDec * simAvgWin) / (lossRateDec * simAvgLoss)).toFixed(2) 
    : '0.00';
  const estimatedBrl = Math.round(estimatedMonthlyNet * 5.65);

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

  // Translation Strings
  const t = {
    en: {
      badge: 'QUANTARA TRADING LAB • PRECISION ANALYTICS & RISK MANAGEMENT',
      heroTitlePrefix: 'Master Your Trades with ',
      heroTitleHighlight: 'Institutional-Grade',
      heroTitleSuffix: ' Precision Analytics',
      heroDesc: 'The high-performance analytics, trade audit, and risk management laboratory built for serious futures, forex, stock, and prop firm traders. Validate mathematical setups, protect capital, and scale your payouts.',
      ctaPrimary: ctaPrimary,
      ctaSecondary: 'Explore All Modules Below',
      trustedBy: 'SEAMLESS COMPATIBILITY WITH LEADING BROKERS, PLATFORMS & PROP FIRMS',
      nav: {
        dashboard: 'Dashboard',
        analytics: 'Analytics',
        calendar: 'Calendar',
        trades: 'Trades',
        setups: 'Setups',
        news: 'News',
        import: 'Brokers',
        simulator: 'Simulator',
        faq: 'FAQ'
      },
      stats: {
        pnlTitle: 'Tracked Balance & P&L',
        pnlVal: '$50,829.50',
        ddTitle: 'Live Risk Protection',
        ddVal: '100% Real-Time',
        importTitle: 'Multi-Broker Sync',
        importVal: '1-Click Fast',
        reportTitle: 'Executive Audits',
        reportVal: 'PDF Export'
      },
      sections: {
        dashboard: {
          badge: 'MODULE 01 • EXECUTIVE OVERVIEW',
          title: 'Executive Dashboard & Real-Time Risk Control',
          desc: 'Get an immediate, high-definition panoramic view of your current account balance, cumulative P&L, real-time equity curve with linear trendline, trailing drawdown gauge, and daily loss stop guard.',
          bullets: [
            { title: 'Real-Time Equity Curve & Growth Trendline', desc: 'Track your capital progression with multi-timeframe filters and automated linear regression trends.' },
            { title: 'Weekly Volume & Day-of-Week Distribution', desc: 'Analyze contracts executed and net P&L generated on each individual weekday.' },
            { title: 'Trailing Drawdown & Daily Stop Loss Guard', desc: 'Never violate prop firm loss limits with real-time drawdown alerts and daily stop loss monitors.' },
            { title: 'Live Performance Metrics Bar', desc: 'Instant calculations for Win Rate, Payoff Ratio, Average Win/Loss, and Max Drawdown.' }
          ]
        },
        analytics: {
          badge: 'MODULE 02 • DEEP DIAGNOSTICS',
          title: 'Deep Performance Diagnostics & Asset Attribution',
          desc: 'Break down your trading performance to the atomic level. Evaluate your edge across multiple instruments, direction bias (Long vs Short), and consistency targets required by leading prop firms.',
          bullets: [
            { title: 'Multi-Asset Performance Breakdown', desc: 'Rank profitability across MNQ, NQ, ES, CL, BTC, and Forex pairs with visual bar charts.' },
            { title: 'Long vs Short Bias Calibration', desc: 'Isolate win rates and net profits on buys versus sells to identify directional strengths and weaknesses.' },
            { title: 'Prop Firm Consistency Score', desc: 'Monitor your best trading day percentage against total profit to easily pass prop firm evaluation rules.' },
            { title: 'Cumulative Gross vs Net Profit', desc: 'Audit exact fee deductions and gross-to-net slippage across your entire trade history.' }
          ]
        },
        calendar: {
          badge: 'MODULE 03 • INTERACTIVE CALENDAR',
          title: 'Interactive Performance Calendar & Daily Zoom',
          desc: 'Transform your monthly trading journey into a visual heatmap. View daily win/loss distribution, weekly subtotals from W1 to W6, and click any single day to zoom into every trade executed.',
          bullets: [
            { title: 'Color-Coded Heatmap Grid', desc: 'Instantly spot winning and losing streaks with green/red net P&L badges on each day.' },
            { title: 'Weekly Summaries (W1 to W6)', desc: 'Track cumulative weekly progress with trade counts, total volume, and net P&L.' },
            { title: '1-Click Daily Trade Zoom', desc: 'Click on any calendar day to inspect execution timestamps, symbols, and price points.' },
            { title: 'Smart Weekend Trade Detection', desc: 'Standard Monday-to-Friday view with automatic weekend inclusion when Saturday or Sunday trades exist.' }
          ]
        },
        trades: {
          badge: 'MODULE 04 • TRADE EXECUTION LOG',
          title: 'Precision Trades Log & Surgical Order Audit',
          desc: 'A complete, auditable table of every order executed. Filter by date, symbol, direction, or strategy, with automatic calculation of broker fees, exchange commissions, and tick sizes.',
          bullets: [
            { title: 'Surgical Order & Fill Detail', desc: 'Clear visual badges for Buy/Sell, entry/exit prices, contract size, and duration.' },
            { title: 'Real Exchange & Broker Fees Calculation', desc: 'Automatic commission calculation per contract for CME, B3, E-mini, Micro, and Forex.' },
            { title: 'Instant Dynamic Multi-Filtering', desc: 'Isolate specific symbols (MNQ, NQ, ES) or filter by profitable and loss-making trades in real-time.' },
            { title: 'Data Export & Audit Trail', desc: 'Export sanitized CSV or formatted data for external auditing and mentor reviews.' }
          ]
        },
        setups: {
          badge: 'MODULE 05 • STRATEGY LABORATORY',
          title: 'Setups Lab & Multi-Curve Mathematical Validation',
          desc: 'Quantify your true mathematical edge. Overlay individual strategy equity curves on top of your overall account balance, calculate expectancy in $/trade, and export high-resolution executive PDF reports.',
          bullets: [
            { title: 'Mathematical Expectancy Formula', desc: 'Determine the exact expected dollar value of every setup with Take vs Stop distribution.' },
            { title: 'Multi-Curve Equity Comparison', desc: 'Plot multiple setup equity curves simultaneously to find your best performing trading models.' },
            { title: 'Setup Attribution & Win/Loss Count', desc: 'Identify which setups are compounding your wealth and prune toxic patterns draining equity.' },
            { title: '1-Click Executive PDF Export', desc: 'Generate high-resolution printable PDF performance reports with professional charts and tables.' }
          ]
        },
        news: {
          badge: 'MODULE 06 • MACRO SYNCHRONIZATION',
          title: 'Macro Economic News Calendar & Market Half-Days',
          desc: 'Stay ahead of high-impact volatility. View high-impact macroeconomic releases (CPI, FOMC, NFP, ISM PMI) and CME/NYSE early close half-days directly cross-referenced with your trade timestamps.',
          bullets: [
            { title: 'High-Impact Economic News Feed', desc: 'Real-time synchronization with major US and global economic announcements.' },
            { title: 'CME & NYSE Holiday & Half-Days', desc: 'Full calendar of market holidays, early bank closes, and special trading hours.' },
            { title: 'Execution Risk Avoidance', desc: 'Correlate your trade timestamps against high-volatility news spikes to avoid slippage traps.' },
            { title: 'Psychological Pre-Market Readiness', desc: 'Prepare your daily bias before the market open with key economic catalysts at a glance.' }
          ]
        },
        import: {
          badge: 'MODULE 07 • INTEGRATION & INPUT',
          title: 'Automated Broker Import & Simplified Input Engine',
          desc: 'Seamlessly upload CSV statements from Tradovate, NinjaTrader, MetaTrader 4/5, or use our ultra-fast simplified manual trade entry form to log trades in seconds.',
          bullets: [
            { title: '1-Click Tradovate & NinjaTrader CSV Import', desc: 'Automatic column mapping and execution pairing without manual spreadsheet formatting.' },
            { title: 'MetaTrader 4 & 5 Statement Parser', desc: 'Import full account histories from MT4/MT5 HTML/CSV reports.' },
            { title: 'Simplified Manual Entry Mode', desc: 'Fast 5-field entry (Symbol, Side, Date, Qty, Net P&L) for rapid daily logging.' },
            { title: 'Multi-Account & Prop Firm Management', desc: 'Isolate multiple evaluation accounts with separate currency settings and risk parameters.' }
          ]
        }
      },
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
      featuresTitle: 'Built for Serious Consistency',
      featuresSubtitle: 'Every tool in Quantara was engineered to solve real pains faced by retail traders and prop firm participants.',
      features: [
        { icon: Shield, title: 'Risk Protection & Prop Firm Rules', desc: 'Set custom daily stop limits ($ or %) and track trailing drawdown buffer in real-time to avoid blowing funded challenges.' },
        { icon: Target, title: 'Mathematical Expectancy Edge', desc: 'Quantify which setups are truly profitable and prune losing strategies using rigorous mathematical expectancy formulas.' },
        { icon: Calendar, title: 'Optimal Day & Hour Heatmaps', desc: 'Discover your most profitable trading weekdays and specific market hour sessions to optimize screen time.' },
        { icon: UploadCloud, title: 'Fast Multi-Platform Import', desc: 'Effortlessly import from Tradovate, NinjaTrader, MetaTrader, TradingView, custom CSV files, or fast manual mode.' },
        { icon: DollarSign, title: 'Real-time Currency & Payout Splits', desc: 'Automatic commission calculation, live USD/BRL/EUR currency conversions, and net payout split monitoring.' },
        { icon: FileText, title: 'Executive PDF Reports', desc: 'Generate high-resolution executive summary PDFs to share with investors, mentors, or for personal documentation.' }
      ],
      compareTitle: 'Why Quantara Outperforms Spreadsheets & Generic Journals?',
      compareSubtitle: 'Compare the specialized institutional power of Quantara against ordinary spreadsheet solutions.',
      faqTitle: 'Frequently Asked Questions',
      ctaBottomTitle: 'Ready to Level Up Your Trading Edge?',
      ctaBottomDesc: 'Create your account today and start analyzing your performance with institutional clarity.',
      ctaBottomBtn: ctaPrimary,
      loginBtn: 'Sign In'
    },
    pt: {
      badge: 'QUANTARA TRADING LAB • LABORATÓRIO DE ANALYTICS & GESTÃO DE RISCO',
      heroTitlePrefix: 'Domine Seus Trades com ',
      heroTitleHighlight: 'Métricas Institucionais',
      heroTitleSuffix: ' de Alta Precisão',
      heroDesc: 'O laboratório de alta performance de analytics, auditoria de ordens e gestão de risco para traders de Futuros, Forex, Ações e Mesas Proprietárias. Valide setups matemáticos, proteja seu capital e escale seus saques.',
      ctaPrimary: ctaPrimary,
      ctaSecondary: 'Explorar Todos os Módulos Abaixo',
      trustedBy: 'INTEGRAÇÃO & COMPATIBILIDADE COM AS PRINCIPAIS PLATAFORMAS & MESAS',
      nav: {
        dashboard: 'Dashboard',
        analytics: 'Analytics',
        calendar: 'Calendário',
        trades: 'Trades',
        setups: 'Setups',
        news: 'Notícias',
        import: 'Corretoras',
        simulator: 'Simulador',
        faq: 'Dúvidas'
      },
      stats: {
        pnlTitle: 'Saldo & P&L Monitorado',
        pnlVal: '$50,829.50',
        ddTitle: 'Proteção de Risco em Tempo Real',
        ddVal: '100% Real-Time',
        importTitle: 'Sincronização Multi-Broker',
        importVal: '1-Clique Rápido',
        reportTitle: 'Auditorias Executivas',
        reportVal: 'Relatórios PDF'
      },
      sections: {
        dashboard: {
          badge: 'MÓDULO 01 • VISÃO EXECUTIVA',
          title: 'Executive Dashboard & Controle de Risco em Tempo Real',
          desc: 'Obtenha uma visão panorâmica imediata e em alta definição do saldo atual da sua conta, P&L acumulado, curva de equidade com linha de tendência, medidor de trailing drawdown e trava de stop loss diário.',
          bullets: [
            { title: 'Curva de Equidade & Linha de Tendência', desc: 'Acompanhe a progressão do patrimônio com filtros temporais e regressão linear de crescimento.' },
            { title: 'Volume Semanal & Distribuição por Dia útil', desc: 'Analise o volume de contratos operados e o P&L gerado em cada dia da semana.' },
            { title: 'Trailing Drawdown & Trava de Stop Diário', desc: 'Nunca viole limites de mesas proprietárias com alertas de drawdown e travas diárias em tempo real.' },
            { title: 'Barra de Métricas ao Vivo', desc: 'Cálculo instantâneo de Win Rate, Payoff Ratio, Ganho/Perda Médio e Rebaixamento Máximo.' }
          ]
        },
        analytics: {
          badge: 'MÓDULO 02 • DIAGNÓSTICO PROFUNDO',
          title: 'Diagnóstico Profundo de Performance & Atribuição de Ativos',
          desc: 'Desça ao nível atômico dos seus trades. Avalie seu edge estatístico em múltiplos instrumentos, viés direcional (Compras vs Vendas) e metas de consistência exigidas por mesas proprietárias.',
          bullets: [
            { title: 'Performance por Ativo Operado', desc: 'Ranking visual comparando lucros e perdas no MNQ, NQ, ES, CL, BTC e Forex.' },
            { title: 'Calibração Long vs Short (Compra vs Venda)', desc: 'Isole a taxa de acerto e o P&L líquido em compras versus vendas para encontrar seus pontos fortes.' },
            { title: 'Pontuação de Consistência de Mesas', desc: 'Acompanhe a porcentagem do seu melhor dia sobre o lucro total para cumprir regras de avaliação.' },
            { title: 'P&L Bruto vs Líquido Acumulado', desc: 'Audite a dedução de taxas, emolumentos e comissões reais ao longo de todo o histórico.' }
          ]
        },
        calendar: {
          badge: 'MÓDULO 03 • CALENDÁRIO INTERATIVO',
          title: 'Calendário Interativo de Performance & Zoom Diário',
          desc: 'Transforme sua jornada mensal em um heatmap visual. Veja a distribuição diária de ganhos e perdas, subtotais semanais de W1 a W6 e clique em qualquer dia para inspecionar todos os trades executados.',
          bullets: [
            { title: 'Heatmap Visual Colorido', desc: 'Identifique sequências de ganhos e perdas com badges de P&L líquido em verde e vermelho.' },
            { title: 'Resumos Semanais (W1 a W6)', desc: 'Acompanhe o progresso acumulado de cada semana com contagem de trades, volume e P&L.' },
            { title: 'Zoom Diário em 1 Clique', desc: 'Clique em qualquer dia do calendário para ver horários, ativos e preços de execução de cada trade.' },
            { title: 'Detecção Inteligente de Finais de Semana', desc: 'Visualização padrão de segunda a sexta com inclusão automática de sábados ou domingos caso haja operações.' }
          ]
        },
        trades: {
          badge: 'MÓDULO 04 • HISTÓRICO DE EXECUÇÃO',
          title: 'Histórico de Trades Cirúrgico & Auditoria de Ordens',
          desc: 'Uma tabela completa e auditável de cada ordem enviada ao mercado. Filtre por data, símbolo, direção ou setup, com cálculo automatizado de corretagens, taxas de bolsa e tick size.',
          bullets: [
            { title: 'Detalhes de Execução & Fill', desc: 'Badges visuais de Compra/Venda, preços de entrada/saída, quantidade de contratos e duração.' },
            { title: 'Cálculo Real de Taxas & Comissões', desc: 'Desconto automático de corretagens por contrato para CME, B3, Micro e Mini contratos.' },
            { title: 'Filtros Dinâmicos Instantâneos', desc: 'Isole símbolos específicos (MNQ, NQ, ES) ou filtre por trades vencedores e perdedores em tempo real.' },
            { title: 'Exportação & Trilha de Auditoria', desc: 'Exporte relatórios e dados limpos para auditoria externa, mentores ou declaração fiscal.' }
          ]
        },
        setups: {
          badge: 'MÓDULO 05 • LABORATÓRIO DE ESTRATÉGIAS',
          title: 'Setups Lab & Validação Matemática Multi-Curva',
          desc: 'Quantifique sua verdadeira vantagem matemática. Sobreponha curvas de equidade de estratégias individuais sobre o saldo geral da conta, calcule a expectativa em $/trade e exporte relatórios executivos em PDF.',
          bullets: [
            { title: 'Fórmula de Expectativa Matemática', desc: 'Descubra o valor esperado em dólares de cada setup com base na proporção de Takes e Stops.' },
            { title: 'Comparação de Curvas de Equidade', desc: 'Visualize curvas de setups simultaneamente para identificar quais modelos performam melhor.' },
            { title: 'Atribuição de Ganhos e Perdas', desc: 'Descubra quais estratégias estão alavancando seu capital e elimine padrões tóxicos.' },
            { title: 'Exportação Executiva em PDF em 1 Clique', desc: 'Gere relatórios impressos profissionais em alta resolução com gráficos e tabelas completas.' }
          ]
        },
        news: {
          badge: 'MÓDULO 06 • SINCRONIZAÇÃO MACRO',
          title: 'Calendário Econômico Macro & Horários Especiais CME',
          desc: 'Esteja sempre à frente da volatilidade. Visualize eventos econômicos de alto impacto (CPI, FOMC, Payroll, ISM) e feriados bancários com fechamento antecipado (Half-Days) sincronizados com seus trades.',
          bullets: [
            { title: 'Feed de Notícias de Alto Impacto', desc: 'Sincronização em tempo real com anúncios de taxas de juros, inflação e emprego global.' },
            { title: 'Feriados & Half-Days CME / NYSE', desc: 'Calendário oficial de feriados bancários e sessões com horário reduzido nos EUA e Brasil.' },
            { title: 'Prevenção de Risco de Notícia', desc: 'Correlacione horários de trades com picos de volatilidade para evitar spreads e slippages indesejados.' },
            { title: 'Planejamento de Pré-Mercado', desc: 'Prepare seu viés antes da abertura com os principais catalisadores do dia.' }
          ]
        },
        import: {
          badge: 'MÓDULO 07 • INTEGRAÇÃO & ENTRADA',
          title: 'Importação Automática de Corretoras & Modo Simplificado',
          desc: 'Suba facilmente relatórios CSV do Tradovate, NinjaTrader, MetaTrader 4/5 ou utilize nosso formulário simplificado ultra-rápido para registrar operações manuais em poucos segundos.',
          bullets: [
            { title: 'Importação 1-Clique Tradovate & NinjaTrader', desc: 'Mapeamento automático de colunas e união de ordens sem edição manual em planilhas.' },
            { title: 'Leitor de Extratos MetaTrader 4 & 5', desc: 'Importe históricos completos a partir de relatórios HTML ou CSV do MT4/MT5.' },
            { title: 'Modo Manual Simplificado', desc: 'Formulário direto de 5 campos (Ativo, Lado, Data, Contratos e P&L Líquido) para agilidade máxima.' },
            { title: 'Gestão de Múltiplas Contas & Mesas', desc: 'Isole contas de avaliação com parâmetros de risco e moedas independentes.' }
          ]
        }
      },
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
      featuresTitle: 'Recursos Criados para a Sua Consistência',
      featuresSubtitle: 'Cada ferramenta do Quantara foi desenvolvida para solucionar as maiores dores de traders individuais e participantes de mesas proprietárias.',
      features: [
        { icon: Shield, title: 'Proteção Anti-Quebra & Regras de Mesa', desc: 'Configure limites de perda diária ($ ou %) e acompanhe o drawdown restante em tempo real para evitar desqualificações acidentais.' },
        { icon: Target, title: 'Expectativa Matemática de Setups', desc: 'Descubra exatamente quais estratégias colocam dinheiro no seu bolso e quais estão drenando seu capital através da fórmula de Expectancy.' },
        { icon: Calendar, title: 'Heatmap de Melhores Dias e Horários', desc: 'Identifique seus dias mais lucrativos da semana e as melhores janelas horárias de operação para focar seu tempo onde o retorno é máximo.' },
        { icon: UploadCloud, title: 'Importação Rápida Multi-Plataforma', desc: 'Suporte a Tradovate, NinjaTrader, MetaTrader, TradingView, planilhas CSV personalizadas e formulário manual ultra simplificado.' },
        { icon: DollarSign, title: 'Conversão em Tempo Real & Split BRL', desc: 'Cálculo automático de comissões por contrato, taxa de câmbio USD/BRL e visualização do seu profit split líquido real.' },
        { icon: FileText, title: 'Relatórios Executivos em PDF', desc: 'Exporte relatórios completos em alta resolução para investidores, mentores ou comprovação de histórico com layout impecável.' }
      ],
      compareTitle: 'Por que o Quantara supera planilhas comuns?',
      compareSubtitle: 'Compare a experiência profissional do Quantara contra soluções improvisadas.',
      faqTitle: 'Perguntas Frequentes',
      ctaBottomTitle: 'Pronto para Transformar Seus Resultados?',
      ctaBottomDesc: 'Crie sua conta agora e comece a analisar seus trades com a precisão dos melhores fundos e traders institucionais.',
      ctaBottomBtn: ctaPrimary,
      loginBtn: 'Entrar na Conta'
    },
    es: {
      badge: 'QUANTARA TRADING LAB • LABORATORIO DE ANALÍTICA Y GESTIÓN DE RIESGO',
      heroTitlePrefix: 'Domina Tus Operaciones con ',
      heroTitleHighlight: 'Métricas Institucionales',
      heroTitleSuffix: ' de Alta Precisión',
      heroDesc: 'El laboratorio de alto rendimiento de analítica, auditoría de órdenes y gestión de riesgo para traders de Futuros, Forex, Acciones y Cuentas de Fondeo. Valida setups matemáticos, protege tu capital y escala tus retiros.',
      ctaPrimary: ctaPrimary,
      ctaSecondary: 'Explorar Todos los Módulos Abajo',
      trustedBy: 'COMPATIBILIDAD CON LAS PRINCIPALES PLATAFORMAS Y EMPRESAS DE FONDEO',
      nav: {
        dashboard: 'Dashboard',
        analytics: 'Analytics',
        calendar: 'Calendario',
        trades: 'Trades',
        setups: 'Setups',
        news: 'Noticias',
        import: 'Brokers',
        simulator: 'Simulador',
        faq: 'Dudas'
      },
      stats: {
        pnlTitle: 'Saldo y P&L Monitoreado',
        pnlVal: '$50,829.50',
        ddTitle: 'Protección de Riesgo en Tiempo Real',
        ddVal: '100% Real-Time',
        importTitle: 'Sincronización Multi-Broker',
        importVal: '1-Clic Rápido',
        reportTitle: 'Auditorías Ejecutivas',
        reportVal: 'Informes PDF'
      },
      sections: {
        dashboard: {
          badge: 'MÓDULO 01 • VISIÓN EJECUTIVA',
          title: 'Executive Dashboard y Control de Riesgo en Tiempo Real',
          desc: 'Obtén una vista panorámica inmediata de tu saldo de cuenta, P&L neto, curva de equidad con línea de tendencia, medidor de trailing drawdown y límite de pérdida diario.',
          bullets: [
            { title: 'Curva de Equidad y Línea de Tendencia', desc: 'Sigue la progresión de tu capital con filtros temporales y regresión lineal.' },
            { title: 'Volumen Semanal y Distribución Diaria', desc: 'Analiza el volumen de contratos y el P&L generado en cada día hábil.' },
            { title: 'Trailing Drawdown y Stop Diario', desc: 'Evita violar reglas de empresas de fondeo con alertas de rebasamiento en tiempo real.' },
            { title: 'Barra de Métricas en Vivo', desc: 'Cálculo instantáneo de Win Rate, Payoff Ratio y Drawdown Máximo.' }
          ]
        },
        analytics: {
          badge: 'MÓDULO 02 • DIAGNÓSTICO PROFUNDO',
          title: 'Diagnóstico Profundo de Rendimiento y Atribución de Activos',
          desc: 'Evalúa tu ventaja estadística en múltiples instrumentos, sesgo direcional (Compras vs Ventas) y metas de consistencia requeridas por cuentas de fondeo.',
          bullets: [
            { title: 'Rendimiento por Activo Operado', desc: 'Ranking visual comparando resultados en MNQ, NQ, ES, CL y Forex.' },
            { title: 'Calibración Long vs Short (Compra vs Venta)', desc: 'Aísla la tasa de acierto en compras y ventas para detectar fortalezas.' },
            { title: 'Puntuación de Consistencia', desc: 'Monitorea el porcentaje de tu mejor día sobre el beneficio total.' },
            { title: 'P&L Bruto vs Neto Acumulado', desc: 'Auditoría exacta de comisiones y tarifas en todo tu historial.' }
          ]
        },
        calendar: {
          badge: 'MÓDULO 03 • CALENDARIO INTERACTIVO',
          title: 'Calendario Interactivo de Rendimiento y Zoom Diario',
          desc: 'Visualiza un mapa de calor mensual con resultados diarios, subtotales semanales y haz clic en cualquier día para ver cada orden ejecutada.',
          bullets: [
            { title: 'Mapa de Calor con Colores Dinámicos', desc: 'Identifica rachas ganadoras y perdedoras con badges de P&L diario.' },
            { title: 'Resúmenes Semanales (W1 a W6)', desc: 'Sigue el progreso acumulado por semana con volumen y resultados.' },
            { title: 'Zoom Diario en 1 Clic', desc: 'Haz clic en cualquier día para ver horas y precios de ejecución.' },
            { title: 'Detección de Fines de Semana', desc: 'Visualización estándar de lunes a viernes con inclusión de fines de semana si hay trades.' }
          ]
        },
        trades: {
          badge: 'MÓDULO 04 • HISTORIAL DE OPERACIONES',
          title: 'Historial de Trades Quirúrgico y Auditoría de Órdenes',
          desc: 'Tabla auditable de cada orden enviada. Filtra por fecha, símbolo o setup con cálculo automático de comisiones y tick sizes.',
          bullets: [
            { title: 'Detalles de Ejecución y Fill', desc: 'Badges de Compra/Venta, precios de entrada/salida y contratos.' },
            { title: 'Cálculo Real de Tarifas', desc: 'Deducción automática de comisiones por contrato para CME y Forex.' },
            { title: 'Filtros Dinâmicos Instantáneos', desc: 'Aísla símbolos (MNQ, NQ, ES) y analiza trades ganadores y perdedores.' },
            { title: 'Exportación de Auditoría', desc: 'Exporta datos limpios para mentores o declaraciones.' }
          ]
        },
        setups: {
          badge: 'MÓDULO 05 • LABORATORIO DE ESTRATEGIAS',
          title: 'Setups Lab y Validación Matemática Multi-Curva',
          desc: 'Superpón curvas de equidad por estrategia sobre el balance general, calcula la esperanza en $/trade y exporta informes ejecutivos en PDF.',
          bullets: [
            { title: 'Fórmula de Esperanza Matemática', desc: 'Conoce el valor esperado en dólares de cada setup con conteo de Takes y Stops.' },
            { title: 'Comparación de Curvas de Equidad', desc: 'Visualiza curvas independientes para identificar las mejores estrategias.' },
            { title: 'Atribución de Resultados', desc: 'Descubre qué setups generan ganancias y elimina patrones destructivos.' },
            { title: 'Exportación Ejecutiva en PDF', desc: 'Genera informes profesionales en alta resolución listos para imprimir.' }
          ]
        },
        news: {
          badge: 'MÓDULO 06 • SINCRONIZAÇÃO MACRO',
          title: 'Calendario Macroeconómico y Horarios Reducidos CME',
          desc: 'Visualiza eventos de alto impacto (CPI, FOMC, NFP) y feriados bancarios con cierre anticipado sincronizados con tus operaciones.',
          bullets: [
            { title: 'Noticias de Alto Impacto', desc: 'Sincronización en tiempo real con datos de inflación, tasas y empleo.' },
            { title: 'Feriados y Half-Days CME / NYSE', desc: 'Calendario oficial de días no laborables y cierres tempranos.' },
            { title: 'Control de Riesgo de Volatilidad', desc: 'Evita deslizamientos innecesarios en picos de noticias.' },
            { title: 'Planificación de Pre-Mercado', desc: 'Prepara tu sesión diaria con los catalizadores clave del mercado.' }
          ]
        },
        import: {
          badge: 'MÓDULO 07 • INTEGRACIÓN Y REGISTRO',
          title: 'Importación Automática de Brokers y Modo Simple',
          desc: 'Sube extractos CSV de Tradovate, NinjaTrader, MetaTrader 4/5 o usa nuestro formulario simplificado ultra rápido para registrar operaciones.',
          bullets: [
            { title: 'Importación en 1 Clic Tradovate / NinjaTrader', desc: 'Mapeo automático de columnas y emparejamiento de órdenes.' },
            { title: 'Lector de Extractos MetaTrader 4 y 5', desc: 'Importa historiales completos desde informes HTML o CSV.' },
            { title: 'Modo Manual Simplificado', desc: 'Formulario rápido de 5 campos para registro inmediato.' },
            { title: 'Gestión Multi-Cuenta de Fondeo', desc: 'Separa cuentas de evaluación con reglas de riesgo independientes.' }
          ]
        }
      },
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
      featuresTitle: 'Herramientas Diseñadas para tu Consistencia',
      featuresSubtitle: 'Cada módulo fue creado para resolver los desafíos reales de traders individuales y de cuentas de fondeo.',
      features: [
        { icon: Shield, title: 'Protección Anti-Pérdida y Reglas de Fondeo', desc: 'Configura límites diarios de pérdida y monitorea el margen de drawdown restante en tiempo real.' },
        { icon: Target, title: 'Esperanza Matemática de Setups', desc: 'Identifica qué estrategias son rentables y elimina las perdedoras usando fórmulas estadísticas precisas.' },
        { icon: Calendar, title: 'Heatmap de Mejores Días y Horarios', desc: 'Descubre los días de la semana y franjas horarias con mejor rendimiento para maximizar tu rentabilidad.' },
        { icon: UploadCloud, title: 'Importación Automática Multi-Plataforma', desc: 'Compatible con Tradovate, NinjaTrader, MetaTrader, TradingView, CSVs personalizados o modo manual rápido.' },
        { icon: DollarSign, title: 'Conversión de Moneda y Split en Vivo', desc: 'Cálculo de comisiones por contrato, tipo de cambio en tiempo real y división de beneficios neta.' },
        { icon: FileText, title: 'Informes Ejecutivos en PDF', desc: 'Genera informes completos en PDF de alta resolución con un solo clic para mentores o inversores.' }
      ],
      compareTitle: '¿Por qué Quantara supera a las hojas de cálculo?',
      compareSubtitle: 'Compara la experiencia profesional de Quantara frente a métodos tradicionales.',
      faqTitle: 'Preguntas Frecuentes',
      ctaBottomTitle: '¿Listo para Llevar tu Trading al Siguiente Nivel?',
      ctaBottomDesc: 'Crea tu cuenta hoy mismo y analiza tus operaciones con precisión institucional.',
      ctaBottomBtn: ctaPrimary,
      loginBtn: 'Iniciar Sesión'
    }
  }[lang];

  const currentLangObj = LANGUAGES.find(l => l.code === lang) || LANGUAGES[0];

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
      q: lang === 'pt' ? 'Meus dados ficam seguros?' : lang === 'es' ? '¿Mis dados están seguros?' : 'Is my trading data secure?',
      a: lang === 'pt' ? 'Sim. Seus dados são criptografados com padrões bancários e você pode escolher entre armazenamento local no seu navegador ou sincronização em nuvem segura.' : lang === 'es' ? 'Sí. Tus dados están cifrados con estándares bancarios y puedes elegir entre almacenamiento local o en la nube.' : 'Yes. All data is encrypted with bank-grade security and you can choose between private local storage or encrypted cloud synchronization.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#070709] text-white font-sans relative overflow-x-hidden selection:bg-amber-500 selection:text-black">
      
      {/* Dynamic Ambient Background Glows */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] bg-amber-500/10 blur-[170px] rounded-full" />
        <div className="absolute top-[35%] right-[-10%] w-[55vw] h-[55vw] bg-yellow-500/5 blur-[180px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[20%] w-[50vw] h-[50vw] bg-amber-600/10 blur-[160px] rounded-full" />
      </div>

      {/* Fixed Navigation Header with Safe-Area Protection */}
      <header 
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-2xl bg-[#070709]/95 border-b border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.6)] transition-all"
        style={{
          paddingTop: 'env(safe-area-inset-top, 0px)',
          paddingLeft: 'env(safe-area-inset-left, 0px)',
          paddingRight: 'env(safe-area-inset-right, 0px)',
        }}
      >
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 h-16 sm:h-20 flex items-center justify-between gap-4">
          
          {/* Left: Logo Quantara Aligned Exactly Like Dashboard */}
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
            <a href="#dashboard-section" className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-gray-300 hover:text-amber-400 hover:bg-white/5 transition-all">{t.nav.dashboard}</a>
            <a href="#analytics-section" className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-gray-300 hover:text-amber-400 hover:bg-white/5 transition-all">{t.nav.analytics}</a>
            <a href="#calendar-section" className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-gray-300 hover:text-amber-400 hover:bg-white/5 transition-all">{t.nav.calendar}</a>
            <a href="#trades-section" className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-gray-300 hover:text-amber-400 hover:bg-white/5 transition-all">{t.nav.trades}</a>
            <a href="#setups-section" className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-gray-300 hover:text-amber-400 hover:bg-white/5 transition-all">{t.nav.setups}</a>
            <a href="#news-section" className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-gray-300 hover:text-amber-400 hover:bg-white/5 transition-all">{t.nav.news}</a>
            <a href="#import-section" className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-gray-300 hover:text-amber-400 hover:bg-white/5 transition-all">{t.nav.import}</a>
            <a href="#simulator" className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-gray-300 hover:text-amber-400 hover:bg-white/5 transition-all">{t.nav.simulator}</a>
            <a href="#faq" className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-gray-300 hover:text-amber-400 hover:bg-white/5 transition-all">{t.nav.faq}</a>
          </nav>

          {/* Right: Flag Language Selector + Auth Buttons (Aligned Far Right) */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            
            {/* Language Selector Dropdown with Flags */}
            <div className="relative" ref={langDropdownRef}>
              <button
                type="button"
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-xs font-bold text-gray-200 transition-all cursor-pointer shadow-sm active:scale-95"
                title="Select Language"
              >
                <span className="text-base leading-none">{currentLangObj.flag}</span>
                <span className="uppercase text-[11px] font-extrabold text-gray-300">{currentLangObj.code}</span>
                <ChevronDown size={12} className={`text-gray-400 transition-transform ${langDropdownOpen ? 'rotate-180 text-amber-400' : ''}`} />
              </button>

              {langDropdownOpen && (
                <div className="absolute right-0 mt-2 w-36 bg-[#0e0e14]/98 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-2xl py-1.5 z-50 animate-fadeIn">
                  {LANGUAGES.map((l) => (
                    <button
                      key={l.code}
                      type="button"
                      onClick={() => {
                        setLang(l.code);
                        setLangDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-xs font-bold transition-colors cursor-pointer ${
                        lang === l.code ? 'bg-amber-500/15 text-amber-400' : 'text-gray-300 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base leading-none">{l.flag}</span>
                        <span>{l.label}</span>
                      </div>
                      {lang === l.code && <Check size={12} className="text-amber-400" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Sign In Button */}
            <button
              onClick={() => navigate('/auth')}
              className="text-xs font-bold text-gray-300 hover:text-white px-3 py-2 transition-colors hidden sm:block cursor-pointer"
            >
              {t.loginBtn}
            </button>

            {/* Dynamic CTA Button (Connected to Admin Promotion) */}
            <button
              onClick={() => navigate('/auth')}
              className="bg-gradient-to-r from-amber-500 to-yellow-400 text-black text-xs font-extrabold px-3.5 sm:px-5 py-2.5 rounded-xl shadow-[0_0_25px_rgba(245,158,11,0.35)] hover:shadow-[0_0_35px_rgba(245,158,11,0.5)] hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>{t.ctaPrimary}</span>
              <ArrowRight size={14} />
            </button>

            {/* Mobile Hamburger Menu Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-amber-400 hover:bg-white/10 transition-colors lg:hidden cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#0a0a0e]/98 border-b border-white/10 px-6 py-6 space-y-4 backdrop-blur-2xl shadow-2xl animate-fadeIn">
            
            {/* Language Selector in Mobile Drawer */}
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Language:</span>
              <div className="flex items-center gap-1.5">
                {LANGUAGES.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => { setLang(l.code); }}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
                      lang === l.code ? 'bg-amber-500 text-black' : 'bg-white/5 text-gray-300'
                    }`}
                  >
                    <span>{l.flag}</span>
                    <span className="uppercase text-[10px]">{l.code}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-bold">
              <a 
                href="#dashboard-section" 
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-gray-200 hover:text-amber-400 hover:border-amber-500/30 transition-all flex items-center gap-2"
              >
                <Activity size={14} className="text-amber-400" />
                <span>{t.nav.dashboard}</span>
              </a>
              <a 
                href="#analytics-section" 
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-gray-200 hover:text-cyan-400 hover:border-cyan-500/30 transition-all flex items-center gap-2"
              >
                <BarChart2 size={14} className="text-cyan-400" />
                <span>{t.nav.analytics}</span>
              </a>
              <a 
                href="#calendar-section" 
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-gray-200 hover:text-emerald-400 hover:border-emerald-500/30 transition-all flex items-center gap-2"
              >
                <Calendar size={14} className="text-emerald-400" />
                <span>{t.nav.calendar}</span>
              </a>
              <a 
                href="#trades-section" 
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-gray-200 hover:text-amber-400 hover:border-amber-500/30 transition-all flex items-center gap-2"
              >
                <TrendingUp size={14} className="text-amber-400" />
                <span>{t.nav.trades}</span>
              </a>
              <a 
                href="#setups-section" 
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-gray-200 hover:text-yellow-400 hover:border-yellow-500/30 transition-all flex items-center gap-2"
              >
                <Layers size={14} className="text-yellow-400" />
                <span>{t.nav.setups}</span>
              </a>
              <a 
                href="#news-section" 
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-gray-200 hover:text-amber-400 hover:border-amber-500/30 transition-all flex items-center gap-2"
              >
                <Globe size={14} className="text-amber-400" />
                <span>{t.nav.news}</span>
              </a>
              <a 
                href="#import-section" 
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-gray-200 hover:text-emerald-400 hover:border-emerald-500/30 transition-all flex items-center gap-2"
              >
                <UploadCloud size={14} className="text-emerald-400" />
                <span>{t.nav.import}</span>
              </a>
              <a 
                href="#simulator" 
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-gray-200 hover:text-amber-400 hover:border-amber-500/30 transition-all flex items-center gap-2"
              >
                <Zap size={14} className="text-amber-400" />
                <span>{t.nav.simulator}</span>
              </a>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={() => { setMobileMenuOpen(false); navigate('/auth'); }}
                className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-xs hover:bg-white/10 transition-colors"
              >
                {t.loginBtn}
              </button>
              <button
                onClick={() => { setMobileMenuOpen(false); navigate('/auth'); }}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-black text-xs shadow-lg shadow-amber-500/20"
              >
                {t.ctaPrimary}
              </button>
            </div>
          </div>
        )}
      </header>

      {/* HERO SECTION WITH SAFE AREA OFFSET */}
      <section 
        className="relative z-10 pb-16 px-4 max-w-7xl mx-auto flex flex-col items-center text-center"
        style={{
          paddingTop: 'calc(80px + env(safe-area-inset-top, 0px) + 2.5rem)'
        }}
      >
        
        {/* Top Eyebrow Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold tracking-wider uppercase mb-6 shadow-[0_0_30px_rgba(245,158,11,0.15)] animate-pulse">
          <Sparkles size={14} className="text-amber-400" />
          <span>{t.badge}</span>
        </div>

        {/* Main Hero Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black font-display tracking-tight text-white max-w-5xl leading-[1.1] mb-6">
          {t.heroTitlePrefix}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500">
            {t.heroTitleHighlight}
          </span>
          {t.heroTitleSuffix}
        </h1>

        {/* Subtitle */}
        <p className="text-gray-300 text-base sm:text-xl max-w-3xl leading-relaxed mb-10">
          {t.heroDesc}
        </p>

        {/* Hero CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center max-w-md mb-12">
          <button 
            onClick={() => navigate('/auth')} 
            className="w-full sm:w-auto bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 text-black px-8 py-4 rounded-2xl font-black text-base shadow-[0_0_35px_rgba(245,158,11,0.45)] hover:shadow-[0_0_50px_rgba(245,158,11,0.6)] hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{t.ctaPrimary}</span>
            <ArrowRight size={18} />
          </button>
          
          <a 
            href="#dashboard-section" 
            className="w-full sm:w-auto bg-white/5 hover:bg-white/10 border border-white/10 text-white px-8 py-4 rounded-2xl font-bold text-base transition-all flex items-center justify-center gap-2 backdrop-blur-md cursor-pointer"
          >
            <span>{t.ctaSecondary}</span>
            <ChevronRight size={18} className="text-amber-400" />
          </a>
        </div>

        {/* Quick Highlights KPI Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl pt-8 border-t border-white/5 mb-16">
          <div className="flex flex-col items-center p-4 rounded-2xl bg-white/[0.02] border border-white/5">
            <span className="text-2xl font-black text-amber-400">{t.stats.pnlVal}</span>
            <span className="text-xs text-gray-400 font-medium mt-1">{t.stats.pnlTitle}</span>
          </div>
          <div className="flex flex-col items-center p-4 rounded-2xl bg-white/[0.02] border border-white/5">
            <span className="text-2xl font-black text-emerald-400">{t.stats.ddVal}</span>
            <span className="text-xs text-gray-400 font-medium mt-1">{t.stats.ddTitle}</span>
          </div>
          <div className="flex flex-col items-center p-4 rounded-2xl bg-white/[0.02] border border-white/5">
            <span className="text-2xl font-black text-yellow-400">{t.stats.importVal}</span>
            <span className="text-xs text-gray-400 font-medium mt-1">{t.stats.importTitle}</span>
          </div>
          <div className="flex flex-col items-center p-4 rounded-2xl bg-white/[0.02] border border-white/5">
            <span className="text-2xl font-black text-cyan-400">{t.stats.reportVal}</span>
            <span className="text-xs text-gray-400 font-medium mt-1">{t.stats.reportTitle}</span>
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
            {t.trustedBy}
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
                <span>{t.sections.dashboard.badge}</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black font-display text-white mb-3">
                {t.sections.dashboard.title}
              </h2>
              <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                {t.sections.dashboard.desc}
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

            {/* Feature Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {t.sections.dashboard.bullets.map((b, i) => (
                <div key={i} className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-amber-500/30 transition-all">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 mb-3 font-bold text-xs">
                    0{i + 1}
                  </div>
                  <h3 className="text-sm font-bold text-white mb-1.5">{b.title}</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">{b.desc}</p>
                </div>
              ))}
            </div>

            {/* Action CTA */}
            <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between flex-wrap gap-4">
              <span className="text-xs text-gray-400 font-medium">Equidade em tempo real • Trava de stop diário • Métricas B3 &amp; CME</span>
              <button 
                onClick={() => navigate('/auth')}
                className="bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 px-5 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer"
              >
                <span>Experimentar o Dashboard</span>
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
                <span>{t.sections.analytics.badge}</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black font-display text-white mb-3">
                {t.sections.analytics.title}
              </h2>
              <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                {t.sections.analytics.desc}
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

            {/* Feature Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {t.sections.analytics.bullets.map((b, i) => (
                <div key={i} className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-cyan-500/30 transition-all">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400 mb-3 font-bold text-xs">
                    0{i + 1}
                  </div>
                  <h3 className="text-sm font-bold text-white mb-1.5">{b.title}</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">{b.desc}</p>
                </div>
              ))}
            </div>

            {/* Action CTA */}
            <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between flex-wrap gap-4">
              <span className="text-xs text-gray-400 font-medium">Rankings de ativos • Regras de consistência de mesa • Viés de compra/venda</span>
              <button 
                onClick={() => navigate('/auth')}
                className="bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 px-5 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer"
              >
                <span>Explorar Módulo Analytics</span>
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
                <span>{t.sections.calendar.badge}</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black font-display text-white mb-3">
                {t.sections.calendar.title}
              </h2>
              <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                {t.sections.calendar.desc}
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

            {/* Feature Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {t.sections.calendar.bullets.map((b, i) => (
                <div key={i} className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-emerald-500/30 transition-all">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-3 font-bold text-xs">
                    0{i + 1}
                  </div>
                  <h3 className="text-sm font-bold text-white mb-1.5">{b.title}</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">{b.desc}</p>
                </div>
              ))}
            </div>

            {/* Action CTA */}
            <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between flex-wrap gap-4">
              <span className="text-xs text-gray-400 font-medium">Heatmap mensal • Semanas W1 a W6 • Detecção inteligente de finais de semana</span>
              <button 
                onClick={() => navigate('/auth')}
                className="bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 px-5 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer"
              >
                <span>Acessar o Calendário</span>
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
                <span>{t.sections.trades.badge}</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black font-display text-white mb-3">
                {t.sections.trades.title}
              </h2>
              <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                {t.sections.trades.desc}
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

            {/* Feature Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {t.sections.trades.bullets.map((b, i) => (
                <div key={i} className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-amber-500/30 transition-all">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 mb-3 font-bold text-xs">
                    0{i + 1}
                  </div>
                  <h3 className="text-sm font-bold text-white mb-1.5">{b.title}</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">{b.desc}</p>
                </div>
              ))}
            </div>

            {/* Action CTA */}
            <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between flex-wrap gap-4">
              <span className="text-xs text-gray-400 font-medium">Auditoria de ordens • Preços de entrada e saída • Dedução de taxas por contrato</span>
              <button 
                onClick={() => navigate('/auth')}
                className="bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 px-5 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer"
              >
                <span>Ver Lista de Execuções</span>
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
                <span>{t.sections.setups.badge}</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black font-display text-white mb-3">
                {t.sections.setups.title}
              </h2>
              <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                {t.sections.setups.desc}
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

            {/* Feature Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {t.sections.setups.bullets.map((b, i) => (
                <div key={i} className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-yellow-500/30 transition-all">
                  <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center text-yellow-400 mb-3 font-bold text-xs">
                    0{i + 1}
                  </div>
                  <h3 className="text-sm font-bold text-white mb-1.5">{b.title}</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">{b.desc}</p>
                </div>
              ))}
            </div>

            {/* Action CTA */}
            <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between flex-wrap gap-4">
              <span className="text-xs text-gray-400 font-medium">Expectativa $/trade • Curvas independentes de estratégia • Exportação PDF em 1 clique</span>
              <button 
                onClick={() => navigate('/auth')}
                className="bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 px-5 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer"
              >
                <span>Validar Seus Setups</span>
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
                <span>{t.sections.news.badge}</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black font-display text-white mb-3">
                {t.sections.news.title}
              </h2>
              <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                {t.sections.news.desc}
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

            {/* Feature Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {t.sections.news.bullets.map((b, i) => (
                <div key={i} className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-amber-500/30 transition-all">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 mb-3 font-bold text-xs">
                    0{i + 1}
                  </div>
                  <h3 className="text-sm font-bold text-white mb-1.5">{b.title}</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">{b.desc}</p>
                </div>
              ))}
            </div>

            {/* Action CTA */}
            <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between flex-wrap gap-4">
              <span className="text-xs text-gray-400 font-medium">Notícias de alto impacto • Half-days CME • Sincronização de horários de execução</span>
              <button 
                onClick={() => navigate('/auth')}
                className="bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 px-5 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer"
              >
                <span>Consultar Calendário Macro</span>
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
                <span>{t.sections.import.badge}</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black font-display text-white mb-3">
                {t.sections.import.title}
              </h2>
              <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                {t.sections.import.desc}
              </p>
            </div>

            {/* Interactive Platform Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="p-6 rounded-2xl bg-black/40 border border-white/10 flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 mb-4">
                  <UploadCloud size={24} />
                </div>
                <h3 className="text-base font-bold text-white mb-1">Tradovate CSV</h3>
                <p className="text-xs text-gray-400">Detecção automática de preenchimentos, taxas e contratos.</p>
              </div>

              <div className="p-6 rounded-2xl bg-black/40 border border-white/10 flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 mb-4">
                  <UploadCloud size={24} />
                </div>
                <h3 className="text-base font-bold text-white mb-1">NinjaTrader 8</h3>
                <p className="text-xs text-gray-400">Importação direta de ordens históricas em segundos.</p>
              </div>

              <div className="p-6 rounded-2xl bg-black/40 border border-white/10 flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center text-yellow-400 mb-4">
                  <UploadCloud size={24} />
                </div>
                <h3 className="text-base font-bold text-white mb-1">MetaTrader 4 &amp; 5</h3>
                <p className="text-xs text-gray-400">Suporte a relatórios de extrato padrão HTML e CSV.</p>
              </div>

              <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-500/15 to-transparent border border-amber-500/40 flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 mb-4">
                  <Zap size={24} />
                </div>
                <h3 className="text-base font-black text-amber-400 mb-1">Modo Manual Simplificado</h3>
                <p className="text-xs text-gray-300">Lançamento em 5 campos rápidos: Ativo, Direção, Data, Qtd e P&L.</p>
              </div>
            </div>

            {/* Feature Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {t.sections.import.bullets.map((b, i) => (
                <div key={i} className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-emerald-500/30 transition-all">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-3 font-bold text-xs">
                    0{i + 1}
                  </div>
                  <h3 className="text-sm font-bold text-white mb-1.5">{b.title}</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">{b.desc}</p>
                </div>
              ))}
            </div>

            {/* Action CTA */}
            <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between flex-wrap gap-4">
              <span className="text-xs text-gray-400 font-medium">Detecção automática de colunas • Múltiplas subcontas isoladas • Zero fricção</span>
              <button 
                onClick={() => navigate('/auth')}
                className="bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 px-5 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer"
              >
                <span>Importar Seus Trades Agora</span>
                <ArrowRight size={14} />
              </button>
            </div>

          </div>
        </section>

      </div>

      {/* INTERACTIVE MATHEMATICAL SIMULATOR */}
      <section id="simulator" className="relative z-10 py-20 px-4 max-w-7xl mx-auto border-t border-white/5 scroll-mt-32">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-400 mb-2 block">Matemática &amp; Consistência</span>
          <h2 className="text-3xl sm:text-5xl font-black font-display tracking-tight text-white mb-4">
            {t.simTitle}
          </h2>
          <p className="text-gray-300 text-base sm:text-lg">
            {t.simSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-gradient-to-br from-[#16161a] to-[#0d0e12] border border-amber-500/20 p-6 sm:p-10 rounded-3xl shadow-2xl">
          {/* Controls */}
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

          {/* Results Box */}
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
              className="w-full mt-2 bg-gradient-to-r from-amber-500 to-yellow-400 text-black py-3.5 rounded-xl font-black text-sm hover:brightness-110 active:scale-95 transition-all shadow-[0_0_20px_rgba(245,158,11,0.4)] cursor-pointer"
            >
              Aplicar ao Meu Portfólio
            </button>
          </div>
        </div>
      </section>

      {/* CORE FEATURES GRID */}
      <section id="features" className="relative z-10 py-20 px-4 max-w-7xl mx-auto border-t border-white/5 scroll-mt-32">
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

      {/* COMPARISON TABLE */}
      <section id="compare" className="relative z-10 py-20 px-4 max-w-6xl mx-auto border-t border-white/5 scroll-mt-32">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl sm:text-4xl font-black font-display text-white mb-3">
            {t.compareTitle}
          </h2>
          <p className="text-gray-400 text-sm sm:text-base">
            {t.compareSubtitle}
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 overflow-hidden bg-[#101014] shadow-2xl">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02]">
                <th className="p-4 sm:p-6 text-gray-400 font-bold">Funcionalidade</th>
                <th className="p-4 sm:p-6 text-amber-400 font-black bg-amber-500/10 text-center">Quantara Trading Lab</th>
                <th className="p-4 sm:p-6 text-gray-500 font-medium text-center">Planilhas Excel / Sheets</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <tr>
                <td className="p-4 sm:p-6 font-bold text-white">Curva de Equidade em Tempo Real</td>
                <td className="p-4 sm:p-6 text-center bg-amber-500/5 text-emerald-400 font-bold">✔ Automático</td>
                <td className="p-4 sm:p-6 text-center text-gray-500">❌ Gráficos estáticos e manuais</td>
              </tr>
              <tr>
                <td className="p-4 sm:p-6 font-bold text-white">Expectativa Matemática por Setup</td>
                <td className="p-4 sm:p-6 text-center bg-amber-500/5 text-emerald-400 font-bold">✔ $/Trade &amp; Curvas Isoladas</td>
                <td className="p-4 sm:p-6 text-center text-gray-500">❌ Fórmulas complexas e frágeis</td>
              </tr>
              <tr>
                <td className="p-4 sm:p-6 font-bold text-white">Trava de Stop Loss Diário &amp; Trailing Drawdown</td>
                <td className="p-4 sm:p-6 text-center bg-amber-500/5 text-emerald-400 font-bold">✔ Alertas ao Vivo</td>
                <td className="p-4 sm:p-6 text-center text-gray-500">❌ Sem proteção em tempo real</td>
              </tr>
              <tr>
                <td className="p-4 sm:p-6 font-bold text-white">Importação CSV 1-Clique (Tradovate, NT8)</td>
                <td className="p-4 sm:p-6 text-center bg-amber-500/5 text-emerald-400 font-bold">✔ Mapeamento Inteligente</td>
                <td className="p-4 sm:p-6 text-center text-gray-500">❌ Copiar e colar linha a linha</td>
              </tr>
              <tr>
                <td className="p-4 sm:p-6 font-bold text-white">Relatórios Executivos em PDF</td>
                <td className="p-4 sm:p-6 text-center bg-amber-500/5 text-emerald-400 font-bold">✔ Exportação em 1 Clique</td>
                <td className="p-4 sm:p-6 text-center text-gray-500">❌ Formatação quebrada</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section id="faq" className="relative z-10 py-16 px-4 max-w-4xl mx-auto border-t border-white/5 scroll-mt-32">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-black font-display text-white mb-3">
            {t.faqTitle}
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
              {t.ctaBottomTitle}
            </h2>
            <p className="text-gray-200 text-sm sm:text-lg">
              {t.ctaBottomDesc}
            </p>
            <button
              onClick={() => navigate('/auth')}
              className="bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 text-black font-black px-10 py-4 rounded-2xl text-base shadow-[0_0_35px_rgba(245,158,11,0.5)] hover:shadow-[0_0_50px_rgba(245,158,11,0.7)] hover:brightness-110 active:scale-95 transition-all inline-flex items-center gap-2 cursor-pointer"
            >
              <span>{t.ctaBottomBtn}</span>
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
            <a href="#dashboard-section" className="hover:text-amber-400 transition-colors">Features</a>
            <a href="#simulator" className="hover:text-amber-400 transition-colors">Simulator</a>
            <button onClick={() => navigate('/auth')} className="hover:text-amber-400 transition-colors cursor-pointer">Login</button>
          </div>

        </div>
      </footer>

    </div>
  );
}
