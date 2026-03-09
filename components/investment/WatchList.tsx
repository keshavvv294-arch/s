import React from 'react';
import { Eye, Trash2, ArrowUpRight } from 'lucide-react';
import { Asset } from '../../types';

interface WatchListProps {
  assets: Asset[];
  onDeleteAsset: (id: string) => void;
  onAnalyzeAsset: (asset: Asset) => void;
  isLiveMode: boolean;
  privacyMode: boolean;
}

export const WatchList: React.FC<WatchListProps> = ({ assets, onDeleteAsset, onAnalyzeAsset, isLiveMode, privacyMode }) => {
  return (
    <div className="h-full flex flex-col">
      <h3 className="text-white font-bold mb-4 px-2 flex items-center gap-2 uppercase tracking-wider text-xs opacity-60">
         <Eye className="w-4 h-4 text-indigo-400" /> Watchlist
      </h3>
      
      <div className="space-y-3 overflow-y-auto custom-scrollbar flex-1 pr-2">
        {assets.map(asset => (
          <div 
            key={asset.id}
            onClick={() => onAnalyzeAsset(asset)}
            className="glass-card p-3 rounded-xl flex justify-between items-center hover:bg-white/5 cursor-pointer border border-transparent hover:border-indigo-500/30 transition-all group relative overflow-hidden"
          >
            <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-indigo-500/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 pointer-events-none`}></div>
            
            <div className="flex items-center gap-3 relative z-10">
               <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/60 border border-white/5 group-hover:border-indigo-500/20 transition-colors">
                  <span className="text-[10px] font-bold uppercase">{asset.symbol.slice(0, 2)}</span>
               </div>
               <div>
                  <p className="font-bold text-sm text-white group-hover:text-indigo-300 transition-colors">{asset.name}</p>
                  <p className="text-[10px] text-white/40 font-mono">{asset.symbol}</p>
               </div>
            </div>
            
            <div className="text-right relative z-10">
               <p className={`font-bold text-sm font-mono tracking-tight transition-colors duration-300 ${isLiveMode ? 'text-emerald-300' : 'text-white'} ${privacyMode ? 'blur-sm select-none' : ''}`}>
                  ${asset.value.toFixed(2)}
               </p>
               <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button 
                    onClick={(e) => { e.stopPropagation(); onDeleteAsset(asset.id); }}
                    className="text-[10px] text-rose-400 hover:text-rose-300 hover:underline transition-colors flex items-center gap-1"
                  >
                     <Trash2 className="w-3 h-3" /> Remove
                  </button>
               </div>
            </div>
          </div>
        ))}

        {assets.length === 0 && (
           <div className="text-center text-white/20 py-10 flex flex-col items-center justify-center gap-2 border border-dashed border-white/5 rounded-xl">
              <Eye className="w-6 h-6 opacity-50" />
              <p className="text-xs">No items in watchlist.</p>
           </div>
        )}
      </div>
    </div>
  );
};
