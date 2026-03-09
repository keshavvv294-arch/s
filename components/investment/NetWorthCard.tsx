import React from 'react';
import { Wallet, Activity, RefreshCw, Fuel, TrendingUp } from 'lucide-react';

interface NetWorthCardProps {
  totalWealth: number;
  isLiveMode: boolean;
  setIsLiveMode: (mode: boolean) => void;
  isSyncing: boolean;
  handleSyncPrices: () => void;
  ownedAssetsCount: number;
  gasFee: number;
  privacyMode: boolean;
}

export const NetWorthCard: React.FC<NetWorthCardProps> = ({
  totalWealth,
  isLiveMode,
  setIsLiveMode,
  isSyncing,
  handleSyncPrices,
  ownedAssetsCount,
  gasFee,
  privacyMode
}) => {
  return (
    <div className="glass-card rounded-3xl p-8 relative overflow-hidden transition-all duration-500 group h-full border border-white/5 hover:border-white/10 shadow-2xl shadow-black/50">
      {/* Background Effects */}
      <div className={`absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-10 -mt-10 transition-opacity duration-1000 ${isLiveMode ? 'opacity-100 animate-pulse' : 'opacity-30'}`}></div>
      <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black/40 to-transparent pointer-events-none"></div>
      
      <div className="relative z-10 flex flex-col h-full justify-between">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-sm font-medium text-white/50 flex items-center gap-2 uppercase tracking-wider">
             <Wallet className="w-4 h-4" /> Total Portfolio
          </h2>
          <div className="flex gap-2">
            <button 
               onClick={() => setIsLiveMode(!isLiveMode)}
               className={`p-2 rounded-full transition-all border ${isLiveMode ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'bg-white/5 text-white/40 border-transparent hover:text-white hover:bg-white/10'}`}
               title={isLiveMode ? "Live Simulation Active" : "Enable Live Simulation"}
             >
               <Activity className="w-4 h-4" />
             </button>
             <button 
               onClick={handleSyncPrices}
               disabled={isSyncing}
               className={`p-2 rounded-full bg-white/5 text-white/40 border border-transparent hover:text-white hover:bg-white/10 transition-all ${isSyncing ? 'animate-spin text-indigo-400' : ''}`}
               title="Sync Real Prices"
             >
               <RefreshCw className="w-4 h-4" />
             </button>
          </div>
        </div>
        
        {/* Main Value */}
        <div className="space-y-1">
          <h1 className={`text-5xl md:text-6xl font-bold text-white tracking-tight transition-all duration-300 ${privacyMode ? 'blur-md select-none' : ''}`}>
            ${totalWealth.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h1>
          <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium">
            <TrendingUp className="w-4 h-4" />
            <span>+2.4% Today</span>
            <span className="text-white/20">•</span>
            <span className="text-white/40">Realized PnL: +$1,240.50</span>
          </div>
        </div>
        
        {/* Footer Metrics */}
        <div className="mt-6 flex gap-3 flex-wrap">
           <div className="px-3 py-1.5 rounded-lg bg-white/5 text-white/60 text-xs font-medium border border-white/5 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
              {ownedAssetsCount} Assets Held
           </div>
           <div className="px-3 py-1.5 rounded-lg bg-orange-500/10 text-orange-400 text-xs font-medium border border-orange-500/20 flex items-center gap-1.5">
              <Fuel className="w-3 h-3" /> 
              <span>{gasFee.toFixed(0)} Gwei</span>
           </div>
        </div>
      </div>
    </div>
  );
};
