export type Chain = {
  chainId: number;
  id: string;
  name: string;
  image: string;
};

export const CHAINS: Record<number, Chain> = {
  1: {
    chainId: 1,
    id: "ethereum",
    name: "Ethereum",
    image: "/chains/ethereum.svg",
  },
  10: {
    chainId: 10,
    id: "optimism",
    name: "Optimism",
    image: "/chains/optimism.svg",
  },
  252: {
    chainId: 252,
    id: "fraxtal",
    name: "Fraxtal",
    image: "/chains/fraxtal.png",
  },
  291: {
    chainId: 291,
    id: "orderly",
    name: "Orderly",
    image: "/chains/orderly.png",
  },
  424: {
    chainId: 424,
    name: "PGN",
    id: "pgn",
    image: "/chains/pgn.png",
  },
  4653: {
    chainId: 4653,
    name: "Gold",
    id: "gold",
    image: "/chains/gold.png",
  },
  5101: {
    chainId: 5101,
    name: "Frame",
    id: "frame",
    image: "/chains/frame.jpeg",
  },
  8453: {
    chainId: 8453,
    name: "Base",
    id: "base",
    image: "/chains/base.svg",
  },
  34443: {
    chainId: 34443,
    name: "Mode",
    id: "mode",
    image: "/chains/mode.png",
  },
  78225: {
    chainId: 78225,
    name: "Stack",
    id: "stack",
    image: "/chains/stack.png",
  },
  7777777: {
    chainId: 7777777,
    name: "Zora",
    id: "zora",
    image: "/chains/zora.svg",
  },
  666666666: {
    chainId: 666666666,
    name: "Degen",
    id: "degen",
    image: "/chains/degen.png",
  },
};
