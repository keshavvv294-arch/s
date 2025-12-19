
import React, { useState } from 'react';
import { X, Microscope, RefreshCw, Briefcase, Home } from 'lucide-react';
import { AreaChart, Area, Tooltip, ResponsiveContainer, XAxis } from 'recharts';

interface DigitalTwinProps {
  currentNetWorth: number;
  onClose: () => void;
}

export const DigitalTwin: React.FC<DigitalTwinProps> = ({ currentNetWorth, onClose }) => {
  const [salary, setSalary] = useState(5000);
  const [expenses, setExpenses] = useState(3000);
  const [marketReturn, setMarketReturn] = useState(7);

  const data = React.useMemo(() => {
     let nw = currentNetWorth;
     const points = [];
     for(let year=0; year<=20; year++) {
        nw = nw * (1 + marketReturn/100) + (salary - expenses) * 12;
        points.push({ year: `Y${year}`, value: Math.round(nw) });
     }
     return points;
  }, [currentNetWorth, salary, expenses, marketReturn]);

  return (
    <div className="glass rounded-3xl p-6 h-full animate-in slide-in-from-bottom-4 duration-200 overflow-y-auto">
       <div className="flex justify-between items-center mb-6">
         <h3 className="text-xl font-bold text-white flex items-center gap-2"><Microscope className="w-5 h-5 text-cyan-400" /> Digital Twin</h3>
         <button onClick={onClose} className="text-white/40 hover:text-white"><X className="w-6 h-6" /></button>
       </div>

       <div className="h-[200px] w-full bg-black/20 rounded-2xl p-4 mb-6 border border-white/5">
          <ResponsiveContainer width="100%" height="100%">
             <AreaChart data={data}>
                <defs>
                   <linearGradient id="twinColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                   </linearGradient>
                </defs>
                <XAxis dataKey="year" hide />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px' }} itemStyle={{ color: '#fff' }} formatter={(val:number) => `$${(val/1000).toFixed(0)}k`} />
                <Area type="monotone" dataKey="value" stroke="#06b6d4" strokeWidth={3} fillOpacity={1} fill="url(#twinColor)" />
             </AreaChart>
          </ResponsiveContainer>
       </div>

       <div className="space-y-4">
          <div>
             <div className="flex justify-between text-xs text-white/60 mb-2"><span>Monthly Income</span><span>${salary}</span></div>
             <input type="range" min="1000" max="20000" value={salary} onChange={e => setSalary(Number(e.target.value))} className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-500" />
          </div>
          <div>
             <div className="flex justify-between text-xs text-white/60 mb-2"><span>Monthly Expenses</span><span>${expenses}</span></div>
             <input type="range" min="500" max="15000" value={expenses} onChange={e => setExpenses(Number(e.target.value))} className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-rose-500" />
          </div>
          <div>
             <div className="flex justify-between text-xs text-white/60 mb-2"><span>Market Return</span><span>{marketReturn}%</span></div>
             <input type="range" min="-5" max="15" value={marketReturn} onChange={e => setMarketReturn(Number(e.target.value))} className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-500" />
          </div>
       </div>

       <div className="mt-6 p-4 bg-cyan-900/20 border border-cyan-500/20 rounded-xl text-center">
          <p className="text-xs text-cyan-200 uppercase">Net Worth in 20 Years</p>
          <h2 className="text-3xl font-bold text-white mt-1">${(data[20].value/1000000).toFixed(2)}M</h2>
       </div>
    </div>
  );
};
