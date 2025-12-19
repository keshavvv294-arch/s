import React, { useState } from 'react';
import { X, Wallet, CreditCard, Landmark, Coins } from 'lucide-react';
import { Account } from '../types';

interface AccountFormProps {
  onAddAccount: (account: Omit<Account, 'id'>) => void;
  onClose: () => void;
}

export const AccountForm: React.FC<AccountFormProps> = ({ onAddAccount, onClose }) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<Account['type']>('bank');
  const [balance, setBalance] = useState('');
  const [color, setColor] = useState('bg-indigo-500');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && balance) {
      onAddAccount({
        name,
        type,
        initialBalance: parseFloat(balance),
        currency: 'USD', // Default for now, could be dynamic
        color
      });
      onClose();
    }
  };

  const TYPE_ICONS = {
    bank: Landmark,
    cash: Coins,
    wallet: Wallet,
    credit: CreditCard
  };

  const COLORS = [
    'bg-indigo-500', 'bg-emerald-500', 'bg-rose-500', 'bg-amber-500', 
    'bg-purple-500', 'bg-cyan-500', 'bg-slate-500', 'bg-pink-500'
  ];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-[#1e293b] border border-white/10 rounded-3xl w-full max-w-md animate-in zoom-in duration-200">
        <div className="flex justify-between items-center p-6 border-b border-white/10">
          <h2 className="text-xl font-bold text-white">Add Account</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white"><X className="w-6 h-6" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
           <div>
              <label className="text-xs font-bold text-white/50 uppercase mb-2 block">Account Type</label>
              <div className="grid grid-cols-4 gap-2">
                 {(Object.keys(TYPE_ICONS) as Array<keyof typeof TYPE_ICONS>).map(t => {
                    const Icon = TYPE_ICONS[t];
                    return (
                       <button 
                         key={t}
                         type="button"
                         onClick={() => setType(t)}
                         className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${type === t ? 'bg-white/10 border-white/30 text-white' : 'border-transparent text-white/40 hover:bg-white/5'}`}
                       >
                          <Icon className="w-6 h-6" />
                          <span className="text-[10px] uppercase font-bold">{t}</span>
                       </button>
                    );
                 })}
              </div>
           </div>

           <div>
              <label className="text-xs font-bold text-white/50 uppercase mb-2 block">Account Details</label>
              <div className="space-y-3">
                 <input 
                   type="text" 
                   value={name}
                   onChange={e => setName(e.target.value)}
                   placeholder="Account Name (e.g. HDFC Main)"
                   className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white focus:border-indigo-500 outline-none"
                   required
                 />
                 <input 
                   type="number" 
                   value={balance}
                   onChange={e => setBalance(e.target.value)}
                   placeholder="Current Balance"
                   className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white focus:border-indigo-500 outline-none"
                   required
                 />
              </div>
           </div>

           <div>
              <label className="text-xs font-bold text-white/50 uppercase mb-2 block">Color Tag</label>
              <div className="flex gap-2 flex-wrap">
                 {COLORS.map(c => (
                    <button 
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-8 h-8 rounded-full ${c} ${color === c ? 'ring-2 ring-white ring-offset-2 ring-offset-[#1e293b]' : 'opacity-50 hover:opacity-100'} transition-all`}
                    />
                 ))}
              </div>
           </div>

           <button 
             type="submit"
             className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20 transition-all mt-4"
           >
              Create Account
           </button>
        </form>
      </div>
    </div>
  );
};