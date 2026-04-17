"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Trophy, Frown, Clock, ArrowLeft, ArrowRight, Share2, Sparkles, Wallet } from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useUserStore } from "@/lib/store";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { TRIVIA_STAKE_ADDRESS, getCUSDAddress, TRIVIA_STAKE_ABI } from "@/lib/contract";

function ResultComponent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { recordMatch } = useUserStore();

  const dataRaw = searchParams.get("data");
  const mode = searchParams.get("mode");
  const isFreeMode = mode === "free";

  let resultData = { score: 0, total: 3, avgTime: "0.0", win: false };
  if (dataRaw) {
    try {
      resultData = JSON.parse(decodeURIComponent(dataRaw));
    } catch (e) {
      console.error(e);
    }
  }

  const { score, total, avgTime, win } = resultData;
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const [txHash, setTxHash] = useState<`0x${string}` | null>(null);

  const { writeContractAsync } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ 
    hash: txHash || "0x0000000000000000000000000000000000000000000000000000000000000000" 
  });

  const handleClaim = async () => {
    if (!win || isFreeMode || claimed || claiming) return;
    try {
      setClaiming(true);
      const token = getCUSDAddress();
      const hash = await writeContractAsync({
        address: TRIVIA_STAKE_ADDRESS,
        abi: TRIVIA_STAKE_ABI,
        functionName: "claimReward",
        args: [token],
      });
      setTxHash(hash);
    } catch (e) {
      console.error("Claim failed", e);
      setClaiming(false);
    }
  };

  useEffect(() => {
    if (isSuccess) {
      setClaimed(true);
      setClaiming(false);
    }
  }, [isSuccess]);

  // Record match and fetch AI summary when component mounts
  useEffect(() => {
    if (isFreeMode) return;
    
    const earnedXP = score * 10;
    const earnedCELO = win ? (total === 3 ? 0.05 : 0.03) : 0;
    
    recordMatch(
      {
        opponent: "BrainStake Bot",
        result: win ? "win" : "loss",
        earnedCELO,
        earnedXP,
      },
      score
    );
  }, [isFreeMode]);

  // Fetch AI summary
  useEffect(() => {
    setSummaryLoading(true);
    fetch("/api/summary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        score,
        total,
        avgTime,
        category: searchParams.get("category") || "mixed",
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.summary) setAiSummary(data.summary);
      })
      .catch(console.error)
      .finally(() => setSummaryLoading(false));
  }, [score, total, avgTime]);

  // Record match when component mounts (only for stake mode)
  useEffect(() => {
    if (isFreeMode) return;
    
    const earnedXP = score * 10;
    const earnedCELO = win ? (total === 3 ? 0.05 : 0.03) : 0;
    
    recordMatch(
      {
        opponent: "BrainStake Bot",
        result: win ? "win" : "loss",
        earnedCELO,
        earnedXP,
      },
      score
    );
  }, [isFreeMode]);

  return (
    <div className="flex flex-col h-full w-full justify-center p-6 text-center overflow-y-auto">
      
      {/* Icon Area */}
      <div className="flex justify-center mb-6">
        {win ? (
          <div className="w-24 h-24 rounded-full bg-emerald-500/20 flex items-center justify-center relative">
            <Trophy className="w-12 h-12 text-emerald-400" />
            <div className="absolute inset-0 rounded-full border-4 border-emerald-400 animate-ping opacity-20"></div>
          </div>
        ) : (
          <div className="w-24 h-24 rounded-full bg-rose-500/20 flex items-center justify-center">
            <Frown className="w-12 h-12 text-rose-400" />
          </div>
        )}
      </div>

      {/* Main Status Text */}
      <h1 className={`text-4xl font-extrabold mb-2 tracking-tight ${win ? 'text-emerald-400' : 'text-rose-400'}`}>
        {win ? "You Won!" : "Better Luck Next Time!"}
      </h1>
      
      <p className="text-slate-400 font-medium mb-6 text-lg">
        {win 
          ? isFreeMode 
            ? "Great job! You beat the bot!" 
            : "Congratulations! You won 0.05 cUSD!" 
          : isFreeMode 
            ? "Keep practicing!" 
            : "Stake lost. Keep practicing!"}
      </p>

      {/* AI Summary */}
      {(aiSummary || summaryLoading) && (
        <div className="bg-gradient-to-r from-violet-600/20 to-fuchsia-600/20 rounded-2xl p-4 mb-6 border border-violet-500/30">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-violet-400" />
            <span className="text-xs font-bold text-violet-400 uppercase tracking-widest">AI Insight</span>
          </div>
          <p className="text-white text-sm font-medium">
            {summaryLoading ? (
              <span className="animate-pulse text-slate-400">Generating insight...</span>
            ) : (
              aiSummary
            )}
          </p>
        </div>
      )}

      {/* Claim Reward Button */}
      {win && !isFreeMode && (
        <button
          onClick={handleClaim}
          disabled={claiming || isConfirming || claimed}
          className={`w-full py-4 rounded-2xl font-extrabold transition-all active:scale-[0.98] flex items-center justify-center gap-2 mb-6 ${
            claimed 
              ? "bg-emerald-500 text-black cursor-default"
              : "bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black"
          }`}
        >
          <Wallet className="w-5 h-5" />
          {claiming || isConfirming ? (
            "Collecting..."
          ) : claimed ? (
            "Collected!"
          ) : (
            "Collect Reward (0.05 cUSD)"
          )}
        </button>
      )}

      {/* Score Card */}
      <div className="bg-zinc-900/60 rounded-3xl p-6 border border-white/5 mb-8 backdrop-blur-sm">
        <div className="flex justify-around items-center mb-6">
          <div className="text-center">
            <p className="text-xs text-zinc-500 uppercase font-bold tracking-widest mb-1">Score</p>
            <p className="text-4xl font-black text-white">{score}/{total}</p>
          </div>
          
          <div className="w-px h-12 bg-zinc-700"></div>
          
          <div className="text-center">
            <p className="text-xs text-zinc-500 uppercase font-bold tracking-widest mb-1">Avg Time</p>
            <div className="flex items-center gap-1 justify-center">
              <Clock className="w-5 h-5 text-zinc-400" />
              <p className="text-2xl font-black text-white">{avgTime}s</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          {[1, 2, 3].map((n) => (
            <div 
              key={n} 
              className={`p-3 rounded-xl ${
                n <= score 
                  ? "bg-emerald-500/20 border border-emerald-500/30" 
                  : "bg-zinc-800/50 border border-zinc-700"
              }`}
            >
              <span className={`text-lg font-bold ${n <= score ? "text-emerald-400" : "text-zinc-600"}`}>
                {n <= score ? "✓" : "○"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <button 
          onClick={() => router.push(`/game?category=sports&mode=${mode || 'normal'}`)}
          className="w-full py-4 rounded-2xl bg-[#35D07F] hover:bg-[#35D07F]/90 text-black font-extrabold transition-all active:scale-[0.98] flex items-center justify-center gap-2"
        >
          <ArrowRight className="w-5 h-5" />
          Play Again
        </button>
        
        <Link 
          href="/leaderboard"
          className="w-full py-4 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold transition-all active:scale-[0.98] flex items-center justify-center gap-2 border border-zinc-700"
        >
          <Trophy className="w-5 h-5 text-yellow-400" />
          View Leaderboard
        </Link>
      </div>

    </div>
  );
}

export default function ResultPage() {
  return (
    <Suspense fallback={<div className="flex-1 flex items-center justify-center"><p>Loading Results...</p></div>}>
      <ResultComponent />
    </Suspense>
  );
}