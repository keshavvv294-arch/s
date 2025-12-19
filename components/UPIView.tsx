
import React, { useState, useEffect, useRef } from 'react';
import { QrCode, Send, ArrowRight, User, History, ShieldCheck, Zap, Share2, Copy, Mic, Users, Bell, AlertTriangle, Scan, Smartphone, Building, RefreshCw, X, Check, Wallet, Search, ArrowDown, ArrowUp, Clock, FileText, SmartphoneCharging, Tv, Wifi, CalendarClock, Globe, Heart, Gift, Briefcase, WalletCards, Plane, Droplets, Link2, CheckCircle, TrendingUp, Lock, Calendar, BarChart3, Info, Loader2 } from 'lucide-react';
import { Beneficiary, Transaction, Debt } from '../types';
import { optimizeFxTransfer } from '../services/geminiService';

interface UPIViewProps {
  userUpiId?: string;
  onUpdateUpi: (id: string) => void;
  onAddTransaction: (t: Omit<Transaction, 'id'>) => void;
  onAddDebt?: (d: Debt) => void;
  transactions: Transaction[];
}

const INITIAL_BENEFICIARIES: Beneficiary[] = [
  { id: '1', name: 'Alex Doe', vpa: 'alex@oksbi', bankName: 'SBI', isVerified: true },
  { id: '2', name: 'Jane Smith', vpa: 'jane@paytm', bankName: 'HDFC', isVerified: true },
  { id: '3', name: 'Netflix', vpa: 'netflix@upi', bankName: 'Corp', isVerified: true },
];

