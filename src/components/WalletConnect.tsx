"use client";

import { useAccount, useConnect, useDisconnect, useReadContract, Connector } from 'wagmi';
import { formatUnits } from 'viem';
import { CUSD_ADDRESS, ERC20_ABI } from '@/lib/contract';
import { Wallet, LogOut, X, ExternalLink, AlertCircle, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MetaMaskIcon, PhantomIcon, MiniPayIcon } from './WalletIcons';

export default function WalletConnect() {
  const { address, isConnected, connector } = useAccount();
  const { connectors, connect, error: connectError, status: connectStatus } = useConnect();
  const { disconnect } = useDisconnect();
  const [mounted, setMounted] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const { data: balanceData } = useReadContract({
    address: CUSD_ADDRESS as `0x${string}`,
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

  const getWalletIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('metamask')) return <MetaMaskIcon className="w-10 h-10" />;
    if (n.includes('phantom') || n.includes('solana')) return <PhantomIcon className="w-10 h-10" />;
    if (n.includes('minipay') || n.includes('rabbit') || n.includes('opera') || n.includes('coinbase') || n.includes('wallet')) return <MiniPayIcon className="w-10 h-10" />;
    return <Wallet className="w-10 h-10 text-zinc-400" />;
  };

  const formatWalletName = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('metamask')) return 'MetaMask';
    if (n.includes('phantom') || n.includes('solana')) return 'Phantom';
    if (n.includes('minipay')) return 'MiniPay';
    if (n.includes('rabbit')) return 'Rabbit';
    if (n.includes('coinbase')) return 'Coinbase Wallet';
    return name;
  };

  const currentWalletName = formatWalletName(connector?.name || '');

  if (!mounted) return null;

  const handleConnect = (c: Connector) => {
    connect({ connector: c });
    setShowModal(false);
  };

  const availableWallets = connectors.map((c) => ({
    name: formatWalletName(c.name),
    icon: getWalletIcon(c.name),
    connector: c
  }));

  if (isConnected && address) {
    const formattedBalance = balanceData ? Number(formatUnits(balanceData as bigint, 18)).toFixed(2) : "0.00";
    const walletIcon = getWalletIcon(connector?.name || '');
    
    return (
      <div className="w-full bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 rounded-3xl p-1 border border-white/10 shadow-2xl">
        <div className="bg-gradient-to-r from-black/40 to-black/20 rounded-[22px] p-5 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#35D07F]/30 to-[#35D07F]/10 border border-[#35D07F]/30 flex items-center justify-center shadow-lg shadow-[#35D07F]/20">
                  {walletIcon}
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#35D07F] rounded-full border-2 border-zinc-900 flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full" />
                </div>
              </div>
              <div>
                <p className="text-xs text-zinc-400 font-medium">Connected with</p>
                <p className="font-bold text-white text-lg">{currentWalletName}</p>
                <p className="font-mono text-zinc-500 text-sm">{address.slice(0, 6)}...{address.slice(-4)}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="px-5 py-3 bg-zinc-900/60 rounded-2xl border border-white/10">
                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-1">Balance</p>
                <p className="font-black text-[#35D07F] text-xl">{formattedBalance} <span className="text-sm font-bold">cUSD</span></p>
              </div>
              <button 
                onClick={() => disconnect()}
                className="p-3.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-2xl transition-all active:scale-95 group"
              >
                <LogOut className="w-5 h-5 text-rose-500" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const onSmartConnect = () => {
    // Look for an injected connector that is available
    const injectedConnector = connectors.find(c => c.id === 'injected');
    
    // If we're in a wallet browser (MetaMask, MiniPay, etc.), the injected connector 
    // is usually the one we want. We'll attempt direct connection if found.
    if (injectedConnector) {
      handleConnect(injectedConnector);
    } else {
      // Fallback to modal if no direct injected connector found
      setShowModal(true);
    }
  };

  return (
    <>
      <button
        onClick={onSmartConnect}
        className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-[#35D07F] to-[#2bb36f] p-[2px]"
      >
        <div className="relative w-full py-4 bg-gradient-to-r from-[#35D07F] to-[#2bb36f] rounded-[14px] transition-all group-hover:opacity-90 flex justify-center items-center gap-3">
          <div className="w-10 h-10 bg-black/20 rounded-xl flex items-center justify-center">
            <Wallet className="w-5 h-5 text-black" />
          </div>
          <span className="text-black font-extrabold text-lg">Connect Wallet</span>
        </div>
      </button>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-xl"
            />

            <motion.div
              initial={{ y: "100%", opacity: 0, scale: 0.9 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: "100%", opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-md bg-[#0a0a0f] border border-white/10 rounded-[32px] overflow-hidden shadow-2xl z-10"
            >
              <div className="p-6 pb-0">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 rounded-full bg-[#35D07F]" />
                      <span className="text-[#35D07F] text-xs font-bold uppercase tracking-wider">Connect</span>
                    </div>
                    <h3 className="text-2xl font-black text-white">Choose Wallet</h3>
                    <p className="text-zinc-500 text-sm mt-1">Select a wallet to connect to BrainStake</p>
                  </div>
                  <button 
                    onClick={() => setShowModal(false)}
                    className="p-2.5 bg-zinc-800/80 hover:bg-zinc-700 rounded-xl text-zinc-400 hover:text-white transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6 pt-2">
                <div className="space-y-2 mb-6">
                  {availableWallets.length > 0 ? (
                    availableWallets.map((wallet, index) => (
                      <motion.button
                        key={wallet.name}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => handleConnect(wallet.connector!)}
                        className="w-full flex items-center justify-between p-4 bg-zinc-900/40 hover:bg-zinc-800/80 rounded-2xl border border-white/5 hover:border-[#35D07F]/40 transition-all group relative overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-[#35D07F]/0 to-[#35D07F]/0 group-hover:from-[#35D07F]/5 group-hover:to-transparent transition-all" />
                        <div className="flex items-center gap-4 relative z-10">
                          <div className="w-12 h-12 bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-xl flex items-center justify-center border border-white/5">
                            {wallet.icon}
                          </div>
                          <div className="text-left">
                            <span className="block font-bold text-white text-base">{wallet.name}</span>
                            <span className="text-xs text-zinc-500">Click to connect</span>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-zinc-600 group-hover:text-[#35D07F] group-hover:translate-x-1 transition-all" />
                      </motion.button>
                    ))
                  ) : (
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 text-center">
                      <div className="w-14 h-14 mx-auto mb-4 bg-amber-500/10 rounded-full flex items-center justify-center">
                        <AlertCircle className="w-7 h-7 text-amber-500" />
                      </div>
                      <p className="text-white font-bold mb-1">No Wallet Found</p>
                      <p className="text-zinc-500 text-sm">Please open this page in MiniPay browser or install MetaMask to continue</p>
                    </div>
                  )}
                </div>

                {connectError && (
                  <div className="mb-4 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl">
                    <p className="text-rose-400 text-sm font-medium">{connectError.message.includes('User rejected') ? 'Connection rejected. Please try again.' : 'Failed to connect. Please try again.'}</p>
                  </div>
                )}

                <p className="text-[11px] text-center text-zinc-600 px-4">
                  By connecting your wallet, you agree to our Terms of Service
                </p>
              </div>
              
              <div className="h-2 bg-gradient-to-r from-[#35D07F]/0 via-[#35D07F]/40 to-[#35D07F]/0" />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}