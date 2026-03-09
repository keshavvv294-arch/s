import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Asset, ASSET_TYPES } from '../../types';

interface AllocationChartProps {
  assets: Asset[];
  privacyMode: boolean;
}

export const AllocationChart: React.FC<AllocationChartProps> = ({ assets, privacyMode }) => {
  const allocationData = assets.reduce((acc, asset) => {
    const existing = acc.find(i => i.name === ASSET_TYPES[asset.type]);
    const value = asset.amount * asset.value;
    if(existing) existing.value += value;
    else acc.push({ name: ASSET_TYPES[asset.type], value });
    return acc;
  }, [] as {name: string, value: number}[]);

  const COLORS = ['#6366f1', '#14b8a6', '#f59e0b', '#ec4899', '#8b5cf6'];

  return (
    <div className="glass-card rounded-3xl p-6 h-full flex flex-col border border-white/5 hover:border-white/10 transition-colors shadow-lg shadow-black/30">
       <h3 className="text-sm font-bold text-white/60 uppercase tracking-wider mb-2 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-indigo-500"></span> Allocation
       </h3>
       <div className="flex-1 w-full relative min-h-[200px]">
          {allocationData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={allocationData} 
                  cx="50%" 
                  cy="50%" 
                  innerRadius={60} 
                  outerRadius={80} 
                  paddingAngle={5} 
                  dataKey="value" 
                  stroke="none"
                >
                  {allocationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} className="hover:opacity-80 transition-opacity duration-300" />
                  ))}
                </Pie>
                <Tooltip 
                   formatter={(val: number) => privacyMode ? '••••' : `$${val.toFixed(0)}`}
                   contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
                   itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                   labelStyle={{ color: '#94a3b8', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white/20 gap-2">
               <div className="w-12 h-12 rounded-full border-2 border-dashed border-white/10 animate-spin-slow"></div>
               <span className="text-xs font-medium">No data</span>
            </div>
          )}
       </div>
    </div>
  );
};
