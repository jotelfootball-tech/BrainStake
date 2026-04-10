"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getSocket } from "@/lib/socket";
import { useAccount } from "wagmi";
import { motion, AnimatePresence } from "framer-motion";
import { BrainCircuit, Clock, Trophy, Loader2 } from "lucide-react";
import questionsData from "@/data/questions.json";

function GameComponent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const urlRoomId = searchParams.get("room");
  const isHost = searchParams.get("host") === "true";
  const mode = searchParams.get("mode");
  const { address } = useAccount();

  const [currentRoomId, setCurrentRoomId] = useState(urlRoomId || "");
  const [gameState, setGameState] = useState<"waiting" | "playing" | "finished">("waiting");
  const [question, setQuestion] = useState<{id: number, question: string, options: string[], category: string} | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(5);
  const [timeLeft, setTimeLeft] = useState(15);
  const [myScore, setMyScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [botScore, setBotScore] = useState(0);

  useEffect(() => {
    // Client-side Solo Engine Logic
    const startClientSideGame = () => {
      const roomId = `SOLO_${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      setCurrentRoomId(roomId);
      
      // Select 5 random questions
      const shuffled = [...questionsData].sort(() => 0.5 - Math.random());
      const selectedQuestions = shuffled.slice(0, 5);
      
      let currentIdx = 0;
      
      const showNextQuestion = (idx: number) => {
        if (idx >= 5) {
          // Game Over
          const finalScores = { [address || "guest"]: myScore, "BOT_PLAYER": botScore };
          const winner = myScore > botScore ? (address || "guest") : (botScore > myScore ? "BOT_PLAYER" : "tie");
          
          setTimeout(() => {
            const scoresParam = encodeURIComponent(JSON.stringify(finalScores));
            router.push(`/result?winner=${winner}&scores=${scoresParam}`);
          }, 1000);
          return;
        }

        setGameState("playing");
        const q = selectedQuestions[idx];
        setQuestion({
          id: q.id,
          category: q.category,
          question: q.question,
          options: q.options
        });
        setCurrentIndex(idx + 1);
        setSelectedAnswer(null);
        setTimeLeft(15);
        
        // Timer setup
        const timer = setInterval(() => {
          setTimeLeft(prev => {
            if (prev <= 1) {
              clearInterval(timer);
              // Move to next question after a brief delay
              setTimeout(() => showNextQuestion(idx + 1), 2000);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        // Bot simulation
        if (mode === "solo") {
          const botDelay = 3000 + Math.random() * 7000; // 3-10 seconds
          setTimeout(() => {
            if (Math.random() > 0.5) { // 50% chance for bot to be right
               setBotScore(s => s + 1);
            }
          }, botDelay);
        }
      };

      // Initial start delay
      setTimeout(() => showNextQuestion(0), 1500);
    };

    // Redirect if no room and not solo/train
    if (!urlRoomId && mode !== "solo" && mode !== "train" && !currentRoomId) {
      router.push("/");
      return;
    }

    // Start solo game immediately
    if (mode === "solo" || mode === "train") {
      startClientSideGame();
      return;
    }

    // Multiplayer logic remains unchanged (Socket.io)
    const socket = getSocket();
    if (!socket.connected) socket.connect();

    socket.on('room_created', (data) => {
      if (mode === "solo" || mode === "train") {
        setCurrentRoomId(data.roomId);
      }
    });

    socket.on('player_joined', () => {
      if (isHost && urlRoomId) {
        socket.emit('start_game', { roomId: urlRoomId });
      }
    });

    socket.on('next_question', (data) => {
      setGameState("playing");
      setQuestion(data.question);
      setCurrentIndex(data.index);
      setTotalQuestions(data.total);
      setSelectedAnswer(null);
    });

    socket.on('timer_update', (data) => {
      setTimeLeft(data.timeLeft);
    });

    socket.on('game_over', (data) => {
      setGameState("finished");
      const scoresParam = encodeURIComponent(JSON.stringify(data.scores));
      router.push(`/result?winner=${data.winner}&scores=${scoresParam}`);
    });

    return () => {
      socket.off('room_created');
      socket.off('player_joined');
      socket.off('next_question');
      socket.off('timer_update');
      socket.off('game_over');
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlRoomId, address, isHost, mode]);

  const handleStart = () => {
    getSocket().emit('start_game', { roomId: currentRoomId });
  };

  const submitAnswer = (answer: string) => {
    if (selectedAnswer) return; // already answered
    setSelectedAnswer(answer);
    
    if (mode === "solo" || mode === "train") {
      const q = questionsData.find(q => q.id === question?.id);
      if (q && q.answer === answer) {
        setMyScore(s => s + 1);
      }
      // In solo mode, we just wait for the timer to finish or we could skip ahead.
      // For simplicity, let's just let the timer run or we can trigger next manually.
    } else {
      getSocket().emit('submit_answer', { roomId: currentRoomId, walletAddress: address || "guest", answer });
    }
  };

  if (gameState === "waiting") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <LoaderComponent text={isHost ? "Waiting for Opponent..." : "Waiting for Host to start..."} />
        {isHost && (
          <button 
            onClick={handleStart}
            className="mt-8 px-8 py-3 bg-indigo-600 rounded-full font-bold text-white shadow-lg active:scale-95 transition-transform"
          >
            Force Start (If opponent is here)
          </button>
        )}
        <p className="mt-6 text-2xl font-mono tracking-widest text-cyan-400 bg-slate-800 px-6 py-2 rounded-xl border border-slate-700">
          {currentRoomId || "..."}
        </p>
        <p className="mt-2 text-sm text-slate-500">Share this code to join</p>
      </div>
    );
  }

  if (!question) return null;

  return (
    <div className="flex flex-col h-full w-full">
      {/* Header */}
      <div className="flex justify-between items-center p-5 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md">
        <div className="bg-slate-800 px-3 py-1 rounded-full text-xs font-bold text-cyan-400 flex items-center gap-1.5">
          <BrainCircuit className="w-3.5 h-3.5" />
          {question.category}
        </div>
        <div className="text-slate-400 text-sm font-semibold tracking-widest">
          Q {currentIndex} <span className="text-slate-600">/ {totalQuestions}</span>
        </div>
      </div>

      {/* Timer Bar */}
      <div className="w-full h-1.5 bg-slate-800 relative overflow-hidden">
        <motion.div 
          className="absolute left-0 top-0 bottom-0 bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]"
          initial={{ width: "100%" }}
          animate={{ width: `${(timeLeft / 15) * 100}%` }}
          transition={{ ease: "linear", duration: 1 }}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto px-5 pt-8 pb-32 flex flex-col scrollbar-hide">
        <div className="flex items-center justify-center gap-2 mb-6 text-emerald-400 font-mono text-xl font-bold">
          <Clock className="w-5 h-5 animate-pulse" />
          {timeLeft}s
        </div>

        <h2 className="text-2xl md:text-3xl font-extrabold text-white leading-tight text-center mb-10 shadow-sm">
          {question.question}
        </h2>

        <div className="mt-auto space-y-3">
          <AnimatePresence>
            {question.options.map((opt, idx) => {
              const isSelected = selectedAnswer === opt;
              const isLocked = selectedAnswer !== null;

              return (
                <motion.button
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  onClick={() => submitAnswer(opt)}
                  disabled={isLocked}
                  className={`w-full p-4 rounded-2xl font-semibold text-lg transition-all active:scale-[0.98] 
                    ${isSelected 
                      ? "bg-indigo-600 border-2 border-indigo-400 text-white shadow-lg shadow-indigo-500/30" 
                      : isLocked 
                        ? "bg-slate-800/50 border-2 border-slate-800 text-slate-500 opacity-50"
                        : "bg-slate-800 border-2 border-slate-700 hover:border-slate-500 text-slate-200 hover:bg-slate-750"
                    }`}
                >
                  {opt}
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
