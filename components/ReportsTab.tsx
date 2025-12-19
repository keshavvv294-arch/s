
import React, { useMemo, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie, Legend } from 'recharts';
import { Transaction, FinancialSummary, Asset, Budget } from '../types';
import { TrendingUp, TrendingDown, DollarSign, Calendar, ArrowUpRight, ArrowDownRight, Target, Printer, Filter, Smile } from 'lucide-react';

interface ReportsTabProps {
  transactions: Transaction[];
  assets: Asset[];
  summary: FinancialSummary;
  budgets: Budget[];
  currencySymbol: string;
}

export const ReportsTab: React.FC<ReportsTabProps> = ({ transactions, assets, summary, budgets, currencySymbol }) => {
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const COLORS = ['#6366f1', '#ec4899', '#8b5cf6', '#14b8a6', '#f59e0b', '#ef4444', '#3b82f6'];

  // Filter transactions by selected month
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => t.date.startsWith(selectedMonth));
  }, [transactions, selectedMonth]);

  // Available months for dropdown
  const availableMonths = useMemo(() => {
    const months = new Set(transactions.map(t => t.date.slice(0, 7)));
    months.add(new Date().toISOString().slice(0, 7)); // Ensure current month exists
    return Array.from(months).sort().reverse();
  }, [transactions]);

  // 1. Monthly Cash Flow Data (Historical)
  const monthlyData = useMemo(() => {
    const data: Record<string, { name: string; income: number; expense: number; savings: number }> = {};
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - (5 - i));
      return d.toLocaleString('default', { month: 'short' });
    });

    last6Months.forEach(m => data[m] = { name: m, income: 0, expense: 0, savings: 0 });

    transactions.forEach(t => {
      const date = new Date(t.date);
      const month = date.toLocaleString('default', { month: 'short' });
      if (data[month]) {
        if (t.type === 'income') data[month].income += t.amount;
        else data[month].expense += t.amount;
      }
    });

    return Object.values(data).map(item => ({
      ...item,
      savings: item.income - item.expense
    }));
  }, [transactions]);

  // 2. Spending by Category (Pie) - Current Month
  const categoryData = useMemo(() => {
    const data: Record<string, number> = {};
    filteredTransactions.filter(t => t.type === 'expense').forEach(t => {
      data[t.category] = (data[t.category] || 0) + t.amount;
    });
    return Object.entries(data)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filteredTransactions]);

  // 3. Spending by Mood (New Feature)
  const moodData = useMemo(() => {
     const data: Record<string, number> = {
        'happy': 0, 'sad': 0, 'stressed': 0, 'impulsive': 0, 'necessary': 0, 'neutral': 0
     };
     
     filteredTransactions.filter(t => t.type === 'expense').forEach(t => {
        const mood = t.mood || 'neutral';
        data[mood] += t.amount;
     });

     return Object.entries(data)
       .filter(([_, val]) => val > 0)
       .map(([name, value]) => ({ name, value }));
  }, [filteredTransactions]);

  // 3. Budget vs Actual
  const budgetAnalysis = useMemo(() => {
    return budgets.map(b => {
      const actual = filteredTransactions
        .filter(t => t.type === 'expense' && t.category === b.category)
        .reduce((sum, t) => sum + t.amount, 0);
      return { ...b, actual, percent: Math.min((actual / b.limit) * 100, 100) };
    }).sort((a, b) => b.percent - a.percent);
  }, [filteredTransactions, budgets]);

  // 4. Heatmap Data
  const heatmapData = useMemo(() => {
     const daysInMonth = new Date(parseInt(selectedMonth.split('-')[0]), parseInt(selectedMonth.split('-')[1]), 0).getDate();
     const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
     
     const spendingByDay: Record<number, number> = {};
     filteredTransactions.filter(t => t.type === 'expense').forEach(t => {
        const day = parseInt(t.date.split('-')[2]);
        spendingByDay[day] = (spendingByDay[day] || 0) + t.amount;
     });

     const maxSpend = Math.max(...Object.values(spendingByDay), 1); // Avoid div by 0

     return days.map(day => ({
        day,
        amount: spendingByDay[day] || 0,
        intensity: (spendingByDay[day] || 0) / maxSpend
     }));
  }, [filteredTransactions, selectedMonth]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-24 animate-in fade-in print:pb-0 print:space-y-4">
      <div className="flex justify-between items-center px-2 print:hidden">
        <div>
          <h2 className="text-2xl font-bold text-white">Monthly Report</h2>
          <p className="text-white/50 text-sm">Financial performance overview</p>
        </div>
        <div className="flex items-center gap-3">
           <div className="relative">
              <select 
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="appearance-none bg-white/5 border border-white/10 rounded-xl pl-4 pr-8 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
              >
                {availableMonths.map(m => (
                   <option key={m} value={m} className="bg-slate-900">{new Date(m + '-01').toLocaleString('default', { month: 'long', year: 'numeric' })}</option>
                ))}
              </select>
              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
           </div>
           <button onClick={handlePrint} className="p-2 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-colors" title="Print PDF">
              <Printer className="w-5 h-5" />
           </button>
        </div>
      </div>

      {/* Print Header */}
      <div className="hidden print:block text-black text-center mb-8">
         <h1 className="text-3xl font-bold">WealthFlow Monthly Report</h1>
         <p className="text-lg text-gray-600">{new Date(selectedMonth + '-01').toLocaleString('default', { month: 'long', year: 'numeric' })}</p>
      </div>

      {/* Budget vs Actual */}
      {budgets.length > 0 && (
         <div className="glass rounded-3xl p-6 print:border print:border-gray-200 print:bg-white print:text-black">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2 print:text-black">
               <Target className="w-5 h-5 text-pink-400" />
               Budget Analysis
            </h3>
            <div className="space-y-4">
               {budgetAnalysis.map((item) => (
                  <div key={item.category}>
                     <div className="flex justify-between text-sm mb-1">
                        <span className="text-white font-medium print:text-black">{item.category}</span>
                        <span className="text-white/60 print:text-gray-600">{currencySymbol}{item.actual.toFixed(0)} / {currencySymbol}{item.limit}</span>
                     </div>
                     <div className="h-2.5 bg-white/10 rounded-full overflow-hidden print:bg-gray-200">
                        <div 
                           className={`h-full rounded-full ${item.actual > item.limit ? 'bg-rose-500' : 'bg-emerald-500'}`} 
                           style={{ width: `${item.percent}%` }}
                        ></div>
                     </div>
                  </div>
               ))}
            </div>
         </div>
      )}

      {/* Spending Heatmap */}
      <div className="glass rounded-3xl p-6 print:break-inside-avoid print:bg-white print:text-black print:border print:border-gray-200">
         <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2 print:text-black">
            <Calendar className="w-5 h-5 text-orange-400" />
            Daily Spending Heatmap
         </h3>
         <div className="grid grid-cols-7 gap-2">
            {heatmapData.map((day) => (
               <div key={day.day} className="flex flex-col gap-1 items-center">
                  <div 
                     className={`w-full aspect-square rounded-lg flex items-center justify-center text-xs font-medium transition-all hover:scale-110 cursor-default
                        ${day.amount === 0 ? 'bg-white/5 text-white/20 print:bg-gray-100 print:text-gray-400' : ''}
                     `}
                     style={{ 
                        backgroundColor: day.amount > 0 ? `rgba(244, 63, 94, ${0.2 + day.intensity * 0.8})` : undefined,
                        border: day.amount > 0 ? `1px solid rgba(244, 63, 94, ${0.4 + day.intensity})` : undefined,
                        color: day.amount > 0 ? 'white' : undefined
                     }}
                     title={`${selectedMonth}-${day.day}: ${currencySymbol}${day.amount}`}
                  >
                     {day.day}
                  </div>
               </div>
            ))}
         </div>
      </div>

      {/* Mood Analysis - Only show if data exists */}
      {moodData.length > 0 && (
         <div className="glass rounded-3xl p-6 print:break-inside-avoid">
             <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
               <Smile className="w-5 h-5 text-yellow-400" />
               Emotional Spending
            </h3>
            <div className="h-[200px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={moodData} layout="vertical">
                     <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="rgba(255,255,255,0.1)" />
                     <XAxis type="number" hide />
                     <YAxis dataKey="name" type="category" stroke="rgba(255,255,255,0.5)" width={80} tick={{fontSize: 12}} />
                     <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }}
                        itemStyle={{ color: '#fff' }}
                        cursor={{fill: 'rgba(255,255,255,0.05)'}}
                     />
                     <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]}>
                        {moodData.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                     </Bar>
                  </BarChart>
               </ResponsiveContainer>
            </div>
         </div>
      )}

      {/* Cash Flow Chart */}
      <div className="glass rounded-3xl p-6 print:break-inside-avoid print:bg-white print:text-black print:border print:border-gray-200">
         <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2 print:text-black">
            <ArrowUpRight className="w-5 h-5 text-emerald-400" />
            6-Month Trend
         </h3>
         <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
               <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                  <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" tick={{fontSize: 12}} tickLine={false} axisLine={false} />
                  <YAxis stroke="rgba(255,255,255,0.3)" tick={{fontSize: 12}} tickLine={false} axisLine={false} tickFormatter={(val) => `${val/1000}k`} />
                  <Tooltip 
                     contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                     itemStyle={{ color: '#fff' }}
                  />
                  <Legend />
                  <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expense" name="Expense" fill="#f43f5e" radius={[4, 4, 0, 0]} />
               </BarChart>
            </ResponsiveContainer>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:grid-cols-2">
         {/* Category Breakdown */}
         <div className="glass rounded-3xl p-6 h-[300px] print:bg-white print:text-black print:border print:border-gray-200 print:break-inside-avoid">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2 print:text-black">
               <Target className="w-5 h-5 text-indigo-400" />
               Category Breakdown
            </h3>
            <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                  <Pie
                     data={categoryData}
                     cx="50%"
                     cy="50%"
                     innerRadius={60}
                     outerRadius={80}
                     paddingAngle={5}
                     dataKey="value"
                  >
                     {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                     ))}
                  </Pie>
                  <Tooltip formatter={(val: number) => `${currencySymbol}${val.toFixed(0)}`} contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px' }} />
                  <Legend />
               </PieChart>
            </ResponsiveContainer>
         </div>

         {/* Insights */}
         <div className="space-y-4 print:break-inside-avoid">
            <div className="glass rounded-2xl p-4 border-l-4 border-rose-500 print:bg-white print:text-black print:border-gray-200 print:border-l-rose-500">
               <p className="text-xs text-white/50 uppercase font-bold print:text-gray-500">Savings Rate</p>
               <div className="text-3xl font-bold text-white mt-1 print:text-black">{(summary.savingsRate * 100).toFixed(1)}%</div>
               <p className="text-white/40 text-xs mt-1 print:text-gray-500">Target: 20%</p>
            </div>
            
            <div className="glass rounded-2xl p-4 border-l-4 border-emerald-500 print:bg-white print:text-black print:border-gray-200 print:border-l-emerald-500">
               <p className="text-xs text-white/50 uppercase font-bold print:text-gray-500">Projected Savings</p>
               <div className="text-3xl font-bold text-emerald-400 mt-1">{currencySymbol}{summary.projectedSavings.toFixed(2)}</div>
               <p className="text-white/40 text-xs mt-1 print:text-gray-500">Based on current trajectory</p>
            </div>
         </div>
      </div>
    </div>
  );
};
