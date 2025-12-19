
import React from 'react';
import { ToolType, Transaction, Asset, FinancialSummary, Budget, Debt, EventBudget, ShoppingItem } from '../types';
import { ReportsTab } from './ReportsTab';
import { DebtManager } from './DebtManager';
import { EventPlanner } from './EventPlanner';
import { ShoppingList } from './ShoppingList';
import { ExpenseCalendar } from './ExpenseCalendar';
import { FinancialQuiz } from './FinancialQuiz';
import { SubscriptionTracker } from './SubscriptionTracker';
// Fix: Import SmartCalculator from its correct file instead of non-existent UniversalCalculator from ToolsMenu
import { SmartCalculator } from './SmartCalculator';
import { CreditScoreTracker } from './CreditScoreTracker';
import { AdvancedAnalytics } from './AdvancedAnalytics';
import { SmartRules } from './SmartRules';
import { ScenarioLab } from './ScenarioLab';
import { DebtStrategy } from './DebtStrategy';
import { InvestmentRebalancer } from './InvestmentRebalancer';
import { TaxEstimator } from './TaxEstimator';
import { SubscriptionNegotiator } from './SubscriptionNegotiator';
import { FinancialRoadmap } from './FinancialRoadmap';
import { PredictiveCashFlow } from './PredictiveCashFlow';
import { CurrencyHedging } from './CurrencyHedging';
import { DreamInvest } from './DreamInvest';
import { DigitalTwin } from './DigitalTwin';
import { CreditBuilder } from './CreditBuilder';
import { LifestyleFinance } from './LifestyleFinance';
import { CommunityPools } from './CommunityPools';
import { GesturePay } from './GesturePay';
import { SmartTaxAssistant } from './SmartTaxAssistant';
import { InvestmentSimulator } from './InvestmentSimulator';
import { CheapestBuyer } from './CheapestBuyer';
import { X } from 'lucide-react';

interface ToolsViewRendererProps {
  activeTool: ToolType;
  onClose: () => void;
  data: {
    transactions: Transaction[];
    assets: Asset[];
    summary: FinancialSummary;
    budgets: Budget[];
    debts: Debt[];
    events: EventBudget[];
    shoppingItems: ShoppingItem[];
    creditHistory: any[];
    currencySymbol: string;
  };
  actions: {
    onAddDebt: (d: Debt) => void;
    onDeleteDebt: (id: string) => void;
    onAddScore: (s: any) => void;
    onDeleteScore: (id: string) => void;
    onAddEvent: (e: EventBudget) => void;
    onDeleteEvent: (id: string) => void;
    onAddItem: (i: ShoppingItem) => void;
    onDeleteItem: (id: string) => void;
    onToggleItem: (id: string) => void;
    onConvertToTransaction: (item: ShoppingItem) => void;
    onAddTransaction: (t: Omit<Transaction, 'id'>) => void;
  };
}

export const ToolsViewRenderer: React.FC<ToolsViewRendererProps> = ({ activeTool, onClose, data, actions }) => {
  // Advanced Tools Group
  if (['analytics-pro', 'forecaster', 'inflation-sim'].includes(activeTool)) {
     return <AdvancedAnalytics toolId={activeTool} transactions={data.transactions} summary={data.summary} onClose={onClose} />;
  }
  if (activeTool === 'smart-rules') return <SmartRules onClose={onClose} />;
  if (activeTool === 'scenario-lab') return <ScenarioLab currentSavings={data.summary.balance} monthlySavings={data.summary.projectedSavings} onClose={onClose} />;
  
  // New Pro Features
  if (activeTool === 'debt-strategy') return <DebtStrategy debts={data.debts} onClose={onClose} />;
  if (activeTool === 'rebalancer') return <InvestmentRebalancer assets={data.assets} onClose={onClose} />;
  if (activeTool === 'tax-estimator') return <TaxEstimator onClose={onClose} />;
  if (activeTool === 'negotiator') return <SubscriptionNegotiator transactions={data.transactions} onClose={onClose} />;

  // Next Gen Features (New)
  if (activeTool === 'roadmap') return <FinancialRoadmap summary={data.summary} debts={data.debts} assets={data.assets} onClose={onClose} />;
  if (activeTool === 'predictive-flow') return <PredictiveCashFlow transactions={data.transactions} currentBalance={data.summary.balance} onClose={onClose} />;
  if (activeTool === 'hedging') return <CurrencyHedging onClose={onClose} />;
  if (activeTool === 'dream-invest') return <DreamInvest onClose={onClose} onInvest={actions.onAddTransaction} />;
  if (activeTool === 'digital-twin') return <DigitalTwin currentNetWorth={data.summary.netWorth} onClose={onClose} />;
  if (activeTool === 'credit-builder') return <CreditBuilder currentScore={data.creditHistory[data.creditHistory.length-1]?.score || 650} debts={data.debts} onClose={onClose} />;
  if (activeTool === 'lifestyle') return <LifestyleFinance transactions={data.transactions} onClose={onClose} />;
  if (activeTool === 'community-pool') return <CommunityPools onClose={onClose} onContribute={actions.onAddTransaction} />;
  if (activeTool === 'gesture-pay') return <GesturePay onClose={onClose} onPay={actions.onAddTransaction} />;
  if (activeTool === 'tax-assistant') return <SmartTaxAssistant onClose={onClose} transactions={data.transactions} />;
  if (activeTool === 'invest-sim') return <InvestmentSimulator onClose={onClose} assets={data.assets} />;
  if (activeTool === 'cheapest-buy') return <CheapestBuyer onClose={onClose} />;

  // Standard Tools
  if (activeTool === 'reports') return <ReportsTab transactions={data.transactions} assets={data.assets} summary={data.summary} budgets={data.budgets} currencySymbol={data.currencySymbol} />;
  if (activeTool === 'calendar') return <ExpenseCalendar transactions={data.transactions} onClose={onClose} />;
  if (activeTool === 'quiz') return <FinancialQuiz onClose={onClose} />;
  if (activeTool === 'subscriptions') return <SubscriptionTracker transactions={data.transactions} onClose={onClose} />;
  
  if (activeTool === 'debts') return (
     <div className="space-y-8">
        <DebtManager debts={data.debts} onAddDebt={actions.onAddDebt} onDeleteDebt={actions.onDeleteDebt} currencySymbol={data.currencySymbol} />
        <CreditScoreTracker history={data.creditHistory} onAddScore={actions.onAddScore} onDeleteScore={actions.onDeleteScore} />
     </div>
  );

  if (activeTool === 'events') return <EventPlanner events={data.events} transactions={data.transactions} onAddEvent={actions.onAddEvent} onDeleteEvent={actions.onDeleteEvent} onAddTransaction={actions.onAddTransaction} currencySymbol={data.currencySymbol} />;
  
  if (activeTool === 'shopping') return <ShoppingList items={data.shoppingItems} onAddItem={actions.onAddItem} onDeleteItem={actions.onDeleteItem} onToggleItem={actions.onToggleItem} onConvertToTransaction={actions.onConvertToTransaction} currencySymbol={data.currencySymbol} />;

  // Calculators
  // Fix: Use SmartCalculator instead of non-existent UniversalCalculator
  return (
     <div className="h-full flex items-center justify-center">
        <SmartCalculator toolId={activeTool} onClose={onClose} />
     </div>
  );
};
