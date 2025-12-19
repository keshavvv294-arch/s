
import React, { useState, useMemo, useEffect } from 'react';
import { Plus, Settings, Home, User, Wallet, LayoutGrid, TrendingUp, Command, Mic2, Briefcase, Edit2, List, Bot, X, AlertTriangle, WifiOff, ArrowLeft, QrCode, Zap } from 'lucide-react';
import { SummaryCards } from './components/SummaryCards';
import { TransactionsTab } from './components/TransactionsTab';
import { TransactionForm } from './components/TransactionForm';
import { AccountForm } from './components/AccountForm';
import { AIChat } from './components/AIChat';
import { ToolsMenu } from './components/ToolsMenu';
import { ToolsViewRenderer } from './components/ToolsViewRenderer';
import { CustomizableDashboard } from './components/DashboardWidgets'; 
import { InvestmentTab } from './components/InvestmentTab';
import { CommandPalette } from './components/CommandPalette';
import { SettingsDrawer } from './components/SettingsDrawer';
import { BudgetModal } from './components/BudgetModal';
import { UPIView } from './components/UPIView';
import { Achievements } from './components/Achievements';
import { LoginScreen } from './components/LoginScreen';
import { OnboardingWizard } from './components/OnboardingWizard';
import { authService } from './services/authService';
import { processNaturalLanguageCommand } from './services/geminiService';
import { Transaction, FinancialSummary, ToolType, Asset, Notification, UserProfile, Budget, AppSettings, CURRENCIES, Debt, EventBudget, ShoppingItem, CreditScoreEntry, Account } from './types';

const INITIAL_ACCOUNTS: Account[] = [
  { id: '1', name: 'Main Wallet', type: 'cash', initialBalance: 0, currency: 'USD', color: 'bg-indigo-500' }
];

const INITIAL_SETTINGS: AppSettings = {
  currency: 'USD',
  theme: 'midnight',
  compactMode: false,
  soundEnabled: true,
  hapticsEnabled: true,
  privacyMode: false,
  pin: '1234'
};

