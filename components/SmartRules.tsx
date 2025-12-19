
import React, { useState } from 'react';
import { AutomationRule } from '../types';
import { Wand2, Plus, Trash2, Check, X } from 'lucide-react';

interface SmartRulesProps {
  onClose: () => void;
}

export const SmartRules: React.FC<SmartRulesProps> = ({ onClose }) => {
  const [rules, setRules] = useState<AutomationRule[]>([
    { id: '1', name: 'Auto Tag Uber', conditionField: 'description', conditionOperator: 'contains', conditionValue: 'Uber', actionType: 'tag', actionValue: '#transport', isActive: true },
    { id: '2', name: 'Coffee is Need', conditionField: 'description', conditionOperator: 'contains', conditionValue: 'Starbucks', actionType: 'categorize', actionValue: 'Food', isActive: true },
  ]);
  const [isAdding, setIsAdding] = useState(false);
  const [newRule, setNewRule] = useState<Partial<AutomationRule>>({});

  const addRule = () => {
    if(newRule.name && newRule.conditionValue) {
       setRules([...rules, { ...newRule, id: Date.now().toString(), isActive: true } as AutomationRule]);
       setIsAdding(false);
       setNewRule({});
    }
  };

  return (
    <div className="glass rounded-3xl p-6 h-full overflow-y-auto animate-in slide-in-from-right duration-200">
       <div className="flex justify-between items-center mb-6">
         <h3 className="text-xl font-bold text-white flex items-center gap-2"><Wand2 className="w-5 h-5 text-amber-400" /> Auto Rules</h3>
         <button onClick={onClose} className="text-white/40 hover:text-white"><X className="w-6 h-6" /></button>
       </div>

       <p className="text-white/50 text-sm mb-4">Automatically categorize or tag transactions when they match specific conditions.</p>

       <div className="space-y-3">
          {rules.map(rule => (
             <div key={rule.id} className="bg-white/5 p-4 rounded-xl border border-white/5 flex justify-between items-center">
                <div>
                   <h4 className="font-bold text-white">{rule.name}</h4>
                   <p className="text-xs text-white/40 mt-1">
                      If {rule.conditionField} {rule.conditionOperator} "{rule.conditionValue}" → {rule.actionType} "{rule.actionValue}"
                   </p>
                </div>
                <div className="flex items-center gap-3">
                   <div className={`w-3 h-3 rounded-full ${rule.isActive ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                   <button onClick={() => setRules(rules.filter(r => r.id !== rule.id))} className="text-white/20 hover:text-rose-400"><Trash2 className="w-4 h-4" /></button>
                </div>
             </div>
          ))}
       </div>

       {isAdding ? (
          <div className="mt-4 bg-indigo-500/10 p-4 rounded-xl border border-indigo-500/30 space-y-3">
             <input type="text" placeholder="Rule Name" className="w-full bg-black/20 p-2 rounded text-white text-sm" onChange={e => setNewRule({...newRule, name: e.target.value})} />
             <div className="flex gap-2">
                <select className="bg-black/20 text-white text-xs p-2 rounded" onChange={e => setNewRule({...newRule, conditionField: e.target.value as any})}><option>Description</option><option>Amount</option></select>
                <select className="bg-black/20 text-white text-xs p-2 rounded" onChange={e => setNewRule({...newRule, conditionOperator: e.target.value as any})}><option value="contains">Contains</option><option value="equals">Equals</option></select>
                <input type="text" placeholder="Value" className="bg-black/20 p-2 rounded text-white text-xs flex-1" onChange={e => setNewRule({...newRule, conditionValue: e.target.value})} />
             </div>
             <div className="flex gap-2 items-center">
                <span className="text-white/40 text-xs">Then</span>
                <select className="bg-black/20 text-white text-xs p-2 rounded" onChange={e => setNewRule({...newRule, actionType: e.target.value as any})}><option value="tag">Tag</option><option value="categorize">Set Category</option></select>
                <input type="text" placeholder="Action Value" className="bg-black/20 p-2 rounded text-white text-xs flex-1" onChange={e => setNewRule({...newRule, actionValue: e.target.value})} />
             </div>
             <button onClick={addRule} className="w-full bg-indigo-600 text-white py-2 rounded-lg font-bold text-sm mt-2">Save Rule</button>
          </div>
       ) : (
          <button onClick={() => setIsAdding(true)} className="w-full mt-4 py-3 border border-dashed border-white/20 text-white/40 rounded-xl hover:bg-white/5 hover:text-white transition-all flex items-center justify-center gap-2">
             <Plus className="w-4 h-4" /> Create New Rule
          </button>
       )}
    </div>
  );
};
