
import React, { useState } from 'react';
import { DollarSign, ArrowRight, Target, CheckCircle, Wand2, PieChart } from 'lucide-react';
import { Budget } from '../types';

interface OnboardingWizardProps {
  userName: string;
  onComplete: (salary: number, budgets: Budget[], goal: string) => void;
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ userName, onComplete }) => {
  const [step, setStep] = useState(1);
  const [salary, setSalary] = useState('');
  const [goal, setGoal] = useState<'savings' | 'debt' | 'balanced'>('balanced');
  const [loading, setLoading] = useState(false);

  const handleNext = () => {
    if (step === 1 && salary) setStep(2);
    else if (step === 2) calculatePlan();
  };

  const calculatePlan = () => {
    setLoading(true);
    setTimeout(() => {
      const monthlyIncome = parseFloat(salary);
      let plan: Budget[] = [];

      // 50/30/20 Rule Logic
      const needs = monthlyIncome * 0.5;
      const wants = monthlyIncome * 0.3;
      const savings = monthlyIncome * 0.2;

      // Adjust based on Goal
      let adjustedNeeds = needs;
      let adjustedWants = wants;
      let adjustedSavings = savings;

      if (goal === 'savings') {
         adjustedWants = monthlyIncome * 0.15;
         adjustedSavings = monthlyIncome * 0.35;
      } else if (goal === 'debt') {
         adjustedWants = monthlyIncome * 0.10;
         adjustedSavings = monthlyIncome * 0.40; 
      }

      // Generate Budget Categories
      plan = [
        { category: 'Housing', limit: adjustedNeeds * 0.6 },
        { category: 'Food', limit: adjustedNeeds * 0.2 },
        { category: 'Utilities', limit: adjustedNeeds * 0.1 },
        { category: 'Transportation', limit: adjustedNeeds * 0.1 },
        { category: 'Entertainment', limit: adjustedWants * 0.4 },
        { category: 'Shopping', limit: adjustedWants * 0.4 },
        { category: 'Investment', limit: adjustedSavings },
        { category: 'Travel', limit: adjustedWants * 0.2 },
      ];

      onComplete(monthlyIncome, plan, goal);
    }, 1500); 
  };

  return (
    <div className="fixed inset-0 bg-[#0f172a] z-50 flex items-center justify-center p-6">
      <div className="max-w-lg w-full bg-[#1e293b] rounded-3xl border border-white/10 p-8 shadow-2xl relative overflow-hidden">
        
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 h-1 bg-indigo-900 w-full">
           <div className="h-full bg-indigo-500 transition-all duration-500" style={{ width: step === 1 ? '33%' : step === 2 ? '66%' : '100%' }}></div>
        </div>

        {/* Step 1: Salary */}
        {step === 1 && (
           <div className="animate-in slide-in-from-right duration-500">
              <div className="w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-400 mb-6">
                 <DollarSign className="w-8 h-8" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">Hi, {userName}!</h1>
              <p className="text-white/50 mb-8">To customize your AI dashboard, we need to know your monthly income target.</p>
              
              <label className="text-xs font-bold text-white/50 uppercase mb-2 block">Monthly Salary</label>
              <div className="relative mb-8">
                 <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 text-xl font-bold">$</span>
                 <input 
                   type="number" 
                   value={salary}
                   onChange={(e) => setSalary(e.target.value)}
                   className="w-full bg-black/20 border border-white/10 rounded-2xl py-4 pl-10 pr-4 text-3xl font-bold text-white focus:outline-none focus:border-emerald-500 transition-all"
                   placeholder="0"
                   autoFocus
                 />
              </div>

              <button 
                onClick={handleNext}
                disabled={!salary}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                 Continue <ArrowRight className="w-5 h-5" />
              </button>
           </div>
        )}

        {/* Step 2: Goal */}
        {step === 2 && !loading && (
           <div className="animate-in slide-in-from-right duration-500">
              <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center text-blue-400 mb-6">
                 <Target className="w-8 h-8" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">Financial Goal</h1>
              <p className="text-white/50 mb-8">What is your primary focus right now? Our AI will structure your budget accordingly.</p>
              
              <div className="space-y-4 mb-8">
                 <button 
                   onClick={() => setGoal('savings')}
                   className={`w-full p-4 rounded-xl border flex items-center gap-4 text-left transition-all ${goal === 'savings' ? 'bg-indigo-600 border-indigo-500' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                 >
                    <div className="p-2 bg-white/10 rounded-full"><PieChart className="w-5 h-5 text-white" /></div>
                    <div>
                       <h3 className="font-bold text-white">Aggressive Savings</h3>
                       <p className="text-xs text-white/60">Maximize investments & emergency fund.</p>
                    </div>
                    {goal === 'savings' && <CheckCircle className="w-6 h-6 text-white ml-auto" />}
                 </button>

                 <button 
                   onClick={() => setGoal('debt')}
                   className={`w-full p-4 rounded-xl border flex items-center gap-4 text-left transition-all ${goal === 'debt' ? 'bg-indigo-600 border-indigo-500' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                 >
                    <div className="p-2 bg-white/10 rounded-full"><Target className="w-5 h-5 text-white" /></div>
                    <div>
                       <h3 className="font-bold text-white">Debt Destroyer</h3>
                       <p className="text-xs text-white/60">Pay off loans fast. Minimize wants.</p>
                    </div>
                    {goal === 'debt' && <CheckCircle className="w-6 h-6 text-white ml-auto" />}
                 </button>

                 <button 
                   onClick={() => setGoal('balanced')}
                   className={`w-full p-4 rounded-xl border flex items-center gap-4 text-left transition-all ${goal === 'balanced' ? 'bg-indigo-600 border-indigo-500' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                 >
                    <div className="p-2 bg-white/10 rounded-full"><PieChart className="w-5 h-5 text-white" /></div>
                    <div>
                       <h3 className="font-bold text-white">Balanced Life</h3>
                       <p className="text-xs text-white/60">Standard 50/30/20 rule.</p>
                    </div>
                    {goal === 'balanced' && <CheckCircle className="w-6 h-6 text-white ml-auto" />}
                 </button>
              </div>

              <button 
                onClick={handleNext}
                className="w-full bg-white text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:scale-[1.02] transition-all"
              >
                 Generate Plan <Wand2 className="w-5 h-5" />
              </button>
           </div>
        )}

        {/* Loading State */}
        {loading && (
           <div className="flex flex-col items-center justify-center text-center py-10 animate-in fade-in">
              <div className="relative mb-6">
                 <div className="w-20 h-20 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
                 <div className="absolute inset-0 flex items-center justify-center">
                    <Wand2 className="w-8 h-8 text-indigo-400" />
                 </div>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">AI is Planning...</h2>
              <p className="text-white/50 max-w-xs mx-auto">Analyzing your income and preparing your personalized AI strategist.</p>
           </div>
        )}

      </div>
    </div>
  );
};
