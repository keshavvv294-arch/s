
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Plus, Settings, Home, PieChart as PieChartIcon, Snowflake, User, Wallet, MessageSquare, LayoutGrid, Award, Shield, TrendingUp, Command, Bell, Fingerprint, LogOut, Download, AlertTriangle, WifiOff, X, List, BarChart3, Star, Zap, Target, Lock, CreditCard, ShoppingCart, Plane, QrCode, Quote, Edit2, ArrowLeft, Mic, Mic2, Briefcase, Bot } from 'lucide-react';
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
import { detectSpendingAnomalies, processNaturalLanguageCommand } from './services/geminiService';
import { Transaction, FinancialSummary, ImpulseItem, IMPULSE_IMAGES, ToolType, Asset, Badge, Notification, UserProfile, Budget, AppSettings, CURRENCIES, Debt, EventBudget, ShoppingItem, CreditScoreEntry, Account } from './types';

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
   "It’s not how much money you make, but how much money you keep. – Robert Kiyosaki",
   "Beware of little expenses. A small leak will sink a great ship. – Benjamin Franklin"
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
  const [dailyQuote, setDailyQuote] = useState(QUOTES[0]);
  const [aiContextMessage, setAiContextMessage] = useState<string | null>(null);
  
  // Persistent State
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

  // Check Auth on Mount
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

  // Derived state
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

  // Effects: Save on Change
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
    addXP(50);
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
    
    // 1. Add Salary as a Transaction
    handleAddTransaction({
      description: 'Monthly Salary',
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

    // 2. Prepare Goal-Specific AI Message
    let goalHeading = "Balanced Life Plan";
    let goalPrompt = "help me maintain a healthy balance between needs and wants.";
    
    if (goal === 'savings') {
      goalHeading = "Aggressive Savings Plan";
      goalPrompt = "show me how to maximize my investments and reach my first $100k as fast as possible.";
    } else if (goal === 'debt') {
      goalHeading = "Debt Destroyer Plan";
      goalPrompt = "prioritize paying off my loans and getting me debt-free quickly.";
    }

    const budgetList = newBudgets.map(b => `- **${b.category}**: ${currencySymbol}${b.limit.toFixed(0)}`).join('\n');
    const planMessage = `
**🚀 ${goalHeading} Ready!**

Hi ${userProfile?.name}! Based on your monthly income of **${currencySymbol}${newSalary}**, I've designed a specialized budget for you.

**Your Suggested Limits:**
${budgetList}

I've already credited your first salary to your balance. Because you chose the **${goal}** focus, I will ${goalPrompt}

**How would you like to start?**
1. Review my Debt/Investment strategy?
2. Set up my first automation rule?
3. Ask a specific question?
    `;
    
    // 3. Switch to AI Chat Tab immediately
    setAiContextMessage(planMessage);
    setActiveTab('chat');
  };

  const addXP = (amount: number) => {
    if (!userProfile) return;
    const newXP = userProfile.xp + amount;
    const newLevel = Math.floor(newXP / 1000) + 1;
    const updatedProfile = { ...userProfile, xp: newXP, level: newLevel };
    
    setUserProfile(updatedProfile);
    authService.updateProfile({ xp: newXP, level: newLevel }); 

    if (newLevel > userProfile.level) {
       setNotifications(curr => [...curr, { id: Date.now().toString(), title: "Level Up!", message: `You reached Level ${newLevel}!`, type: "success", date: new Date(), read: false }]);
    }
  };

  const handleAddAccount = (newAccount: Omit<Account, 'id'>) => {
     const account: Account = { ...newAccount, id: Date.now().toString() };
     setAccounts(prev => [...prev, account]);
     triggerHaptic();
  };

  const handleAddAsset = (asset: Asset) => {
    setAssets(prev => [...prev, asset]);
    addXP(100);
    triggerHaptic();
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  // --- Global Voice Command Logic ---
  const startGlobalVoice = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.onstart = () => setIsGlobalListening(true);
      recognition.onend = () => setIsGlobalListening(false);
      
      recognition.onresult = async (event: any) => {
        const transcript = event.results[0][0].transcript;
        try {
           const result = await processNaturalLanguageCommand(transcript);
           if (result.action === 'add_transaction' && result.data) {
              handleAddTransaction({
                 ...result.data, 
                 date: new Date().toISOString().split('T')[0],
                 accountId: accounts[0]?.id 
              });
              setNotifications(prev => [...prev, { id: Date.now().toString(), title: "Voice Command", message: `Added: ${result.data.description} ${result.data.amount}`, type: 'success', date: new Date(), read: false }]);
           } else if (result.action === 'add_asset' && result.data) {
              handleAddAsset({ id: Date.now().toString(), symbol: 'N/A', ...result.data, currency: 'USD' });
              setNotifications(prev => [...prev, { id: Date.now().toString(), title: "Voice Command", message: `Added Asset: ${result.data.name}`, type: 'success', date: new Date(), read: false }]);
           }
        } catch (e) {
           console.error("Voice processing error", e);
        }
      };
      recognition.start();
    } else {
      alert("Voice not supported");
    }
  };

  if (!isAuthenticated || !userProfile) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  if (!userProfile.onboardingComplete) {
     return <OnboardingWizard userName={userProfile.name} onComplete={handleOnboardingComplete} />;
  }

  const mainContainerClasses = activeTab === 'chat' 
    ? "h-full w-full pb-20" 
    : "max-w-4xl mx-auto px-4 sm:px-6 pt-6 pb-24 h-full"; 

  return (
    <div className="min-h-screen text-white relative z-10 bg-[#0f172a] flex flex-col">
      {isOffline && (
        <div className="bg-rose-500 text-white text-xs font-bold text-center py-1 flex items-center justify-center gap-2 sticky top-0 z-50">
           <WifiOff className="w-3 h-3" /> Offline Mode
        </div>
      )}

      {activeTab !== 'chat' && (
        <header className="px-6 py-4 flex items-center justify-between sticky top-0 z-30 bg-[#0f172a]/90 backdrop-blur-sm border-b border-white/5 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">W</div>
            <span className="text-sm font-bold text-white/90">WealthFlow</span>
          </div>
          <div className="flex items-center gap-3">
             <button 
               onClick={startGlobalVoice} 
               className={`p-2 rounded-full transition-all ${isGlobalListening ? 'bg-red-500 text-white animate-pulse' : 'text-white/60 hover:text-white hover:bg-white/10'}`}
               title="Voice Command"
             >
                <Mic2 className="w-5 h-5" />
             </button>
             
             <button onClick={() => setIsCommandOpen(true)} className="p-2 text-white/60 hover:text-white transition-colors"><Command className="w-5 h-5" /></button>
             <button onClick={() => setIsSettingsOpen(true)} className="p-2 text-white/60 hover:text-white transition-colors"><Settings className="w-5 h-5" /></button>
             <button onClick={() => setActiveTab('profile')} className="w-8 h-8 rounded-full overflow-hidden border border-white/10">
                <div className={`w-full h-full flex items-center justify-center bg-indigo-500`}>
                  {userProfile.avatar === 'indigo' ? <User className="w-4 h-4 text-white" /> : <img src={`https://ui-avatars.com/api/?name=${userProfile.name}&background=6366f1&color=fff`} alt="Profile" className="w-full h-full object-cover" />}
                </div>
             </button>
          </div>
        </header>
      )}

      <main className={mainContainerClasses}>
        {activeTab === 'home' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {notifications.length > 0 && (
               <div className="bg-[#1e293b] p-4 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3"><AlertTriangle className="w-5 h-5 text-orange-400" /><span className="text-white text-sm">{notifications[0].message}</span></div>
                  <button onClick={() => setNotifications([])} className="text-white/40 hover:text-white"><X className="w-4 h-4" /></button>
               </div>
            )}
            
            <CustomizableDashboard 
               transactions={transactions}
               assets={assets}
               summary={summary}
               budgets={budgets}
               debts={debts}
               salary={salary}
               privacyMode={settings.privacyMode}
               dailyQuote={dailyQuote}
               actions={{
                  onOpenForm: () => setIsFormOpen(true),
                  onOpenBudget: () => setIsBudgetModalOpen(true),
                  onOpenInvest: () => setActiveTab('invest'),
                  onOpenChat: () => setActiveTab('chat'),
                  onDeleteTransaction: handleDeleteTransaction
               }}
            />
          </div>
        )}

        {activeTab === 'transactions' && <TransactionsTab transactions={transactions} onDelete={handleDeleteTransaction} onDeleteBulk={(ids) => setTransactions(prev => prev.filter(t => !ids.includes(t.id)))} onDuplicate={(t) => { const { id, ...rest } = t; setTransactions(prev => [{...rest, id: Math.random().toString(), date: new Date().toISOString().split('T')[0]}, ...prev]); }} onToggleStatus={(id) => setTransactions(prev => prev.map(t => t.id === id ? { ...t, status: t.status === 'cleared' ? 'pending' : 'cleared' } : t))} currencySymbol={currencySymbol} />}
        {activeTab === 'chat' && (
           <div className="h-full animate-in fade-in duration-300">
              <AIChat initialMessage={aiContextMessage} />
           </div>
        )}
        {activeTab === 'invest' && <InvestmentTab assets={assets} onAddAsset={handleAddAsset} onDeleteAsset={(id) => setAssets(prev => prev.filter(a => a.id !== id))} onUpdateAssetValue={(id, val) => setAssets(prev => prev.map(a => a.id === id ? { ...a, value: val } : a))} privacyMode={settings.privacyMode} />}
        {activeTab === 'upi' && <UPIView userUpiId={userProfile.upiId} onUpdateUpi={(id) => { const updated = { ...userProfile, upiId: id }; setUserProfile(updated); authService.updateProfile({ upiId: id }); }} onAddTransaction={handleAddTransaction} transactions={transactions} onAddDebt={(d) => setDebts([...debts, d])} />}
        
        {activeTab === 'tools' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 h-full">
            {activeTool === 'none' ? (
               <>
                  <h2 className="text-2xl font-bold text-white mb-6 px-2">Apps & Tools</h2>
                  <ToolsMenu onSelectTool={setActiveTool} />
               </>
            ) : (
               <div className="h-full flex flex-col">
                  <div className="flex items-center gap-2 mb-4">
                     <button onClick={() => setActiveTool('none')} className="p-2 hover:bg-white/10 rounded-full transition-colors"><ArrowLeft className="w-6 h-6 text-white" /></button>
                     <h3 className="text-xl font-bold text-white capitalize">{activeTool.replace(/-/g, ' ')}</h3>
                  </div>
                  <ToolsViewRenderer 
                     activeTool={activeTool} 
                     onClose={() => setActiveTool('none')}
                     data={{ transactions, assets, summary, budgets, debts, events, shoppingItems, creditHistory, currencySymbol }}
                     actions={{
                        onAddDebt: (d) => setDebts([...debts, d]),
                        onDeleteDebt: (id) => setDebts(debts.filter(d => d.id !== id)),
                        onAddScore: (s) => setCreditHistory([...creditHistory, s]),
                        onDeleteScore: (id) => setCreditHistory(creditHistory.filter(s => s.id !== id)),
                        onAddEvent: (e) => setEvents([...events, e]),
                        onDeleteEvent: (id) => setEvents(events.filter(e => e.id !== id)),
                        onAddItem: (i) => setShoppingItems([...shoppingItems, i]),
                        onDeleteItem: (id) => setShoppingItems(shoppingItems.filter(i => i.id !== id)),
                        onToggleItem: (id) => setShoppingItems(shoppingItems.map(i => i.id === id ? {...i, isBought: !i.isBought} : i)),
                        onConvertToTransaction: (item) => { handleAddTransaction({ description: item.name, amount: item.estimatedPrice, type: 'expense', category: 'Shopping', date: new Date().toISOString().split('T')[0], status: 'cleared', mood: 'necessary' }); setShoppingItems(shoppingItems.filter(i => i.id !== item.id)); },
                        onAddTransaction: handleAddTransaction
                     }}
                  />
               </div>
            )}
          </div>
        )}

        {activeTab === 'profile' && (
           <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
             <div className="bg-[#1e293b] rounded-3xl p-8 flex flex-col items-center text-center">
                <div className={`w-24 h-24 relative mb-4 z-10 cursor-pointer rounded-full flex items-center justify-center border-4 border-[#0f172a] bg-indigo-500 text-white overflow-hidden`}>
                   {userProfile.avatar.length > 10 ? <img src={`https://ui-avatars.com/api/?name=${userProfile.name}&background=6366f1&color=fff`} className="w-full h-full object-cover" /> : <User className="w-10 h-10" />}
                </div>
                <h2 className="text-2xl font-bold text-white">{userProfile.name}</h2>
                <p className="text-white/50 text-sm mb-1">{userProfile.email}</p>
                <p className="text-indigo-400 font-medium text-sm mb-4">{userProfile.title}</p>
                <div className="flex gap-4 mb-6">
                   <div className="bg-white/5 rounded-xl px-4 py-2 text-center min-w-[80px]"><div className="text-xl font-bold text-orange-400 flex items-center justify-center gap-1"><Zap className="w-4 h-4" /> {userProfile.streak}</div><div className="text-[10px] text-white/40 uppercase font-bold">Streak</div></div>
                   <div className="bg-white/5 rounded-xl px-4 py-2 text-center min-w-[80px]"><div className="text-xl font-bold text-emerald-400">{summary.healthScore}</div><div className="text-[10px] text-white/40 uppercase font-bold">Score</div></div>
                </div>
             </div>
             
             <div className="space-y-3 px-2">
               <h3 className="text-lg font-bold text-white">Your Accounts</h3>
               {accounts.map(acc => (
                  <div key={acc.id} className="bg-white/5 p-4 rounded-2xl flex justify-between items-center border border-white/5">
                     <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg ${acc.color}`}>
                           <Wallet className="w-5 h-5" />
                        </div>
                        <div>
                           <p className="font-bold text-white">{acc.name}</p>
                           <p className="text-xs text-white/40 uppercase">{acc.type}</p>
                        </div>
                     </div>
                     <div className="text-right">
                        <p className="font-bold text-white">{currencySymbol}{acc.initialBalance.toLocaleString()}</p>
                        <p className="text-xs text-white/30">Initial</p>
                     </div>
                  </div>
               ))}
             </div>

             <Achievements transactions={transactions} assets={assets} streak={userProfile.streak} />
             <div className="bg-[#1e293b] rounded-3xl p-4 mt-6">
               <button onClick={handleLogout} className="w-full py-3 text-rose-400 font-medium hover:bg-white/5 rounded-xl transition-colors flex items-center justify-center gap-2"><LogOut className="w-5 h-5" /> Sign Out</button>
             </div>
           </div>
        )}
      </main>

      {activeTab !== 'profile' && activeTab !== 'chat' && (
        <div className="fixed bottom-24 right-6 z-40 flex flex-col items-end gap-3 print:hidden">
           {isFabOpen && (
              <div className="flex flex-col gap-3 animate-in slide-in-from-bottom-4 duration-200">
                 <button 
                   onClick={() => { setIsAccountFormOpen(true); setIsFabOpen(false); }}
                   className="flex items-center gap-3 bg-white text-black px-4 py-2 rounded-xl shadow-xl font-bold hover:bg-gray-100"
                 >
                    <span className="text-sm">Add Account</span>
                    <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white"><Briefcase className="w-4 h-4" /></div>
                 </button>
                 <button 
                   onClick={() => { setIsFormOpen(true); setIsFabOpen(false); }}
                   className="flex items-center gap-3 bg-indigo-600 text-white px-4 py-2 rounded-xl shadow-xl font-bold hover:bg-indigo-500"
                 >
                    <span className="text-sm">Add Transaction</span>
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white"><Edit2 className="w-4 h-4" /></div>
                 </button>
              </div>
           )}
           <button 
             onClick={() => setIsFabOpen(!isFabOpen)} 
             className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-110 active:scale-95 ${isFabOpen ? 'bg-white text-black rotate-45' : 'bg-indigo-600 text-white'}`}
           >
             <Plus className="w-8 h-8" />
           </button>
        </div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 h-[80px] bg-[#0f172a] border-t border-white/5 flex items-start w-full px-2 z-50 pt-2 pb-6 print:hidden">
        <NavButton active={activeTab === 'home'} onClick={() => setActiveTab('home')} icon={Home} label="Home" />
        <NavButton active={activeTab === 'transactions'} onClick={() => setActiveTab('transactions')} icon={List} label="Trans." />
        <NavButton active={activeTab === 'chat'} onClick={() => setActiveTab('chat')} icon={Bot} label="AI" />
        <NavButton active={activeTab === 'upi'} onClick={() => setActiveTab('upi')} icon={QrCode} label="UPI" />
        <NavButton active={activeTab === 'invest'} onClick={() => setActiveTab('invest')} icon={TrendingUp} label="Invest" />
        <NavButton active={activeTab === 'tools'} onClick={() => setActiveTab('tools')} icon={LayoutGrid} label="Menu" />
      </nav>

      {isFormOpen && <TransactionForm onAddTransaction={handleAddTransaction} onClose={() => setIsFormOpen(false)} accounts={accounts} />}
      {isAccountFormOpen && <AccountForm onAddAccount={handleAddAccount} onClose={() => setIsAccountFormOpen(false)} />}
      {isCommandOpen && <CommandPalette isOpen={isCommandOpen} onClose={() => setIsCommandOpen(false)} onExecute={(cmd) => { if(cmd.action==='add_transaction') handleAddTransaction({...cmd.data, date: new Date().toISOString().split('T')[0]}); else if(cmd.action==='add_asset') handleAddAsset({id: Date.now().toString(), symbol: 'N/A', ...cmd.data, currency: 'USD'}); }} />}
      {isBudgetModalOpen && <BudgetModal budgets={budgets} onSave={setBudgets} onClose={() => setIsBudgetModalOpen(false)} currencySymbol={currencySymbol} />}
      <SettingsDrawer isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} settings={settings} onUpdateSettings={(s) => setSettings(prev => ({...prev, ...s}))} onExport={() => {}} onImport={() => {}} onResetData={() => {}} counts={{ transactions: transactions.length, assets: assets.length }} />
    </div>
  );
}

const NavButton = ({ active, onClick, icon: Icon, label }: any) => (
  <button onClick={onClick} className={`flex flex-col items-center justify-center gap-1 flex-1 min-w-0 transition-all ${active ? 'text-indigo-400' : 'text-white/40 hover:text-white'}`}>
    <Icon className={`w-6 h-6 ${active ? 'fill-current' : 'stroke-current'}`} strokeWidth={active ? 0 : 2} />
    <span className="text-[10px] font-medium truncate w-full text-center px-1">{label}</span>
  </button>
);

export default App;
