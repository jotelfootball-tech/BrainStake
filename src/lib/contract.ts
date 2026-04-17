export const TRIVIA_STAKE_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0xF34d1C20e62DE0d72E7a4828A70F17b3AFDCfA8E";

// Mainnet addresses
export const CUSD_ADDRESS = "0x765DE816845861e75A25fCA122bb6898B8B1282a";
export const USDC_ADDRESS = "0xcebA9300f2b948710d2653dD7B07f33A8B32118C";

// Alfajores addresses
export const ALFAJORES_CUSD_ADDRESS = "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1";

export const getCUSDAddress = (chainId?: number) => {
  if (chainId === 44787) return ALFAJORES_CUSD_ADDRESS;
  return CUSD_ADDRESS;
};

export const TRIVIA_STAKE_ABI = [
  {
    "inputs": [
      { "internalType": "bytes32", "name": "matchId", "type": "bytes32" },
      { "internalType": "address", "name": "token", "type": "address" }
    ],
    "name": "createMatch",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "bytes32", "name": "matchId", "type": "bytes32" }
    ],
    "name": "joinMatch",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "bytes32", "name": "matchId", "type": "bytes32" }
    ],
    "name": "refund",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "token", "type": "address" }
    ],
    "name": "claimReward",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "token", "type": "address" }
    ],
    "name": "fundHousePool",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "", "type": "address" }
    ],
    "name": "housePool",
    "outputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

export const ERC20_ABI = [
  {
    "inputs": [
      { "internalType": "address", "name": "spender", "type": "address" },
      { "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "approve",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "account", "type": "address" }
    ],
    "name": "balanceOf",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  }
];
