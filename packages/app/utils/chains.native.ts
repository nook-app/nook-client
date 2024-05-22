type Chain = {
  chainId: number;
  id: string;
  name: string;
  image: string;
};

export const CHAINS: Record<string, Chain> = {
  "eip155:1": {
    chainId: 1,
    id: "ethereum",
    name: "Ethereum",
    image: require("../../app-native/assets/chains/ethereum.svg"),
  },
  "eip155:10": {
    chainId: 10,
    id: "optimism",
    name: "Optimism",
    image: require("../../app-native/assets/chains/optimism.svg"),
  },
  "eip155:252": {
    chainId: 252,
    id: "fraxtal",
    name: "Fraxtal",
    image: require("../../app-native/assets/chains/fraxtal.png"),
  },
  "eip155:291": {
    chainId: 291,
    id: "orderly",
    name: "Orderly",
    image: require("../../app-native/assets/chains/orderly.png"),
  },
  "eip155:424": {
    chainId: 424,
    name: "PGN",
    id: "pgn",
    image: require("../../app-native/assets/chains/pgn.png"),
  },
  "eip155:4653": {
    chainId: 4653,
    name: "Gold",
    id: "gold",
    image: require("../../app-native/assets/chains/gold.png"),
  },
  "eip155:5101": {
    chainId: 5101,
    name: "Frame",
    id: "frame",
    image: require("../../app-native/assets/chains/frame.jpeg"),
  },
  "eip155:8453": {
    chainId: 8453,
    name: "Base",
    id: "base",
    image: require("../../app-native/assets/chains/base.svg"),
  },
  "eip155:34443": {
    chainId: 34443,
    name: "Mode",
    id: "mode",
    image: require("../../app-native/assets/chains/mode.png"),
  },
  "eip155:78225": {
    chainId: 78225,
    name: "Stack",
    id: "stack",
    image: require("../../app-native/assets/chains/stack.png"),
  },
  "eip155:7777777": {
    chainId: 7777777,
    name: "Zora",
    id: "zora",
    image: require("../../app-native/assets/chains/zora.svg"),
  },
  "eip155:666666666": {
    chainId: 666666666,
    name: "Degen",
    id: "degen",
    image: require("../../app-native/assets/chains/degen.png"),
  },
};
