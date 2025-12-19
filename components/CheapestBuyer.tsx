
import React, { useState } from 'react';
import { X, Search, ShoppingBag, ExternalLink, Loader2, Tag } from 'lucide-react';
import { findCheapestPrice } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

interface CheapestBuyerProps {
  onClose: () => void;
}

export const CheapestBuyer: React.FC<CheapestBuyerProps> = ({ onClose }) => {
  const [product, setProduct] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ text: string, sources: any[] } | null>(null);

  const handleSearch = async () => {
    if (!product.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const data = await findCheapestPrice(product);
      setResult(data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass rounded-3xl p-6 h-full animate-in slide-in-from-right duration-200 flex flex-col">
       <div className="flex justify-between items-center mb-6">
         <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Tag className="w-5 h-5 text-yellow-400" /> Price Hunter
         </h3>
         <button onClick={onClose} className="text-white/40 hover:text-white"><X className="w-6 h-6" /></button>
       </div>

       <div className="flex gap-2 mb-6">
          <div className="relative flex-1">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
             <input 
               type="text" 
               value={product}
               onChange={(e) => setProduct(e.target.value)}
               onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
               placeholder="Enter product name (e.g. Sony WH-1000XM5)" 
               className="w-full bg-black/20 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-yellow-500 transition-all placeholder:text-white/20"
             />
          </div>
          <button 
            onClick={handleSearch}
            disabled={loading || !product}
            className="bg-yellow-600 px-5 rounded-xl font-bold text-white hover:bg-yellow-500 disabled:opacity-50 transition-all flex items-center justify-center"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Find'}
          </button>
       </div>

       <div className="flex-1 overflow-y-auto custom-scrollbar">
          {!result && !loading && (
             <div className="flex flex-col items-center justify-center h-full text-white/30 space-y-4">
                <ShoppingBag className="w-16 h-16 opacity-20" />
                <p className="text-center max-w-xs">
                   Enter a product name to scan major retailers for the best deals in real-time.
                </p>
             </div>
          )}

          {loading && (
             <div className="flex flex-col items-center justify-center h-40 space-y-3">
                <Loader2 className="w-8 h-8 text-yellow-400 animate-spin" />
                <p className="text-white/50 text-sm">Scanning retailers...</p>
             </div>
          )}

          {result && (
             <div className="space-y-6 animate-in fade-in">
                <div className="bg-white/5 p-5 rounded-2xl border border-white/10">
                   <div className="prose prose-invert prose-sm max-w-none">
                      <ReactMarkdown>{result.text}</ReactMarkdown>
                   </div>
                </div>

                {result.sources && result.sources.length > 0 && (
                   <div className="space-y-2">
                      <h4 className="text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Sources Found</h4>
                      <div className="grid grid-cols-1 gap-2">
                         {result.sources.map((source: any, index: number) => {
                            // Extract title and URL based on Google Search structure (web object)
                            const web = source.web;
                            if (!web) return null;
                            
                            return (
                               <a 
                                 key={index} 
                                 href={web.uri} 
                                 target="_blank" 
                                 rel="noopener noreferrer"
                                 className="flex items-center justify-between bg-[#1e293b] p-3 rounded-xl border border-white/5 hover:bg-white/5 transition-colors group"
                               >
                                  <div className="flex items-center gap-3 overflow-hidden">
                                     <div className="p-2 bg-white/5 rounded-lg text-white/40 group-hover:text-yellow-400 transition-colors">
                                        <ExternalLink className="w-4 h-4" />
                                     </div>
                                     <span className="text-sm text-white/80 truncate">{web.title}</span>
                                  </div>
                               </a>
                            );
                         })}
                      </div>
                   </div>
                )}
             </div>
          )}
       </div>
    </div>
  );
};
