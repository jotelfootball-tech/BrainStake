import { createConfig, http, createStorage } from 'wagmi';
import { celo, celoAlfajores } from 'wagmi/chains';
import { injected, coinbaseWallet } from 'wagmi/connectors';

export const config = createConfig({
  chains: [celoAlfajores, celo],
  multiInjectedProviderDiscovery: false,
  connectors: [
    injected(), // Added generic injected connector for MiniPay/Mobile Wallets
    injected({
      target: 'metaMask',
    }),
    injected({
      target: 'coinbaseWallet',
    }),
    coinbaseWallet({
      projectId: 'brainstake',
      appName: 'BrainStake',
    }),
  ],
  storage: typeof window !== 'undefined' ? createStorage({
    storage: window.localStorage,
  }) : undefined,
  transports: {
    [celoAlfajores.id]: http(process.env.NEXT_PUBLIC_CELO_RPC_URL || 'https://alfajores-forno.celo-testnet.org'),
    [celo.id]: http(),
  },
});
