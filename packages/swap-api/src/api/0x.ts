import {
  ZeroXSwapQuoteRequestParams,
  ZeroXSwapQuoteResponse,
  ZeroXPriceResponse,
  ZeroXPriceRequestParams,
  ZeroXSupportedChain,
} from "@nook/common/types";

const API_URLS: Record<ZeroXSupportedChain, string> = {
  [ZeroXSupportedChain.ETHEREUM]: "https://api.0x.org",
  [ZeroXSupportedChain.SEPOLIA]: "https://sepolia.api.0x.org",
  [ZeroXSupportedChain.ARBITRUM]: "https://arbitrum.api.0x.org",
  [ZeroXSupportedChain.AVALANCHE]: "https://avalanche.api.0x.org",
  [ZeroXSupportedChain.BASE]: "https://base.api.0x.org",
  [ZeroXSupportedChain.BSC]: "https://bsc.api.0x.org",
  [ZeroXSupportedChain.CELO]: "https://celo.api.0x.org",
  [ZeroXSupportedChain.FANTOM]: "https://fantom.api.0x.org",
  [ZeroXSupportedChain.OPTIMISM]: "https://optimism.api.0x.org",
  [ZeroXSupportedChain.POLYGON]: "https://polygon.api.0x.org",
};

export class ZeroXAPIClient {
  private readonly apiKey: string;

  constructor() {
    if (!process.env.ZEROX_API_KEY) {
      throw new Error("ZEROX_API_KEY environment variable is required");
    }
    this.apiKey = process.env.ZEROX_API_KEY;
  }

  async getSwapQuote(
    params: ZeroXSwapQuoteRequestParams,
    chain: ZeroXSupportedChain,
  ): Promise<ZeroXSwapQuoteResponse> {
    const searchParams = new URLSearchParams();
    searchParams.append("sellToken", params.sellToken);
    searchParams.append("buyToken", params.buyToken);

    if (params.sellAmount) {
      searchParams.append("sellAmount", params.sellAmount);
    } else if (params.buyAmount) {
      searchParams.append("buyAmount", params.buyAmount);
    }

    if (params.slippagePercentage)
      searchParams.append("slippagePercentage", params.slippagePercentage);
    if (params.gasPrice) searchParams.append("gasPrice", params.gasPrice);
    if (params.excludedSources && params.excludedSources.length > 0)
      searchParams.append("excludedSources", params.excludedSources.join(","));
    if (params.includedSources && params.includedSources.length > 0)
      searchParams.append("includedSources", params.includedSources.join(","));
    if (params.skipValidation) searchParams.append("skipValidation", "true");
    if (params.takerAddress)
      searchParams.append("takerAddress", params.takerAddress);
    if (params.feeRecipient)
      searchParams.append("feeRecipient", params.feeRecipient);
    if (params.buyTokenPercentageFee)
      searchParams.append(
        "buyTokenPercentageFee",
        params.buyTokenPercentageFee,
      );
    if (params.enableSlippageProtection !== undefined)
      searchParams.append(
        "enableSlippageProtection",
        params.enableSlippageProtection.toString(),
      );
    if (params.priceImpactProtectionPercentage)
      searchParams.append(
        "priceImpactProtectionPercentage",
        params.priceImpactProtectionPercentage,
      );
    if (params.feeRecipientTradeSurplus)
      searchParams.append(
        "feeRecipientTradeSurplus",
        params.feeRecipientTradeSurplus,
      );
    if (params.shouldSellEntireBalance !== undefined)
      searchParams.append(
        "shouldSellEntireBalance",
        params.shouldSellEntireBalance.toString(),
      );

    const baseURL = API_URLS[chain];
    const response = await fetch(
      `${baseURL}/swap/v1/quote?${searchParams.toString()}`,
      {
        method: "GET",
        headers: {
          "0x-api-key": this.apiKey,
        },
      },
    );

    if (!response.ok) {
      console.log(await response.json());
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data as ZeroXSwapQuoteResponse;
  }

  async getPrice(
    params: ZeroXPriceRequestParams,
    chain: ZeroXSupportedChain,
  ): Promise<ZeroXPriceResponse> {
    const searchParams = new URLSearchParams();
    searchParams.append("sellToken", params.sellToken);
    searchParams.append("buyToken", params.buyToken);

    if (params.sellAmount) {
      searchParams.append("sellAmount", params.sellAmount);
    } else if (params.buyAmount) {
      searchParams.append("buyAmount", params.buyAmount);
    }

    if (params.slippagePercentage)
      searchParams.append("slippagePercentage", params.slippagePercentage);
    if (params.gasPrice) searchParams.append("gasPrice", params.gasPrice);
    if (params.excludedSources)
      searchParams.append("excludedSources", params.excludedSources.join(","));
    if (params.includedSources)
      searchParams.append("includedSources", params.includedSources.join(","));
    if ("skipValidation" in params && params.skipValidation === false)
      searchParams.append("skipValidation", "false");
    if (params.takerAddress)
      searchParams.append("takerAddress", params.takerAddress);
    if (params.feeRecipient)
      searchParams.append("feeRecipient", params.feeRecipient);
    if (params.buyTokenPercentageFee)
      searchParams.append(
        "buyTokenPercentageFee",
        params.buyTokenPercentageFee,
      );
    if (params.enableSlippageProtection !== undefined)
      searchParams.append(
        "enableSlippageProtection",
        params.enableSlippageProtection.toString(),
      );
    if (params.priceImpactProtectionPercentage)
      searchParams.append(
        "priceImpactProtectionPercentage",
        params.priceImpactProtectionPercentage,
      );
    if (params.feeRecipientTradeSurplus)
      searchParams.append(
        "feeRecipientTradeSurplus",
        params.feeRecipientTradeSurplus,
      );

    const baseURL = API_URLS[chain];
    const response = await fetch(
      `${baseURL}/swap/v1/price?${searchParams.toString()}`,
      {
        method: "GET",
        headers: {
          "0x-api-key": this.apiKey,
        },
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data as ZeroXPriceResponse;
  }
}
