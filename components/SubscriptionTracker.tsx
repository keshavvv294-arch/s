
import React from 'react';
import { Transaction } from '../types';
import { Repeat, X, AlertCircle, Calendar, TrendingUp } from 'lucide-react';

interface SubscriptionTrackerProps {
  transactions: Transaction[];
  onClose: () => void;
}

export const SubscriptionTracker: React.FC<SubscriptionTrackerProps> = ({ transactions, onClose }) => {
  const subscriptions = React.useMemo(() => {
    const counts: Record<string, { count: number, amount: number, lastDate: string }> = {};
    
    transactions.filter(t => t.type === 'expense').forEach(t => {
      const key = t.description.toLowerCase().trim(); 
      if (!counts[key]) counts[key] = { count: 0, amount: 0, lastDate: '' };
      counts[key].count++;
      counts[key].amount = t.amount;
      if (t.date > counts[key].lastDate) counts[key].lastDate = t.date;
    });

    return Object.entries(counts)
      .filter(([_, data]) => data.count > 1 || (data.amount % 1 !== 0 && data.amount < 50)) // Smart logic
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.amount - a.amount);
  }, [transactions]);

  const totalMonthly = subscriptions.reduce((sum, sub) => sum + sub.amount, 0);
  const totalYearly = totalMonthly * 12;

  return (
    <div className="glass rounded-3xl p-6 h-full animate-in zoom-in duration-200 overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
           <Repeat className="w-5 h-5 text-pink-400" /> Subscriptions
        </h3>
        <button onClick={onClose} className="text-white/40 hover:text-white"><X className="w-6 h-6" /></button>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
         <div className="bg-pink-500/10 border border-pink-500/20 rounded-2xl p-4 text-center">
            <p className="text-pink-300 text-xs font-bold uppercase mb-1">Monthly Cost</p>
            <h2 className="text-2xl font-bold text-white">${totalMonthly.toFixed(0)}</h2>
         </div>
         <div className="bg-purple-500/10 border border-purple-500/20 rounded-2xl p-4 text-center">
            <p className="text-purple-300 text-xs font-bold uppercase mb-1">Yearly Proj.</p>
            <h2 className="text-2xl font-bold text-white">${totalYearly.toFixed(0)}</h2>
         </div>
      </div>

      <h4 className="text-sm font-bold text-white mb-3 px-2">Active Services</h4>
      <div className="space-y-3">
        {subscriptions.length === 0 ? (
           <div className="text-center text-white/40 py-8">
              <AlertCircle className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p>No recurring charges detected.</p>
           </div>
        ) : (
          subscriptions.map((sub, idx) => (
            <div key={idx} className="flex justify-between items-center p-4 bg-[#1e293b] rounded-xl border border-white/5 hover:border-pink-500/30 transition-colors">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-pink-600 flex items-center justify-center text-white font-bold capitalize shadow-lg">
                     {sub.name.charAt(0)}
                  </div>
                  <div>
                     <p className="capitalize text-white font-bold text-sm">{sub.name}</p>
                     <p className="text-[10px] text-white/40 flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> Last: {sub.lastDate}
                     </p>
                  </div>
               </div>
               <div className="text-right">
                  <div className="font-bold text-white text-lg">${sub.amount.toFixed(0)}</div>
                  <div className="text-[10px] text-white/30">per month</div>
               </div>
            </div>
          ))
        )}
      </div>
      
      {subscriptions.length > 0 && (
         <div className="mt-6 p-4 bg-white/5 rounded-xl border border-white/10 flex items-start gap-3">
            <TrendingUp className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <p className="text-xs text-white/70 leading-relaxed">
               <strong>Tip:</strong> You could save <strong>${(totalYearly * 0.15).toFixed(0)}</strong>/year by switching to annual plans for these services.
            </p>
         </div>
      )}
    </div>
  );
};
