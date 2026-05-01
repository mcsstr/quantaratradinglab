import React, { useState, useEffect, useMemo, useRef, useTransition, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, Link } from 'react-router-dom';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell, LabelList, PieChart, Pie, AreaChart, Area
} from 'recharts';
import {
  LayoutDashboard, Import, Settings as SettingsIcon, TrendingUp, DollarSign, Percent, Target, AlertTriangle, ChevronLeft, ChevronRight, ChevronDown, Trash2, ListIcon, Search, Activity, CalendarDays, Plus, Palette, BarChart2, Sun, ShieldAlert, Layers, Banknote, Edit2, Check, X, Download, FileText, ArrowUp, ArrowDown, Newspaper, Folder, MenuIcon, UserIcon, CreditCardIcon, LogOutIcon, GearIcon2, Building2, Monitor, RefreshCcw
} from '../components/Icons';
import { Loader2, Crown, BookOpen } from 'lucide-react';
import {
  CURRENCIES_LIST, TIMEZONES_LIST, DEFAULT_SETTINGS, DEFAULT_THEME, DEFAULT_ACCOUNT_SETTINGS, THEME_GROUPS, generateId, hexToRgba
} from '../utils/constants';
import { supabase } from '../utils/supabase';
import { columnAliases, cleanNumericValue, parseSmartDate } from '../utils/tradeParser';
import AccountMappingPanel, { type PasteRule } from '../components/AccountMappingPanel';
import { t } from '../utils/i18n';
import { LAYOUT } from '../utils/layoutConfig';
import './Dashboard.css';

// Views
import DashboardHomeView from './DashboardViews/DashboardHomeView';
import AnalyticsView from './DashboardViews/AnalyticsView';
import TradesView from './DashboardViews/TradesView';
import NewsView from './DashboardViews/NewsView';
import HolidaysView from './DashboardViews/HolidaysView';
import ImportView from './DashboardViews/ImportView';
import SettingsView from './DashboardViews/SettingsView';
import MobileMenuView from './DashboardViews/MobileMenuView';
import JournalView from './DashboardViews/JournalView';
import SetupsView from './DashboardViews/SetupsView';
import TradingPageView from './DashboardViews/TradingPageView';
import PlanExpiredModal from '../components/PlanExpiredModal';
import PremiumUpgradeModal from '../components/PremiumUpgradeModal';
import FreePlanPromoModal from '../components/FreePlanPromoModal';
import { usePlanConfig } from '../hooks/usePlanConfig';
import { useSetupTargetsRepository } from '../hooks/useSetupTargetsRepository';

// Components
import SearchableSelect from '../components/SearchableSelect';
import { useNewsRepository } from '../hooks/useNewsRepository';
import { useHolidaysRepository } from '../hooks/useHolidaysRepository';
import { useJournalsRepository } from '../hooks/useJournalsRepository';
import { useSetupsRepository } from '../hooks/useSetupsRepository';
import { useSetupConfigLogsRepository } from '../hooks/useSetupConfigLogsRepository';
import { useTradingFavoritesRepository } from '../hooks/useTradingFavoritesRepository';


