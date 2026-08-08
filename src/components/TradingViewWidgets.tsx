import React, { useEffect, useRef } from 'react';

interface TradingViewWidgetProps {
  lang?: string;
  theme?: 'dark' | 'light';
  height?: string | number;
}

/**
 * Official TradingView Realtime Economic Calendar Widget
 * Zero CORS issues, zero API keys, real-time live events with impact, forecast & actual values.
 * Supports PT (br), ES (es), and EN (en).
 */
export const TradingViewEconomicCalendar: React.FC<TradingViewWidgetProps & { countryFilter?: string; importanceFilter?: string }> = ({
  lang = 'en',
  height = '100%',
  countryFilter = 'us,eu,gb,jp,br',
  importanceFilter = '0,1'
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Clear previous widget
    container.innerHTML = '';

    const locale = lang === 'pt' ? 'br' : lang === 'es' ? 'es' : 'en';

    const widgetDiv = document.createElement('div');
    widgetDiv.className = 'tradingview-widget-container__widget';
    widgetDiv.style.height = '100%';
    widgetDiv.style.width = '100%';

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-events.js';
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = JSON.stringify({
      colorTheme: 'dark',
      isTransparent: true,
      width: '100%',
      height: '100%',
      locale: locale,
      importanceFilter: importanceFilter,
      countryFilter: countryFilter
    });

    container.appendChild(widgetDiv);
    container.appendChild(script);

    return () => {
      if (container) {
        container.innerHTML = '';
      }
    };
  }, [lang, countryFilter, importanceFilter]);

  return (
    <div 
      className="tradingview-widget-container w-full h-full overflow-hidden rounded-xl" 
      style={{ height: typeof height === 'number' ? `${height}px` : height, minHeight: '220px' }} 
      ref={containerRef}
    >
      <div className="tradingview-widget-container__widget" style={{ height: '100%', width: '100%' }} />
    </div>
  );
};

/**
 * Official TradingView Realtime Market News Timeline Widget
 * Real-time breaking market headlines from Reuters, Bloomberg, TradingView, CNBC.
 */
export const TradingViewMarketNews: React.FC<TradingViewWidgetProps & { feedMode?: 'all_symbols' | 'market' | 'symbol' }> = ({
  lang = 'en',
  height = '100%',
  feedMode = 'all_symbols'
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.innerHTML = '';

    const locale = lang === 'pt' ? 'br' : lang === 'es' ? 'es' : 'en';

    const widgetDiv = document.createElement('div');
    widgetDiv.className = 'tradingview-widget-container__widget';
    widgetDiv.style.height = '100%';
    widgetDiv.style.width = '100%';

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-timeline.js';
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = JSON.stringify({
      feedMode: feedMode,
      isTransparent: true,
      displayMode: 'regular',
      width: '100%',
      height: '100%',
      colorTheme: 'dark',
      locale: locale
    });

    container.appendChild(widgetDiv);
    container.appendChild(script);

    return () => {
      if (container) {
        container.innerHTML = '';
      }
    };
  }, [lang, feedMode]);

  return (
    <div 
      className="tradingview-widget-container w-full h-full overflow-hidden rounded-xl" 
      style={{ height: typeof height === 'number' ? `${height}px` : height, minHeight: '260px' }} 
      ref={containerRef}
    >
      <div className="tradingview-widget-container__widget" style={{ height: '100%', width: '100%' }} />
    </div>
  );
};
