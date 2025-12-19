import React, { useState, useMemo } from 'react';
import { Debt } from '../types';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ShieldCheck, TrendingDown, Info, X } from 'lucide-react';

interface DebtStrategyProps {
  debts: Debt[];
  onClose: () => void;
}

export const DebtStrategy: React.FC<DebtStrategyProps> = ({ debts, onClose }) => {
  const [monthlyBudget, setMonthlyBudget] = useState(500); // Extra amount to pay off debt
  
  // Filter for payable debts only
  const myDebts = debts.filter(d => d.type === 'payable').map(d => ({
    ...d,
    interestRate: d.interestRate || 15, // Default 15% if not set
    minPayment: d.minPayment || d.amount * 0.03 // Default 3% min pay
  }));

  const calculatePayoff = (strategy: 'snowball' | 'avalanche') => {
    let sortedDebts = [...myDebts].map(d => ({...d, currentBalance: d.amount}));
    
    if (strategy === 'snowball') {
      sortedDebts.sort((a, b) => a.amount - b.amount); // Smallest balance first
    } else {
      sortedDebts.sort((a, b) => b.interestRate - a.interestRate); // Highest interest first
    }

    const timeline = [];
    let totalInterestPaid = 0;
    let month = 0;
    let totalBalance = sortedDebts.reduce((sum, d) => sum + d.currentBalance, 0);

    while (totalBalance > 0 && month < 120) { // Cap at 10 years
      let budget = monthlyBudget;
      let monthInterest = 0;

      // 1. Pay minimums
      sortedDebts.forEach(debt => {
        if (debt.currentBalance > 0) {
          const interest = debt.currentBalance * (debt.interestRate / 100 / 12);
          monthInterest += interest;
          totalInterestPaid += interest;
          debt.currentBalance += interest;
          
          const payment = Math.min(debt.currentBalance, debt.minPayment);
          debt.currentBalance -= payment;
          budget -= payment;
        }
      });

      // 2. Pay extra to target debt
      if (budget > 0) {
        for (let i = 0; i < sortedDebts.length; i++) {
          if (sortedDebts[i].currentBalance > 0) {
            const payment = Math.min(sortedDebts[i].currentBalance, budget);
            sortedDebts[i].currentBalance -= payment;
            budget -= payment;
            if (budget <= 0) break;
          }
        }
      }

      totalBalance = sortedDebts.reduce((sum, d) => sum + d.currentBalance, 0);
      timeline.push({ month, balance: Math.max(0, totalBalance) });
      month++;
    }

    return { timeline, totalInterestPaid, months: month };
  };

  const snowball = useMemo(() => calculatePayoff('snowball'), [monthlyBudget, myDebts]);
  const avalanche = useMemo(() => calculatePayoff('avalanche'), [monthlyBudget, myDebts]);

  const chartData = snowball.timeline.map((point, i) => ({
    month: point.month,
    Snowball: point.balance,
    Avalanche: avalanche.timeline[i]?.balance || 0
  }));

  if (myDebts.length === 0) {
    return (
      <div className="glass rounded-3xl p-8 flex flex-col items-center justify-center text-center h-full animate-in zoom-in duration-200">
         <div className="flex justify-between w-full absolute top-6 px-6">
            <h3 className="text-xl font-bold text-white">Debt Strategy</h3>
            <button onClick={onClose}><X className="w-6 h-6 text-white/40 hover:text-white" /></button>
         </div>
         <ShieldCheck className="w-16 h-16 text-emerald-500 mb-4 opacity-50" />
         <h3 className="text-2xl font-bold text-white">Debt Free!</h3>
         <p className="text-white/40 mt-2 max-w-xs">You have no payable debts recorded. Add debts in the "Debts" tool to use this strategist.</p>
      </div>
    );
  }

  return (
    <div className="glass rounded-3xl p-6 h-full overflow-y-auto animate-in slide-in-from-right duration-200">
       <div className="flex justify-between items-center mb-6">
         <h3 className="text-xl font-bold text-white flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-rose-400" /> Debt Strategy AI</h3>
         <button onClick={onClose} className="text-white/40 hover:text-white"><X className="w-6 h-6" /></button>
       </div>

       <div className="bg-black/20 p-4 rounded-xl mb-6 border border-white/5">
          <label className="text-xs text-white/50 uppercase font-bold mb-2 block">Monthly Payment Budget (Total)</label>
          <div className="flex items-center gap-4">
             <input 
               type="range" 
               min={myDebts.reduce((sum, d) => sum + d.minPayment, 0)} 
               max="5000" 
               step="50"
               value={monthlyBudget} 
               onChange={(e) => setMonthlyBudget(Number(e.target.value))}
               className="flex-1 h-2 bg-indigo-900 rounded-lg appearance-none cursor-pointer"
             />
             <span className="font-bold text-white w-16">${monthlyBudget}</span>
          </div>
       </div>

       <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-blue-500/10 border border-blue-500/30 p-4 rounded-xl">
             <h4 className="font-bold text-blue-400 mb-2 text-sm">Snowball (Momentum)</h4>
             <p className="text-2xl font-bold text-white">{snowball.months} <span className="text-sm font-normal text-white/50">months</span></p>
             <p className="text-xs text-white/40 mt-1">Interest: ${snowball.totalInterestPaid.toFixed(0)}</p>
             <p className="text-[10px] text-white/30 mt-2">Focuses on smallest balance first for psychological wins.</p>
          </div>
          <div className="bg-purple-500/10 border border-purple-500/30 p-4 rounded-xl">
             <h4 className="font-bold text-purple-400 mb-2 text-sm">Avalanche (Math)</h4>
             <p className="text-2xl font-bold text-white">{avalanche.months} <span className="text-sm font-normal text-white/50">months</span></p>
             <p className="text-xs text-white/40 mt-1">Interest: ${avalanche.totalInterestPaid.toFixed(0)}</p>
             <p className="text-[10px] text-white/30 mt-2">Focuses on highest interest first to save most money.</p>
          </div>
       </div>

       <div className="h-[250px] w-full bg-white/5 rounded-xl p-4 mb-4">
          <ResponsiveContainer width="100%" height="100%">
             <LineChart data={chartData}>
                <XAxis dataKey="month" stroke="rgba(255,255,255,0.2)" tick={{fontSize: 10}} />
                <YAxis stroke="rgba(255,255,255,0.2)" tick={{fontSize: 10}} tickFormatter={(val) => `$${val}`} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px' }} />
                <Legend />
                <Line type="monotone" dataKey="Snowball" stroke="#3b82f6" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Avalanche" stroke="#a855f7" strokeWidth={2} dot={false} />
             </LineChart>
          </ResponsiveContainer>
       </div>

       <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-lg flex gap-3 items-start">
          <Info className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <p className="text-xs text-white/70">
             {avalanche.totalInterestPaid < snowball.totalInterestPaid 
               ? `Avalanche saves you $${(snowball.totalInterestPaid - avalanche.totalInterestPaid).toFixed(0)} in interest.` 
               : `Both strategies yield similar results. Choose Snowball for motivation!`}
          </p>
       </div>
    </div>
  );
};