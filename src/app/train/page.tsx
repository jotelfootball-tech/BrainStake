"use client";

import { motion } from "framer-motion";
import { Dumbbell, Target, Zap, Calendar, Play } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function TrainPage() {
  const router = useRouter();

  const handleStartSim = () => {
    // We navigate to a mock bot/train game state or simulate a pending start
    router.push("/game?bot=true&mode=train");
  };

  return (
    <main className="flex-1 overflow-y-auto px-5 py-6 pb-28 scrollbar-hide flex flex-col">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-[#6C5DD3]/20 p-2 rounded-xl">
          <Dumbbell className="w-6 h-6 text-[#6C5DD3]" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Training Arena</h1>
          <p className="text-xs text-zinc-400 font-medium tracking-wide">Earn XP securely off-chain</p>
        </div>
      </div>

      <div className="mb-6 bg-zinc-900/60 p-5 rounded-[24px] border border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#35D07F] opacity-10 blur-3xl rounded-full" />
        <h2 className="text-lg font-extrabold text-white mb-2">Daily Quiz Available!</h2>
        <p className="text-xs text-zinc-400 mb-4 block max-w-[80%]">Complete the 5-question daily challenge to earn massive XP multipliers.</p>
        
        <button 
          onClick={handleStartSim}
          className="w-full bg-[#35D07F] hover:bg-[#35D07F]/90 text-black font-extrabold py-3.5 rounded-2xl shadow-[0_4px_16px_rgba(53,208,127,0.2)] transition-all active:scale-95 flex items-center justify-center gap-2"
        >
          <Calendar className="w-5 h-5" /> Play Daily Quiz
        </button>
      </div>

      <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-3 px-1">Game Modes</h3>
      
      <div className="grid grid-cols-1 gap-3">
        <button 
          onClick={handleStartSim}
          className="group relative overflow-hidden bg-zinc-900/80 p-4 rounded-2xl border border-white/5 hover:border-white/10 transition-colors flex items-center gap-4 text-left"
        >
          <div className="bg-blue-500/20 p-3 rounded-xl group-hover:scale-110 transition-transform">
            <Zap className="w-6 h-6 text-blue-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-white font-bold text-sm">Quick 5</h3>
            <p className="text-zinc-500 text-xs mt-0.5">5 fast random questions</p>
          </div>
          <Play className="w-5 h-5 text-zinc-600 group-hover:text-white transition-colors" />
        </button>

        <button 
          onClick={handleStartSim}
          className="group relative overflow-hidden bg-zinc-900/80 p-4 rounded-2xl border border-white/5 hover:border-white/10 transition-colors flex items-center gap-4 text-left"
        >
          <div className="bg-fuchsia-500/20 p-3 rounded-xl group-hover:scale-110 transition-transform">
            <Target className="w-6 h-6 text-fuchsia-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-white font-bold text-sm">Topic Drill</h3>
            <p className="text-zinc-500 text-xs mt-0.5">Choose a specific category</p>
          </div>
          <Play className="w-5 h-5 text-zinc-600 group-hover:text-white transition-colors" />
        </button>
      </div>
    </main>
  );
}
