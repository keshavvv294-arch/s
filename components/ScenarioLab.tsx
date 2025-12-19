import React, { useState } from 'react';
import { Microscope, X, ArrowRight, CheckCircle, AlertTriangle } from 'lucide-react';

interface ScenarioLabProps {
  currentSavings: number;
  monthlySavings: number;
  onClose: () => void;
}

export const ScenarioLab: React.FC<ScenarioLabProps> = ({ currentSavings, monthlySavings, onClose }) => {
  const [cost, setCost] = useState<number>(0);
  const [name, setName] = useState('');
  
  const impact = currentSavings - cost;
  const recoveryMonths = cost > 0 && monthlySavings > 0 ? Math.ceil(cost / monthlySavings) : 0;

  return (
    <div className="glass rounded-3xl p-6 h-full animate-in zoom-in duration-200">
       <div className="flex justify-between items-center mb-6">
         <h3 className="text-xl font-bold text-white flex items-center gap-2"><Microscope className="w-5 h-5 text-cyan-400" /> Scenario Lab</h3>
         <button onClick={onClose} className="text-white/40 hover:text-white"><X className="w-6 h-6" /></button>
       </div>

       <div className="space-y-6">
          <div className="bg-cyan-900/20 p-4 rounded-xl border border-cyan-500/30">
             <p className="text-cyan-200 text-sm font-medium mb-2">Simulate a Big Purchase</p>
             <input 
               type="text" 
               placeholder="e.g. Tesla Model 3" 
               className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white text-sm mb-3 focus:border-cyan-500 outline-none"
               onChange={(e) => setName(e.target.value)}
             />
             <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">$</span>
                <input 
                  type="number" 
                  placeholder="Cost" 
                  className="w-full bg-black/20 border border-white/10 rounded-lg p-3 pl-8 text-white text-sm focus:border-cyan-500 outline-none"
                  onChange={(e) => setCost(Number(e.target.value))}
                />
             </div>
          </div>

          {cost > 0 && (
             <div className="space-y-4 animate-in slide-in-from-bottom-4">
                <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl">
                   <div className="text-center">
                      <p className="text-xs text-white/40 uppercase">Current Balance</p>
                      <p className="font-bold text-white text-lg">${currentSavings.toLocaleString()}</p>
                   </div>
                   <ArrowRight className="w-5 h-5 text-white/20" />
                   <div className="text-center">
                      <p className="text-xs text-white/40 uppercase">After Purchase</p>
                      <p className={`font-bold text-lg ${impact < 0 ? 'text-rose-500' : 'text-emerald-400'}`}>${impact.toLocaleString()}</p>
                   </div>
                </div>

                <div className={`p-4 rounded-xl border ${impact < 0 ? 'bg-rose-900/20 border-rose-500/30' : 'bg-emerald-900/20 border-emerald-500/30'}`}>
                   <h4 className={`font-bold flex items-center gap-2 ${impact < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {impact < 0 ? <AlertTriangle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                      {impact < 0 ? 'Financial Risk!' : 'Safe to Buy'}
                   </h4>
                   <p className="text-white/60 text-sm mt-2">
                      {impact < 0 
                         ? "This purchase exceeds your current savings. You would go into debt." 
                         : `You can afford this. It will take you approximately ${recoveryMonths} months to save this amount back based on your current savings rate.`}
                   </p>
                </div>
             </div>
          )}
       </div>
    </div>
  );
};