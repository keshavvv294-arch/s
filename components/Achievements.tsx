import React from 'react';
import { Badge, Transaction, Asset } from '../types';
import { Award, Lock } from 'lucide-react';

interface AchievementsProps {
  transactions: Transaction[];
  assets: Asset[];
  streak: number;
}

export const Achievements: React.FC<AchievementsProps> = ({ transactions, assets, streak }) => {
  const BADGES: Badge[] = [
    {
      id: 'first-step',
      name: 'First Step',
      icon: '🌱',
      description: 'Track your first transaction',
      condition: (data) => data.transactions.length > 0,
    },
    {
      id: 'saver',
      name: 'Super Saver',
      icon: '🐷',
      description: 'Save more than $1000 in assets',
      condition: (data) => data.assets.reduce((sum: number, a: Asset) => sum + (a.amount * a.value), 0) > 1000,
    },
    {
      id: 'streak-7',
      name: 'Week Warrior',
      icon: '🔥',
      description: 'Maintain a 7-day streak',
      condition: (data) => data.streak >= 7,
    },
    {
      id: 'investor',
      name: 'Seed Investor',
      icon: '📈',
      description: 'Add your first investment asset',
      condition: (data) => data.assets.length > 0,
    },
    {
      id: 'diversified',
      name: 'Diversified',
      icon: '🎨',
      description: 'Hold 3 different types of assets',
      condition: (data) => new Set(data.assets.map((a: Asset) => a.type)).size >= 3,
    },
    {
      id: 'debt-free',
      name: 'Debt Destroyer',
      icon: '🛡️',
      description: 'Log a debt repayment (Coming soon)',
      condition: () => false, // Placeholder
    }
  ];

  return (
    <div className="space-y-4 animate-in fade-in">
       <h3 className="text-lg font-bold text-white flex items-center gap-2 px-2">
          <Award className="w-5 h-5 text-yellow-400" /> Achievements
       </h3>
       
       <div className="grid grid-cols-2 gap-3">
          {BADGES.map(badge => {
             const isUnlocked = badge.condition({ transactions, assets, streak });
             
             return (
               <div 
                 key={badge.id} 
                 className={`relative p-4 rounded-2xl border transition-all ${
                    isUnlocked 
                      ? 'bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border-indigo-500/50' 
                      : 'bg-white/5 border-white/5 opacity-60'
                 }`}
               >
                  <div className="flex justify-between items-start mb-2">
                     <div className="text-2xl">{isUnlocked ? badge.icon : '🔒'}</div>
                     {isUnlocked && <div className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">UNLOCKED</div>}
                  </div>
                  <h4 className={`font-bold text-sm ${isUnlocked ? 'text-white' : 'text-white/50'}`}>{badge.name}</h4>
                  <p className="text-xs text-white/40 mt-1">{badge.description}</p>
               </div>
             );
          })}
       </div>
    </div>
  );
};