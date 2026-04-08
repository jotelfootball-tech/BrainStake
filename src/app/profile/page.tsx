"use client";

import { useUserStore } from "@/lib/store";
import { useAccount } from "wagmi";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Medal, Flame, ShieldCheck, Trophy, Copy, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function ProfilePage() {
  const { address, isConnected } = useAccount();
  const { xp, level, winStreak, maxWinStreak, gamesPlayed, wins, matchHistory } = useUserStore();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const winRate = gamesPlayed > 0 ? Math.round((wins / gamesPlayed) * 100) : 0;
  
  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
    }
  };

  if (!mounted) return null;

  return (
    <main className="flex-1 overflow-y-auto px-5 py-6 pb-28 scrollbar-hide flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <Link href="/" className="bg-zinc-900 overflow-hidden w-10 h-10 rounded-full flex items-center justify-center hover:bg-zinc-800 transition">
          <ArrowLeft className="w-5 h-5 text-zinc-400" />
        </Link>
        <button className="bg-zinc-900 w-10 h-10 rounded-full flex items-center justify-center hover:bg-zinc-800 transition text-zinc-400">
           {/* More options placeholder */}
           <div className="flex gap-0.5">
             <div className="w-1 h-1 rounded-full bg-current" />
             <div className="w-1 h-1 rounded-full bg-current" />
             <div className="w-1 h-1 rounded-full bg-current" />
           </div>
        </button>
      </div>

      {/* Profile Header (Bio Style) */}
      <div className="flex flex-col items-center text-center mt-4 mb-8">
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-[#35D07F]/20 blur-3xl rounded-full scale-150 animate-pulse" />
          <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-tr from-[#35D07F] via-white/20 to-[#6C5DD3] relative z-10 shadow-[0_0_40px_rgba(53,208,127,0.2)]">
            <div className="w-full h-full bg-[#12121a] rounded-full flex items-center justify-center overflow-hidden border-4 border-zinc-950">
              <img 
                src={`https://api.dicebear.com/9.x/bottts/svg?seed=${address || 'guest'}&baseColor=35D07F`} 
                alt="Player Avatar" 
                className="w-full h-full object-cover p-2"
              />
            </div>
          </div>
          <div className="absolute -bottom-1 -right-1 bg-[#35D07F] text-black w-8 h-8 rounded-full border-4 border-zinc-950 flex items-center justify-center text-[10px] font-black z-20">
            L{level}
          </div>
        </div>

        <h1 className="text-3xl font-black text-white mb-2 tracking-tight">
          {isConnected && address ? `${address.slice(0,6)}...${address.slice(-4)}` : "Guest Player"}
        </h1>
        <div className="flex items-center justify-center gap-2 text-zinc-400 text-sm font-medium">
           <Medal className="w-4 h-4 text-emerald-400" />
           <span>{xp.toLocaleString()} XP earned this month</span>
        </div>
      </div>

      {/* Action Row */}
      <div className="flex justify-center gap-6 mb-10">
        <button onClick={copyAddress} className="flex flex-col items-center gap-2 group">
          <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center group-hover:bg-[#35D07F]/10 group-hover:border-[#35D07F]/20 transition-all">
            <Copy className="w-5 h-5 text-zinc-400 group-hover:text-[#35D07F]" />
          </div>
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Address</span>
        </button>
        <button className="flex flex-col items-center gap-2 group">
          <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center group-hover:bg-blue-500/10 group-hover:border-blue-500/20 transition-all">
            <Medal className="w-5 h-5 text-zinc-400 group-hover:text-blue-400" />
          </div>
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Ranks</span>
        </button>
        <button className="flex flex-col items-center gap-2 group">
          <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center group-hover:bg-orange-500/10 group-hover:border-orange-500/20 transition-all">
            <Flame className="w-5 h-5 text-zinc-400 group-hover:text-orange-400" />
          </div>
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Streak</span>
        </button>
      </div>

      {/* Info Section */}
      <div className="space-y-4 mb-8">
        <div className="bg-zinc-900/60 p-5 rounded-[24px] border border-white/5 backdrop-blur-sm">
          <p className="text-[10px] font-black text-[#35D07F] uppercase tracking-widest mb-3">About Player</p>
          <div className="space-y-3">
             <div className="flex justify-between items-center pb-3 border-b border-white/5">
                <span className="text-zinc-500 text-sm">Member Since</span>
                <span className="text-white text-sm font-bold">April 2026</span>
             </div>
             <div className="flex justify-between items-center pb-3 border-b border-white/5">
                <span className="text-zinc-500 text-sm">Win Rate</span>
                <span className="text-emerald-400 text-sm font-bold">{winRate}%</span>
             </div>
             <div className="flex justify-between items-center">
                <span className="text-zinc-500 text-sm">Max Streak</span>
                <span className="text-orange-400 text-sm font-bold">{maxWinStreak} wins</span>
             </div>
          </div>
        </div>

        <div className="bg-zinc-900/60 p-5 rounded-[24px] border border-white/5 backdrop-blur-sm">
          <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-4">Detailed Stats</p>
          <div className="grid grid-cols-2 gap-4">
             <div className="bg-zinc-950/50 p-3 rounded-2xl border border-white/5">
                <p className="text-[10px] text-zinc-500 font-bold mb-1">XP PROGRESS</p>
                <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                   <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.floor((xp % 1000) / 10)}%` }} />
                </div>
             </div>
             <div className="bg-zinc-950/50 p-3 rounded-2xl border border-white/5">
                <p className="text-[10px] text-zinc-500 font-bold mb-1">TOTAL GAMES</p>
                <p className="text-lg font-black text-white leading-none">{gamesPlayed}</p>
             </div>
          </div>
        </div>
      </div>

      {/* Match History */}
      <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-4 px-1">Recent Matches</h3>
      <div className="space-y-2">
        {matchHistory.length === 0 ? (
          <div className="text-center py-8 bg-zinc-900/40 rounded-[24px] border border-white/5">
            <p className="text-xs text-zinc-500 font-medium">No matches recorded yet.</p>
          </div>
        ) : (
          matchHistory.slice(0,5).map((match) => (
            <div key={match.id} className="bg-zinc-900/40 p-4 rounded-[24px] border border-white/5 flex items-center justify-between backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${match.result === 'win' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                   {match.result === 'win' ? <Trophy className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5 opacity-50" />}
                </div>
                <div>
                  <p className="text-sm font-bold text-white capitalize">{match.result}</p>
                  <p className="text-[10px] text-zinc-500">{new Date(match.date).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-sm font-black ${match.result === 'win' ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {match.result === 'win' ? '+' : ''}{match.earnedCELO} cUSD
                </p>
                <p className="text-[10px] text-[#35D07F] font-bold">+{match.earnedXP} XP</p>
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  );
}
