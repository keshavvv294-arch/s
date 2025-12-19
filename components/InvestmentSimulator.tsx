
import React, { useState } from 'react';
import { TrendingUp, X, Activity, BrainCircuit } from 'lucide-react';
import { Asset } from '../types';
import { simulateInvestmentPortfolio } from '../services/geminiService';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

interface InvestmentSimulatorProps {
  onClose: () => void;
  assets: Asset[]; // Current portfolio
}

export const InvestmentSimulator: React.FC<InvestmentSimulatorProps> = ({ onClose, assets }) => {
  const [monthlyContribution, setMonthlyContribution] = useState(500);
  const [scenario, setScenario] = useState<'bull' | 'bear' | 'crash'>('bull');
  const [isSimulating, setIsSimulating] = useState(false);
  const [data, setData] = useState<any[]>([]);

  const handleSimulate = async () => {
    setIsSimulating(true);
    try {
       const result = await simulateInvestmentPortfolio(assets, monthlyContribution, scenario);
       setData(result);
    } catch (e) {
       console.error(e);
    } finally {
       setIsSimulating(false);
    }
  };

  return (
    <div className="glass rounded-3xl p-6 h-full animate-in slide-in-from-bottom-4 duration-200 flex flex-col">
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
                <label className="text-xs text-white/50 uppercase font-bold mb-2 block">Market Scenario</label>
                <div className="flex gap-2">
                   {['bull', 'bear', 'crash'].map(s => (
                      <button 
                        key={s} 
                        onClick={() => setScenario(s as any)}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold capitalize transition-all ${scenario === s ? 'bg-white text-indigo-900' : 'bg-white/5 text-white/40'}`}
                      >
                         {s}
                      </button>
                   ))}
                </div>
             </div>

             <button 
               onClick={handleSimulate}
               disabled={isSimulating}
               className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
             >
                {isSimulating ? 'Simulating...' : 'Run Simulation'} <Activity className="w-4 h-4" />
             </button>
          </div>
       </div>

       <div className="flex-1 bg-black/20 rounded-2xl p-4 border border-white/5 relative overflow-hidden flex flex-col justify-center">
          {data.length > 0 ? (
             <>
                <ResponsiveContainer width="100%" height="100%">
                   <AreaChart data={data}>
                      <defs>
                         <linearGradient id="colorSim" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={scenario === 'crash' ? '#f43f5e' : '#10b981'} stopOpacity={0.3}/>
                            <stop offset="95%" stopColor={scenario === 'crash' ? '#f43f5e' : '#10b981'} stopOpacity={0}/>
                         </linearGradient>
                      </defs>
                      <XAxis dataKey="label" stroke="rgba(255,255,255,0.2)" tick={{fontSize: 10}} />
                      <YAxis stroke="rgba(255,255,255,0.2)" tick={{fontSize: 10}} tickFormatter={(val) => `${val/1000}k`} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: '1px solid #334155' }} formatter={(val: number) => `$${val.toLocaleString()}`} />
                      <Area type="monotone" dataKey="value" stroke={scenario === 'crash' ? '#f43f5e' : '#10b981'} strokeWidth={3} fillOpacity={1} fill="url(#colorSim)" />
                   </AreaChart>
                </ResponsiveContainer>
                <div className="text-center mt-2">
                   <p className="text-xs text-white/40">Projected Value in 5 Years</p>
                   <p className={`text-xl font-bold ${scenario === 'crash' ? 'text-rose-400' : 'text-emerald-400'}`}>
                      ${data[data.length-1].value.toLocaleString()}
                   </p>
                </div>
             </>
          ) : (
             <div className="text-center text-white/30">
                <TrendingUp className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p>Run simulation to see projections</p>
             </div>
          )}
       </div>
    </div>
  );
};
