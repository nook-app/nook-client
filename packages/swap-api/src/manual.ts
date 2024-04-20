import { SwapService } from "./service";
import fastify from "fastify";
import { redisPlugin } from "./plugins";
import fastifyJwt from "@fastify/jwt";
import { ZeroXSupportedChain } from "@nook/common/types";
import { SwapToken } from "./service/types";

async function getSwap() {
  console.log("getting swap");
  const now = new Date();
  const app = fastify({
    logger: true,
    ajv: {
      customOptions: {
        allowUnionTypes: true,
      },
    },
  });
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore: Automatically convert BigInts to strings when serializing to JSON
  BigInt.prototype.toJSON = function () {
    return this.toString();
  };

  await app.register(fastifyJwt, {
    secret: process.env.JWT_SECRET as string,
  });

  await app.register(redisPlugin);

  const swap = new SwapService(app);

  const quote = await swap.getSwap({
    buyToken: makeToken(
      ZeroXSupportedChain.BASE,
      "0x4ed4e862860bed51a9570b96d89af5e1b0efefed",
      5_000_000n * BigInt(1e18),
    ),
    sellToken: makeToken(
      ZeroXSupportedChain.BASE,
      "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
    ),
    maxSlippageBps: 50,
    maxPriceImpactBps: 4000,
    taker: "0x7039813983ba47a5A46B19f3a269aeF5C6c75ABF",
    affiliate: "0x333601a803CAc32B7D17A38d32c9728A93b422f4",
    requestId: "idk",
  });
  console.log(quote);
  console.log(new Date().getTime() - now.getTime());
}

function makeToken(
  chain: ZeroXSupportedChain,
  address: `0x${string}`,
  amount?: bigint,
): SwapToken {
  return {
    chain,
    address,
    amount,
  };
}

async function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
getSwap();
