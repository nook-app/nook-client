export type Chain = {
  chainId: number;
  id: string;
  crossChainId: string;
  name: string;

  simplehashId?: string;
  simplehashFungibles?: boolean;

  reservoirId?: string;
  zerionId?: string;
};

type SimpleHashChain = Chain & {
  simplehashId: string;
};

export const CHAINS: Record<string, Chain> = {
  "eip155:1": {
    chainId: 1,
    crossChainId: "eip155:1",
    id: "ethereum",
    simplehashId: "ethereum",
    reservoirId: "",
    zerionId: "ethereum",
    name: "Ethereum",
  },
  "eip155:10": {
    chainId: 10,
    crossChainId: "eip155:10",
    id: "optimism",
    simplehashId: "optimism",
    simplehashFungibles: true,
    reservoirId: "optimism",
    zerionId: "optimism",
    name: "Optimism",
  },
  "eip155:56": {
    chainId: 56,
    crossChainId: "eip155:56",
    id: "binance-smart-chain",
    reservoirId: "bsc",
    zerionId: "binance-smart-chain",
    name: "Binance",
  },
  "eip155:100": {
    chainId: 100,
    crossChainId: "eip155:1000",
    id: "gnosis",
    zerionId: "xdai",
    name: "Gnosis",
  },
  "eip155:137": {
    chainId: 137,
    crossChainId: "eip155:137",
    id: "polygon",
    reservoirId: "polygon",
    zerionId: "polygon",
    name: "Polygon",
  },
  "eip155:250": {
    chainId: 250,
    crossChainId: "eip155:250",
    id: "fantom",
    zerionId: "fantom",
    name: "Fantom",
  },
  "eip155:252": {
    chainId: 252,
    crossChainId: "eip155:252",
    id: "fraxtal",
    name: "Fraxtal",
  },
  "eip155:291": {
    chainId: 291,
    crossChainId: "eip155:291",
    id: "orderly",
    name: "Orderly",
  },
  "eip155:324": {
    chainId: 324,
    crossChainId: "eip155:324",
    id: "zksync-era",
    reservoirId: "zksync",
    zerionId: "zksync-era",
    name: "ZkSync Era",
  },
  "eip155:424": {
    chainId: 424,
    crossChainId: "eip155:424",
    id: "pgn",
    name: "PGN",
  },
  "eip155:4653": {
    chainId: 4653,
    crossChainId: "eip155:4653",
    id: "gold",
    name: "Gold",
  },
  "eip155:5101": {
    chainId: 5101,
    crossChainId: "eip155:5101",
    id: "frame",
    name: "Frame",
  },
  "eip155:8453": {
    chainId: 8453,
    crossChainId: "eip155:8453",
    simplehashId: "base",
    simplehashFungibles: true,
    id: "base",
    reservoirId: "base",
    zerionId: "base",
    name: "Base",
  },
  "eip155:34443": {
    chainId: 34443,
    crossChainId: "eip155:34443",
    id: "mode",
    zerionId: "mode",
    name: "Mode",
  },
  "eip155:42161": {
    chainId: 42161,
    crossChainId: "eip155:42161",
    simplehashId: "arbitrum",
    simplehashFungibles: true,
    id: "arbitrum",
    reservoirId: "arbitrum",
    zerionId: "arbitrum",
    name: "Arbitrum",
  },
  "eip155:42220": {
    chainId: 42220,
    crossChainId: "eip155:42220",
    id: "celo",
    zerionId: "celo",
    name: "Celo",
  },
  "eip155:43114": {
    chainId: 43114,
    crossChainId: "eip155:43114",
    id: "avalanche",
    zerionId: "avalanche",
    name: "Avalanche",
  },
  "eip155:59144": {
    chainId: 59144,
    crossChainId: "eip155:59144",
    id: "linea",
    reservoirId: "linea",
    zerionId: "linea",
    name: "Linea",
  },
  "eip155:78225": {
    chainId: 78225,
    crossChainId: "eip155:78225",
    id: "stack",
    name: "Stack",
  },
  "eip155:81457": {
    chainId: 81457,
    crossChainId: "eip155:81457",
    simplehashId: "blast",
    simplehashFungibles: true,
    id: "blast",
    reservoirId: "blast",
    zerionId: "blast",
    name: "Blast",
  },
  "eip155:534352": {
    chainId: 534352,
    crossChainId: "eip155:534352",
    id: "scroll",
    reservoirId: "scroll",
    zerionId: "scroll",
    name: "Scroll",
  },
  "eip155:7777777": {
    chainId: 7777777,
    crossChainId: "eip155:7777777",
    simplehashId: "zora",
    simplehashFungibles: true,
    id: "zora",
    reservoirId: "zora",
    zerionId: "zora",
    name: "Zora",
  },
  "eip155:666666666": {
    chainId: 666666666,
    crossChainId: "eip155:666666666",
    simplehashId: "degen",
    id: "degen",
    reservoirId: "degen",
    zerionId: "degen",
    name: "Degen",
  },
};

export const CHAINS_BY_NAME = Object.values(CHAINS).reduce(
  (acc, chain) => {
    acc[chain.id] = chain;
    return acc;
  },
  {} as Record<string, Chain>,
);

export const SIMPLEHASH_CHAINS: SimpleHashChain[] = Object.values(
  CHAINS,
).filter((c) => c.simplehashId) as SimpleHashChain[];
