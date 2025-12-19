
import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, X, Calendar as CalendarIcon, TrendingDown } from 'lucide-react';
import { Transaction, CATEGORIES } from '../types';

interface ExpenseCalendarProps {
  transactions: Transaction[];
  onClose: () => void;
}

export const ExpenseCalendar: React.FC<ExpenseCalendarProps> = ({ transactions, onClose }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  // Map expenses to dates
  const dailyData = useMemo(() => {
    const map: Record<string, { total: number, categories: Set<string> }> = {};
    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
         if (!map[t.date]) map[t.date] = { total: 0, categories: new Set() };
         map[t.date].total += t.amount;
         map[t.date].categories.add(t.category);
      });
    return map;
  }, [transactions]);

  const monthTotal = useMemo(() => {
     let sum = 0;
     const y = currentDate.getFullYear();
     const m = currentDate.getMonth() + 1;
     const prefix = `${y}-${m.toString().padStart(2, '0')}`;
     Object.keys(dailyData).forEach(k => {
        if (k.startsWith(prefix)) sum += dailyData[k].total;
     });
     return sum;
  }, [dailyData, currentDate]);

  const getCategoryColor = (cat: string) => {
     if (cat === 'Food') return 'bg-orange-500';
     if (cat === 'Travel') return 'bg-blue-500';
     if (cat === 'Shopping') return 'bg-pink-500';
     return 'bg-indigo-500';
  };

  const renderCalendarDays = () => {
    const days = [];
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;

    for (let i = 0; i < firstDayOfMonth; i++) days.push(<div key={`empty-${i}`} />);

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      const data = dailyData[dateStr];
      const isSelected = selectedDate === dateStr;
      
      days.push(
        <div 
          key={day} 
          onClick={() => setSelectedDate(dateStr)}
          className={`aspect-square rounded-xl relative cursor-pointer transition-all border ${
             isSelected ? 'bg-white/10 border-white/30' : 'bg-transparent border-transparent hover:bg-white/5'
          }`}
        >
          <span className={`absolute top-1 left-2 text-xs font-bold ${data ? 'text-white' : 'text-white/30'}`}>{day}</span>
          
          {data && (
             <div className="absolute inset-0 flex flex-col items-center justify-center pt-3">
                <span className="text-[10px] font-bold text-white">${data.total < 1000 ? data.total.toFixed(0) : (data.total/1000).toFixed(1)+'k'}</span>
                <div className="flex gap-0.5 mt-1">
                   {/* Explicitly type 'cat' as string to resolve unknown type assignment error */}
                   {Array.from(data.categories).slice(0, 3).map((cat: string, i: number) => (
                      <div key={i} className={`w-1 h-1 rounded-full ${getCategoryColor(cat)}`}></div>
                   ))}
                </div>
             </div>
          )}
        </div>
      );
    }
    return days;
  };

  const selectedTransactions = selectedDate 
    ? transactions.filter(t => t.date === selectedDate && t.type === 'expense')
    : [];

  return (
    <div className="glass rounded-3xl p-6 h-full flex flex-col animate-in zoom-in duration-200">
       <div className="flex justify-between items-start mb-6">
         <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
               <CalendarIcon className="w-5 h-5 text-purple-400" /> Expense Calendar
            </h3>
            <p className="text-white/40 text-xs mt-1">Monthly Total: <span className="text-white font-bold">${monthTotal.toLocaleString()}</span></p>
         </div>
         <button onClick={onClose} className="text-white/40 hover:text-white"><X className="w-6 h-6" /></button>
       </div>

       {/* Month Nav */}
       <div className="flex items-center justify-between bg-black/20 p-2 rounded-xl mb-4">
          <button onClick={prevMonth} className="p-2 hover:bg-white/10 rounded-lg text-white"><ChevronLeft className="w-5 h-5" /></button>
          <span className="font-bold text-white">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
          <button onClick={nextMonth} className="p-2 hover:bg-white/10 rounded-lg text-white"><ChevronRight className="w-5 h-5" /></button>
       </div>

       <div className="grid grid-cols-7 gap-1 text-center mb-2">
         {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
           <div key={d} className="text-[10px] text-white/30 font-bold uppercase">{d}</div>
         ))}
       </div>

       <div className="grid grid-cols-7 gap-1 flex-1 overflow-y-auto custom-scrollbar">
         {renderCalendarDays()}
       </div>

       {/* Details Popup / Panel */}
       {selectedDate && (
         <div className="mt-4 bg-white/5 border border-white/10 rounded-xl p-4 animate-in slide-in-from-bottom-4">
            <div className="flex justify-between items-center mb-3 pb-2 border-b border-white/5">
               <h4 className="font-bold text-white text-sm">{new Date(selectedDate).toDateString()}</h4>
               <span className="text-xs text-rose-400 font-bold">-{selectedTransactions.length} txns</span>
            </div>
            
            {selectedTransactions.length === 0 ? (
               <p className="text-white/30 text-xs text-center py-2">No spending this day.</p>
            ) : (
               <div className="space-y-2 max-h-[150px] overflow-y-auto custom-scrollbar pr-1">
                 {selectedTransactions.map(t => (
                   <div key={t.id} className="flex justify-between items-center text-xs group">
                      <div className="flex items-center gap-2">
                         <div className={`w-1.5 h-1.5 rounded-full ${getCategoryColor(t.category)}`}></div>
                         <span className="text-white/80">{t.description}</span>
                      </div>
                      <span className="text-white font-mono font-medium">${t.amount.toFixed(2)}</span>
                   </div>
                 ))}
               </div>
            )}
         </div>
       )}
    </div>
  );
};
