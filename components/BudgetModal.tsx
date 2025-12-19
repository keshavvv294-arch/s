import React, { useState } from 'react';
import { CATEGORIES, Budget } from '../types';
import { X, Save, AlertCircle } from 'lucide-react';

interface BudgetModalProps {
  budgets: Budget[];
  onSave: (budgets: Budget[]) => void;
  onClose: () => void;
  currencySymbol: string;
}

export const BudgetModal: React.FC<BudgetModalProps> = ({ budgets, onSave, onClose, currencySymbol }) => {
  const [localBudgets, setLocalBudgets] = useState<Budget[]>(() => {
    return CATEGORIES.map(cat => {
      const existing = budgets.find(b => b.category === cat);
      return existing || { category: cat, limit: 0 };
    });
  });

  const handleChange = (category: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    setLocalBudgets(prev => prev.map(b => b.category === category ? { ...b, limit: numValue } : b));
  };

  const handleSave = () => {
    onSave(localBudgets.filter(b => b.limit > 0));
    onClose();
  };

  const totalBudget = localBudgets.reduce((sum, b) => sum + b.limit, 0);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-[#1e293b] border border-white/10 rounded-3xl w-full max-w-md overflow-hidden animate-in zoom-in duration-200 flex flex-col max-h-[80vh]">
        <div className="flex justify-between items-center p-6 border-b border-white/10">
          <div>
            <h2 className="text-xl font-bold text-white">Monthly Budgets</h2>
            <p className="text-white/40 text-xs">Total: {currencySymbol}{totalBudget.toLocaleString()}</p>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-4">
          <div className="bg-indigo-500/10 border border-indigo-500/20 p-3 rounded-xl flex items-center gap-3 text-indigo-300 text-sm">
             <AlertCircle className="w-5 h-5 shrink-0" />
             Set spending limits for each category to track your progress in Reports.
          </div>

          {localBudgets.map((budget) => (
             <div key={budget.category} className="flex items-center gap-4">
                <label className="w-32 text-sm font-medium text-white/70 truncate">{budget.category}</label>
                <div className="relative flex-1">
                   <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30">{currencySymbol}</span>
                   <input 
                     type="number"
                     min="0"
                     value={budget.limit || ''}
                     onChange={(e) => handleChange(budget.category, e.target.value)}
                     className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-8 pr-3 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                     placeholder="No Limit"
                   />
                </div>
             </div>
          ))}
        </div>

        <div className="p-6 border-t border-white/10 bg-[#1e293b]">
           <button 
             onClick={handleSave}
             className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors"
           >
              <Save className="w-5 h-5" /> Save Budgets
           </button>
        </div>
      </div>
    </div>
  );
};