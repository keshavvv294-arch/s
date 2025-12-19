import React from 'react';
import { TrendingUp, TrendingDown, Wallet, PiggyBank } from 'lucide-react';
import { FinancialSummary } from '../types';

interface SummaryCardsProps {
  summary: FinancialSummary;
  privacyMode: boolean;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ summary, privacyMode }) => {
  const displayAmount = (amount: number) => {
     return privacyMode ? '••••••' : `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="space-y-4">
      {/* Main Balance - Minimalist */}
      <div className="bg-[#1e293b] p-6 rounded-3xl flex flex-col items-center text-center justify-center py-10 shadow-sm">
        <p className="text-white/40 text-sm font-medium uppercase tracking-widest mb-2">Total Balance</p>
        <h1 className={`text-5xl font-bold text-white tracking-tight ${privacyMode ? 'blur-sm' : ''}`}>
          {displayAmount(summary.balance)}
        </h1>
        <div className="flex gap-8 mt-6">
           <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-emerald-400 text-sm font-bold mb-1">
                 <TrendingUp className="w-3 h-3" /> Income
              </div>
              <p className="text-white/80">{displayAmount(summary.totalIncome)}</p>
           </div>
           <div className="w-px bg-white/10"></div>
           <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-rose-400 text-sm font-bold mb-1">
                 <TrendingDown className="w-3 h-3" /> Expense
              </div>
              <p className="text-white/80">{displayAmount(summary.totalExpense)}</p>
           </div>
        </div>
      </div>

      {/* Secondary Metrics - Simple Row */}
      <div className="grid grid-cols-2 gap-4">
         <div className="bg-[#1e293b] rounded-2xl p-5 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-2">
               <span className="text-white/40 text-xs font-bold uppercase">Safe to Spend</span>
               <Wallet className="w-4 h-4 text-emerald-400 opacity-80" />
            </div>
            <div className={`text-xl font-bold text-white ${privacyMode ? 'blur-sm' : ''}`}>
               {displayAmount(summary.dailySafeSpend)}
               <span className="text-xs text-white/30 font-normal"> /day</span>
            </div>
         </div>

         <div className="bg-[#1e293b] rounded-2xl p-5 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-2">
               <span className="text-white/40 text-xs font-bold uppercase">Savings Rate</span>
               <PiggyBank className="w-4 h-4 text-indigo-400 opacity-80" />
            </div>
            <div className="flex items-end gap-2">
               <div className="text-xl font-bold text-white">{(summary.savingsRate * 100).toFixed(0)}%</div>
               <div className="text-xs text-white/30 mb-1">target 20%</div>
            </div>
         </div>
      </div>
    </div>
  );
};