
import React, { useState, useEffect } from 'react';
import { Transaction } from '../types';
import { Activity, X, Sparkles } from 'lucide-react';
import { analyzeCashFlow } from '../services/geminiService';

interface PredictiveCashFlowProps {
  transactions: Transaction[];
  currentBalance: number;
  onClose: () => void;
}

export const PredictiveCashFlow: React.FC<PredictiveCashFlowProps> = ({ transactions, currentBalance, onClose }) => {
  const [analysis, setAnalysis] = useState<{ summary: string, recommendations: string[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyzeCashFlow(transactions).then(data => {
      setAnalysis(data);
      setLoading(false);
    });
  }, [transactions]);

  return (
    <div className="glass rounded-3xl p-6 h-full animate-in zoom-in duration-200 flex flex-col overflow-y-auto">
       <div className="flex justify-between items-center mb-6">
         <h3 className="text-xl font-bold text-white flex items-center gap-2"><Activity className="w-5 h-5 text-blue-400" /> AI Cash Flow Analysis</h3>
         <button onClick={onClose} className="text-white/40 hover:text-white"><X className="w-6 h-6" /></button>
       </div>

       {loading ? (
         <div className="flex-1 flex items-center justify-center text-white/40">
            <Sparkles className="w-8 h-8 animate-pulse" />
         </div>
       ) : analysis ? (
         <div className="space-y-6">
            <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
               <h4 className="text-sm font-bold text-white mb-2">Summary</h4>
               <p className="text-sm text-white/60">{analysis.summary}</p>
            </div>
            
            <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
               <h4 className="text-sm font-bold text-white mb-4">Recommendations</h4>
               <ul className="space-y-2">
                  {analysis.recommendations.map((rec, i) => (
                    <li key={i} className="text-sm text-white/60 flex items-start gap-2">
                       <span className="text-blue-400">•</span> {rec}
                    </li>
                  ))}
               </ul>
            </div>
         </div>
       ) : (
         <div className="text-center text-white/40">Could not analyze cash flow.</div>
       )}
    </div>
  );
};
