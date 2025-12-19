import React, { useState, useEffect } from 'react';
import { Plus, TrendingUp, DollarSign, Bitcoin, Building, Coins, Trash2, RefreshCw, Activity, Zap } from 'lucide-react';
import { Asset, ASSET_TYPES } from '../types';
import { getLatestAssetPrice } from '../services/geminiService';

interface WealthPortfolioProps {
  assets: Asset[];
  onAddAsset: (asset: Asset) => void;
  onDeleteAsset: (id: string) => void;
  onUpdateAssetValue?: (id: string, newValue: number) => void;
}

export const WealthPortfolio: React.FC<WealthPortfolioProps> = ({ assets, onAddAsset, onDeleteAsset, onUpdateAssetValue }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newAsset, setNewAsset] = useState<Partial<Asset>>({ type: 'stock' });
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Total Wealth Calculation
  const totalWealth = assets.reduce((sum, asset) => sum + (asset.amount * asset.value), 0);

  // Simulation Effect: Fluctuates prices slightly to simulate live market
  useEffect(() => {
    if (!isLiveMode) return;

    const interval = setInterval(() => {
      assets.forEach(asset => {
        if (!onUpdateAssetValue) return;
        // Fluctuate between -0.2% and +0.2%
        const fluctuation = 1 + (Math.random() * 0.004 - 0.002); 
        const newValue = asset.value * fluctuation;
        onUpdateAssetValue(asset.id, newValue);
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [isLiveMode, assets, onUpdateAssetValue]);

  const handleSave = () => {
    if (newAsset.name && newAsset.amount && newAsset.value && newAsset.type) {
      onAddAsset({
        id: Date.now().toString(),
        name: newAsset.name,
        amount: Number(newAsset.amount),
        value: Number(newAsset.value),
        type: newAsset.type,
        currency: 'USD'
      } as Asset);
      setIsAdding(false);
      setNewAsset({ type: 'stock' });
    }
  };

  const handleSyncPrices = async () => {
    if (!onUpdateAssetValue) return;
    setIsSyncing(true);
    
    // Process sequentially to avoid rate limits/overwhelming
    for (const asset of assets) {
      if (asset.type === 'stock' || asset.type === 'crypto' || asset.type === 'gold') {
         const newPrice = await getLatestAssetPrice(asset.name);
         if (newPrice) {
            onUpdateAssetValue(asset.id, newPrice);
         }
      }
    }
    setIsSyncing(false);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'crypto': return <Bitcoin className="w-5 h-5" />;
      case 'real-estate': return <Building className="w-5 h-5" />;
      case 'gold': return <Coins className="w-5 h-5" />;
      default: return <TrendingUp className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 pb-20">
      {/* Net Worth Card */}
      <div className="glass-card rounded-3xl p-8 text-center relative overflow-hidden transition-all duration-500">
        <div className={`absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-10 -mt-10 ${isLiveMode ? 'animate-pulse' : ''}`}></div>
        <h2 className="text-lg font-medium text-white/60">Total Net Worth</h2>
        <h1 className="text-5xl font-bold text-white mt-2 mb-2 tracking-tight transition-all duration-300">
          ${totalWealth.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
        </h1>
        
        <div className="flex justify-center items-center gap-3 mt-4">
           {/* Live Mode Toggle */}
           <button 
             onClick={() => setIsLiveMode(!isLiveMode)}
             className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${isLiveMode ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-white/5 text-white/40'}`}
           >
              <Activity className={`w-3 h-3 ${isLiveMode ? 'animate-pulse' : ''}`} />
              {isLiveMode ? 'LIVE MARKET' : 'OFFLINE'}
           </button>

           {/* Sync Button */}
           <button 
             onClick={handleSyncPrices}
             disabled={isSyncing}
             className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-500/30 transition-all disabled:opacity-50"
           >
              <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'SYNCING...' : 'SYNC PRICES'}
           </button>
        </div>
      </div>

      {/* Asset List */}
      <div className="glass rounded-3xl overflow-hidden p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-white">Assets</h3>
          <button 
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Asset
          </button>
        </div>

        {isAdding && (
          <div className="bg-white/5 rounded-xl p-4 mb-4 border border-white/10 space-y-3 animate-in slide-in-from-top-2">
             <div className="grid grid-cols-2 gap-3">
                <select 
                  className="bg-black/20 text-white rounded-lg p-2 outline-none border border-white/10"
                  value={newAsset.type}
                  onChange={e => setNewAsset({...newAsset, type: e.target.value as any})}
                >
                  {Object.entries(ASSET_TYPES).map(([key, label]) => (
                    <option key={key} value={key} className="bg-slate-800">{label}</option>
                  ))}
                </select>
                <input 
                  type="text" 
                  placeholder="Asset Name (e.g. BTC)" 
                  className="bg-black/20 text-white rounded-lg p-2 outline-none border border-white/10"
                  onChange={e => setNewAsset({...newAsset, name: e.target.value})}
                />
             </div>
             <div className="grid grid-cols-2 gap-3">
                <input 
                  type="number" 
                  placeholder="Quantity" 
                  className="bg-black/20 text-white rounded-lg p-2 outline-none border border-white/10"
                  onChange={e => setNewAsset({...newAsset, amount: Number(e.target.value)})}
                />
                <input 
                  type="number" 
                  placeholder="Current Price ($)" 
                  className="bg-black/20 text-white rounded-lg p-2 outline-none border border-white/10"
                  onChange={e => setNewAsset({...newAsset, value: Number(e.target.value)})}
                />
             </div>
             <div className="flex justify-end gap-2 mt-2">
               <button onClick={() => setIsAdding(false)} className="text-white/50 text-sm px-3">Cancel</button>
               <button onClick={handleSave} className="bg-indigo-600 text-white px-4 py-1.5 rounded-lg text-sm">Save</button>
             </div>
          </div>
        )}

        <div className="space-y-3">
           {assets.length === 0 && !isAdding && (
             <div className="text-center text-white/30 py-8">
               <DollarSign className="w-10 h-10 mx-auto mb-2 opacity-50" />
               <p>No assets tracked yet.</p>
             </div>
           )}
           {assets.map(asset => (
             <div key={asset.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors group">
                <div className="flex items-center gap-4">
                   <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isLiveMode ? 'bg-emerald-500/10 text-emerald-400 animate-pulse' : 'bg-indigo-500/20 text-indigo-400'}`}>
                     {getIcon(asset.type)}
                   </div>
                   <div>
                     <h4 className="font-bold text-white">{asset.name}</h4>
                     <p className="text-xs text-white/50">{asset.amount} units @ ${asset.value.toFixed(2)}</p>
                   </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className={`font-bold transition-all duration-300 ${isLiveMode ? 'text-emerald-300' : 'text-white'}`}>
                      ${(asset.amount * asset.value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-white/30">
                       {isLiveMode ? 'LIVE' : 'Asset'}
                    </p>
                  </div>
                  <button 
                    onClick={() => onDeleteAsset(asset.id)}
                    className="p-2 text-white/20 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
};