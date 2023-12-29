import fastify, { FastifyRequest } from "fastify";
import { PrismaClient } from "@flink/prisma/identity";
import { SocialPlatform } from "./types";

const prisma = new PrismaClient();

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore: Unreachable code error
BigInt.prototype.toJSON = function () {
  return this.toString();
};

type ByFidRequest = FastifyRequest<{
  Params: { fid: string };
}>;

const run = async () => {
  const hubRpcEndpoint = process.env.HUB_RPC_ENDPOINT;
  if (!hubRpcEndpoint) {
    throw new Error("Missing HUB_RPC_ENDPOINT");
  }

  const server = fastify();

  server.get(
    "/identity/by-fid/:fid",
    {
      schema: {
        params: {
          fid: { type: "string" },
        },
      },
    },
    async (request: ByFidRequest, reply) => {
      const { fid } = request.params;

      let identity = await prisma.identity.findFirst({
        where: {
          socialAccounts: {
            some: {
              platform: SocialPlatform.FARCASTER,
              platformId: fid,
            },
          },
        },
        include: {
          socialAccounts: true,
          blockchainAccounts: true,
          relatedLinks: true,
        },
      });

      if (!identity) {
        identity = await prisma.identity.create({
          data: {
            socialAccounts: {
              create: {
                platform: SocialPlatform.FARCASTER,
                platformId: fid,
                source: "identity",
                verified: true,
              },
            },
          },
          select: {
            id: true,
            socialAccounts: true,
            blockchainAccounts: true,
            relatedLinks: true,
          },
        });
      }

      return identity;
    },
  );

  const port = Number(process.env.PORT || "3000");
  await server.listen({ port, host: "0.0.0.0" });
  console.log(`Listening on :${port}`);
};

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
