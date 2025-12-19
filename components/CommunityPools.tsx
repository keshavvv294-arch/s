
import React, { useState } from 'react';
import { X, Users, PieChart, ArrowUpRight, Plus } from 'lucide-react';
import { Transaction } from '../types';

interface CommunityPoolsProps {
   onClose: () => void;
   onContribute: (t: Omit<Transaction, 'id'>) => void;
}

export const CommunityPools: React.FC<CommunityPoolsProps> = ({ onClose, onContribute }) => {
  const [balance, setBalance] = useState(12450);
  
  const handleContribute = () => {
     const amount = 500;
     setBalance(prev => prev + amount);
     onContribute({
        description: 'Family Pool Contribution',
        amount: amount,
        type: 'expense',
        category: 'Investment',
        date: new Date().toISOString().split('T')[0],
        status: 'cleared'
     });
  };

  return (
    <div className="glass rounded-3xl p-6 h-full animate-in slide-in-from-right duration-200">
       <div className="flex justify-between items-center mb-6">
         <h3 className="text-xl font-bold text-white flex items-center gap-2"><Users className="w-5 h-5 text-orange-400" /> Family Pool</h3>
         <button onClick={onClose} className="text-white/40 hover:text-white"><X className="w-6 h-6" /></button>
       </div>

       <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 rounded-2xl text-center mb-6 shadow-lg">
          <p className="text-white/70 text-sm font-medium uppercase tracking-wider">Total Pool Value</p>
          <h2 className="text-4xl font-bold text-white mt-1">${balance.toLocaleString()}</h2>
          <div className="flex justify-center mt-4 -space-x-2">
             {[1,2,3,4].map(i => (
                <div key={i} className="w-8 h-8 rounded-full bg-white border-2 border-orange-500 flex items-center justify-center text-xs font-bold text-orange-600">
                   U{i}
                </div>
             ))}
             <button onClick={handleContribute} className="w-8 h-8 rounded-full bg-black/40 border-2 border-orange-500 flex items-center justify-center text-xs text-white hover:bg-black/60 transition-colors">
                <Plus className="w-4 h-4" />
             </button>
          </div>
          <p className="text-xs text-white/60 mt-2">Tap + to contribute $500</p>
       </div>

       <h4 className="text-sm font-bold text-white mb-3">Portfolio Split</h4>
       <div className="space-y-3">
          {[
             { n: 'Bitcoin', v: '$6,000', p: 48, c: 'bg-orange-500' },
             { n: 'Apple', v: '$4,000', p: 32, c: 'bg-blue-500' },
             { n: 'Cash', v: `$${(balance - 10000).toLocaleString()}`, p: 20, c: 'bg-emerald-500' }
          ].map((item, i) => (
             <div key={i} className="bg-white/5 p-3 rounded-xl flex items-center gap-3">
                <div className={`w-2 h-10 rounded-full ${item.c}`}></div>
                <div className="flex-1">
                   <div className="flex justify-between mb-1">
                      <span className="text-white font-medium">{item.n}</span>
                      <span className="text-white/60">{item.v}</span>
                   </div>
                   <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className={`h-full ${item.c}`} style={{ width: `${item.p}%` }}></div>
                   </div>
                </div>
             </div>
          ))}
       </div>
    </div>
  );
};