// Helper for Universal Commission Deduction
const calculateTradeFee = (trade: any, accSettings: any) => {
  if (trade.commission !== undefined && trade.commission !== null && trade.commission !== 0) {
    return Math.abs(Number(trade.commission));
  }
  const fixedFeeAmount = accSettings.isFixedFee
    ? (accSettings.feeType === '%' ? (accSettings.initialBalance * accSettings.feePerContract) / 100 : accSettings.feePerContract)
    : 0;
  return (trade.qty || 1) * fixedFeeAmount;
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');

  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [theme, setTheme] = useState(DEFAULT_THEME);

  // --- MULTI-ACCOUNT STATE ---
  const [accounts, setAccounts] = useState([]);
  const [activeAccountId, setActiveAccountId] = useState(null);
  const [isAccountSwitcherOpen, setIsAccountSwitcherOpen] = useState(false);
  const [isAccountFormOpen, setIsAccountFormOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [accountFormData, setAccountFormData] = useState({ name: '', ...DEFAULT_ACCOUNT_SETTINGS });
  const [accountFormError, setAccountFormError] = useState('');
  const [confirmDeleteAccountId, setConfirmDeleteAccountId] = useState(null);
  const [selectedImportAccountId, setSelectedImportAccountId] = useState('');

  const [trades, setTrades] = useState([]);
  const [importText, setImportText] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [sortOrder, setSortOrder] = useState('recent');
  const [holidaySortOrder, setHolidaySortOrder] = useState('recent');
  const [exchangeRate, setExchangeRate] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterMonth, setFilterMonth] = useState('all');
  const [filterYear, setFilterYear] = useState('all');
  const [newHoliday, setNewHoliday] = useState({ date: '', description: '' });
  const [selectedTrades, setSelectedTrades] = useState([]);

  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({});

  const [isNewsModalOpen, setIsNewsModalOpen] = useState(false);
  const [editNewsData, setEditNewsData] = useState({});

  const [editingHoliday, setEditingHoliday] = useState(null);
  const [editHolidayData, setEditHolidayData] = useState({});

  // Novo estado para o Modal de Trades por Dia (Zoom) e Delete All
  const [dayTradesModalData, setDayTradesModalData] = useState(null);
  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false);

  // Estados para os novos Filtros dos Gráficos
  const [equityFilter, setEquityFilter] = useState('all');
  const [selectedWeekDate, setSelectedWeekDate] = useState(null);
  const [timeGrouping, setTimeGrouping] = useState('60'); // Estado para o Filtro de Horas do Analytics
  const [tradeValuesFilter, setTradeValuesFilter] = useState('all'); // Filtro de Datas do Analytics
  const [isEvalTableExpanded, setIsEvalTableExpanded] = useState(false); // Mobile Expansão da Tabela

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasDismissedModal, setHasDismissedModal] = useState(false);
  const [premiumUpgradeFeature, setPremiumUpgradeFeature] = useState<string | null>(null);
  const [promoModal, setPromoModal] = useState<{ show: boolean; isDailyLimit: boolean }>({ show: false, isDailyLimit: false });
  const [toastMessage, setToastMessage] = useState('');
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isFabOpen, setIsFabOpen] = useState(false);
  const [settingsHideTabs, setSettingsHideTabs] = useState(false);
  // Tarefa 9: Guard para evitar flash do empty-state durante o carregamento
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(true);

  // Tarefa 3: Scroll-lock no body quando FAB estiver aberto
  useEffect(() => {
    document.body.style.overflow = isFabOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isFabOpen]);
  const [prevTab, setPrevTab] = useState('dashboard');

  // 1-minute promo timer for Free plan users
  useEffect(() => {
    if (!isFreePlan) return;
    const promoTimer = setInterval(() => {
      setPromoModal({ show: true, isDailyLimit: false });
    }, 60 * 1000);
    return () => clearInterval(promoTimer);
  }, [settings.userPlan]);
  const scrollRef = useRef(null);

  const [miniHistorySort, setMiniHistorySort] = useState('recent');
  const [manualTrade, setManualTrade] = useState({ symbol: '', qty: '', buyPrice: '', buyTime: '', duration: '', sellTime: '', sellPrice: '', pnl: '' });
  const [mobileTooltipContent, setMobileTooltipContent] = useState(null);

  // Estado para gerenciar Notícias (News)
  const [newsFilter, setNewsFilter] = useState('today_tomorrow');
  const [newNewsItem, setNewNewsItem] = useState({ date: '', time: '', currency: 'USD', impact: 'High', description: '' });
  const [newsImportText, setNewsImportText] = useState('');
  const [newsImportImpact, setNewsImportImpact] = useState('High');

  // Hook para detectar se é Mobile
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  // Estados para Animação de Carregamento e Paginação
  const [isPending, startTransition] = useTransition();
  const [historyPage, setHistoryPage] = useState(1);
  const historyItemsPerPage = 20;


  const [activeSettingsTab, setActiveSettingsTab] = useState('account');
  const [session, setSession] = useState<any>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true); // Blocks all render until auth verified
  const [planExpiredStatus, setPlanExpiredStatus] = useState<'Suspended' | 'Inactive' | 'Expired' | null>(null);

  const isFreePlan = settings?.userPlan?.toLowerCase() === 'free';
  const { news, saveNews, deleteNews, saveNewsBulk, overrideNews } = useNewsRepository(session, isFreePlan);
  const { holidays, saveHoliday, deleteHoliday, overrideHolidays } = useHolidaysRepository(session, isFreePlan);
  const { journals, saveJournal, deleteJournal, overrideJournals, isLoading: journalsLoading } = useJournalsRepository(session, isFreePlan);
  const { setups, saveSetup, deleteSetup, overrideSetups, isLoading: setupsLoading } = useSetupsRepository(session);
  const { favorites: tradingFavorites, saveFavorite: saveTradingFavorite, deleteFavorite: deleteTradingFavorite, updateFavorite: updateTradingFavorite } = useTradingFavoritesRepository(session);
  const { setupTargets, saveSetupTarget, deleteSetupTarget, overrideSetupTargets, saveBatchSetupTargets } = useSetupTargetsRepository(session, accounts.find(a => a.id === activeAccountId)?.storageMode || 'supabase');
  const { setupConfigLogs, addSetupConfigLog, updateSetupConfigLog, overrideSetupConfigLogs } = useSetupConfigLogsRepository(session, accounts.find(a => a.id === activeAccountId)?.storageMode || 'supabase');

  // --- Dynamic Plan Enforcement ---
  const { plans: planConfigs } = usePlanConfig();
  const currentPlanObj = planConfigs.find(p => p.name.toLowerCase() === settings?.userPlan?.toLowerCase()) || planConfigs[0];
  const blockedModules = currentPlanObj?.blocked_modules || [];

  // --- AUTH SESSION CHECK ---
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        if (!currentSession) { navigate('/auth'); return; }

        // Verify user profile still exists in the database
        const { data: profileCheck, error: profileError } = await supabase
          .from('profiles')
          .select('id, plan, trial_end')
          .eq('id', currentSession.user.id)
          .maybeSingle();

        if (!profileError && profileCheck === null) {
          // Profile deleted (never had an account or was removed) -> boot user to Auth
          await supabase.auth.signOut();
          navigate('/auth');
          return;
        }

        if (profileCheck && !profileCheck.plan) {
          // Profile exists but has NO PLAN -> send to sales page (Landing "/")
          navigate('/');
          return;
        }

        if (profileCheck && profileCheck.plan === 'free' && profileCheck.trial_end) {
          const trialStr = profileCheck.trial_end;
          const safeTrialStr = (trialStr.endsWith('Z') || trialStr.includes('+')) ? trialStr : `${trialStr}Z`;
          const trialEndTime = new Date(safeTrialStr).getTime();
          const now = Date.now();
          
          if (now > trialEndTime) {
            navigate('/pricing?reason=trial_expired');
            return;
          } else {
            // Se o trial ainda está ativo, agenda o kick automático
            const msUntilExpire = trialEndTime - now;
            // Limit timeout to max safe integer (~24 days) to prevent overflow
            if (msUntilExpire < 2147483647) {
              setTimeout(() => {
                navigate('/pricing?reason=trial_expired');
              }, msUntilExpire);
            }
          }
        }

        // Profile exists and trial is active
        setSession(currentSession);
      } finally {
        // Always unblock the UI; redirect already happened if needed
        setIsAuthChecking(false);
      }
    };

    checkSession();

    // onAuthStateChange: synchronous only — no async signOut here to avoid infinite loops
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) navigate('/auth');
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Realtime subscription for Profile Status changes (e.g., Stripe Webhook suspend)
  useEffect(() => {
    if (!session?.user?.id) return;

    const channel = supabase
      .channel('profile-status-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${session.user.id}`
        },
        (payload) => {
          const newStatus = payload.new.status;
          const newPlan = payload.new.plan;
          if (newStatus === 'Suspended' || newStatus === 'Inactive') {
            setPlanExpiredStatus(newStatus);
          }
          
          // Se o Admin deu Overide no tempo de trial para 'free', reagendamos o kick
          const newTrialEnd = payload.new.trial_end;
          if (newPlan === 'free' && newTrialEnd) {
            const trialStr = newTrialEnd;
            const safeTrialStr = (trialStr.endsWith('Z') || trialStr.includes('+')) ? trialStr : `${trialStr}Z`;
            const trialEndTime = new Date(safeTrialStr).getTime();
            const now = Date.now();
            
            if (now > trialEndTime) {
              navigate('/pricing?reason=trial_expired');
            } else {
              const msUntilExpire = trialEndTime - now;
              if (msUntilExpire < 2147483647) {
                setTimeout(() => {
                  navigate('/pricing?reason=trial_expired');
                }, msUntilExpire);
              }
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session?.user?.id]);

  // Retorna para a página 1 da Tabela caso os filtros mudem e limpa seleção
  useEffect(() => {
    setHistoryPage(1);
    setSelectedTrades([]);
  }, [searchTerm, filterMonth, filterYear, sortOrder]);

  // Limpa a seleção ao mudar de página
  useEffect(() => {
    setSelectedTrades([]);
  }, [historyPage]);

  // Leitura inicial do Supabase
  const loadData = useCallback(async () => {
    if (!session) return;
    setIsSyncing(true);

    try {
      // Fetch Profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      let currentPlan = 'Free';
      if (profile) {
        currentPlan = profile.plan || 'Free';
        const savedTheme = profile.theme_settings?._theme;
        if (savedTheme && typeof savedTheme === 'object') {
          setTheme(prev => ({ ...prev, ...savedTheme }));
        }
        const profileSettings = {
          ...DEFAULT_SETTINGS,
          appLanguage: profile.app_language,
          dateFormat: profile.date_format,
          userName: profile.first_name || 'User',
          userPlan: currentPlan,
          ...profile.theme_settings
        };
        delete profileSettings._theme; // Remove the embedded theme block from settings
        setSettings(profileSettings);
      }

      // Fetch Accounts
      const { data: dbAccounts } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', session.user.id)
        .order('name');

      if (dbAccounts) {
        setAccounts(dbAccounts.map(a => ({
          id: a.id,
          name: a.name,
          initialBalance: Number(a.initial_balance),
          brokerCurrency: a.broker_currency,
          paymentCurrency: a.payment_currency,
          timezone: a.timezone,
          consistencyTarget: Number(a.consistency_target),
          profitSplit: Number(a.profit_split),
          feePerTrade: Number(a.fee_per_trade),
          feeType: a.fee_type,
          dailyLossLimit: Number(a.daily_loss_limit),
          dailyLossLimitType: a.daily_loss_limit_type,
          totalStopLoss: Number(a.total_stop_loss),
          totalStopLossType: a.total_stop_loss_type,
          enableCsv: a.enable_csv ?? true,
          enablePaste: a.enable_paste ?? false,
          csvMapping: (a.csv_mapping && !Array.isArray(a.csv_mapping) ? a.csv_mapping : {}),
          pasteMapping: Array.isArray(a.paste_mapping) ? a.paste_mapping : [],
          isFixedFee: a.is_fixed_fee ?? false,
          feePerContract: Number(a.fee_per_contract ?? 0)
        })));
      }

      // Fetch Trades — filtra por account_id das contas do usuário (trades não tem user_id)
      const accountIds = (dbAccounts || []).map(a => a.id);

      if (accountIds.length > 0) {
        const { data: dbTrades } = await supabase
          .from('trades')
          .select('*')
          .in('account_id', accountIds);

        if (dbTrades) {
          setTrades(dbTrades.map(t => ({
            id: t.id,
            accountId: t.account_id,
            symbol: t.symbol,
            direction: t.direction,
            qty: t.qty,
            pnl: Number(t.pnl),
            date: t.date,
            entryTimestamp: t.entry_timestamp,
            buyPrice: t.buy_price != null ? Number(t.buy_price) : null,
            buyTime: t.buy_time,
            duration: t.duration,
            sellTime: t.sell_time,
            sellPrice: t.sell_price != null ? Number(t.sell_price) : null,
            notes: t.notes,
            commission: t.commission !== null && t.commission !== undefined ? Number(t.commission) : null,
            setup_id: t.setup_id || null,
            rawMetadata: t.raw_metadata || {}
          })));
        }
      } else {
        setTrades([]);
      }

      // Initialize Active Account and Selection if not set
      if (dbAccounts && dbAccounts.length > 0) {
        const savedId = localStorage.getItem('quantara_activeAccountId');
        const accountExists = dbAccounts.some(a => a.id === savedId);
        const targetId = accountExists && savedId ? savedId : dbAccounts[0].id;
        
        if (!activeAccountId) setActiveAccountId(targetId);
        if (!selectedImportAccountId) setSelectedImportAccountId(targetId);
      }
      // Tarefa 9: Marca o carregamento de contas como finalizado
      setIsLoadingAccounts(false);

      // Migration from localStorage if Supabase is empty
      if ((!dbAccounts || dbAccounts.length === 0)) {
        const savedAccounts = localStorage.getItem('tradeJournal_accounts');
        if (savedAccounts) {
          const localAccs = JSON.parse(savedAccounts);
          const toInsert = localAccs.map(acc => ({
            user_id: session.user.id,
            name: acc.name,
            initial_balance: Number(acc.initialBalance || 0),
            broker_currency: acc.brokerCurrency || 'USD',
            payment_currency: acc.paymentCurrency || 'USD',
            timezone: acc.timezone || 'UTC',
            consistency_target: Number(acc.consistencyTarget || 0),
            profit_split: Number(acc.profitSplit || 0),
            fee_per_trade: Number(acc.feePerTrade || 0),
            fee_type: acc.feeType || '$',
            daily_loss_limit: Number(acc.dailyLossLimit || 0),
            daily_loss_limit_type: acc.dailyLossLimitType || '$',
            total_stop_loss: Number(acc.totalStopLoss || 0),
            total_stop_loss_type: acc.totalStopLossType || '$'
          }));

          const { data: migratedData, error: migrationError } = await supabase
            .from('accounts')
            .insert(toInsert)
            .select();

          if (!migrationError && migratedData) {
            const newAccounts = migratedData.map(a => ({
              id: a.id,
              name: a.name,
              initialBalance: Number(a.initial_balance),
              brokerCurrency: a.broker_currency,
              paymentCurrency: a.payment_currency,
              timezone: a.timezone,
              consistencyTarget: Number(a.consistency_target),
              profitSplit: a.profit_split,
              feePerTrade: Number(a.fee_per_trade),
              feeType: a.fee_type,
              dailyLossLimit: Number(a.daily_loss_limit),
              dailyLossLimitType: a.daily_loss_limit_type,
              totalStopLoss: Number(a.total_stop_loss),
              totalStopLossType: a.total_stop_loss_type
            }));
            setAccounts(newAccounts);
            if (newAccounts.length > 0) {
              setActiveAccountId(newAccounts[0].id);
              setSelectedImportAccountId(newAccounts[0].id);
            }
            localStorage.removeItem('tradeJournal_accounts');
          }
        }
      }
    } catch (err) {
      console.error("Error loading data from Supabase:", err);
    } finally {
      setIsSyncing(false);
    }
  }, [session, navigate, activeAccountId, selectedImportAccountId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // --- ACCOUNT DERIVATIONS ---
  const activeAccount = accounts.find(a => a.id === activeAccountId) || null;
  const accountSettings = activeAccount ? { ...settings, ...activeAccount } : settings; // Merges global UI settings with account financial params
  const activeTrades = activeAccountId ? trades.filter(t => t.accountId === activeAccountId) : [];

  // Logout Functionality
  useEffect(() => {
    (window as any).quantaraLogout = async () => {
      await supabase.auth.signOut();
      navigate('/');
    };
    return () => {
      delete (window as any).quantaraLogout;
    };
  }, [navigate]);

  // Fetch Cotação Dinâmica com base na Moeda de Pagamento
  useEffect(() => {
    if (accountSettings.paymentCurrency === 'USD') {
      setExchangeRate(1.00);
      return;
    }
    fetch(`https://economia.awesomeapi.com.br/last/USD-${accountSettings.paymentCurrency}`)
      .then(res => res.json())
      .then(data => {
        const pair = `USD${accountSettings.paymentCurrency}`;
        if (data && data[pair] && data[pair].bid) {
          setExchangeRate(parseFloat(data[pair].bid).toFixed(2));
        } else {
          setExchangeRate(null);
        }
      }).catch(err => {
        console.error("Erro ao buscar cotação:", err);
        setExchangeRate(null);
      });
  }, [accountSettings.paymentCurrency]);

  // No longer using localStorage for trades/accounts auto-save as we have Supabase.
  // Keeping activeAccountId in localStorage for UX persistence between sessions if needed,
  // or it could also be in profiles.
  useEffect(() => {
    if (activeAccountId) {
      localStorage.setItem('tradeJournal_activeAccountId', JSON.stringify(activeAccountId));
    }
  }, [activeAccountId]);

  // Auto-save trades to localStorage when on Free Plan
  useEffect(() => {
    if (isFreePlan) {
      localStorage.setItem('tradeJournal_trades', JSON.stringify(trades));
    }
  }, [trades, settings.userPlan]);

  // Função para Salvar Configurações (Sincroniza com Tabela de Perfis)
  const handleSaveSettings = async () => {
    if (!session) return;
    setIsSyncing(true);
    try {
      const themeSnapshot = { ...theme };
      const { error } = await supabase.from('profiles').upsert({
        id: session.user.id,
        app_language: settings.appLanguage,
        date_format: settings.dateFormat,
        theme_settings: { ...settings, _theme: themeSnapshot }, // Store settings + embedded theme
        updated_at: new Date().toISOString()
      });

      if (error) throw error;

      setToastMessage('Settings Synchronized with Supabase!');
    } catch (err: any) {
      setToastMessage(`Error syncing settings: ${err.message}`);
    } finally {
      setIsSyncing(false);
      setTimeout(() => setToastMessage(''), 3000);
    }
  };

  // --- NOVAS FUNÇÕES DE EXPORTAÇÃO E IMPORTAÇÃO DE DADOS ---
  const handleExportJSON = () => {
    const data = { settings, theme, trades, holidays, news };
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Quantara_Database_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    setToastMessage('JSON Database Exported Successfully!');
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleImportJSON = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.settings) setSettings(prev => ({ ...prev, ...data.settings }));
        if (data.theme) setTheme(prev => ({ ...prev, ...data.theme }));
        if (data.trades) setTrades(data.trades);
        if (data.holidays) overrideHolidays(data.holidays);
        if (data.news) overrideNews(data.news);
        setToastMessage('Database Imported Successfully!');
      } catch (err) {
        setToastMessage('Error importing JSON. Invalid format.');
      }
      setTimeout(() => setToastMessage(''), 3000);
    };
    reader.readAsText(file);
    e.target.value = null; // Reset input field
  };

  const handleExportAllTradesCSV = () => {
    if (trades.length === 0) {
      setToastMessage("No trades to export.");
      setTimeout(() => setToastMessage(''), 3000);
      return;
    }
    const headers = "Trade ID,Date,Contracts,Fees,Duration,Gross P&L,Net P&L\n";
    const csvRows = trades.map(t => {
      const feesAmount = t.qty * settings.feePerTrade;
      const netPnlAmount = t.pnl - feesAmount;
      return `${t.id},${t.date},${t.qty},${feesAmount.toFixed(2)},${t.duration},${t.pnl},${netPnlAmount.toFixed(2)}`;
    });
    const blob = new Blob([headers + csvRows.join("\n")], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `All_Trades_Export_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Exportar site para HTML com dados embutidos de forma Criptografada (Base64)
  const handleExportSite = () => {
    const clone = document.documentElement.cloneNode(true) as HTMLElement;
    const scripts = clone.querySelectorAll('script');
    scripts.forEach(s => {
      if (!s.src && s.type !== 'text/babel' && s.id !== 'injected-data') s.remove();
    });

    const styles = clone.querySelectorAll('style');
    styles.forEach(s => {
      if (s.id !== 'main-custom-style') s.remove();
    });

    const rootNode = clone.querySelector('#root');
    if (rootNode) rootNode.innerHTML = '';

    const oldData = clone.querySelector('#injected-data');
    if (oldData) oldData.remove();

    const embeddedData = { settings, theme, trades, holidays, news };
    const base64Data = btoa(unescape(encodeURIComponent(JSON.stringify(embeddedData))));

    const dataScript = document.createElement('script');
    dataScript.id = 'injected-data';
    dataScript.textContent = `
              try {
                  const decodedStr = decodeURIComponent(escape(atob('${base64Data}')));
                  const decoded = JSON.parse(decodedStr);
                  localStorage.setItem('tradeJournal_settings', JSON.stringify(decoded.settings));
                  localStorage.setItem('tradeJournal_theme', JSON.stringify(decoded.theme));
                  localStorage.setItem('tradeJournal_trades', JSON.stringify(decoded.trades));
                  localStorage.setItem('tradeJournal_holidays', JSON.stringify(decoded.holidays));
                  localStorage.setItem('tradeJournal_news', JSON.stringify(decoded.news));
              } catch(e) { console.error('Error restoring data', e); }
              setTimeout(() => { const el = document.getElementById('injected-data'); if(el) el.remove(); }, 100);
          `;

    clone.querySelector('head').appendChild(dataScript);

    const finalHtml = "<!DOCTYPE html>\n" + clone.outerHTML;
    const blob = new Blob([finalHtml], { type: 'text/html;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const d = new Date();
    const dateStr = `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
    a.download = `DataSave(${dateStr}).html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const newTheme = { ...theme, backgroundImage: reader.result as string };
        setTheme(newTheme);
        // Auto-save to Supabase so the background persists across devices
        if (session) {
          try {
            await supabase.from('profiles').upsert({
              id: session.user.id,
              theme_settings: { ...settings, _theme: newTheme },
              updated_at: new Date().toISOString()
            });
          } catch (err) {
            console.error('Error saving background image to Supabase:', err);
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // --- FORMATADORES DE LOCALIZAÇÃO ---
  const userLocale = settings.appLanguage === 'pt' ? 'pt-BR' : settings.appLanguage === 'es' ? 'es-ES' : 'en-US';

  const formatCurrency = (val) => new Intl.NumberFormat(userLocale, { style: 'currency', currency: accountSettings.brokerCurrency || 'USD', currencyDisplay: 'narrowSymbol' }).format(isNaN(Number(val)) ? 0 : Number(val));
  const formatPaymentCurrency = (val) => new Intl.NumberFormat(userLocale, { style: 'currency', currency: accountSettings.paymentCurrency || 'USD', currencyDisplay: 'narrowSymbol' }).format(isNaN(Number(val)) ? 0 : Number(val));
  const formatCurrencyDash = (val) => (!val || Math.abs(val) < 0.001) ? '-' : formatCurrency(val);
  const formatPaymentDash = (val) => (!val || Math.abs(val) < 0.001) ? '-' : formatPaymentCurrency(val);

  const formatPercent = (val) => (val === undefined || val === null || isNaN(val)) ? '0%' : `${Number(val).toFixed(0)}%`;
  const formatPercentDecimals = (val) => (val === undefined || val === null || isNaN(val)) ? '0.00%' : `${Number(val).toFixed(2)}%`;

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const [y, m, d] = dateStr.split('-');
    if (settings.dateFormat === 'US') return `${m}/${d}/${y}`;
    if (settings.dateFormat === 'BR') return `${d}/${m}/${y}`;
    return `${y}-${m}-${d}`; // ISO / Padrão
  };

  const formatDateTime = (trade) => {
    if (!trade.entryTimestamp) return formatDate(trade.date);
    const dObj = new Date(trade.entryTimestamp);
    const timeStr = dObj.toLocaleTimeString(userLocale, { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    return `${formatDate(trade.date)} ${timeStr}`;
  };

  const getFullDateString = () => {
    const d = new Date();
    const str = new Intl.DateTimeFormat(userLocale, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).format(d);
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  // --- ESTILOS COMPARTILHADOS ---
  const getImpactColor = (impact) => {
    if (impact === 'High') return theme.textoNegativo; // Red
    if (impact === 'Medium') return theme.textoAlerta; // Orange
    if (impact === 'Low') return '#FFD700'; // Amarelo Ouro
    return theme.textoSecundario; // Gray for Holiday
  };

  // --- TOOLTIP COMPONENT ---
  const IconTooltip = ({ children, content }) => (
    <div
      className="group relative flex items-center justify-center cursor-help"
      onClick={(e) => { if (isMobile) { e.stopPropagation(); setMobileTooltipContent(content); } }}
    >
      {children}
      {/* Desktop: hover tooltip */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden lg:group-hover:flex flex-col z-[9999] pointer-events-none min-w-[150px] max-w-[280px] p-3 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] text-[10px] md:text-xs font-normal transition-all"
        style={{ backgroundColor: hexToRgba(theme.fundoCards, 0.98), borderColor: theme.contornoGeral, borderWidth: settings.borderWidthGeral, borderStyle: 'solid', backdropFilter: 'blur(10px)' }}>
        {content}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-transparent" style={{ borderTopColor: theme.contornoGeral }}></div>
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-[5px] border-transparent -mt-[1px]" style={{ borderTopColor: hexToRgba(theme.fundoCards, 0.98) }}></div>
      </div>
    </div>
  );

  const renderHolidaysTooltip = (dayHols) => (
    <div className="flex flex-col gap-1.5 w-full">
      <div className="font-bold border-b pb-1.5 mb-1 text-center" style={{ borderColor: theme.contornoGeral, color: theme.contornoFeriado }}>Holidays</div>
      {dayHols.map((h, i) => <div key={i} className="whitespace-normal leading-tight text-center" style={{ color: theme.textoPrincipal }}>{h.description}</div>)}
    </div>
  );

  const renderNewsTooltip = (dayNewsItems) => {
    const sorted = [...dayNewsItems].sort((a, b) => {
      const parseTime = (timeStr) => {
        if (!timeStr || timeStr.toLowerCase() === 'all day') return 0;
        const [h, m] = timeStr.split(':');
        return parseInt(h) * 60 + parseInt(m);
      };
      return parseTime(a.time) - parseTime(b.time);
    });

    return (
      <div className="flex flex-col gap-2 w-full">
        <div className="font-bold border-b pb-1.5 mb-0.5 text-center opacity-80" style={{ borderColor: theme.contornoGeral, color: theme.textoPrincipal }}>Economic Events</div>
        {sorted.map((n, i) => (
          <div key={i} className="flex flex-col text-left border-b border-white/5 last:border-0 pb-2 last:pb-0">
            <div className="flex justify-between gap-3 items-center">
              <span className="font-bold whitespace-nowrap" style={{ color: getImpactColor(n.impact) }}>{(!n.time || n.time.toLowerCase() === 'all day') ? 'All Day' : n.time}</span>
              <span className="font-bold opacity-80" style={{ color: theme.textoPrincipal }}>{n.currency}</span>
            </div>
            <span className="whitespace-normal leading-tight mt-1" style={{ color: theme.textoPrincipal }}>{n.description}</span>
          </div>
        ))}
      </div>
    )
  };

  const activeAccountDays = useMemo(() => {
    if (!activeTrades || activeTrades.length === 0) return 0;
    const oldestTradeTime = Math.min(...activeTrades.map(t => new Date(t.date + 'T00:00:00').getTime()));
    const oldestDate = new Date(oldestTradeTime); oldestDate.setHours(0, 0, 0, 0);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const diffTime = Math.abs(today.getTime() - oldestDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }, [activeTrades]);

  const metrics = useMemo(() => {
    const dailyLossLimitAmount = accountSettings.dailyLossLimitType === '%' ? (accountSettings.initialBalance * accountSettings.dailyLossLimit) / 100 : accountSettings.dailyLossLimit;
    const totalStopLossAmount = accountSettings.totalStopLossType === '%' ? (accountSettings.initialBalance * accountSettings.totalStopLoss) / 100 : accountSettings.totalStopLoss;

    let grossPnl = 0, totalQty = 0, totalGrossProfit = 0, totalGrossLoss = 0;
    let winningTrades = 0, losingTrades = 0, maxTradeWin = 0, maxTradeLoss = 0, todayNetPnl = 0;
    let longTrades = 0, longWins = 0, shortTrades = 0, shortWins = 0;
    const dailyNetPnls = {};
    let peakBalance = accountSettings.initialBalance, maxDrawdown = 0, runningBalance = accountSettings.initialBalance;

    const nowForToday = new Date();
    const todayStr = `${nowForToday.getFullYear()}-${String(nowForToday.getMonth() + 1).padStart(2, '0')}-${String(nowForToday.getDate()).padStart(2, '0')}`;

    const sortedChronological = [...activeTrades].sort((a, b) => new Date(a.date + 'T00:00:00').getTime() - new Date(b.date + 'T00:00:00').getTime());

    sortedChronological.forEach(trade => {
      grossPnl += trade.pnl; totalQty += trade.qty;
      const fee = calculateTradeFee(trade, accountSettings);
      const netTradePnl = Number(trade.pnl || 0) - fee;

      if (trade.pnl >= 0) {
        winningTrades++; totalGrossProfit += trade.pnl;
        if (trade.pnl > maxTradeWin) maxTradeWin = trade.pnl;
      } else {
        losingTrades++; totalGrossLoss += Math.abs(trade.pnl);
        if (Math.abs(trade.pnl) > maxTradeLoss) maxTradeLoss = Math.abs(trade.pnl);
      }

      if (trade.direction === 'Short') {
        shortTrades++;
        if (trade.pnl >= 0) shortWins++;
      } else {
        longTrades++;
        if (trade.pnl >= 0) longWins++;
      }

      if (!dailyNetPnls[trade.date]) dailyNetPnls[trade.date] = { pnl: 0, trades: 0 };
      dailyNetPnls[trade.date].pnl += netTradePnl;
      dailyNetPnls[trade.date].trades += 1;

      if (trade.date === todayStr) todayNetPnl += netTradePnl;

      runningBalance += netTradePnl;
      if (runningBalance > peakBalance) peakBalance = runningBalance;
      const currentDrawdown = peakBalance - runningBalance;
      if (currentDrawdown > maxDrawdown) maxDrawdown = currentDrawdown;
    });

    const totalFees = activeTrades.reduce((acc, t) => acc + calculateTradeFee(t, accountSettings), 0);
    const netPnl = grossPnl - totalFees;
    const currentBalance = accountSettings.initialBalance + netPnl;
    const totalTrades = activeTrades.length;
    const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;
    const longWinRate = longTrades > 0 ? (longWins / longTrades) * 100 : 0;
    const shortWinRate = shortTrades > 0 ? (shortWins / shortTrades) * 100 : 0;

    const profitFactor = totalGrossLoss > 0 ? (totalGrossProfit / totalGrossLoss) : (totalGrossProfit > 0 ? 99.9 : 0);
    const avgWin = winningTrades > 0 ? totalGrossProfit / winningTrades : 0;
    const avgLoss = losingTrades > 0 ? totalGrossLoss / losingTrades : 0;
    const avgRR = avgLoss > 0 ? (avgWin / avgLoss) : (avgWin > 0 ? 99.9 : 0);

    const dailyValues = (Object.values(dailyNetPnls) as any[]).map(d => d.pnl);
    const betterDay = dailyValues.length > 0 ? Math.max(...dailyValues) : 0;
    const badDay = dailyValues.length > 0 ? Math.min(...dailyValues) : 0;
    let winDays = 0, lossDays = 0;
    dailyValues.forEach(val => { if (val >= 0) winDays++; else lossDays++; });

    const betterDayPct = netPnl !== 0 && betterDay > 0 ? (betterDay / netPnl) * 100 : 0;
    const badDayPct = netPnl !== 0 && badDay < 0 ? (badDay / netPnl) * 100 : 0;
    const betterTradePct = netPnl !== 0 && maxTradeWin > 0 ? (maxTradeWin / netPnl) * 100 : 0;
    const badTradePct = netPnl !== 0 && maxTradeLoss > 0 ? (-maxTradeLoss / netPnl) * 100 : 0;
    const remainingDailyLimit = dailyLossLimitAmount + todayNetPnl;

    const accountStopRemaining = netPnl < 0 ? totalStopLossAmount + netPnl : totalStopLossAmount;
    const accountStopRemainingPct = totalStopLossAmount > 0 ? (accountStopRemaining / totalStopLossAmount) * 100 : 0;

    let accountStopColor = theme.textoAlerta;
    if (accountStopRemaining <= 0) accountStopColor = theme.textoNegativo;
    else if (accountStopRemaining >= totalStopLossAmount) accountStopColor = theme.textoPositivo;

    return {
      grossPnl, netPnl, totalFees, currentBalance, winRate, totalTrades, winningTrades, losingTrades, totalGrossProfit, totalGrossLoss,
      profitFactor, avgRR, maxTradeWin, maxTradeLoss, betterDay, badDay, peakBalance, betterDayPct, badDayPct, betterTradePct, badTradePct,
      winDays, lossDays, totalDays: Object.keys(dailyNetPnls).length, maxDrawdown, maxProfit: peakBalance - accountSettings.initialBalance,
      remainingDailyLimit, todayNetPnl, ddPercentUsed: totalStopLossAmount > 0 ? (maxDrawdown / totalStopLossAmount) * 100 : 0,
      ddRemainingValue: Math.max(0, totalStopLossAmount - maxDrawdown), consistencyPct: netPnl !== 0 ? (betterDay / netPnl) * 100 : 0,
      longWinRate, shortWinRate, accountStopRemaining, accountStopRemainingPct, accountStopColor,
      longTrades, shortTrades, longWins, shortWins
    };
  }, [activeTrades, accountSettings, theme]);

  const timeMetrics = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfYesterday = startOfToday - 86400000;
    const startOfDayBefore = startOfYesterday - 86400000;
    const dayOfWeek = now.getDay() === 0 ? 6 : now.getDay() - 1;
    const startOfThisWeek = startOfToday - (dayOfWeek * 86400000);
    const startOfLastWeek = startOfThisWeek - (7 * 86400000);
    const endOfLastWeek = startOfThisWeek - 1;
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).getTime();
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999).getTime();

    let profitToday = 0, profitYesterday = 0, profitDayBefore = 0, profitThisWeek = 0, profitLastWeek = 0, profitThisMonth = 0, profitLastMonth = 0, buyTradesCount = 0, sellTradesCount = 0;

    activeTrades.forEach(t => {
      const [y, m, d] = t.date.split('-'); const tDate = new Date(y, m - 1, d).getTime();
      const fee = calculateTradeFee(t, accountSettings);
      const net = Number(t.pnl || 0) - fee;
      if (tDate === startOfToday) profitToday += net;
      if (tDate === startOfYesterday) profitYesterday += net;
      if (tDate === startOfDayBefore) profitDayBefore += net;
      if (tDate >= startOfThisWeek) profitThisWeek += net;
      if (tDate >= startOfLastWeek && tDate <= endOfLastWeek) profitLastWeek += net;
      if (tDate >= startOfThisMonth) profitThisMonth += net;
      if (tDate >= startOfLastMonth && tDate <= endOfLastMonth) profitLastMonth += net;

      if (t.direction === 'Short') sellTradesCount++;
      else buyTradesCount++;
    });

    return { profitToday, profitYesterday, profitDayBefore, profitThisWeek, profitLastWeek, profitThisMonth, profitLastMonth, buyTradesCount, sellTradesCount }
  }, [activeTrades, accountSettings.feePerTrade]);

  // Helper para os filtros semanais
  const getStartOfWeek = (dStrOrDate) => {
    const d = new Date(dStrOrDate);
    d.setHours(0, 0, 0, 0);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  };

  // Reseta o estado do modal sempre que um novo trade for adicionado ou modificado
  useEffect(() => {
    setHasDismissedModal(false);
  }, [trades]);

  // Dispara ou oculta o modal dependendo do status do limite diário
  useEffect(() => {
    if (metrics.remainingDailyLimit < 0 && !hasDismissedModal) {
      setIsModalOpen(true);
    } else if (metrics.remainingDailyLimit >= 0) {
      setIsModalOpen(false);
      setHasDismissedModal(false);
    }
  }, [metrics.remainingDailyLimit, hasDismissedModal]);

  const chartData = useMemo(() => {
    const sortedTrades = [...activeTrades].sort((a, b) => new Date(a.date + 'T00:00:00').getTime() - new Date(b.date + 'T00:00:00').getTime());
    let runningBalance = accountSettings.initialBalance;

    const tradePoints = sortedTrades.map((t) => {
      const fee = calculateTradeFee(t, accountSettings);
      runningBalance += Number(t.pnl || 0) - fee;
      return { date: t.date, balance: runningBalance };
    });

    let points = [];
    if (equityFilter === 'all') {
      points = [{ name: 'Início', balance: accountSettings.initialBalance, x: 0 }, ...tradePoints.map((t, i) => ({ name: t.date, balance: t.balance, x: i + 1 }))];
    } else {
      const grouped = {};
      tradePoints.forEach(t => {
        let key = t.date;
        const d = new Date(t.date + 'T00:00:00');
        if (equityFilter === 'weekly') {
          const weekStart = getStartOfWeek(d);
          key = `${weekStart.getFullYear()}-${String(weekStart.getMonth() + 1).padStart(2, '0')}-${String(weekStart.getDate()).padStart(2, '0')}`;
        } else if (equityFilter === 'monthly') {
          key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        } else if (equityFilter === 'yearly') {
          key = `${d.getFullYear()}`;
        }
        grouped[key] = t.balance;
      });

      points = [{ name: 'Início', balance: accountSettings.initialBalance, x: 0 }];
      let idx = 1;
      for (const key in grouped) {
        points.push({ name: key, balance: grouped[key], x: idx++ });
      }
    }

    let finalPoints = points;
    if (points.length === 1) {
      finalPoints = [...points, { name: 'Current', balance: accountSettings.initialBalance, x: 1 }];
    }

    if (finalPoints.length < 2) return finalPoints;
    const n = finalPoints.length; let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
    finalPoints.forEach(p => { sumX += p.x; sumY += p.balance; sumXY += p.x * p.balance; sumX2 += p.x * p.x; });
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    return finalPoints.map(p => ({ ...p, trend: slope * p.x + intercept }));
  }, [activeTrades, accountSettings, equityFilter]);

  const isTrendUp = chartData.length > 1 && (chartData[chartData.length - 1].trend >= chartData[0].trend);

  const calendarData = useMemo(() => {
    const year = currentDate.getFullYear(); const month = currentDate.getMonth();
    const startDate = new Date(year, month, 1); startDate.setDate(startDate.getDate() - startDate.getDay());
    const endDate = new Date(year, month + 1, 0); if (endDate.getDay() !== 6) endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));

    const days = [];
    const nowForToday = new Date();
    const todayStr = `${nowForToday.getFullYear()}-${String(nowForToday.getMonth() + 1).padStart(2, '0')}-${String(nowForToday.getDate()).padStart(2, '0')}`;

    let currentDayIter = new Date(startDate);

    while (currentDayIter <= endDate) {
      const yyyy = currentDayIter.getFullYear();
      const mm = String(currentDayIter.getMonth() + 1).padStart(2, '0');
      const dd = String(currentDayIter.getDate()).padStart(2, '0');
      const dateStr = `${yyyy}-${mm}-${dd}`;

      const feeAmount = accountSettings.feeType === '%'
        ? (accountSettings.initialBalance * accountSettings.feePerTrade) / 100
        : accountSettings.feePerTrade;

      const dayTrades = activeTrades.filter(t => t.date === dateStr);
      let dayGrossPnl = 0, dayFees = 0, wins = 0;
      dayTrades.forEach(t => {
        dayGrossPnl += t.pnl;
        const fee = calculateTradeFee(t, accountSettings);
        dayFees += fee;
        if (t.pnl - fee > 0) wins++;
      });

      const dayHolidays = holidays.filter(h => h.date === dateStr);
      const dayNews = news.filter(n => n.date === dateStr);

      days.push({
        date: new Date(currentDayIter),
        dateStr,
        isCurrentMonth: currentDayIter.getMonth() === month,
        isToday: dateStr === todayStr,
        isHoliday: dayHolidays.length > 0,
        hasNews: dayNews.length > 0,
        dayHolidays,
        dayNews,
        tradesCount: dayTrades.length,
        dayTrades,
        netPnl: dayGrossPnl - dayFees,
        winRate: dayTrades.length > 0 ? (wins / dayTrades.length) * 100 : 0
      });
      currentDayIter.setDate(currentDayIter.getDate() + 1);
    }

    const weeks = [];
    for (let i = 0; i < days.length; i += 7) {
      const weekDays = days.slice(i, i + 7);
      let weekNetPnl = 0, weekTrades = 0, weekWins = 0;
      weekDays.forEach(d => { if (d.isCurrentMonth) { weekNetPnl += d.netPnl; weekTrades += d.tradesCount; weekWins += (d.winRate / 100) * d.tradesCount; } });
      weeks.push({ days: weekDays, summary: { pnl: weekNetPnl, trades: weekTrades, winRate: weekTrades > 0 ? (weekWins / weekTrades) * 100 : 0 } });
    }
    return weeks;
  }, [currentDate, activeTrades, accountSettings.feePerTrade, accountSettings.feeType, accountSettings.initialBalance, holidays, news]);

  const performanceWeeklyData = useMemo(() => {
    const daysData = [
      { id: 1, name: 'Mon', trades: 0, pnl: 0 }, { id: 2, name: 'Tue', trades: 0, pnl: 0 },
      { id: 3, name: 'Wed', trades: 0, pnl: 0 }, { id: 4, name: 'Thu', trades: 0, pnl: 0 }, { id: 5, name: 'Fri', trades: 0, pnl: 0 }
    ];

    let weekFiltered = activeTrades;
    if (selectedWeekDate) {
      const start = selectedWeekDate.getTime();
      const end = start + (7 * 86400000) - 1;
      weekFiltered = activeTrades.filter(t => {
        const time = new Date(t.date + 'T00:00:00').getTime();
        return time >= start && time <= end;
      });
    }

    weekFiltered.forEach(trade => {
      const [y, m, d] = trade.date.split('-'); const dateObj = new Date(y, m - 1, d); const dayOfWeek = dateObj.getDay();
      if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        const net = trade.pnl - (trade.qty * accountSettings.feePerTrade);
        daysData[dayOfWeek - 1].trades += 1; daysData[dayOfWeek - 1].pnl += net;
      }
    });
    const maxAbsPnl = Math.max(1, ...daysData.map(d => Math.abs(d.pnl)));
    return { daysData, maxAbsPnl };
  }, [activeTrades, accountSettings.feePerTrade, selectedWeekDate]);

  // Column aliases imported from tradeParser.ts
  const targetColumns = Object.keys(columnAliases);

  const parseTradesFromText = async (text: string, importSource: 'csv' | 'paste' = 'paste') => {
    if (!selectedImportAccountId) {
      setToastMessage('Please select an account before importing.');
      setTimeout(() => setToastMessage(''), 3000);
      return;
    }

    let activeAccount: any = accounts.find(a => a.id === selectedImportAccountId);
    if (!activeAccount) return;

    // Re-fetch do banco para garantir mapeamentos atualizados
    if (settings.userPlan !== 'Free') {
      try {
        const { data: dbAccount } = await supabase
          .from('accounts')
          .select('csv_mapping, paste_mapping')
          .eq('id', selectedImportAccountId)
          .single();

        if (dbAccount) {
          activeAccount = {
            ...activeAccount,
            csvMapping: (dbAccount.csv_mapping && !Array.isArray(dbAccount.csv_mapping)) ? dbAccount.csv_mapping : activeAccount.csvMapping,
            pasteMapping: Array.isArray(dbAccount.paste_mapping) ? dbAccount.paste_mapping : activeAccount.pasteMapping
          };
        }
      } catch (err) {
        console.error('Erro ao sincronizar mapeamentos da conta', err);
      }
    }

    const sanitizeNum = (str: any) => cleanNumericValue(String(str || ''));

    const applyField = (tradeData: any, rawMetadata: any, fieldKey: string, fieldName: string, val: string) => {
      switch (fieldKey) {
        case 'symbol': tradeData.symbol = val; break;
        case 'qty': tradeData.qty = val; break;
        case 'buy_price': tradeData.buyPrice = val; break;
        case 'buy_time': tradeData.buyTime = val; break;
        case 'sell_price': tradeData.sellPrice = val; break;
        case 'sell_time': tradeData.sellTime = val; break;
        case 'duration': tradeData.duration = val; break;
        case 'pnl': tradeData.pnl = val; break;
        case 'direction': tradeData.direction = val; break;
        case 'commission': tradeData.commission = val; break;
        case 'raw': rawMetadata[fieldName] = val; break;
        case 'ignore': break;
        default: rawMetadata[fieldName] = val; break;
      }
    };

    const buildTrade = (tradeData: any, rawMetadata: any) => {
      // P&L sanitization
      let pnlRaw = String(tradeData.pnl || '').replace(/\s/g, '');
      if (pnlRaw.startsWith('$(') && pnlRaw.endsWith(')')) pnlRaw = '-' + pnlRaw.replace('$(', '').replace(')', '');
      else if (pnlRaw.startsWith('($') && pnlRaw.endsWith(')')) pnlRaw = '-' + pnlRaw.replace('($', '').replace(')', '');
      else if (pnlRaw.startsWith('(') && pnlRaw.endsWith(')')) pnlRaw = '-' + pnlRaw.replace('(', '').replace(')', '');
      else if (pnlRaw.startsWith('$')) pnlRaw = pnlRaw.replace('$', '');

      const qty = sanitizeNum(tradeData.qty);
      let pnlValue = sanitizeNum(pnlRaw);
      if ((pnlRaw.includes('-') || pnlRaw.includes('(')) && pnlValue > 0) pnlValue = -pnlValue;

      const symbol = tradeData.symbol ? tradeData.symbol.toUpperCase() : '-';
      const buyPrice = sanitizeNum(tradeData.buyPrice);
      const sellPrice = sanitizeNum(tradeData.sellPrice);

      let direction = 'Long';
      if (tradeData.direction && (tradeData.direction.toLowerCase().includes('short') || tradeData.direction.toLowerCase().includes('venda'))) {
        direction = 'Short';
      }

      const d1Iso = parseSmartDate(tradeData.buyTime);
      const d2Iso = parseSmartDate(tradeData.sellTime);
      const d1 = d1Iso ? new Date(d1Iso).getTime() : NaN;
      const d2 = d2Iso ? new Date(d2Iso).getTime() : NaN;

      let entryTimestamp: number | null = null;
      let finalBuyPrice = buyPrice;
      let finalSellPrice = sellPrice;
      let finalBuyTime = tradeData.buyTime;
      let finalSellTime = tradeData.sellTime;

      if (!isNaN(d1) && !isNaN(d2)) {
        if (d1 > d2 && direction !== 'Short') {
          // Auto-detect Short: sell happened before buy in calendar time
          // Swap prices and times so "sellPrice" = closing price of the position
          direction = 'Short';
          entryTimestamp = d2;
          finalBuyPrice = sellPrice;   // broker's "sell" = short entry → becomes our buyPrice conceptually
          finalSellPrice = buyPrice;   // broker's "buy" = short exit → becomes our sellPrice (closing)
          finalBuyTime = tradeData.sellTime;
          finalSellTime = tradeData.buyTime;
        } else {
          entryTimestamp = d1;
        }
      } else {
        entryTimestamp = !isNaN(d1) ? d1 : (!isNaN(d2) ? d2 : null);
      }

      let dateStr: string | null = null;
      if (entryTimestamp) {
        const ed = new Date(entryTimestamp);
        dateStr = `${ed.getFullYear()}-${String(ed.getMonth() + 1).padStart(2, '0')}-${String(ed.getDate()).padStart(2, '0')}`;
      }

      let commission = tradeData.commission ? Number(tradeData.commission) : null;
      if (activeAccount?.feeType === '$' && activeAccount?.feePerTrade) {
        commission = qty * Number(activeAccount.feePerTrade);
      }

      return {
        qty, pnlValue, symbol,
        buyPrice: finalBuyPrice, sellPrice: finalSellPrice,
        direction, entryTimestamp, dateStr, rawMetadata,
        buyTime: finalBuyTime, sellTime: finalSellTime,
        duration: tradeData.duration, commission
      };
    };

    try {
      const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
      if (lines.length === 0) throw new Error('No data found. Please paste at least one trade row.');

      const newTrades: any[] = [];

      // ── CSV MODE: mapeamento por nome de coluna (dict) ────────────────────────
      if (importSource === 'csv') {
        const csvMap: Record<string, string> = activeAccount.csvMapping;
        if (!csvMap || typeof csvMap !== 'object' || Object.keys(csvMap).length === 0) {
          setToastMessage(`Sem mapeamento CSV para a conta "${activeAccount.name}". Configure em Editar Conta → Aba CSV.`);
          setTimeout(() => setToastMessage(''), 5000);
          return;
        }

        // Linha 0 = headers do CSV
        const headerLine = lines[0];
        const delimiter = headerLine.includes('\t') ? /\t/ : /,(?=(?:(?:[^"]*"){2})*[^"]*$)/;
        const headers = headerLine.split(delimiter).map(h => h.replace(/(^"|"$)/g, '').trim());

        for (let i = 1; i < lines.length; i++) {
          const rowValues = lines[i].split(delimiter).map(v => v.replace(/(^"|"$)/g, '').trim());
          const tradeData: any = {};
          const rawMetadata: any = {};

          headers.forEach((header, idx) => {
            const mapTo = csvMap[header]; // ex: "symbol", "pnl", "raw", "ignore"
            if (!mapTo || mapTo === 'ignore') return;
            const val = rowValues[idx] ?? '';
            applyField(tradeData, rawMetadata, mapTo, header, val);
          });

          const t = buildTrade(tradeData, rawMetadata);
          if (!isNaN(t.qty) && t.qty > 0 && !isNaN(t.pnlValue) && t.dateStr) {
            // ── Lógica Híbrida de Comissão (CSV) ─────────────────────────────
            let finalCommission = 0;
            if (activeAccount.isFixedFee) {
              const defaultFee = Number(activeAccount.feePerContract || 0);
              if (activeAccount.feeType === '%') {
                const volume = Math.abs(Number(t.qty)) * Number(t.buyPrice || t.sellPrice || 0);
                finalCommission = volume * (defaultFee / 100);
              } else {
                finalCommission = Math.abs(Number(t.qty)) * defaultFee;
              }
            } else if (tradeData.commission !== undefined && tradeData.commission !== null && tradeData.commission !== '') {
              let cleanVal = String(tradeData.commission).replace(/[$\s,]/g, '');
              if (cleanVal.includes('(') && cleanVal.includes(')')) cleanVal = '-' + cleanVal.replace(/[()]/g, '');
              finalCommission = Number(cleanVal);
            }
            const commission = -Math.abs(finalCommission || 0);
            newTrades.push({
              id: generateId(), accountId: selectedImportAccountId, date: t.dateStr,
              qty: t.qty, pnl: t.pnlValue, duration: t.duration || '00:00', direction: t.direction,
              entryTimestamp: t.entryTimestamp, symbol: t.symbol, buyPrice: t.buyPrice, sellPrice: t.sellPrice,
              buyTime: t.buyTime, sellTime: t.sellTime, rawMetadata: t.rawMetadata, commission
            });
          } else {
            console.warn('CSV row rejected:', { line: lines[i], extracted: t });
          }
        }
      }

      // ── PASTE MODE: mapeamento por índice (array de objetos) ─────────────────
      else {
        const pasteMap: PasteRule[] = activeAccount.pasteMapping;
        if (!pasteMap || !Array.isArray(pasteMap) || pasteMap.length === 0) {
          setToastMessage(`Sem mapeamento Paste para a conta "${activeAccount.name}". Configure em Editar Conta → Aba Copiar/Colar.`);
          setTimeout(() => setToastMessage(''), 5000);
          return;
        }

        for (let i = 0; i < lines.length; i++) {
          // ⚠️ PASTE: usar EXCLUSIVAMENTE tab como delimitador — vírgulas em valores numéricos (ex: 24,745.83) NÃO devem quebrar o split
          const rowValues = lines[i].split('\t').map(v => v.replace(/(^"|"$)/g, '').trim());
          const tradeData: any = {};
          const rawMetadata: any = {};

          pasteMap.forEach((rule, idx) => {
            if (!rule || rule.mapTo === 'ignore') return;
            const val = rowValues[idx] ?? '';
            applyField(tradeData, rawMetadata, rule.mapTo, rule.name, val);
          });

          const t = buildTrade(tradeData, rawMetadata);
          if (!isNaN(t.qty) && t.qty > 0 && !isNaN(t.pnlValue) && t.dateStr) {
            // ── Lógica Híbrida de Comissão (Paste) ───────────────────────────
            let finalCommission = 0;
            if (activeAccount.isFixedFee) {
              const defaultFee = Number(activeAccount.feePerContract || 0);
              if (activeAccount.feeType === '%') {
                const volume = Math.abs(Number(t.qty)) * Number(t.buyPrice || t.sellPrice || 0);
                finalCommission = volume * (defaultFee / 100);
              } else {
                finalCommission = Math.abs(Number(t.qty)) * defaultFee;
              }
            } else if (tradeData.commission !== undefined && tradeData.commission !== null && tradeData.commission !== '') {
              // Corretagem variável: lê valor mapeado da coluna 'commission'
              let cleanVal = String(tradeData.commission).replace(/[$\s,]/g, '');
              if (cleanVal.includes('(') && cleanVal.includes(')')) cleanVal = '-' + cleanVal.replace(/[()]/g, '');
              finalCommission = Number(cleanVal);
            }
            // Garante que o custo seja sempre negativo
            const commission = -Math.abs(finalCommission || 0);
            newTrades.push({
              id: generateId(), accountId: selectedImportAccountId, date: t.dateStr,
              qty: t.qty, pnl: t.pnlValue, duration: t.duration || '00:00', direction: t.direction,
              entryTimestamp: t.entryTimestamp, symbol: t.symbol, buyPrice: t.buyPrice, sellPrice: t.sellPrice,
              buyTime: t.buyTime, sellTime: t.sellTime, rawMetadata: t.rawMetadata, commission
            });
          } else {
            console.warn('Paste row rejected:', { line: lines[i], extracted: t });
          }
        }
      }

      if (newTrades.length > 0) {
        setIsSyncing(true);
        const { data, error: dbError } = await supabase
          .from('trades')
          .insert(newTrades.map(t => ({
            account_id: t.accountId,
            symbol: t.symbol || '',
            direction: t.direction || 'Long',
            qty: t.qty || 0,
            pnl: t.pnl || 0,
            date: t.date,
            entry_timestamp: t.entryTimestamp ? new Date(t.entryTimestamp).toISOString() : null,
            buy_price: t.buyPrice || 0,
            buy_time: t.buyTime ? parseSmartDate(t.buyTime) : null,
            duration: t.duration || '',
            sell_time: t.sellTime ? parseSmartDate(t.sellTime) : null,
            sell_price: t.sellPrice || 0,
            commission: t.commission || 0,
            raw_metadata: t.rawMetadata
          })))
          .select();

        if (dbError) throw dbError;

        if (data) {
          const imported = data.map(t => ({
            id: t.id, accountId: t.account_id, symbol: t.symbol, direction: t.direction,
            qty: t.qty, pnl: Number(t.pnl), date: t.date,
            entryTimestamp: t.entry_timestamp ? new Date(t.entry_timestamp).getTime() : null,
            buyPrice: t.buy_price != null ? Number(t.buy_price) : null,
            buyTime: t.buy_time, duration: t.duration,
            sellTime: t.sell_time, sellPrice: t.sell_price != null ? Number(t.sell_price) : null,
            commission: t.commission !== null ? Number(t.commission) : null,
            rawMetadata: t.raw_metadata
          }));
          setTrades(prev => [...prev, ...imported]);
        }

        setActiveTab('dashboard');
        setToastMessage(`${newTrades.length} trades imported successfully!`);
      } else {
        setToastMessage('Could not parse any valid trades. Check rows or headers.');
      }
      setTimeout(() => setToastMessage(''), 3000);


    } catch (err: any) {
      console.error(err);
      setToastMessage(`Error with Supabase: ${err.message}`);
      setTimeout(() => setToastMessage(''), 3000);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleImport = () => {
    if (!importText.trim()) return;
    parseTradesFromText(importText, 'paste');
    setImportText('');
  };

  const handleCSVUpload = (e: any) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event: any) => {
      parseTradesFromText(event.target.result, 'csv');
      e.target.value = null;
    };
    reader.readAsText(file);
  };

  const handleManualTradeAdd = async () => {
    if (!selectedImportAccountId) {
      setToastMessage('Please select an account before adding a trade.');
      setTimeout(() => setToastMessage(''), 3000);
      return;
    }
    if (!manualTrade.qty || !manualTrade.pnl || (!manualTrade.buyTime && !manualTrade.sellTime)) {
      setToastMessage('Please fill at least Qty, Time (Buy or Sell), and P&L.');
      setTimeout(() => setToastMessage(''), 3000);
      return;
    }

    setIsSyncing(true);
    try {
      const buyT = manualTrade.buyTime || manualTrade.sellTime;
      const sellT = manualTrade.sellTime || manualTrade.buyTime;
      const dateStr = new Date(buyT).toISOString().split('T')[0];

      let newT;
      const { data, error: dbError } = await supabase
        .from('trades')
        .insert([{
          account_id: selectedImportAccountId,
          symbol: manualTrade.symbol || '',
          direction: Number(manualTrade.pnl) >= 0 ? 'Long' : 'Short',
          qty: parseInt(manualTrade.qty),
          pnl: parseFloat(manualTrade.pnl),
          date: dateStr,
          entry_timestamp: new Date(buyT).toISOString(),
          buy_price: parseFloat(manualTrade.buyPrice) || 0,
          buy_time: buyT ? new Date(buyT).toISOString() : null,
          duration: manualTrade.duration || '',
          sell_time: sellT ? new Date(sellT).toISOString() : null,
          sell_price: parseFloat(manualTrade.sellPrice) || 0,
          commission: 0,
          raw_metadata: {}
        }])
        .select()
        .single();

      if (dbError) throw dbError;

      newT = {
        id: data.id,
        accountId: data.account_id,
        symbol: data.symbol,
        direction: data.direction,
        qty: data.qty,
        pnl: Number(data.pnl),
        date: data.date,
        entryTimestamp: new Date(data.entry_timestamp).getTime(),
        buyPrice: Number(data.buy_price),
        buyTime: data.buy_time,
        duration: data.duration,
        sellTime: data.sell_time,
        sellPrice: Number(data.sell_price),
        commission: data.commission !== null ? Number(data.commission) : null,
        rawMetadata: data.raw_metadata || {}
      };

      setTrades(prev => [...prev, newT]);
      setManualTrade({ symbol: '', qty: '', buyPrice: '', buyTime: '', duration: '', sellTime: '', sellPrice: '', pnl: '' });
      setToastMessage('Trade added and synchronized!');
      setActiveTab('dashboard');
    } catch (err: any) {
      setToastMessage(`Error adding trade: ${err.message}`);
    } finally {
      setIsSyncing(false);
      setTimeout(() => setToastMessage(''), 3000);
    }
  };

  const addHoliday = async () => {
    if (!newHoliday.date || !newHoliday.description) return;
    await saveHoliday({ ...newHoliday });
    setNewHoliday({ date: '', description: '' });
  };

  const handleAddNews = async () => {
    if (!newNewsItem.date || !newNewsItem.description) {
      setToastMessage("Date and Description are required!");
      setTimeout(() => setToastMessage(''), 3000);
      return;
    }
    await saveNews({ ...newNewsItem });
    setNewNewsItem({ date: '', time: '', currency: 'USD', impact: 'High', description: '' });
    setToastMessage("News event added!");
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleImportNews = async () => {
    if (!newsImportText.trim()) return;
    const lines = newsImportText.split(/\r?\n/);
    const newNews: any[] = [];
    const monthMap: any = { jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06', jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12' };
    const currentYear = new Date().getFullYear();

    let currentDateStr: string | null = null;
    let tempTime: string | null = null;
    let tempCurrency: string | null = null;

    lines.forEach(line => {
      const text = line.trim();
      if (!text) return;

      const dateMatch = text.match(/^(?:Sun|Mon|Tue|Wed|Thu|Fri|Sat)\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{1,2})/i);
      if (dateMatch) {
        const m = monthMap[dateMatch[1].toLowerCase()];
        const d = dateMatch[2].padStart(2, '0');
        currentDateStr = `${currentYear}-${m}-${d}`;
        tempTime = null;
        tempCurrency = null;
        return;
      }

      const timeMatch = text.match(/^(\d{1,2}):(\d{2})\s*(AM|PM|am|pm)?$/i);
      if (timeMatch) {
        let h = parseInt(timeMatch[1], 10);
        const m = timeMatch[2];
        const meridiem = timeMatch[3] ? timeMatch[3].toLowerCase() : null;
        if (meridiem === 'pm' && h < 12) h += 12;
        if (meridiem === 'am' && h === 12) h = 0;
        tempTime = `${String(h).padStart(2, '0')}:${m}`;
        tempCurrency = null;
        return;
      }

      if (/^all\s*day$/i.test(text) || /^dia\s*todo$/i.test(text)) {
        tempTime = 'All Day';
        tempCurrency = null;
        return;
      }

      if (/^[A-Za-z]{3}$/.test(text)) {
        tempCurrency = text.toUpperCase();
        return;
      }

      if (currentDateStr && tempTime !== null && tempCurrency) {
        newNews.push({
          id: generateId(),
          date: currentDateStr,
          time: tempTime,
          currency: tempCurrency,
          impact: newsImportImpact,
          description: text
        });
        tempCurrency = null;
      }
    });

    if (newNews.length > 0) {
      await saveNewsBulk(newNews);
      setNewsImportText('');
      setToastMessage(`${newNews.length} news events imported!`);
    } else {
      setToastMessage("No valid events found. Check your text format.");
    }
    setTimeout(() => setToastMessage(''), 3000);
  };

  const filteredNewsList = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const todayTime = now.getTime();
    const dayOfWeek = now.getDay() === 0 ? 6 : now.getDay() - 1;
    const startOfThisWeek = todayTime - (dayOfWeek * 86400000);
    const endOfThisWeek = startOfThisWeek + (6 * 86400000);

    let result = news;
    if (newsFilter !== 'all') {
      result = news.filter(n => {
        const [y, m, d] = n.date.split('-');
        const nDate = new Date(Number(y), Number(m) - 1, Number(d)).getTime();

        if (newsFilter === 'today') return nDate === todayTime;
        if (newsFilter === 'tomorrow') return nDate === todayTime + 86400000;
        if (newsFilter === 'today_tomorrow') return nDate === todayTime || nDate === todayTime + 86400000;
        if (newsFilter === 'yesterday') return nDate === todayTime - 86400000;
        if (newsFilter === 'this_week') return nDate >= startOfThisWeek && nDate <= endOfThisWeek;
        if (newsFilter === 'next_week') return nDate >= startOfThisWeek + (7 * 86400000) && nDate <= endOfThisWeek + (7 * 86400000);
        if (newsFilter === 'this_month') return new Date(nDate).getMonth() === now.getMonth() && new Date(nDate).getFullYear() === now.getFullYear();
        if (newsFilter === 'next_month') {
          const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
          return new Date(nDate).getMonth() === nextMonth.getMonth() && new Date(nDate).getFullYear() === nextMonth.getFullYear();
        }
        return true;
      });
    }

    return result.sort((a, b) => {
      const parseTime = (dateStr: string, timeStr: string) => {
        if (!timeStr || timeStr.toLowerCase() === 'all day') return new Date(`${dateStr}T00:00:00`).getTime();
        return new Date(`${dateStr}T${timeStr}:00`).getTime();
      };
      return parseTime(a.date, a.time) - parseTime(b.date, b.time);
    });
  }, [news, newsFilter]);

  const filteredTrades = useMemo(() => {
    let result = activeTrades.filter(t => {
      const fullString = `${t.date} ${formatDate(t.date)} ${t.qty} ${t.duration} ${t.pnl}`.toLowerCase();
      const matchesSearch = fullString.includes(searchTerm.toLowerCase());
      const [y, m] = t.date.split('-');
      return matchesSearch && (filterMonth === 'all' || m === filterMonth) && (filterYear === 'all' || y === filterYear);
    });
    return result.sort((a, b) => {
      const getTime = (t) => {
        // 1. Use entryTimestamp if available (milliseconds)
        if (t.entryTimestamp && !isNaN(t.entryTimestamp)) return t.entryTimestamp;

        // 2. Parse buyTime/sellTime as full datetime strings via parseSmartDate
        const rawTime = t.buyTime || t.buy_time || t.sellTime || t.sell_time || null;
        if (rawTime) {
          const iso = parseSmartDate(rawTime);
          if (iso) {
            const ms = new Date(iso).getTime();
            if (!isNaN(ms)) return ms;
          }
        }

        // 3. Fallback: date only
        if (t.date) {
          const ms = new Date(t.date + 'T00:00:00').getTime();
          if (!isNaN(ms)) return ms;
        }

        return 0;
      };
      const timeA = getTime(a);
      const timeB = getTime(b);

      if (timeA === timeB) {
        // Stable fallback based on id
        return sortOrder === 'recent' ? String(b.id).localeCompare(String(a.id)) : String(a.id).localeCompare(String(b.id));
      }
      return sortOrder === 'recent' ? timeB - timeA : timeA - timeB;
    });
  }, [activeTrades, searchTerm, filterMonth, filterYear, sortOrder]);

  const paginatedTrades = useMemo(() => {
    const start = (historyPage - 1) * historyItemsPerPage;
    return filteredTrades.slice(start, start + historyItemsPerPage);
  }, [filteredTrades, historyPage]);

  const miniSortedTrades = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const monthTrades = activeTrades.filter(t => {
      if (!t.date) return false;
      const [y, m] = t.date.split('-');
      return parseInt(y, 10) === year && parseInt(m, 10) - 1 === month;
    });
    return monthTrades.sort((a, b) => {
      const getTime = (t) => {
        if (t.entryTimestamp && !isNaN(t.entryTimestamp)) return t.entryTimestamp;
        let fallbackTime = 0;
        if (t.date) fallbackTime = new Date(t.date + 'T00:00:00').getTime();
        return isNaN(fallbackTime) ? 0 : fallbackTime;
      };
      const timeA = getTime(a);
      const timeB = getTime(b);

      if (timeA === timeB) {
        return miniHistorySort === 'recent' ? String(b.id).localeCompare(String(a.id)) : String(a.id).localeCompare(String(b.id));
      }
      return miniHistorySort === 'recent' ? timeB - timeA : timeA - timeB;
    });
  }, [activeTrades, miniHistorySort, currentDate]);

  const handleExportCSV = () => {
    if (filteredTrades.length === 0) return;
    const headers = "Trade ID,Date,Contracts,Fees,Duration,Gross P&L,Net P&L\n";
    const fixedFeeAmount = accountSettings.isFixedFee
      ? (accountSettings.feeType === '%' ? (accountSettings.initialBalance * accountSettings.feePerContract) / 100 : accountSettings.feePerContract)
      : 0;

    const csvRows = filteredTrades.map(t => {
      const fees = (t.commission !== undefined && t.commission !== null && t.commission !== 0)
        ? Math.abs(Number(t.commission)).toFixed(2)
        : (t.qty * fixedFeeAmount).toFixed(2);
      const netPnl = (Number(t.pnl || 0) - Number(fees)).toFixed(2);
      return `${t.id},${t.date},${t.qty},${fees},${t.duration},${t.pnl},${netPnl}`;
    });
    const blob = new Blob([headers + csvRows.join("\n")], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trades_export_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const saveTradeModal = async () => {
    try {
      const tradeId = editFormData.id;
      const { error } = await supabase
        .from('trades')
        .update({
          symbol: editFormData.symbol,
          direction: editFormData.direction,
          qty: parseFloat(editFormData.qty),
          pnl: parseFloat(editFormData.pnl),
          date: editFormData.date,
          entry_timestamp: editFormData.entryTimestamp,
          buy_price: parseFloat(editFormData.buyPrice),
          buy_time: editFormData.buyTime ? parseSmartDate(editFormData.buyTime) : null,
          duration: editFormData.duration,
          sell_time: editFormData.sellTime ? parseSmartDate(editFormData.sellTime) : null,
          sell_price: editFormData.sellPrice ? parseFloat(editFormData.sellPrice) : null,
          commission: editFormData.commission ? parseFloat(editFormData.commission) : null,
          notes: editFormData.notes
        })
        .eq('id', tradeId);

      if (error) throw error;

      setTrades(trades.map(t => t.id === tradeId ? {
        ...t,
        ...editFormData,
        qty: parseFloat(editFormData.qty),
        pnl: parseFloat(editFormData.pnl),
        buyPrice: editFormData.buyPrice ? parseFloat(editFormData.buyPrice) : null,
        sellPrice: editFormData.sellPrice ? parseFloat(editFormData.sellPrice) : null,
        commission: editFormData.commission ? parseFloat(editFormData.commission) : null
      } : t));
      setIsTradeModalOpen(false);
      setToastMessage('Trade updated!');
    } catch (err: any) {
      setToastMessage(`Error updating: ${err.message}`);
    }
    setTimeout(() => setToastMessage(''), 3000);
  };

  const saveNewsModal = async () => {
    await saveNews(editNewsData as any);
    setIsNewsModalOpen(false);
  };

  // --- ACCOUNT CRUD HANDLERS ---
  const openCreateAccountForm = () => {
    // FREE PLAN: Max 1 account
    if (isFreePlan && accounts.length >= 1) {
      setPremiumUpgradeFeature('múltiplas contas');
      return;
    }
    setEditingAccount(null);
    setAccountFormData({ name: '', ...DEFAULT_ACCOUNT_SETTINGS });
    setAccountFormError('');
    setIsAccountFormOpen(true);
  };

  const openEditAccountForm = (account) => {
    setEditingAccount(account);
    setAccountFormData({ ...account });
    setAccountFormError('');
    setIsAccountFormOpen(true);
  };

  const handleSaveAccountForm = async () => {
    const name = accountFormData.name.trim();
    if (!name) { setAccountFormError('Account name is required.'); return; }
    const duplicate = accounts.find(a => a.name.toLowerCase() === name.toLowerCase() && a.id !== editingAccount?.id);
    if (duplicate) { setAccountFormError(`An account named "${name}" already exists.`); return; }

    try {
      const dbAccount = {
        user_id: session.user.id,
        name: name,
        initial_balance: Number(accountFormData.initialBalance),
        broker_currency: accountFormData.brokerCurrency,
        payment_currency: accountFormData.paymentCurrency,
        timezone: accountFormData.timezone,
        consistency_target: Number(accountFormData.consistencyTarget),
        profit_split: Number(accountFormData.profitSplit),
        fee_per_trade: Number(accountFormData.feePerTrade),
        fee_type: accountFormData.feeType,
        daily_loss_limit: Number(accountFormData.dailyLossLimit),
        daily_loss_limit_type: accountFormData.dailyLossLimitType,
        total_stop_loss: Number(accountFormData.totalStopLoss),
        total_stop_loss_type: accountFormData.totalStopLossType,
        enable_csv: accountFormData.enableCsv,
        enable_paste: accountFormData.enablePaste,
        csv_mapping: (accountFormData.enableCsv && accountFormData.csvMapping && Object.keys(accountFormData.csvMapping).length > 0)
          ? accountFormData.csvMapping
          : null,
        paste_mapping: (accountFormData.enablePaste && accountFormData.pasteMapping && accountFormData.pasteMapping.length > 0)
          ? accountFormData.pasteMapping
          : null,
        is_fixed_fee: accountFormData.isFixedFee ?? false,
        fee_per_contract: accountFormData.isFixedFee ? Number(accountFormData.feePerContract || 0) : null
      };

      if (!dbAccount.enable_csv && !dbAccount.enable_paste) {
        setAccountFormError('You must enable at least one import method (CSV or Paste).');
        return;
      }

      if (editingAccount) {
        const { error } = await supabase.from('accounts').update(dbAccount).eq('id', editingAccount.id);
        if (error) throw error;
        setAccounts(prev => prev.map(a => a.id === editingAccount.id ? { ...a, ...accountFormData, name } : a));
      } else {
        const { data, error } = await supabase.from('accounts').insert(dbAccount).select().single();
        if (error) throw error;
        const newAcc = {
          id: data.id,
          name: data.name,
          initialBalance: Number(data.initial_balance),
          brokerCurrency: data.broker_currency,
          paymentCurrency: data.payment_currency,
          timezone: data.timezone,
          consistencyTarget: Number(data.consistency_target),
          profitSplit: Number(data.profit_split),
          feePerTrade: Number(data.fee_per_trade),
          feeType: data.fee_type,
          dailyLossLimit: Number(data.daily_loss_limit),
          dailyLossLimitType: data.daily_loss_limit_type,
          totalStopLoss: Number(data.total_stop_loss),
          totalStopLossType: data.total_stop_loss_type,
          enableCsv: data.enable_csv ?? true,
          enablePaste: data.enable_paste ?? false,
          csvMapping: (data.csv_mapping && !Array.isArray(data.csv_mapping) ? data.csv_mapping : {}),
          pasteMapping: Array.isArray(data.paste_mapping) ? data.paste_mapping : [],
          isFixedFee: data.is_fixed_fee ?? false,
          feePerContract: Number(data.fee_per_contract ?? 0)
        };
        setAccounts(prev => [...prev, newAcc]);
        if (!activeAccountId) setActiveAccountId(newAcc.id);
      }
      setIsAccountFormOpen(false);
      setEditingAccount(null);
      setAccountFormError('');
      setToastMessage(editingAccount ? 'Account updated!' : 'Account created!');
    } catch (err: any) {
      setAccountFormError(err.message);
    }
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleDeleteAccount = async (accountId) => {
    try {
      const { error } = await supabase.from('accounts').delete().eq('id', accountId).eq('user_id', session.user.id); // FILTRO DE ISOLAMENTO OBRIGATÓRIO
      if (error) throw error;

      setAccounts(prev => prev.filter(a => a.id !== accountId));
      setTrades(prev => prev.filter(t => t.accountId !== accountId));
      if (activeAccountId === accountId) setActiveAccountId(null);
      setConfirmDeleteAccountId(null);
      setToastMessage('Account and its trades deleted.');
    } catch (err: any) {
      setToastMessage(`Error deleting Account: ${err.message}`);
    }
    setTimeout(() => setToastMessage(''), 3000);
  };


  // --- Estilos Base (Glassmorphism Inteligente) ---
  const getGlassStyle = (baseColorHex) => {
    if (!settings.enableGlassEffect) {
      return {
        backgroundColor: baseColorHex,
        borderColor: theme.contornoGeral,
        borderWidth: settings.borderWidthGeral,
        borderStyle: 'solid'
      };
    }
    const opacityFloat = settings.cardOpacity / 100;
    return {
      backgroundColor: opacityFloat < 1 ? hexToRgba(baseColorHex, opacityFloat) : baseColorHex,
      backdropFilter: settings.glassBlur > 0 ? `blur(${settings.glassBlur}px)` : 'none',
      WebkitBackdropFilter: settings.glassBlur > 0 ? `blur(${settings.glassBlur}px)` : 'none',
      borderColor: theme.contornoGeral,
      borderWidth: settings.borderWidthGeral,
      borderStyle: 'solid'
    };
  };

  // Definição do Background Geral Dinâmico
  let bgStyle = 'none';
  if (theme.backgroundImage && theme.backgroundImage.trim() !== '') {
    bgStyle = `url(${theme.backgroundImage})`;
  } else if (settings.enableGradient) {
    if (settings.gradientType === 'radial') {
      bgStyle = `radial-gradient(circle, ${theme.gradColor1} 0%, ${theme.gradColor2} 50%, ${theme.gradColor3} 100%)`;
    } else {
      bgStyle = `linear-gradient(${settings.gradientAngle}deg, ${theme.gradColor1} 0%, ${theme.gradColor2} 50%, ${theme.gradColor3} 100%)`;
    }
  }

  // Previne os vazamentos de z-index do iOS causados por pull-to-refresh
  const iosNavFix = { transform: 'translateZ(0)', WebkitTransform: 'translateZ(0)' };

  const appBackgroundStyle = {
    backgroundColor: theme.fundoPrincipal,
    color: theme.textoPrincipal,
  };

  const backgroundLayerStyle = {
    backgroundImage: bgStyle,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  };

  const metricRows = [
    { label: `Initial Balance`, value: formatCurrency(accountSettings.initialBalance) },
    { label: 'Current Balance', value: formatCurrency(metrics.currentBalance) },
    { label: 'Current Balance in %', value: formatPercentDecimals((metrics.netPnl / accountSettings.initialBalance) * 100) },
    { label: 'Daily Drawdown', value: formatPercent((accountSettings.dailyLossLimit / accountSettings.initialBalance) * 100) },
    { label: 'Total Drawdown', value: formatPercent((accountSettings.totalStopLoss / accountSettings.initialBalance) * 100) },
    { label: 'Max Drawdown', value: formatCurrency(metrics.maxDrawdown) },
    { label: 'Win Rate', value: formatPercentDecimals(metrics.winRate), color: theme.textoPositivo },
    { label: 'Realized PNL', value: formatCurrency(metrics.netPnl), color: metrics.netPnl >= 0 ? theme.textoPositivo : theme.textoNegativo },
    { label: 'Profit Factor', value: Number(metrics.profitFactor).toFixed(2) },
    { label: 'Average RR', value: `${Number(metrics.avgRR).toFixed(2)} RR` },
    { label: 'Gross Profit', value: formatCurrency(metrics.totalGrossProfit) },
    { label: 'Gross Loss', value: `-${formatCurrency(metrics.totalGrossLoss)}` },
    { label: 'Profit Today', value: formatCurrencyDash(timeMetrics.profitToday) },
    { label: 'Profit Yesterday', value: formatCurrencyDash(timeMetrics.profitYesterday) },
    { label: 'Profit Day Before', value: formatCurrencyDash(timeMetrics.profitDayBefore) },
    { label: 'Profit This Week', value: formatCurrencyDash(timeMetrics.profitThisWeek) },
    { label: 'Profit This Month', value: formatCurrencyDash(timeMetrics.profitThisMonth) },
    { label: 'Total Profit', value: formatCurrency(metrics.netPnl) },
    { label: 'Traded Days', value: metrics.totalDays },
    { label: `USD/${accountSettings.paymentCurrency} Quote`, value: `${accountSettings.paymentCurrency} ${exchangeRate || '0.00'}` },
    { label: `Profit in ${accountSettings.paymentCurrency}`, value: formatPaymentDash(metrics.netPnl * (exchangeRate || 0)) },
    { label: 'Profit Split %', value: `${accountSettings.profitSplit}%` },
    { label: `Profit Split ${accountSettings.paymentCurrency}`, value: formatPaymentDash((metrics.netPnl * (exchangeRate || 0)) * (accountSettings.profitSplit / 100)) },
    { label: 'Total Trades', value: metrics.totalTrades },
    { label: 'Total Win Trades', value: `win ${metrics.winningTrades}` },
    { label: 'Total Loss Trades', value: `loss ${metrics.losingTrades}` },
    { label: 'Total Day Win', value: `win ${metrics.winDays}` },
    { label: 'Total Day Loss', value: `loss ${metrics.lossDays}` },
    { label: 'Total Fees', value: `-${formatCurrency(metrics.totalFees)}` },
    { label: 'Max Profit', value: formatCurrency(metrics.peakBalance) },
    { label: 'Consistency Percent', value: `${settings.consistencyTarget}%` },
    { label: 'Consistency Actual', value: formatPercent(metrics.consistencyPct) },
    { label: 'Better Day', value: formatCurrency(metrics.betterDay) },
    { label: 'Bad Day', value: metrics.badDay < 0 ? `-${formatCurrency(Math.abs(metrics.badDay))}` : formatCurrency(metrics.badDay) },
    { label: 'Better Day %', value: formatPercent(metrics.betterDayPct) },
    { label: 'Bad Day %', value: formatPercent(metrics.badDayPct) },
    { label: 'Better Trade', value: formatCurrency(metrics.maxTradeWin) },
    { label: 'Bad Trade', value: `-${formatCurrency(metrics.maxTradeLoss)}` },
    { label: 'Better Trade %', value: formatPercent(metrics.betterTradePct) },
    { label: 'Bad Trade %', value: formatPercent(metrics.badTradePct) },
    { label: 'Buy Trades', value: timeMetrics.buyTradesCount || '0' },
    { label: 'Sell Trades', value: timeMetrics.sellTradesCount || '0' },
    { label: 'Profit Last Week', value: formatCurrencyDash(timeMetrics.profitLastWeek) },
    { label: 'Profit Last Month', value: formatCurrencyDash(timeMetrics.profitLastMonth) }
  ];

  // --- DADOS PARA OS NOVOS GRÁFICOS DO ANALYTICS ---
  const symbolData = useMemo(() => {
    const map: any = {};
    activeTrades.forEach(t => {
      const sym = t.symbol && t.symbol !== '-' ? t.symbol : 'Other';
      if (!map[sym]) map[sym] = 0;
      map[sym] += t.pnl - calculateTradeFee(t, accountSettings);
    });
    return Object.keys(map).map(k => ({ name: k, pnl: map[k] })).sort((a: any, b: any) => b.pnl - a.pnl).slice(0, 10); // Top 10 Symbols
  }, [activeTrades, accountSettings.feePerTrade]);

  const directionData = useMemo(() => {
    let longPnl = 0, shortPnl = 0;
    activeTrades.forEach(t => {
      const net = t.pnl - calculateTradeFee(t, accountSettings);
      if (t.direction === 'Short') shortPnl += net;
      else longPnl += net;
    });
    return [
      { name: 'Long', pnl: longPnl },
      { name: 'Short', pnl: shortPnl }
    ];
  }, [activeTrades, accountSettings.feePerTrade]);

  const monthlyPnlData = useMemo(() => {
    const map: any = {};
    activeTrades.forEach(t => {
      const key = t.date.substring(0, 7); // Agrupa por YYYY-MM
      if (!map[key]) map[key] = 0;
      map[key] += t.pnl - calculateTradeFee(t, accountSettings);
    });
    return Object.keys(map).sort().map(k => {
      const [y, m] = k.split('-');
      const monthName = new Date(Number(y), parseInt(m) - 1, 1).toLocaleString(userLocale, { month: 'short' });
      return { name: `${monthName} ${y.substring(2)}`, pnl: map[k] };
    }).slice(-12); // Puxa os últimos 12 meses letivos
  }, [activeTrades, accountSettings.feePerTrade, userLocale]);

  const winLossData = useMemo(() => {
    return [
      { name: 'Wins', value: metrics.winningTrades, fill: theme.textoPositivo },
      { name: 'Losses', value: metrics.losingTrades, fill: theme.textoNegativo }
    ];
  }, [metrics.winningTrades, metrics.losingTrades, theme]);

  // Novos Gráficos: Valores dos Trades & Horários Mais Negociados
  const availableTradePeriods = useMemo(() => {
    const periods = new Set();
    activeTrades.forEach(t => {
      if (t.date) {
        periods.add(t.date.substring(0, 4)); // Extrai o Ano (YYYY)
        periods.add(t.date.substring(0, 7)); // Extrai o Ano/Mes (YYYY-MM)
      }
    });
    return Array.from(periods).sort().reverse();
  }, [activeTrades]);

  const tradeValuesData = useMemo(() => {
    return [...activeTrades]
      .sort((a, b) => {
        const timeA = a.entryTimestamp || new Date(a.date + 'T00:00:00').getTime();
        const timeB = b.entryTimestamp || new Date(b.date + 'T00:00:00').getTime();
        return timeA - timeB;
      })
      .map((t, index) => ({
        name: `Trade ${index + 1}`,
        date: formatDateTime(t),
        rawDate: t.date,
        pnl: t.pnl - calculateTradeFee(t, accountSettings)
      }));
  }, [activeTrades, accountSettings.feePerTrade]);

  const filteredTradeValuesData = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const todayTime = now.getTime();
    const dayOfWeek = now.getDay() === 0 ? 6 : now.getDay() - 1;
    const startOfThisWeek = todayTime - (dayOfWeek * 86400000);
    const endOfThisWeek = startOfThisWeek + (6 * 86400000);

    return tradeValuesData.filter(t => {
      if (tradeValuesFilter === 'all') return true;

      const [y, m, d] = t.rawDate.split('-');
      const tDate = new Date(y, m - 1, d).getTime();

      if (tradeValuesFilter === 'today') return tDate === todayTime;
      if (tradeValuesFilter === 'yesterday') return tDate === todayTime - 86400000;
      if (tradeValuesFilter === 'this_week') return tDate >= startOfThisWeek && tDate <= endOfThisWeek;
      if (tradeValuesFilter === 'last_week') return tDate >= startOfThisWeek - (7 * 86400000) && tDate <= endOfThisWeek - (7 * 86400000);
      if (tradeValuesFilter === 'this_month') return new Date(tDate).getMonth() === now.getMonth() && new Date(tDate).getFullYear() === now.getFullYear();
      if (tradeValuesFilter === 'last_month') {
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        return new Date(tDate).getMonth() === lastMonth.getMonth() && new Date(tDate).getFullYear() === lastMonth.getFullYear();
      }

      return t.rawDate.startsWith(tradeValuesFilter);
    });
  }, [tradeValuesData, tradeValuesFilter]);

  const timeDistributionData = useMemo(() => {
    const bins = {};
    activeTrades.forEach(t => {
      if (!t.entryTimestamp) return; // Ignora se não houver tempo válido registrado
      const d = new Date(t.entryTimestamp);
      const h = d.getHours();
      const m = d.getMinutes();
      let binMin = 0;
      const group = parseInt(timeGrouping);
      if (group === 60) binMin = 0;
      else if (group === 30) binMin = m >= 30 ? 30 : 0;
      else if (group === 15) binMin = Math.floor(m / 15) * 15;

      const binName = `${String(h).padStart(2, '0')}:${String(binMin).padStart(2, '0')}`;
      if (!bins[binName]) bins[binName] = { name: binName, count: 0, pnl: 0, wins: 0, losses: 0 };
      bins[binName].count += 1;
      const netPnl = t.pnl - calculateTradeFee(t, accountSettings);
      bins[binName].pnl += netPnl;
      if (netPnl >= 0) bins[binName].wins += 1;
      else bins[binName].losses += 1;
    });
    return (Object.values(bins) as any[]).sort((a: any, b: any) => a.name.localeCompare(b.name));
  }, [activeTrades, timeGrouping, accountSettings.feePerTrade]);

  const cumulativePnlData = useMemo(() => {
    let cumulative = 0;
    return [...activeTrades]
      .sort((a, b) => {
        const timeA = a.entryTimestamp || new Date(a.date + 'T00:00:00').getTime();
        const timeB = b.entryTimestamp || new Date(b.date + 'T00:00:00').getTime();
        return timeA - timeB;
      })
      .map((t, index) => {
        cumulative += (t.pnl - calculateTradeFee(t, accountSettings));
        return {
          name: `Trade ${index + 1}`,
          tradeId: t.id,
          cumulativePnl: cumulative
        };
      });
  }, [activeTrades, accountSettings.feePerTrade]);

  const dayOfWeekData = useMemo(() => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const map = { 'Monday': 0, 'Tuesday': 0, 'Wednesday': 0, 'Thursday': 0, 'Friday': 0, 'Saturday': 0, 'Sunday': 0 };
    activeTrades.forEach(t => {
      const d = new Date(t.entryTimestamp || t.date + 'T12:00:00');
      const dayName = days[d.getDay()];
      map[dayName] += (t.pnl - calculateTradeFee(t, accountSettings));
    });
    // Order: Monday to Friday (ignore weekends if 0)
    return ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => ({
      name: day.substring(0, 3), // Mon, Tue, etc.
      pnl: map[day]
    }));
  }, [activeTrades, accountSettings.feePerTrade]);


  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center font-sans tracking-widest text-[#00B0F0] text-sm uppercase">
        <div className="w-12 h-12 border-4 rounded-full animate-spin mb-4" style={{ borderColor: 'rgba(0,176,240,0.2)', borderTopColor: '#00B0F0' }}></div>
        Authenticating...
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col font-sans transition-colors duration-300 overflow-x-hidden relative z-0"
      style={appBackgroundStyle}
    >
      {/* Background Layer (Fixed Support for iOS App/Safari) */}
      {bgStyle !== 'none' && (
        <div className="fixed inset-0 z-[-1] pointer-events-none" style={backgroundLayerStyle} />
      )}
      {/* MODAL: EDIT TRADE */}
      {isTradeModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm transition-all" onClick={() => setIsTradeModalOpen(false)}>
          <div className="rounded-2xl w-full max-w-md shadow-[0_20px_60px_rgba(0,0,0,0.7)] flex flex-col border" style={{ backgroundColor: '#111114', borderColor: 'rgba(255,255,255,0.08)' }} onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center p-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
              <h3 className="font-bold text-lg flex items-center gap-2" style={{ color: '#fff' }}><Edit2 size={18} className="text-[#00B0F0]" /> Edit Trade</h3>
              <button onClick={() => setIsTradeModalOpen(false)} className="p-1.5 rounded-lg hover:bg-white/5 transition-colors text-white/40"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-5 overflow-y-auto max-h-[75vh] hide-scrollbar">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5"><label className="text-[10px] font-bold uppercase tracking-wider text-white/40">Symbol</label><input type="text" className="w-full rounded-xl p-3 border-0 outline-none text-sm bg-white/5 focus:bg-white/10 transition-all uppercase" style={{ color: '#fff' }} value={editFormData.symbol} onChange={e => setEditFormData({ ...editFormData, symbol: e.target.value.toUpperCase() })} /></div>
                <div className="space-y-1.5"><label className="text-[10px] font-bold uppercase tracking-wider text-white/40">Contracts</label><input type="number" className="w-full rounded-xl p-3 border-0 outline-none text-sm bg-white/5 focus:bg-white/10 transition-all" style={{ color: '#fff' }} value={editFormData.qty} onChange={e => setEditFormData({ ...editFormData, qty: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5"><label className="text-[10px] font-bold uppercase tracking-wider text-white/40">P&L ($)</label><input type="number" step="0.01" className="w-full rounded-xl p-3 border-0 outline-none text-sm bg-white/5 focus:bg-white/10 transition-all" style={{ color: '#fff' }} value={editFormData.pnl} onChange={e => setEditFormData({ ...editFormData, pnl: e.target.value })} /></div>
                <div className="space-y-1.5"><label className="text-[10px] font-bold uppercase tracking-wider text-white/40">Commission</label><input type="number" step="0.0001" className="w-full rounded-xl p-3 border-0 outline-none text-sm bg-white/5 focus:bg-white/10 transition-all" style={{ color: '#fff' }} value={editFormData.commission || ''} onChange={e => setEditFormData({ ...editFormData, commission: e.target.value })} /></div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5"><label className="text-[10px] font-bold uppercase tracking-wider text-white/40">Buy Time</label><input type="text" className="w-full rounded-xl p-3 border-0 outline-none text-sm bg-white/5 focus:bg-white/10 transition-all" style={{ color: '#fff' }} placeholder="YYYY/MM/DD HH:MM:SS" value={editFormData.buyTime || ''} onChange={e => setEditFormData({ ...editFormData, buyTime: e.target.value })} /></div>
                <div className="space-y-1.5"><label className="text-[10px] font-bold uppercase tracking-wider text-white/40">Buy Price</label><input type="number" step="0.00001" className="w-full rounded-xl p-3 border-0 outline-none text-sm bg-white/5 focus:bg-white/10 transition-all" style={{ color: '#fff' }} value={editFormData.buyPrice || ''} onChange={e => setEditFormData({ ...editFormData, buyPrice: e.target.value })} /></div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5"><label className="text-[10px] font-bold uppercase tracking-wider text-white/40">Sell Time</label><input type="text" className="w-full rounded-xl p-3 border-0 outline-none text-sm bg-white/5 focus:bg-white/10 transition-all" style={{ color: '#fff' }} placeholder="YYYY/MM/DD HH:MM:SS" value={editFormData.sellTime || ''} onChange={e => setEditFormData({ ...editFormData, sellTime: e.target.value })} /></div>
                <div className="space-y-1.5"><label className="text-[10px] font-bold uppercase tracking-wider text-white/40">Sell Price</label><input type="number" step="0.00001" className="w-full rounded-xl p-3 border-0 outline-none text-sm bg-white/5 focus:bg-white/10 transition-all" style={{ color: '#fff' }} value={editFormData.sellPrice || ''} onChange={e => setEditFormData({ ...editFormData, sellPrice: e.target.value })} /></div>
              </div>

              <div className="space-y-1.5"><label className="text-[10px] font-bold uppercase tracking-wider text-white/40">Duration</label><input type="text" className="w-full rounded-xl p-3 border-0 outline-none text-sm bg-white/5 focus:bg-white/10 transition-all" style={{ color: '#fff' }} placeholder="e.g 00:05:30" value={editFormData.duration || ''} onChange={e => setEditFormData({ ...editFormData, duration: e.target.value })} /></div>

              <div className="pt-2">
                <button onClick={saveTradeModal} className="w-full py-3.5 rounded-xl font-bold transition-all hover:brightness-110 active:scale-95 shadow-lg flex items-center justify-center gap-2" style={{ backgroundColor: '#00B0F0', color: '#fff' }}><Check size={18} /> Save Changes</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EDIT NEWS */}
      {isNewsModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm transition-all" onClick={() => setIsNewsModalOpen(false)}>
          <div className="rounded-2xl w-full max-w-md shadow-[0_20px_60px_rgba(0,0,0,0.7)] flex flex-col border" style={{ backgroundColor: '#111114', borderColor: 'rgba(255,255,255,0.08)' }} onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center p-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
              <h3 className="font-bold text-lg flex items-center gap-2" style={{ color: '#fff' }}><Edit2 size={18} className="text-[#00B0F0]" /> Edit News Event</h3>
              <button onClick={() => setIsNewsModalOpen(false)} className="p-1.5 rounded-lg hover:bg-white/5 transition-colors text-white/40"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5"><label className="text-[10px] font-bold uppercase tracking-wider text-white/40">Date</label><input type="date" className="w-full rounded-xl p-3 border-0 outline-none text-sm bg-white/5 focus:bg-white/10 transition-all font-sans" style={{ color: '#fff' }} value={editNewsData.date} onChange={e => setEditNewsData({ ...editNewsData, date: e.target.value })} /></div>
                <div className="space-y-1.5"><label className="text-[10px] font-bold uppercase tracking-wider text-white/40">Time</label><input type="text" className="w-full rounded-xl p-3 border-0 outline-none text-sm bg-white/5 focus:bg-white/10 transition-all" style={{ color: '#fff' }} value={editNewsData.time} onChange={e => setEditNewsData({ ...editNewsData, time: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5"><label className="text-[10px] font-bold uppercase tracking-wider text-white/40">Currency</label><input type="text" className="w-full rounded-xl p-3 border-0 outline-none text-sm bg-white/5 focus:bg-white/10 transition-all uppercase" style={{ color: '#fff' }} value={editNewsData.currency} onChange={e => setEditNewsData({ ...editNewsData, currency: e.target.value.toUpperCase() })} /></div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-white/40">Impact</label>
                  <select className="w-full rounded-xl p-3 border-0 outline-none text-sm bg-white/5 focus:bg-white/10 transition-all cursor-pointer" style={{ color: '#fff' }} value={editNewsData.impact} onChange={e => setEditNewsData({ ...editNewsData, impact: e.target.value })}>
                    <option value="High" className="bg-gray-900">High Impact</option>
                    <option value="Medium" className="bg-gray-900">Medium Impact</option>
                    <option value="Low" className="bg-gray-900">Low Impact</option>
                    <option value="Holiday" className="bg-gray-900">Bank Holiday</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1.5"><label className="text-[10px] font-bold uppercase tracking-wider text-white/40">Description</label><input type="text" className="w-full rounded-xl p-3 border-0 outline-none text-sm bg-white/5 focus:bg-white/10 transition-all" style={{ color: '#fff' }} value={editNewsData.description} onChange={e => setEditNewsData({ ...editNewsData, description: e.target.value })} /></div>
              <div className="pt-4">
                <button onClick={saveNewsModal} className="w-full py-3.5 rounded-xl font-bold transition-all hover:brightness-110 active:scale-95 shadow-lg flex items-center justify-center gap-2" style={{ backgroundColor: '#00B0F0', color: '#fff' }}><Check size={18} /> Save Changes</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ALERTA DE LIMITE DIÁRIO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md transition-all" onClick={() => { setIsModalOpen(false); setHasDismissedModal(true); }}>
          <div className="rounded-2xl w-full max-w-sm shadow-[0_20px_60px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col border-2 animate-bounce-slow" style={{ backgroundColor: theme.fundoCards, borderColor: theme.textoNegativo }} onClick={e => e.stopPropagation()}>
            <div className="p-8 text-center flex flex-col items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center border-2 border-red-500 mb-2">
                <AlertTriangle size={40} className="text-red-500" />
              </div>
              <h3 className="font-black text-2xl uppercase tracking-tighter" style={{ color: theme.textoNegativo }}>{t('dash.stopTrading', settings.appLanguage)}</h3>
              <p className="text-sm font-bold leading-relaxed" style={{ color: theme.textoPrincipal }}>
                {t('dash.dailyLimitReached', settings.appLanguage)}
                {' '}{t('dash.consistencyKey', settings.appLanguage)}
              </p>
              <div className="w-full bg-red-500/10 p-4 rounded-xl border border-red-500/30 mt-2">
                <p className="text-[10px] uppercase font-bold opacity-60 mb-1" style={{ color: theme.textoSecundario }}>{t('dash.totalNetLossToday', settings.appLanguage)}</p>
                <p className="text-xl font-mono font-black" style={{ color: theme.textoNegativo }}>{formatCurrency(metrics.todayNetPnl)}</p>
              </div>
              <button
                onClick={() => { setIsModalOpen(false); setHasDismissedModal(true); }}
                className="mt-6 w-full py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-95 shadow-lg"
                style={{ backgroundColor: theme.textoNegativo, color: '#fff' }}
              >
                {t('dash.iUnderstand', settings.appLanguage)}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: LUPA DOS CARDS DO CALENDARIO */}
      {dayTradesModalData && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm transition-all" onClick={() => setDayTradesModalData(null)}>
          <div className="rounded-2xl w-full max-w-lg shadow-[0_20px_60px_rgba(0,0,0,0.7)] flex flex-col max-h-[80vh] border" style={{ backgroundColor: '#111114', borderColor: 'rgba(255,255,255,0.08)' }} onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center p-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
              <h3 className="font-bold text-lg flex items-center gap-2" style={{ color: '#fff' }}><CalendarDays size={18} className="text-[#00B0F0]" /> {formatDate(dayTradesModalData.dateStr)}</h3>
              <button onClick={() => setDayTradesModalData(null)} className="p-1.5 rounded-lg hover:bg-white/5 transition-colors text-white/40"><X size={20} /></button>
            </div>
            <div className="p-5 overflow-y-auto hide-scrollbar flex-1">
              {dayTradesModalData.trades.length > 0 ? (
                <div className="w-full overflow-x-auto hide-scrollbar">
                  <table className="w-full text-left text-[10px] md:text-xs whitespace-nowrap">
                    <thead className="font-bold tracking-wider text-white/30">
                      <tr>
                        <th className="px-3 py-3 text-center uppercase tracking-widest text-[9px]">Sym</th>
                        <th className="px-3 py-3 uppercase tracking-widest text-[9px]">Time</th>
                        <th className="px-3 py-3 text-center uppercase tracking-widest text-[9px]">Dir</th>
                        <th className="px-3 py-3 text-center uppercase tracking-widest text-[9px]">Qty</th>
                        <th className="px-3 py-3 text-right uppercase tracking-widest text-[9px]">Gross P&L</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dayTradesModalData.trades.map((t, i) => (
                        <tr key={t.id} className="border-t transition-colors hover:bg-white/[0.02]" style={{ borderColor: 'rgba(255,255,255,0.03)' }}>
                          <td className="px-3 py-4 font-bold text-center text-white/90">{t.symbol || '-'}</td>
                          <td className="px-3 py-4 font-mono text-white/60">{t.entryTimestamp ? new Date(t.entryTimestamp).toLocaleTimeString(userLocale, { hour: '2-digit', minute: '2-digit', hour12: false }) : '-'}</td>
                          <td className="px-3 py-4 text-center">
                            <div className="flex items-center justify-center gap-1 font-bold" style={{ color: t.direction === 'Short' ? theme.textoNegativo : theme.textoPositivo }}>
                              {t.direction === 'Short' ? <ArrowDown size={14} /> : <ArrowUp size={14} />}
                            </div>
                          </td>
                          <td className="px-3 py-4 text-center font-mono text-white/80">{t.qty}</td>
                          <td className="px-3 py-4 text-right font-bold" style={{ color: t.pnl >= 0 ? theme.textoPositivo : theme.textoNegativo }}>{formatCurrency(t.pnl)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center italic text-xs py-8 text-white/20">No trades on this day.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* OVERLAY DE LOADING TRANSIÇÃO */}
      {isPending && (
        <div className="fixed inset-0 z-[40] flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm transition-all pointer-events-none">
          <div className="w-12 h-12 border-4 rounded-full animate-spin" style={{ borderColor: hexToRgba(theme.linhaGrafico, 0.2), borderTopColor: theme.linhaGrafico }}></div>
          <span className="mt-4 text-[11px] font-bold tracking-widest uppercase" style={{ color: theme.textoPrincipal }}>{t('dash.loading', settings.appLanguage)}</span>
        </div>
      )}

      {toastMessage && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] bg-green-600 text-white px-6 py-3 rounded-lg shadow-xl flex items-center space-x-2 transition-all">
          <span className="font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Global Overlays for Header Menus */}
      {isProfileDropdownOpen && (
        <div className="fixed inset-0 z-[90]" onClick={() => setIsProfileDropdownOpen(false)}></div>
      )}

      {/* OVERLAY MODAL PREMIUM UPGRADE – 2-step flow */}
      <PremiumUpgradeModal
        isOpen={premiumUpgradeFeature !== null}
        onClose={() => setPremiumUpgradeFeature(null)}
        featureName={premiumUpgradeFeature || undefined}
        theme={theme}
      />

      {/* FREE PLAN PROMO MODAL – auto-fires every 1 min + on daily limit */}
      <FreePlanPromoModal
        isOpen={promoModal.show}
        onClose={() => setPromoModal({ show: false, isDailyLimit: false })}
        theme={theme}
        isDailyLimit={promoModal.isDailyLimit}
      />

      {/* FAB SPEED DIAL OVERLAY — backdrop separado dos botões */}
      {isFabOpen && (
        <div
          className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-md transition-opacity duration-300 lg:hidden"
          onClick={() => setIsFabOpen(false)}
        />
      )}

      {/* FAB speed-dial BUTTONS (acima do backdrop, z-70) */}
      {isFabOpen && (
        <div
          className="fixed left-1/2 -translate-x-1/2 flex items-end z-[70] pointer-events-none lg:hidden"
          style={{ bottom: `calc(var(--nav-bottom-height, 65px) + env(safe-area-inset-bottom, 0px) + 1.5rem)`, gap: `${LAYOUT.fab.gap}rem` }}
        >
          {[
            { id: 'import', icon: Plus, label: 'Trade', locked: false, ...LAYOUT.fab.colors.trade, offsetY: LAYOUT.fab.arcOffsets[0] },
            { id: 'news', icon: Newspaper, label: 'News', locked: isFreePlan, ...LAYOUT.fab.colors.news, offsetY: LAYOUT.fab.arcOffsets[1] },
            { id: 'holidays', icon: CalendarDays, label: 'Holidays', locked: isFreePlan, ...LAYOUT.fab.colors.holidays, offsetY: LAYOUT.fab.arcOffsets[2] }
          ].map((item, idx) => (
            <div
              key={item.id}
              className="flex flex-col items-center gap-2 pointer-events-auto transition-transform duration-300"
              style={{
                animationDelay: `${idx * 60}ms`,
                marginBottom: `${item.offsetY}px`
              }}
            >
              <button
                onTouchEnd={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsFabOpen(false);
                  if (item.locked) {
                    setPremiumUpgradeFeature(item.label);
                  } else {
                    setPrevTab(activeTab);
                    setActiveTab(item.id);
                  }
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsFabOpen(false);
                  if (item.locked) {
                    setPremiumUpgradeFeature(item.label);
                  } else {
                    setPrevTab(activeTab);
                    setActiveTab(item.id);
                  }
                }}
                className="relative rounded-full flex items-center justify-center shadow-[0_8px_32px_rgba(0,0,0,0.5)] transition-all duration-200 active:scale-90 hover:brightness-125"
                style={{
                  width: `${LAYOUT.fab.circleSize}rem`,
                  height: `${LAYOUT.fab.circleSize}rem`,
                  backgroundColor: item.bgColor,
                  border: `${LAYOUT.fab.circleBorderWidth}px solid ${item.borderColor}`,
                  opacity: item.locked ? 0.7 : 1
                }}
              >
                <item.icon size={LAYOUT.fab.iconSize} style={{ color: item.iconColor }} />
                {item.locked && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center shadow-[0_0_6px_rgba(234,179,8,0.6)]">
                    <Crown size={9} className="text-black" />
                  </span>
                )}
              </button>
              <span
                className="font-bold uppercase tracking-widest mt-2"
                style={{ fontSize: `${LAYOUT.fab.labelFontSize}rem`, color: item.iconColor, textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}
              >{item.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* MOBILE TOOLTIP MODAL (News / Holidays no Calendário) */}
      {mobileTooltipContent && createPortal(
        <>
          <div className="fixed inset-0 z-[9998] bg-black/60" onClick={() => setMobileTooltipContent(null)} />
          <div className="fixed bottom-0 left-0 right-0 z-[9999] rounded-t-2xl p-5 pb-10 shadow-2xl animate-tab-enter"
            style={{ backgroundColor: theme.fundoCards, borderColor: theme.contornoGeral, borderWidth: `${settings.borderWidthGeral}px ${settings.borderWidthGeral}px 0`, borderStyle: 'solid' }}>
            <div className="w-10 h-1 rounded-full bg-white/20 mx-auto mb-4" />
            <div className="text-sm font-medium" style={{ color: theme.textoPrincipal }}>
              {mobileTooltipContent}
            </div>
            <button onClick={() => setMobileTooltipContent(null)} className="mt-4 w-full py-2.5 rounded-lg text-xs font-bold transition-opacity hover:opacity-80" style={{ backgroundColor: theme.linhaGrafico, color: '#fff' }}>Close</button>
          </div>
        </>,
        document.body
      )}

      {/* HEADER FIXO NO TOPO */}
      <header className="fixed top-0 left-0 w-full z-[90] flex items-end justify-between px-4 lg:px-6 shadow-sm transition-all overflow-hidden lg:items-center"
        style={{
          ...iosNavFix,
          height: isMobile ? 'calc(var(--header-height-mob, 90px) + env(safe-area-inset-top, 0px))' : 'var(--header-height-desk, 80px)',
          paddingTop: isMobile ? 'env(safe-area-inset-top, 0px)' : '0',
          paddingBottom: isMobile ? '0.75rem' : '0',
          ...(settings.enableGlassEffect ? {
            backgroundColor: hexToRgba(theme.fundoMenu, 1),
            backdropFilter: `blur(${Math.max(20, settings.glassBlur)}px)`,
            WebkitBackdropFilter: `blur(${Math.max(20, settings.glassBlur)}px)`
          } : { backgroundColor: theme.fundoMenu }),
          borderColor: theme.contornoGeral, borderWidth: `0 0 ${settings.borderWidthGeral}px 0`, borderStyle: 'solid'
        }}>

        {/* Lado Esquerdo: Logo / Back Button Dinâmico */}
        {isMobile && ['settings'].includes(activeTab) && activeTab !== 'dashboard' ? (
          <button onClick={() => { startTransition(() => { setActiveTab(prevTab); setSettingsHideTabs(false); }); }} className="flex items-center gap-1.5 py-1 pr-4 active:opacity-70 transition-opacity lg:w-[160px] xl:w-[220px]" style={{ color: '#00B0F0' }}>
            <ChevronLeft size={24} />
            <span className="font-bold text-lg font-display">Back</span>
          </button>
        ) : (
          <div className="flex items-center gap-2 lg:gap-3 lg:w-[160px] xl:w-[220px] cursor-pointer active:opacity-70 transition-opacity" onClick={() => startTransition(() => setActiveTab('dashboard'))}>
            <img
              src="/logo.png"
              alt="Quantara Logo"
              className="w-8 h-8 lg:w-9 lg:h-9 object-contain drop-shadow-md z-10 rounded-xl"
              onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
            />
            <div style={{ display: 'none' }} className="w-8 h-8 lg:w-9 lg:h-9 bg-yellow-500 rounded-xl items-center justify-center text-[#121C30] z-0 drop-shadow-md font-bold">
              🐾
            </div>
            <h1 className="text-lg lg:text-xl font-extrabold tracking-tight font-display" style={{ color: theme.textoPrincipal }}>
              Quantara
            </h1>
          </div>
        )}

        {/* Centro: Menu Novo Estilo "Pill" (Aparece Apenas no Desktop) */}
        <div className="hidden lg:flex justify-center gap-2 overflow-x-auto hide-scrollbar flex-1">
          {[
            { id: 'dashboard', icon: LayoutDashboard, title: 'Dashboard', locked: blockedModules.includes('dashboard') },
            { id: 'analytics', icon: BarChart2, title: 'Analytics', locked: blockedModules.includes('analytics') },
            { id: 'journal', icon: BookOpen, title: 'Journal', locked: blockedModules.includes('journal') },
            { id: 'trading', icon: TrendingUp, title: 'Trading', locked: blockedModules.includes('trading') },
            { id: 'setups', icon: Target, title: 'Setups', locked: blockedModules.includes('setups') },
            { id: 'trades', icon: ListIcon, title: 'Trades', locked: blockedModules.includes('trades') },
            { id: 'import', icon: Import, title: 'Import', locked: blockedModules.includes('import') },
            { id: 'news', icon: Newspaper, title: 'News', locked: blockedModules.includes('news') },
            { id: 'holidays', icon: CalendarDays, title: 'Holidays', locked: blockedModules.includes('holidays') },
            { id: 'settings', icon: SettingsIcon, title: 'Settings', locked: blockedModules.includes('settings') }
          ].map(item => (
            <button
              key={item.id}
              title={item.locked ? `${item.title} — Premium Only` : item.title}
              onClick={() => {
                if (item.locked) {
                  setPremiumUpgradeFeature(item.title);
                } else {
                  startTransition(() => setActiveTab(item.id));
                }
              }}
              className={`relative flex items-center justify-center gap-2 p-2.5 xl:px-4 xl:py-2 rounded-full transition-all duration-300 shrink-0 ${activeTab === item.id ? 'shadow-sm' : 'hover:bg-white/5'}`}
              style={{
                backgroundColor: activeTab === item.id ? hexToRgba(theme.linhaGrafico, 0.15) : 'transparent',
                color: item.locked ? theme.textoSecundario : (activeTab === item.id ? theme.textoPrincipal : theme.textoSecundario),
                border: activeTab === item.id ? `1px solid ${hexToRgba(theme.linhaGrafico, 0.3)}` : '1px solid transparent',
                opacity: item.locked ? 0.6 : 1
              }}>
              <item.icon className={`transition-transform duration-300 ${activeTab === item.id ? 'scale-110' : ''}`} size={16} style={{ color: activeTab === item.id && !item.locked ? theme.linhaGrafico : 'inherit' }} />
              <span className="hidden xl:block text-[13px] font-bold tracking-wide font-display">{item.title}</span>
              {item.locked && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center shadow-[0_0_6px_rgba(234,179,8,0.6)]">
                  <Crown size={9} className="text-black" />
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Lado Direito: User Profile Dropdown */}
        <div className="flex items-center justify-end gap-2 lg:w-[160px] xl:w-[220px]">

          {/* Gear: Account Switcher */}
          <button
            onClick={() => setIsAccountSwitcherOpen(true)}
            title={activeAccount ? `Active: ${activeAccount.name}` : 'Select Account'}
            className="relative flex items-center gap-1.5 px-2 py-1.5 rounded-full transition-all hover:bg-yellow-500/10 border border-yellow-500/30 group"
          >
            <GearIcon2 size={16} className="text-yellow-400 group-hover:rotate-45 transition-transform duration-300" />
            <span className="hidden xl:block text-xs font-bold truncate max-w-[80px]" style={{ color: '#facc15' }}>
              {activeAccount ? activeAccount.name : 'No Account'}
            </span>
          </button>

          <button
            onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
            className="flex items-center gap-2 p-1.5 lg:p-2 rounded-full transition-all hover:bg-white/5 group border border-transparent hover:border-white/10"
          >
            <div className="w-7 h-7 lg:w-9 lg:h-9 rounded-full bg-yellow-500/20 flex items-center justify-center border-2 border-yellow-500 overflow-hidden shadow-lg shadow-yellow-500/10">
              {settings.userPhoto ? (
                <img src={settings.userPhoto} alt="User" className="w-full h-full object-cover" />
              ) : (
                <UserIcon size={20} className="text-yellow-500" />
              )}
            </div>
            <div className="flex flex-col items-start mr-1">
              <span className="text-[11px] lg:text-xs font-bold truncate max-w-[80px]" style={{ color: theme.textoPrincipal }}>{settings.userName || 'User'}</span>
              <span className="text-[9px] lg:text-[10px] font-bold opacity-60 uppercase" style={{ color: theme.textoSecundario }}>{settings.userPlan || 'FREE'}</span>
            </div>
            <ChevronDown size={14} className={`transition-transform duration-300 opacity-40 group-hover:opacity-100 ${isProfileDropdownOpen ? 'rotate-180' : ''}`} style={{ color: theme.textoPrincipal }} />
          </button>

          {isProfileDropdownOpen && createPortal(
            <>
              {/* Invisible Overlay to close dropdown */}
              <div
                className="fixed inset-0 z-[100]"
                onClick={() => setIsProfileDropdownOpen(false)}
              />
              <div className="fixed top-16 lg:top-20 right-4 lg:right-6 w-60 rounded-2xl shadow-2xl overflow-hidden border"
                style={{ backgroundColor: theme.fundoCards, borderColor: theme.contornoGeral, zIndex: 101 }}>
                {/* Avatar + Nome + Status (Clickable Header) */}
                <button
                  onClick={() => {
                    setIsProfileDropdownOpen(false);
                    navigate('/account');
                  }}
                  className="w-full flex flex-col items-center pt-6 pb-4 px-4 transition-all hover:bg-white/5 active:scale-95 cursor-pointer block"
                  style={{ textDecoration: 'none' }}
                >
                  <div className="w-16 h-16 rounded-full bg-yellow-500/20 flex items-center justify-center border-2 border-yellow-500 overflow-hidden shadow-lg shadow-yellow-500/10 mb-3">
                    {settings.userPhoto ? (
                      <img src={settings.userPhoto} alt="User" className="w-full h-full object-cover" />
                    ) : (
                      <UserIcon size={32} className="text-yellow-500" />
                    )}
                  </div>
                  <p className="text-sm font-bold" style={{ color: theme.textoPrincipal }}>{settings.userName || 'User'}</p>
                  <p className="text-[11px] font-bold mt-0.5" style={{ color: '#00d4ff' }}>Status: {settings.userPlan || 'Free'} Plan</p>
                </button>
                {/* Separador */}
                <div className="mx-4 border-t" style={{ borderColor: theme.contornoGeral }} />
                {/* Links */}
                <div className="p-3 space-y-1">
                  <button
                    onClick={() => {
                      setIsProfileDropdownOpen(false);
                      navigate('/account');
                    }}
                    className="w-full flex items-center gap-3 p-3 rounded-xl text-sm font-bold transition-all hover:bg-white/5 group cursor-pointer block"
                    style={{ textDecoration: 'none' }}
                  >
                    <UserIcon size={18} style={{ color: theme.linhaGrafico }} className="group-hover:scale-110 transition-transform" />
                    <span style={{ color: theme.textoPrincipal }}>My Profile</span>
                  </button>
                  {/* ADMIN LINK — visível apenas para email administrador */}
                  {session?.user?.email === 'mcsstr@icloud.com' && (
                    <button
                      onClick={() => {
                        setIsProfileDropdownOpen(false);
                        navigate('/admin');
                      }}
                      className="w-full flex items-center gap-3 p-3 rounded-xl text-sm font-bold transition-all hover:bg-white/5 group cursor-pointer block"
                      style={{ textDecoration: 'none' }}
                    >
                      <ShieldAlert size={18} style={{ color: '#f59e0b' }} className="group-hover:scale-110 transition-transform" />
                      <span style={{ color: theme.textoPrincipal }}>Administrador</span>
                    </button>
                  )}
                  <button onClick={() => {
                    if (window.confirm('Are you sure you want to sign out?')) {
                      setIsProfileDropdownOpen(false);
                      navigate('/');
                    }
                  }}
                    className="w-full flex items-center gap-3 p-3 rounded-xl text-sm font-bold transition-all hover:bg-white/5 group">
                    <LogOutIcon size={18} style={{ color: '#f87171' }} className="group-hover:scale-110 transition-transform" />
                    <span style={{ color: theme.textoPrincipal }}>Logout</span>
                  </button>
                </div>
              </div >
            </>,
            document.body
          )}
        </div>
      </header >

      {/* CONTEÚDO PRINCIPAL */}
      <main className="flex-1 w-full px-4 lg:px-6 pt-safe-main pb-safe-main main-container" style={{ scrollBehavior: 'smooth' }}>

        {isFreePlan && (
          <div className="mx-auto max-w-4xl bg-red-900/20 border border-red-500/30 text-red-200 px-4 py-3 rounded-xl mb-4 mt-6 text-xs md:text-sm font-medium flex items-center justify-center text-center shadow-sm animate-fade-in backdrop-blur-md">
            <span><strong className="text-red-400">⚠️ {settings.appLanguage === 'pt' ? 'Aviso Plano Free' : 'Free Plan Notice'}:</strong> {settings.appLanguage === 'pt' ? 'Seus dados de Trades, Notícias e Feriados estão sendo salvos apenas localmente neste dispositivo. Mude para Premium para Sincronização em Nuvem e Backup.' : 'Your Trades, News, and Holidays data are only saved locally on this device. Upgrade to Premium for Cloud Sync and Backup.'}</span>
          </div>
        )}
        {activeTab === 'mobile_menu' && isMobile && (
          <MobileMenuView
            theme={theme}
            getGlassStyle={getGlassStyle}
            setActiveTab={setActiveTab}
            setActiveSettingsTab={setActiveSettingsTab}
            setSettingsHideTabs={setSettingsHideTabs}
            settings={settings}
            setPrevTab={setPrevTab}
            activeTab={activeTab}
            setShowLogoutConfirm={() => {
              if (window.confirm('Are you sure you want to sign out?')) {
                startTransition(() => {
                  window.location.href = '/';
                });
              }
            }}
          />
        )}

        {
          isLoadingAccounts ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="animate-spin" size={32} style={{ color: theme.linhaGrafico }} />
            </div>
          ) : !activeAccountId && ['dashboard', 'analytics', 'trades'].includes(activeTab) ? (
            <div className="flex flex-col items-center justify-center p-8 mt-12 text-center animate-fade-in">
              <div className="p-5 rounded-full mb-6" style={{ backgroundColor: hexToRgba(theme.linhaGrafico, 0.15) }}>
                <Layers size={56} style={{ color: theme.linhaGrafico }} />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold mb-3 font-display" style={{ color: theme.textoPrincipal }}>{t('dash.noAccount', settings.appLanguage)}</h2>
              <p className="max-w-md opacity-70 text-sm md:text-base leading-relaxed" style={{ color: theme.textoSecundario }}>
                {t('dash.noAccountDesc', settings.appLanguage)}
              </p>
              <button
                onClick={() => { setActiveTab('settings'); openCreateAccountForm(); }}
                className="mt-8 px-6 py-3 rounded-xl font-bold transition-all hover:scale-105 active:scale-95 shadow-lg"
                style={{ backgroundColor: theme.linhaGrafico, color: '#fff' }}
              >
                {t('dash.createAccount', settings.appLanguage)}
              </button>
            </div>
          ) : (
            <>
              {
                activeTab === 'dashboard' && (
                  <DashboardHomeView
                    metrics={metrics}
                    timeMetrics={timeMetrics}
                    settings={accountSettings}
                    theme={theme}
                    formatCurrency={formatCurrency}
                    formatCurrencyDash={formatCurrencyDash}
                    formatPaymentDash={formatPaymentDash}
                    formatPercent={formatPercent}
                    formatPercentDecimals={formatPercentDecimals}
                    exchangeRate={exchangeRate}
                    t={t}
                    lang={settings.appLanguage}
                    getGlassStyle={getGlassStyle}
                    isTrendUp={isTrendUp}
                    chartData={chartData}
                    userLocale={userLocale}
                    equityFilter={equityFilter}
                    setEquityFilter={setEquityFilter}
                    selectedWeekDate={selectedWeekDate}
                    setSelectedWeekDate={setSelectedWeekDate}
                    getStartOfWeek={getStartOfWeek}
                    performanceWeeklyData={performanceWeeklyData}
                    calendarData={calendarData}
                    currentDate={currentDate}
                    setCurrentDate={setCurrentDate}
                    IconTooltip={IconTooltip}
                    renderHolidaysTooltip={renderHolidaysTooltip}
                    renderNewsTooltip={renderNewsTooltip}
                    setDayTradesModalData={setDayTradesModalData}
                    miniHistorySort={miniHistorySort}
                    setMiniHistorySort={setMiniHistorySort}
                    miniSortedTrades={miniSortedTrades}
                    formatDate={formatDate}
                    isMobile={isMobile}
                    blockedModules={blockedModules}
                    onUpgradeClick={(feature) => setPremiumUpgradeFeature(feature)}
                  />
                )
              }

              {
                activeTab === 'analytics' && (
                  <AnalyticsView
                    theme={theme}
                    settings={accountSettings}
                    getGlassStyle={getGlassStyle}
                    getFullDateString={getFullDateString}
                    activeAccountDays={activeAccountDays}
                    exchangeRate={exchangeRate}
                    metricRows={metricRows}
                    isEvalTableExpanded={isEvalTableExpanded}
                    setIsEvalTableExpanded={setIsEvalTableExpanded}
                    isMobile={isMobile}
                    monthlyPnlData={monthlyPnlData}
                    userLocale={userLocale}
                    formatCurrency={formatCurrency}
                    symbolData={symbolData}
                    winLossData={winLossData}
                    metrics={metrics}
                    formatPercent={formatPercent}
                    directionData={directionData}
                    timeGrouping={timeGrouping}
                    setTimeGrouping={setTimeGrouping}
                    timeDistributionData={timeDistributionData}
                    tradeValuesFilter={tradeValuesFilter}
                    setTradeValuesFilter={setTradeValuesFilter}
                    availableTradePeriods={availableTradePeriods}
                    filteredTradeValuesData={filteredTradeValuesData}
                    cumulativePnlData={cumulativePnlData}
                    dayOfWeekData={dayOfWeekData}
                  />
                )
              }

              {
                activeTab === 'trades' && (
                  <TradesView
                    theme={theme}
                    getGlassStyle={getGlassStyle}
                    settings={accountSettings}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    filterMonth={filterMonth}
                    setFilterMonth={setFilterMonth}
                    filterYear={filterYear}
                    setFilterYear={setFilterYear}
                    sortOrder={sortOrder}
                    setSortOrder={setSortOrder}
                    handleExportCSV={handleExportCSV}
                    selectedTrades={selectedTrades}
                    setSelectedTrades={setSelectedTrades}
                    paginatedTrades={paginatedTrades}
                    formatDate={formatDate}
                    userLocale={userLocale}
                    formatCurrency={formatCurrency}
                    historyPage={historyPage}
                    setHistoryPage={setHistoryPage}
                    historyItemsPerPage={historyItemsPerPage}
                    filteredTrades={filteredTrades}
                    setTrades={setTrades}
                    setEditFormData={setEditFormData}
                    setIsTradeModalOpen={setIsTradeModalOpen}
                    isMobile={isMobile}
                    setups={setups}
                    activeAccountId={activeAccountId}
                    supabase={supabase}
                    session={session}
                    setToastMessage={setToastMessage}
                  />
                )
              }
            </>
          )
        }

        {
          activeTab === 'journal' && (
            <JournalView
              theme={theme}
              getGlassStyle={getGlassStyle}
              settings={settings}
              t={t}
              lang={settings.appLanguage}
              trades={trades}
              activeAccountId={activeAccountId}
              journals={journals}
              saveJournal={saveJournal}
              deleteJournal={deleteJournal}
              setups={setups}
              formatDate={formatDate}
            />
          )
        }

        {
          activeTab === 'trading' && (
            <TradingPageView
              theme={theme}
              getGlassStyle={getGlassStyle}
              favorites={tradingFavorites}
              onSaveFavorite={saveTradingFavorite}
              onDeleteFavorite={deleteTradingFavorite}
              onUpdateFavorite={updateTradingFavorite}
            />
          )
        }

        {
          activeTab === 'news' && (
            <NewsView
              theme={theme}
              getGlassStyle={getGlassStyle}
              settings={accountSettings}
              isMobile={isMobile}
              newNewsItem={newNewsItem}
              setNewNewsItem={setNewNewsItem}
              handleAddNews={handleAddNews}
              newsImportImpact={newsImportImpact}
              setNewsImportImpact={setNewsImportImpact}
              newsImportText={newsImportText}
              setNewsImportText={setNewsImportText}
              handleImportNews={handleImportNews}
              newsFilter={newsFilter}
              setNewsFilter={setNewsFilter}
              filteredNewsList={filteredNewsList}
              formatDate={formatDate}
              getImpactColor={getImpactColor}
              setEditNewsData={setEditNewsData}
              setIsNewsModalOpen={setIsNewsModalOpen}
              saveNews={saveNews}
              deleteNews={deleteNews}
              news={news}
            />
          )
        }

        {
          activeTab === 'holidays' && (
            <HolidaysView
              theme={theme}
              getGlassStyle={getGlassStyle}
              settings={accountSettings}
              holidaySortOrder={holidaySortOrder}
              setHolidaySortOrder={setHolidaySortOrder}
              newHoliday={newHoliday}
              setNewHoliday={setNewHoliday}
              addHoliday={addHoliday}
              holidays={holidays}
              editingHoliday={editingHoliday}
              setEditingHoliday={setEditingHoliday}
              editHolidayData={editHolidayData}
              setEditHolidayData={setEditHolidayData}
              formatDate={formatDate}
              saveHoliday={saveHoliday}
              deleteHoliday={deleteHoliday}
              isMobile={isMobile}
            />
          )
        }

        {
          activeTab === 'setups' && (
            <SetupsView
              theme={theme}
              getGlassStyle={getGlassStyle}
              settings={settings}
              accountSettings={accountSettings}
              t={t}
              lang={settings.appLanguage}
              trades={trades}
              setups={setups}
              saveSetup={saveSetup}
              deleteSetup={deleteSetup}
              setupTargets={setupTargets}
              saveSetupTarget={saveSetupTarget}
              saveBatchSetupTargets={saveBatchSetupTargets}
              deleteSetupTarget={deleteSetupTarget}
              setupConfigLogs={setupConfigLogs}
              addSetupConfigLog={addSetupConfigLog}
              updateSetupConfigLog={updateSetupConfigLog}
              activeAccountId={activeAccountId}
              formatDate={formatDate}
            />
          )
        }

        {
          activeTab === 'import' && (
            <ImportView
              theme={theme}
              getGlassStyle={getGlassStyle}
              settings={accountSettings}
              importText={importText}
              setImportText={setImportText}
              handleImport={handleImport}
              manualTrade={manualTrade}
              setManualTrade={setManualTrade}
              handleManualTradeAdd={handleManualTradeAdd}
              handleCSVUpload={handleCSVUpload}
              isMobile={isMobile}
              accounts={accounts}
              selectedImportAccountId={selectedImportAccountId}
              setSelectedImportAccountId={setSelectedImportAccountId}
              activeAccount={activeAccount}
              t={t}
              lang={settings.appLanguage}
            />
          )
        }

        {
          activeTab === 'settings' && (
            <SettingsView
              activeSettingsTab={activeSettingsTab}
              setActiveSettingsTab={setActiveSettingsTab}
              theme={theme}
              setTheme={setTheme}
              settings={settings}
              setSettings={setSettings}
              getGlassStyle={getGlassStyle}
              DEFAULT_SETTINGS={DEFAULT_SETTINGS}
              DEFAULT_THEME={DEFAULT_THEME}
              THEME_GROUPS={THEME_GROUPS}
              handleResetAllData={() => {
                if (window.confirm('Are you sure you want to reset all data and settings?')) {
                  setTrades([]);
                  overrideHolidays([]);
                  overrideNews([]);
                  setSettings(DEFAULT_SETTINGS);
                  setTheme(DEFAULT_THEME);
                  localStorage.clear();
                }
              }}
              SearchableSelect={SearchableSelect}
              TIMEZONES_LIST={TIMEZONES_LIST}
              CURRENCIES_LIST={CURRENCIES_LIST}
              t={t}
              lang={settings.appLanguage}
              isMobile={isMobile}
              settingsHideTabs={settingsHideTabs}
              accounts={accounts}
              activeAccountId={activeAccountId}
              onCreateAccount={openCreateAccountForm}
              onEditAccount={openEditAccountForm}
              onDeleteAccount={(id) => setConfirmDeleteAccountId(id)}
              onSaveSettings={handleSaveSettings}
              handleImageUpload={handleImageUpload}
              onLockedTabClick={(feature: string) => setPremiumUpgradeFeature(feature)}
            />
          )
        }

      </main >

      {/* BOTTOM NAVIGATION MOBILE FIXO */}
      <nav className="flex lg:hidden fixed bottom-0 left-0 w-full z-[65] items-start justify-around px-2 shadow-xl transition-all"
        style={{
          height: 'calc(var(--nav-bottom-height, 65px) + env(safe-area-inset-bottom, 0px))',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          paddingTop: `${LAYOUT.nav.paddingTop}rem`,
          ...iosNavFix,
          backgroundColor: hexToRgba(theme.fundoMenu, 0.95),
          borderTop: `1px solid ${theme.contornoGeral}`,
          backdropFilter: `blur(${Math.max(20, settings.glassBlur)}px)`,
          WebkitBackdropFilter: `blur(${Math.max(20, settings.glassBlur)}px)`
        }}
      >
        {
          [
            { id: 'dashboard', icon: LayoutDashboard, title: 'Home' },
            { id: 'trades', icon: ListIcon, title: 'Trades' },
            { id: 'fab', icon: isFabOpen ? X : Plus, title: 'Add', isFab: true },
            { id: 'analytics', icon: BarChart2, title: 'Analytics' },
            { id: 'mobile_menu', icon: MenuIcon, title: 'Menu' }
          ].map(item => {
            if (item.isFab) {
              return (
                <button
                  key={item.id}
                  onTouchEnd={(e) => { e.preventDefault(); setIsFabOpen(prev => !prev); }}
                  onClick={() => setIsFabOpen(prev => !prev)}
                  className={`relative flex items-center justify-center rounded-full shadow-2xl transition-all duration-300 z-[75]`}
                  style={{
                    marginTop: `-${LAYOUT.nav.fabNegativeMarginTop}rem`,
                    padding: `${LAYOUT.nav.fabPadding}rem`,
                    backgroundColor: isFabOpen ? LAYOUT.nav.fabOpenColor : LAYOUT.nav.fabClosedColor,
                    color: '#fff',
                    border: `${LAYOUT.nav.fabBorderWidth}px solid ${theme.fundoPrincipal}`
                  }}
                >
                  <div className={`transition-transform duration-300 ${isFabOpen ? 'rotate-90 scale-110' : ''}`}>
                    {isFabOpen ? <X size={LAYOUT.nav.fabIconSize} /> : <Plus size={LAYOUT.nav.fabIconSize} />}
                  </div>
                </button>
              );
            }
            const isActive = activeTab === item.id;
            const isLocked = !item.isFab && blockedModules.includes(item.id);
            
            const handleNavTap = () => {
              if (isLocked) {
                setPremiumUpgradeFeature(item.title);
                return;
              }
              if (activeTab !== item.id) {
                startTransition(() => {
                  setPrevTab(activeTab);
                  setActiveTab(item.id);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                });
              }
            };
            return (
              <button
                key={item.id}
                title={isLocked ? `${item.title} — Premium Only` : item.title}
                onTouchEnd={(e) => { e.preventDefault(); handleNavTap(); }}
                onClick={handleNavTap}
                className={`flex flex-col relative items-center justify-start flex-1 gap-1 transition-all duration-300 active:scale-90 touch-manipulation pt-2 ${isFabOpen ? 'opacity-0 pointer-events-none translate-y-4' : 'opacity-100 translate-y-0'}`}
                style={{
                  height: 'var(--nav-bottom-height, 65px)',
                  color: isLocked ? theme.textoSecundario : (isActive ? LAYOUT.nav.activeColor : theme.textoSecundario),
                  opacity: isLocked ? 0.6 : 1
                }}
              >
                <item.icon size={isActive && !isLocked ? LAYOUT.nav.iconSizeActive : LAYOUT.nav.iconSizeInactive} />
                <span className={`font-bold tracking-widest ${LAYOUT.nav.labelUppercase ? 'uppercase' : 'capitalize'}`} style={{ fontSize: `${LAYOUT.nav.labelFontSize}rem` }}>{item.title}</span>
                {isLocked && (
                  <span className="absolute top-1 right-2 w-3 h-3 bg-yellow-500 rounded-full flex items-center justify-center shadow-[0_0_6px_rgba(234,179,8,0.6)]">
                    <Crown size={7} className="text-black" />
                  </span>
                )}
              </button>
            );
          })
        }
      </nav >

      {/* ===== ACCOUNT SWITCHER MODAL ===== */}
      {
        isAccountSwitcherOpen && createPortal(
          <>
            <div className="fixed inset-0 z-[199] bg-black/60 backdrop-blur-sm" onClick={() => setIsAccountSwitcherOpen(false)} />
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" onClick={() => setIsAccountSwitcherOpen(false)}>
              <div
                className="w-full max-w-sm rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.7)] border overflow-hidden"
                style={{ backgroundColor: '#111114', borderColor: 'rgba(255,255,255,0.08)' }}
                onClick={e => e.stopPropagation()}
              >
                {/* Header */}
                <div className="px-5 py-4 flex items-center justify-between border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                  <div className="flex items-center gap-2">
                    <Monitor size={18} className="text-[#00B0F0]" />
                    <span className="text-base font-bold text-white">{t('switcher.title', settings.appLanguage)}</span>
                  </div>
                  <button onClick={() => setIsAccountSwitcherOpen(false)} className="p-1 rounded-lg hover:bg-white/5 text-white/40"><X size={18} /></button>
                </div>
                {/* Account List */}
                <div className="p-4 space-y-2 max-h-72 overflow-y-auto hide-scrollbar">
                  {accounts.length === 0 ? (
                    <div className="text-center py-8 text-white/20 text-sm">
                      {t('switcher.noAccounts', settings.appLanguage)}
                    </div>
                  ) : accounts.map(acc => (
                    <button
                      key={acc.id}
                      onClick={() => { 
                        setActiveAccountId(acc.id); 
                        setSelectedImportAccountId(acc.id);
                        localStorage.setItem('quantara_activeAccountId', acc.id);
                        setIsAccountSwitcherOpen(false); 
                      }}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${acc.id === activeAccountId
                        ? 'border-[#00B0F0]/50 bg-[#00B0F0]/10'
                        : 'border-white/5 hover:border-white/20 hover:bg-white/5'
                        }`}
                    >
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm ${acc.id === activeAccountId ? 'bg-[#00B0F0] text-white' : 'bg-white/5 text-white/40'
                        }`}>
                        {acc.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-sm font-bold" style={{ color: acc.id === activeAccountId ? '#00B0F0' : '#fff' }}>{acc.name}</p>
                        <p className="text-xs text-white/30">Balance: ${Number(acc.initialBalance).toLocaleString()}</p>
                      </div>
                      {acc.id === activeAccountId && <Check size={16} className="text-[#00B0F0]" />}
                    </button>
                  ))}
                </div>
                {/* Footer */}
                <div className="px-5 py-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                  <button
                    onClick={() => { setIsAccountSwitcherOpen(false); setActiveTab('settings'); setActiveSettingsTab('account'); }}
                    className="w-full py-2.5 rounded-xl text-sm font-bold transition-all border border-white/10 hover:bg-white/5 text-white/60"
                  >
                    {t('switcher.manage', settings.appLanguage)}
                  </button>
                </div>
              </div>
            </div>
          </>,
          document.body
        )
      }

      {/* ===== ACCOUNT FORM MODAL (Create / Edit) ===== */}
      {
        isAccountFormOpen && createPortal(
          <>
            <div className="fixed inset-0 z-[199] bg-black/60 backdrop-blur-sm" onClick={() => setIsAccountFormOpen(false)} />
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
              <div
                className="w-full max-w-md rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.7)] border overflow-hidden"
                style={{ backgroundColor: '#111114', borderColor: 'rgba(255,255,255,0.08)' }}
                onClick={e => e.stopPropagation()}
              >
                <div className="px-5 py-4 flex items-center justify-between border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                  <span className="text-base font-bold text-white">{editingAccount ? t('accountForm.edit', settings.appLanguage) : t('accountForm.create', settings.appLanguage)}</span>
                  <button onClick={() => setIsAccountFormOpen(false)} className="p-1 rounded-lg hover:bg-white/5 text-white/40"><X size={18} /></button>
                </div>
                <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto hide-scrollbar">
                  {accountFormError && (
                    <div className="px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs">{accountFormError}</div>
                  )}
                  {/* Name */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-white/40 font-bold uppercase tracking-widest">{t('accountForm.name', settings.appLanguage)}</label>
                    <input
                      className="w-full px-4 py-3 rounded-xl border-0 bg-white/5 text-sm font-semibold outline-none focus:bg-white/10 transition-all"
                      style={{ color: '#fff' }}
                      placeholder="e.g. Apex Prop, Personal"
                      value={accountFormData.name}
                      onChange={e => setAccountFormData(p => ({ ...p, name: e.target.value }))}
                      autoFocus
                    />
                  </div>

                  {/* Currencies & Timezone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-white/40 font-bold uppercase tracking-widest">{t('accountForm.brokerCurrency', settings.appLanguage)}</label>
                      <select
                        className="w-full px-4 py-3 rounded-xl border-0 bg-white/5 text-sm font-semibold outline-none focus:bg-white/10 transition-all cursor-pointer"
                        style={{ color: '#fff' }}
                        value={accountFormData.brokerCurrency}
                        onChange={e => setAccountFormData(p => ({ ...p, brokerCurrency: e.target.value }))}
                      >
                        {CURRENCIES_LIST.map(c => <option key={c.value} value={c.value} className="bg-gray-900">{c.label}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-white/40 font-bold uppercase tracking-widest">{t('accountForm.paymentCurrency', settings.appLanguage)}</label>
                      <select
                        className="w-full px-4 py-3 rounded-xl border-0 bg-white/5 text-sm font-semibold outline-none focus:bg-white/10 transition-all cursor-pointer"
                        style={{ color: '#fff' }}
                        value={accountFormData.paymentCurrency}
                        onChange={e => setAccountFormData(p => ({ ...p, paymentCurrency: e.target.value }))}
                      >
                        {CURRENCIES_LIST.map(c => <option key={c.value} value={c.value} className="bg-gray-900">{c.label}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-white/40 font-bold uppercase tracking-widest">{t('accountForm.timezone', settings.appLanguage)}</label>
                    <select
                      className="w-full px-4 py-3 rounded-xl border-0 bg-white/5 text-sm font-semibold outline-none focus:bg-white/10 transition-all cursor-pointer"
                      style={{ color: '#fff' }}
                      value={accountFormData.timezone}
                      onChange={e => setAccountFormData(p => ({ ...p, timezone: e.target.value }))}
                    >
                      {TIMEZONES_LIST.map(c => <option key={c.value} value={c.value} className="bg-gray-900">{c.label}</option>)}
                    </select>
                  </div>

                  {/* Financial Fields */}
                  <div className="pt-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                    <label className="text-[11px] text-[#00B0F0] font-black uppercase tracking-widest mb-4 block">{t('accountForm.financialParams', settings.appLanguage)}</label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-white/40 font-bold uppercase tracking-widest">{t('accountForm.initialBalance', settings.appLanguage)}</label>
                        <input
                          type="number"
                          className="w-full px-4 py-3 rounded-xl border-0 bg-white/5 text-sm font-semibold outline-none focus:bg-white/10 transition-all"
                          style={{ color: '#fff' }}
                          value={accountFormData.initialBalance === 0 ? '' : accountFormData.initialBalance}
                          onChange={e => setAccountFormData(p => ({ ...p, initialBalance: e.target.value === '' ? '' : Number(e.target.value) }))}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-white/40 font-bold uppercase tracking-widest">{t('accountForm.consistency', settings.appLanguage)}</label>
                        <input
                          type="number"
                          className="w-full px-4 py-3 rounded-xl border-0 bg-white/5 text-sm font-semibold outline-none focus:bg-white/10 transition-all"
                          style={{ color: '#fff' }}
                          value={accountFormData.consistencyTarget === 0 ? '' : accountFormData.consistencyTarget}
                          onChange={e => setAccountFormData(p => ({ ...p, consistencyTarget: e.target.value === '' ? '' : Number(e.target.value) }))}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-white/40 font-bold uppercase tracking-widest">{t('accountForm.profitSplit', settings.appLanguage)}</label>
                        <input
                          type="number"
                          className="w-full px-4 py-3 rounded-xl border-0 bg-white/5 text-sm font-semibold outline-none focus:bg-white/10 transition-all"
                          style={{ color: '#fff' }}
                          value={accountFormData.profitSplit === 0 ? '' : accountFormData.profitSplit}
                          onChange={e => setAccountFormData(p => ({ ...p, profitSplit: e.target.value === '' ? '' : Number(e.target.value) }))}
                        />
                      </div>
                    </div>

                    {/* Fields with Toggles */}
                    <div className="space-y-4 mt-6">
                      {[
                        { key: 'dailyLossLimit', label: t('accountForm.dailyLossLimit', settings.appLanguage), toggleKey: 'dailyLossLimitType' },
                        { key: 'totalStopLoss', label: t('accountForm.totalStopLoss', settings.appLanguage), toggleKey: 'totalStopLossType' },
                      ].map(({ key, label, toggleKey }) => (
                        <div key={key}>
                          <div className="flex justify-between items-end mb-2">
                            <label className="text-[10px] text-white/40 font-bold uppercase tracking-widest">{label}</label>
                            <div className="flex bg-white/5 rounded-lg p-0.5 border border-white/10">
                              <button
                                type="button"
                                onClick={() => setAccountFormData(p => ({ ...p, [toggleKey]: '$' }))}
                                className={`px-2 py-0.5 text-[9px] font-bold rounded transition-all ${accountFormData[toggleKey] === '$' ? 'bg-[#00B0F0] text-white' : 'text-white/30 hover:text-white'}`}
                              >$</button>
                              <button
                                type="button"
                                onClick={() => setAccountFormData(p => ({ ...p, [toggleKey]: '%' }))}
                                className={`px-2 py-0.5 text-[9px] font-bold rounded transition-all ${accountFormData[toggleKey] === '%' ? 'bg-[#00B0F0] text-white' : 'text-white/30 hover:text-white'}`}
                              >%</button>
                            </div>
                          </div>
                          <input
                            type="number"
                            className="w-full px-4 py-3 rounded-xl border-0 bg-white/5 text-sm font-semibold outline-none focus:bg-white/10 transition-all"
                            style={{ color: '#fff' }}
                            value={accountFormData[key] === 0 ? '' : accountFormData[key]}
                            onChange={e => setAccountFormData(p => ({ ...p, [key]: e.target.value === '' ? '' : Number(e.target.value) }))}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Import Configuration */}
                  {/* Checkbox: Corretagem Fixa por Contrato */}
                  <div className="pt-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                    <label className="flex items-center gap-2 cursor-pointer mb-3">
                      <input
                        type="checkbox"
                        checked={accountFormData.isFixedFee ?? false}
                        onChange={e => setAccountFormData(p => ({ ...p, isFixedFee: e.target.checked }))}
                        className="w-4 h-4 rounded appearance-none border border-white/20 bg-white/5 checked:bg-[#00B0F0] checked:border-transparent transition-all outline-none"
                      />
                      <span className="text-sm font-semibold text-white/80">Corretagem Fixa por Contrato/Lote</span>
                    </label>
                    {(accountFormData.isFixedFee) && (
                      <div className="space-y-1.5 mb-3">
                        <div className="flex justify-between items-end">
                          <label className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Valor da Taxa (Fee) por Contrato</label>
                          <div className="flex bg-white/5 rounded-lg p-0.5 border border-white/10">
                            <button
                              type="button"
                              onClick={() => setAccountFormData(p => ({ ...p, feeType: '$' }))}
                              className={`px-2 py-0.5 text-[9px] font-bold rounded transition-all ${accountFormData.feeType === '$' ? 'bg-[#00B0F0] text-white' : 'text-white/30 hover:text-white'}`}
                            >$</button>
                            <button
                              type="button"
                              onClick={() => setAccountFormData(p => ({ ...p, feeType: '%' }))}
                              className={`px-2 py-0.5 text-[9px] font-bold rounded transition-all ${accountFormData.feeType === '%' ? 'bg-[#00B0F0] text-white' : 'text-white/30 hover:text-white'}`}
                            >%</button>
                          </div>
                        </div>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="ex: 2.50"
                          className="w-full px-4 py-3 rounded-xl border-0 bg-white/5 text-sm font-semibold outline-none focus:bg-white/10 transition-all"
                          style={{ color: '#fff' }}
                          value={accountFormData.feePerContract || ''}
                          onChange={e => setAccountFormData(p => ({ ...p, feePerContract: e.target.value === '' ? 0 : Number(e.target.value) }))}
                        />
                        <p className="text-[10px] text-white/30">Este valor será multiplicado pela quantidade (qty) automaticamente ao importar.</p>
                      </div>
                    )}
                  </div>
                  <AccountMappingPanel
                    enableCsv={accountFormData.enableCsv}
                    onEnableCsvChange={v => setAccountFormData(p => ({ ...p, enableCsv: v }))}
                    csvMapping={typeof accountFormData.csvMapping === 'object' && !Array.isArray(accountFormData.csvMapping) ? accountFormData.csvMapping : {}}
                    onCsvMappingChange={v => setAccountFormData(p => ({ ...p, csvMapping: v }))}
                    enablePaste={accountFormData.enablePaste}
                    onEnablePasteChange={v => setAccountFormData(p => ({ ...p, enablePaste: v }))}
                    pasteMapping={Array.isArray(accountFormData.pasteMapping) ? accountFormData.pasteMapping : []}
                    onPasteMappingChange={v => setAccountFormData(p => ({ ...p, pasteMapping: v }))}
                    isFixedFee={accountFormData.isFixedFee ?? false}
                  />
                </div>
                <div className="px-5 py-5 flex gap-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                  <button
                    onClick={() => setIsAccountFormOpen(false)}
                    className="flex-1 py-3 rounded-xl border border-white/10 text-sm font-bold text-white/40 hover:bg-white/5 transition-all"
                  >{t('accountForm.cancel', settings.appLanguage)}</button>
                  <button
                    onClick={handleSaveAccountForm}
                    className="flex-1 py-3 rounded-xl text-sm font-bold transition-all hover:brightness-110 active:scale-95 shadow-lg flex items-center justify-center gap-2"
                    style={{ backgroundColor: '#00B0F0', color: '#fff' }}
                  >
                    <Check size={18} /> {editingAccount ? t('accountForm.save', settings.appLanguage) : t('accountForm.createBtn', settings.appLanguage)}
                  </button>
                </div>
              </div>
            </div>
          </>,
          document.body
        )
      }

      {/* ===== DELETE ACCOUNT CONFIRMATION MODAL ===== */}
      {
        confirmDeleteAccountId && createPortal(
          <>
            <div className="fixed inset-0 z-[199] bg-black/60 backdrop-blur-sm" onClick={() => setConfirmDeleteAccountId(null)} />
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
              <div
                className="w-full max-sm:max-w-[calc(100%-2rem)] max-w-sm rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.7)] border overflow-hidden"
                style={{ backgroundColor: '#111114', borderColor: 'rgba(255,255,255,0.08)' }}
                onClick={e => e.stopPropagation()}
              >
                <div className="p-6 text-center">
                  <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto mb-4">
                    <Trash2 size={24} className="text-red-400" />
                  </div>
                  <p className="text-base font-bold text-white mb-1">{t('delete.title', settings.appLanguage)}</p>
                  <p className="text-sm text-white/40 leading-relaxed">{t('delete.desc', settings.appLanguage)}</p>
                </div>
                <div className="px-5 pb-5 flex gap-3">
                  <button
                    onClick={() => setConfirmDeleteAccountId(null)}
                    className="flex-1 py-3 rounded-xl border border-white/10 text-sm font-bold text-white/40 hover:bg-white/5 transition-all"
                  >{t('delete.cancel', settings.appLanguage)}</button>
                  <button
                    onClick={() => handleDeleteAccount(confirmDeleteAccountId)}
                    className="flex-1 py-3 rounded-xl text-sm font-bold transition-all hover:bg-red-600 bg-red-500 text-white active:scale-95 shadow-lg"
                  >{t('delete.confirm', settings.appLanguage)}</button>
                </div>
              </div>
            </div>
          </>,
          document.body
        )
      }

      {/* ===== PLAN EXPIRED MODAL ===== */}
      {planExpiredStatus && <PlanExpiredModal status={planExpiredStatus} />}
    </div >
  );
}

