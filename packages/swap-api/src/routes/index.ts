import { FastifyInstance } from "fastify";
import { SwapService } from "../service";
import {
  ZeroXSupportedChain,
  SwapQuoteRequest,
  SwapQuoteResponse,
} from "@nook/common/types";
import { v4 as uuidv4 } from "uuid";

export const swapRoutes = async (fastify: FastifyInstance) => {
  fastify.register(async (fastify: FastifyInstance) => {
    const client = new SwapService(fastify);
    fastify.post<{ Body: SwapQuoteRequest; Reply: SwapQuoteResponse }>(
      "/quote",
      async (request, reply) => {
        await request.jwtVerify();
        const requestId = uuidv4();
        const quote = await client.getSwap({
          buyToken: {
            chain: request.body.chain as ZeroXSupportedChain,
            address: request.body.buyToken,
            amount: request.body.buyAmount
              ? BigInt(request.body.buyAmount)
              : undefined,
          },
          sellToken: {
            chain: request.body.chain as ZeroXSupportedChain,
            address: request.body.sellToken,
            amount: request.body.sellAmount
              ? BigInt(request.body.sellAmount)
              : undefined,
          },
          maxSlippageBps: Number(request.body.maxSlippageBps),
          maxPriceImpactBps: Number(request.body.maxPriceImpactBps),
          taker: request.body.taker,
          requestId,
          affiliate: request.body.affiliate,
        });
        return reply.send({ ...quote, requestId });
      },
    );
  });
};
