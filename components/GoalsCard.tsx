import React, { useState } from 'react';
import { Target, Plus, Trash2 } from 'lucide-react';
import { Goal } from '../types';

interface GoalsCardProps {
  goals: Goal[];
  onAddGoal: (goal: Goal) => void;
  onDeleteGoal: (id: string) => void;
  onUpdateGoal: (goal: Goal) => void;
}

export const GoalsCard: React.FC<GoalsCardProps> = ({ goals, onAddGoal, onDeleteGoal, onUpdateGoal }) => {
  const [newGoal, setNewGoal] = useState({ name: '', targetAmount: 0, deadline: '' });

  const handleAdd = () => {
    if (!newGoal.name || newGoal.targetAmount <= 0) return;
    onAddGoal({
      id: Date.now().toString(),
      name: newGoal.name,
      targetAmount: newGoal.targetAmount,
      currentAmount: 0,
      deadline: newGoal.deadline,
      category: 'savings'
    });
    setNewGoal({ name: '', targetAmount: 0, deadline: '' });
  };

  return (
    <div className="bg-[#1e293b] p-6 rounded-3xl border border-white/5 space-y-4">
      <h3 className="text-lg font-black text-white flex items-center gap-2">
        <Target className="w-5 h-5 text-indigo-400" />
        Financial Goals
      </h3>
      <div className="space-y-3">
        {goals.map(goal => (
          <div key={goal.id} className="bg-white/5 p-4 rounded-2xl flex items-center justify-between">
            <div>
              <div className="font-bold text-white">{goal.name}</div>
              <div className="text-xs text-white/50">Target: ${goal.targetAmount} | Current: ${goal.currentAmount}</div>
              <div className="w-full bg-white/10 h-2 rounded-full mt-1">
                <div className="bg-indigo-500 h-2 rounded-full" style={{ width: `${Math.min((goal.currentAmount / goal.targetAmount) * 100, 100)}%` }}></div>
              </div>
            </div>
            <button onClick={() => onDeleteGoal(goal.id)} className="text-rose-400 hover:text-rose-300"><Trash2 className="w-5 h-5" /></button>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input type="text" placeholder="Goal Name" value={newGoal.name} onChange={e => setNewGoal({...newGoal, name: e.target.value})} className="bg-white/5 rounded-xl p-2 text-sm text-white flex-1" />
        <input type="number" placeholder="Amount" value={newGoal.targetAmount} onChange={e => setNewGoal({...newGoal, targetAmount: Number(e.target.value)})} className="bg-white/5 rounded-xl p-2 text-sm text-white w-20" />
        <button onClick={handleAdd} className="bg-indigo-600 p-2 rounded-xl text-white"><Plus className="w-5 h-5" /></button>
      </div>
    </div>
  );
};
