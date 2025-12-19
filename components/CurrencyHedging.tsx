
import React, { useState, useEffect } from 'react';
import { X, Globe, Lock, RefreshCw, ArrowRight } from 'lucide-react';
import { getRealForexRate } from '../services/geminiService';

interface CurrencyHedgingProps {
  onClose: () => void;
}

export const CurrencyHedging: React.FC<CurrencyHedgingProps> = ({ onClose }) => {
  const [rate, setRate] = useState(83.45); // Default fallback
  const [amount, setAmount] = useState('');
  const [locked, setLocked] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch initial real rate
  useEffect(() => {
     getRealForexRate('USD', 'INR').then(r => {
        setRate(r);
        setLoading(false);
     });
  }, []);

  // Simulate Live Rate Fluctuations around the real rate
  useEffect(() => {
    if (locked || loading) return;
    const interval = setInterval(() => {
       // Fluctuate by +/- 0.05
       setRate(prev => prev + (Math.random() * 0.1 - 0.05));
    }, 2000);
    return () => clearInterval(interval);
  }, [locked, loading]);

  return (
    <div className="glass rounded-3xl p-6 h-full animate-in slide-in-from-right duration-200">
       <div className="flex justify-between items-center mb-6">
         <h3 className="text-xl font-bold text-white flex items-center gap-2"><Globe className="w-5 h-5 text-emerald-400" /> Currency Hedge</h3>
         <button onClick={onClose} className="text-white/40 hover:text-white"><X className="w-6 h-6" /></button>
       </div>

       <div className="bg-black/20 p-6 rounded-2xl text-center mb-6 border border-white/5 relative overflow-hidden">
          <p className="text-white/50 text-sm mb-1 uppercase tracking-wider">USD to INR</p>
          <h2 className="text-5xl font-mono text-white font-bold">{loading ? '...' : rate.toFixed(4)}</h2>
          {!locked && !loading && <div className="absolute top-2 right-2 animate-pulse w-2 h-2 bg-emerald-500 rounded-full"></div>}
       </div>

       <div className="space-y-4">
          <div>
             <label className="text-xs font-bold text-white/50 uppercase ml-1">Amount to Send (USD)</label>
             <input 
               type="number" 
               placeholder="1000" 
               value={amount}
               onChange={e => setAmount(e.target.value)}
               disabled={locked}
               className="w-full mt-1 bg-white/5 border border-white/10 rounded-xl p-3 text-white text-lg focus:outline-none focus:border-emerald-500"
             />
          </div>

          <div className="flex justify-between items-center px-2 py-3 bg-white/5 rounded-xl">
             <span className="text-sm text-white/60">You Receive (INR)</span>
             <span className="text-xl font-bold text-emerald-400">
                {(parseFloat(amount || '0') * rate).toLocaleString(undefined, {maximumFractionDigits: 2})}
             </span>
          </div>

          <button 
            onClick={() => setLocked(!locked)}
            className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${locked ? 'bg-white/10 text-white' : 'bg-emerald-600 hover:bg-emerald-500 text-white'}`}
          >
             {locked ? <RefreshCw className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
             {locked ? 'Unlock Rate' : 'Lock Rate for 10m'}
          </button>
       </div>
    </div>
  );
};
