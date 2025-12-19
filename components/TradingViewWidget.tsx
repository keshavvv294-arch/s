import React, { useEffect, useRef, memo } from 'react';

interface TradingViewWidgetProps {
  symbol: string;
}

export const TradingViewWidget: React.FC<TradingViewWidgetProps> = memo(({ symbol }) => {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current) return;

    // Clear previous widget
    container.current.innerHTML = '';

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = `
      {
        "autosize": true,
        "symbol": "${symbol}",
        "interval": "D",
        "timezone": "Etc/UTC",
        "theme": "dark",
        "style": "1",
        "locale": "en",
        "enable_publishing": false,
        "hide_top_toolbar": false,
        "hide_legend": false,
        "save_image": false,
        "backgroundColor": "rgba(15, 23, 42, 1)",
        "gridColor": "rgba(255, 255, 255, 0.05)",
        "hide_volume": false,
        "support_host": "https://www.tradingview.com"
      }`;
    
    container.current.appendChild(script);
  }, [symbol]);

  return (
    <div className="h-[400px] w-full rounded-3xl overflow-hidden border border-white/10 shadow-2xl" ref={container} />
  );
});