export type Chain = {
  chainId: number;
  id: string;
  crossChainId: string;
  name: string;
  image: string;
};

export const CHAINS: Record<string, Chain> = {
  "eip155:1": {
    chainId: 1,
    crossChainId: "eip155:1",
    id: "ethereum",
    name: "Ethereum",
    image: "/chains/ethereum.svg",
  },
  "eip155:10": {
    chainId: 10,
    crossChainId: "eip155:10",
    id: "optimism",
    name: "Optimism",
    image: "/chains/optimism.svg",
  },
  "eip155:56": {
    chainId: 56,
    crossChainId: "eip155:56",
    id: "binance-smart-chain",
    name: "Binance",
    image: "/chains/binance.svg",
  },
  "eip155:100": {
    chainId: 100,
    crossChainId: "eip155:1000",
    id: "gnosis",
    name: "Gnosis",
    image: "/chains/gnosis.svg",
  },
  "eip155:137": {
    chainId: 137,
    crossChainId: "eip155:137",
    id: "polygon",
    name: "Polygon",
    image: "/chains/polygon.png",
  },
  "eip155:250": {
    chainId: 250,
    crossChainId: "eip155:250",
    id: "fantom",
    name: "Fantom",
    image: "/chains/fantom.svg",
  },
  "eip155:252": {
    chainId: 252,
    crossChainId: "eip155:252",
    id: "fraxtal",
    name: "Fraxtal",
    image: "/chains/fraxtal.png",
  },
  "eip155:291": {
    chainId: 291,
    crossChainId: "eip155:291",
    id: "orderly",
    name: "Orderly",
    image: "/chains/orderly.png",
  },
  "eip155:324": {
    chainId: 324,
    crossChainId: "eip155:324",
    id: "zksync-era",
    name: "ZkSync Era",
    image: "/chains/zksync.svg",
  },
  "eip155:424": {
    chainId: 424,
    crossChainId: "eip155:424",
    id: "pgn",
    name: "PGN",
    image: "/chains/pgn.png",
  },
  "eip155:4653": {
    chainId: 4653,
    crossChainId: "eip155:4653",
    id: "gold",
    name: "Gold",
    image: "/chains/gold.png",
  },
  "eip155:5101": {
    chainId: 5101,
    crossChainId: "eip155:5101",
    id: "frame",
    name: "Frame",
    image: "/chains/frame.jpeg",
  },
  "eip155:8453": {
    chainId: 8453,
    crossChainId: "eip155:8453",
    id: "base",
    name: "Base",
    image: "/chains/base.svg",
  },
  "eip155:34443": {
    chainId: 34443,
    crossChainId: "eip155:34443",
    id: "mode",
    name: "Mode",
    image: "/chains/mode.png",
  },
  "eip155:42161": {
    chainId: 42161,
    crossChainId: "eip155:42161",
    id: "arbitrum",
    name: "Arbitrum",
    image: "/chains/arbitrum.svg",
  },
  "eip155:42220": {
    chainId: 42220,
    crossChainId: "eip155:42220",
    id: "celo",
    name: "Celo",
    image: "/chains/celo.svg",
  },
  "eip155:43114": {
    chainId: 43114,
    crossChainId: "eip155:43114",
    id: "avalanche",
    name: "Avalanche",
    image: "/chains/avalanche.svg",
  },
  "eip155:59144": {
    chainId: 59144,
    crossChainId: "eip155:59144",
    id: "linea",
    name: "Linea",
    image: "/chains/linea.svg",
  },
  "eip155:78225": {
    chainId: 78225,
    crossChainId: "eip155:78225",
    id: "stack",
    name: "Stack",
    image: "/chains/stack.png",
  },
  "eip155:81457": {
    chainId: 81457,
    crossChainId: "eip155:81457",
    id: "blast",
    name: "Blast",
    image: "/chains/blast.png",
  },
  "eip155:534352": {
    chainId: 534352,
    crossChainId: "eip155:534352",
    id: "scroll",
    name: "Scroll",
    image: "/chains/scroll.svg",
  },
  "eip155:7777777": {
    chainId: 7777777,
    crossChainId: "eip155:7777777",
    id: "zora",
    name: "Zora",
    image: "/chains/zora.svg",
  },
  "eip155:666666666": {
    chainId: 666666666,
    crossChainId: "eip155:666666666",
    id: "degen",
    name: "Degen",
    image: "/chains/degen.svg",
  },
};

export const CHAINS_BY_NAME = Object.values(CHAINS).reduce(
  (acc, chain) => {
    acc[chain.id] = chain;
    return acc;
  },
  {} as Record<string, Chain>,
);
