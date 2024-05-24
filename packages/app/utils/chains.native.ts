type Chain = {
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
    image: require("../../app-native/assets/chains/ethereum.svg"),
  },
  "eip155:10": {
    chainId: 10,
    crossChainId: "eip155:10",
    id: "optimism",
    name: "Optimism",
    image: require("../../app-native/assets/chains/optimism.svg"),
  },
  "eip155:56": {
    chainId: 56,
    crossChainId: "eip155:56",
    id: "binance-smart-chain",
    name: "Binance",
    image: require("../../app-native/assets/chains/binance.svg"),
  },
  "eip155:100": {
    chainId: 100,
    crossChainId: "eip155:1000",
    id: "gnosis",
    name: "Gnosis",
    image: require("../../app-native/assets/chains/gnosis.svg"),
  },
  "eip155:137": {
    chainId: 137,
    crossChainId: "eip155:137",
    id: "polygon",
    name: "Polygon",
    image: require("../../app-native/assets/chains/polygon.png"),
  },
  "eip155:250": {
    chainId: 250,
    crossChainId: "eip155:250",
    id: "fantom",
    name: "Fantom",
    image: require("../../app-native/assets/chains/fantom.svg"),
  },
  "eip155:252": {
    chainId: 252,
    crossChainId: "eip155:252",
    id: "fraxtal",
    name: "Fraxtal",
    image: require("../../app-native/assets/chains/fraxtal.png"),
  },
  "eip155:291": {
    chainId: 291,
    crossChainId: "eip155:291",
    id: "orderly",
    name: "Orderly",
    image: require("../../app-native/assets/chains/orderly.png"),
  },
  "eip155:324": {
    chainId: 324,
    crossChainId: "eip155:324",
    id: "zksync-era",
    name: "ZkSync Era",
    image: require("../../app-native/assets/chains/zksync.svg"),
  },
  "eip155:424": {
    chainId: 424,
    crossChainId: "eip155:424",
    id: "pgn",
    name: "PGN",
    image: require("../../app-native/assets/chains/pgn.png"),
  },
  "eip155:4653": {
    chainId: 4653,
    crossChainId: "eip155:4653",
    id: "gold",
    name: "Gold",
    image: require("../../app-native/assets/chains/gold.png"),
  },
  "eip155:5101": {
    chainId: 5101,
    crossChainId: "eip155:5101",
    id: "frame",
    name: "Frame",
    image: require("../../app-native/assets/chains/frame.jpeg"),
  },
  "eip155:8453": {
    chainId: 8453,
    crossChainId: "eip155:8453",
    id: "base",
    name: "Base",
    image: require("../../app-native/assets/chains/base.svg"),
  },
  "eip155:34443": {
    chainId: 34443,
    crossChainId: "eip155:34443",
    id: "mode",
    name: "Mode",
    image: require("../../app-native/assets/chains/mode.png"),
  },
  "eip155:42161": {
    chainId: 42161,
    crossChainId: "eip155:42161",
    id: "arbitrum",
    name: "Arbitrum",
    image: require("../../app-native/assets/chains/arbitrum.svg"),
  },
  "eip155:42220": {
    chainId: 42220,
    crossChainId: "eip155:42220",
    id: "celo",
    name: "Celo",
    image: require("../../app-native/assets/chains/celo.svg"),
  },
  "eip155:43114": {
    chainId: 43114,
    crossChainId: "eip155:43114",
    id: "avalanche",
    name: "Avalanche",
    image: require("../../app-native/assets/chains/avalanche.svg"),
  },
  "eip155:59144": {
    chainId: 59144,
    crossChainId: "eip155:59144",
    id: "linea",
    name: "Linea",
    image: require("../../app-native/assets/chains/linea.svg"),
  },
  "eip155:78225": {
    chainId: 78225,
    crossChainId: "eip155:78225",
    name: "Stack",
    id: "stack",
    image: require("../../app-native/assets/chains/stack.png"),
  },
  "eip155:81457": {
    chainId: 81457,
    crossChainId: "eip155:81457",
    id: "blast",
    name: "Blast",
    image: require("../../app-native/assets/chains/blast.png"),
  },
  "eip155:534352": {
    chainId: 534352,
    crossChainId: "eip155:534352",
    id: "scroll",
    name: "Scroll",
    image: require("../../app-native/assets/chains/scroll.svg"),
  },
  "eip155:7777777": {
    chainId: 7777777,
    crossChainId: "eip155:7777777",
    name: "Zora",
    id: "zora",
    image: require("../../app-native/assets/chains/zora.svg"),
  },
  "eip155:666666666": {
    chainId: 666666666,
    crossChainId: "eip155:666666666",
    name: "Degen",
    id: "degen",
    image: require("../../app-native/assets/chains/degen.svg"),
  },
};

export const CHAINS_BY_NAME = Object.values(CHAINS).reduce(
  (acc, chain) => {
    acc[chain.id] = chain;
    return acc;
  },
  {} as Record<string, Chain>,
);
