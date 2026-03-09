import React from 'react';
import { Bitcoin, Building, Coins, TrendingUp, Trash2, ArrowUpRight } from 'lucide-react';
import { Asset } from '../../types';

interface AssetListProps {
  assets: Asset[];
  onDeleteAsset: (id: string) => void;
  onAnalyzeAsset: (asset: Asset) => void;
  isLiveMode: boolean;
  privacyMode: boolean;
}

export const AssetList: React.FC<AssetListProps> = ({ assets, onDeleteAsset, onAnalyzeAsset, isLiveMode, privacyMode }) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'crypto': return <Bitcoin className="w-5 h-5" />;
      case 'real-estate': return <Building className="w-5 h-5" />;
      case 'gold': return <Coins className="w-5 h-5" />;
      default: return <TrendingUp className="w-5 h-5" />;
    }
  };

  return (
    <div className="h-full flex flex-col">
      <h3 className="text-white font-bold mb-4 px-2 flex items-center justify-between uppercase tracking-wider text-xs opacity-60">
         <span>Your Holdings</span>
         <span className="font-normal">{assets.length} assets</span>
      </h3>
      
      <div className="space-y-3 overflow-y-auto custom-scrollbar flex-1 pr-2">
        {assets.map(asset => (
          <div 
            key={asset.id} 
            onClick={() => onAnalyzeAsset(asset)}
            className="glass-card p-4 rounded-2xl flex justify-between items-center hover:bg-white/5 cursor-pointer transition-all group border border-transparent hover:border-white/10 relative overflow-hidden"
          >
            <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 pointer-events-none`}></div>
            
            <div className="flex items-center gap-4 relative z-10">
               <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors duration-300 ${isLiveMode ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-white/5 text-white/60 border border-white/5'}`}>
                  {getIcon(asset.type)}
               </div>
               <div>
                  <div className="flex items-center gap-2">
                     <h4 className="font-bold text-white text-sm group-hover:text-indigo-300 transition-colors">{asset.name}</h4>
                     <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-white/40 border border-white/5 font-mono">{asset.symbol || 'N/A'}</span>
                  </div>
                  <p className="text-xs text-white/40 mt-0.5 font-mono">
                     {asset.amount} units @ ${privacyMode ? '••••' : asset.value.toFixed(2)}
                  </p>
               </div>
            </div>
            
            <div className="text-right relative z-10">
               <p className={`font-bold text-lg font-mono tracking-tight transition-colors duration-300 ${isLiveMode ? 'text-emerald-300' : 'text-white'} ${privacyMode ? 'blur-sm select-none' : ''}`}>
                  ${(asset.amount * asset.value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
               </p>
               <p className={`text-[10px] font-mono ${asset.value >= asset.purchasePrice ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {asset.value >= asset.purchasePrice ? '+' : ''}{((asset.value - asset.purchasePrice) * asset.amount).toFixed(2)}
               </p>
               <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button 
                    onClick={(e) => { e.stopPropagation(); onDeleteAsset(asset.id); }}
                    className="p-1.5 rounded-full hover:bg-rose-500/20 text-white/20 hover:text-rose-400 transition-all"
                    title="Sell Asset"
                  >
                     <Trash2 className="w-3 h-3" />
                  </button>
                  <ArrowUpRight className="w-3 h-3 text-white/20" />
               </div>
            </div>
          </div>
        ))}

        {assets.length === 0 && (
           <div className="text-center py-12 border-2 border-dashed border-white/5 rounded-3xl flex flex-col items-center justify-center gap-3 group hover:border-white/10 transition-colors">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-white/20 group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="w-6 h-6" />
              </div>
              <p className="text-white/40 font-medium text-sm">Your portfolio is empty.</p>
              <p className="text-white/20 text-xs max-w-[200px]">Use the AI Scanner to add your first asset.</p>
           </div>
        )}
      </div>
    </div>
  );
};
