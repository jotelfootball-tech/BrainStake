"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAccount, useWriteContract, useReadContract, useBalance, useChainId } from "wagmi";
import { parseUnits, formatUnits, keccak256, toHex } from "viem";
import WalletConnect from "@/components/WalletConnect";
import { getCUSDAddress, TRIVIA_STAKE_ADDRESS, ERC20_ABI, TRIVIA_STAKE_ABI } from "@/lib/contract";
import { Swords, Loader2, Flame, Trophy, Play, Sparkles, AlertTriangle, Zap, Trophy as SportIcon, Cpu, Newspaper, Film, Bot as BotIcon } from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useUserStore } from "@/lib/store";
import Link from "next/link";

const STAKE_AMOUNT = "0.05";
const DAILY_STAKE_AMOUNT = "0.01";
const STAKE_AMOUNT_WEI = parseUnits(STAKE_AMOUNT, 18);
const DAILY_STAKE_WEI = parseUnits(DAILY_STAKE_AMOUNT, 18);

const CATEGORIES = [
  { id: "sports", name: "Sports", icon: SportIcon, color: "text-green-400", bg: "bg-green-500/20" },
  { id: "tech", name: "Tech", icon: Cpu, color: "text-blue-400", bg: "bg-blue-500/20" },
  { id: "general", name: "General", icon: Newspaper, color: "text-yellow-400", bg: "bg-yellow-500/20" },
  { id: "pop", name: "Pop Culture", icon: Film, color: "text-fuchsia-400", bg: "bg-fuchsia-500/20" },
];

