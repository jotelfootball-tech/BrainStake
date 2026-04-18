"use client";

import { useConnect } from "wagmi";
import { useEffect, useState } from "react";

const MINIPAY_IDS = [
  "io.coinbase.wallet", // Coinbase Wallet (often used with MiniPay)
  "com.coincash.wallet", // MiniPay
  "com.rabbyio.changeWallet", // Rabby
  "metamask", // MetaMask
  "walletConnect" // WalletConnect
];

export function useMiniPay() {
  const { connectors, connect } = useConnect();
  const [isMiniPayAvailable, setIsMiniPayAvailable] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    // Check if any of the known MiniPay/coinbase wallet connectors are available
    const miniPayConnector = connectors.find((c) => {
      const id = c.id.toLowerCase();
      const name = c.name.toLowerCase();
      return MINIPAY_IDS.some(
        (mid) => id.includes(mid) || name.includes(mid.replace(".", ""))
      );
    });

    setIsMiniPayAvailable(!!miniPayConnector);
  }, [connectors]);

  const connectToMiniPay = async () => {
    setIsConnecting(true);
    try {
      const miniPayConnector = connectors.find((c) => {
        const id = c.id.toLowerCase();
        const name = c.name.toLowerCase();
        return MINIPAY_IDS.some(
          (mid) => id.includes(mid) || name.includes(mid.replace(".", ""))
        );
      });

      if (miniPayConnector) {
        await connect({ connector: miniPayConnector });
      }
    } catch (error) {
      console.error("Failed to connect to MiniPay:", error);
    } finally {
      setIsConnecting(false);
    }
  };

  return {
    isMiniPayAvailable,
    connectToMiniPay,
    isConnecting,
  };
}