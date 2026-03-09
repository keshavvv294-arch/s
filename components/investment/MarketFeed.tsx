import React, { useState, useEffect } from 'react';
import { Newspaper, Loader2 } from 'lucide-react';
import { getMarketNews } from '../../services/geminiService';

export const MarketFeed: React.FC = () => {
  const [marketNews, setMarketNews] = useState<{t: string, s: string, time: string}[]>([]);
  const [isLoadingNews, setIsLoadingNews] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      setIsLoadingNews(true);
      const news = await getMarketNews();
      setMarketNews(news);
      setIsLoadingNews(false);
    };
    fetchNews();
  }, []);

  return (
    <div className="glass-card rounded-3xl p-6 h-full flex flex-col overflow-hidden border border-white/5 hover:border-white/10 transition-colors shadow-lg shadow-black/30">
       <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Newspaper className="w-4 h-4" /> Market Feed
       </h3>
       <div className="space-y-3 overflow-y-auto custom-scrollbar flex-1 pr-2">
         {isLoadingNews ? (
           <div className="flex items-center justify-center h-full gap-2 text-white/40">
             <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
             <span className="text-xs">Loading news...</span>
           </div>
         ) : (
           marketNews.map((news, i) => (
             <div key={i} className="bg-white/5 p-3 rounded-xl hover:bg-white/10 transition-all cursor-pointer border border-transparent hover:border-white/10 group">
                <p className="text-xs text-white/80 font-medium leading-tight group-hover:text-indigo-300 transition-colors">{news.t}</p>
                <div className="flex justify-between mt-2">
                   <span className="text-[10px] text-indigo-300 font-bold uppercase tracking-wider bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20">{news.s}</span>
                   <span className="text-[10px] text-white/30 font-mono">{news.time}</span>
                </div>
             </div>
           ))
         )}
       </div>
    </div>
  );
};
