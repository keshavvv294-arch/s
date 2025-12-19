import React, { useState, useRef, useEffect } from 'react';
import { PlusCircle, X, ArrowUpRight, ArrowDownRight, Camera, Loader2, Tag, FileText, Repeat, Sparkles, Smile, Frown, Meh, Zap, Mic, Wallet } from 'lucide-react';
import { CATEGORIES, Transaction, TransactionType, TransactionMood, Account } from '../types';
import { parseReceiptImage, predictCategory } from '../services/geminiService';

interface TransactionFormProps {
  onAddTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  onClose: () => void;
  accounts: Account[]; // Pass available accounts
}

export const TransactionForm: React.FC<TransactionFormProps> = ({ onAddTransaction, onClose, accounts }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>('expense');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [tags, setTags] = useState('');
  const [mood, setMood] = useState<TransactionMood>('neutral');
  const [accountId, setAccountId] = useState(accounts[0]?.id || '');
  const [isRecurring, setIsRecurring] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isPredicting, setIsPredicting] = useState(false);
  const [isListening, setIsListening] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<number | null>(null);

  // Auto-Categorize Effect
  useEffect(() => {
    if (!description || description.length < 3) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = window.setTimeout(async () => {
      setIsPredicting(true);
      const predicted = await predictCategory(description);
      if (predicted) {
        setCategory(predicted);
      }
      setIsPredicting(false);
    }, 1000); // 1s debounce

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [description]);

  const triggerHaptic = () => {
    if (navigator.vibrate) navigator.vibrate(10);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount) return;

    triggerHaptic();

    onAddTransaction({
      description,
      amount: parseFloat(amount),
      type,
      category,
      date,
      notes,
      tags: tags.split(',').map(t => t.trim()).filter(t => t),
      isRecurring,
      mood,
      accountId
    });
    onClose();
  };

  const startListening = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setDescription(transcript);
        triggerHaptic();
      };
      recognition.start();
    } else {
      alert("Voice input not supported in this browser.");
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    triggerHaptic();
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = (reader.result as string).split(',')[1];
        const result = await parseReceiptImage(base64String);
        
        if (result.description) setDescription(result.description);
        if (result.amount) setAmount(result.amount.toString());
        if (result.date) setDate(result.date);
        if (result.category && CATEGORIES.includes(result.category)) setCategory(result.category);
        setType('expense');
        triggerHaptic();
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Scanning failed", error);
    } finally {
      setIsScanning(false);
    }
  };

  const MoodOption = ({ value, icon: Icon, label }: { value: TransactionMood; icon: any; label: string }) => (
    <button
      type="button"
      onClick={() => { setMood(value); triggerHaptic(); }}
      className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
        mood === value ? 'bg-indigo-500 text-white scale-110' : 'text-white/40 hover:text-white hover:bg-white/5'
      }`}
    >
      <Icon className="w-5 h-5" />
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  );

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center z-50 sm:p-4">
      <div className="bg-[#1e293b] border-t sm:border border-white/10 rounded-t-3xl sm:rounded-3xl w-full max-w-md overflow-hidden animate-in slide-in-from-bottom-10 sm:zoom-in duration-200 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-white/10 sticky top-0 bg-[#1e293b] z-10">
          <h2 className="text-xl font-bold text-white">Add Transaction</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-5">
           {/* Receipt Scanner Button */}
           <div className="flex justify-center mb-2">
             <input 
               type="file" 
               accept="image/*" 
               ref={fileInputRef} 
               className="hidden" 
               onChange={handleFileChange}
             />
             <button 
               type="button"
               onClick={() => fileInputRef.current?.click()}
               disabled={isScanning}
               className="flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 transition-all text-sm font-medium disabled:opacity-50"
             >
               {isScanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
               {isScanning ? 'Scanning Receipt...' : 'Scan Receipt with AI'}
             </button>
           </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Type Selection */}
            <div className="flex gap-4 p-1 bg-black/20 rounded-xl">
              <button
                type="button"
                onClick={() => { setType('expense'); triggerHaptic(); }}
                className={`flex-1 py-3 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all ${
                  type === 'expense'
                    ? 'bg-rose-500 text-white shadow-lg'
                    : 'text-white/50 hover:text-white'
                }`}
              >
                <ArrowDownRight className="w-4 h-4" /> Expense
              </button>
              <button
                type="button"
                onClick={() => { setType('income'); triggerHaptic(); }}
                className={`flex-1 py-3 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all ${
                  type === 'income'
                    ? 'bg-emerald-500 text-white shadow-lg'
                    : 'text-white/50 hover:text-white'
                }`}
              >
                <ArrowUpRight className="w-4 h-4" /> Income
              </button>
            </div>

            {/* Account Selector */}
            <div>
               <label className="block text-xs font-semibold text-white/50 uppercase mb-2">Account</label>
               <div className="relative">
                  <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <select 
                     value={accountId}
                     onChange={(e) => setAccountId(e.target.value)}
                     className="w-full px-4 py-3 pl-10 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all appearance-none"
                  >
                     {accounts.map(acc => (
                        <option key={acc.id} value={acc.id} className="bg-slate-800">{acc.name} ({acc.type})</option>
                     ))}
                  </select>
               </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/50 uppercase mb-2">Description</label>
              <div className="relative flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none focus:border-transparent transition-all placeholder:text-white/20"
                    placeholder="e.g. Netflix Subscription"
                    required
                  />
                  {isPredicting && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
                    </div>
                  )}
                </div>
                <button
                   type="button"
                   onClick={startListening}
                   className={`p-3 rounded-xl border border-white/10 transition-colors ${isListening ? 'bg-red-500/20 text-red-400 border-red-500/50 animate-pulse' : 'bg-white/5 text-white/40 hover:text-white'}`}
                >
                   <Mic className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-white/50 uppercase mb-2">Amount ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all placeholder:text-white/20"
                  placeholder="0.00"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/50 uppercase mb-2">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all [color-scheme:dark]"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/50 uppercase mb-2 flex justify-between">
                Category
                {isPredicting && <span className="text-indigo-400 text-[10px] animate-pulse">Auto-detecting...</span>}
              </label>
              <div className="relative">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className={`w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all appearance-none ${isPredicting ? 'opacity-50' : ''}`}
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat} className="bg-slate-800 text-white">{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Mood Tracker */}
            {type === 'expense' && (
              <div>
                <label className="block text-xs font-semibold text-white/50 uppercase mb-2">How did you feel?</label>
                <div className="flex justify-between bg-black/20 p-2 rounded-xl">
                  <MoodOption value="necessary" icon={FileText} label="Need" />
                  <MoodOption value="happy" icon={Smile} label="Happy" />
                  <MoodOption value="neutral" icon={Meh} label="Okay" />
                  <MoodOption value="impulsive" icon={Zap} label="Impulse" />
                  <MoodOption value="stressed" icon={Frown} label="Stress" />
                </div>
              </div>
            )}

            {/* Expanded Fields */}
            <div className="space-y-4 pt-2 border-t border-white/10">
               <div className="flex items-center gap-2">
                 <Tag className="w-4 h-4 text-white/40" />
                 <input 
                   type="text"
                   value={tags}
                   onChange={(e) => setTags(e.target.value)}
                   placeholder="Tags (comma separated, e.g. #food, #date)"
                   className="flex-1 bg-transparent border-b border-white/10 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 placeholder:text-white/20 transition-colors"
                 />
               </div>
               <div className="flex items-center gap-2">
                 <FileText className="w-4 h-4 text-white/40" />
                 <input 
                   type="text"
                   value={notes}
                   onChange={(e) => setNotes(e.target.value)}
                   placeholder="Add a note..."
                   className="flex-1 bg-transparent border-b border-white/10 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 placeholder:text-white/20 transition-colors"
                 />
               </div>
               <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2 text-white/70 text-sm">
                    <Repeat className="w-4 h-4" />
                    Recurring Monthly
                  </div>
                  <button 
                    type="button"
                    onClick={() => { setIsRecurring(!isRecurring); triggerHaptic(); }}
                    className={`w-12 h-6 rounded-full transition-colors relative ${isRecurring ? 'bg-indigo-600' : 'bg-white/10'}`}
                  >
                    <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${isRecurring ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
               </div>
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/30 transition-all flex items-center justify-center gap-2 mt-4"
            >
              <PlusCircle className="w-5 h-5" />
              Add Transaction
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};