import fastify, { FastifyRequest } from "fastify";
import { PrismaClient } from "@flink/common/prisma/farcaster";
import { getSSLHubRpcClient } from "@farcaster/hub-nodejs";
import {
  getAndBackfillCasts,
  transformToCastData,
} from "../consumer/handlers/casts";

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

  server.post(
    "/casts",
    {
      schema: {
        body: {
          type: "object",
          properties: {
            ids: {
              type: "array",
              items: {
                type: "object",
                required: ["fid", "hash"],
                properties: {
                  fid: { type: "string" },
                  hash: { type: "string" },
                },
              },
              nullable: true,
            },
            uris: {
              type: "array",
              items: {
                type: "string",
              },
              nullable: true,
            },
          },
        },
      },
    },
    async (
      request: FastifyRequest<{
        Body: { ids?: { fid: string; hash: string }[]; uris?: string[] };
      }>,
      reply,
    ) => {
      const ids = [];
      if (request.body.ids) {
        ids.push(...request.body.ids);
      }

      if (request.body.uris) {
        ids.push(
          ...request.body.uris.map((uri) => {
            const [fid, hash] = uri.replace("farcaster://cast/", "").split("/");
            return { fid, hash };
          }),
        );
      }

      const casts = (
        await prisma.farcasterCast.findMany({
          where: {
            hash: {
              in: ids.map(({ hash }) => hash),
            },
          },
        })
      ).map(transformToCastData);

      const existingHashes = casts.map((cast) => cast.hash);
      const missingCasts = ids.filter(
        ({ hash }) => !existingHashes.includes(hash),
      );

      if (missingCasts.length > 0) {
        casts.push(...(await getAndBackfillCasts(client, missingCasts)));
      }

      const hashToCast = casts.filter(Boolean).reduce((acc, cast) => {
        acc[`${cast.fid}-${cast.hash}`] = cast;
        return acc;
      }, {});

      reply.send({
        casts: ids.map(({ fid, hash }) => hashToCast[`${fid}-${hash}`]),
      });
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