const QUOTES = [
   "Do not save what is left after spending, but spend what is left after saving. – Warren Buffett",
   "A budget is telling your money where to go instead of wondering where it went. – Dave Ramsey",
   "Wealth is the ability to fully experience life. – Henry David Thoreau",
   "It’s not how much money you make, but how much money you keep. – Robert Kiyosaki"
];

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isAccountFormOpen, setIsAccountFormOpen] = useState(false);
  const [isFabOpen, setIsFabOpen] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [isGlobalListening, setIsGlobalListening] = useState(false);
  const [activeTool, setActiveTool] = useState<ToolType>('none');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [dailyQuote] = useState(QUOTES[0]);
  const [aiContextMessage, setAiContextMessage] = useState<string | null>(null);
  
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('finance_transactions');
    return saved ? JSON.parse(saved) : [];
  });

  const [accounts, setAccounts] = useState<Account[]>(() => {
    const saved = localStorage.getItem('finance_accounts');
    return saved ? JSON.parse(saved) : INITIAL_ACCOUNTS;
  });

  const [assets, setAssets] = useState<Asset[]>(() => {
    const saved = localStorage.getItem('finance_assets');
    return saved ? JSON.parse(saved) : [];
  });

  const [debts, setDebts] = useState<Debt[]>(() => {
    const saved = localStorage.getItem('finance_debts');
    return saved ? JSON.parse(saved) : [];
  });

  const [creditHistory, setCreditHistory] = useState<CreditScoreEntry[]>(() => {
    const saved = localStorage.getItem('finance_credit_score');
    return saved ? JSON.parse(saved) : [];
  });

  const [events, setEvents] = useState<EventBudget[]>(() => {
    const saved = localStorage.getItem('finance_events');
    return saved ? JSON.parse(saved) : [];
  });

  const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>(() => {
    const saved = localStorage.getItem('finance_shopping');
    return saved ? JSON.parse(saved) : [];
  });

  const [budgets, setBudgets] = useState<Budget[]>(() => {
    const saved = localStorage.getItem('finance_budgets');
    return saved ? JSON.parse(saved) : [];
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('finance_settings');
    return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
  });

  const [salary, setSalary] = useState<number>(() => {
    const saved = localStorage.getItem('finance_salary');
    return saved ? Number(saved) : 0;
  });

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const user = await authService.getCurrentUser();
      if (user) {
        setUserProfile(user);
        setIsAuthenticated(true);
      }
    };
    checkAuth();
  }, []);
  
  const currencySymbol = CURRENCIES[settings.currency as keyof typeof CURRENCIES] || '$';

  const summary: FinancialSummary = useMemo(() => {
    let totalIncome = 0;
    let totalExpense = 0;
    
    transactions.forEach(t => {
       if (t.type === 'income') totalIncome += t.amount;
       else totalExpense += t.amount;
    });

    let accountsBalance = accounts.reduce((sum, acc) => sum + acc.initialBalance, 0);
    const currentBalance = accountsBalance + totalIncome - totalExpense;
    const netWorth = assets.reduce((sum, a) => sum + (a.amount * a.value), 0) + currentBalance;
    const savingsRate = totalIncome > 0 ? (totalIncome - totalExpense) / totalIncome : 0;
    const dailySafeSpend = Math.max(0, (salary - totalExpense) / 30);
    const projectedSavings = (salary - totalExpense); 

    let score = Math.min(Math.round(savingsRate * 500), 100); 
    if (currentBalance > 2000) score += 10;
    if (netWorth > 10000) score += 10;

    return { 
      totalIncome, totalExpense, 
      balance: currentBalance, 
      salary, 
      healthScore: Math.min(score, 100), 
      dailySafeSpend,
      netWorth,
      savingsRate,
      projectedSavings
    };
  }, [transactions, salary, assets, accounts]);

  useEffect(() => { localStorage.setItem('finance_transactions', JSON.stringify(transactions)); }, [transactions]);
  useEffect(() => { localStorage.setItem('finance_accounts', JSON.stringify(accounts)); }, [accounts]);
  useEffect(() => { localStorage.setItem('finance_assets', JSON.stringify(assets)); }, [assets]);
  useEffect(() => { localStorage.setItem('finance_debts', JSON.stringify(debts)); }, [debts]);
  useEffect(() => { localStorage.setItem('finance_credit_score', JSON.stringify(creditHistory)); }, [creditHistory]);
  useEffect(() => { localStorage.setItem('finance_events', JSON.stringify(events)); }, [events]);
  useEffect(() => { localStorage.setItem('finance_shopping', JSON.stringify(shoppingItems)); }, [shoppingItems]);
  useEffect(() => { localStorage.setItem('finance_budgets', JSON.stringify(budgets)); }, [budgets]);
  useEffect(() => { localStorage.setItem('finance_settings', JSON.stringify(settings)); }, [settings]);
  useEffect(() => { localStorage.setItem('finance_salary', salary.toString()); }, [salary]);

  const triggerHaptic = () => { if (settings.hapticsEnabled && navigator.vibrate) navigator.vibrate(10); };

  const handleAddTransaction = (newTx: Omit<Transaction, 'id'>) => {
    const txAccount = newTx.accountId || accounts[0]?.id;
    const transaction: Transaction = { 
       ...newTx, 
       id: Math.random().toString(36).substr(2, 9), 
       status: 'cleared',
       accountId: txAccount
    };
    setTransactions(prev => [transaction, ...prev]);
    triggerHaptic();
  };

  const handleSalaryUpdate = (amount: number) => {
    setSalary(amount);
    setNotifications(prev => [...prev, {
      id: Date.now().toString(),
      title: "Salary Updated",
      message: `Your monthly income has been set to ${currencySymbol}${amount}.`,
      type: "success",
      date: new Date(),
      read: false
    }]);
    triggerHaptic();
  };

  const handleLoginSuccess = (user: UserProfile) => {
    setUserProfile(user);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setUserProfile(null);
  };

  const handleOnboardingComplete = async (newSalary: number, newBudgets: Budget[], goal: string) => {
    setSalary(newSalary);
    setBudgets(newBudgets);
    
    handleAddTransaction({
      description: 'Initial Salary Setup',
      amount: newSalary,
      type: 'income',
      category: 'Salary',
      date: new Date().toISOString().split('T')[0],
      status: 'cleared',
      tags: ['salary', 'onboarding']
    });

    if (userProfile) {
       const updatedProfile = await authService.updateProfile({ onboardingComplete: true });
       setUserProfile(updatedProfile);
    }
    setActiveTab('home');
  };

  const startGlobalVoice = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).Recognition;
      const recognition = new SpeechRecognition();
      recognition.onstart = () => setIsGlobalListening(true);
      recognition.onend = () => setIsGlobalListening(false);
      recognition.onresult = async (event: any) => {
        const transcript = event.results[0][0].transcript;
        try {
           const result = await processNaturalLanguageCommand(transcript);
           if (result.action === 'add_transaction' && result.data) {
              handleAddTransaction({ ...result.data, date: new Date().toISOString().split('T')[0], accountId: accounts[0]?.id });
           }
        } catch (e) { console.error(e); }
      };
      recognition.start();
    }
  };

  if (!isAuthenticated || !userProfile) return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  if (!userProfile.onboardingComplete) return <OnboardingWizard userName={userProfile.name} onComplete={handleOnboardingComplete} />;

  return (
    <div className="min-h-screen text-white relative z-10 bg-[#0f172a] flex flex-col font-['Inter']">
      {isOffline && <div className="bg-rose-500 text-white text-xs font-bold text-center py-1 sticky top-0 z-50">Offline Mode</div>}

      <header className="px-6 py-4 flex items-center justify-between sticky top-0 z-30 bg-[#0f172a]/90 backdrop-blur-md border-b border-white/5 print:hidden">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-lg">W</div>
          <span className="text-lg font-black tracking-tight">WealthFlow</span>
        </div>
        <div className="flex items-center gap-2">
           <button onClick={startGlobalVoice} className={`p-2.5 rounded-full transition-all ${isGlobalListening ? 'bg-red-500 text-white animate-pulse' : 'text-white/40 hover:text-white hover:bg-white/5'}`}><Mic2 className="w-5 h-5" /></button>
           <button onClick={() => setIsCommandOpen(true)} className="p-2.5 text-white/40 hover:text-white transition-colors"><Command className="w-5 h-5" /></button>
           <button onClick={() => setActiveTab('profile')} className="w-9 h-9 rounded-xl overflow-hidden border border-white/10 hover:border-white/30 transition-all"><img src={`https://ui-avatars.com/api/?name=${userProfile.name}&background=6366f1&color=fff`} alt="Profile" className="w-full h-full object-cover" /></button>
        </div>
      </header>

      <main className={activeTab === 'chat' ? "h-full w-full pb-20" : "max-w-4xl mx-auto px-4 sm:px-6 pt-6 pb-24 h-full w-full"}>
        {activeTab === 'home' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* DUPLICATE REMOVED: SummaryCards is now handled exclusively by CustomizableDashboard's 'summary' widget to prevent double instances. */}
            <CustomizableDashboard transactions={transactions} assets={assets} summary={summary} budgets={budgets} debts={debts} salary={salary} privacyMode={settings.privacyMode} dailyQuote={dailyQuote} onUpdateSalary={handleSalaryUpdate} actions={{ onOpenForm: () => setIsFormOpen(true), onOpenBudget: () => setIsBudgetModalOpen(true), onOpenInvest: () => setActiveTab('invest'), onOpenChat: () => setActiveTab('chat'), onDeleteTransaction: (id) => setTransactions(t => t.filter(x => x.id !== id)) }} />
          </div>
        )}

        {activeTab === 'transactions' && <TransactionsTab transactions={transactions} onDelete={(id) => setTransactions(t => t.filter(x => x.id !== id))} onDeleteBulk={(ids) => setTransactions(prev => prev.filter(t => !ids.includes(t.id)))} onDuplicate={(t) => handleAddTransaction(t)} onToggleStatus={(id) => setTransactions(prev => prev.map(t => t.id === id ? { ...t, status: t.status === 'cleared' ? 'pending' : 'cleared' } : t))} currencySymbol={currencySymbol} />}
        {activeTab === 'chat' && <AIChat initialMessage={aiContextMessage} />}
        {activeTab === 'invest' && <InvestmentTab assets={assets} onAddAsset={(a) => setAssets([...assets, a])} onDeleteAsset={(id) => setAssets(prev => prev.filter(a => a.id !== id))} onUpdateAssetValue={(id, val) => setAssets(prev => prev.map(a => a.id === id ? { ...a, value: val } : a))} privacyMode={settings.privacyMode} />}
        {activeTab === 'upi' && <UPIView userUpiId={userProfile.upiId} onUpdateUpi={(id) => authService.updateProfile({ upiId: id })} onAddTransaction={handleAddTransaction} transactions={transactions} />}
        
        {activeTab === 'tools' && (
          <div className="animate-in fade-in duration-500">
            {activeTool === 'none' ? <ToolsMenu onSelectTool={setActiveTool} /> : <ToolsViewRenderer activeTool={activeTool} onClose={() => setActiveTool('none')} data={{ transactions, assets, summary, budgets, debts, events: [], shoppingItems: [], creditHistory: [], currencySymbol }} actions={{ onAddDebt: (d) => setDebts([...debts, d]), onDeleteDebt: (id) => setDebts(debts.filter(d => d.id !== id)), onAddScore: () => {}, onDeleteScore: () => {}, onAddEvent: () => {}, onDeleteEvent: () => {}, onAddItem: () => {}, onDeleteItem: () => {}, onToggleItem: () => {}, onConvertToTransaction: () => {}, onAddTransaction: handleAddTransaction }} />}
          </div>
        )}

        {activeTab === 'profile' && (
           <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
             <div className="bg-[#1e293b] rounded-[2.5rem] p-10 flex flex-col items-center text-center shadow-2xl relative overflow-hidden border border-white/5">
                <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-indigo-500 to-purple-600 p-1 mb-6"><img src={`https://ui-avatars.com/api/?name=${userProfile.name}&background=1e293b&color=fff&size=256`} className="w-full h-full object-cover rounded-[1.8rem]" /></div>
                <h2 className="text-3xl font-black text-white">{userProfile.name}</h2>
                <p className="text-white/40 text-sm mb-6">{userProfile.email}</p>
                <div className="flex gap-4">
                   <div className="bg-white/5 px-6 py-3 rounded-2xl text-center"><div className="text-xl font-black text-orange-400">🔥 {userProfile.streak}</div><div className="text-[10px] text-white/30 uppercase font-black">Streak</div></div>
                   <div className="bg-white/5 px-6 py-3 rounded-2xl text-center"><div className="text-xl font-black text-emerald-400">{summary.healthScore}</div><div className="text-[10px] text-white/30 uppercase font-black">Health</div></div>
                </div>
                <button onClick={handleLogout} className="mt-8 px-8 py-3 bg-rose-500/10 text-rose-500 font-bold rounded-xl hover:bg-rose-500/20 transition-all">Sign Out</button>
             </div>
             <Achievements transactions={transactions} assets={assets} streak={userProfile.streak} />
           </div>
        )}
      </main>

      {activeTab !== 'profile' && activeTab !== 'chat' && (
        <div className="fixed bottom-24 right-6 z-40 flex flex-col items-end gap-3 print:hidden">
           {isFabOpen && (
              <div className="flex flex-col gap-3 animate-in slide-in-from-bottom-4 duration-200">
                 <button onClick={() => { setIsAccountFormOpen(true); setIsFabOpen(false); }} className="flex items-center gap-3 bg-white text-black px-5 py-2.5 rounded-2xl shadow-2xl font-black hover:scale-105 transition-all"><span className="text-sm">Account</span><div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white"><Briefcase className="w-4 h-4" /></div></button>
                 <button onClick={() => { setIsFormOpen(true); setIsFabOpen(false); }} className="flex items-center gap-3 bg-indigo-600 text-white px-5 py-2.5 rounded-2xl shadow-2xl font-black hover:scale-105 transition-all"><span className="text-sm">Transaction</span><div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center text-white"><Edit2 className="w-4 h-4" /></div></button>
              </div>
           )}
           <button onClick={() => setIsFabOpen(!isFabOpen)} className={`w-14 h-14 rounded-2xl shadow-2xl flex items-center justify-center transition-all ${isFabOpen ? 'bg-white text-black rotate-45' : 'bg-indigo-600 text-white hover:scale-110'}`}><Plus className="w-8 h-8" strokeWidth={3} /></button>
        </div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 h-[80px] bg-[#0f172a]/95 backdrop-blur-xl border-t border-white/5 flex items-start w-full px-2 z-50 pt-2 pb-6 print:hidden">
        <NavButton active={activeTab === 'home'} onClick={() => setActiveTab('home')} icon={Home} label="Home" />
        <NavButton active={activeTab === 'transactions'} onClick={() => setActiveTab('transactions')} icon={List} label="Activity" />
        <NavButton active={activeTab === 'chat'} onClick={() => setActiveTab('chat')} icon={Bot} label="Wealth AI" />
        <NavButton active={activeTab === 'upi'} onClick={() => setActiveTab('upi')} icon={QrCode} label="Pay" />
        <NavButton active={activeTab === 'invest'} onClick={() => setActiveTab('invest')} icon={TrendingUp} label="Assets" />
        <NavButton active={activeTab === 'tools'} onClick={() => setActiveTab('tools')} icon={LayoutGrid} label="More" />
      </nav>

      {isFormOpen && <TransactionForm onAddTransaction={handleAddTransaction} onClose={() => setIsFormOpen(false)} accounts={accounts} />}
      {isAccountFormOpen && <AccountForm onAddAccount={(a) => setAccounts([...accounts, {...a, id: Date.now().toString()}])} onClose={() => setIsAccountFormOpen(false)} />}
      {isCommandOpen && <CommandPalette isOpen={isCommandOpen} onClose={() => setIsCommandOpen(false)} onExecute={(cmd) => { if(cmd.action==='add_transaction') handleAddTransaction({...cmd.data, date: new Date().toISOString().split('T')[0]}); }} />}
      {isBudgetModalOpen && <BudgetModal budgets={budgets} onSave={setBudgets} onClose={() => setIsBudgetModalOpen(false)} currencySymbol={currencySymbol} />}
      <SettingsDrawer isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} settings={settings} onUpdateSettings={(s) => setSettings(p => ({...p, ...s}))} onExport={()=>{}} onImport={()=>{}} onResetData={()=>{}} counts={{ transactions: transactions.length, assets: assets.length }} />
    </div>
  );
}

const NavButton = ({ active, onClick, icon: Icon, label }: any) => (
  <button onClick={onClick} className={`flex flex-col items-center justify-center gap-1.5 flex-1 transition-all ${active ? 'text-indigo-400' : 'text-white/20 hover:text-white/40'}`}>
    <div className={`p-2 rounded-xl transition-all ${active ? 'bg-indigo-500/10' : ''}`}><Icon className="w-6 h-6" strokeWidth={active ? 3 : 2} /></div>
    <span className={`text-[9px] font-black uppercase tracking-wider transition-all ${active ? 'opacity-100' : 'opacity-40'}`}>{label}</span>
  </button>
);

export default App;
