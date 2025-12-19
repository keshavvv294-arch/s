import React, { useState } from 'react';
import { FileText, X, DollarSign, Calculator } from 'lucide-react';

interface TaxEstimatorProps {
  onClose: () => void;
}

export const TaxEstimator: React.FC<TaxEstimatorProps> = ({ onClose }) => {
  const [income, setIncome] = useState(60000);
  const [deductions, setDeductions] = useState(12000);
  const [filingStatus, setFilingStatus] = useState('single');

  const calculateTax = () => {
    const taxable = Math.max(0, income - deductions);
    let tax = 0;
    
    // Simplified US Tax Brackets 2024 (Single)
    if (filingStatus === 'single') {
        if (taxable > 578125) tax += (taxable - 578125) * 0.37 + 174238.25;
        else if (taxable > 231250) tax += (taxable - 231250) * 0.35 + 52832;
        else if (taxable > 100525) tax += (taxable - 100525) * 0.24 + 17400;
        else if (taxable > 44725) tax += (taxable - 44725) * 0.22 + 5147;
        else if (taxable > 11000) tax += (taxable - 11000) * 0.12 + 1100;
        else tax += taxable * 0.10;
    } else {
        // Married Joint (simplified logic for demo)
        if (taxable > 693750) tax += (taxable - 693750) * 0.37 + 186601.5;
        else if (taxable > 462500) tax += (taxable - 462500) * 0.35 + 72260;
        else if (taxable > 201050) tax += (taxable - 201050) * 0.24 + 32580;
        else if (taxable > 89450) tax += (taxable - 89450) * 0.22 + 10294;
        else if (taxable > 22000) tax += (taxable - 22000) * 0.12 + 2200;
        else tax += taxable * 0.10;
    }

    return { tax, rate: taxable > 0 ? (tax / income) * 100 : 0 };
  };

  const { tax, rate } = calculateTax();
  const monthlyTax = tax / 12;
  const takeHome = (income - tax) / 12;

  return (
    <div className="glass rounded-3xl p-6 h-full animate-in zoom-in duration-200">
       <div className="flex justify-between items-center mb-6">
         <h3 className="text-xl font-bold text-white flex items-center gap-2"><FileText className="w-5 h-5 text-blue-400" /> Tax Estimator</h3>
         <button onClick={onClose} className="text-white/40 hover:text-white"><X className="w-6 h-6" /></button>
       </div>

       <div className="space-y-4">
          <div className="bg-black/20 p-4 rounded-xl border border-white/5 space-y-3">
             <div>
                <label className="text-xs text-white/50 uppercase font-bold">Annual Gross Income</label>
                <div className="flex items-center gap-2 mt-1">
                   <DollarSign className="w-4 h-4 text-white/40" />
                   <input type="number" value={income} onChange={e => setIncome(Number(e.target.value))} className="bg-transparent text-white font-bold text-lg w-full outline-none" />
                </div>
             </div>
             <div>
                <label className="text-xs text-white/50 uppercase font-bold">Deductions (Standard/Itemized)</label>
                <div className="flex items-center gap-2 mt-1">
                   <DollarSign className="w-4 h-4 text-white/40" />
                   <input type="number" value={deductions} onChange={e => setDeductions(Number(e.target.value))} className="bg-transparent text-white font-bold text-lg w-full outline-none" />
                </div>
             </div>
             <div>
                <label className="text-xs text-white/50 uppercase font-bold">Filing Status</label>
                <select 
                   value={filingStatus} 
                   onChange={e => setFilingStatus(e.target.value)}
                   className="mt-1 w-full bg-white/5 rounded-lg p-2 text-white text-sm outline-none"
                >
                   <option value="single" className="bg-slate-900">Single</option>
                   <option value="married" className="bg-slate-900">Married Filing Jointly</option>
                </select>
             </div>
          </div>

          <div className="bg-gradient-to-br from-blue-600/20 to-indigo-600/20 p-6 rounded-2xl border border-blue-500/30 text-center">
             <p className="text-sm text-blue-200 uppercase font-medium">Estimated Annual Tax</p>
             <h2 className="text-4xl font-bold text-white mt-1 mb-2">${tax.toLocaleString(undefined, {maximumFractionDigits: 0})}</h2>
             <div className="inline-block px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold">
                Effective Rate: {rate.toFixed(1)}%
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="bg-white/5 p-4 rounded-xl text-center">
                <p className="text-xs text-white/40 mb-1">Monthly Tax</p>
                <p className="text-lg font-bold text-rose-400">-${monthlyTax.toLocaleString(undefined, {maximumFractionDigits: 0})}</p>
             </div>
             <div className="bg-white/5 p-4 rounded-xl text-center">
                <p className="text-xs text-white/40 mb-1">Monthly Take Home</p>
                <p className="text-lg font-bold text-emerald-400">${takeHome.toLocaleString(undefined, {maximumFractionDigits: 0})}</p>
             </div>
          </div>
          
          <p className="text-[10px] text-white/20 text-center mt-4">
             *Estimates based on 2024 Federal brackets. Does not include state/local taxes or FICA.
          </p>
       </div>
    </div>
  );
};