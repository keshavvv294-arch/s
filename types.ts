
export type TransactionType = 'income' | 'expense';
export type TransactionStatus = 'cleared' | 'pending';
export type TransactionMood = 'happy' | 'neutral' | 'sad' | 'stressed' | 'impulsive' | 'necessary';

export interface Account {
  id: string;
  name: string;
  type: 'bank' | 'cash' | 'wallet' | 'credit';
  initialBalance: number;
  currency: string;
  color: string;
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: string;
  accountId?: string; 
  status?: TransactionStatus;
  notes?: string;
  tags?: string[];
  isRecurring?: boolean;
  receiptImage?: string;
  eventId?: string;
  mood?: TransactionMood;
}

export interface Beneficiary {
  id: string;
  name: string;
  vpa: string;
  avatar?: string;
  bankName?: string;
  isVerified?: boolean;
}

export interface Budget {
  category: string;
  limit: number;
}

export interface Asset {
  id: string;
  name: string;
  symbol: string; 
  type: 'stock' | 'crypto' | 'real-estate' | 'gold' | 'cash';
  amount: number;
  value: number;
  currency: string;
  lastUpdated?: string;
  isWatchlist?: boolean;
}

export interface Debt {
  id: string;
  person: string;
  amount: number;
  type: 'payable' | 'receivable';
  dueDate?: string;
  notes?: string;
  interestRate?: number; 
  minPayment?: number;   
}

export interface CreditScoreEntry {
  id: string;
  score: number;
  date: string;
  provider?: string;
}

export interface EventBudget {
  id: string;
  name: string;
  totalBudget: number;
  startDate: string;
  endDate: string;
  coverImage?: string;
}

export interface ShoppingItem {
  id: string;
  name: string;
  estimatedPrice: number;
  isBought: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string; 
  level: number;
  xp: number;
  title: string;
  joinDate: string;
  streak: number;
  upiId?: string;
  persona?: string;
  onboardingComplete: boolean;
}

export interface UserAuth {
  id: string;
  email: string;
  passwordHash: string; // Simulated hash
  profile: UserProfile;
}

export interface AppSettings {
  currency: string;
  theme: 'dark' | 'midnight' | 'ocean' | 'sunset';
  compactMode: boolean;
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  privacyMode: boolean;
  pin?: string;
}

// --- Dashboard Customization Types ---
export type WidgetSize = 'full' | 'half'; // 100% or 50% width

export interface DashboardWidgetConfig {
  id: string;
  visible: boolean;
  order: number;
  size: WidgetSize;
}

export interface AutomationRule {
  id: string;
  name: string;
  conditionField: 'description' | 'amount' | 'category';
  conditionOperator: 'contains' | 'equals' | 'greaterThan';
  conditionValue: string;
  actionType: 'tag' | 'categorize' | 'markStatus';
  actionValue: string;
  isActive: boolean;
}

export interface FilterState {
  search: string;
  type: 'all' | 'income' | 'expense';
  category: string;
  dateRange: 'all' | 'thisMonth' | 'lastMonth' | 'custom';
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  sortBy: 'date' | 'amount';
  sortOrder: 'asc' | 'desc';
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  condition: (data: any) => boolean;
}

export interface ImpulseItem {
  id: string;
  name: string;
  price: number;
  image?: string;
  addedDate: string;
  daysToWait: number;
}

export interface FinancialSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  salary: number;
  healthScore: number;
  dailySafeSpend: number;
  netWorth: number;
  savingsRate: number;
  projectedSavings: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success';
  date: Date;
  read: boolean;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export type ToolType = 
  | 'reports'       
  | 'events'        
  | 'shopping'
  | 'cheapest-buy'      
  | 'debts'         
  | 'calendar'
  | 'quiz'
  | 'subscriptions'
  | 'analytics-pro'
  | 'forecaster'
  | 'smart-rules'
  | 'scenario-lab'
  | 'debt-strategy'
  | 'rebalancer'
  | 'tax-estimator'
  | 'tax-assistant' 
  | 'invest-sim'    
  | 'negotiator'
  | 'inflation-sim'
  | 'split-bill' 
  | 'emi-calc' 
  | 'sip-calc' 
  | 'lumpsum'
  | 'fire-calc'
  | 'roi-calc'
  | 'cagr-calc'
  | 'rule-72'
  | 'emergency-fund'
  | 'step-up-sip'
  | 'inflation'
  | 'debt-payoff'
  | 'simple-interest'
  | 'compound-interest'
  | 'gst-calc'
  | 'discount-calc'
  | 'salary-tax'
  | 'net-worth'
  | 'savings-goal'
  | 'retirement'
  | 'fuel-cost'     
  | 'unit-price'    
  | 'hourly-rate'   
  | 'cc-payoff'     
  | 'zakat-calc'
  | 'roadmap'
  | 'predictive-flow'
  | 'hedging'
  | 'dream-invest'
  | 'digital-twin'
  | 'credit-builder'
  | 'lifestyle'
  | 'community-pool'
  | 'gesture-pay'    
  | 'none';

export const CATEGORIES = [
  'Housing',
  'Food',
  'Transportation',
  'Utilities',
  'Entertainment',
  'Healthcare',
  'Shopping',
  'Salary',
  'Investment',
  'Education',
  'Travel',
  'Other'
];

export const IMPULSE_IMAGES = [
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=200',
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=200'
];

export const ASSET_TYPES = {
  stock: 'Stock',
  crypto: 'Crypto',
  'real-estate': 'Real Estate',
  gold: 'Gold',
  cash: 'Cash'
};

export const CURRENCIES = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  INR: '₹'
};
