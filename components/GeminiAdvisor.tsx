
import React, { useState } from 'react';
import { Sparkles, Loader2, Bot, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Transaction } from '../types';
import { getFinancialAdvice } from '../services/geminiService';

interface GeminiAdvisorProps {
  transactions: Transaction[];
  salary: number;
}

export const GeminiAdvisor: React.FC<GeminiAdvisorProps> = ({ transactions, salary }) => {
  const [advice, setAdvice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGetAdvice = async () => {
    if (transactions.length === 0) {
      setAdvice("Please add some transactions first so I can analyze your spending habits!");
      return;
    }

    setLoading(true);
    try {
      const result = await getFinancialAdvice(transactions, salary);
      setAdvice(result);
    } catch (e) {
      setAdvice("Something went wrong while connecting to the AI.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass rounded-3xl p-1 relative overflow-hidden group">
      {/* Animated gradient border effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
      
      <div className="bg-[#0f172a] rounded-[22px] relative z-10 p-6 h-full flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/20 rounded-xl text-indigo-400">
              <Bot className="w-6 h-6" />
            </div>
            <div>
               <h3 className="text-lg font-bold text-white">WealthFlow AI Assistant</h3>
               <p className="text-xs text-white/40">Financial Assistant</p>
            </div>
          </div>
          {advice && (
             <button onClick={() => setAdvice(null)} className="text-white/40 hover:text-white">
                <X className="w-5 h-5" />
             </button>
          )}
        </div>

        {!advice ? (
           <div className="flex-1 flex flex-col justify-center items-center text-center py-6">
              <p className="text-white/60 text-sm mb-6 max-w-xs">
                 Analyze your spending patterns, get savings tips, and improve your financial health score.
              </p>
              
              <button
                onClick={handleGetAdvice}
                disabled={loading}
                className="group relative inline-flex items-center justify-center px-6 py-3 font-semibold text-white transition-all duration-200 bg-indigo-600 rounded-xl hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 focus:ring-offset-gray-900 w-full"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                     <Sparkles className="w-5 h-5 mr-2" />
                     Start Analysis
                  </>
                )}
              </button>
           </div>
        ) : (
          <div className="flex-1 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
             <div className="prose prose-invert prose-sm">
                <ReactMarkdown>{advice}</ReactMarkdown>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};
