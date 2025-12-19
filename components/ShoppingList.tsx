
import React, { useState } from 'react';
import { ShoppingItem, Transaction } from '../types';
import { Plus, ShoppingCart, Check, Trash2, ArrowRight, Tag, AlertCircle } from 'lucide-react';

interface ShoppingListProps {
  items: ShoppingItem[];
  onAddItem: (item: ShoppingItem) => void;
  onDeleteItem: (id: string) => void;
  onToggleItem: (id: string) => void;
  onConvertToTransaction: (item: ShoppingItem) => void;
  currencySymbol: string;
}

export const ShoppingList: React.FC<ShoppingListProps> = ({ items, onAddItem, onDeleteItem, onToggleItem, onConvertToTransaction, currencySymbol }) => {
  const [newItemName, setNewItemName] = useState('');
  const [estPrice, setEstPrice] = useState('');
  const [priority, setPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');
  const [budget, setBudget] = useState(500); // Simulated monthly shopping budget

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newItemName) {
      onAddItem({
        id: Date.now().toString(),
        name: `${priority === 'High' ? '🔴 ' : priority === 'Medium' ? '🟡 ' : '🟢 '}${newItemName}`,
        estimatedPrice: Number(estPrice) || 0,
        isBought: false
      });
      setNewItemName('');
      setEstPrice('');
    }
  };

  const totalEstimated = items.filter(i => !i.isBought).reduce((sum, i) => sum + i.estimatedPrice, 0);
  const budgetProgress = Math.min((totalEstimated / budget) * 100, 100);

  return (
    <div className="space-y-6 pb-20 animate-in slide-in-from-right duration-200">
       <div className="bg-gradient-to-r from-orange-600 to-rose-600 p-6 rounded-2xl shadow-lg relative overflow-hidden">
          <div className="relative z-10">
             <div className="flex justify-between items-center mb-2">
                <p className="text-orange-100 text-xs uppercase font-bold tracking-wider">Planned Total</p>
                <ShoppingCart className="w-5 h-5 text-white/50" />
             </div>
             <h2 className="text-4xl font-bold text-white mb-4">{currencySymbol}{totalEstimated}</h2>
             
             <div className="bg-black/20 rounded-lg p-2 flex items-center gap-3">
                <div className="flex-1">
                   <div className="flex justify-between text-[10px] text-white/70 mb-1">
                      <span>Budget Usage</span>
                      <span>{Math.round(budgetProgress)}%</span>
                   </div>
                   <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
                      <div className={`h-full ${budgetProgress > 90 ? 'bg-red-300' : 'bg-white'}`} style={{width: `${budgetProgress}%`}}></div>
                   </div>
                </div>
             </div>
          </div>
       </div>

       <form onSubmit={handleAdd} className="bg-[#1e293b] p-4 rounded-xl border border-white/5 space-y-3">
          <div className="flex gap-2">
             <input 
               type="text" 
               placeholder="Item name..." 
               value={newItemName}
               onChange={(e) => setNewItemName(e.target.value)}
               className="flex-1 bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-orange-500"
             />
             <input 
               type="number" 
               placeholder="Price" 
               value={estPrice}
               onChange={(e) => setEstPrice(e.target.value)}
               className="w-20 bg-black/20 border border-white/10 rounded-xl px-2 py-2 text-white focus:outline-none focus:border-orange-500 text-center"
             />
          </div>
          <div className="flex gap-2">
             {['High', 'Medium', 'Low'].map(p => (
                <button 
                  key={p} 
                  type="button" 
                  onClick={() => setPriority(p as any)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${priority === p ? 'bg-white text-black' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
                >
                   {p}
                </button>
             ))}
             <button type="submit" className="px-4 bg-orange-600 rounded-lg text-white hover:bg-orange-500 transition-colors">
                <Plus className="w-5 h-5" />
             </button>
          </div>
       </form>

       <div className="space-y-2">
          {items.map(item => (
             <div key={item.id} className={`bg-[#1e293b] border border-white/5 p-4 rounded-xl flex items-center gap-3 transition-all group ${item.isBought ? 'opacity-40' : 'hover:border-orange-500/30'}`}>
                <button 
                  onClick={() => onToggleItem(item.id)}
                  className={`w-6 h-6 rounded-full border flex items-center justify-center transition-colors ${item.isBought ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-white/30 text-transparent hover:border-white'}`}
                >
                   <Check className="w-3 h-3" />
                </button>
                
                <div className="flex-1">
                   <p className={`font-medium text-white text-sm ${item.isBought ? 'line-through decoration-white/30' : ''}`}>{item.name}</p>
                   {item.estimatedPrice > 0 && <p className="text-xs text-white/40">{currencySymbol}{item.estimatedPrice}</p>}
                </div>

                {!item.isBought && (
                   <button 
                     onClick={() => onConvertToTransaction(item)}
                     className="px-3 py-1.5 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                   >
                      Buy <ArrowRight className="w-3 h-3" />
                   </button>
                )}

                <button onClick={() => onDeleteItem(item.id)} className="text-white/20 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity">
                   <Trash2 className="w-4 h-4" />
                </button>
             </div>
          ))}
          {items.length === 0 && (
             <div className="text-center text-white/30 py-8">
                <ShoppingCart className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p>List is empty</p>
             </div>
          )}
       </div>
    </div>
  );
};
