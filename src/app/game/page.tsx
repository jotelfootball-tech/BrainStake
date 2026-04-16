"use client";

import { useEffect, useState, Suspense, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAccount } from "wagmi";
import { motion, AnimatePresence } from "framer-motion";
import { BrainCircuit, Clock, Trophy, Loader2, CheckCircle, XCircle, ArrowRight } from "lucide-react";
import questionsData from "@/data/questions.json";

const TOTAL_QUESTIONS = 3;
const QUESTION_TIME = 10;

type Question = {
  id: number;
  question: string;
  options: string[];
  category: string;
  answer: string;
};

function GameComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { address } = useAccount();

  const categoryParam = searchParams.get("category");
  const modeParam = searchParams.get("mode");

  const [gameState, setGameState] = useState<"ready" | "playing" | "finished">("ready");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answerTimes, setAnswerTimes] = useState<number[]>([]);
  const [startTime, setStartTime] = useState<number>(0);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const questionStartRef = useRef<number>(0);

  useEffect(() => {
    let filtered = questionsData;
    
    // Filter by category if selected
    if (categoryParam) {
      filtered = questionsData.filter(q => 
        q.category.toLowerCase() === categoryParam.toLowerCase()
      );
    }
    
    // If not enough questions in category, mix with others
    if (filtered.length < TOTAL_QUESTIONS) {
      filtered = [...filtered, ...questionsData].slice(0, TOTAL_QUESTIONS * 2);
    }
    
    const shuffled = [...filtered].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, TOTAL_QUESTIONS).map(q => ({
      id: q.id,
      question: q.question,
      options: q.options,
      category: q.category,
      answer: q.answer
    }));
    setQuestions(selected);
  }, [categoryParam]);

  const startGame = () => {
    if (questions.length === 0) return;
    setGameState("playing");
    setStartTime(Date.now());
    showQuestion(0);
  };

  const showQuestion = (idx: number) => {
    if (idx >= TOTAL_QUESTIONS) {
      setTimeout(() => {
        finishGame();
      }, 500);
      return;
    }

    setCurrentIndex(idx + 1);
    setSelectedAnswer(null);
    setTimeLeft(QUESTION_TIME);
    questionStartRef.current = Date.now();

    if (timerRef.current) clearInterval(timerRef.current);
    
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleTimeout = () => {
    setSelectedAnswer("timeout");
    const timeTaken = QUESTION_TIME;
    setAnswerTimes(prev => [...prev, timeTaken]);
    
    setTimeout(() => {
      showQuestion(currentIndex);
    }, 2000);
  };

  const submitAnswer = (answer: string) => {
    if (selectedAnswer) return;
    
    if (timerRef.current) clearInterval(timerRef.current);
    
    const timeTaken = QUESTION_TIME - timeLeft;
    setAnswerTimes(prev => [...prev, timeTaken]);
    setSelectedAnswer(answer);

    const currentQ = questions[currentIndex - 1];
    if (currentQ && currentQ.answer === answer) {
      setScore(s => s + 1);
    }

    setTimeout(() => {
      showQuestion(currentIndex);
    }, 1500);
  };

  const finishGame = () => {
    setGameState("finished");
    if (timerRef.current) clearInterval(timerRef.current);
    const avgTime = answerTimes.length > 0 
      ? (answerTimes.reduce((a, b) => a + b, 0) / answerTimes.length).toFixed(1)
      : "0.0";
    const finalData = {
      score,
      total: TOTAL_QUESTIONS,
      avgTime,
      win: score === TOTAL_QUESTIONS
    };

    // Save to shared leaderboard
    if (address) {
      const saveScore = async () => {
        try {
          const storage = (window as any).storage;
          if (storage) {
            const currentData = await storage.get({ key: 'leaderboard', shared: true });
            let leaderboard = Array.isArray(currentData) ? [...currentData] : [];
            const userIndex = leaderboard.findIndex((entry: any) => entry.address === address);
            const newEntry = {
              address,
              score,
              avgTime: parseFloat(avgTime),
              timestamp: Date.now()
            };
            if (userIndex !== -1) {
              const oldEntry = leaderboard[userIndex];
              if (score > oldEntry.score || (score === oldEntry.score && parseFloat(avgTime) < oldEntry.avgTime)) {
                leaderboard[userIndex] = newEntry;
              }
            } else {
              leaderboard.push(newEntry);
            }
            leaderboard.sort((a: any, b: any) => {
              if (b.score !== a.score) return b.score - a.score;
              return a.avgTime - b.avgTime;
            });
            await storage.set({
              key: 'leaderboard',
              value: leaderboard.slice(0, 50),
              shared: true
            });
          }
        } catch (e) {
          console.error("Score save failed", e);
        }
      };
      saveScore();
    }

    router.push(`/result?data=${encodeURIComponent(JSON.stringify(finalData))}&mode=${modeParam || 'normal'}`);
  };

  if (gameState === "ready") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-[#35D07F]/20 rounded-full flex items-center justify-center mb-6">
          <Trophy className="w-10 h-10 text-[#35D07F]" />
        </div>
        <h2 className="text-2xl font-black text-white mb-2">Ready to Play?</h2>
        <p className="text-zinc-400 mb-8 max-w-[250px]">
          Answer {TOTAL_QUESTIONS} questions in {QUESTION_TIME} seconds each. Score 2/3 to win!
        </p>
        <button
          onClick={startGame}
          className="px-8 py-4 bg-[#35D07F] text-black font-extrabold rounded-2xl shadow-lg hover:scale-105 transition-transform flex items-center gap-2"
        >
          Start Round <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    );
  }

  const currentQ = questions[currentIndex - 1];
  if (!currentQ) return <LoaderComponent text="Loading questions..." />;

  const getTimerColor = () => {
    if (timeLeft > 4) return "text-emerald-400";
    if (timeLeft > 2) return "text-yellow-400";
    return "text-red-500";
  };

  return (
    <div className="flex flex-col h-full w-full">
      {/* Header */}
      <div className="flex justify-between items-center p-5 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md">
        <div className="bg-slate-800 px-3 py-1 rounded-full text-xs font-bold text-cyan-400 flex items-center gap-1.5">
          <BrainCircuit className="w-3.5 h-3.5" />
          {currentQ.category}
        </div>
        <div className="text-slate-400 text-sm font-semibold tracking-widest">
          Q {currentIndex} <span className="text-slate-600">/ {TOTAL_QUESTIONS}</span>
        </div>
      </div>

      {/* Timer Bar */}
      <div className="w-full h-2 bg-slate-800 relative overflow-hidden">
        <motion.div 
          className={`absolute left-0 top-0 bottom-0 transition-colors duration-300 ${
            timeLeft > 4 ? "bg-emerald-400" : timeLeft > 2 ? "bg-yellow-400" : "bg-red-500"
          }`}
          initial={{ width: "100%" }}
          animate={{ width: `${(timeLeft / QUESTION_TIME) * 100}%` }}
          transition={{ ease: "linear", duration: 1 }}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto px-5 pt-8 pb-32 flex flex-col scrollbar-hide">
        <div className={`flex items-center justify-center gap-2 mb-6 font-mono text-3xl font-bold ${getTimerColor()}`}>
          <Clock className="w-7 h-7" />
          {timeLeft}
        </div>

        <h2 className="text-2xl md:text-3xl font-extrabold text-white leading-tight text-center mb-10 shadow-sm">
          {currentQ.question}
        </h2>

        <div className="mt-auto space-y-3">
          <AnimatePresence>
            {currentQ.options.map((opt, idx) => {
              const isSelected = selectedAnswer === opt;
              const isCorrect = opt === currentQ.answer;
              const isLocked = selectedAnswer !== null;
              const showResult = isLocked && isCorrect;

              let btnClass = "bg-slate-800 border-2 border-slate-700 hover:border-slate-500 text-slate-200 hover:bg-slate-750";
              
              if (isSelected) {
                if (isCorrect) {
                  btnClass = "bg-emerald-600 border-2 border-emerald-400 text-white";
                } else {
                  btnClass = "bg-red-600 border-2 border-red-400 text-white";
                }
              } else if (isLocked && isCorrect) {
                btnClass = "bg-emerald-600/50 border-2 border-emerald-400 text-white";
              }

              return (
                <motion.button
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  onClick={() => submitAnswer(opt)}
                  disabled={isLocked}
                  className={`w-full p-4 rounded-2xl font-semibold text-lg transition-all active:scale-[0.98] flex items-center justify-between ${btnClass}`}
                >
                  <span>{opt}</span>
                  {isSelected && (isCorrect ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />)}
                </motion.button>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function LoaderComponent({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="w-16 h-16 relative">
        <div className="absolute inset-0 border-4 border-slate-800 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-emerald-400 rounded-full border-t-transparent animate-spin"></div>
      </div>
      <p className="text-slate-400 font-medium animate-pulse">{text}</p>
    </div>
  );
}

export default function GamePage() {
  return (
    <Suspense fallback={<LoaderComponent text="Loading..." />}>
      <GameComponent />
    </Suspense>
  );
}