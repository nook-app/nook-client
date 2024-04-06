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
        const quote = await client.getSwap(
          request.body.chain as ZeroXSupportedChain,
          request.body.buyToken,
          request.body.sellToken,
          Number(request.body.maxSlippageBps),
          Number(request.body.maxPriceImpactBps),
          request.body.from,
          requestId,
          request.body.buyAmount ? BigInt(request.body.buyAmount) : undefined,
          request.body.sellAmount ? BigInt(request.body.sellAmount) : undefined,
        );
        return reply.send({ ...quote, requestId });
      },
    );
  });
};
