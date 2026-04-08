"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { keccak256, stringToHex, parseUnits } from "viem";
import WalletConnect from "@/components/WalletConnect";
import { getSocket } from "@/lib/socket";
import { TRIVIA_STAKE_ADDRESS, CUSD_ADDRESS, TRIVIA_STAKE_ABI, ERC20_ABI } from "@/lib/contract";
import { Swords, Users, Loader2, Smile, Flame, Trophy, Bot, Play, Sparkles } from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useUserStore } from "@/lib/store";
import Link from "next/link";

export default function Home() {
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const { xp, level, winStreak } = useUserStore();
  
  // State
  const [roomCode, setRoomCode] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [pendingRoomId, setPendingRoomId] = useState<string | null>(null);
  const [statusText, setStatusText] = useState("");
  const [showSplash, setShowSplash] = useState(true);

  // Splash Screen Timer
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2800);
    return () => clearTimeout(timer);
  }, []);

  // Blockchain Hooks
  const { writeContractAsync: writeERC20 } = useWriteContract();
  const { writeContractAsync: writeTriviaStake } = useWriteContract();

  // Socket setup
  useEffect(() => {
    const socket = getSocket();
    if (!socket.connected) socket.connect();

    socket.on('room_created', async ({ roomId }) => {
      setPendingRoomId(roomId);
      await executeCreateStakeTransaction(roomId);
    });

    socket.on('player_joined', ({ roomId }) => {
      // Both are ready!
      router.push(`/game?room=${roomId}&host=false`);
    });

    socket.on('error', (err) => {
      alert(err.message);
      setIsJoining(false);
    });

    return () => {
      socket.off('room_created');
      socket.off('player_joined');
      socket.off('error');
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const executeCreateStakeTransaction = async (roomId: string) => {
    try {
      setStatusText("Approving cUSD...");
      
      // 1. Approve cUSD
      const approveAmount = parseUnits("0.05", 18);
      const approveTx = await writeERC20({
        address: CUSD_ADDRESS as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [TRIVIA_STAKE_ADDRESS as `0x${string}`, approveAmount],
      });
      
      setStatusText("Creating Match on-chain...");
      
      // 2. Create Match
      const matchIdBytes = keccak256(stringToHex(roomId));
      await writeTriviaStake({
        address: TRIVIA_STAKE_ADDRESS as `0x${string}`,
        abi: TRIVIA_STAKE_ABI,
        functionName: 'createMatch',
        args: [matchIdBytes],
      });

      // Navigate to game lobby as host
      router.push(`/game?room=${roomId}&host=true`);

    } catch (err) {
      console.error(err);
      alert("Transaction failed. Make sure you have enough cUSD and CELO for gas.");
      setIsCreating(false);
      setPendingRoomId(null);
    }
  };

  const handleCreateMatch = () => {
    if (!isConnected || !address) return;
    setIsCreating(true);
    setStatusText("Generating room...");
    getSocket().emit('create_room', { walletAddress: address });
  };

  const handleJoinMatch = async () => {
    if (!isConnected || !address || !roomCode || roomCode.length !== 6) return;
    setIsJoining(true);
    
    try {
      setStatusText("Approving cUSD...");
      
      const approveAmount = parseUnits("0.05", 18);
      await writeERC20({
        address: CUSD_ADDRESS as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [TRIVIA_STAKE_ADDRESS as `0x${string}`, approveAmount],
      });
      
      setStatusText("Joining Match on-chain...");
      
      const matchIdBytes = keccak256(stringToHex(roomCode.toUpperCase()));
      await writeTriviaStake({
        address: TRIVIA_STAKE_ADDRESS as `0x${string}`,
        abi: TRIVIA_STAKE_ABI,
        functionName: 'joinMatch',
        args: [matchIdBytes],
      });

      // Alert backend to join room and start game
      getSocket().emit('join_room', { roomId: roomCode.toUpperCase(), walletAddress: address });

    } catch (err) {
      console.error(err);
      alert("Transaction failed or match is full/not exist.");
      setIsJoining(false);
    }
  };

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
            <motion.div
              initial={{ scale: 0.5, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8, type: "spring" }}
            >
              <div className="w-40 h-40 rounded-full flex items-center justify-center overflow-hidden bg-black/40 backdrop-blur-sm border border-white/5 shadow-[0_0_50px_rgba(52,211,153,0.15)] mb-8">
                <Image
                  src="/logo_v2.png"
                  alt="BrainStake Logo"
                  width={160}
                  height={160}
                  className="mix-blend-screen scale-110"
                />
              </div>
            </motion.div>
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

      {!showSplash && (
        <motion.main 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="flex-1 overflow-y-auto px-5 py-6 pb-28 scrollbar-hide flex flex-col"
        >
          {/* Top Bar with XP and Streak */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2 bg-zinc-900/80 px-3 py-1.5 rounded-full border border-white/5">
              <div className="bg-[#35D07F]/20 p-1 rounded-full">
                <Sparkles className="w-3.5 h-3.5 text-[#35D07F]" />
              </div>
              <span className="text-xs font-bold text-white">Lvl {level}</span>
              <span className="text-[10px] text-zinc-400 font-medium">({Math.floor((xp % 1000) / 10)}%)</span>
            </div>
            
            <div className="flex items-center gap-1.5 bg-[#6C5DD3]/10 px-3 py-1.5 rounded-full border border-[#6C5DD3]/20">
              <Flame className="w-3.5 h-3.5 text-[#6C5DD3]" />
              <span className="text-xs font-bold text-[#6C5DD3]">{winStreak} Streak</span>
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
                <div className="w-28 h-28 mx-auto mb-8 relative flex items-center justify-center rounded-full overflow-hidden bg-black/20">
                   <div className="absolute inset-0 bg-emerald-500/10 blur-2xl rounded-full animate-pulse" />
                   <Image src="/logo_v2.png" alt="BrainStake Logo" width={120} height={120} className="relative z-10 mix-blend-screen" />
                </div>
                <h2 className="text-3xl font-black text-white mb-3 tracking-tight">Level Up Your Knowledge</h2>
                <p className="text-sm text-zinc-400 mb-8 max-w-[240px] mx-auto font-medium leading-relaxed">
                  Connect your MiniPay wallet to compete, stake, and earn real rewards.
                </p>
                <WalletConnect />
              </motion.div>
            </div>
          ) : (
            <div className="mb-8">
              <div className="bg-[#35D07F]/10 px-5 py-6 rounded-[24px] border border-[#35D07F]/20 relative overflow-hidden flex flex-col items-center">
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#35D07F] opacity-10 blur-3xl rounded-full" />
                <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-[#6C5DD3] opacity-20 blur-2xl rounded-full" />
                
                <p className="text-xs font-bold text-[#35D07F] uppercase tracking-widest mb-1 z-10">Staking Balance</p>
                <div className="text-4xl font-black text-white z-10 flex items-center gap-2">
                  0.05 <span className="text-lg text-zinc-400">cUSD</span>
                </div>
                <div className="mt-6 w-full flex gap-3 z-10">
                  <button
                    onClick={handleCreateMatch}
                    disabled={isCreating}
                    className="flex-1 bg-[#35D07F] hover:bg-[#35D07F]/90 text-black font-extrabold py-3.5 rounded-2xl shadow-[0_4px_16px_rgba(53,208,127,0.3)] transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isCreating ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Swords className="w-5 h-5" /> Host Match</>}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Quick Join / Room Code */}
          {isConnected && (
            <div className="flex gap-2 mb-8 bg-zinc-900/40 p-2 rounded-2xl border border-white/5">
               <input 
                 type="text" 
                 placeholder="Enter Room Code" 
                 value={roomCode}
                 onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                 disabled={isJoining || isCreating}
                 maxLength={6}
                 className="flex-1 bg-transparent border-none px-4 text-white font-bold placeholder-zinc-600 focus:outline-none uppercase tracking-widest text-sm"
               />
               <button 
                 onClick={handleJoinMatch}
                 disabled={isJoining || isCreating || roomCode.length !== 6}
                 className="px-6 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold transition-all active:scale-95 disabled:opacity-50"
               >
                 {isJoining ? <Loader2 className="animate-spin w-4 h-4" /> : "Join"}
               </button>
            </div>
          )}

          {/* 3 Main Action Buttons */}
          <div className="grid grid-cols-2 gap-3 mb-8">
            <Link href="/train" className="col-span-2 group relative overflow-hidden bg-zinc-900/80 p-4 rounded-2xl border border-white/5 hover:border-white/10 transition-colors flex items-center gap-4">
              <div className="bg-indigo-500/20 p-3 rounded-xl group-hover:scale-110 transition-transform">
                <Play className="w-6 h-6 text-indigo-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-white font-bold text-sm">Train Free</h3>
                <p className="text-zinc-400 text-xs mt-0.5">Earn XP without staking</p>
              </div>
            </Link>

            <Link href="/bot" className="group relative overflow-hidden bg-zinc-900/80 p-4 rounded-2xl border border-white/5 hover:border-white/10 transition-colors flex flex-col items-center justify-center text-center gap-2">
              <div className="bg-orange-500/20 p-2.5 rounded-xl group-hover:scale-110 transition-transform">
                <Bot className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <h3 className="text-white font-bold text-sm">Play Bot</h3>
                <p className="text-zinc-500 text-[10px] mt-0.5">Solo practice</p>
              </div>
            </Link>

            <Link href="/leaderboard" className="group relative overflow-hidden bg-zinc-900/80 p-4 rounded-2xl border border-white/5 hover:border-white/10 transition-colors flex flex-col items-center justify-center text-center gap-2">
              <div className="bg-yellow-500/20 p-2.5 rounded-xl group-hover:scale-110 transition-transform">
                <Trophy className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <h3 className="text-white font-bold text-sm">Rankings</h3>
                <p className="text-zinc-500 text-[10px] mt-0.5">Top earners</p>
              </div>
            </Link>
          </div>
          
        </motion.main>
      )}
    </>
  );
}
