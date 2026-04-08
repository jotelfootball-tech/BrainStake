"use client";

import { motion } from "framer-motion";
import { Trophy, Medal, Crown } from "lucide-react";
import Image from "next/image";

const MOCK_LEADERS = [
  { id: 1, name: "CryptoKing", address: "0x7227...8a19", xp: 12450, winRate: 85, avatarUrl: "https://api.dicebear.com/9.x/bottts-neutral/svg?seed=King&backgroundColor=35D07F" },
  { id: 2, name: "BrainApe", address: "0x3184...b23c", xp: 11200, winRate: 78, avatarUrl: "https://api.dicebear.com/9.x/bottts-neutral/svg?seed=Ape&backgroundColor=6C5DD3" },
  { id: 3, name: "CeloMaxi", address: "0x2070...e4ff", xp: 9800, winRate: 71, avatarUrl: "https://api.dicebear.com/9.x/bottts-neutral/svg?seed=Maxi&backgroundColor=fb923c" },
  { id: 4, name: "TriviaGod", address: "0x9912...c11a", xp: 8400, winRate: 68, avatarUrl: "https://api.dicebear.com/9.x/bottts-neutral/svg?seed=God&backgroundColor=60a5fa" },
  { id: 5, name: "VitalikFan", address: "0x4421...d99b", xp: 7100, winRate: 62, avatarUrl: "https://api.dicebear.com/9.x/bottts-neutral/svg?seed=Fan&backgroundColor=d946ef" },
];

export default function LeaderboardPage() {
  return (
    <main className="flex-1 overflow-y-auto px-5 py-6 pb-28 scrollbar-hide flex flex-col">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-yellow-500/20 p-2 rounded-xl">
          <Trophy className="w-6 h-6 text-yellow-400" />
        </div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Leaderboards</h1>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-3 gap-2 mb-8 bg-zinc-900/60 p-1 rounded-2xl border border-white/5">
        <button className="py-2 text-sm font-bold bg-[#35D07F]/20 text-[#35D07F] rounded-xl">All Time</button>
        <button className="py-2 text-sm font-bold text-zinc-500 hover:text-white transition">Weekly</button>
        <button className="py-2 text-sm font-bold text-zinc-500 hover:text-white transition">Daily</button>
      </div>

      {/* Top 3 Podium */}
      <div className="flex justify-center items-end gap-3 mb-10 mt-4 px-2">
        {/* 2nd Place */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="flex flex-col items-center">
          <div className="relative mb-2">
            <img src={MOCK_LEADERS[1].avatarUrl} alt="2nd" className="w-14 h-14 bg-zinc-800 rounded-full border-2 border-slate-300" />
            <div className="absolute -bottom-2 lg:-bottom-3 left-1/2 -translate-x-1/2 bg-slate-300 text-slate-900 text-[10px] px-1.5 font-bold rounded-full">2nd</div>
          </div>
          <div className="h-20 w-16 bg-gradient-to-t from-slate-400/20 to-slate-400/5 rounded-t-lg border-t border-slate-400/30 flex flex-col items-center justify-end pb-2">
            <span className="text-xs font-bold text-white">{MOCK_LEADERS[1].xp}</span>
          </div>
        </motion.div>

        {/* 1st Place */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0 }} className="flex flex-col items-center">
          <div className="relative mb-2">
            <Crown className="w-6 h-6 text-yellow-400 absolute -top-5 left-1/2 -translate-x-1/2" />
            <img src={MOCK_LEADERS[0].avatarUrl} alt="1st" className="w-16 h-16 bg-zinc-800 rounded-full border-2 border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.5)]" />
            <div className="absolute -bottom-2 lg:-bottom-3 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-950 text-[10px] px-1.5 font-bold rounded-full">1st</div>
          </div>
          <div className="h-28 w-16 bg-gradient-to-t from-yellow-400/20 to-yellow-400/5 rounded-t-lg border-t border-yellow-400/30 flex flex-col items-center justify-end pb-2">
            <span className="text-xs font-bold text-white">{MOCK_LEADERS[0].xp}</span>
          </div>
        </motion.div>

        {/* 3rd Place */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="flex flex-col items-center">
          <div className="relative mb-2">
            <img src={MOCK_LEADERS[2].avatarUrl} alt="3rd" className="w-14 h-14 bg-zinc-800 rounded-full border-2 border-orange-400" />
            <div className="absolute -bottom-2 lg:-bottom-3 left-1/2 -translate-x-1/2 bg-orange-400 text-orange-950 text-[10px] px-1.5 font-bold rounded-full">3rd</div>
          </div>
          <div className="h-16 w-16 bg-gradient-to-t from-orange-400/20 to-orange-400/5 rounded-t-lg border-t border-orange-400/30 flex flex-col items-center justify-end pb-2">
            <span className="text-xs font-bold text-white">{MOCK_LEADERS[2].xp}</span>
          </div>
        </motion.div>
      </div>

      {/* Remaining List */}
      <div className="space-y-3">
        {MOCK_LEADERS.slice(3).map((leader, index) => (
          <div key={leader.id} className="bg-zinc-900/60 p-3 rounded-2xl border border-white/5 flex items-center gap-3">
            <span className="text-sm font-bold text-zinc-500 w-4 text-center">{index + 4}</span>
            <img src={leader.avatarUrl} alt={leader.name} className="w-10 h-10 bg-zinc-800 rounded-full" />
            <div className="flex-1">
              <p className="text-sm font-bold text-white">{leader.name}</p>
              <p className="text-[10px] text-zinc-400 font-medium">{leader.address}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-black text-[#35D07F]">{leader.xp} XP</p>
              <p className="text-[10px] text-zinc-500">{leader.winRate}% WR</p>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
