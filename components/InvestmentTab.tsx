
import React, { useState, useEffect } from 'react';
import { Search, Loader2, Plus, TrendingUp, Wallet, Activity, RefreshCw, Bitcoin, Building, Coins, Trash2, ArrowUpRight, PieChart as PieChartIcon, Newspaper, Eye, Fuel, X, BrainCircuit } from 'lucide-react';
import { Asset, ASSET_TYPES } from '../types';
import { lookupAssetSymbol, getMarketAnalysis, getLatestAssetPrice } from '../services/geminiService';
import { TradingViewWidget } from './TradingViewWidget';
import ReactMarkdown from 'react-markdown';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { CustomizableLayout } from './CustomizableLayout';

interface InvestmentTabProps {
  assets: Asset[];
  onAddAsset: (asset: Asset) => void;
  onDeleteAsset: (id: string) => void;
  onUpdateAssetValue: (id: string, newValue: number) => void;
  privacyMode: boolean;
}

export const InvestmentTab: React.FC<InvestmentTabProps> = ({ assets, onAddAsset, onDeleteAsset, onUpdateAssetValue, privacyMode }) => {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [foundAsset, setFoundAsset] = useState<{symbol: string, name: string, type: string} | null>(null);
  const [amountToAdd, setAmountToAdd] = useState('');
  const [priceToAdd, setPriceToAdd] = useState('');
  const [addToWatchlist, setAddToWatchlist] = useState(false);
  
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [gasFee, setGasFee] = useState(35); // Simulated Gwei

  const ownedAssets = assets.filter(a => !a.isWatchlist);
  const watchlistAssets = assets.filter(a => a.isWatchlist);

  // Total Wealth Calculation
  const totalWealth = ownedAssets.reduce((sum, asset) => sum + (asset.amount * asset.value), 0);

  // Allocation Data
  const allocationData = ownedAssets.reduce((acc, asset) => {
    const existing = acc.find(i => i.name === ASSET_TYPES[asset.type]);
    const value = asset.amount * asset.value;
    if(existing) existing.value += value;
    else acc.push({ name: ASSET_TYPES[asset.type], value });
    return acc;
  }, [] as {name: string, value: number}[]);

  const COLORS = ['#6366f1', '#14b8a6', '#f59e0b', '#ec4899', '#8b5cf6'];

  // Live Mode Simulation
  useEffect(() => {
    if (!isLiveMode) return;
    const interval = setInterval(() => {
      assets.forEach(asset => {
        const fluctuation = 1 + (Math.random() * 0.004 - 0.002); 
        onUpdateAssetValue(asset.id, asset.value * fluctuation);
      });
      setGasFee(prev => Math.max(10, Math.min(100, prev + (Math.random() * 10 - 5))));
    }, 3000);
    return () => clearInterval(interval);
  }, [isLiveMode, assets, onUpdateAssetValue]);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setIsSearching(true);
    setFoundAsset(null);
    try {
      const result = await lookupAssetSymbol(query);
      setFoundAsset(result);
      const price = await getLatestAssetPrice(result.name);
      if (price) setPriceToAdd(price.toString());
    } catch (e) {
      console.error(e);
    } finally {
      setIsSearching(false);
    }
  };

  const handleConfirmAdd = () => {
    if (foundAsset && priceToAdd) {
      onAddAsset({
        id: Date.now().toString(),
        name: foundAsset.name,
        symbol: foundAsset.symbol,
        type: foundAsset.type.toLowerCase() as any,
        amount: addToWatchlist ? 0 : parseFloat(amountToAdd) || 0,
        value: parseFloat(priceToAdd),
        currency: 'USD',
        isWatchlist: addToWatchlist
      });
      setFoundAsset(null);
      setQuery('');
      setAmountToAdd('');
      setPriceToAdd('');
      setAddToWatchlist(false);
    }
  };

  const handleSyncPrices = async () => {
    setIsSyncing(true);
    for (const asset of assets) {
      if (['stock', 'crypto', 'gold'].includes(asset.type)) {
         const newPrice = await getLatestAssetPrice(asset.name);
         if (newPrice) onUpdateAssetValue(asset.id, newPrice);
      }
    }
    setIsSyncing(false);
  };

  const handleAnalyzeAsset = async (asset: Asset) => {
    setSelectedAsset(asset);
    setAnalysis(null);
    setIsAnalyzing(true);
    try {
      const text = await getMarketAnalysis(asset.symbol, asset.name);
      setAnalysis(text);
    } catch (e) {
      setAnalysis("Could not load analysis.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'crypto': return <Bitcoin className="w-5 h-5" />;
      case 'real-estate': return <Building className="w-5 h-5" />;
      case 'gold': return <Coins className="w-5 h-5" />;
      default: return <TrendingUp className="w-5 h-5" />;
    }
  };

  // --- Widget Components (Defined as variables to preserve focus) ---

  const netWorthWidget = (
    <div className="glass-card rounded-3xl p-8 relative overflow-hidden transition-all duration-500 group h-full">
        <div className={`absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-10 -mt-10 ${isLiveMode ? 'animate-pulse' : ''}`}></div>
        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black/20 to-transparent"></div>
        
        <div className="relative z-10 flex flex-col h-full justify-between">
          <div className="flex justify-between items-start mb-2">
            <h2 className="text-lg font-medium text-white/60 flex items-center gap-2">
               <Wallet className="w-5 h-5" /> Total Portfolio
            </h2>
            <div className="flex gap-2">
              <button 
                 onClick={() => setIsLiveMode(!isLiveMode)}
                 className={`p-2 rounded-full transition-all ${isLiveMode ? 'bg-emerald-500/20 text-emerald-400 animate-pulse' : 'bg-white/5 text-white/40 hover:text-white'}`}
                 title="Toggle Live Simulation"
               >
                 <Activity className="w-4 h-4" />
               </button>
               <button 
                 onClick={handleSyncPrices}
                 disabled={isSyncing}
                 className={`p-2 rounded-full bg-white/5 text-white/40 hover:text-white transition-all ${isSyncing ? 'animate-spin' : ''}`}
                 title="Sync Real Prices"
               >
                 <RefreshCw className="w-4 h-4" />
               </button>
            </div>
          </div>
          
          <h1 className={`text-5xl font-bold text-white tracking-tight transition-all duration-300 ${privacyMode ? 'blur-md' : ''}`}>
            ${totalWealth.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h1>
          
          <div className="mt-4 flex gap-2 flex-wrap">
             <div className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20">
                +2.4% Today
             </div>
             <div className="px-3 py-1 rounded-full bg-white/5 text-white/40 text-xs font-bold">
                {ownedAssets.length} Assets Held
             </div>
             <div className="px-3 py-1 rounded-full bg-orange-500/10 text-orange-400 text-xs font-bold flex items-center gap-1">
                <Fuel className="w-3 h-3" /> {gasFee.toFixed(0)} Gwei
             </div>
          </div>
        </div>
    </div>
  );

  const allocationWidget = (
    <div className="glass rounded-3xl p-6 h-full flex flex-col">
       <h3 className="text-sm font-bold text-white/60 uppercase tracking-wider mb-2 flex items-center gap-2">
          <PieChartIcon className="w-4 h-4" /> Allocation
       </h3>
       <div className="flex-1 w-full relative min-h-[200px]">
          {allocationData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={allocationData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value" stroke="none">
                  {allocationData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip 
                   formatter={(val: number) => privacyMode ? '••••' : `$${val.toFixed(0)}`}
                   contentStyle={{ backgroundColor: '#0f172a', borderRadius: '10px', border: '1px solid #ffffff20' }} 
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-white/20 text-sm">No data</div>
          )}
       </div>
    </div>
  );

  const marketFeedWidget = (
    <div className="glass rounded-3xl p-6 h-full flex flex-col overflow-hidden">
       <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Newspaper className="w-4 h-4" /> Market Feed
       </h3>
       <div className="space-y-3 overflow-y-auto custom-scrollbar flex-1">
         {[
           { t: "Tech stocks rally as AI adoption surges globally", s: "Reuters", time: "2h ago" },
           { t: "Fed signals potential rate cuts in late 2024", s: "Bloomberg", time: "4h ago" },
           { t: "Crypto market volatility increases ahead of halving", s: "CoinDesk", time: "5h ago" },
           { t: "Gold hits new all-time high amidst uncertainty", s: "CNBC", time: "6h ago" }
         ].map((news, i) => (
           <div key={i} className="bg-white/5 p-3 rounded-xl hover:bg-white/10 transition-colors cursor-pointer">
              <p className="text-xs text-white/80 font-medium leading-tight">{news.t}</p>
              <div className="flex justify-between mt-1.5">
                 <span className="text-[10px] text-indigo-300">{news.s}</span>
                 <span className="text-[10px] text-white/30">{news.time}</span>
              </div>
           </div>
         ))}
       </div>
    </div>
  );

  const scannerWidget = (
    <div className="glass rounded-3xl p-6 border border-indigo-500/20 h-full flex flex-col">
        <h2 className="text-sm font-bold text-indigo-400 mb-4 flex items-center gap-2 uppercase tracking-wider">
           <BrainCircuit className="w-4 h-4" />
           AI Asset Scanner
        </h2>
        <div className="relative flex gap-2">
          <div className="relative flex-1">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
             <input 
               type="text" 
               value={query}
               onChange={(e) => setQuery(e.target.value)}
               onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
               placeholder="Search stocks, crypto..." 
               className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-all placeholder:text-white/20"
             />
          </div>
          <button 
            onClick={handleSearch}
            disabled={isSearching}
            className="bg-indigo-600 px-5 rounded-xl font-medium text-white hover:bg-indigo-500 disabled:opacity-50 transition-all"
          >
            {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Scan'}
          </button>
        </div>

        {foundAsset && (
           <div className="mt-4 p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-xl animate-in slide-in-from-top-2">
              <div className="flex justify-between items-start mb-4">
                 <div>
                    <p className="font-bold text-white text-lg">{foundAsset.name}</p>
                    <p className="text-xs text-indigo-300 font-mono">{foundAsset.symbol}</p>
                 </div>
                 <div className="px-2 py-1 rounded bg-white/10 text-[10px] text-white/60 uppercase font-bold">
                    {foundAsset.type}
                 </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                 <div>
                    <label className="text-[10px] text-white/40 uppercase font-bold mb-1 block">Quantity</label>
                    <input 
                      type="number" 
                      placeholder="0.00"
                      value={amountToAdd}
                      onChange={(e) => setAmountToAdd(e.target.value)}
                      disabled={addToWatchlist}
                      className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-white text-sm focus:outline-none focus:border-indigo-500 disabled:opacity-50"
                    />
                 </div>
                 <div>
                    <label className="text-[10px] text-white/40 uppercase font-bold mb-1 block">Current Price ($)</label>
                    <input 
                      type="number" 
                      placeholder="0.00"
                      value={priceToAdd}
                      onChange={(e) => setPriceToAdd(e.target.value)}
                      className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-white text-sm focus:outline-none focus:border-indigo-500"
                    />
                 </div>
              </div>

              <div className="flex items-center gap-2 mt-3 mb-2">
                 <input 
                   type="checkbox" 
                   id="watchlist"
                   checked={addToWatchlist}
                   onChange={(e) => setAddToWatchlist(e.target.checked)}
                   className="rounded bg-white/10 border-white/20"
                 />
                 <label htmlFor="watchlist" className="text-sm text-white/80 cursor-pointer">Add to Watchlist</label>
              </div>

              <button 
                onClick={handleConfirmAdd}
                disabled={!priceToAdd}
                className="w-full mt-2 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                 <Plus className="w-4 h-4" /> Add
              </button>
           </div>
        )}
    </div>
  );

  const portfolioListWidget = (
    <div className="h-full">
        <h3 className="text-white font-bold mb-4 px-2 flex items-center justify-between">
           <span>Your Holdings</span>
           <span className="text-xs text-white/40 font-normal">{ownedAssets.length} assets</span>
        </h3>
        
        <div className="space-y-3">
          {ownedAssets.map(asset => (
            <div 
              key={asset.id} 
              onClick={() => handleAnalyzeAsset(asset)}
              className="glass p-4 rounded-2xl flex justify-between items-center hover:bg-white/10 cursor-pointer transition-all group border border-transparent hover:border-white/10"
            >
              <div className="flex items-center gap-4">
                 <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isLiveMode ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white/5 text-white/60'}`}>
                    {getIcon(asset.type)}
                 </div>
                 <div>
                    <div className="flex items-center gap-2">
                       <h4 className="font-bold text-white">{asset.name}</h4>
                       <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-white/40">{asset.symbol || 'N/A'}</span>
                    </div>
                    <p className="text-xs text-white/40 mt-0.5">
                       {asset.amount} units @ ${privacyMode ? '••••' : `$${asset.value.toFixed(2)}`}
                    </p>
                 </div>
              </div>
              
              <div className="text-right">
                 <p className={`font-bold text-lg ${isLiveMode ? 'text-emerald-300' : 'text-white'} ${privacyMode ? 'blur-sm' : ''}`}>
                    ${(asset.amount * asset.value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                 </p>
                 <div className="flex items-center justify-end gap-2">
                    <button 
                      onClick={(e) => { e.stopPropagation(); onDeleteAsset(asset.id); }}
                      className="p-1.5 rounded-full hover:bg-rose-500/20 text-white/20 hover:text-rose-400 transition-all"
                    >
                       <Trash2 className="w-3 h-3" />
                    </button>
                    <ArrowUpRight className="w-4 h-4 text-white/20" />
                 </div>
              </div>
            </div>
          ))}

          {ownedAssets.length === 0 && (
             <div className="text-center py-12 border-2 border-dashed border-white/5 rounded-3xl">
                <TrendingUp className="w-10 h-10 text-white/20 mx-auto mb-3" />
                <p className="text-white/40 font-medium">Your portfolio is empty.</p>
             </div>
          )}
        </div>
    </div>
  );

  const watchlistWidget = (
    <div className="h-full">
        <h3 className="text-white font-bold mb-4 px-2 flex items-center gap-2">
           <Eye className="w-5 h-5 text-indigo-400" /> Watchlist
        </h3>
        <div className="grid grid-cols-1 gap-3">
           {watchlistAssets.map(asset => (
              <div 
                 key={asset.id}
                 onClick={() => handleAnalyzeAsset(asset)}
                 className="glass p-3 rounded-xl flex justify-between items-center hover:bg-white/10 cursor-pointer border border-transparent hover:border-indigo-500/30"
              >
                 <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/60">
                       {getIcon(asset.type)}
                    </div>
                    <div>
                       <p className="font-bold text-sm text-white">{asset.name}</p>
                       <p className="text-[10px] text-white/40">{asset.symbol}</p>
                    </div>
                 </div>
                 <div className="text-right">
                    <p className={`font-bold text-sm ${isLiveMode ? 'text-emerald-300' : 'text-white'}`}>${asset.value.toFixed(2)}</p>
                    <button 
                       onClick={(e) => { e.stopPropagation(); onDeleteAsset(asset.id); }}
                       className="text-[10px] text-rose-400 hover:underline"
                    >
                       Remove
                    </button>
                 </div>
              </div>
           ))}
           {watchlistAssets.length === 0 && (
              <div className="text-center text-white/20 py-10">No items in watchlist.</div>
           )}
        </div>
    </div>
  );

  const widgets = [
    { id: 'net_worth', title: 'Net Worth', content: netWorthWidget, defaultSize: 'full' as const },
    { id: 'scanner', title: 'AI Scanner', content: scannerWidget, defaultSize: 'half' as const },
    { id: 'allocation', title: 'Asset Allocation', content: allocationWidget, defaultSize: 'half' as const },
    { id: 'portfolio', title: 'Portfolio List', content: portfolioListWidget, defaultSize: 'full' as const },
    { id: 'watchlist', title: 'Watchlist', content: watchlistWidget, defaultSize: 'half' as const },
    { id: 'market_feed', title: 'Market News', content: marketFeedWidget, defaultSize: 'half' as const },
  ];

  return (
    <>
      <CustomizableLayout viewId="invest" widgets={widgets} />

      {/* Detail Modal (Chart & Analysis) - Kept separate as overlay */}
      {selectedAsset && (
        <div className="fixed inset-0 bg-[#0f172a]/95 backdrop-blur-xl z-50 overflow-y-auto animate-in fade-in duration-200">
          <div className="min-h-screen p-4 md:p-8 max-w-5xl mx-auto flex flex-col">
             
             {/* Modal Header */}
             <div className="flex justify-between items-center mb-6">
                <div>
                   <h2 className="text-2xl font-bold text-white">{selectedAsset.name}</h2>
                   <p className="text-white/50">{selectedAsset.symbol} • {selectedAsset.type.toUpperCase()}</p>
                </div>
                <button onClick={() => setSelectedAsset(null)} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
                   <X className="w-6 h-6 text-white" />
                </button>
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Chart Section */}
                <div className="lg:col-span-2">
                   {selectedAsset.symbol && selectedAsset.symbol !== 'N/A' ? (
                      <TradingViewWidget symbol={selectedAsset.symbol} />
                   ) : (
                      <div className="h-[400px] w-full rounded-3xl bg-white/5 flex items-center justify-center text-white/30 border border-white/10">
                         Chart unavailable for this asset type
                      </div>
                   )}
                </div>

                {/* Analysis Section */}
                <div className="lg:col-span-1 space-y-6">
                   {/* Holdings Card */}
                   {!selectedAsset.isWatchlist && (
                     <div className="glass p-6 rounded-3xl">
                        <p className="text-sm text-white/40 font-medium mb-1">Your Position</p>
                        <h3 className="text-3xl font-bold text-white">
                           ${(selectedAsset.amount * selectedAsset.value).toLocaleString()}
                        </h3>
                        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                           <div>
                              <p className="text-white/30">Quantity</p>
                              <p className="text-white">{selectedAsset.amount}</p>
                           </div>
                           <div>
                              <p className="text-white/30">Avg. Price</p>
                              <p className="text-white">${selectedAsset.value.toFixed(2)}</p>
                           </div>
                        </div>
                     </div>
                   )}

                   {/* AI Insight */}
                   <div className="glass rounded-3xl p-6 h-full min-h-[300px] border border-indigo-500/20">
                      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                         <BrainCircuit className="w-5 h-5 text-indigo-400" />
                         AI Market Insights
                      </h3>
                      {isAnalyzing ? (
                         <div className="flex flex-col items-center justify-center h-40 gap-3 text-white/50">
                            <Loader2 className="w-8 h-8 animate-spin text-indigo-400" /> 
                            <p>Analyzing market trends...</p>
                         </div>
                      ) : (
                         <div className="prose prose-invert prose-sm text-white/80 leading-relaxed">
                            <ReactMarkdown>{analysis || "No analysis available."}</ReactMarkdown>
                         </div>
                      )}
                   </div>
                </div>
             </div>

          </div>
        </div>
      )}
    </>
  );
};
