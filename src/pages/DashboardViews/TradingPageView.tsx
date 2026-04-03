import React, { useEffect, useState } from 'react';
import { TrendingUp, RefreshCw, Plus, X, Trash2, Edit2 } from 'lucide-react';

declare global {
  interface Window {
    TradingView: any;
  }
}

// Popular assets with their TradingView symbol and a color accent
const ASSETS = [
  { symbol: 'BINANCE:BTCUSDT', name: 'Bitcoin', ticker: 'BTCUSDT', color: '#f97316' },
  { symbol: 'BINANCE:ETHUSDT', name: 'Ethereum', ticker: 'ETHUSDT', color: '#06b6d4' },
  { symbol: 'BINANCE:BNBUSDT', name: 'BNB', ticker: 'BNBUSDT', color: '#eab308' },
  { symbol: 'BINANCE:SOLUSDT', name: 'Solana', ticker: 'SOLUSDT', color: '#8b5cf6' },
  { symbol: 'BINANCE:XRPUSDT', name: 'XRP', ticker: 'XRPUSDT', color: '#3b82f6' },
  { symbol: 'BINANCE:ADAUSDT', name: 'Cardano', ticker: 'ADAUSDT', color: '#2563eb' },
  { symbol: 'BINANCE:DOGEUSDT', name: 'Dogecoin', ticker: 'DOGEUSDT', color: '#f59e0b' },
  { symbol: 'FX:EURUSD', name: 'EUR / USD', ticker: 'EURUSD', color: '#84cc16' },
  { symbol: 'FX:GBPUSD', name: 'GBP / USD', ticker: 'GBPUSD', color: '#10b981' },
  { symbol: 'FX:USDJPY', name: 'USD / JPY', ticker: 'USDJPY', color: '#ef4444' },
  { symbol: 'FX:USDCHF', name: 'USD / CHF', ticker: 'USDCHF', color: '#dc2626' },
  { symbol: 'FX:AUDUSD', name: 'AUD / USD', ticker: 'AUDUSD', color: '#ec4899' },
  { symbol: 'FX:USDCAD', name: 'USD / CAD', ticker: 'USDCAD', color: '#f43f5e' },
  { symbol: 'FX:NZDUSD', name: 'NZD / USD', ticker: 'NZDUSD', color: '#d946ef' },
  { symbol: 'NASDAQ:AAPL', name: 'Apple', ticker: 'AAPL', color: '#9ca3af' },
  { symbol: 'NASDAQ:MSFT', name: 'Microsoft', ticker: 'MSFT', color: '#3b82f6' },
  { symbol: 'NASDAQ:NVDA', name: 'Nvidia', ticker: 'NVDA', color: '#22c55e' },
  { symbol: 'NASDAQ:TSLA', name: 'Tesla', ticker: 'TSLA', color: '#ef4444' },
  { symbol: 'NASDAQ:AMZN', name: 'Amazon', ticker: 'AMZN', color: '#f97316' },
  { symbol: 'NASDAQ:GOOGL', name: 'Google', ticker: 'GOOGL', color: '#3b82f6' },
  { symbol: 'NYSE:KO', name: 'Coca-Cola', ticker: 'KO', color: '#dc2626' },
  { symbol: 'NYSE:JPM', name: 'JPMorgan', ticker: 'JPM', color: '#1d4ed8' },
  { symbol: 'NASDAQ:QQQ', name: 'Invesco QQQ', ticker: 'QQQ', color: '#14b8a6' },
  { symbol: 'AMEX:SPY', name: 'SPDR S&P 500', ticker: 'SPY', color: '#8b5cf6' },
  { symbol: 'AMEX:DIA', name: 'SPDR Dow Jones', ticker: 'DIA', color: '#6366f1' },
  { symbol: 'AMEX:IWM', name: 'iShares R2000', ticker: 'IWM', color: '#f43f5e' },
  { symbol: 'SP:SPX', name: 'S&P 500', ticker: 'SPX', color: '#10b981' },
  { symbol: 'NASDAQ:NDX', name: 'Nasdaq 100', ticker: 'NDX', color: '#3b82f6' },
  { symbol: 'DJ:DJI', name: 'Dow Jones', ticker: 'DJI', color: '#f59e0b' },
];

const INTERVALS = [
  { label: '1m', value: '1' }, { label: '5m', value: '5' }, { label: '15m', value: '15' },
  { label: '30m', value: '30' }, { label: '1h', value: '60' }, { label: '4h', value: '240' },
  { label: '1D', value: 'D' }, { label: '1W', value: 'W' },
];
const STYLES = [
  { label: 'Candles', value: '1' }, { label: 'Hollow', value: '9' }, { label: 'Bars', value: '0' },
  { label: 'Line', value: '2' }, { label: 'Area', value: '3' }, { label: 'Heikin Ashi', value: '8' },
];

