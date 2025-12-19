
import React, { useState, useEffect } from 'react';
import { X, PieChart as PieIcon, TrendingUp, DollarSign } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, Tooltip, XAxis, YAxis } from 'recharts';

interface SmartCalculatorProps {
  toolId: string;
  onClose: () => void;
}

export const SmartCalculator: React.FC<SmartCalculatorProps> = ({ toolId, onClose }) => {
  const [inputs, setInputs] = useState<Record<string, number>>({});
  const [result, setResult] = useState<any>(null);

  // Default Configurations based on Tool ID
  const getConfig = () => {
    switch(toolId) {
      case 'sip-calc':
        return {
          title: 'SIP Calculator',
          fields: [
            { id: 'monthly', label: 'Monthly ($)', def: 500 },
            { id: 'rate', label: 'Return Rate (%)', def: 12 },
            { id: 'years', label: 'Time Period (Yr)', def: 10 }
          ],
          type: 'growth'
        };
      case 'emi-calc':
        return {
          title: 'EMI Calculator',
          fields: [
            { id: 'loan', label: 'Loan Amount ($)', def: 100000 },
            { id: 'rate', label: 'Interest (%)', def: 9 },
            { id: 'years', label: 'Tenure (Yr)', def: 20 }
          ],
          type: 'breakdown'
        };
      case 'roi-calc':
         return {
            title: 'ROI Calculator',
            fields: [
               { id: 'invested', label: 'Invested ($)', def: 1000 },
               { id: 'returned', label: 'Returned ($)', def: 1500 }
            ],
            type: 'simple'
         };
      default: // Generic fallback for others
        return {
           title: toolId.replace(/-/g, ' ').toUpperCase(),
           fields: [{ id: 'val1', label: 'Value 1', def: 0 }, { id: 'val2', label: 'Value 2', def: 0 }],
           type: 'simple'
        };
    }
  };

  const config = getConfig();

  // Initialize Inputs
  useEffect(() => {
    const initial: Record<string, number> = {};
    config.fields.forEach(f => initial[f.id] = f.def);
    setInputs(initial);
  }, [toolId]);

  // Calculate Logic
  useEffect(() => {
    if (Object.keys(inputs).length === 0) return;

    if (toolId === 'sip-calc') {
       const m = inputs.monthly;
       const r = inputs.rate / 100 / 12;
       const n = inputs.years * 12;
       const fv = m * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
       const invested = m * n;
       
       // Generate Graph Data
       const graphData = [];
       for(let i=1; i<=inputs.years; i++) {
          const months = i * 12;
          const val = m * ((Math.pow(1 + r, months) - 1) / r) * (1 + r);
          graphData.push({ year: i, value: Math.round(val), invested: Math.round(m * months) });
       }

       setResult({ total: fv, invested, gain: fv - invested, graph: graphData });
    } else if (toolId === 'emi-calc') {
       const p = inputs.loan;
       const r = inputs.rate / 12 / 100;
       const n = inputs.years * 12;
       const emi = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
       const totalPay = emi * n;
       
       setResult({ 
          total: totalPay, 
          emi: emi, 
          principal: p, 
          interest: totalPay - p 
       });
    } else if (toolId === 'roi-calc') {
       const gain = inputs.returned - inputs.invested;
       const roi = (gain / inputs.invested) * 100;
       setResult({ total: roi, gain });
    }
  }, [inputs, toolId]);

  const COLORS = ['#6366f1', '#10b981'];

  return (
    <div className="glass rounded-3xl p-6 h-full animate-in zoom-in duration-300 flex flex-col">
       <div className="flex justify-between items-center mb-6">
         <h3 className="text-xl font-bold text-white flex items-center gap-2">
            {config.type === 'growth' ? <TrendingUp className="w-5 h-5 text-emerald-400" /> : <PieIcon className="w-5 h-5 text-indigo-400" />}
            {config.title}
         </h3>
         <button onClick={onClose} className="text-white/40 hover:text-white"><X className="w-6 h-6" /></button>
       </div>

       {/* Visualization Area */}
       <div className="flex-1 bg-black/20 rounded-2xl mb-6 relative overflow-hidden flex flex-col items-center justify-center p-4">
          {config.type === 'growth' && result?.graph && (
             <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={result.graph}>
                   <defs>
                      <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                         <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                         <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                   </defs>
                   <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px' }} formatter={(val:number) => `$${val.toLocaleString()}`} />
                   <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorVal)" />
                   <Area type="monotone" dataKey="invested" stroke="#6366f1" strokeWidth={2} fillOpacity={0.1} fill="#6366f1" />
                </AreaChart>
             </ResponsiveContainer>
          )}

          {config.type === 'breakdown' && result && (
             <div className="flex items-center w-full justify-around">
                <div className="h-48 w-48 relative">
                   <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                         <Pie 
                           data={[{name: 'Principal', value: result.principal}, {name: 'Interest', value: result.interest}]} 
                           innerRadius={60} 
                           outerRadius={80} 
                           dataKey="value"
                           stroke="none"
                        >
                           <Cell fill="#6366f1" />
                           <Cell fill="#f43f5e" />
                        </Pie>
                      </PieChart>
                   </ResponsiveContainer>
                   <div className="absolute inset-0 flex items-center justify-center flex-col">
                      <span className="text-xs text-white/50">EMI</span>
                      <span className="font-bold text-white">${result?.emi?.toFixed(0)}</span>
                   </div>
                </div>
             </div>
          )}

          {config.type === 'simple' && result && (
             <div className="text-center">
                <p className="text-white/50 uppercase text-sm mb-2">{toolId === 'roi-calc' ? 'Total Return' : 'Result'}</p>
                <h2 className="text-5xl font-bold text-emerald-400">{result.total.toFixed(2)}%</h2>
                <p className="text-white mt-2">${result.gain?.toFixed(2)} Profit</p>
             </div>
          )}
       </div>

       {/* Result Summary */}
       {toolId === 'sip-calc' && result && (
          <div className="grid grid-cols-2 gap-4 mb-6">
             <div className="bg-white/5 p-3 rounded-xl">
                <p className="text-xs text-white/40">Invested</p>
                <p className="text-lg font-bold text-white">${result.invested.toLocaleString()}</p>
             </div>
             <div className="bg-white/5 p-3 rounded-xl border border-emerald-500/20">
                <p className="text-xs text-white/40">Wealth Gained</p>
                <p className="text-lg font-bold text-emerald-400">+${result.gain.toLocaleString()}</p>
             </div>
          </div>
       )}

       {toolId === 'emi-calc' && result && (
          <div className="grid grid-cols-2 gap-4 mb-6">
             <div className="bg-white/5 p-3 rounded-xl">
                <p className="text-xs text-white/40">Principal</p>
                <p className="text-lg font-bold text-indigo-400">${result.principal.toLocaleString()}</p>
             </div>
             <div className="bg-white/5 p-3 rounded-xl border border-rose-500/20">
                <p className="text-xs text-white/40">Interest Payable</p>
                <p className="text-lg font-bold text-rose-400">${result.interest.toFixed(0)}</p>
             </div>
          </div>
       )}

       {/* Inputs */}
       <div className="space-y-4">
          {config.fields.map(field => (
             <div key={field.id}>
                <div className="flex justify-between text-xs font-bold text-white/60 mb-2">
                   <span>{field.label}</span>
                   <span>{inputs[field.id]}</span>
                </div>
                <input 
                  type="range" 
                  min={toolId === 'roi-calc' ? 0 : 1}
                  max={field.id === 'loan' ? 1000000 : field.id === 'monthly' ? 5000 : field.id === 'rate' ? 30 : 50}
                  step={field.id === 'rate' ? 0.1 : 100}
                  value={inputs[field.id] || 0}
                  onChange={(e) => setInputs({...inputs, [field.id]: parseFloat(e.target.value)})}
                  className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${toolId === 'emi-calc' ? 'bg-indigo-900 accent-indigo-500' : 'bg-emerald-900 accent-emerald-500'}`}
                />
             </div>
          ))}
       </div>
    </div>
  );
};
