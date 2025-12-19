
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Loader2, Zap } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { createChatSession } from '../services/geminiService';
import { ChatMessage } from '../types';
import { GenerateContentResponse } from "@google/genai";

interface AIChatProps {
  initialMessage?: string | null;
}

export const AIChat: React.FC<AIChatProps> = ({ initialMessage }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'model',
      text: "Hi! I'm your WealthFlow AI Assistant. I can help you create a budget, explain complex terms, or analyze your spending. How can I help today?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatSessionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    chatSessionRef.current = createChatSession();
  }, []);

  useEffect(() => {
    if (initialMessage && !initializedRef.current) {
        setMessages(prev => [
            ...prev,
            {
                id: Date.now().toString(),
                role: 'model',
                text: initialMessage,
                timestamp: new Date()
            }
        ]);
        initializedRef.current = true;
    }
  }, [initialMessage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const QUICK_PROMPTS = [
     "Analyze my spending",
     "How can I save more?",
     "Explain Inflation",
     "What is an ETF?",
     "Create a budget plan"
  ];

  const handleSend = async (textOverride?: string) => {
    const textToSend = textOverride || input;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: textToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      if (chatSessionRef.current) {
        const result: GenerateContentResponse = await chatSessionRef.current.sendMessage({
          message: userMsg.text
        });
        
        const text = result.text || "I'm having trouble thinking right now.";
        
        const aiMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'model',
          text: text,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMsg]);
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: "Sorry, I lost connection. Please try again.",
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] bg-[#0f172a] relative">
      <div className="p-4 border-b border-white/5 flex items-center gap-3 backdrop-blur-md sticky top-0 z-10 bg-[#0f172a]/90">
        <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
          <Bot className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-bold text-white">WealthFlow AI Assistant</h3>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            <span className="text-xs text-white/50">Online</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
              msg.role === 'user' ? 'bg-white/10' : 'bg-indigo-500/20 text-indigo-400'
            }`}>
              {msg.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Sparkles className="w-4 h-4" />}
            </div>
            
            <div className={`max-w-[85%] rounded-2xl p-3.5 text-sm leading-relaxed ${
              msg.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-tr-none' 
                : 'bg-white/5 text-white/90 rounded-tl-none border border-white/5'
            }`}>
              {msg.role === 'model' ? (
                <div className="prose prose-invert prose-sm max-w-none">
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                </div>
              ) : (
                msg.text
              )}
              <span className="text-[10px] text-white/30 block mt-1">
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-center gap-2 text-white/40 text-xs ml-12">
            <Loader2 className="w-3 h-3 animate-spin" />
            Thinking...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-[#0f172a] border-t border-white/5 space-y-3">
        {messages.length < 3 && !isLoading && (
           <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
              {QUICK_PROMPTS.map(prompt => (
                 <button 
                   key={prompt}
                   onClick={() => handleSend(prompt)}
                   className="whitespace-nowrap px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-xs text-white/70 hover:text-white transition-colors flex items-center gap-1"
                 >
                    <Zap className="w-3 h-3 text-indigo-400" /> {prompt}
                 </button>
              ))}
           </div>
        )}

        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about budget, taxes, or savings..."
            className="w-full bg-white/5 border border-white/10 rounded-full pl-6 pr-12 py-3.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 placeholder:text-white/20 transition-all"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 rounded-full text-white hover:bg-indigo-500 disabled:opacity-50 disabled:bg-transparent transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
