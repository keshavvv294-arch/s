import React, { useState } from 'react';
import { Search, Loader2, Plus, BrainCircuit, AlertCircle, Activity } from 'lucide-react';
import { lookupAssetSymbol, getLatestAssetPrice } from '../../services/geminiService';
import { Asset } from '../../types';

interface AssetScannerProps {
  onAddAsset: (asset: Asset) => void;
  onAddTransaction: (transaction: any) => void;
}

export const AssetScanner: React.FC<AssetScannerProps> = ({ onAddAsset, onAddTransaction }) => {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [foundAsset, setFoundAsset] = useState<{symbol: string, name: string, type: string} | null>(null);
  const [amountToAdd, setAmountToAdd] = useState('');
  const [priceToAdd, setPriceToAdd] = useState('');
  const [addToWatchlist, setAddToWatchlist] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setIsSearching(true);
    setFoundAsset(null);
    setSearchError(null);
    try {
      const result = await lookupAssetSymbol(query);
      setFoundAsset(result);
      const price = await getLatestAssetPrice(result.name, result.symbol);
      if (price) setPriceToAdd(price.toString());
    } catch (e: any) {
      console.error(e);
      setSearchError(e.message || "Failed to call the Gemini API. Please try again later.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleConfirmAdd = () => {
    if (foundAsset && priceToAdd) {
      const amount = addToWatchlist ? 0 : parseFloat(amountToAdd) || 0;
      const price = parseFloat(priceToAdd);
      
      onAddAsset({
        id: Date.now().toString(),
        name: foundAsset.name,
        symbol: foundAsset.symbol,
        type: foundAsset.type.toLowerCase() as Asset['type'],
        amount,
        value: price,
        purchasePrice: price,
        currency: 'USD',
        isWatchlist: addToWatchlist,
        lastUpdated: new Date().toISOString()
      });

      if (!addToWatchlist && amount > 0) {
        onAddTransaction({
          description: `Bought ${amount} ${foundAsset.symbol}`,
          amount: amount * price,
          type: 'expense',
          category: 'Investment',
          date: new Date().toISOString().split('T')[0],
          status: 'cleared',
          tags: ['trade', foundAsset.symbol.toLowerCase()]
        });
      }

      setFoundAsset(null);
      setQuery('');
      setAmountToAdd('');
      setPriceToAdd('');
      setAddToWatchlist(false);
    }
  };

  return (
    <div className="glass-card rounded-3xl p-6 border border-indigo-500/20 h-full flex flex-col relative overflow-hidden group">
      {/* Background Glow */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity duration-700"></div>

      <h2 className="text-sm font-bold text-indigo-400 mb-4 flex items-center gap-2 uppercase tracking-wider relative z-10">
         <BrainCircuit className="w-4 h-4" />
         AI Asset Scanner
      </h2>

      <div className="relative flex gap-2 z-10">
        <div className="relative flex-1 group/input">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within/input:text-indigo-400 transition-colors" />
           <input 
             type="text" 
             value={query}
             onChange={(e) => setQuery(e.target.value)}
             onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
             placeholder="Search stocks, crypto..." 
             className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-indigo-500/50 focus:bg-white/10 transition-all placeholder:text-white/20 text-sm"
           />
        </div>
        <button 
          onClick={handleSearch}
          disabled={isSearching}
          className="bg-indigo-600 px-5 rounded-xl font-medium text-white hover:bg-indigo-500 disabled:opacity-50 transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
        >
          {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Scan'}
        </button>
      </div>

      {searchError && (
         <div className="mt-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs flex items-start gap-2 animate-in slide-in-from-top-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <p>{searchError}</p>
         </div>
      )}

      {foundAsset && (
         <div className="mt-4 p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-xl animate-in slide-in-from-top-2 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-400/10 rounded-full blur-xl -mr-5 -mt-5"></div>
            
            <div className="flex justify-between items-start mb-4 relative z-10">
               <div>
                  <p className="font-bold text-white text-lg leading-tight">{foundAsset.name}</p>
                  <p className="text-xs text-indigo-300 font-mono mt-0.5">{foundAsset.symbol}</p>
               </div>
               <div className="flex flex-col items-end gap-1">
                  <div className="px-2 py-1 rounded bg-white/10 text-[10px] text-white/60 uppercase font-bold border border-white/5">
                     {foundAsset.type}
                  </div>
                  <div className="flex items-center gap-1 text-[9px] text-emerald-400 font-bold uppercase tracking-wider bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                     <Activity className="w-3 h-3 animate-pulse" />
                     Live Data
                  </div>
               </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 relative z-10">
               <div>
                  <label className="text-[10px] text-white/40 uppercase font-bold mb-1 block tracking-wider">Quantity</label>
                  <input 
                    type="number" 
                    placeholder="0.00"
                    value={amountToAdd}
                    onChange={(e) => setAmountToAdd(e.target.value)}
                    disabled={addToWatchlist}
                    className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-white text-sm focus:outline-none focus:border-indigo-500/50 disabled:opacity-50 transition-colors"
                  />
               </div>
               <div>
                  <label className="text-[10px] text-white/40 uppercase font-bold mb-1 block tracking-wider">Price ($)</label>
                  <input 
                    type="number" 
                    placeholder="0.00"
                    value={priceToAdd}
                    onChange={(e) => setPriceToAdd(e.target.value)}
                    className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-white text-sm focus:outline-none focus:border-indigo-500/50 transition-colors"
                  />
               </div>
            </div>

            <div className="flex items-center gap-2 mt-4 mb-3 relative z-10">
               <div className="relative flex items-center">
                 <input 
                   type="checkbox" 
                   id="watchlist"
                   checked={addToWatchlist}
                   onChange={(e) => setAddToWatchlist(e.target.checked)}
                   className="peer h-4 w-4 rounded border-white/20 bg-white/5 text-indigo-500 focus:ring-indigo-500/50 focus:ring-offset-0"
                 />
                 <label htmlFor="watchlist" className="ml-2 text-xs text-white/60 cursor-pointer select-none peer-checked:text-white transition-colors">Add to Watchlist Only</label>
               </div>
            </div>

            <button 
              onClick={handleConfirmAdd}
              disabled={!priceToAdd}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 active:scale-95 relative z-10"
            >
               <Plus className="w-4 h-4" /> Add to Portfolio
            </button>
         </div>
      )}
    </div>
  );
};
