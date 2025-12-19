
import React, { useState } from 'react';
import { FinancialSummary, Debt, Asset } from '../types';
import { X, Map, Sparkles, CheckCircle, Target, ArrowRight } from 'lucide-react';
import { generatePersonalizedRoadmap } from '../services/geminiService';

interface FinancialRoadmapProps {
  summary: FinancialSummary;
  debts: Debt[];
  assets: Asset[];
  onClose: () => void;
}

export const FinancialRoadmap: React.FC<FinancialRoadmapProps> = ({ summary, debts, assets, onClose }) => {
  const [goal, setGoal] = useState('');
  const [loading, setLoading] = useState(false);
  const [roadmap, setRoadmap] = useState<any[]>([]);

  const generateRoadmap = async () => {
    if (!goal) return;
    setLoading(true);
    
    const financialData = {
       balance: summary.balance,
       debt: debts.reduce((sum, d) => sum + d.amount, 0),
       income: summary.salary
    };

    try {
       const steps = await generatePersonalizedRoadmap(goal, financialData);
       setRoadmap(steps);
    } catch (e) {
       console.error(e);
    } finally {
       setLoading(false);
    }
  };

  return (
    <div className="glass rounded-3xl p-6 h-full animate-in slide-in-from-right duration-200 overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-white flex items-center gap-2"><Map className="w-5 h-5 text-indigo-400" /> AI Roadmap</h3>
        <button onClick={onClose} className="text-white/40 hover:text-white"><X className="w-6 h-6" /></button>
      </div>

      {!roadmap.length ? (
        <div className="flex flex-col h-full justify-center items-center text-center space-y-6">
           <div className="w-20 h-20 rounded-full bg-indigo-500/20 flex items-center justify-center animate-pulse">
              <Sparkles className="w-10 h-10 text-indigo-400" />
           </div>
           <h2 className="text-2xl font-bold text-white">What's your next big milestone?</h2>
           <input 
             type="text" 
             placeholder="e.g. Buy a Car, Wedding, Debt Free" 
             className="w-full max-w-sm bg-black/20 border border-white/10 rounded-xl p-4 text-white text-center text-lg outline-none focus:border-indigo-500"
             value={goal}
             onChange={e => setGoal(e.target.value)}
           />
           <button 
             onClick={generateRoadmap}
             disabled={loading || !goal}
             className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl disabled:opacity-50 transition-all flex items-center gap-2"
           >
              {loading ? 'AI Designing Plan...' : 'Generate Plan'} <ArrowRight className="w-4 h-4" />
           </button>
        </div>
      ) : (
        <div className="space-y-6 relative">
           <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-white/10"></div>
           {roadmap.map((step, idx) => (
              <div key={idx} className="relative pl-12 animate-in slide-in-from-bottom-4" style={{ animationDelay: `${idx * 100}ms` }}>
                 <div className="absolute left-2 top-0 -translate-x-1/2 w-4 h-4 rounded-full bg-indigo-500 border-4 border-[#1e293b]"></div>
                 <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                    <div className="flex justify-between items-start mb-2">
                       <span className="text-xs font-bold text-indigo-400 uppercase">{step.month}</span>
                       <span className="text-white/60 font-mono text-xs">{step.amount}</span>
                    </div>
                    <h4 className="font-bold text-white">{step.action}</h4>
                 </div>
              </div>
           ))}
           <button onClick={() => setRoadmap([])} className="w-full py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl mt-4">Start Over</button>
        </div>
      )}
    </div>
  );
};