export const UPIView: React.FC<UPIViewProps> = ({ userUpiId, onUpdateUpi, onAddTransaction, onAddDebt, transactions }) => {
  const [view, setView] = useState<'main' | 'scan' | 'pay' | 'request' | 'split' | 'self' | 'history' | 'dispute' | 'bills' | 'autopay' | 'lite' | 'credit' | 'intl' | 'donate' | 'vouchers'>('main');
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>(INITIAL_BENEFICIARIES);
  const [amount, setAmount] = useState('');
  const [payeeVpa, setPayeeVpa] = useState('');
  const [note, setNote] = useState('');
  const [myUpiId, setMyUpiId] = useState(userUpiId || 'user@upi');
  const [isProcessing, setIsProcessing] = useState(false);
  const [simulatedBalance, setSimulatedBalance] = useState(12450.00);
  const [isBalanceLoading, setIsBalanceLoading] = useState(false);

  // --- Feature Specific States ---
  const [liteBalance, setLiteBalance] = useState(850);
  const [creditLimit, setCreditLimit] = useState(50000);
  const [creditUsed, setCreditUsed] = useState(12400);
  
  // Intl / FX States
  const [intlAmount, setIntlAmount] = useState('');
  const [intlTarget, setIntlTarget] = useState('USD');
  const [fxDeal, setFxDeal] = useState<{rate: number, savings: number, provider: string} | null>(null);
  const [isFxLoading, setIsFxLoading] = useState(false);

  // General Feature State
  const [activeMandates, setActiveMandates] = useState([
     { id: 1, name: 'Netflix', amount: 699, date: '5th of Month', active: true, merchant: 'Netflix Inc.' },
     { id: 2, name: 'SIP HDFC', amount: 5000, date: '10th of Month', active: true, merchant: 'HDFC Mutual Fund' },
  ]);
  const [newMandate, setNewMandate] = useState({ name: '', amount: '', frequency: 'Monthly' });
  const [intlActive, setIntlActive] = useState(false);
  const [isVoiceListening, setIsVoiceListening] = useState(false);
  const [fraudRisk, setFraudRisk] = useState<'safe' | 'risk' | null>(null);
  const [scanProgress, setScanProgress] = useState(0);
  const [transferFrom, setTransferFrom] = useState('HDFC Bank ••4291');
  const [transferTo, setTransferTo] = useState('SBI Bank ••9921');
  const [splitFriends, setSplitFriends] = useState<string[]>([]);

  // --- Handlers ---
  const handlePay = () => {
    if (!amount || !payeeVpa) return;
    setIsProcessing(true);
    setTimeout(() => {
      onAddTransaction({
        description: `UPI to ${payeeVpa}`,
        amount: parseFloat(amount),
        type: 'expense',
        category: 'Utilities',
        date: new Date().toISOString().split('T')[0],
        status: 'cleared',
        tags: ['#UPI', '#DigitalPayment'],
        notes: note || 'UPI Transfer'
      });
      setSimulatedBalance(prev => prev - parseFloat(amount));
      setIsProcessing(false);
      setView('main');
      setAmount('');
      setPayeeVpa('');
      setNote('');
      alert(`Payment of ₹${amount} successful!`);
    }, 1500);
  };

  const handleCheckBalance = () => {
     setIsBalanceLoading(true);
     setTimeout(() => {
        setSimulatedBalance(prev => prev + (Math.random() * 200 - 100));
        setIsBalanceLoading(false);
     }, 1500);
  };

  const handleGetFxRate = async () => {
     if(!intlAmount) return;
     setIsFxLoading(true);
     try {
        const deal = await optimizeFxTransfer(parseFloat(intlAmount), 'INR', intlTarget);
        setFxDeal(deal);
     } finally {
        setIsFxLoading(false);
     }
  };

  const handleIntlTransfer = () => {
     if(!fxDeal || !intlAmount) return;
     setIsProcessing(true);
     setTimeout(() => {
        onAddTransaction({
           description: `Intl Transfer to ${intlTarget}`,
           amount: parseFloat(intlAmount),
           type: 'expense',
           category: 'Other',
           date: new Date().toISOString().split('T')[0],
           status: 'cleared',
           tags: ['#International', '#FX'],
           notes: `Provider: ${fxDeal.provider} @ ${fxDeal.rate}`
        });
        setSimulatedBalance(prev => prev - parseFloat(intlAmount));
        setIsProcessing(false);
        setFxDeal(null);
        setIntlAmount('');
        alert('International Transfer Initiated!');
        setView('main');
     }, 1500);
  };

  useEffect(() => {
     if (view === 'scan') {
        setScanProgress(0);
        const interval = setInterval(() => {
           setScanProgress(prev => {
              if (prev >= 100) {
                 clearInterval(interval);
                 setTimeout(() => {
                    setPayeeVpa('merchant@upi');
                    setNote('Scanned Payment');
                    setView('pay');
                 }, 500);
                 return 100;
              }
              return prev + 2;
           });
        }, 30);
        return () => clearInterval(interval);
     }
  }, [view]);

  const startVoicePay = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.onstart = () => setIsVoiceListening(true);
      recognition.onend = () => setIsVoiceListening(false);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript.toLowerCase();
        const amountMatch = transcript.match(/(\d+)/);
        if (amountMatch) {
          setAmount(amountMatch[0]);
          setView('pay');
          const found = beneficiaries.find(b => transcript.includes(b.name.toLowerCase()));
          if (found) setPayeeVpa(found.vpa);
        }
      };
      recognition.start();
    } else {
      alert('Voice not supported');
    }
  };

  const handleSelfTransfer = () => {
     if (!amount) return;
     setIsProcessing(true);
     setTimeout(() => {
        onAddTransaction({
           description: `Self Tfr to ${transferTo}`,
           amount: parseFloat(amount),
           type: 'expense',
           category: 'Other',
           date: new Date().toISOString().split('T')[0],
           status: 'cleared',
           tags: ['#SelfTransfer', '#UPI'],
           notes: `From ${transferFrom}`
        });
        setIsProcessing(false);
        setView('main');
        setAmount('');
        alert('Transfer Successful');
     }, 1000);
  };

  const handleBillPay = (type: string) => {
     const loadingId = setInterval(() => setIsProcessing(prev => !prev), 200);
     setTimeout(() => {
        clearInterval(loadingId);
        setIsProcessing(false);
        const amt = Math.floor(Math.random() * 1000) + 100;
        if(window.confirm(`Fetched Bill for ${type}: ₹${amt}\nDue Date: Tomorrow\n\nPay Now?`)) {
            onAddTransaction({
               description: `${type} Bill Payment`,
               amount: amt,
               type: 'expense',
               category: 'Utilities',
               date: new Date().toISOString().split('T')[0],
               status: 'cleared',
               tags: ['#Bill', '#UPI']
            });
            setSimulatedBalance(prev => prev - amt);
            alert('Bill Paid Successfully! Receipt sent to email.');
            setView('main');
        }
     }, 1000);
  };

  const handleLiteTopup = () => {
     if(!amount) return;
     const val = parseFloat(amount);
     if(val > 2000) { alert('UPI Lite limit is ₹2000'); return; }
     setIsProcessing(true);
     setTimeout(() => {
        setLiteBalance(prev => prev + val);
        setSimulatedBalance(prev => prev - val);
        onAddTransaction({
            description: 'UPI Lite Topup',
            amount: val,
            type: 'expense',
            category: 'Other',
            date: new Date().toISOString().split('T')[0],
            status: 'cleared',
            tags: ['#UPI-Lite']
        });
        setAmount('');
        setIsProcessing(false);
        alert(`Added ₹${val} to Lite Wallet without PIN!`);
     }, 1000);
  };

  return (
    <div className="pb-24 animate-in fade-in h-full flex flex-col">
      {/* Header & Balance */}
      <div className="bg-gradient-to-r from-teal-600 to-emerald-600 p-6 rounded-b-[2.5rem] shadow-2xl mb-6 relative overflow-hidden">
         <div className="absolute top-0 right-0 p-8 opacity-20"><QrCode className="w-32 h-32 text-white" /></div>
         
         <div className="relative z-10">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2 bg-black/20 px-3 py-1 rounded-full backdrop-blur-sm border border-white/10">
                 <Building className="w-4 h-4 text-emerald-300" />
                 <span className="text-xs text-white/90 font-medium">HDFC Bank ••4291</span>
              </div>
              <div className="flex gap-3">
                 <div className="flex items-center gap-1 bg-black/20 px-2 py-1 rounded-full cursor-pointer hover:bg-black/30 transition-colors" onClick={() => setView('lite')}>
                    <Zap className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                    <span className="text-xs text-white font-bold">₹{liteBalance}</span>
                 </div>
                 <Bell className="w-5 h-5 text-white" />
              </div>
            </div>

            <p className="text-emerald-100 text-sm font-medium mb-1">Available Balance</p>
            <div className="flex items-center gap-3">
               <h1 className="text-4xl font-bold text-white">
                  {isBalanceLoading ? (
                     <span className="animate-pulse">₹ •••••••</span>
                  ) : (
                     `₹${simulatedBalance.toLocaleString()}`
                  )}
               </h1>
               <button 
                  onClick={handleCheckBalance} 
                  disabled={isBalanceLoading}
                  className={`p-2 rounded-full hover:bg-white/10 transition-all ${isBalanceLoading ? 'animate-spin' : ''}`}
               >
                  <RefreshCw className="w-5 h-5 text-white/80" />
               </button>
            </div>
            <p className="text-xs text-emerald-200 mt-2 flex items-center gap-1">
               <ShieldCheck className="w-3 h-3" /> UPI Protected
            </p>
         </div>
      </div>

      <div className="px-4 flex-1 overflow-y-auto custom-scrollbar space-y-6">
        
        {view === 'main' && (
          <>
            {/* Quick Actions */}
            <div className="grid grid-cols-4 gap-4">
               {[
                 { label: 'Scan QR', icon: Scan, color: 'bg-blue-500', action: () => setView('scan') },
                 { label: 'Pay ID', icon: Zap, color: 'bg-orange-500', action: () => setView('pay') },
                 { label: 'To Self', icon: User, color: 'bg-purple-500', action: () => setView('self') },
                 { label: 'History', icon: History, color: 'bg-indigo-500', action: () => setView('history') },
               ].map((item, i) => (
                 <button key={i} onClick={item.action} className="flex flex-col items-center gap-2 group">
                    <div className={`w-14 h-14 ${item.color} rounded-2xl flex items-center justify-center text-white shadow-lg shadow-black/20 group-hover:scale-110 transition-transform`}>
                       <item.icon className="w-7 h-7" />
                    </div>
                    <span className="text-xs font-medium text-white/70">{item.label}</span>
                 </button>
               ))}
            </div>

            {/* Recents */}
            <div>
               <h3 className="text-white font-bold mb-3">Recent Transfers</h3>
               <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
                  <button onClick={() => setView('pay')} className="min-w-[70px] flex flex-col items-center gap-2">
                     <div className="w-12 h-12 rounded-full border-2 border-dashed border-white/20 flex items-center justify-center text-white/50 hover:bg-white/5 hover:border-white/50 hover:text-white transition-all">
                        <User className="w-5 h-5" />
                     </div>
                     <span className="text-[10px] text-white/50">Add New</span>
                  </button>
                  {beneficiaries.map(b => (
                     <button 
                       key={b.id} 
                       onClick={() => { setPayeeVpa(b.vpa); setView('pay'); }}
                       className="min-w-[70px] flex flex-col items-center gap-2"
                     >
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                           {b.name.charAt(0)}
                        </div>
                        <span className="text-[10px] text-white/80 truncate w-full text-center">{b.name}</span>
                     </button>
                  ))}
               </div>
            </div>

            {/* Explore Services */}
            <div>
               <h3 className="text-white font-bold mb-3">Explore Services</h3>
               <div className="grid grid-cols-4 gap-3">
                  {[
                     { name: 'Bills', icon: Smartphone, color: 'text-pink-400', bg: 'bg-pink-500/20', action: () => setView('bills') },
                     { name: 'AutoPay', icon: CalendarClock, color: 'text-blue-400', bg: 'bg-blue-500/20', action: () => setView('autopay') },
                     { name: 'UPI Lite', icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-500/20', action: () => setView('lite') },
                     { name: 'Credit', icon: WalletCards, color: 'text-indigo-400', bg: 'bg-indigo-500/20', action: () => setView('credit') },
                     { name: 'Global', icon: Globe, color: 'text-cyan-400', bg: 'bg-cyan-500/20', action: () => setView('intl') },
                     { name: 'Donate', icon: Heart, color: 'text-rose-400', bg: 'bg-rose-500/20', action: () => setView('donate') },
                     { name: 'Vouchers', icon: Gift, color: 'text-purple-400', bg: 'bg-purple-500/20', action: () => setView('vouchers') },
                  ].map((feat, i) => (
                     <button key={i} onClick={feat.action} className="flex flex-col items-center gap-2 p-2 rounded-xl hover:bg-white/5 transition-colors">
                        <div className={`p-3 rounded-xl ${feat.bg} ${feat.color}`}>
                           <feat.icon className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-medium text-white/70">{feat.name}</span>
                     </button>
                  ))}
               </div>
            </div>
          </>
        )}

        {/* Global Payments (intl) View */}
        {view === 'intl' && (
           <div className="animate-in slide-in-from-right duration-300">
              <div className="flex items-center gap-2 mb-6">
                 <button onClick={() => setView('main')} className="p-2 hover:bg-white/10 rounded-full"><ArrowRight className="w-5 h-5 rotate-180 text-white" /></button>
                 <h2 className="text-xl font-bold text-white">Cross-Border Payment</h2>
              </div>

              <div className="glass p-6 rounded-2xl space-y-6">
                 <div>
                    <label className="text-xs text-white/50 uppercase font-bold mb-2 block">Amount to Send (INR)</label>
                    <input 
                      type="number" 
                      value={intlAmount}
                      onChange={e => setIntlAmount(e.target.value)}
                      placeholder="e.g. 50000"
                      className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white focus:border-cyan-500 outline-none"
                    />
                 </div>
                 
                 <div>
                    <label className="text-xs text-white/50 uppercase font-bold mb-2 block">Target Currency</label>
                    <div className="flex gap-2">
                       {['USD', 'EUR', 'GBP', 'SGD'].map(c => (
                          <button 
                            key={c} 
                            onClick={() => setIntlTarget(c)}
                            className={`flex-1 py-2 rounded-lg font-bold text-sm ${intlTarget === c ? 'bg-cyan-600 text-white' : 'bg-white/5 text-white/60'}`}
                          >
                             {c}
                          </button>
                       ))}
                    </div>
                 </div>

                 <button 
                   onClick={handleGetFxRate}
                   disabled={!intlAmount || isFxLoading}
                   className="w-full py-3 bg-cyan-600/20 text-cyan-400 border border-cyan-500/30 rounded-xl font-bold hover:bg-cyan-600/30 transition-all flex items-center justify-center gap-2"
                 >
                    {isFxLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                    {isFxLoading ? 'AI Optimizing...' : 'Get AI Optimized Rate'}
                 </button>

                 {fxDeal && (
                    <div className="bg-gradient-to-br from-cyan-900/40 to-blue-900/40 border border-cyan-500/30 p-4 rounded-xl animate-in slide-in-from-top-2">
                       <div className="flex justify-between items-center mb-2">
                          <span className="text-white/60 text-sm">Provider</span>
                          <span className="text-white font-bold">{fxDeal.provider}</span>
                       </div>
                       <div className="flex justify-between items-center mb-2">
                          <span className="text-white/60 text-sm">Rate</span>
                          <span className="text-white font-bold">1 {intlTarget} = {fxDeal.rate.toFixed(2)} INR</span>
                       </div>
                       <div className="flex justify-between items-center pt-2 border-t border-white/10">
                          <span className="text-emerald-400 text-sm font-bold flex items-center gap-1">
                             <TrendingUp className="w-3 h-3" /> Save ₹{fxDeal.savings.toFixed(0)}
                          </span>
                          <span className="text-white text-lg font-bold">
                             {(parseFloat(intlAmount) / fxDeal.rate).toFixed(2)} {intlTarget}
                          </span>
                       </div>
                    </div>
                 )}

                 <button 
                   onClick={handleIntlTransfer}
                   disabled={!fxDeal || isProcessing}
                   className="w-full py-4 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold shadow-lg shadow-cyan-500/20 disabled:opacity-50 transition-all"
                 >
                    {isProcessing ? 'Processing...' : 'Transfer Now'}
                 </button>
              </div>
           </div>
        )}

        {/* Existing View Logic for Bills, etc. */}
        {view === 'bills' && (
           <div className="animate-in slide-in-from-right duration-300">
              <div className="flex items-center gap-2 mb-6">
                 <button onClick={() => setView('main')} className="p-2 hover:bg-white/10 rounded-full"><ArrowRight className="w-5 h-5 rotate-180 text-white" /></button>
                 <h2 className="text-xl font-bold text-white">Recharge & Bills</h2>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-6">
                 {[
                    { n: 'Mobile', i: Smartphone, c: 'bg-blue-500' },
                    { n: 'DTH', i: Tv, c: 'bg-purple-500' },
                    { n: 'Elec', i: Zap, c: 'bg-yellow-500' },
                    { n: 'Net', i: Wifi, c: 'bg-indigo-500' },
                    { n: 'Water', i: Droplets, c: 'bg-cyan-500' },
                    { n: 'Gas', i: FileText, c: 'bg-rose-500' }
                 ].map((b, i) => (
                    <button key={i} onClick={() => handleBillPay(b.n)} className="glass p-4 rounded-xl flex flex-col items-center gap-2 hover:bg-white/10 relative overflow-hidden group">
                       <div className={`p-2 rounded-full ${b.c} text-white relative z-10`}><b.i className="w-5 h-5" /></div>
                       <span className="text-xs font-bold text-white/80 relative z-10">{b.n}</span>
                       <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </button>
                 ))}
              </div>
           </div>
        )}

      </div>
    </div>
  );
};
