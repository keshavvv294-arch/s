
import React, { useMemo } from 'react';
import { Transaction } from '../types';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Activity, X, TrendingUp } from 'lucide-react';

interface PredictiveCashFlowProps {
  transactions: Transaction[];
  currentBalance: number;
  onClose: () => void;
}

export const PredictiveCashFlow: React.FC<PredictiveCashFlowProps> = ({ transactions, currentBalance, onClose }) => {
  
  const stats = useMemo(() => {
     const last30Days = transactions.filter(t => {
        const d = new Date(t.date);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - d.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 30;
     });

     const income = last30Days.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
     const expense = last30Days.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
     
     const dailyIncome = income / 30;
     const dailyExpense = expense / 30;
     const netDaily = dailyIncome - dailyExpense;

     return { dailyIncome, dailyExpense, netDaily };
  }, [transactions]);

  const data = useMemo(() => {
    const result = [];
    let balance = currentBalance;
    const today = new Date();

    for (let i = 0; i < 30; i++) {
       const date = new Date(today);
       date.setDate(today.getDate() + i);
       
       // Add base drift
       balance += stats.netDaily;
       
       // Add slight randomization for "prediction" feel
       const volatility = stats.dailyExpense * 0.2; // 20% variance
       const randomFactor = (Math.random() * volatility) - (volatility / 2);
       
       result.push({
          date: date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
          balance: Math.round(balance + randomFactor)
       });
    }
    return result;
  }, [currentBalance, stats]);

  const minBalance = Math.min(...data.map(d => d.balance));
  const endBalance = data[data.length - 1].balance;

  return (
    <div className="glass rounded-3xl p-6 h-full animate-in zoom-in duration-200 flex flex-col">
       <div className="flex justify-between items-center mb-6">
         <h3 className="text-xl font-bold text-white flex items-center gap-2"><Activity className="w-5 h-5 text-blue-400" /> AI Cash Flow</h3>
         <button onClick={onClose} className="text-white/40 hover:text-white"><X className="w-6 h-6" /></button>
       </div>

       <div className="flex-1 bg-black/20 rounded-2xl p-4 border border-white/5 relative overflow-hidden">
          <ResponsiveContainer width="100%" height="100%">
             <AreaChart data={data}>
                <defs>
                   <linearGradient id="colorFlow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={endBalance > currentBalance ? "#10b981" : "#f43f5e"} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={endBalance > currentBalance ? "#10b981" : "#f43f5e"} stopOpacity={0}/>
                   </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="date" hide />
                <YAxis stroke="rgba(255,255,255,0.2)" tickFormatter={(val) => `$${val}`} width={50} tick={{fontSize: 10}} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: '1px solid #334155' }} itemStyle={{ color: '#fff' }} />
                <Area type="monotone" dataKey="balance" stroke={endBalance > currentBalance ? "#10b981" : "#f43f5e"} strokeWidth={3} fillOpacity={1} fill="url(#colorFlow)" />
             </AreaChart>
          </ResponsiveContainer>
       </div>

       <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="bg-white/5 p-4 rounded-xl">
             <p className="text-xs text-white/40 uppercase">Avg Daily Net</p>
             <p className={`text-xl font-bold ${stats.netDaily >= 0 ? 'text-emerald-400' : 'text-rose-500'}`}>
                {stats.netDaily >= 0 ? '+' : ''}{stats.netDaily.toFixed(0)}
             </p>
          </div>
          <div className="bg-white/5 p-4 rounded-xl">
             <p className="text-xs text-white/40 uppercase">30-Day Forecast</p>
             <p className={`text-xl font-bold ${endBalance >= currentBalance ? 'text-emerald-400' : 'text-rose-500'}`}>
                ${endBalance.toLocaleString()}
             </p>
          </div>
       </div>
    </div>
  );
};
