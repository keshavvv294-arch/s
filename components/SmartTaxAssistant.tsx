
import React, { useState } from 'react';
import { FileText, X, Sparkles, AlertCircle, Download, Check } from 'lucide-react';
import { Transaction } from '../types';
import { analyzeTaxDeductibles } from '../services/geminiService';

interface SmartTaxAssistantProps {
  onClose: () => void;
  transactions: Transaction[]; // In a real app, this might fetch from a store
}

export const SmartTaxAssistant: React.FC<SmartTaxAssistantProps> = ({ onClose, transactions = [] }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [report, setReport] = useState<any>(null);
  const [year, setYear] = useState(new Date().getFullYear());

  const handleScan = async () => {
    setIsScanning(true);
    // Filter transactions by year (mock)
    const filtered = transactions; // In real app: transactions.filter(t => t.date.includes(year.toString()));
    
    try {
       const result = await analyzeTaxDeductibles(filtered);
       setReport(result);
    } catch (e) {
       console.error(e);
    } finally {
       setIsScanning(false);
    }
  };

  return (
    <div className="glass rounded-3xl p-6 h-full animate-in slide-in-from-right duration-200 flex flex-col">
       <div className="flex justify-between items-center mb-6">
         <h3 className="text-xl font-bold text-white flex items-center gap-2"><FileText className="w-5 h-5 text-blue-400" /> Smart Tax Assistant</h3>
         <button onClick={onClose} className="text-white/40 hover:text-white"><X className="w-6 h-6" /></button>
       </div>

       {!report ? (
          <div className="flex flex-col items-center justify-center flex-1 text-center p-4">
             <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mb-6">
                <Sparkles className="w-10 h-10 text-blue-400" />
             </div>
             <h2 className="text-2xl font-bold text-white mb-2">Auto-Categorize for Tax</h2>
             <p className="text-white/50 mb-8 max-w-xs">
                AI will scan your expenses to identify potential tax deductions like medical, charity, or business expenses.
             </p>
             
             <div className="flex items-center gap-4 mb-6">
                <label className="text-white/60 text-sm">Tax Year:</label>
                <select 
                  value={year} 
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="bg-black/20 text-white rounded-lg p-2 outline-none border border-white/10"
                >
                   <option value="2024">2024</option>
                   <option value="2023">2023</option>
                </select>
             </div>

             <button 
               onClick={handleScan}
               disabled={isScanning}
               className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all disabled:opacity-50 flex items-center gap-2"
             >
                {isScanning ? 'Scanning...' : 'Scan Transactions'}
             </button>
          </div>
       ) : (
          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-6">
             <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 rounded-2xl shadow-lg">
                <p className="text-blue-100 text-xs font-bold uppercase mb-1">Potential Deductions</p>
                <h2 className="text-4xl font-bold text-white">${report.totalEstimatedDeduction?.toLocaleString() || 0}</h2>
                <p className="text-blue-200 text-xs mt-2">{report.summary}</p>
             </div>

             <div>
                <h4 className="font-bold text-white mb-3">Identified Items</h4>
                <div className="space-y-3">
                   {report.deductibles?.length === 0 && <p className="text-white/30 text-center">No deductions found.</p>}
                   {report.deductibles?.map((item: any, i: number) => (
                      <div key={i} className="bg-white/5 p-3 rounded-xl flex justify-between items-start border border-white/5">
                         <div>
                            <p className="text-white font-medium text-sm">{item.description}</p>
                            <p className="text-white/40 text-xs mt-1">{item.reason}</p>
                         </div>
                         <span className="text-emerald-400 font-bold text-sm">${item.amount}</span>
                      </div>
                   ))}
                </div>
             </div>

             <button className="w-full py-3 border border-white/20 hover:bg-white/5 rounded-xl text-white font-bold flex items-center justify-center gap-2 transition-all">
                <Download className="w-4 h-4" /> Download Draft Report
             </button>
          </div>
       )}
    </div>
  );
};
