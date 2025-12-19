
import React, { useState } from 'react';
import { 
  Calculator, Divide, Percent, DollarSign, TrendingUp, ShieldCheck, Car, 
  Home, X, Flame, BarChart4, Umbrella, CreditCard, Coins, RefreshCw, 
  Target, Briefcase, Calendar, GraduationCap, Repeat, Search, Scale, 
  Clock, Heart, BookOpen, PenTool, BarChart3, Plane, ShoppingCart, 
  QrCode, ArrowLeft, Zap, Layers, ChevronRight, Wand2, GitMerge, 
  LineChart, FileText, Microscope, Timer, Map, Activity, Globe, 
  Rocket, Users, Hand, Star, BrainCircuit, Tag, LayoutGrid, Sparkles,
  // Add missing WalletCards icon
  WalletCards
} from 'lucide-react';
import { ToolType } from '../types';

interface ToolsMenuProps {
  onSelectTool: (tool: ToolType) => void;
}

interface ToolDef {
  id: string;
  name: string;
  icon: any;
  color: string;
  desc: string;
  category: string;
  isNew?: boolean;
}

interface CategoryDef {
  id: string;
  name: string;
  icon: any;
  color: string;
  bgGradient: string;
  desc: string;
}

export const ToolsMenu: React.FC<ToolsMenuProps> = ({ onSelectTool }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  const tools: ToolDef[] = [
    // Next Gen
    { id: 'roadmap', name: 'AI Roadmap', icon: Map, color: 'text-indigo-400', desc: 'GenAI Financial Plan', category: 'Next Gen', isNew: true },
    { id: 'tax-assistant', name: 'Smart Tax', icon: FileText, color: 'text-blue-400', desc: 'Auto-Detect Deductions', category: 'Next Gen', isNew: true },
    { id: 'invest-sim', name: 'Inv. Sim AI', icon: BrainCircuit, color: 'text-emerald-400', desc: '5-Year Projections', category: 'Next Gen', isNew: true },
    { id: 'predictive-flow', name: 'Future Flow', icon: Activity, color: 'text-blue-400', desc: 'Forecast Balances', category: 'Next Gen' },
    { id: 'hedging', name: 'Forex Hedge', icon: Globe, color: 'text-emerald-400', desc: 'Currency Simulator', category: 'Next Gen' },
    { id: 'digital-twin', name: 'Digital Twin', icon: Microscope, color: 'text-cyan-400', desc: '20-Year Sim', category: 'Next Gen' },
    { id: 'credit-builder', name: 'Credit AI', icon: ShieldCheck, color: 'text-yellow-400', desc: 'Score Improver', category: 'Next Gen' },
    { id: 'lifestyle', name: 'Life Sync', icon: Heart, color: 'text-rose-400', desc: 'App Integration', category: 'Next Gen' },
    { id: 'community-pool', name: 'Pools', icon: Users, color: 'text-orange-400', desc: 'Group Savings', category: 'Next Gen' },
    { id: 'gesture-pay', name: 'Gesture Pay', icon: Hand, color: 'text-teal-400', desc: 'Swipe to Pay', category: 'Next Gen' },

    // Pro Features
    { id: 'analytics-pro', name: 'Flow Map', icon: GitMerge, color: 'text-pink-400', desc: 'Sankey Diagram', category: 'Pro Features' },
    { id: 'forecaster', name: 'Forecaster', icon: LineChart, color: 'text-violet-400', desc: 'Trend Analysis', category: 'Pro Features' },
    { id: 'smart-rules', name: 'Auto Rules', icon: Wand2, color: 'text-amber-400', desc: 'Automation', category: 'Pro Features' },
    { id: 'scenario-lab', name: 'Scenario Lab', icon: Microscope, color: 'text-cyan-400', desc: 'What-If Analysis', category: 'Pro Features' },
    { id: 'debt-strategy', name: 'Debt Killer', icon: ShieldCheck, color: 'text-rose-400', desc: 'Payoff Strategies', category: 'Pro Features' },
    { id: 'rebalancer', name: 'Rebalance', icon: RefreshCw, color: 'text-emerald-400', desc: 'Portfolio Mix', category: 'Pro Features' },
    { id: 'tax-estimator', name: 'Tax Est.', icon: FileText, color: 'text-blue-400', desc: 'Liability Check', category: 'Pro Features' },
    { id: 'negotiator', name: 'Negotiator', icon: PenTool, color: 'text-indigo-400', desc: 'Script Gen', category: 'Pro Features' },
    { id: 'inflation-sim', name: 'Time Machine', icon: Timer, color: 'text-orange-400', desc: 'Value Erosion', category: 'Pro Features' },

    // Essentials
    { id: 'reports', name: 'Reports', icon: BarChart3, color: 'text-indigo-400', desc: 'Deep Dive', category: 'Essentials' },
    { id: 'debts', name: 'Debts', icon: CreditCard, color: 'text-rose-400', desc: 'Manage Loans', category: 'Essentials' },
    { id: 'calendar', name: 'Calendar', icon: Calendar, color: 'text-purple-400', desc: 'Day View', category: 'Essentials' },

    // Planning
    { id: 'events', name: 'Trip Plan', icon: Plane, color: 'text-sky-400', desc: 'Budget Travel', category: 'Planning' },
    { id: 'shopping', name: 'Shopping', icon: ShoppingCart, color: 'text-orange-400', desc: 'Lists & Buy', category: 'Planning' },
    { id: 'cheapest-buy', name: 'Price Hunter', icon: Tag, color: 'text-yellow-400', desc: 'Find Cheapest', category: 'Planning', isNew: true },
    { id: 'subscriptions', name: 'Subs', icon: Repeat, color: 'text-pink-400', desc: 'Recurring', category: 'Planning' },
    { id: 'savings-goal', name: 'Goals', icon: Target, color: 'text-emerald-400', desc: 'Track Progress', category: 'Planning' },
    { id: 'retirement', name: 'Retire', icon: Umbrella, color: 'text-indigo-400', desc: 'Corpus Calc', category: 'Planning' },
    
    // Calculators
    { id: 'emi-calc', name: 'EMI Loan', icon: Home, color: 'text-blue-400', desc: 'Loan Planner', category: 'Calculators' },
    { id: 'simple-interest', name: 'Simple Int.', icon: Percent, color: 'text-yellow-400', desc: 'Basic Return', category: 'Calculators' },
    { id: 'compound-interest', name: 'Comp. Int.', icon: Calculator, color: 'text-amber-400', desc: 'Power of Comp.', category: 'Calculators' },
    { id: 'gst-calc', name: 'GST/VAT', icon: DollarSign, color: 'text-purple-400', desc: 'Tax Add/Rem', category: 'Calculators' },
    { id: 'fuel-cost', name: 'Fuel Cost', icon: Car, color: 'text-red-400', desc: 'Trip Estimate', category: 'Calculators' },
    { id: 'unit-price', name: 'Unit Price', icon: Scale, color: 'text-lime-400', desc: 'Best Value', category: 'Calculators' },
    
    // Investment
    { id: 'sip-calc', name: 'SIP Calc', icon: TrendingUp, color: 'text-emerald-400', desc: 'Monthly Inv.', category: 'Investment' },
    { id: 'lumpsum', name: 'Lumpsum', icon: Coins, color: 'text-teal-400', desc: 'One-time Inv.', category: 'Investment' },
    { id: 'roi-calc', name: 'ROI Calc', icon: BarChart4, color: 'text-indigo-400', desc: 'Returns %', category: 'Investment' },
    { id: 'fire-calc', name: 'FIRE', icon: Flame, color: 'text-rose-400', desc: 'Freedom No.', category: 'Investment' },
    
    // Utilities
    { id: 'split-bill', name: 'Split Bill', icon: Divide, color: 'text-orange-400', desc: 'Group Share', category: 'Utilities' },
    { id: 'quiz', name: 'Quiz', icon: GraduationCap, color: 'text-yellow-400', desc: 'Learn Finance', category: 'Utilities' },
  ];

  const categories: CategoryDef[] = [
    { id: 'Next Gen', name: 'AI Labs', icon: Sparkles, color: 'text-indigo-400', bgGradient: 'from-indigo-600/20 to-purple-600/20', desc: 'Predictive & AI-driven wealth tools' },
    { id: 'Pro Features', name: 'Analytics Pro', icon: LineChart, color: 'text-violet-400', bgGradient: 'from-violet-600/20 to-pink-600/20', desc: 'Deep insights & automation rules' },
    // WalletCards is now imported
    { id: 'Essentials', name: 'Essentials', icon: WalletCards, color: 'text-blue-400', bgGradient: 'from-blue-600/20 to-cyan-600/20', desc: 'Core tracking & reporting tools' },
    { id: 'Planning', name: 'Planning', icon: Calendar, color: 'text-sky-400', bgGradient: 'from-sky-600/20 to-blue-600/20', desc: 'Goal setting & budget planning' },
    { id: 'Investment', name: 'Wealth', icon: Coins, color: 'text-emerald-400', bgGradient: 'from-emerald-600/20 to-teal-600/20', desc: 'Portfolio & ROI calculators' },
    { id: 'Calculators', name: 'Calculators', icon: Calculator, color: 'text-amber-400', bgGradient: 'from-amber-600/20 to-orange-600/20', desc: 'EMI, Taxes, and Interests' },
    { id: 'Utilities', name: 'Utilities', icon: LayoutGrid, color: 'text-rose-400', bgGradient: 'from-rose-600/20 to-red-600/20', desc: 'Group splitting & educational quizzes' },
  ];

  const filteredTools = tools.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.desc.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- SUB-VIEW: Tool List for a specific category ---
  if (selectedCategory) {
    const categoryTools = tools.filter(t => t.category === selectedCategory);
    const categoryInfo = categories.find(c => c.id === selectedCategory);

    return (
      <div className="space-y-6 h-full flex flex-col pb-24 animate-in slide-in-from-right duration-300">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setSelectedCategory(null)}
            className="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-white">{categoryInfo?.name}</h2>
            <p className="text-xs text-white/40">{categoryTools.length} tools available</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {categoryTools.map(tool => (
            <button 
              key={tool.id}
              onClick={() => onSelectTool(tool.id as ToolType)}
              className="bg-[#1e293b] p-4 rounded-2xl flex items-center gap-4 text-left hover:bg-[#2d3748] transition-all border border-white/5 group"
            >
              <div className={`p-3 rounded-xl bg-black/20 ${tool.color} group-hover:scale-110 transition-transform`}>
                <tool.icon className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-white text-sm">{tool.name}</h4>
                  {tool.isNew && <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></span>}
                </div>
                <p className="text-white/40 text-[11px] leading-tight mt-0.5">{tool.desc}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-white/10 group-hover:text-white/40" />
            </button>
          ))}
        </div>
      </div>
    );
  }

  // --- SUB-VIEW: Search Results ---
  if (searchTerm.trim().length > 0) {
    return (
      <div className="space-y-6 h-full flex flex-col pb-24">
        <div className="relative">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
           <input 
             type="text" 
             placeholder="Search tools..." 
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
             className="w-full bg-[#1e293b] border border-white/5 rounded-2xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-indigo-500 placeholder:text-white/20 transition-all shadow-sm"
             autoFocus
           />
           {searchTerm && (
             <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-white/40 hover:text-white">
                <X className="w-4 h-4" />
             </button>
           )}
        </div>
        <div className="grid grid-cols-1 gap-3 overflow-y-auto custom-scrollbar pb-10">
           <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest px-2">Matching Tools</h3>
           {filteredTools.length > 0 ? (
              filteredTools.map(tool => (
                <button 
                  key={tool.id}
                  onClick={() => onSelectTool(tool.id as ToolType)}
                  className="bg-[#1e293b] p-4 rounded-2xl flex items-center gap-4 text-left hover:bg-[#2d3748] transition-all border border-white/5"
                >
                  <div className={`p-3 rounded-xl bg-black/20 ${tool.color}`}>
                    <tool.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">{tool.name}</h4>
                    <p className="text-white/40 text-xs">{tool.category}</p>
                  </div>
                </button>
              ))
           ) : (
             <div className="text-center py-20 text-white/20">No tools found matching "{searchTerm}"</div>
           )}
        </div>
      </div>
    );
  }

  // --- MAIN VIEW: Category Selection ---
  return (
    <div className="space-y-8 h-full flex flex-col pb-24 overflow-y-auto custom-scrollbar animate-in fade-in duration-500">
      <div className="flex justify-between items-center px-2">
         <div>
            <h2 className="text-2xl font-bold text-white">Finance OS</h2>
            <p className="text-white/40 text-xs">Explore specialized wealth modules</p>
         </div>
         <button onClick={() => setSearchTerm(' ')} className="p-3 bg-[#1e293b] rounded-xl text-white/60 hover:text-white transition-colors border border-white/5 shadow-lg">
            <Search className="w-5 h-5" />
         </button>
      </div>

      <div className="grid grid-cols-1 gap-4 px-2">
        {categories.map(cat => {
           const count = tools.filter(t => t.category === cat.id).length;
           return (
             <button 
                key={cat.id} 
                onClick={() => setSelectedCategory(cat.id)}
                className={`group relative overflow-hidden bg-gradient-to-br ${cat.bgGradient} border border-white/5 rounded-[2rem] p-6 text-left transition-all hover:scale-[1.02] active:scale-[0.98] hover:shadow-2xl hover:shadow-indigo-500/10`}
             >
                <div className="flex justify-between items-start">
                   <div className="space-y-3 relative z-10">
                      <div className={`p-4 bg-black/30 rounded-2xl w-fit ${cat.color}`}>
                         <cat.icon className="w-8 h-8" />
                      </div>
                      <div>
                         <h3 className="text-xl font-extrabold text-white group-hover:text-white/90">{cat.name}</h3>
                         <p className="text-sm text-white/50 leading-relaxed max-w-[200px] mt-1">{cat.desc}</p>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] font-bold text-white/40 uppercase tracking-widest">
                         <Layers className="w-3 h-3" /> {count} Specialized Tools
                      </div>
                   </div>
                   
                   <div className="relative z-10">
                      <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/20 group-hover:bg-white/10 group-hover:text-white transition-all">
                         <ChevronRight className="w-6 h-6" />
                      </div>
                   </div>
                </div>

                {/* Decorative background circle */}
                <div className={`absolute -bottom-10 -right-10 w-40 h-40 rounded-full bg-white/5 blur-3xl group-hover:bg-white/10 transition-all duration-700`}></div>
             </button>
           );
        })}
      </div>
      
      {/* Footer Info */}
      <div className="px-6 py-4 bg-white/5 rounded-3xl border border-white/5 flex items-center justify-between mx-2 mb-4">
         <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span className="text-xs text-white/60 font-medium">Enterprise Grade Security</span>
         </div>
         <span className="text-[10px] text-white/20 font-bold uppercase">WealthFlow v2.4</span>
      </div>
    </div>
  );
};