function AssetCard({ asset, isActive, onClick, onDelete, onEdit, theme }: any) {
  const [price, setPrice] = useState<number | null>(null);
  const [change, setChange] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Ticker fallback for older formats
    const querySymbol = asset.ticker || asset.symbol.split(':')[1] || asset.symbol;
    const encode = encodeURIComponent(querySymbol);
    fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(`https://query1.finance.yahoo.com/v8/finance/chart/${encode}?interval=1d&range=2d`)}`)
      .then(r => r.json())
      .then(p => {
        const d = JSON.parse(p.contents);
        const meta = d?.chart?.result?.[0]?.meta;
        if (meta) {
          setPrice(meta.regularMarketPrice);
          setChange(((meta.regularMarketPrice - meta.previousClose) / meta.previousClose) * 100);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [asset.ticker, asset.symbol]);

  // Generate a plausible sparkline path based on change direction
  const generateSparkline = (pts: number, isPositive: boolean) => {
    let path = 'M 0,15 ';
    let lastY = 15;
    for (let i = 1; i <= pts; i++) {
      const x = (i / pts) * 40;
      let yChange = Math.random() * 6 - 3;
      if (isPositive) yChange -= 1; // trend up
      else yChange += 1; // trend down
      lastY += yChange;
      lastY = Math.max(0, Math.min(24, lastY)); // clamp
      path += `L ${x},${lastY} `;
    }
    return path;
  };

  const isPositive = (change ?? 0) >= 0;
  const displayTicker = asset.exchange ? `${asset.exchange}:${asset.symbol}` : (asset.ticker || asset.symbol);

  return (
    <button
      onClick={onClick}
      className={`group w-full text-left py-4 pl-3 pr-10 rounded-xl border transition-all cursor-pointer relative ${isActive ? 'bg-white/10 opacity-100 shadow-md' : 'opacity-70 hover:opacity-100 hover:bg-white/5'}`}
      style={{
        borderColor: theme?.contornoGeral || 'transparent',
        borderLeftWidth: 3,
        borderLeftColor: asset.color || '#eab308',
      }}
    >
      <div className="flex items-center justify-between gap-1 mb-2">
        <div className="flex flex-col min-w-0 flex-1">
          <span className="text-[12px] font-black truncate" style={{ color: theme?.textoPrincipal || '#fff' }}>{asset.name}</span>
          <span className="text-[9px] font-bold opacity-40 tracking-widest uppercase" style={{ color: theme?.textoPrincipal || '#fff' }}>{displayTicker}</span>
        </div>
      </div>

      <div className="flex items-center justify-between mt-1">
        {/* Sparkline */}
        {!loading && price !== null && (
          <div className="w-10 h-6 shrink-0 opacity-80">
            <svg width="40" height="24" viewBox="0 0 40 24" preserveAspectRatio="none">
              <path d={generateSparkline(6, isPositive)} fill="none" stroke={isPositive ? '#4ade80' : '#f87171'} strokeWidth="1.5" strokeLinejoin="round" />
            </svg>
          </div>
        )}

        <div className="flex flex-col items-end shrink-0 ml-1">
          {loading ? (
            <span className="w-3 h-3 rounded-full border border-white/20 border-t-white/80 animate-spin" />
          ) : price !== null ? (
            <>
              <span className="text-[11px] font-black" style={{ color: '#fff' }}>{price.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
              <span className={`text-[9px] font-bold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                {isPositive ? '+' : ''}{(change ?? 0).toFixed(2)}%
              </span>
            </>
          ) : (
            <span className="text-[9px] opacity-20">—</span>
          )}
        </div>
      </div>

      <div className="absolute top-0 bottom-0 right-1.5 flex flex-col justify-center gap-2">
        <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="p-1.5 rounded-full bg-blue-500/20 text-blue-500 hover:bg-blue-500 hover:text-white transition-colors" title="Edit Asset">
          <Edit2 size={11} />
        </button>
        <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-1.5 rounded-full bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-colors" title="Remove Asset">
          <Trash2 size={11} />
        </button>
      </div>
    </button>
  );
}

