
import React, { useState, useRef } from 'react';
import { X, Hand, Mic, Check, ArrowUp } from 'lucide-react';
import { Transaction } from '../types';

interface GesturePayProps {
   onClose: () => void;
   onPay: (t: Omit<Transaction, 'id'>) => void;
}

export const GesturePay: React.FC<GesturePayProps> = ({ onClose, onPay }) => {
  const [step, setStep] = useState<'idle' | 'listening' | 'confirm'>('idle');
  const [amount, setAmount] = useState(50); // Default/Mocked from voice
  const [payee, setPayee] = useState('Alex');
  
  const [startY, setStartY] = useState(0);
  const [offsetY, setOffsetY] = useState(0);

  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
     const y = 'touches' in e ? e.touches[0].clientY : e.clientY;
     setStartY(y);
  };

  const handleTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
     if (!startY) return;
     const y = 'touches' in e ? e.touches[0].clientY : e.clientY;
     const diff = startY - y;
     if (diff > 0) setOffsetY(diff);
  };

  const handleTouchEnd = () => {
     if (offsetY > 150) {
        setStep('confirm');
        // Execute Payment
        onPay({
           description: `Gesture Pay to ${payee}`,
           amount: amount,
           type: 'expense',
           category: 'Other',
           date: new Date().toISOString().split('T')[0],
           status: 'cleared',
           notes: 'Via Gesture Interface'
        });

        setTimeout(() => {
           onClose();
        }, 1500);
     }
     setStartY(0);
     setOffsetY(0);
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex flex-col items-center justify-center p-6 backdrop-blur-xl">
       <button onClick={onClose} className="absolute top-6 right-6 text-white/50 hover:text-white"><X className="w-8 h-8" /></button>
       
       {step === 'confirm' ? (
          <div className="flex flex-col items-center animate-in zoom-in">
             <div className="w-24 h-24 rounded-full bg-emerald-500 flex items-center justify-center mb-6">
                <Check className="w-12 h-12 text-white" />
             </div>
             <h2 className="text-3xl font-bold text-white">Sent ${amount}!</h2>
          </div>
       ) : (
          <div 
            className="flex flex-col items-center w-full h-full justify-center"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleTouchStart}
            onMouseMove={handleTouchMove}
            onMouseUp={handleTouchEnd}
          >
             <div className="text-center mb-12 pointer-events-none select-none">
                <Mic className={`w-12 h-12 mx-auto mb-4 ${step === 'listening' ? 'text-red-500 animate-pulse' : 'text-white/30'}`} />
                <h2 className="text-2xl font-bold text-white mb-2">"Pay {payee} ${amount}"</h2>
                <p className="text-white/40">Say command then Swipe Up to confirm</p>
             </div>

             <div className="relative w-full max-w-xs h-64 border-2 border-dashed border-white/20 rounded-3xl flex items-end justify-center pb-8 overflow-hidden">
                <div 
                  className="absolute w-full bg-gradient-to-t from-teal-500/50 to-transparent transition-all duration-75 bottom-0"
                  style={{ height: `${offsetY}px` }}
                ></div>
                <div 
                   className="flex flex-col items-center gap-2 text-white/50 transition-transform duration-75"
                   style={{ transform: `translateY(-${offsetY}px)` }}
                >
                   <ArrowUp className="w-8 h-8 animate-bounce" />
                   <span className="text-sm font-bold uppercase tracking-widest">Swipe to Pay</span>
                </div>
             </div>
          </div>
       )}
    </div>
  );
};
