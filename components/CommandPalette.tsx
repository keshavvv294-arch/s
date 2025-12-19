import React, { useState } from 'react';
import { Mic, Send, X, Command, Sparkles, Loader2 } from 'lucide-react';
import { processNaturalLanguageCommand } from '../services/geminiService';

interface CommandPaletteProps {
  onExecute: (action: any) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ onExecute, isOpen, onClose }) => {
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isListening, setIsListening] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!input.trim()) return;
    setIsProcessing(true);
    try {
      const action = await processNaturalLanguageCommand(input);
      onExecute(action);
      setInput('');
      onClose();
    } catch (error) {
      console.error("Failed to execute command", error);
    } finally {
      setIsProcessing(false);
    }
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
        setInput(transcript);
        // Optional: Auto-submit on voice end
        // handleSubmit(); 
      };
      recognition.start();
    } else {
      alert("Voice recognition not supported in this browser.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-[#0f172a] border border-white/20 rounded-2xl shadow-2xl overflow-hidden relative">
        <div className="p-4 flex items-center gap-3 border-b border-white/10">
          <Command className="w-5 h-5 text-indigo-400" />
          <h3 className="text-white font-semibold">AI Command Mode</h3>
          <button onClick={onClose} className="ml-auto text-white/40 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6">
          <div className="relative">
             <textarea 
               value={input}
               onChange={(e) => setInput(e.target.value)}
               placeholder="Try 'Spent $50 on groceries' or 'Add 10 AAPL stocks at $150'"
               className="w-full bg-black/30 border border-white/10 rounded-xl p-4 text-white text-lg placeholder:text-white/20 focus:outline-none focus:border-indigo-500 h-32 resize-none"
               autoFocus
             />
             
             {isProcessing && (
               <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center backdrop-blur-[1px]">
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
                    <span className="text-white font-medium">Processing...</span>
                  </div>
               </div>
             )}
          </div>

          <div className="flex justify-between items-center mt-4">
             <button 
               onClick={startListening}
               className={`p-3 rounded-full transition-all ${isListening ? 'bg-red-500/20 text-red-400 animate-pulse' : 'bg-white/5 text-white/60 hover:text-white'}`}
             >
               <Mic className="w-5 h-5" />
             </button>

             <button 
               onClick={handleSubmit}
               disabled={!input || isProcessing}
               className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-xl font-medium flex items-center gap-2 disabled:opacity-50 transition-all"
             >
               <Sparkles className="w-4 h-4" />
               Execute Command
             </button>
          </div>
        </div>

        <div className="bg-white/5 p-3 text-xs text-white/40 text-center">
           Tip: You can add Income, Expenses, or Assets using natural language.
        </div>
      </div>
    </div>
  );
};