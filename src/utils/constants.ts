export const CURRENCIES_LIST = [
  { value: 'USD', label: 'USD - US Dollar' },
  { value: 'BRL', label: 'BRL - Brazilian Real' },
  { value: 'EUR', label: 'EUR - Euro' },
  { value: 'GBP', label: 'GBP - British Pound' },
  { value: 'JPY', label: 'JPY - Japanese Yen' },
  { value: 'AUD', label: 'AUD - Australian Dollar' },
  { value: 'CAD', label: 'CAD - Canadian Dollar' },
  { value: 'CHF', label: 'CHF - Swiss Franc' },
  { value: 'CNY', label: 'CNY - Chinese Yuan' },
  { value: 'INR', label: 'INR - Indian Rupee' },
  { value: 'MXN', label: 'MXN - Mexican Peso' },
  { value: 'ZAR', label: 'ZAR - South African Rand' }
];

export const TIMEZONES_LIST = [
  { value: 'Pacific/Honolulu', label: 'UTC-10:00 (Hawaii Time)' },
  { value: 'America/Anchorage', label: 'UTC-09:00 (Alaska Time)' },
  { value: 'America/Los_Angeles', label: 'UTC-08:00 (Pacific Time)' },
  { value: 'America/Denver', label: 'UTC-07:00 (Mountain Time)' },
  { value: 'America/Chicago', label: 'UTC-06:00 (Central Time)' },
  { value: 'America/New_York', label: 'UTC-05:00 (Eastern Time/EST)' },
  { value: 'America/Sao_Paulo', label: 'UTC-03:00 (Brasilia Time)' },
  { value: 'UTC', label: 'UTC+00:00 (Coordinated Universal Time)' },
  { value: 'Europe/London', label: 'UTC+00:00 (London/GMT)' },
  { value: 'Europe/Berlin', label: 'UTC+01:00 (Central European Time)' },
  { value: 'Europe/Moscow', label: 'UTC+03:00 (Moscow Standard Time)' },
  { value: 'Asia/Dubai', label: 'UTC+04:00 (Gulf Standard Time)' },
  { value: 'Asia/Kolkata', label: 'UTC+05:30 (India Standard Time)' },
  { value: 'Asia/Shanghai', label: 'UTC+08:00 (China Standard Time)' },
  { value: 'Asia/Tokyo', label: 'UTC+09:00 (Japan Standard Time)' },
  { value: 'Australia/Sydney', label: 'UTC+10:00 (Australian Eastern)' }
];

export const generateId = () => crypto.randomUUID();

export const hexToRgba = (hex: string, opacity: number) => {
  let h = hex.replace('#', '');
  if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

export const DEFAULT_ACCOUNT_SETTINGS = {
  initialBalance: 50000,
  feePerTrade: 2.04,
  dailyLossLimit: 1000,
  totalStopLoss: 2000,
  consistencyTarget: 30,
  profitSplit: 80,
  brokerCurrency: 'USD',
  paymentCurrency: 'BRL',
  referenceTimezone: 'America/New_York',
  feeType: '$',
  dailyLossLimitType: '$',
  totalStopLossType: '$'
};

export const DEFAULT_SETTINGS = {
  appLanguage: 'en',
  dateFormat: 'BR',
  // Financial params below kept for backward compatibility but are now per-account
  initialBalance: 50000,
  feePerTrade: 2.04,
  dailyLossLimit: 1000,
  totalStopLoss: 2000,
  consistencyTarget: 30,
  profitSplit: 80,
  borderWidthGeral: 1,
  borderWidthHoje: 2,
  borderWidthFeriado: 2,
  borderWidthPositivo: 1,
  borderWidthNegativo: 1,
  enableGlassEffect: true,
  cardOpacity: 85,
  glassBlur: 10,
  enableGradient: false,
  gradientType: 'linear',
  gradientAngle: 180,
  dashboardLayout: 'layout1'
};

export const DEFAULT_THEME = {
  fundoPrincipal: '#09090b', fundoMenu: '#0c0c0e', fundoCards: '#111114',
  fundoDiaPositivo: '#0d1f1b',
  fundoDiaNegativo: '#29181a',
  contornoGeral: '#1f1f23', contornoHoje: '#EAB308', contornoFeriado: '#EC4899', contornoPositivo: '#1A8754', contornoNegativo: '#FF5050',
  textoPrincipal: '#ffffff', textoSecundario: '#a1a1aa', textoPositivo: '#1A8754', textoNegativo: '#FF5050', textoAlerta: '#f97316', linhaGrafico: '#00B0F0',
  backgroundImage: '',
  gradColor1: '#1e3a8a', gradColor2: '#0f172a', gradColor3: '#020617'
};

export const THEME_GROUPS = [
  { name: 'Background Colors', keys: ['fundoPrincipal', 'fundoMenu', 'fundoCards', 'fundoDiaPositivo', 'fundoDiaNegativo'] },
  { name: 'Text Colors', keys: ['textoPrincipal', 'textoSecundario', 'textoPositivo', 'textoNegativo', 'textoAlerta'] },
  { name: 'Borders and Highlights', keys: ['contornoGeral', 'contornoHoje', 'contornoFeriado', 'contornoPositivo', 'contornoNegativo', 'linhaGrafico'] }
];