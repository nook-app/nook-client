import { Image } from "coingecko-api-v3";
import { ERC20 } from "reverse-mirage";

type ExclusiveSourcesParams =
  | { excludedSources: string[]; includedSources?: never }
  | { includedSources: string[]; excludedSources?: never }
  | { excludedSources?: never; includedSources?: never };

type ExclusiveValidationParams =
  | { skipValidation: true; takerAddress?: never }
  | { skipValidation?: false; takerAddress: string }
  | { skipValidation?: never; takerAddress?: never };

export type ZeroXSwapQuoteRequestParams = {
  sellToken: `0x${string}`;
  buyToken: `0x${string}`;
  slippagePercentage?: string;
  gasPrice?: string;
  feeRecipient?: `0x${string}`;
  buyTokenPercentageFee?: string;
  enableSlippageProtection?: boolean;
  priceImpactProtectionPercentage?: string;
  feeRecipientTradeSurplus?: `0x${string}`;
  shouldSellEntireBalance?: boolean;
  sellAmount?: string;
  buyAmount?: string;
} & ExclusiveSourcesParams &
  ExclusiveValidationParams;

type Order = {
  makerToken: `0x${string}`;
  takerToken: `0x${string}`;
  makerAmount: string;
  takerAmount: string;
  fillData: {
    tokenAddressPath?: `0x${string}`[];
    router: `0x${string}`;
    routes?: Route[];
  };
  fill: Fill;
  source: string;
  sourcePathId: `0x${string}`;
  type: number;
};

type Fill = {
  input: string;
  output: string;
  adjustdOutput: string;
  gas: number;
};

type Route = {
  from: `0x${string}`;
  to: `0x${string}`;
  stable: boolean;
  factory: `0x${string}`;
};

export type ZeroXSwapQuoteResponse = {
  price: string;
  grossPrice: string;
  guaranteedPrice: string;
  estimatedPriceImpact: string | null;
  to: `0x${string}`;
  data: `0x${string}`;
  value: string;
  gasPrice: string;
  gas: string;
  estimatedGas: string;
  protocolFee: string;
  minimumProtocolFee: string;
  buyAmount: string;
  grossBuyAmount: string;
  sellAmount: string;
  grossSellAmount: string;
  sources: { name: string; proportion: string }[];
  buyTokenAddress: `0x${string}`;
  sellTokenAddress: `0x${string}`;
  allowanceTarget: `0x${string}`;
  orders: Order[];
  type: number;
  sellTokenToEthRate: string;
  buyTokenToEthRate: string;
  expectedSlippage: string;
  fees?: {
    feeType: "volume";
    feeToken: `0x${string}`;
    feeAmount: string;
    billingType: "on-chain";
  } | null;
};

export type ZeroXPriceRequestParams = Omit<
  ZeroXSwapQuoteRequestParams,
  "shouldSellEntireBalance"
> & {
  skipValidation?: boolean; // Defaults to true for /price endpoint
};

export type ZeroXPriceResponse = Omit<
  ZeroXSwapQuoteResponse,
  "orders" | "guaranteedPrice" | "to" | "data"
>;

export enum ZeroXSupportedChain {
  ETHEREUM = "ethereum",
  SEPOLIA = "sepolia",
  ARBITRUM = "arbitrum",
  AVALANCHE = "avalanche",
  BASE = "base",
  BSC = "bsc",
  CELO = "celo",
  FANTOM = "fantom",
  OPTIMISM = "optimism",
  POLYGON = "polygon",
}

export const ZeroXSupportedChainToCoinGeckoId: Record<
  ZeroXSupportedChain,
  string
> = {
  [ZeroXSupportedChain.ETHEREUM]: "ethereum",
  [ZeroXSupportedChain.ARBITRUM]: "arbitrum",
  [ZeroXSupportedChain.AVALANCHE]: "avalanche",
  [ZeroXSupportedChain.BSC]: "binance-smart-chain",
  [ZeroXSupportedChain.CELO]: "celo",
  [ZeroXSupportedChain.FANTOM]: "fantom",
  [ZeroXSupportedChain.OPTIMISM]: "optimistic-ethereum",
  [ZeroXSupportedChain.POLYGON]: "polygon-pos",
  [ZeroXSupportedChain.BASE]: "base",
  [ZeroXSupportedChain.SEPOLIA]: "ethereum",
};

export type CoinGeckoMetadata = {
  image?: Image;
  url?: string;
};

export type TokenInfo = CoinGeckoMetadata & ERC20;

export type SwapQuoteRequest = {
  chain: string;
  buyToken: `0x${string}`;
  buyAmount?: string;
  sellToken: `0x${string}`;
  sellAmount?: string;
  maxSlippageBps: string;
  maxPriceImpactBps: string;
  taker: `0x${string}`;
  affiliate?: `0x${string}`;
};

export type SwapQuoteResponse = {
  quote: ZeroXSwapQuoteResponse;
  fee: bigint;
  requireApproval: boolean;
  sellErc20?: ERC20;
  buyErc20?: ERC20;
  requestId: string;
};
