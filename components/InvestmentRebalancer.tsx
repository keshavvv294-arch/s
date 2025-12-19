import React, { useState, useMemo } from 'react';
import { Asset, ASSET_TYPES } from '../types';
import { RefreshCw, X, ArrowRight, PieChart } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';

interface InvestmentRebalancerProps {
  assets: Asset[];
  onClose: () => void;
}

export const InvestmentRebalancer: React.FC<InvestmentRebalancerProps> = ({ assets, onClose }) => {
  const [targets, setTargets] = useState<Record<string, number>>({
    'stock': 50,
    'crypto': 20,
    'real-estate': 20,
    'gold': 5,
    'cash': 5
  });

  const currentAllocation = useMemo(() => {
    const totalValue = assets.reduce((sum, a) => sum + (a.amount * a.value), 0);
    const allocation: Record<string, number> = {};
    
    Object.keys(ASSET_TYPES).forEach(type => allocation[type] = 0);
    
    assets.forEach(asset => {
      const val = asset.amount * asset.value;
      if (allocation[asset.type] !== undefined) {
        allocation[asset.type] += val;
      }
    });

    return { totalValue, allocation };
  }, [assets]);

  const rebalancingPlan = useMemo(() => {
    const { totalValue, allocation } = currentAllocation;
    const plan = [];

    for (const [type, val] of Object.entries(allocation)) {
      const currentVal = val as number;
      const targetPct = (targets[type] || 0);
      // Ensure numerical types for arithmetic
      const targetVal = totalValue * (targetPct / 100);
      const diff = targetVal - currentVal;
      const currentPct = totalValue > 0 ? (currentVal / totalValue) * 100 : 0;
      
      plan.push({
        type,
        currentPct,
        targetPct,
        diff,
        action: diff > 0 ? 'BUY' : 'SELL'
      });
    }
    return plan.sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff));
  }, [currentAllocation, targets]);

  const totalTarget = Object.values(targets).reduce((sum: number, v: number) => sum + v, 0);

  return (
    <div className="glass rounded-3xl p-6 h-full overflow-y-auto animate-in slide-in-from-right duration-200">
       <div className="flex justify-between items-center mb-6">
         <h3 className="text-xl font-bold text-white flex items-center gap-2"><RefreshCw className="w-5 h-5 text-emerald-400" /> Portfolio Rebalancer</h3>
         <button onClick={onClose} className="text-white/40 hover:text-white"><X className="w-6 h-6" /></button>
       </div>

       {/* Visual Chart */}
       <div className="h-[200px] w-full mb-6">
          <ResponsiveContainer width="100%" height="100%">
             <BarChart data={rebalancingPlan} layout="vertical" margin={{ left: 20 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="type" type="category" width={80} stroke="#fff" fontSize={10} tickFormatter={(v) => ASSET_TYPES[v as keyof typeof ASSET_TYPES]} />
                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{backgroundColor: '#0f172a', borderRadius: '8px', border: 'none'}} />
                <Bar dataKey="currentPct" name="Current %" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={10} />
                <Bar dataKey="targetPct" name="Target %" fill="#10b981" radius={[0, 4, 4, 0]} barSize={10} />
             </BarChart>
          </ResponsiveContainer>
       </div>

       {/* Target Settings */}
       <div className="bg-black/20 p-4 rounded-xl mb-6">
          <div className="flex justify-between items-center mb-3">
             <h4 className="text-sm font-bold text-white">Target Allocation</h4>
             <span className={`text-xs font-bold ${totalTarget === 100 ? 'text-emerald-400' : 'text-rose-400'}`}>
                Total: {totalTarget}%
             </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
             {Object.keys(ASSET_TYPES).map(type => (
                <div key={type} className="flex items-center gap-2">
                   <label className="text-xs text-white/60 w-20">{ASSET_TYPES[type as keyof typeof ASSET_TYPES]}</label>
                   <input 
                     type="number" 
                     value={targets[type]} 
                     onChange={(e) => setTargets({...targets, [type]: Number(e.target.value)})}
                     className="w-16 bg-white/5 rounded p-1 text-center text-white text-sm focus:bg-white/10 outline-none"
                   />
                   <span className="text-white/40 text-xs">%</span>
                </div>
             ))}
          </div>
       </div>

       {/* Action Plan */}
       <div className="space-y-3">
          <h4 className="text-sm font-bold text-white mb-2">Action Plan</h4>
          {rebalancingPlan.filter(p => Math.abs(p.diff) > 10).map((item) => (
             <div key={item.type} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                <div className="flex items-center gap-3">
                   <div className={`px-2 py-1 rounded text-[10px] font-bold ${item.action === 'BUY' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                      {item.action}
                   </div>
                   <span className="text-white font-medium text-sm">{ASSET_TYPES[item.type as keyof typeof ASSET_TYPES]}</span>
                </div>
                <div className="flex items-center gap-2">
                   <span className="text-white font-bold">${Math.abs(item.diff).toFixed(0)}</span>
                   <ArrowRight className={`w-4 h-4 ${item.action === 'BUY' ? 'text-emerald-400 rotate-45' : 'text-rose-400 -rotate-45'}`} />
                </div>
             </div>
          ))}
          {rebalancingPlan.every(p => Math.abs(p.diff) <= 10) && (
             <div className="text-center text-white/40 text-sm py-4">Portfolio is perfectly balanced!</div>
          )}
       </div>
    </div>
  );
};
