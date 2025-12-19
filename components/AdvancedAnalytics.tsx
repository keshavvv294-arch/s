import React, { useState, useMemo } from 'react';
import { Transaction, FinancialSummary } from '../types';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { GitMerge, LineChart, Timer, X, Calendar, TrendingUp } from 'lucide-react';

interface AdvancedAnalyticsProps {
  toolId: string;
  transactions: Transaction[];
  summary: FinancialSummary;
  onClose: () => void;
}

export const AdvancedAnalytics: React.FC<AdvancedAnalyticsProps> = ({ toolId, transactions, summary, onClose }) => {
  const [inflationRate, setInflationRate] = useState(3);
  const [years, setYears] = useState(10);

  // --- Feature 1: Cash Flow Map (Sankey Simulation) ---
  const renderCashFlowMap = () => {
    const expensesByCategory = transactions
      .filter(t => t.type === 'expense')
      .reduce((acc: Record<string, number>, t) => ({ 
        ...acc, 
        [t.category]: (acc[t.category] || 0) + t.amount 
      }), {} as Record<string, number>);
    
    const categories = Object.entries(expensesByCategory).sort((a: [string, number], b: [string, number]) => b[1] - a[1]);
    const maxVal = Math.max(summary.totalIncome || 0, summary.totalExpense || 0) || 1; // Prevent division by zero

    return (
      <div className="space-y-4 h-full flex flex-col">
         <h3 className="text-white font-bold flex items-center gap-2"><GitMerge className="w-5 h-5 text-pink-500" /> Cash Flow DNA</h3>
         <div className="bg-[#0f172a] p-6 rounded-2xl relative flex-1 min-h-[300px] flex justify-between items-center overflow-hidden border border-white/5">
            {/* Source */}
            <div className="flex flex-col gap-2 z-10">
               <div className="bg-emerald-600 p-4 rounded-xl text-center w-24 shadow-lg shadow-emerald-500/20">
                  <div className="text-xs text-emerald-100">Income</div>
                  <div className="font-bold text-white">${summary.totalIncome}</div>
               </div>
            </div>

            {/* Flows (SVG Lines) */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
               <defs>
                  <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" style={{stopColor:'#10b981', stopOpacity:0.4}} />
                    <stop offset="100%" style={{stopColor:'#f43f5e', stopOpacity:0.4}} />
                  </linearGradient>
               </defs>
               <path d="M 100 150 C 180 150, 180 80, 260 80" fill="none" stroke="#10b981" strokeWidth={Math.max(2, (summary.balance/maxVal)*20)} strokeOpacity="0.3" />
               {categories.map((cat, i) => {
                  const yPos = 80 + (i * 60);
                  const val = cat[1] as number;
                  const strokeW = Math.max(1, (val/maxVal)*30);
                  return (
                     <path key={i} d={`M 100 150 C 180 150, 180 ${yPos}, 260 ${yPos}`} fill="none" stroke="url(#grad1)" strokeWidth={strokeW} strokeOpacity="0.5" />
                  );
               })}
            </svg>

            {/* Targets */}
            <div className="flex flex-col gap-4 z-10 max-h-full overflow-y-auto pr-2 custom-scrollbar">
               {summary.balance > 0 && (
                  <div className="bg-indigo-600 p-2 rounded-xl text-center w-32 text-xs text-white">
                     Savings: ${summary.balance.toFixed(0)}
                  </div>
               )}
               {categories.map(([cat, val]) => (
                  <div key={cat} className="bg-rose-600/80 p-2 rounded-xl text-center w-32 text-xs text-white flex justify-between px-3">
                     <span className="truncate">{cat}</span>
                     <span>${(val as number).toFixed(0)}</span>
                  </div>
               ))}
            </div>
         </div>
      </div>
    );
  };

  // --- Feature 2: Predictive Forecaster ---
  const renderForecaster = () => {
    const data = [];
    let currentBalance = summary.netWorth; // Start with current net worth
    const monthlyBurn = summary.totalExpense / 30 * 30; // Approx monthly
    const monthlyIncome = summary.salary; // Use salary target
    const monthlySavings = monthlyIncome - monthlyBurn;

    // Use a slightly more complex compound growth model
    for (let i = 0; i <= 12; i++) { // 12 Months forecast
       data.push({ month: `M${i}`, balance: currentBalance });
       // Assume 5% annual return on savings if positive
       if (currentBalance > 0) currentBalance *= (1 + 0.05/12);
       currentBalance += monthlySavings;
    }

    return (
      <div className="space-y-4">
         <h3 className="text-white font-bold flex items-center gap-2"><LineChart className="w-5 h-5 text-violet-500" /> Wealth AI Projection</h3>
         <div className="h-[300px] w-full bg-black/20 rounded-2xl p-4 border border-white/5">
            <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={data}>
                  <defs>
                     <linearGradient id="colorBal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                     </linearGradient>
                  </defs>
                  <Tooltip contentStyle={{backgroundColor: '#1e293b', border: 'none', borderRadius: '12px'}} formatter={(val: number) => `$${val.toFixed(0)}`} />
                  <Area type="monotone" dataKey="balance" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorBal)" />
               </AreaChart>
            </ResponsiveContainer>
         </div>
         <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-white/5 p-3 rounded-xl border border-white/5">
               <div className="text-xs text-white/40 mb-1">Current</div>
               <div className="font-bold text-white text-lg">${data[0].balance.toLocaleString(undefined, {maximumFractionDigits:0})}</div>
            </div>
            <div className="bg-white/5 p-3 rounded-xl border border-white/5">
               <div className="text-xs text-white/40 mb-1">6 Months</div>
               <div className="font-bold text-emerald-400 text-lg">${data[6].balance.toLocaleString(undefined, {maximumFractionDigits:0})}</div>
            </div>
            <div className="bg-white/5 p-3 rounded-xl border border-white/5">
               <div className="text-xs text-white/40 mb-1">1 Year</div>
               <div className="font-bold text-emerald-400 text-lg">${data[12].balance.toLocaleString(undefined, {maximumFractionDigits:0})}</div>
            </div>
         </div>
         <div className="bg-violet-500/10 p-3 rounded-xl border border-violet-500/20 text-xs text-violet-200 flex gap-2">
            <TrendingUp className="w-4 h-4 shrink-0" />
            <span>Projection assumes consistent income and a 5% annual return on invested savings. Market volatility not included.</span>
         </div>
      </div>
    );
  };

  // --- Feature 9: Inflation Time Machine ---
  const renderTimeMachine = () => {
    const currentPower = 10000;
    const futurePower = currentPower / Math.pow(1 + inflationRate/100, years);
    const erosion = ((currentPower - futurePower) / currentPower) * 100;

    return (
      <div className="space-y-6">
         <h3 className="text-white font-bold flex items-center gap-2"><Timer className="w-5 h-5 text-orange-500" /> Purchasing Power Simulator</h3>
         
         <div className="glass p-8 text-center space-y-4 border border-orange-500/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
            <div>
               <p className="text-xs text-white/50 uppercase font-bold tracking-widest">Value of $10,000 in {years} Years</p>
               <h2 className="text-5xl font-bold text-white mt-2">${futurePower.toFixed(0)}</h2>
            </div>
            
            <div className="flex justify-center items-center gap-2 text-rose-400 bg-rose-500/10 py-1 px-3 rounded-full mx-auto w-fit">
               <TrendingUp className="w-4 h-4 rotate-180" />
               <span className="text-sm font-bold">Purchasing Power Loss: {erosion.toFixed(1)}%</span>
            </div>
         </div>

         <div className="space-y-6 bg-black/20 p-6 rounded-2xl">
            <div>
               <div className="flex justify-between text-sm font-bold text-white mb-3">
                  <span>Inflation Rate</span>
                  <span className="text-orange-400">{inflationRate}%</span>
               </div>
               <input 
                 type="range" min="1" max="15" value={inflationRate} 
                 onChange={(e) => setInflationRate(Number(e.target.value))}
                 className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
               />
               <div className="flex justify-between text-xs text-white/30 mt-2">
                  <span>1% (Stable)</span>
                  <span>15% (High)</span>
               </div>
            </div>
            <div>
               <div className="flex justify-between text-sm font-bold text-white mb-3">
                  <span>Time Horizon</span>
                  <span className="text-indigo-400">{years} Years</span>
               </div>
               <input 
                 type="range" min="1" max="30" value={years} 
                 onChange={(e) => setYears(Number(e.target.value))}
                 className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
               />
               <div className="flex justify-between text-xs text-white/30 mt-2">
                  <span>1 Year</span>
                  <span>30 Years</span>
               </div>
            </div>
         </div>
      </div>
    );
  };

  return (
    <div className="glass rounded-3xl p-6 h-full overflow-y-auto animate-in zoom-in duration-200">
       <div className="flex justify-between items-center mb-6">
         <h2 className="text-xl font-bold text-white">Advanced Analytics</h2>
         <button onClick={onClose} className="text-white/40 hover:text-white"><X className="w-6 h-6" /></button>
       </div>

       {toolId === 'analytics-pro' && renderCashFlowMap()}
       {toolId === 'forecaster' && renderForecaster()}
       {toolId === 'inflation-sim' && renderTimeMachine()}
    </div>
  );
};