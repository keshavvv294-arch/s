
import React from 'react';
import { X, Heart, ShoppingBag, Music, Link2, Check } from 'lucide-react';
import { Transaction } from '../types';

interface LifestyleFinanceProps {
  transactions: Transaction[];
  onClose: () => void;
}

export const LifestyleFinance: React.FC<LifestyleFinanceProps> = ({ onClose }) => {
  const apps = [
    { name: 'Strava', icon: Heart, connected: true, color: 'text-orange-500' },
    { name: 'Amazon', icon: ShoppingBag, connected: false, color: 'text-yellow-500' },
    { name: 'Spotify', icon: Music, connected: true, color: 'text-green-500' }
  ];

  return (
    <div className="glass rounded-3xl p-6 h-full animate-in zoom-in duration-200">
       <div className="flex justify-between items-center mb-6">
         <h3 className="text-xl font-bold text-white flex items-center gap-2"><Link2 className="w-5 h-5 text-rose-400" /> Lifestyle Sync</h3>
         <button onClick={onClose} className="text-white/40 hover:text-white"><X className="w-6 h-6" /></button>
       </div>

       <p className="text-white/50 text-sm mb-6">Connect apps to auto-adjust your budget based on your lifestyle.</p>

       <div className="space-y-3 mb-8">
          {apps.map((app, i) => (
             <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
                <div className="flex items-center gap-4">
                   <div className={`p-2 bg-white/10 rounded-xl ${app.color}`}>
                      <app.icon className="w-6 h-6" />
                   </div>
                   <span className="font-bold text-white">{app.name}</span>
                </div>
                <button className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${app.connected ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/10 text-white/40'}`}>
                   {app.connected ? 'Connected' : 'Connect'}
                </button>
             </div>
          ))}
       </div>

       <div className="bg-gradient-to-br from-indigo-600/20 to-purple-600/20 p-4 rounded-xl border border-indigo-500/30">
          <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2"><Heart className="w-4 h-4 text-rose-400" /> Health Insight</h4>
          <p className="text-xs text-white/70 leading-relaxed">
             You hit your running goal this week! We've moved $20 from your "Health" budget to "Entertainment" as a reward.
          </p>
       </div>
    </div>
  );
};
