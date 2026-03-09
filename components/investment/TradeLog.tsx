import React from 'react';
import { Activity } from 'lucide-react';
import { Transaction } from '../../types';

interface TradeLogProps {
  transactions: Transaction[];
}

export const TradeLog: React.FC<TradeLogProps> = ({ transactions }) => {
  const trades = transactions.filter(t => t.category === 'Investment' || t.tags?.includes('trade')).slice(0, 10);

  return (
    <div className="glass-card rounded-3xl p-6 h-full flex flex-col overflow-hidden border border-white/5 hover:border-white/10 transition-colors shadow-lg shadow-black/30">
       <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Activity className="w-4 h-4" /> Trade Log
       </h3>
       <div className="space-y-3 overflow-y-auto custom-scrollbar flex-1 pr-2">
         {trades.map((t, i) => (
           <div key={i} className="bg-white/5 p-3 rounded-xl hover:bg-white/10 transition-all border border-transparent hover:border-white/10 group">
              <div className="flex justify-between items-start">
                 <div>
                    <p className="text-xs text-white/80 font-medium group-hover:text-indigo-300 transition-colors">{t.description}</p>
                    <p className="text-[10px] text-white/40 mt-0.5 font-mono">{new Date(t.date).toLocaleDateString()}</p>
                 </div>
                 <span className={`text-xs font-bold font-mono ${t.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {t.type === 'income' ? '+' : '-'}${t.amount.toLocaleString()}
                 </span>
              </div>
           </div>
         ))}
         {trades.length === 0 && (
           <div className="flex flex-col items-center justify-center h-full text-white/20 gap-2 border border-dashed border-white/5 rounded-xl">
             <Activity className="w-6 h-6 opacity-50" />
             <span className="text-xs font-medium">No recent trades</span>
           </div>
         )}
       </div>
    </div>
  );
};
