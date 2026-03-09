
import React, { useState } from 'react';
import { TrendingUp, X, Activity, BrainCircuit, Sparkles } from 'lucide-react';
import { Asset } from '../types';
import { getInvestmentProjection } from '../services/geminiService';

interface InvestmentSimulatorProps {
  onClose: () => void;
  assets: Asset[]; // Current portfolio
}

export const InvestmentSimulator: React.FC<InvestmentSimulatorProps> = ({ onClose, assets }) => {
  const [monthlyContribution, setMonthlyContribution] = useState(500);
  const [years, setYears] = useState(5);
  const [isSimulating, setIsSimulating] = useState(false);
  const [result, setResult] = useState<{ projection: number; advice: string } | null>(null);

  const handleSimulate = async () => {
    setIsSimulating(true);
    try {
       const res = await getInvestmentProjection(assets, monthlyContribution, years);
       setResult(res);
    } catch (e) {
       console.error(e);
    } finally {
       setIsSimulating(false);
    }
  };

  return (
    <div className="glass rounded-3xl p-6 h-full animate-in slide-in-from-bottom-4 duration-200 flex flex-col overflow-y-auto">
       <div className="flex justify-between items-center mb-6">
         <h3 className="text-xl font-bold text-white flex items-center gap-2"><BrainCircuit className="w-5 h-5 text-indigo-400" /> AI Investment Sim</h3>
         <button onClick={onClose} className="text-white/40 hover:text-white"><X className="w-6 h-6" /></button>
       </div>

       <div className="space-y-4 mb-6">
          <div className="bg-black/20 p-4 rounded-xl border border-white/5 space-y-3">
             <div>
                <label className="text-xs text-white/50 uppercase font-bold">Monthly Contribution ($)</label>
                <input 
                  type="number" 
                  value={monthlyContribution} 
                  onChange={(e) => setMonthlyContribution(Number(e.target.value))}
                  className="w-full bg-transparent border-b border-white/10 py-2 text-white font-bold outline-none focus:border-indigo-500"
                />
             </div>
             
             <div>
                <label className="text-xs text-white/50 uppercase font-bold">Years</label>
                <input 
                  type="number" 
                  value={years} 
                  onChange={(e) => setYears(Number(e.target.value))}
                  className="w-full bg-transparent border-b border-white/10 py-2 text-white font-bold outline-none focus:border-indigo-500"
                />
             </div>

             <button 
               onClick={handleSimulate}
               disabled={isSimulating}
               className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
             >
                {isSimulating ? 'Simulating...' : 'Run AI Simulation'} <Activity className="w-4 h-4" />
             </button>
          </div>
       </div>

       {result ? (
          <div className="flex-1 bg-black/20 rounded-2xl p-6 border border-white/5 flex flex-col justify-center animate-in fade-in duration-300">
             <div className="text-center mb-6">
                <p className="text-xs text-white/40 uppercase">Projected Value in {years} Years</p>
                <h2 className="text-4xl font-bold text-emerald-400 mt-1">${result.projection.toLocaleString()}</h2>
             </div>
             
             <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2"><Sparkles className="w-4 h-4 text-indigo-400" /> AI Advice</h4>
                <p className="text-sm text-white/60">{result.advice}</p>
             </div>
          </div>
       ) : (
          <div className="text-center text-white/30 flex-1 flex items-center justify-center">
             <p>Run simulation to see AI projections</p>
          </div>
       )}
    </div>
  );
};
