import React, { useState } from 'react';
import { QrCode, Share2, Copy, Check, ExternalLink, Zap } from 'lucide-react';

interface UPIHubProps {
  userUpiId?: string;
  onUpdateUpi: (id: string) => void;
}

export const UPIHub: React.FC<UPIHubProps> = ({ userUpiId, onUpdateUpi }) => {
  const [upiInput, setUpiInput] = useState(userUpiId || '');
  const [amount, setAmount] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  const paymentLink = `upi://pay?pa=${upiInput}&pn=FinanceFlowUser&am=${amount}&cu=INR`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(paymentLink)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(paymentLink);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleSaveId = () => {
    onUpdateUpi(upiInput);
  };

  return (
    <div className="space-y-6 pb-20 animate-in fade-in">
       {/* My QR Card */}
       <div className="glass rounded-3xl p-6 flex flex-col items-center bg-gradient-to-br from-[#2a1b3d] to-[#1a1a2e] border border-white/10 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-400 to-purple-500"></div>
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
             <QrCode className="w-5 h-5 text-teal-400" /> Receive Payment
          </h2>
          
          <div className="bg-white p-2 rounded-xl mb-6 shadow-xl">
             <img src={qrUrl} alt="UPI QR" className="w-48 h-48 object-contain rounded-lg" />
          </div>

          <div className="w-full space-y-4">
             <div>
                <label className="text-xs text-white/40 uppercase font-bold ml-1">Your UPI ID</label>
                <div className="flex gap-2 mt-1">
                   <input 
                     type="text" 
                     value={upiInput} 
                     onChange={(e) => setUpiInput(e.target.value)}
                     className="flex-1 bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-white text-sm focus:border-teal-500 outline-none"
                     placeholder="username@upi"
                   />
                   <button onClick={handleSaveId} className="px-4 bg-teal-600 rounded-xl text-white font-bold text-xs hover:bg-teal-500">
                      Save
                   </button>
                </div>
             </div>

             <div>
                <label className="text-xs text-white/40 uppercase font-bold ml-1">Amount (Optional)</label>
                <input 
                  type="number" 
                  value={amount} 
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full mt-1 bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-white text-sm focus:border-teal-500 outline-none"
                  placeholder="0.00"
                />
             </div>
          </div>
       </div>

       {/* Actions */}
       <div className="grid grid-cols-2 gap-3">
          <button onClick={handleCopy} className="glass p-4 rounded-2xl flex flex-col items-center justify-center gap-2 hover:bg-white/10">
             {isCopied ? <Check className="w-6 h-6 text-emerald-400" /> : <Copy className="w-6 h-6 text-white" />}
             <span className="text-xs font-bold text-white/60">Copy Link</span>
          </button>
          
          <a href={paymentLink} className="glass p-4 rounded-2xl flex flex-col items-center justify-center gap-2 hover:bg-white/10">
             <Zap className="w-6 h-6 text-yellow-400" />
             <span className="text-xs font-bold text-white/60">Open App</span>
          </a>
       </div>

       <div className="glass rounded-2xl p-4">
          <h3 className="text-sm font-bold text-white mb-2">How it works</h3>
          <p className="text-xs text-white/50 leading-relaxed">
             Share this QR code or link to receive payments directly to your bank account via any UPI app (GPay, PhonePe, Paytm). The link is generated locally.
          </p>
       </div>
    </div>
  );
};