
import React, { useEffect, useState } from 'react';
import { X, ShieldCheck, CheckCircle, ArrowRight, Loader2 } from 'lucide-react';
import { Debt } from '../types';
import { getCreditAdvice } from '../services/geminiService';

interface CreditBuilderProps {
  currentScore: number;
  debts: Debt[];
  onClose: () => void;
}

export const CreditBuilder: React.FC<CreditBuilderProps> = ({ currentScore, debts, onClose }) => {
  const [actions, setActions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
     const fetchAdvice = async () => {
        try {
           const advice = await getCreditAdvice(currentScore, debts.length);
           setActions(advice);
        } finally {
           setLoading(false);
        }
     };
     fetchAdvice();
  }, [currentScore, debts]);

  return (
    <div className="glass rounded-3xl p-6 h-full animate-in slide-in-from-right duration-200">
       <div className="flex justify-between items-center mb-6">
         <h3 className="text-xl font-bold text-white flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-yellow-400" /> Credit Builder AI</h3>
         <button onClick={onClose} className="text-white/40 hover:text-white"><X className="w-6 h-6" /></button>
       </div>

       <div className="text-center mb-8">
          <div className="inline-block relative">
             <svg className="w-32 h-32 transform -rotate-90">
                <circle cx="64" cy="64" r="56" stroke="rgba(255,255,255,0.1)" strokeWidth="8" fill="none" />
                <circle cx="64" cy="64" r="56" stroke="#fbbf24" strokeWidth="8" fill="none" strokeDasharray={351} strokeDashoffset={351 - (351 * (currentScore/850))} className="transition-all duration-1000" />
             </svg>
             <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-white">{currentScore}</span>
                <span className="text-[10px] text-white/40 uppercase">Credit Score</span>
             </div>
          </div>
       </div>

       <h4 className="text-sm font-bold text-white mb-3 px-2">AI Recommendations</h4>
       {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-white/30" /></div>
       ) : (
          <div className="space-y-3">
             {actions.map((action, i) => (
                <div key={i} className="bg-white/5 p-4 rounded-xl flex items-center justify-between group cursor-pointer hover:bg-white/10 transition-colors">
                   <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full border-2 border-white/20 flex items-center justify-center">
                         <div className="w-3 h-3 bg-transparent group-hover:bg-yellow-400 rounded-full transition-colors"></div>
                      </div>
                      <div>
                         <p className="text-sm font-medium text-white">{action.title}</p>
                      </div>
                   </div>
                   <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">{action.impact} Impact</span>
                </div>
             ))}
          </div>
       )}
    </div>
  );
};
