
import React, { useState } from 'react';
import { Debt } from '../types';
import { Plus, ArrowUpRight, ArrowDownLeft, Trash2, CheckCircle, User, DollarSign, Wallet } from 'lucide-react';

interface DebtManagerProps {
  debts: Debt[];
  onAddDebt: (debt: Debt) => void;
  onDeleteDebt: (id: string) => void;
  currencySymbol: string;
}

export const DebtManager: React.FC<DebtManagerProps> = ({ debts, onAddDebt, onDeleteDebt, currencySymbol }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newDebt, setNewDebt] = useState<Partial<Debt>>({ type: 'receivable' });

  const handleAdd = () => {
    if (newDebt.person && newDebt.amount) {
      onAddDebt({
        id: Date.now().toString(),
        person: newDebt.person,
        amount: Number(newDebt.amount),
        type: newDebt.type as 'payable' | 'receivable',
        dueDate: newDebt.dueDate,
        notes: newDebt.notes,
        interestRate: 0 // Simplified for basic add
      });
      setIsAdding(false);
      setNewDebt({ type: 'receivable' });
    }
  };

  const handlePayOff = (id: string) => {
     if(window.confirm('Mark this debt as fully paid? This will delete the record.')) {
        onDeleteDebt(id);
     }
  };

  const totalReceivable = debts.filter(d => d.type === 'receivable').reduce((sum, d) => sum + d.amount, 0);
  const totalPayable = debts.filter(d => d.type === 'payable').reduce((sum, d) => sum + d.amount, 0);

  return (
    <div className="space-y-6 pb-20 animate-in fade-in">
       {/* Net Position Card */}
       <div className="bg-[#1e293b] p-6 rounded-2xl shadow-lg border border-white/5 flex flex-col items-center">
          <p className="text-white/50 text-xs font-bold uppercase tracking-wider mb-2">Net Position</p>
          <h2 className={`text-4xl font-bold ${totalReceivable - totalPayable >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
             {totalReceivable - totalPayable >= 0 ? '+' : ''}{currencySymbol}{Math.abs(totalReceivable - totalPayable)}
          </h2>
          <div className="grid grid-cols-2 gap-8 w-full mt-6">
             <div className="text-center border-r border-white/10">
                <p className="text-emerald-400 text-xs font-bold uppercase mb-1">To Collect</p>
                <p className="text-white text-xl font-bold">{currencySymbol}{totalReceivable}</p>
             </div>
             <div className="text-center">
                <p className="text-rose-400 text-xs font-bold uppercase mb-1">To Pay</p>
                <p className="text-white text-xl font-bold">{currencySymbol}{totalPayable}</p>
             </div>
          </div>
       </div>

       <div className="flex justify-between items-center px-2">
          <h2 className="text-xl font-bold text-white">Active Records</h2>
          <button onClick={() => setIsAdding(true)} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-lg shadow-indigo-500/20">
             <Plus className="w-4 h-4" /> Add New
          </button>
       </div>

       {isAdding && (
          <div className="bg-[#1e293b] rounded-2xl p-4 space-y-3 animate-in slide-in-from-top-2 border border-white/10 shadow-xl">
             <div className="bg-black/20 p-1 rounded-xl flex">
                <button 
                  onClick={() => setNewDebt({...newDebt, type: 'receivable'})}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${newDebt.type === 'receivable' ? 'bg-emerald-600 text-white shadow' : 'text-white/40 hover:text-white'}`}
                >
                   I Lent
                </button>
                <button 
                  onClick={() => setNewDebt({...newDebt, type: 'payable'})}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${newDebt.type === 'payable' ? 'bg-rose-600 text-white shadow' : 'text-white/40 hover:text-white'}`}
                >
                   I Borrowed
                </button>
             </div>
             <input 
               type="text" 
               placeholder="Person Name" 
               className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white focus:border-indigo-500 outline-none"
               onChange={e => setNewDebt({...newDebt, person: e.target.value})}
             />
             <div className="flex gap-3">
               <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-xs">{currencySymbol}</span>
                  <input 
                    type="number" 
                    placeholder="Amount" 
                    className="w-full bg-black/20 border border-white/10 rounded-xl p-3 pl-8 text-white focus:border-indigo-500 outline-none"
                    onChange={e => setNewDebt({...newDebt, amount: Number(e.target.value)})}
                  />
               </div>
               <input 
                 type="date" 
                 className="flex-1 bg-black/20 border border-white/10 rounded-xl p-3 text-white focus:border-indigo-500 outline-none"
                 onChange={e => setNewDebt({...newDebt, dueDate: e.target.value})}
               />
             </div>
             <div className="flex justify-end gap-3 mt-2">
                <button onClick={() => setIsAdding(false)} className="px-4 py-2 text-white/40 hover:text-white text-sm">Cancel</button>
                <button onClick={handleAdd} className="px-6 py-2 bg-indigo-600 rounded-xl text-white font-bold text-sm hover:bg-indigo-500">Save Record</button>
             </div>
          </div>
       )}

       <div className="space-y-3">
          {debts.map(debt => (
             <div key={debt.id} className="bg-[#1e293b] p-4 rounded-xl flex items-center justify-between border border-white/5 hover:border-white/10 transition-colors group">
                <div className="flex items-center gap-4">
                   <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${debt.type === 'receivable' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                      {debt.person.charAt(0)}
                   </div>
                   <div>
                      <h4 className="font-bold text-white text-base">{debt.person}</h4>
                      <p className={`text-xs font-bold ${debt.type === 'receivable' ? 'text-emerald-400' : 'text-rose-400'}`}>
                         {debt.type === 'receivable' ? 'Owes you' : 'You owe'} {currencySymbol}{debt.amount.toLocaleString()}
                      </p>
                      {debt.dueDate && <p className="text-[10px] text-white/30 mt-1 flex items-center gap-1"><ArrowUpRight className="w-3 h-3" /> Due {debt.dueDate}</p>}
                   </div>
                </div>
                <button 
                  onClick={() => handlePayOff(debt.id)}
                  className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold text-white border border-white/10 flex items-center gap-2 transition-all"
                >
                   <CheckCircle className="w-3 h-3 text-emerald-400" /> Settle
                </button>
             </div>
          ))}
          {debts.length === 0 && !isAdding && (
             <div className="text-center text-white/30 py-10 flex flex-col items-center">
                <Wallet className="w-12 h-12 mb-3 opacity-20" />
                <p>No active debts found.</p>
             </div>
          )}
       </div>
    </div>
  );
};
