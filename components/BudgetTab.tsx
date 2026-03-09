import React, { useState, useMemo } from 'react';
import { CATEGORIES, Budget, Transaction } from '../types';
import { Save, AlertCircle, PieChart, BrainCircuit, Loader2, TrendingDown, Wallet, Target } from 'lucide-react';
import { geminiClient as ai } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

interface BudgetTabProps {
  budgets: Budget[];
  transactions: Transaction[];
  onSave: (budgets: Budget[]) => void;
  currencySymbol: string;
}

export const BudgetTab: React.FC<BudgetTabProps> = ({ budgets, transactions, onSave, currencySymbol }) => {
  const [localBudgets, setLocalBudgets] = useState<Budget[]>(() => {
    return CATEGORIES.map(cat => {
      const existing = budgets.find(b => b.category === cat);
      return existing || { category: cat, limit: 0 };
    });
  });
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const getSpentAmount = (category: string) => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    return transactions
      .filter(t => t.type === 'expense' && t.category === category)
      .filter(t => {
        const d = new Date(t.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      })
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setAiAdvice(null);
    try {
      const budgetData = localBudgets.filter(b => b.limit > 0).map(b => ({
        category: b.category,
        limit: b.limit,
        spent: getSpentAmount(b.category)
      }));

      const prompt = `
        Analyze my monthly budget and current spending. Provide a short, actionable 3-bullet point advice on how to improve my finances.
        Data: ${JSON.stringify(budgetData)}
        Currency: ${currencySymbol}
      `;
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt
      });
      setAiAdvice(response.text || "No advice available right now.");
    } catch (e) {
      setAiAdvice("Failed to generate advice. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleChange = (category: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    setLocalBudgets(prev => prev.map(b => b.category === category ? { ...b, limit: numValue } : b));
  };

  const handleSave = () => {
    onSave(localBudgets.filter(b => b.limit > 0));
  };

  const totalBudget = localBudgets.reduce((sum, b) => sum + b.limit, 0);
  const totalSpent = localBudgets.reduce((sum, b) => sum + getSpentAmount(b.category), 0);
  const overallProgress = totalBudget > 0 ? Math.min((totalSpent / totalBudget) * 100, 100) : 0;
  const isOverallOver = totalBudget > 0 && totalSpent > totalBudget;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass p-6 rounded-3xl flex flex-col justify-between relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl -mr-10 -mt-10 transition-all group-hover:bg-indigo-500/20"></div>
           <div className="flex items-center gap-3 mb-4 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                 <Target className="w-5 h-5" />
              </div>
              <h3 className="text-white/60 font-medium">Total Budget</h3>
           </div>
           <p className="text-3xl font-bold text-white relative z-10">{currencySymbol}{totalBudget.toLocaleString()}</p>
        </div>

        <div className="glass p-6 rounded-3xl flex flex-col justify-between relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-2xl -mr-10 -mt-10 transition-all group-hover:bg-rose-500/20"></div>
           <div className="flex items-center gap-3 mb-4 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center text-rose-400">
                 <TrendingDown className="w-5 h-5" />
              </div>
              <h3 className="text-white/60 font-medium">Total Spent</h3>
           </div>
           <p className="text-3xl font-bold text-white relative z-10">{currencySymbol}{totalSpent.toLocaleString()}</p>
        </div>

        <div className="glass p-6 rounded-3xl flex flex-col justify-between relative overflow-hidden group">
           <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl -mr-10 -mt-10 transition-all ${isOverallOver ? 'bg-rose-500/10 group-hover:bg-rose-500/20' : 'bg-emerald-500/10 group-hover:bg-emerald-500/20'}`}></div>
           <div className="flex items-center gap-3 mb-4 relative z-10">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isOverallOver ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                 <Wallet className="w-5 h-5" />
              </div>
              <h3 className="text-white/60 font-medium">Remaining</h3>
           </div>
           <p className={`text-3xl font-bold relative z-10 ${isOverallOver ? 'text-rose-400' : 'text-emerald-400'}`}>
              {currencySymbol}{Math.max(0, totalBudget - totalSpent).toLocaleString()}
           </p>
        </div>
      </div>

      {/* Main Budget Section */}
      <div className="glass rounded-3xl overflow-hidden flex flex-col">
        <div className="p-6 border-b border-white/5 bg-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
           <div>
             <h2 className="text-xl font-bold text-white flex items-center gap-2">
               <PieChart className="w-5 h-5 text-indigo-400" /> Category Limits
             </h2>
             <p className="text-white/40 text-sm mt-1">Set spending limits for each category.</p>
           </div>
           <button 
             onClick={handleSave}
             className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-500/20"
           >
              <Save className="w-4 h-4" /> Save Changes
           </button>
        </div>

        <div className="p-6">
          {totalBudget > 0 && (
             <div className="mb-8 p-5 bg-black/20 rounded-2xl border border-white/5">
                <div className="flex justify-between items-end mb-2">
                   <span className="text-sm font-medium text-white/60">Overall Progress</span>
                   <span className="text-lg font-bold text-white">{overallProgress.toFixed(0)}%</span>
                </div>
                <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${isOverallOver ? 'bg-rose-500' : overallProgress > 80 ? 'bg-orange-500' : 'bg-emerald-500'}`}
                    style={{ width: `${overallProgress}%` }}
                  />
                </div>
             </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {localBudgets.map((budget) => {
               const spent = getSpentAmount(budget.category);
               const progress = budget.limit > 0 ? Math.min((spent / budget.limit) * 100, 100) : 0;
               const isOver = budget.limit > 0 && spent > budget.limit;
               
               return (
                 <div key={budget.category} className="flex flex-col gap-3 bg-white/5 hover:bg-white/10 transition-colors p-5 rounded-2xl border border-white/5 group">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-bold text-white/80 truncate">{budget.category}</label>
                      <div className="relative w-28">
                         <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-sm">{currencySymbol}</span>
                         <input 
                           type="number"
                           min="0"
                           value={budget.limit || ''}
                           onChange={(e) => handleChange(budget.category, e.target.value)}
                           className="w-full bg-black/40 border border-white/10 rounded-xl py-2 pl-8 pr-3 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                           placeholder="0"
                         />
                      </div>
                    </div>
                    
                    <div className="mt-2">
                      <div className="flex justify-between text-xs mb-1.5 font-medium">
                        <span className={isOver ? 'text-rose-400' : 'text-white/50'}>
                          Spent: {currencySymbol}{spent.toLocaleString()}
                        </span>
                        {budget.limit > 0 && (
                           <span className={isOver ? 'text-rose-400' : 'text-white/50'}>{progress.toFixed(0)}%</span>
                        )}
                      </div>
                      <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${isOver ? 'bg-rose-500' : progress > 80 ? 'bg-orange-500' : 'bg-emerald-500'}`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                 </div>
               );
            })}
          </div>
        </div>
      </div>

      {/* AI Advisor Section */}
      <div className="glass rounded-3xl overflow-hidden border border-indigo-500/20 relative">
         <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
         <div className="p-6 relative z-10">
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
             <div>
               <h3 className="text-lg font-bold text-indigo-400 flex items-center gap-2">
                 <BrainCircuit className="w-5 h-5" /> AI Budget Advisor
               </h3>
               <p className="text-white/50 text-sm mt-1">Get personalized insights based on your spending habits.</p>
             </div>
             <button 
               onClick={handleAnalyze}
               disabled={isAnalyzing}
               className="px-5 py-2.5 bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/40 hover:text-indigo-200 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50 border border-indigo-500/30"
             >
               {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <BrainCircuit className="w-4 h-4" />}
               {aiAdvice ? 'Refresh Insights' : 'Generate Insights'}
             </button>
           </div>
           
           {aiAdvice && (
             <div className="bg-black/20 p-6 rounded-2xl border border-indigo-500/20 prose prose-invert prose-sm max-w-none text-white/80 leading-relaxed animate-in slide-in-from-top-4">
               <ReactMarkdown>{aiAdvice}</ReactMarkdown>
             </div>
           )}
         </div>
      </div>
    </div>
  );
};
