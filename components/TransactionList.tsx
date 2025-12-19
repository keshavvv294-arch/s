import React, { useState, useMemo } from 'react';
import { ArrowDownRight, ArrowUpRight, Trash2, ShoppingBag, Coffee, Home, Zap, Monitor, Activity, Search, Filter } from 'lucide-react';
import { Transaction, CATEGORIES } from '../types';

interface TransactionListProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
}

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'Shopping': return <ShoppingBag className="w-5 h-5" />;
    case 'Food': return <Coffee className="w-5 h-5" />;
    case 'Housing': return <Home className="w-5 h-5" />;
    case 'Utilities': return <Zap className="w-5 h-5" />;
    case 'Entertainment': return <Monitor className="w-5 h-5" />;
    default: return <Activity className="w-5 h-5" />;
  }
};

export const TransactionList: React.FC<TransactionListProps> = ({ transactions, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || t.type === filterType;
      const matchesCategory = filterCategory === 'All' || t.category === filterCategory;
      return matchesSearch && matchesType && matchesCategory;
    });
  }, [transactions, searchTerm, filterType, filterCategory]);

  return (
    <div className="glass rounded-3xl overflow-hidden flex flex-col h-full max-h-[600px]">
      {/* Header & Controls */}
      <div className="p-6 border-b border-white/10 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-white">Recent Activity</h3>
          <button 
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`p-2 rounded-lg transition-colors ${isFilterOpen ? 'bg-indigo-500 text-white' : 'text-white/50 hover:bg-white/5'}`}
          >
            <Filter className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input 
            type="text" 
            placeholder="Search transactions..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-black/20 border border-white/5 rounded-xl py-2 pl-10 pr-4 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-white/20"
          />
        </div>

        {/* Filters Panel */}
        {isFilterOpen && (
          <div className="flex flex-wrap gap-2 animate-in slide-in-from-top-2">
             <select 
               value={filterType}
               onChange={(e) => setFilterType(e.target.value as any)}
               className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white outline-none"
             >
               <option value="all" className="bg-slate-900">All Types</option>
               <option value="income" className="bg-slate-900">Income</option>
               <option value="expense" className="bg-slate-900">Expense</option>
             </select>
             <select 
               value={filterCategory}
               onChange={(e) => setFilterCategory(e.target.value)}
               className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white outline-none"
             >
               <option value="All" className="bg-slate-900">All Categories</option>
               {CATEGORIES.map(c => <option key={c} value={c} className="bg-slate-900">{c}</option>)}
             </select>
          </div>
        )}
      </div>
      
      {/* List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {filteredTransactions.length === 0 ? (
          <div className="p-10 text-center text-white/40 flex flex-col items-center">
             <Search className="w-8 h-8 mb-2 opacity-50" />
            <p>No transactions found.</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <tbody className="divide-y divide-white/5">
              {filteredTransactions.map((t) => (
                <tr key={t.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-2xl ${t.type === 'income' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                         {getCategoryIcon(t.category)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-white text-sm truncate max-w-[120px] sm:max-w-[200px]">{t.description}</p>
                        <p className="text-xs text-white/40">{t.date} • {t.category}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    <p className={`font-bold ${t.type === 'income' ? 'text-emerald-400' : 'text-white'}`}>
                      {t.type === 'income' ? '+' : '-'}${t.amount.toFixed(2)}
                    </p>
                  </td>
                  <td className="px-2 py-4 text-right w-10">
                     <button
                      onClick={() => onDelete(t.id)}
                      className="p-2 text-white/20 hover:text-rose-400 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};