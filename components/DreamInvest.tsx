
import React, { useState } from 'react';
import { X, Rocket, Plus, DollarSign, Trash2 } from 'lucide-react';
import { Transaction } from '../types';

interface DreamInvestProps {
  onClose: () => void;
  onInvest: (t: Omit<Transaction, 'id'>) => void;
}

export const DreamInvest: React.FC<DreamInvestProps> = ({ onClose, onInvest }) => {
  const [goals, setGoals] = useState([
    { id: 1, name: 'Bali Trip', target: 2000, current: 450, icon: '🏝️' },
    { id: 2, name: 'MacBook Pro', target: 2500, current: 1200, icon: '💻' }
  ]);
  const [isAdding, setIsAdding] = useState(false);
  const [newGoal, setNewGoal] = useState({ name: '', target: '', icon: '🎯' });

  const handleAdd = () => {
     if(newGoal.name && newGoal.target) {
        setGoals([...goals, { id: Date.now(), name: newGoal.name, target: Number(newGoal.target), current: 0, icon: newGoal.icon }]);
        setIsAdding(false);
        setNewGoal({ name: '', target: '', icon: '🎯' });
     }
  };

  const handleInvest = (id: number, name: string) => {
     const amount = 50; // Micro-invest amount
     // Update local state
     setGoals(goals.map(g => g.id === id ? { ...g, current: g.current + amount } : g));
     // Create transaction
     onInvest({
        description: `Invested in ${name}`,
        amount: amount,
        type: 'expense',
        category: 'Investment',
        date: new Date().toISOString().split('T')[0],
        status: 'cleared',
        notes: 'Dream Invest Micro-contribution'
     });
  };

  return (
    <div className="glass rounded-3xl p-6 h-full animate-in zoom-in duration-200 overflow-y-auto">
       <div className="flex justify-between items-center mb-6">
         <h3 className="text-xl font-bold text-white flex items-center gap-2"><Rocket className="w-5 h-5 text-purple-400" /> Dream Invest</h3>
         <button onClick={onClose} className="text-white/40 hover:text-white"><X className="w-6 h-6" /></button>
       </div>

       {isAdding ? (
          <div className="bg-white/5 p-4 rounded-2xl mb-4 space-y-3 border border-white/10">
             <input type="text" placeholder="Goal Name" className="w-full bg-black/20 p-2 rounded text-white" onChange={e => setNewGoal({...newGoal, name: e.target.value})} />
             <input type="number" placeholder="Target Amount" className="w-full bg-black/20 p-2 rounded text-white" onChange={e => setNewGoal({...newGoal, target: e.target.value})} />
             <div className="flex gap-2">
                <button onClick={() => setIsAdding(false)} className="flex-1 py-2 text-white/50">Cancel</button>
                <button onClick={handleAdd} className="flex-1 py-2 bg-purple-600 rounded text-white font-bold">Save</button>
             </div>
          </div>
       ) : null}

       <div className="grid grid-cols-2 gap-4">
          {goals.map(goal => {
             const progress = Math.min((goal.current / goal.target) * 100, 100);
             return (
               <div key={goal.id} className="bg-white/5 p-4 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors group relative overflow-hidden flex flex-col justify-between h-[180px]">
                  <div>
                     <div className="text-4xl mb-3">{goal.icon}</div>
                     <h4 className="font-bold text-white truncate">{goal.name}</h4>
                     <p className="text-xs text-white/50 mb-3">${goal.current} / ${goal.target}</p>
                  </div>
                  
                  <div>
                     <div className="h-1.5 bg-black/30 rounded-full overflow-hidden mb-3">
                        <div className="h-full bg-purple-500 transition-all duration-500" style={{ width: `${progress}%` }}></div>
                     </div>
                     <button 
                        onClick={() => handleInvest(goal.id, goal.name)}
                        className="w-full py-2 bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1"
                     >
                        <Plus className="w-3 h-3" /> $50
                     </button>
                  </div>
               </div>
             );
          })}
          
          <button onClick={() => setIsAdding(true)} className="border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center gap-2 text-white/30 hover:text-white hover:border-white/30 transition-all min-h-[180px]">
             <Plus className="w-8 h-8" />
             <span className="text-xs font-bold uppercase">Add Dream</span>
          </button>
       </div>
    </div>
  );
};