export default function TradingPageView({ theme, getGlassStyle }: any) {
  const [assets, setAssets] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('quantara_trading_assets');
      return saved ? JSON.parse(saved) : ASSETS;
    } catch {
      return ASSETS;
    }
  });

  useEffect(() => {
    localStorage.setItem('quantara_trading_assets', JSON.stringify(assets));
  }, [assets]);

  const [activeSymbol, setActiveSymbol] = useState(
    assets[0]?.exchange ? `${assets[0].exchange}:${assets[0].symbol}` : (assets[0]?.symbol || ASSETS[0].symbol)
  );
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [newSymbol, setNewSymbol] = useState('');
  const [newExchange, setNewExchange] = useState('');
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState('index');

  const openAddModal = () => {
    setEditingId(null);
    setNewSymbol('');
    setNewExchange('');
    setNewName('');
    setNewType('index');
    setShowAddModal(true);
  };

  const openEditModal = (asset: any) => {
    setEditingId(asset.symbol); // Unique enough for edit tracking
    const cleanedSymbol = asset.symbol.includes(':') ? asset.symbol.split(':')[1] : asset.symbol;
    setNewSymbol(cleanedSymbol);
    setNewExchange(asset.exchange || (asset.symbol.includes(':') ? asset.symbol.split(':')[0] : ''));
    setNewName(asset.name || '');
    setNewType(asset.type || 'index');
    setShowAddModal(true);
  };

  const handleAddAsset = () => {
    if (!newSymbol) return;
    
    // We should normalize symbol input. If user types "NASDAQ:NDX" in symbol, split it.
    let finalSymbol = newSymbol.toUpperCase();
    let finalExchange = newExchange.toUpperCase();
    if (finalSymbol.includes(':')) {
      [finalExchange, finalSymbol] = finalSymbol.split(':');
    }

    const tType = newType || 'index';

    const newAsset = {
      symbol: finalSymbol,
      exchange: finalExchange,
      name: newName || finalSymbol,
      type: tType,
      ticker: `${finalSymbol}`, // Store for old sparklines
      color: '#eab308'
    };

    if (editingId) {
      setAssets(prev => prev.map(a => a.symbol === editingId || a.symbol === editingId.split(':')[1] ? newAsset : a));
    } else {
      setAssets(prev => [...prev, newAsset]);
    }
    
    setShowAddModal(false);
  };

  const glassStyle = typeof getGlassStyle === 'function'
    ? getGlassStyle(theme?.fundoCards)
    : { background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(12px)' };

  useEffect(() => {
    let tvWidget: any = null;
    const dynamicContainerId = `tv_chart_container_${activeSymbol.replace(/[^a-zA-Z0-9]/g, '_')}`;
    const loadTV = () => {
       if (window.TradingView) {
         const container = document.getElementById(dynamicContainerId);
         if (container) container.innerHTML = '';

         tvWidget = new window.TradingView.widget({
           autosize: true,
           symbol: activeSymbol,
           interval: "5",
           timezone: "America/New_York",
           theme: "dark",
           style: "1",
           locale: "en",
           enable_publishing: false,
           allow_symbol_change: true,
           withdateranges: true,
           hide_side_toolbar: false,
           container_id: dynamicContainerId,
           backgroundColor: "rgba(0,0,0,0)",
           gridColor: theme?.contornoGeral || "rgba(255,255,255,0.1)"
         });
       }
    };

    if (!document.getElementById('tv-script')) {
       const script = document.createElement('script');
       script.id = 'tv-script';
       script.src = 'https://s3.tradingview.com/tv.js';
       script.async = true;
       script.onload = loadTV;
       document.body.appendChild(script);
    } else {
       loadTV();
    }
  }, [activeSymbol, theme]);

  return (
    <div
      className="flex w-full animate-tab-enter"
      style={{ background: theme.fundoGeral, height: 'calc(100vh - 80px)' }}
    >
      {/* LEFT SIDEBAR — infinite, same style as Journal */}
      <div
        className="w-16 md:w-64 self-stretch border-r shrink-0 hidden sm:flex flex-col pt-5 pb-0 px-2 md:px-4"
        style={{ ...glassStyle, borderColor: theme.contornoGeral }}
      >
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-[9px] font-bold tracking-widest uppercase px-1 opacity-40" style={{ color: theme.textoPrincipal }}>
            Favorites
          </h3>
          <button onClick={openAddModal} className="p-1.5 rounded-md hover:bg-white/10 transition-colors bg-white/5 border hidden md:block" style={{ color: theme.textoPrincipal, borderColor: theme.contornoGeral }}>
            <Plus size={12} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto hide-scrollbar flex flex-col gap-1 pb-5">
          {assets.map((asset: any) => {
            const rawTvSymbol = asset.exchange ? `${asset.exchange}:${asset.symbol}` : asset.symbol;
            return (
              <AssetCard
                key={asset.symbol + (asset.exchange || '')}
                asset={asset}
                isActive={activeSymbol === rawTvSymbol}
                onClick={() => setActiveSymbol(rawTvSymbol)}
                onDelete={() => setAssets(prev => prev.filter(a => a.symbol !== asset.symbol))}
                onEdit={() => openEditModal(asset)}
                theme={theme}
              />
            );
          })}
        </div>
      </div>

      {/* MAIN AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header with controls */}
        <div className="flex items-center gap-3 px-2 md:px-0 pt-4 pb-2 shrink-0 flex-wrap mb-2 ml-4">
          <TrendingUp size={26} className="text-yellow-500" />
          <h1 className="text-2xl md:text-3xl font-black font-display tracking-tight whitespace-nowrap" style={{ color: theme.textoPrincipal }}>
            Trading
          </h1>

          <div className="flex-1" />

          {/* Reload Chart native helper */}
          <button
            onClick={() => setActiveSymbol(activeSymbol + ' ')} // Force recreation hack if needed
            className="flex items-center justify-center p-2 rounded-lg bg-black/30 opacity-60 hover:opacity-100 transition-opacity mr-4"
            title="Reload Widget entirely"
          >
            <RefreshCw size={13} style={{ color: theme.textoPrincipal }} />
          </button>
        </div>

        {/* TradingView Chart */}
        <div
          key={activeSymbol}
          className="flex-1 mx-4 mb-4 rounded-2xl overflow-hidden shadow-sm"
          style={{ border: `1px solid ${theme.contornoGeral}`, minHeight: '600px', position: 'relative', background: 'rgba(0,0,0,0.5)' }}
          id={`tv_chart_container_${activeSymbol.replace(/[^a-zA-Z0-9]/g, '_')}`}
        >
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="rounded-2xl p-6 w-full max-w-sm flex flex-col gap-4 border shadow-2xl animate-fade-in" style={{ ...glassStyle, borderColor: theme.contornoGeral, background: theme.fundoGeral }}>
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-sm font-bold uppercase tracking-widest" style={{ color: theme.textoPrincipal }}>{editingId ? 'Edit Chart' : 'Add Chart'}</h2>
              <button onClick={() => setShowAddModal(false)} className="opacity-50 hover:opacity-100 transition-colors" style={{ color: theme.textoPrincipal }}><X size={16}/></button>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase tracking-widest opacity-50" style={{ color: theme.textoPrincipal }}>Symbol <span className="text-red-500">*</span></label>
                <input value={newSymbol} onChange={e=>setNewSymbol(e.target.value)} placeholder="NDX" className="bg-black/30 p-2.5 rounded-lg border outline-none text-xs font-bold font-mono focus:border-yellow-500/50" style={{ borderColor: theme.contornoGeral, color: theme.textoPrincipal }} />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase tracking-widest opacity-50" style={{ color: theme.textoPrincipal }}>Exchange <span className="text-red-500">*</span></label>
                <input value={newExchange} onChange={e=>setNewExchange(e.target.value)} placeholder="NASDAQ" className="bg-black/30 p-2.5 rounded-lg border outline-none text-xs font-bold font-mono focus:border-yellow-500/50" style={{ borderColor: theme.contornoGeral, color: theme.textoPrincipal }} />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase tracking-widest opacity-50" style={{ color: theme.textoPrincipal }}>Name</label>
              <input value={newName} onChange={e=>setNewName(e.target.value)} placeholder="Nasdaq 100" className="bg-black/30 p-2.5 rounded-lg border outline-none text-xs font-bold focus:border-yellow-500/50" style={{ borderColor: theme.contornoGeral, color: theme.textoPrincipal }} />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase tracking-widest opacity-50" style={{ color: theme.textoPrincipal }}>Type</label>
              <select value={newType} onChange={e=>setNewType(e.target.value)} className="bg-black/30 p-2.5 rounded-lg border outline-none text-xs font-bold focus:border-yellow-500/50" style={{ borderColor: theme.contornoGeral, color: theme.textoPrincipal, WebkitAppearance: 'none' }}>
                <option value="index">Index</option>
                <option value="crypto">Crypto</option>
                <option value="stock">Stock</option>
                <option value="forex">Forex</option>
              </select>
            </div>

            <button onClick={handleAddAsset} className="mt-2 w-full py-3 rounded-xl font-bold text-black uppercase tracking-widest text-xs transition-transform active:scale-95 shadow-[0_0_15px_rgba(234,179,8,0.3)]" style={{ background: '#eab308' }}>{editingId ? 'Save Changes' : 'Insert Chart'}</button>
          </div>
        </div>
      )}
    </div>
  );
}
