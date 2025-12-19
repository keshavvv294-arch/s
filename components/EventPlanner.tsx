
import React, { useState } from 'react';
import { EventBudget, Transaction } from '../types';
import { Plus, Calendar, Trash2, ArrowLeft, Plane, Coffee, ShoppingBag, MapPin, Ticket, Zap, Bed, Car, Check } from 'lucide-react';

interface EventPlannerProps {
  events: EventBudget[];
  transactions: Transaction[];
  onAddEvent: (event: EventBudget) => void;
  onDeleteEvent: (id: string) => void;
  onAddTransaction: (t: Omit<Transaction, 'id'>) => void;
  currencySymbol: string;
}

export const EventPlanner: React.FC<EventPlannerProps> = ({ events, transactions, onAddEvent, onDeleteEvent, onAddTransaction, currencySymbol }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newEvent, setNewEvent] = useState<Partial<EventBudget>>({});
  const [selectedEvent, setSelectedEvent] = useState<EventBudget | null>(null);
  
  // Quick Add State
  const [quickAmount, setQuickAmount] = useState('');
  const [quickDesc, setQuickDesc] = useState('');

  const handleAdd = () => {
    if (newEvent.name && newEvent.totalBudget) {
      onAddEvent({
        id: Date.now().toString(),
        name: newEvent.name,
        totalBudget: Number(newEvent.totalBudget),
        startDate: newEvent.startDate || '',
        endDate: newEvent.endDate || '',
        coverImage: 'bg-gradient-to-br from-indigo-600 to-purple-600'
      });
      setIsAdding(false);
      setNewEvent({});
    }
  };

  const addExpense = (category: string, iconStr: string) => {
    if (!selectedEvent || !quickAmount) return;
    onAddTransaction({
      description: quickDesc || category,
      amount: parseFloat(quickAmount),
      type: 'expense',
      category: 'Travel', // Broad category for main reporting
      date: new Date().toISOString().split('T')[0],
      status: 'cleared',
      eventId: selectedEvent.id,
      tags: ['#Trip', `#${selectedEvent.name.replace(/\s/g, '')}`, category]
    });
    setQuickAmount('');
    setQuickDesc('');
  };

  const getEventStats = (eventId: string) => {
    const eventTxs = transactions.filter(t => t.eventId === eventId);
    const spent = eventTxs.reduce((sum, t) => sum + t.amount, 0);
    return { spent, count: eventTxs.length, txs: eventTxs };
  };

  // --- TRIP DASHBOARD ---
  if (selectedEvent) {
    const { spent, txs } = getEventStats(selectedEvent.id);
    const remaining = selectedEvent.totalBudget - spent;
    const progress = Math.min((spent / selectedEvent.totalBudget) * 100, 100);
    
    // Sort transactions by date desc
    const sortedTxs = [...txs].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
      <div className="h-full flex flex-col animate-in slide-in-from-right duration-300">
        {/* Hero Card */}
        <div className="relative bg-indigo-600 rounded-b-3xl p-6 shadow-2xl shrink-0 z-10 overflow-hidden">
           <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
           
           <div className="flex justify-between items-start mb-6">
              <button onClick={() => setSelectedEvent(null)} className="p-2 bg-white/20 rounded-full hover:bg-white/30 text-white transition-all backdrop-blur-sm">
                 <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="text-right">
                 <p className="text-indigo-200 text-xs uppercase font-bold tracking-wider">Remaining</p>
                 <p className="text-2xl font-bold text-white">{currencySymbol}{remaining.toLocaleString()}</p>
              </div>
           </div>

           <h2 className="text-3xl font-bold text-white mb-1">{selectedEvent.name}</h2>
           <div className="flex items-center gap-2 text-indigo-200 text-sm mb-6">
              <Calendar className="w-4 h-4" /> {selectedEvent.startDate || 'Anytime'}
           </div>

           <div className="bg-black/20 rounded-xl p-4 backdrop-blur-sm border border-white/10">
              <div className="flex justify-between text-xs text-white/70 mb-2">
                 <span>Spent: {currencySymbol}{spent.toLocaleString()}</span>
                 <span>Budget: {currencySymbol}{selectedEvent.totalBudget.toLocaleString()}</span>
              </div>
              <div className="w-full h-2 bg-black/30 rounded-full overflow-hidden">
                 <div className={`h-full transition-all duration-700 ${progress > 90 ? 'bg-rose-400' : 'bg-emerald-400'}`} style={{width: `${progress}%`}}></div>
              </div>
           </div>
        </div>

        {/* Quick Add Grid */}
        <div className="p-4 shrink-0">
           <div className="bg-[#1e293b] p-4 rounded-2xl border border-white/5 shadow-lg">
              <input 
                type="number" 
                placeholder="Amount" 
                value={quickAmount} 
                onChange={e => setQuickAmount(e.target.value)}
                className="w-full bg-black/30 rounded-xl p-3 text-white text-center font-bold text-lg mb-3 outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-white/20"
              />
              <input 
                type="text" 
                placeholder="What for? (optional)" 
                value={quickDesc} 
                onChange={e => setQuickDesc(e.target.value)}
                className="w-full bg-black/30 rounded-xl p-2 text-white text-center text-sm mb-4 outline-none focus:ring-1 focus:ring-indigo-500 placeholder:text-white/20"
              />
              
              <div className="grid grid-cols-4 gap-3">
                 {[
                    { l: 'Food', i: Coffee, c: 'bg-orange-500' },
                    { l: 'Travel', i: Plane, c: 'bg-blue-500' },
                    { l: 'Stay', i: Bed, c: 'bg-purple-500' },
                    { l: 'Taxi', i: Car, c: 'bg-yellow-500' },
                    { l: 'Shop', i: ShoppingBag, c: 'bg-pink-500' },
                    { l: 'Ticket', i: Ticket, c: 'bg-red-500' },
                    { l: 'Misc', i: Zap, c: 'bg-gray-500' },
                    { l: 'Add', i: Check, c: 'bg-emerald-500' }
                 ].map((btn, idx) => (
                    <button 
                      key={idx} 
                      onClick={() => addExpense(btn.l, '')}
                      disabled={!quickAmount}
                      className="flex flex-col items-center gap-1 group disabled:opacity-40 transition-opacity"
                    >
                       <div className={`p-3 rounded-xl text-white shadow-lg ${btn.c} group-active:scale-95 transition-transform`}>
                          <btn.i className="w-5 h-5" />
                       </div>
                       <span className="text-[10px] text-white/50">{btn.l}</span>
                    </button>
                 ))}
              </div>
           </div>
        </div>

        {/* Expenses List */}
        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-3 custom-scrollbar">
           <h4 className="text-white/50 text-xs font-bold uppercase sticky top-0 bg-[#0f172a] py-2 z-10">Recent Spending</h4>
           {sortedTxs.map(t => (
              <div key={t.id} className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5">
                 <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-500/20 text-indigo-300 rounded-lg">
                       {t.tags?.includes('Food') ? <Coffee className="w-4 h-4" /> : 
                        t.tags?.includes('Travel') ? <Plane className="w-4 h-4" /> :
                        t.tags?.includes('Stay') ? <Bed className="w-4 h-4" /> :
                        <Zap className="w-4 h-4" />}
                    </div>
                    <div>
                       <p className="text-white font-bold text-sm">{t.description}</p>
                       <p className="text-white/40 text-[10px]">{t.date} • {t.tags?.[2] || 'Expense'}</p>
                    </div>
                 </div>
                 <span className="text-white font-bold text-sm">-{currencySymbol}{t.amount}</span>
              </div>
           ))}
           {sortedTxs.length === 0 && (
              <div className="text-center py-10 text-white/30">
                 <MapPin className="w-10 h-10 mx-auto mb-2 opacity-50" />
                 <p>Start your journey by adding expenses</p>
              </div>
           )}
        </div>
      </div>
    );
  }

  // --- LIST VIEW ---
  return (
    <div className="h-full flex flex-col animate-in fade-in">
       <div className="flex justify-between items-center mb-6">
          <div>
             <h2 className="text-2xl font-bold text-white">Trip Planner</h2>
             <p className="text-white/50 text-sm">Plan budgets & track travel</p>
          </div>
          <button onClick={() => setIsAdding(true)} className="bg-indigo-600 hover:bg-indigo-500 text-white p-3 rounded-xl shadow-lg transition-all">
             <Plus className="w-6 h-6" />
          </button>
       </div>

       {isAdding && (
          <div className="bg-[#1e293b] p-4 rounded-2xl mb-6 border border-indigo-500/50 animate-in slide-in-from-top-4 shadow-2xl">
             <h3 className="text-white font-bold mb-4">New Adventure</h3>
             <input 
               type="text" 
               placeholder="Trip Name (e.g. Bali 2024)" 
               className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white mb-3 focus:border-indigo-500 outline-none"
               onChange={e => setNewEvent({...newEvent, name: e.target.value})}
             />
             <div className="flex gap-3 mb-3">
                <input 
                  type="number" 
                  placeholder="Budget" 
                  className="flex-1 bg-black/30 border border-white/10 rounded-xl p-3 text-white focus:border-indigo-500 outline-none"
                  onChange={e => setNewEvent({...newEvent, totalBudget: Number(e.target.value)})}
                />
                <input 
                  type="date" 
                  className="flex-1 bg-black/30 border border-white/10 rounded-xl p-3 text-white focus:border-indigo-500 outline-none"
                  onChange={e => setNewEvent({...newEvent, startDate: e.target.value})}
                />
             </div>
             <div className="flex justify-end gap-3">
                <button onClick={() => setIsAdding(false)} className="text-white/50 px-4 py-2">Cancel</button>
                <button onClick={handleAdd} className="bg-white text-indigo-900 font-bold px-6 py-2 rounded-xl">Create</button>
             </div>
          </div>
       )}

       <div className="grid grid-cols-1 gap-4 overflow-y-auto custom-scrollbar pb-20">
          {events.map(event => {
             const { spent } = getEventStats(event.id);
             const progress = Math.min((spent / event.totalBudget) * 100, 100);
             
             return (
                <div 
                  key={event.id} 
                  onClick={() => setSelectedEvent(event)}
                  className="bg-[#1e293b] rounded-2xl overflow-hidden cursor-pointer group hover:shadow-2xl hover:shadow-indigo-500/10 transition-all border border-white/5 relative"
                >
                   <div className="h-24 bg-gradient-to-r from-indigo-900 to-purple-900 relative">
                      <div className="absolute inset-0 bg-black/20"></div>
                      <div className="absolute bottom-3 left-4">
                         <h3 className="text-xl font-bold text-white">{event.name}</h3>
                         <p className="text-white/60 text-xs flex items-center gap-1"><Calendar className="w-3 h-3" /> {event.startDate}</p>
                      </div>
                      <button 
                         onClick={(e) => { e.stopPropagation(); onDeleteEvent(event.id); }}
                         className="absolute top-2 right-2 p-2 bg-black/30 rounded-full text-white/50 hover:text-rose-400 hover:bg-black/50 transition-all opacity-0 group-hover:opacity-100"
                      >
                         <Trash2 className="w-4 h-4" />
                      </button>
                   </div>
                   
                   <div className="p-4">
                      <div className="flex justify-between items-end mb-2">
                         <div>
                            <p className="text-xs text-white/40 uppercase font-bold">Budget Used</p>
                            <p className="text-white font-bold">{progress.toFixed(0)}%</p>
                         </div>
                         <div className="text-right">
                            <p className="text-xs text-white/40 uppercase font-bold">Left</p>
                            <p className="text-emerald-400 font-bold">{currencySymbol}{(event.totalBudget - spent).toLocaleString()}</p>
                         </div>
                      </div>
                      <div className="w-full h-1.5 bg-black/30 rounded-full overflow-hidden">
                         <div className="h-full bg-indigo-500 group-hover:bg-indigo-400 transition-colors" style={{width: `${progress}%`}}></div>
                      </div>
                   </div>
                </div>
             );
          })}
          
          {events.length === 0 && !isAdding && (
             <div className="flex flex-col items-center justify-center py-20 text-white/30">
                <Plane className="w-16 h-16 mb-4 opacity-20" />
                <p>No trips planned.</p>
             </div>
          )}
       </div>
    </div>
  );
};
