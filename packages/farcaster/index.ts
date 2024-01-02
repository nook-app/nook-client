import fastify, { FastifyRequest } from "fastify";
import { PrismaClient } from "@flink/prisma/farcaster";
import { getSSLHubRpcClient } from "@farcaster/hub-nodejs";
import { hexToBuffer } from "./utils";
import { handleCastAdd } from "./handlers/casts";

const prisma = new PrismaClient();

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore: Unreachable code error
BigInt.prototype.toJSON = function () {
  return this.toString();
};

const run = async () => {
  const hubRpcEndpoint = process.env.HUB_RPC_ENDPOINT;
  if (!hubRpcEndpoint) {
    throw new Error("Missing HUB_RPC_ENDPOINT");
  }

  const client = getSSLHubRpcClient(hubRpcEndpoint);

  const server = fastify({
    ajv: {
      customOptions: {
        allowUnionTypes: true,
      },
    },
  });

  server.get(
    "/cast/:fid/:hash",
    {
      schema: {
        params: {
          fid: { type: "string" },
          hash: { type: "string" },
        },
      },
    },
    async (
      request: FastifyRequest<{ Params: { fid: string; hash: string } }>,
      reply,
    ) => {
      const cast = await prisma.farcasterCast.findUnique({
        where: {
          hash: request.params.hash,
        },
        include: {
          mentions: true,
          casts: true,
          urls: true,
        },
      });

      if (cast) {
        reply.send({
          cast: { ...cast, timestamp: cast.timestamp.getTime() },
        });
      }

      const message = await client.getCast({
        fid: parseInt(request.params.fid),
        hash: hexToBuffer(request.params.hash),
      });

      if (message.isErr()) {
        return reply.status(404).send();
      }

      return await handleCastAdd({ message: message.value, client });
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