export default function Home() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const router = useRouter();
  const { xp, level, winStreak, lastDailyChallenge, completeDailyChallenge } = useUserStore();

  const currentCUSDAddress = getCUSDAddress(chainId);

  // Fetch cUSD Balance
  const { data: balanceData, isLoading: isBalanceLoading } = useReadContract({
    address: currentCUSDAddress as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: [address as `0x${string}`],
    query: { enabled: !!address }
  });

  // Fetch native CELO Balance
  const { data: celoBalance } = useBalance({
    address: address as `0x${string}`,
    query: { enabled: !!address }
  });

  const displayBalance = balanceData ? parseFloat(formatUnits(balanceData as bigint, 18)).toFixed(2) : "0.00";
  const displayCelo = celoBalance ? parseFloat(celoBalance.formatted).toFixed(2) : "0.00";
  
  const [showSplash, setShowSplash] = useState(true);
  const [showStakeModal, setShowStakeModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [isStaking, setIsStaking] = useState(false);
  const [selectedMode, setSelectedMode] = useState<"normal" | "daily">("normal");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [hasProvider, setHasProvider] = useState<boolean>(true);

  useEffect(() => {
    // Check if any wallet provider is injected
    if (typeof window !== 'undefined') {
      const provider = (window as any).ethereum || (window as any).celo;
      setHasProvider(!!provider);
    }
  }, []);

  const { writeContractAsync: writeAsync } = useWriteContract();

  const today = new Date().toISOString().split('T')[0];
  const dailyCompleted = lastDailyChallenge === today;

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2800);
    return () => clearTimeout(timer);
  }, []);

  const handleStakeAndPlay = (mode: "normal" | "daily" = "normal") => {
    if (!isConnected || !address) return;
    
    const balance = parseFloat(displayBalance);
    const required = mode === "daily" ? 0.01 : 0.05;
    
    if (balance < required) {
      alert(`Insufficient cUSD balance. Please get some from the faucet.`);
      return;
    }

    if (mode === "daily" && dailyCompleted) {
      alert("Daily challenge already completed today!");
      return;
    }

    setSelectedMode(mode);
    setShowStakeModal(true);
  };

  const confirmStake = async () => {
    if (!address) return;
    
    // Go to category selection
    setShowStakeModal(false);
    setShowCategoryModal(true);
  };

  const startGame = async () => {
    if (!selectedCategory || !address) return;
    setIsStaking(true);

    try {
      const stakeWei = selectedMode === "daily" ? DAILY_STAKE_WEI : STAKE_AMOUNT_WEI;
      
      // 1. Approve tokens
      setStatusText("Step 1/2: Approving cUSD...");
      await writeAsync({
        address: currentCUSDAddress as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [TRIVIA_STAKE_ADDRESS as `0x${string}`, stakeWei],
      });

      // 2. Create match on contract
      setStatusText("Step 2/2: Confirming Stake...");
      const matchId = keccak256(toHex(`${address}-${Date.now()}`));
      
      await writeAsync({
        address: TRIVIA_STAKE_ADDRESS as `0x${string}`,
        abi: TRIVIA_STAKE_ABI,
        functionName: 'createMatch',
        args: [matchId, currentCUSDAddress as `0x${string}`],
      });

      setStatusText("Preparing game...");
      router.push(`/game?category=${selectedCategory}${selectedMode === 'daily' ? '&mode=daily' : ''}&matchId=${matchId}`);
    } catch (err) {
      console.error("Stake failed:", err);
      alert("Transaction failed or rejected. Please try again.");
      setIsStaking(false);
      setShowCategoryModal(false);
    }
  };

  const [statusText, setStatusText] = useState("");

  return (
    <>
      <AnimatePresence>
        {showSplash && (
          <motion.div
            key="splash"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-950 px-6"
          >
            
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.8 }}
              className="text-5xl font-extrabold tracking-tighter"
            >
              <span className="text-white">Brain</span>
              <span className="text-emerald-400">Stake</span>
            </motion.h1>
            <motion.div
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.8 }}
              className="mt-4 h-1 w-24 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stake Confirmation Modal */}
      <AnimatePresence>
        {showStakeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-6"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-zinc-900 border border-white/10 p-6 rounded-2xl w-full max-w-sm shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-4 text-amber-400">
                <AlertTriangle className="w-6 h-6" />
                <h3 className="text-xl font-bold text-white">Confirm Stake</h3>
              </div>
              
              <p className="text-zinc-400 mb-6">
                You are about to stake <span className="text-white font-bold">{selectedMode === "daily" ? DAILY_STAKE_AMOUNT : STAKE_AMOUNT} cUSD</span> to play this round.
              </p>

              <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl mb-6">
                <p className="text-red-400 text-sm">
                  Warning: This stake is non-refundable.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowStakeModal(false)}
                  disabled={isStaking}
                  className="flex-1 py-3 rounded-xl bg-zinc-800 text-white font-bold hover:bg-zinc-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmStake}
                  disabled={isStaking}
                  className="flex-1 py-3 rounded-xl bg-[#35D07F] text-black font-bold hover:bg-[#35D07F]/90 transition-colors flex items-center justify-center"
                >
                  {isStaking ? <Loader2 className="w-5 h-5 animate-spin" /> : "Next"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Category Selection Modal */}
      <AnimatePresence>
        {showCategoryModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-6"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-zinc-900 border border-white/10 p-6 rounded-2xl w-full max-w-sm shadow-2xl"
            >
              <h3 className="text-xl font-bold text-white mb-4">Select Category</h3>
              <p className="text-zinc-400 text-sm mb-6">Choose a category for this round's questions.</p>

              <div className="grid grid-cols-2 gap-3 mb-6">
                {CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                        isSelected 
                          ? `border-[#35D07F] bg-[#35D07F]/10` 
                          : "border-zinc-700 hover:border-zinc-500 bg-zinc-800"
                      }`}
                    >
                      <Icon className={`w-6 h-6 ${cat.color}`} />
                      <span className={`text-sm font-bold ${isSelected ? "text-white" : "text-zinc-400"}`}>
                        {cat.name}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowCategoryModal(false)}
                  disabled={isStaking}
                  className="flex-1 py-3 rounded-xl bg-zinc-800 text-white font-bold hover:bg-zinc-700 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={startGame}
                  disabled={isStaking || !selectedCategory}
                  className="flex-1 py-3 rounded-xl bg-[#35D07F] text-black font-bold hover:bg-[#35D07F]/90 transition-colors flex items-center justify-center disabled:opacity-50"
                >
                  {isStaking ? <Loader2 className="w-5 h-5 animate-spin" /> : "Start Game"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {!showSplash && (
        <motion.main 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="flex-1 overflow-y-auto px-5 py-6 pb-28 scrollbar-hide flex flex-col"
        >
          {/* Top Bar */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <div className="relative w-8 h-8 rounded-xl overflow-hidden ring-1 ring-white/10">
                <Image
                  src="/brainstake-tech-logo.png"
                  alt="BrainStake logo"
                  fill
                  className="object-cover"
                  sizes="32px"
                  priority
                />
              </div>
              <div className="leading-tight">
                <p className="text-sm font-black tracking-tight text-white">BrainStake</p>
                <p className="text-[10px] uppercase tracking-widest text-zinc-400">Trivia-to-Earn</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 bg-zinc-900/80 px-3 py-1.5 rounded-full border border-white/5">
                <div className="bg-[#35D07F]/20 p-1 rounded-full">
                  <Sparkles className="w-3.5 h-3.5 text-[#35D07F]" />
                </div>
                <span className="text-xs font-bold text-white">Lvl {level}</span>
                <span className="text-[10px] text-zinc-400 font-medium">({Math.floor((xp % 1000) / 10)}%)</span>
              </div>

              <div className="flex items-center gap-1.5 bg-[#6C5DD3]/10 px-3 py-1.5 rounded-full border border-[#6C5DD3]/20">
                <Flame className="w-3.5 h-3.5 text-[#6C5DD3]" />
                <span className="text-xs font-bold text-[#6C5DD3]">{winStreak}</span>
              </div>
            </div>
          </div>

          {/* Hero Connect Card */}
          {!isConnected ? (
            <div className="bg-zinc-900/40 p-8 rounded-[32px] border border-white/5 mb-8 text-center relative overflow-hidden group">
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#35D07F] opacity-10 blur-[80px] rounded-full group-hover:opacity-20 transition-opacity" />
              <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-[#6C5DD3] opacity-10 blur-[80px] rounded-full group-hover:opacity-20 transition-opacity" />
              
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="relative z-10"
              >
                
                <h2 className="text-3xl font-black text-white mb-3 tracking-tight">Level Up Your Knowledge</h2>
                <p className="text-sm text-zinc-400 mb-8 max-w-[240px] mx-auto font-medium leading-relaxed">
                  {hasProvider 
                    ? "Connect your MiniPay wallet to compete, stake, and earn real rewards."
                    : "No wallet detected. Please open BrainStake inside MiniPay or another Web3 wallet browser."}
                </p>
                {hasProvider ? (
                  <WalletConnect />
                ) : (
                  <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl flex items-center gap-3 text-left">
                    <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0" />
                    <p className="text-xs text-amber-200/80 font-medium">
                      Wallet not found. If you're on mobile, try opening this link inside the <span className="text-white font-bold">MiniPay</span> app.
                    </p>
                  </div>
                )}
              </motion.div>
            </div>
          ) : (
            <div className="mb-8 space-y-4">
              {/* Daily Challenge Card */}
              <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 px-5 py-4 rounded-[24px] border border-purple-500/30 relative overflow-hidden">
                <div className="absolute -top-8 -right-8 w-24 h-24 bg-purple-500/20 blur-3xl rounded-full" />
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="bg-purple-500/20 p-2 rounded-xl">
                      <Zap className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-white font-bold text-sm">Daily Challenge</p>
                      <p className="text-purple-300 text-xs">Stake only 0.01 cUSD!</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleStakeAndPlay("daily")}
                    disabled={dailyCompleted}
                    className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                      dailyCompleted 
                        ? "bg-zinc-700 text-zinc-500 cursor-not-allowed" 
                        : "bg-purple-500 hover:bg-purple-400 text-white"
                    }`}
                  >
                    {dailyCompleted ? "Done" : "Play"}
                  </button>
                </div>
              </div>

              {/* Main Stake Card */}
              <div className="bg-[#35D07F]/10 px-5 py-6 rounded-[24px] border border-[#35D07F]/20 relative overflow-hidden flex flex-col items-center">
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#35D07F] opacity-10 blur-3xl rounded-full" />
                <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-[#6C5DD3] opacity-20 blur-2xl rounded-full" />
                
                <p className="text-xs font-bold text-[#35D07F] uppercase tracking-widest mb-1 z-10">Your Balance</p>
                <div className="flex flex-col items-center gap-1 z-10">
                  <div className="text-4xl font-black text-white flex items-center gap-2">
                    {isBalanceLoading ? (
                      <span className="text-zinc-500">...</span>
                    ) : (
                      <>
                        {displayBalance} <span className="text-lg text-zinc-400">cUSD</span>
                      </>
                    )}
                  </div>
                  <div className="bg-white/5 px-3 py-1 rounded-full border border-white/5 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">
                      Native: {displayCelo} CELO
                    </span>
                  </div>
                </div>

                {parseFloat(displayBalance) === 0 && parseFloat(displayCelo) > 0 && (
                  <div className="mt-4 bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl z-10 w-full">
                    <p className="text-[10px] text-amber-200/80 font-medium leading-relaxed flex items-start gap-2">
                      <AlertTriangle className="w-3 h-3 shrink-0 mt-0.5" />
                      <span>
                        You have CELO, but <span className="text-white font-bold">cUSD</span> is required for staking.
                      </span>
                    </p>
                  </div>
                )}

                <div className="mt-6 w-full z-10 space-y-2">
                  <button
                    onClick={() => {
                      router.push('/game?category=sports&mode=free');
                    }}
                    className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3 rounded-xl border border-white/10 transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    <BotIcon className="w-4 h-4" /> Play Free Bot
                  </button>
                  <button
                    onClick={() => handleStakeAndPlay("normal")}
                    className="w-full bg-[#35D07F] hover:bg-[#35D07F]/90 text-black font-extrabold py-3 rounded-xl shadow-[0_4px_16px_rgba(53,208,127,0.3)] transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    <Swords className="w-4 h-4" /> Stake & Play (0.05 cUSD)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Bottom Navigation */}
          <div className="grid grid-cols-2 gap-4 mt-2">
            <Link href="/leaderboard" className="group relative overflow-hidden bg-gradient-to-br from-zinc-900/80 to-zinc-900/40 p-5 rounded-2xl border border-white/5 hover:border-yellow-500/30 hover:bg-yellow-500/10 transition-all flex flex-col items-center justify-center gap-2">
              <div className="bg-yellow-500/20 p-3 rounded-xl group-hover:scale-110 transition-transform">
                <Trophy className="w-6 h-6 text-yellow-400" />
              </div>
              <div className="text-center">
                <h3 className="text-white font-bold text-sm">Leaderboard</h3>
                <p className="text-zinc-500 text-[10px] mt-0.5">Top players</p>
              </div>
            </Link>

            <Link href="/profile" className="group relative overflow-hidden bg-gradient-to-br from-zinc-900/80 to-zinc-900/40 p-5 rounded-2xl border border-white/5 hover:border-blue-500/30 hover:bg-blue-500/10 transition-all flex flex-col items-center justify-center gap-2">
              <div className="bg-blue-500/20 p-3 rounded-xl group-hover:scale-110 transition-transform">
                <Sparkles className="w-6 h-6 text-blue-400" />
              </div>
              <div className="text-center">
                <h3 className="text-white font-bold text-sm">Profile</h3>
                <p className="text-zinc-500 text-[10px] mt-0.5">Stats & history</p>
              </div>
            </Link>
          </div>
        </motion.main>
      )}
    </>
  );
}