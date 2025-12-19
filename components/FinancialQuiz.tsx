
import React, { useState, useEffect } from 'react';
import { generateFinancialQuiz } from '../services/geminiService';
import { QuizQuestion } from '../types';
import { Loader2, Check, X as XIcon, Trophy, Heart, Zap, ArrowRight, RefreshCw, X } from 'lucide-react';

interface FinancialQuizProps {
  onClose: () => void;
}

export const FinancialQuiz: React.FC<FinancialQuizProps> = ({ onClose }) => {
  const [question, setQuestion] = useState<QuizQuestion | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  
  // Game State
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);

  const loadQuestion = async () => {
    if (lives <= 0) return;
    setLoading(true);
    setSelectedOption(null);
    setIsCorrect(null);
    try {
      const q = await generateFinancialQuiz();
      setQuestion(q);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuestion();
  }, []);

  const handleOptionClick = (index: number) => {
    if (selectedOption !== null || !question) return;
    setSelectedOption(index);
    const correct = index === question.correctIndex;
    setIsCorrect(correct);
    
    if (correct) {
       setScore(s => s + 100 + (streak * 10)); // Combo bonus
       setStreak(s => s + 1);
    } else {
       setStreak(0);
       setLives(l => {
          const newLives = l - 1;
          if (newLives <= 0) setGameOver(true);
          return newLives;
       });
    }
  };

  const resetGame = () => {
     setScore(0);
     setLives(3);
     setStreak(0);
     setGameOver(false);
     loadQuestion();
  };

  if (gameOver) {
     return (
        <div className="glass rounded-3xl p-8 flex flex-col items-center justify-center text-center animate-in zoom-in">
           <Trophy className="w-20 h-20 text-yellow-400 mb-4 animate-bounce" />
           <h2 className="text-3xl font-bold text-white mb-2">Game Over!</h2>
           <p className="text-white/60 mb-6">You ran out of lives.</p>
           <div className="bg-white/10 rounded-2xl p-6 w-full mb-6">
              <p className="text-sm text-white/40 uppercase">Final Score</p>
              <p className="text-4xl font-bold text-white">{score}</p>
           </div>
           <button onClick={resetGame} className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white font-bold flex items-center justify-center gap-2">
              <RefreshCw className="w-5 h-5" /> Play Again
           </button>
           <button onClick={onClose} className="mt-4 text-white/40 hover:text-white">Close</button>
        </div>
     );
  }

  return (
    <div className="glass rounded-3xl p-6 max-w-md mx-auto w-full relative animate-in zoom-in duration-200 h-full flex flex-col">
      {/* Top Bar */}
      <div className="flex justify-between items-center mb-6 bg-black/20 p-3 rounded-2xl">
        <div className="flex items-center gap-2">
           <div className="flex gap-1">
              {[1,2,3].map(i => (
                 <Heart key={i} className={`w-5 h-5 ${i <= lives ? 'text-rose-500 fill-rose-500' : 'text-white/10'}`} />
              ))}
           </div>
        </div>
        <div className="flex items-center gap-2">
           <span className="text-white/40 text-xs font-bold uppercase">Streak</span>
           <div className="flex items-center gap-1 text-orange-400 font-bold">
              <Zap className="w-4 h-4 fill-orange-400" /> {streak}
           </div>
        </div>
        <button onClick={onClose}><X className="w-5 h-5 text-white/40" /></button>
      </div>

      <div className="text-center mb-6">
         <span className="text-[10px] text-white/30 uppercase font-bold tracking-widest">Current Score</span>
         <h2 className="text-4xl font-bold text-white">{score}</h2>
      </div>

      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center text-white/50">
           <Loader2 className="w-10 h-10 animate-spin mb-4 text-indigo-400" />
           <p className="animate-pulse">Loading Challenge...</p>
        </div>
      ) : question ? (
        <div className="flex-1 flex flex-col">
           <div className="bg-gradient-to-br from-indigo-900/50 to-purple-900/50 p-6 rounded-2xl border border-white/5 mb-6 shadow-lg">
              <h3 className="text-lg font-bold text-white leading-relaxed text-center">{question.question}</h3>
           </div>

           <div className="space-y-3 flex-1">
              {question.options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleOptionClick(idx)}
                  disabled={selectedOption !== null}
                  className={`w-full text-left p-4 rounded-xl border transition-all duration-300 flex justify-between items-center relative overflow-hidden group ${
                    selectedOption === null 
                      ? 'bg-white/5 border-white/10 hover:bg-white/10 hover:scale-[1.02]' 
                      : selectedOption === idx 
                        ? isCorrect 
                          ? 'bg-emerald-600 border-emerald-500 text-white' 
                          : 'bg-rose-600 border-rose-500 text-white'
                        : idx === question.correctIndex
                          ? 'bg-emerald-600/30 border-emerald-500/50 text-white' // Show correct answer
                          : 'bg-white/5 border-white/5 opacity-30'
                  }`}
                >
                   <span className="relative z-10 font-medium">{option}</span>
                   {selectedOption === idx && (
                      <div className="relative z-10">
                         {isCorrect ? <Check className="w-5 h-5" /> : <XIcon className="w-5 h-5" />}
                      </div>
                   )}
                </button>
              ))}
           </div>

           {selectedOption !== null && (
             <div className="mt-4 animate-in slide-in-from-bottom-2 absolute bottom-6 left-6 right-6 z-20">
                {!isCorrect && (
                   <div className="bg-rose-500/20 border border-rose-500/30 p-3 rounded-xl mb-3 backdrop-blur-md">
                      <p className="text-xs text-rose-200">{question.explanation}</p>
                   </div>
                )}
                <button 
                  onClick={loadQuestion}
                  className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-xl transition-all ${isCorrect ? 'bg-emerald-500 hover:bg-emerald-400 text-white' : 'bg-white text-black'}`}
                >
                   {isCorrect ? 'Awesome! Next' : 'Try Next One'} <ArrowRight className="w-5 h-5" />
                </button>
             </div>
           )}
        </div>
      ) : null}
    </div>
  );
};
