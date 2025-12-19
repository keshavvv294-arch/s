import React, { useState } from 'react';
import { PenTool, X, Copy, Sparkles, Check, MessageSquare } from 'lucide-react';
import { Transaction } from '../types';
import { generateNegotiationScript } from '../services/geminiService';

interface SubscriptionNegotiatorProps {
  transactions: Transaction[];
  onClose: () => void;
}

export const SubscriptionNegotiator: React.FC<SubscriptionNegotiatorProps> = ({ transactions, onClose }) => {
  const [selectedSub, setSelectedSub] = useState<Transaction | null>(null);
  const [script, setScript] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [goal, setGoal] = useState<'cancel' | 'discount'>('discount');

  // Find likely subscriptions (recurring expenses)
  const subscriptions = transactions.filter(t => t.type === 'expense' && (t.isRecurring || t.amount < 100)); // Simple heuristic

  const handleGenerate = async () => {
    if (!selectedSub) return;
    setLoading(true);
    setScript('');
    try {
      const result = await generateNegotiationScript(selectedSub.description, selectedSub.amount, goal);
      setScript(result);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(script);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass rounded-3xl p-6 h-full animate-in slide-in-from-right duration-200 flex flex-col">
       <div className="flex justify-between items-center mb-6">
         <h3 className="text-xl font-bold text-white flex items-center gap-2"><PenTool className="w-5 h-5 text-indigo-400" /> Sub. Negotiator</h3>
         <button onClick={onClose} className="text-white/40 hover:text-white"><X className="w-6 h-6" /></button>
       </div>

       {!selectedSub ? (
          <div className="space-y-3 overflow-y-auto custom-scrollbar flex-1">
             <p className="text-sm text-white/50 mb-2">Select a subscription to negotiate:</p>
             {subscriptions.map(sub => (
                <button 
                  key={sub.id} 
                  onClick={() => setSelectedSub(sub)}
                  className="w-full p-4 bg-white/5 hover:bg-white/10 rounded-xl flex justify-between items-center transition-colors text-left"
                >
                   <div>
                      <p className="font-bold text-white">{sub.description}</p>
                      <p className="text-xs text-white/40">{sub.date}</p>
                   </div>
                   <span className="font-bold text-white">${sub.amount}</span>
                </button>
             ))}
             {subscriptions.length === 0 && <p className="text-white/30 text-center py-10">No subscriptions found.</p>}
          </div>
       ) : (
          <div className="flex flex-col h-full space-y-4">
             <div className="bg-indigo-500/10 p-4 rounded-xl border border-indigo-500/20">
                <div className="flex justify-between items-start mb-4">
                   <div>
                      <h4 className="font-bold text-white text-lg">{selectedSub.description}</h4>
                      <p className="text-indigo-300 text-sm">Current Cost: ${selectedSub.amount}/mo</p>
                   </div>
                   <button onClick={() => { setSelectedSub(null); setScript(''); }} className="text-xs text-white/40 hover:text-white">Change</button>
                </div>
                
                <div className="flex gap-2 mb-2">
                   <button 
                     onClick={() => setGoal('discount')}
                     className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors ${goal === 'discount' ? 'bg-indigo-600 text-white' : 'bg-black/20 text-white/50'}`}
                   >
                      Ask for Discount
                   </button>
                   <button 
                     onClick={() => setGoal('cancel')}
                     className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors ${goal === 'cancel' ? 'bg-rose-600 text-white' : 'bg-black/20 text-white/50'}`}
                   >
                      Cancel Service
                   </button>
                </div>

                <button 
                  onClick={handleGenerate}
                  disabled={loading}
                  className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center gap-2 text-sm font-bold transition-colors"
                >
                   {loading ? <Sparkles className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-yellow-400" />}
                   {loading ? 'Writing Script...' : 'Generate AI Script'}
                </button>
             </div>

             {script && (
                <div className="flex-1 bg-black/30 rounded-xl p-4 relative overflow-hidden flex flex-col min-h-0">
                   <div className="absolute top-2 right-2">
                      <button onClick={handleCopy} className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors">
                         {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                   </div>
                   <h5 className="text-xs text-white/40 uppercase font-bold mb-2">Generated Script</h5>
                   <div className="flex-1 overflow-y-auto custom-scrollbar text-sm text-white/80 whitespace-pre-wrap leading-relaxed pr-2">
                      {script}
                   </div>
                </div>
             )}
          </div>
       )}
    </div>
  );
};