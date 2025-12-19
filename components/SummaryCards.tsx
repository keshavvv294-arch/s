
import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Wallet, PiggyBank, Edit3, DollarSign, X, Check } from 'lucide-react';
import { FinancialSummary } from '../types';

interface SummaryCardsProps {
  summary: FinancialSummary;
  privacyMode: boolean;
  onUpdateSalary: (amount: number) => void;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ summary, privacyMode, onUpdateSalary }) => {
  const [isEditingSalary, setIsEditingSalary] = useState(false);
  const [newSalary, setNewSalary] = useState(summary.salary.toString());

  const displayAmount = (amount: number) => {
     return privacyMode ? '••••••' : `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const handleSalarySave = () => {
    const val = parseFloat(newSalary);
    if (!isNaN(val)) {
      onUpdateSalary(val);
      setIsEditingSalary(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Main Balance - Minimalist */}
      <div className="bg-[#1e293b] p-8 rounded-[2.5rem] flex flex-col items-center text-center justify-center shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500"></div>
        <p className="text-white/40 text-xs font-bold uppercase tracking-[0.2em] mb-3">Net Liquidity</p>
        <h1 className={`text-6xl font-black text-white tracking-tighter ${privacyMode ? 'blur-md' : ''}`}>
          {displayAmount(summary.balance)}
        </h1>
        
        <div className="flex gap-10 mt-8">
           <div className="text-center">
              <div className="flex items-center justify-center gap-1.5 text-emerald-400 text-[10px] font-black uppercase tracking-wider mb-1">
                 <TrendingUp className="w-3.5 h-3.5" /> Income
              </div>
              <p className="text-white font-bold text-lg">{displayAmount(summary.totalIncome)}</p>
           </div>
           <div className="w-px bg-white/10 h-8 self-center"></div>
           <div className="text-center">
              <div className="flex items-center justify-center gap-1.5 text-rose-400 text-[10px] font-black uppercase tracking-wider mb-1">
                 <TrendingDown className="w-3.5 h-3.5" /> Expenses
              </div>
              <p className="text-white font-bold text-lg">{displayAmount(summary.totalExpense)}</p>
           </div>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
         {/* Monthly Salary Widget */}
         <div className="bg-[#1e293b] rounded-[2rem] p-6 flex flex-col justify-between border border-white/5 relative group transition-all hover:bg-[#252f44]">
            <div className="flex justify-between items-start mb-2">
               <span className="text-white/40 text-[10px] font-black uppercase tracking-wider">Expected Salary</span>
               <button 
                onClick={() => setIsEditingSalary(true)}
                className="p-1.5 rounded-lg bg-white/5 text-white/40 opacity-0 group-hover:opacity-100 hover:text-white transition-all"
               >
                  <Edit3 className="w-3.5 h-3.5" />
               </button>
            </div>
            {isEditingSalary ? (
              <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2">
                <input 
                  type="number" 
                  value={newSalary} 
                  onChange={(e) => setNewSalary(e.target.value)}
                  className="bg-black/20 border border-white/10 rounded-lg px-2 py-1 text-white font-bold w-full outline-none focus:border-indigo-500"
                  autoFocus
                />
                <button onClick={handleSalarySave} className="p-1.5 bg-emerald-500 rounded-lg text-white"><Check className="w-4 h-4" /></button>
                <button onClick={() => setIsEditingSalary(false)} className="p-1.5 bg-white/5 rounded-lg text-white/40"><X className="w-4 h-4" /></button>
              </div>
            ) : (
              <div className={`text-2xl font-black text-white ${privacyMode ? 'blur-sm' : ''}`}>
                {displayAmount(summary.salary)}
                <span className="text-[10px] text-white/30 font-normal uppercase ml-1">/mo</span>
              </div>
            )}
         </div>

         {/* Safe Spend Widget */}
         <div className="bg-[#1e293b] rounded-[2rem] p-6 flex flex-col justify-between border border-white/5">
            <div className="flex justify-between items-start mb-2">
               <span className="text-white/40 text-[10px] font-black uppercase tracking-wider">Safe to Spend</span>
               <Wallet className="w-4 h-4 text-emerald-400 opacity-80" />
            </div>
            <div className={`text-2xl font-black text-white ${privacyMode ? 'blur-sm' : ''}`}>
               {displayAmount(summary.dailySafeSpend)}
               <span className="text-[10px] text-white/30 font-normal uppercase ml-1">/day</span>
            </div>
         </div>

         {/* Savings Rate Widget */}
         <div className="bg-[#1e293b] rounded-[2rem] p-6 flex flex-col justify-between border border-white/5">
            <div className="flex justify-between items-start mb-2">
               <span className="text-white/40 text-[10px] font-black uppercase tracking-wider">Savings Rate</span>
               <PiggyBank className="w-4 h-4 text-indigo-400 opacity-80" />
            </div>
            <div className="flex items-end gap-2">
               <div className="text-2xl font-black text-white">{(summary.savingsRate * 100).toFixed(0)}%</div>
               <div className="text-[10px] text-emerald-400 font-bold mb-1.5 uppercase">Tgt 20%</div>
            </div>
         </div>
      </div>
    </div>
  );
};
