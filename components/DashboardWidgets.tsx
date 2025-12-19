import React from 'react';
import { CustomizableLayout } from './CustomizableLayout';
import { SummaryCards } from './SummaryCards';
import { TransactionList } from './TransactionList';
import { FinancialChart } from './FinancialChart';
import { GeminiAdvisor } from './GeminiAdvisor';
import { 
  Plus, Target, TrendingUp, MessageSquare, ShieldCheck, PieChart, Award
} from 'lucide-react';
import { 
  Transaction, FinancialSummary, Asset, Budget, Debt
} from '../types';

interface HomeDashboardProps {
  transactions: Transaction[];
  assets: Asset[];
  summary: FinancialSummary;
  budgets: Budget[];
  debts: Debt[];
  salary: number;
  privacyMode: boolean;
  actions: {
    onOpenForm: () => void;
    onOpenBudget: () => void;
    onOpenInvest: () => void;
    onOpenChat: () => void;
    onDeleteTransaction: (id: string) => void;
  };
  dailyQuote: string;
}

export const CustomizableDashboard: React.FC<HomeDashboardProps> = (props) => {
  const totalAssets = props.assets.reduce((sum, a) => sum + (a.amount * a.value), 0);
  const totalDebt = props.debts.reduce((sum, d) => sum + (d.type === 'payable' ? d.amount : 0), 0);
  const exceededBudgets = props.budgets.filter(b => {
      const spent = props.transactions.filter(t => t.category === b.category && t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
      return spent > b.limit;
  });

  const widgets = [
    {
      id: 'summary',
      title: 'Balance Summary',
      content: <SummaryCards summary={props.summary} privacyMode={props.privacyMode} />,
      defaultSize: 'full' as const
    },
    {
      id: 'actions',
      title: 'Quick Actions',
      content: (
        <div className="grid grid-cols-4 gap-3 h-full">
           {[
              { label: "Add", icon: Plus, action: props.actions.onOpenForm },
              { label: "Budget", icon: Target, action: props.actions.onOpenBudget },
              { label: "Invest", icon: TrendingUp, action: props.actions.onOpenInvest },
              { label: "AI", icon: MessageSquare, action: props.actions.onOpenChat }
           ].map((action, idx) => (
              <button key={idx} onClick={action.action} className="bg-[#1e293b] p-4 rounded-2xl flex flex-col items-center justify-center gap-2 hover:bg-[#334155] transition-colors shadow-sm h-full">
                 <action.icon className="w-5 h-5 text-indigo-400" />
                 <span className="text-[10px] font-bold text-white/60">{action.label}</span>
              </button>
           ))}
        </div>
      ),
      defaultSize: 'full' as const
    },
    {
      id: 'recent_transactions',
      title: 'Recent Activity',
      content: <TransactionList transactions={props.transactions} onDelete={props.actions.onDeleteTransaction} />,
      defaultSize: 'half' as const
    },
    {
      id: 'spending_chart',
      title: 'Spending Breakdown',
      content: <FinancialChart transactions={props.transactions} />,
      defaultSize: 'half' as const
    },
    {
      id: 'ai_insight',
      title: 'Gemini Advisor',
      content: <GeminiAdvisor transactions={props.transactions} salary={props.summary.salary} />,
      defaultSize: 'full' as const
    },
    {
      id: 'asset_allocation',
      title: 'Net Assets',
      content: (
         <div className="glass p-6 rounded-3xl flex items-center justify-between h-full">
            <div>
               <h3 className="text-white font-bold flex items-center gap-2"><PieChart className="w-5 h-5 text-emerald-400" /> Net Assets</h3>
               <p className="text-3xl font-bold text-white mt-2">${totalAssets.toLocaleString()}</p>
            </div>
            <div className="h-12 w-12 rounded-full border-4 border-emerald-500 flex items-center justify-center text-xs font-bold text-emerald-400">
               {props.assets.length}
            </div>
         </div>
      ),
      defaultSize: 'half' as const
    },
    {
      id: 'health_score',
      title: 'Health Score',
      content: (
        <div className="bg-[#1e293b] rounded-3xl p-6 flex flex-col justify-center items-center text-center space-y-2 h-full">
          <Award className="w-8 h-8 text-emerald-400 mb-2" />
          <h3 className="text-base font-bold text-white">Health Score: {props.summary.healthScore}/100</h3>
          <div className="w-full bg-white/10 h-2 rounded-full mt-2 overflow-hidden">
             <div className="h-full bg-emerald-500" style={{width: `${props.summary.healthScore}%`}}></div>
          </div>
        </div>
      ),
      defaultSize: 'half' as const
    },
    {
      id: 'debt_summary',
      title: 'Liability Tracker',
      content: (
        <div className="glass p-6 rounded-3xl flex items-center justify-between border-l-4 border-rose-500 h-full">
           <div>
              <h3 className="text-white font-bold flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-rose-400" /> Liability</h3>
              <p className="text-3xl font-bold text-white mt-2">${totalDebt.toLocaleString()}</p>
           </div>
        </div>
      ),
      defaultSize: 'half' as const
    },
    {
      id: 'budgets',
      title: 'Budget Alerts',
      content: (
        <div className="glass p-4 rounded-3xl h-full flex flex-col justify-center">
           <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2"><Target className="w-4 h-4 text-orange-400" /> Budget Alerts</h3>
           {exceededBudgets.length > 0 ? (
              <div className="space-y-2">
                 {exceededBudgets.map(b => (
                    <div key={b.category} className="text-xs text-rose-400 bg-rose-900/20 px-3 py-2 rounded-lg border border-rose-500/20">
                       Exceeded {b.category} limit!
                    </div>
                 ))}
              </div>
           ) : (
              <p className="text-xs text-emerald-400 bg-emerald-900/20 px-3 py-2 rounded-lg border border-emerald-500/20">
                 All budgets are on track.
              </p>
           )}
        </div>
      ),
      defaultSize: 'half' as const
    },
    {
      id: 'quote',
      title: 'Daily Quote',
      content: <div className="h-full flex items-center justify-center p-4 glass rounded-3xl"><p className="text-center text-white/30 text-xs italic">"{props.dailyQuote}"</p></div>,
      defaultSize: 'full' as const
    }
  ];

  return <CustomizableLayout viewId="home" widgets={widgets} />;
};