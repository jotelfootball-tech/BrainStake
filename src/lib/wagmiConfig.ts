import { createConfig, http, createStorage } from 'wagmi';
import { celo, celoAlfajores } from 'wagmi/chains';
import { injected, coinbaseWallet, walletConnect } from 'wagmi/connectors';

export const config = createConfig({
  chains: [celoAlfajores, celo],
  multiInjectedProviderDiscovery: false,
  connectors: [
    walletConnect({
      projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '8d0f371771159754a9e4c4e84a4d3dd2',
    }),
    injected({
      target: 'coinbaseWallet',
    }),
    injected({
      target: 'metaMask',
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
