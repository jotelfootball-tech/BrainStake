"use client";

import { useAccount, useConnect, useDisconnect, useReadContract } from 'wagmi';
import { formatUnits } from 'viem';
import { CUSD_ADDRESS, ERC20_ABI } from '@/lib/contract';
import { Wallet, LogOut } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function WalletConnect() {
  const { address, isConnected } = useAccount();
  const { connectors, connect } = useConnect();
  const { disconnect } = useDisconnect();
  const [mounted, setMounted] = useState(false);

  // Read cUSD Balance
  const { data: balanceData } = useReadContract({
    address: CUSD_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: [address as `0x${string}`],
    query: {
      enabled: isConnected && !!address,
    }
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null; // Prevent hydration errors

  if (isConnected && address) {
    const formattedBalance = balanceData ? Number(formatUnits(balanceData as bigint, 18)).toFixed(2) : "0.00";
    
    return (
      <div className="flex items-center justify-between bg-slate-800/50 rounded-2xl p-4 border border-slate-700 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-400 to-cyan-500 flex items-center justify-center shadow-lg">
            <Wallet className="w-5 h-5 text-slate-900" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium tracking-wide">Connected</p>
            <p className="font-semibold text-slate-200">
              {address.slice(0, 6)}...{address.slice(-4)}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs text-slate-400 font-medium">Balance</p>
            <p className="font-bold text-emerald-400">{formattedBalance} cUSD</p>
          </div>
          <button 
            onClick={() => disconnect()}
            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-full transition-colors"
          >
            <LogOut className="w-4 h-4 text-rose-400" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <button
        onClick={() => connect({ connector: connectors[0] })}
        className="w-full py-4 bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-400 hover:to-cyan-500 text-white font-bold rounded-2xl shadow-lg shadow-emerald-500/20 transition-all active:scale-[0.98] flex justify-center items-center gap-2"
      >
        <Wallet className="w-5 h-5" />
        Connect MiniPay
      </button>
      <p className="text-xs text-zinc-500 text-center">
        Make sure MiniPay is installed
      </p>
    </div>
  );
}
