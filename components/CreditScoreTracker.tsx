import React, { useState } from 'react';
import { CreditScoreEntry } from '../types';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Plus, Trash2, Gauge } from 'lucide-react';

interface CreditScoreTrackerProps {
  history: CreditScoreEntry[];
  onAddScore: (entry: CreditScoreEntry) => void;
  onDeleteScore: (id: string) => void;
}

export const CreditScoreTracker: React.FC<CreditScoreTrackerProps> = ({ history, onAddScore, onDeleteScore }) => {
  const [newScore, setNewScore] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const sortedHistory = [...history].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const currentScore = sortedHistory.length > 0 ? sortedHistory[sortedHistory.length - 1].score : 0;

  const getScoreColor = (score: number) => {
    if (score >= 750) return 'text-emerald-400';
    if (score >= 700) return 'text-lime-400';
    if (score >= 650) return 'text-yellow-400';
    return 'text-rose-400';
  };

  const getScoreRating = (score: number) => {
    if (score === 0) return 'N/A';
    if (score >= 800) return 'Excellent';
    if (score >= 740) return 'Very Good';
    if (score >= 670) return 'Good';
    if (score >= 580) return 'Fair';
    return 'Poor';
  };

  const handleAdd = () => {
    if (newScore) {
      onAddScore({
        id: Date.now().toString(),
        score: parseInt(newScore),
        date: date
      });
      setNewScore('');
    }
  };

  return (
    <div className="space-y-6">
       {/* Score Card */}
       <div className="glass-card rounded-3xl p-6 relative overflow-hidden">
          <div className="flex justify-between items-start z-10 relative">
             <div>
                <h3 className="text-white/60 font-medium text-sm uppercase tracking-wider">Current Score</h3>
                <div className={`text-5xl font-bold mt-2 ${getScoreColor(currentScore)}`}>
                   {currentScore || '---'}
                </div>
                <p className="text-white font-medium mt-1">{getScoreRating(currentScore)}</p>
             </div>
             <Gauge className={`w-16 h-16 opacity-20 ${getScoreColor(currentScore)}`} />
          </div>
          
          <div className="h-[150px] w-full mt-4 -mx-2">
             <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sortedHistory}>
                   <defs>
                      <linearGradient id="scoreColor" x1="0" y1="0" x2="0" y2="1">
                         <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                         <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                   </defs>
                   <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px' }}
                      itemStyle={{ color: '#fff' }}
                      formatter={(val: number) => [val, 'Score']}
                   />
                   <Area type="monotone" dataKey="score" stroke="#10b981" fillOpacity={1} fill="url(#scoreColor)" strokeWidth={2} />
                </AreaChart>
             </ResponsiveContainer>
          </div>
       </div>

       {/* Input */}
       <div className="glass rounded-2xl p-4 flex gap-3 items-end">
          <div className="flex-1">
             <label className="text-xs text-white/40 uppercase font-bold ml-1">New Score</label>
             <input 
               type="number" 
               placeholder="e.g. 750" 
               value={newScore}
               onChange={(e) => setNewScore(e.target.value)}
               className="w-full mt-1 bg-black/20 border border-white/10 rounded-xl p-3 text-white focus:border-indigo-500 outline-none"
             />
          </div>
          <div className="flex-1">
             <label className="text-xs text-white/40 uppercase font-bold ml-1">Date Check</label>
             <input 
               type="date" 
               value={date}
               onChange={(e) => setDate(e.target.value)}
               className="w-full mt-1 bg-black/20 border border-white/10 rounded-xl p-3 text-white focus:border-indigo-500 outline-none"
             />
          </div>
          <button 
             onClick={handleAdd}
             disabled={!newScore}
             className="bg-indigo-600 h-[50px] px-4 rounded-xl text-white hover:bg-indigo-500 disabled:opacity-50"
          >
             <Plus className="w-6 h-6" />
          </button>
       </div>

       {/* History List */}
       <div className="space-y-2">
          <h4 className="text-sm font-bold text-white px-2">History</h4>
          {[...sortedHistory].reverse().map((entry) => (
             <div key={entry.id} className="glass p-3 rounded-xl flex justify-between items-center group">
                <span className="text-white/60 text-sm">{entry.date}</span>
                <div className="flex items-center gap-4">
                   <span className={`font-bold ${getScoreColor(entry.score)}`}>{entry.score}</span>
                   <button onClick={() => onDeleteScore(entry.id)} className="text-white/20 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 className="w-4 h-4" />
                   </button>
                </div>
             </div>
          ))}
       </div>
    </div>
  );
};