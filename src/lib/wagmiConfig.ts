import { createConfig, http, createStorage } from 'wagmi';
import { celo, celoAlfajores } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';

export const config = createConfig({
  chains: [celoAlfajores, celo],
  connectors: [
    injected(),
  ],
  storage: typeof window !== 'undefined' ? createStorage({
    storage: window.localStorage,
  }) : undefined,
  transports: {
    [celoAlfajores.id]: http(process.env.NEXT_PUBLIC_CELO_RPC_URL || 'https://alfajores-forno.celo-testnet.org'),
    [celo.id]: http(),
  },
});
