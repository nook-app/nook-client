import { ZeroXSupportedChain } from "@nook/common/types";

export type SwapToken = {
  chain: ZeroXSupportedChain;
  address: `0x${string}`;
  amount?: bigint;
};

export type GetSwapParams = {
  buyToken: SwapToken;
  sellToken: SwapToken;
  maxSlippageBps: number;
  maxPriceImpactBps: number;
  taker: `0x${string}`;
  requestId: string;
  affiliate?: `0x${string}`;
};
