import React, { useState, useEffect } from 'react';
import { X, BrainCircuit, Loader2, Activity } from 'lucide-react';
import { Asset } from '../../types';
import { TradingViewWidget } from '../TradingViewWidget';
import ReactMarkdown from 'react-markdown';
import { getMarketAnalysis } from '../../services/geminiService';

interface AssetDetailModalProps {
  asset: Asset;
  onClose: () => void;
  privacyMode: boolean;
}

export const AssetDetailModal: React.FC<AssetDetailModalProps> = ({ asset, onClose, privacyMode }) => {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    const fetchAnalysis = async () => {
      setAnalysis(null);
      setIsAnalyzing(true);
      try {
        const text = await getMarketAnalysis(asset.symbol, asset.name);
        setAnalysis(text);
      } catch {
        setAnalysis("Could not load analysis.");
      } finally {
        setIsAnalyzing(false);
      }
    };
    fetchAnalysis();
  }, [asset]);

  return (
    <div className="fixed inset-0 bg-[#0f172a]/95 backdrop-blur-xl z-50 overflow-y-auto animate-in fade-in duration-300">
      <div className="min-h-screen p-4 md:p-8 max-w-6xl mx-auto flex flex-col">
         
         {/* Modal Header */}
         <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 text-indigo-400 font-bold text-xl shadow-[0_0_20px_rgba(99,102,241,0.2)]">
                  {asset.symbol.slice(0, 2)}
               </div>
               <div>
                  <h2 className="text-3xl font-bold text-white tracking-tight">{asset.name}</h2>
                  <div className="flex items-center gap-2 mt-1">
                     <span className="text-xs font-mono text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">{asset.symbol}</span>
                     <span className="text-xs text-white/40 uppercase tracking-wider font-bold">{asset.type}</span>
                  </div>
               </div>
            </div>
            <button 
              onClick={onClose} 
              className="p-3 bg-white/5 rounded-full hover:bg-white/10 transition-all border border-white/5 hover:border-white/20 group"
            >
               <X className="w-6 h-6 text-white/60 group-hover:text-white transition-colors" />
            </button>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
            {/* Chart Section */}
            <div className="lg:col-span-2 flex flex-col gap-6">
               <div className="glass-card rounded-3xl overflow-hidden border border-white/5 shadow-2xl shadow-black/50 h-[500px] relative group">
                  <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none"></div>
                  {asset.symbol && asset.symbol !== 'N/A' ? (
                     <TradingViewWidget symbol={asset.symbol} />
                  ) : (
                     <div className="h-full w-full flex flex-col items-center justify-center text-white/30 gap-4">
                        <div className="w-16 h-16 rounded-full border-2 border-dashed border-white/10 flex items-center justify-center">
                           <Activity className="w-6 h-6 opacity-50" />
                        </div>
                        <p className="font-medium">Chart unavailable for this asset type</p>
                     </div>
                  )}
               </div>
            </div>

            {/* Analysis Section */}
            <div className="lg:col-span-1 space-y-6 flex flex-col">
               {/* Holdings Card */}
               {!asset.isWatchlist && (
                 <div className="glass-card p-6 rounded-3xl border border-white/5 bg-gradient-to-br from-white/5 to-transparent relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-10 -mt-10 transition-opacity duration-500 opacity-50 group-hover:opacity-100"></div>
                    
                    <p className="text-xs text-white/40 font-bold uppercase tracking-wider mb-2">Your Position</p>
                    <h3 className={`text-4xl font-bold text-white tracking-tight mb-6 ${privacyMode ? 'blur-md select-none' : ''}`}>
                       ${(asset.amount * asset.value).toLocaleString()}
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm relative z-10">
                       <div className="bg-black/20 p-3 rounded-xl border border-white/5">
                          <p className="text-[10px] text-white/40 uppercase font-bold mb-1">Quantity</p>
                          <p className="text-white font-mono text-lg">{asset.amount}</p>
                       </div>
                       <div className="bg-black/20 p-3 rounded-xl border border-white/5">
                          <p className="text-[10px] text-white/40 uppercase font-bold mb-1">Avg. Price</p>
                          <p className="text-white font-mono text-lg">${asset.value.toFixed(2)}</p>
                       </div>
                    </div>
                 </div>
               )}

               {/* AI Insight */}
               <div className="glass-card rounded-3xl p-6 flex-1 min-h-[300px] border border-indigo-500/20 bg-gradient-to-b from-indigo-900/10 to-transparent relative overflow-hidden flex flex-col">
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
                     <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400 border border-indigo-500/30 shadow-[0_0_10px_rgba(99,102,241,0.3)]">
                        <BrainCircuit className="w-4 h-4" />
                     </div>
                     <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                        AI Market Insights
                     </h3>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                     {isAnalyzing ? (
                        <div className="flex flex-col items-center justify-center h-full gap-4 text-white/50">
                           <div className="relative">
                              <div className="w-12 h-12 rounded-full border-2 border-indigo-500/30 border-t-indigo-500 animate-spin"></div>
                              <div className="absolute inset-0 flex items-center justify-center">
                                 <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
                              </div>
                           </div>
                           <p className="text-xs font-medium tracking-wider animate-pulse">ANALYZING MARKET DATA...</p>
                        </div>
                     ) : (
                        <div className="prose prose-invert prose-sm text-white/80 leading-relaxed font-light">
                           <ReactMarkdown>{analysis || "No analysis available."}</ReactMarkdown>
                        </div>
                     )}
                  </div>
               </div>
            </div>
         </div>

      </div>
    </div>
  );
};
