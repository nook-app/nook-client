export enum Chain {
  ETHEREUM = 'ethereum',
  SOLANA = 'solana',
  OPTIMISM = 'optimism',
  BASE = 'base',
  PGN = 'pgn',
  ZORA = 'zora',
  SEPOLIA = 'sepolia',
  OPTIMISM_SEPOLIA = 'optimismSepolia',
  BASE_SEPOLIA = 'baseSepolia',
  PGN_SEPOLIA = 'pgnSepolia',
  ZORA_SEPOLIA = 'zoraSepolia',
}

type ChainData = { id: string; chainId: number; name: string; icon: string }

export const CHAIN_DATA: Record<Chain, ChainData> = {
  [Chain.ETHEREUM]: {
    id: 'ethereum',
    chainId: 1,
    name: 'Ethereum',
    icon: require('@/assets/chains/ethereum.svg'),
  },
  [Chain.SOLANA]: {
    id: 'solana',
    chainId: 0,
    name: 'Solana',
    icon: require('@/assets/chains/solana.svg'),
  },
  [Chain.OPTIMISM]: {
    id: 'optimism',
    chainId: 10,
    name: 'Optimism',
    icon: require('@/assets/chains/optimism.svg'),
  },
  [Chain.BASE]: {
    id: 'base',
    chainId: 8453,
    name: 'Base',
    icon: require('@/assets/chains/base.svg'),
  },
  [Chain.PGN]: {
    id: 'pgn',
    chainId: 424,
    name: 'PGN',
    icon: require('@/assets/chains/pgn.svg'),
  },
  [Chain.ZORA]: {
    id: 'zora',
    chainId: 7777777,
    name: 'Zora',
    icon: require('@/assets/chains/zora.svg'),
  },
  [Chain.SEPOLIA]: {
    id: 'sepolia',
    chainId: 11155111,
    name: 'Sepolia',
    icon: require('@/assets/chains/ethereum.svg'),
  },
  [Chain.OPTIMISM_SEPOLIA]: {
    id: 'optimismSepolia',
    chainId: 11155420,
    name: 'Optimism Sepolia',
    icon: require('@/assets/chains/optimism.svg'),
  },
  [Chain.BASE_SEPOLIA]: {
    id: 'baseSepolia',
    chainId: 84532,
    name: 'Base Sepolia',
    icon: require('@/assets/chains/base.svg'),
  },
  [Chain.PGN_SEPOLIA]: {
    id: 'pgnSepolia',
    chainId: 58008,
    name: 'PGN Sepolia',
    icon: require('@/assets/chains/pgn.svg'),
  },
  [Chain.ZORA_SEPOLIA]: {
    id: 'zoraSepolia',
    chainId: 999999999,
    name: 'Zora Sepolia',
    icon: require('@/assets/chains/zora.svg'),
  },
}

export const CHAIN_BY_ID: Record<number, ChainData> = Object.values(CHAIN_DATA).reduce(
  (acc, value) => {
    acc[value.chainId] = value
    return acc
  },
  {} as Record<number, ChainData>
)
