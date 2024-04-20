import { FastifyInstance } from "fastify";
import { ZeroXAPIClient } from "../api/0x";
import { ERC20 } from "reverse-mirage";
import { CoinGeckoClient, PLATFORMS } from "coingecko-api-v3";

import { SwapCacheClient } from "../cache";
import { getAffiliateFeeTransformerNonce, getClient } from "../api/client";
import {
  SwapQuoteResponse,
  ZeroXSupportedChain,
  ZeroXSwapQuoteResponse,
} from "@nook/common/types";
import {
  decodeAbiParameters,
  decodeFunctionData,
  encodeAbiParameters,
  encodeFunctionData,
  parseAbiParameters,
} from "viem";
import {
  NATIVE_TOKEN,
  TOKEN_FEE_STRUCT_TYPE,
  TRANSFORM_ERC20_FEATURE_ABI,
  TransformERC20Args,
} from "../api/types";
import { GetSwapParams } from "./types";

const SWAP_FEE_BPS = 50;

export class SwapService {
  private zeroX: ZeroXAPIClient;
  private coingecko: CoinGeckoClient;
  private cache: SwapCacheClient;

  constructor(fastify: FastifyInstance) {
    this.zeroX = new ZeroXAPIClient();
    this.coingecko = new CoinGeckoClient({}, process.env.COINGECKO_API_KEY);
    this.cache = new SwapCacheClient(fastify.redis.client);
  }

  async getPrice(
    chain: ZeroXSupportedChain,
    sellToken: `0x${string}`,
    buyToken: `0x${string}`,
    buyAmount: string,
  ) {
    return this.zeroX.getPrice(
      {
        sellToken,
        buyToken,
        buyAmount,
      },
      chain,
    );
  }

  async getSwap(params: GetSwapParams): Promise<SwapQuoteResponse> {
    // TODO: how do we want to handle validation errors?
    const quote = await this.zeroX.getSwapQuote(
      {
        sellToken: params.sellToken.address,
        buyToken: params.buyToken.address,
        buyAmount: params.buyToken.amount?.toString(),
        sellAmount: params.sellToken.amount?.toString(),
        slippagePercentage: (params.maxSlippageBps / 10000).toString(),
        priceImpactProtectionPercentage: (
          params.maxPriceImpactBps / 10000
        ).toString(),
        buyTokenPercentageFee: (SWAP_FEE_BPS / 10000).toString(),
        feeRecipient: process.env.FEE_RECIPIENT_ADDRESS as `0x${string}`,
        enableSlippageProtection: true,
      },
      params.buyToken.chain,
    );

    this.processQuote(params.buyToken.chain, quote, params.affiliate);

    const fee = (BigInt(quote.buyAmount) * 50n) / 10000n;

    let requireApproval = false;
    let sellErc20: ERC20 | undefined;
    if (params.sellToken.address !== NATIVE_TOKEN) {
      sellErc20 = await this.getErc20(
        params.sellToken.chain,
        params.sellToken.address,
      );
      const existingAllowance = await this.getTokenAllowance(
        params.taker,
        params.sellToken.address,
        quote.to,
        params.sellToken.chain,
      );

      if (existingAllowance < BigInt(quote.sellAmount)) {
        requireApproval = true;
      }
    }

    let buyErc20: ERC20 | undefined;
    if (params.buyToken.address !== NATIVE_TOKEN) {
      buyErc20 = await this.getErc20(
        params.buyToken.chain,
        params.buyToken.address,
      );
    }

    return {
      quote,
      fee,
      requireApproval,
      buyErc20,
      sellErc20,
      requestId: params.requestId,
    };
  }

  async getTokenAllowance(
    owner: `0x${string}`,
    erc20: `0x${string}`,
    spender: `0x${string}`,
    chain: ZeroXSupportedChain,
  ): Promise<bigint> {
    try {
      const client = getClient(chain);
      const token = await this.getErc20(chain, erc20);
      const allowance = await client.getERC20Allowance({
        erc20: token,
        owner,
        spender,
      });
      return allowance.amount;
    } catch (error) {
      console.error("Error getting token allowance:", error);
      throw error;
    }
  }

  async getCoinGeckoMetadata(
    chain: ZeroXSupportedChain,
    address: `0x${string}`,
  ) {
    if (await this.cache.checkCoinGeckoMetadata(chain, address)) {
      return this.cache.getCoinGeckoMetadata(chain, address);
    }
    const token = await this.coingecko.contract({
      id: chain as PLATFORMS,
      contract_address: address,
    });
    const metadata = {
      image: token.image,
      url: token.id
        ? `https://www.coingecko.com/en/coins/${token.id}`
        : undefined,
    };
    await this.cache.setCoinGeckoMetadata(chain, address, metadata);
    return metadata;
  }

  async getTokenInfo(chain: ZeroXSupportedChain, address: `0x${string}`) {
    const retrieved = this.cache.getCoinGeckoMetadata(chain, address);
    if (retrieved != null) {
      return retrieved;
    }
    const coinGeckoMetadata = await this.getCoinGeckoMetadata(chain, address);
    const erc20 = await this.getErc20(chain, address);

    const info = {
      erc20,
      ...coinGeckoMetadata,
    };
    return info;
  }

  async getErc20(
    chain: ZeroXSupportedChain,
    address: `0x${string}`,
  ): Promise<ERC20> {
    const retrieved = await this.cache.getErc20(chain, address);
    if (retrieved !== undefined) {
      return retrieved;
    }

    const client = getClient(chain);
    const erc20 = await client.getERC20({
      erc20: { address: address, chainID: client.chainId },
    });
    await this.cache.setErc20(chain, address, erc20);
    return erc20;
  }

  /**
   * Post-process a quote to split fees with an affiliate if one exists
   * @param chain Chain on which the quote is being made
   * @param quote The quote to process
   * @param affiliate The affiliate to add into the fees, if any
   */
  async processQuote(
    chain: ZeroXSupportedChain,
    quote: ZeroXSwapQuoteResponse,
    affiliate?: `0x${string}`,
  ) {
    if (affiliate == null) {
      return;
    }
    const { functionName, args } = decodeFunctionData({
      abi: TRANSFORM_ERC20_FEATURE_ABI,
      data: quote.data,
    }) as unknown as { functionName: string; args: TransformERC20Args };
    const transforms = args[4];

    const nonce = getAffiliateFeeTransformerNonce(chain);

    const affiliateIndex = transforms.findIndex((t) => {
      return t.deploymentNonce === nonce;
    });
    if (affiliateIndex === -1) {
      return;
    }
    const affiliateTransform = transforms[affiliateIndex];
    const params = decodeAbiParameters(
      parseAbiParameters(TOKEN_FEE_STRUCT_TYPE),
      affiliateTransform.data,
    );
    const existing = params[0][0];
    existing.amount = existing.amount / 2n;
    const affiliateFee = {
      token: existing.token,
      amount: existing.amount,
      recipient: affiliate,
    };
    const encoded = encodeAbiParameters(
      parseAbiParameters(TOKEN_FEE_STRUCT_TYPE),
      [[existing, affiliateFee]],
    );
    transforms[affiliateIndex].data = encoded;

    const newFunctionData = encodeFunctionData({
      abi: TRANSFORM_ERC20_FEATURE_ABI,
      functionName,
      args,
    });
    quote.data = newFunctionData;
  }
}
