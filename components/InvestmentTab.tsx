import React, { useState, useEffect } from 'react';
import { Asset, Transaction } from '../types';
import { CustomizableLayout } from './CustomizableLayout';
import { NetWorthCard } from './investment/NetWorthCard';
import { AssetScanner } from './investment/AssetScanner';
import { AllocationChart } from './investment/AllocationChart';
import { AssetList } from './investment/AssetList';
import { WatchList } from './investment/WatchList';
import { MarketFeed } from './investment/MarketFeed';
import { TradeLog } from './investment/TradeLog';
import { AssetDetailModal } from './investment/AssetDetailModal';
import { getLatestAssetPrice } from '../services/geminiService';

interface InvestmentTabProps {
  assets: Asset[];
  transactions: Transaction[];
  onAddTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  onAddAsset: (asset: Asset) => void;
  onDeleteAsset: (id: string) => void;
  onUpdateAllAssets: (updater: (prev: Asset[]) => Asset[]) => void;
  privacyMode: boolean;
}

export const InvestmentTab: React.FC<InvestmentTabProps> = ({ assets, transactions, onAddTransaction, onAddAsset, onDeleteAsset, onUpdateAllAssets, privacyMode }) => {
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [gasFee, setGasFee] = useState(35); // Simulated Gwei

  const ownedAssets = assets.filter(a => !a.isWatchlist);
  const watchlistAssets = assets.filter(a => a.isWatchlist);

  // Total Wealth Calculation
  const totalWealth = ownedAssets.reduce((sum, asset) => sum + (asset.amount * asset.value), 0);

  // Live Mode Simulation
  useEffect(() => {
    if (!isLiveMode) return;
    const interval = setInterval(() => {
      onUpdateAllAssets(prevAssets => 
        prevAssets.map(asset => {
          const fluctuation = 1 + (Math.random() * 0.004 - 0.002); 
          return { ...asset, value: asset.value * fluctuation };
        })
      );
      setGasFee(prev => Math.max(10, Math.min(100, prev + (Math.random() * 10 - 5))));
    }, 3000);
    return () => clearInterval(interval);
  }, [isLiveMode, onUpdateAllAssets]);

  const handleSyncPrices = async () => {
    setIsSyncing(true);
    const updatedPrices: { id: string, value: number, lastUpdated: string }[] = [];
    
    await Promise.all(assets.map(async (asset) => {
      if (['stock', 'crypto', 'gold'].includes(asset.type)) {
         const newPrice = await getLatestAssetPrice(asset.name, asset.symbol);
         if (newPrice) {
           updatedPrices.push({ id: asset.id, value: newPrice, lastUpdated: new Date().toISOString() });
         }
      }
    }));

    if (updatedPrices.length > 0) {
      onUpdateAllAssets(prevAssets => 
        prevAssets.map(asset => {
          const update = updatedPrices.find(u => u.id === asset.id);
          return update ? { ...asset, value: update.value, lastUpdated: update.lastUpdated } : asset;
        })
      );
    }
    
    setIsSyncing(false);
  };

  // Automatic Price Syncing
  useEffect(() => {
    const interval = setInterval(() => {
      handleSyncPrices();
    }, 60000); // Sync every minute
    return () => clearInterval(interval);
  }, [handleSyncPrices]);

  const handleAnalyzeAsset = (asset: Asset) => {
    setSelectedAsset(asset);
  };

  const widgets = [
    { 
      id: 'net_worth', 
      title: 'Net Worth', 
      content: <NetWorthCard 
        totalWealth={totalWealth} 
        isLiveMode={isLiveMode} 
        setIsLiveMode={setIsLiveMode} 
        isSyncing={isSyncing} 
        handleSyncPrices={handleSyncPrices} 
        ownedAssetsCount={ownedAssets.length} 
        gasFee={gasFee} 
        privacyMode={privacyMode} 
      />, 
      defaultSize: 'full' as const 
    },
    { 
      id: 'scanner', 
      title: 'AI Scanner', 
      content: <AssetScanner onAddAsset={onAddAsset} onAddTransaction={onAddTransaction} />, 
      defaultSize: 'half' as const 
    },
    { 
      id: 'allocation', 
      title: 'Asset Allocation', 
      content: <AllocationChart assets={ownedAssets} privacyMode={privacyMode} />, 
      defaultSize: 'half' as const 
    },
    { 
      id: 'portfolio', 
      title: 'Portfolio List', 
      content: <AssetList assets={ownedAssets} onDeleteAsset={onDeleteAsset} onAnalyzeAsset={handleAnalyzeAsset} isLiveMode={isLiveMode} privacyMode={privacyMode} />, 
      defaultSize: 'full' as const 
    },
    { 
      id: 'watchlist', 
      title: 'Watchlist', 
      content: <WatchList assets={watchlistAssets} onDeleteAsset={onDeleteAsset} onAnalyzeAsset={handleAnalyzeAsset} isLiveMode={isLiveMode} privacyMode={privacyMode} />, 
      defaultSize: 'half' as const 
    },
    { 
      id: 'market_feed', 
      title: 'Market News', 
      content: <MarketFeed />, 
      defaultSize: 'half' as const 
    },
    { 
      id: 'trade_log', 
      title: 'Trade Log', 
      content: <TradeLog transactions={transactions} />, 
      defaultSize: 'half' as const 
    },
  ];

  return (
    <>
      <CustomizableLayout viewId="invest" widgets={widgets} />

      {selectedAsset && (
        <AssetDetailModal 
          asset={selectedAsset} 
          onClose={() => setSelectedAsset(null)} 
          privacyMode={privacyMode} 
        />
      )}
    </>
  );
};
