"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Trophy, Crown, Clock, ArrowLeft, Star } from "lucide-react";
import Link from "next/link";
import { useAccount } from "wagmi";
import { shortenAddress } from "@/lib/utils";

const CATEGORY_ICONS = {
  sports: "⚽",
  tech: "💻",
  general: "🌍",
  pop: "🍿"
};

export default function LeaderboardPage() {
  const { address } = useAccount();
  const [leaders, setLeaders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLeaders = async () => {
      try {
        const storage = (window as any).storage;
        if (storage) {
          const data = await storage.get({ key: 'leaderboard', shared: true });
          if (Array.isArray(data)) {
            const sorted = [...data].sort((a, b) => {
              if (b.score !== a.score) return b.score - a.score;
              return a.avgTime - b.avgTime;
            });
            setLeaders(sorted.slice(0, 50));
          }
        }
        setIsLoading(false);
      } catch (err) {
        console.error("Fetch leaders failed", err);
        setIsLoading(false);
      }
    };

    fetchLeaders();
    const interval = setInterval(fetchLeaders, 3000);
    return () => clearInterval(interval);
  }, []);

  const userRank = leaders.findIndex(l => l.address === address) + 1;

  return (
    <main className="flex-1 overflow-y-auto px-5 py-6 pb-28 scrollbar-hide flex flex-col">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/" className="p-2 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors">
          <ArrowLeft className="w-5 h-5 text-white" />
        </Link>
        <div className="bg-yellow-500/20 p-2 rounded-xl">
          <Trophy className="w-6 h-6 text-yellow-400" />
        </div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Leaderboard</h1>
      </div>

      {/* User Rank Status */}
      {address && (
        <div className="mb-6 bg-[#35D07F]/10 border border-[#35D07F]/30 p-4 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-[#35D07F] p-2 rounded-xl text-black font-black text-sm">
              #{userRank || '--'}
            </div>
            <div>
              <p className="text-white font-bold text-sm">Your Status</p>
              <p className="text-[#35D07F] text-xs font-medium">
                {userRank ? `You are #${userRank} on the board` : "Finish a game to rank!"}
              </p>
            </div>
          </div>
          <Star className={`w-5 h-5 ${userRank ? 'text-[#35D07F] fill-[#35D07F]' : 'text-zinc-600'}`} />
        </div>
      )}

      {/* Top 3 Podium */}
      <div className="flex justify-center items-end gap-3 mb-10 mt-4 px-2">
        {/* 2nd Place */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="flex flex-col items-center">
          <div className="relative mb-2">
            <div className="w-14 h-14 bg-zinc-800 rounded-full border-2 border-slate-300 flex items-center justify-center text-2xl">
              🐵
            </div>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-slate-300 text-slate-900 text-[10px] px-1.5 font-bold rounded-full">2nd</div>
          </div>
          <div className="h-20 w-16 bg-gradient-to-t from-slate-400/20 to-slate-400/5 rounded-t-lg border-t border-slate-400/30 flex flex-col items-center justify-end pb-2">
            <span className="text-xs font-bold text-white">{leaders[1]?.score ?? 0}/3</span>
            <span className="text-[10px] text-zinc-400">{leaders[1]?.avgTime ?? '0.0'}s</span>
          </div>
        </motion.div>

        {/* 1st Place */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0 }} className="flex flex-col items-center">
          <div className="relative mb-2">
            <Crown className="w-6 h-6 text-yellow-400 absolute -top-5 left-1/2 -translate-x-1/2 z-10" />
            <div className="w-16 h-16 bg-zinc-800 rounded-full border-2 border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.5)] flex items-center justify-center text-3xl">
              👑
            </div>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-950 text-[10px] px-1.5 font-bold rounded-full">1st</div>
          </div>
          <div className="h-28 w-16 bg-gradient-to-t from-yellow-400/20 to-yellow-400/5 rounded-t-lg border-t border-yellow-400/30 flex flex-col items-center justify-end pb-2">
            <span className="text-xs font-bold text-white">{leaders[0]?.score ?? 0}/3</span>
            <span className="text-[10px] text-zinc-400">{leaders[0]?.avgTime ?? '0.0'}s</span>
          </div>
        </motion.div>

        {/* 3rd Place */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="flex flex-col items-center">
          <div className="relative mb-2">
            <div className="w-14 h-14 bg-zinc-800 rounded-full border-2 border-orange-400 flex items-center justify-center text-2xl">
              🦊
            </div>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-orange-400 text-orange-950 text-[10px] px-1.5 font-bold rounded-full">3rd</div>
          </div>
          <div className="h-16 w-16 bg-gradient-to-t from-orange-400/20 to-orange-400/5 rounded-t-lg border-t border-orange-400/30 flex flex-col items-center justify-end pb-2">
            <span className="text-xs font-bold text-white">{leaders[2]?.score ?? 0}/3</span>
            <span className="text-[10px] text-zinc-400">{leaders[2]?.avgTime ?? '0.0'}s</span>
          </div>
        </motion.div>
      </div>

      {/* Table Header */}
      <div className="grid grid-cols-12 gap-2 px-3 mb-2 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
        <div className="col-span-2">Rank</div>
        <div className="col-span-5">Player</div>
        <div className="col-span-3 text-right">Score</div>
        <div className="col-span-2 text-right">Avg</div>
      </div>

      {/* Remaining List */}
      <div className="space-y-2">
        {leaders.length === 0 && !isLoading && (
          <div className="text-center py-10">
            <p className="text-zinc-500">No scores recorded yet. Be the first!</p>
          </div>
        )}
        
        {leaders.map((leader, index) => (
          <div 
            key={leader.address} 
            className={`grid grid-cols-12 gap-2 px-3 py-3 rounded-2xl border items-center transition-all ${
              address === leader.address 
                ? "bg-[#35D07F]/20 border-[#35D07F]/50 shadow-[0_0_15px_rgba(53,208,127,0.1)]" 
                : "bg-zinc-900/60 border-white/5"
            }`}
          >
            <div className={`col-span-2 text-sm font-black ${index < 3 ? 'text-white' : 'text-zinc-500'}`}>
              {index + 1}
            </div>
            <div className="col-span-5">
              <p className="text-sm font-bold text-white">
                {address === leader.address ? "You" : shortenAddress(leader.address)}
              </p>
              <p className="text-[10px] text-zinc-500 font-medium">#{index + 1} Globals</p>
            </div>
            <div className="col-span-3 text-right">
              <p className="text-sm font-black text-[#35D07F]">{leader.score}/3</p>
            </div>
            <div className="col-span-2 text-right flex items-center justify-end gap-1">
              <Clock className="w-3 h-3 text-zinc-500" />
              <span className="text-xs font-bold text-zinc-400">{leader.avgTime}s</span>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}