import fastify, { FastifyRequest } from "fastify";
import { PrismaClient } from "@flink/common/prisma/farcaster";
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
            },
            uris: {
              type: "array",
              items: {
                type: "string",
              },
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

      const existingCasts = await prisma.farcasterCast.findMany({
        where: {
          OR: ids.map(({ fid, hash }) => ({
            fid: BigInt(fid),
            hash,
          })),
        },
        include: {
          mentions: true,
          casts: true,
          urls: true,
        },
      });

      const existingHashes = existingCasts.map((cast) => cast.hash);
      const missingCasts = ids.filter(
        ({ hash }) => !existingHashes.includes(hash),
      );

      const newCasts = await Promise.all(
        missingCasts.map(async ({ fid, hash }) => {
          const message = await client.getCast({
            fid: parseInt(fid),
            hash: hexToBuffer(hash),
          });

          if (message.isErr()) {
            return undefined;
          }

          return await handleCastAdd({ message: message.value, client });
        }),
      );

      const hashToCast = [...existingCasts, ...newCasts]
        .filter(Boolean)
        .reduce((acc, cast) => {
          acc[`${cast.fid}-${cast.hash}`] = cast;
          return acc;
        }, {});

      const casts = ids
        .map(({ fid, hash }) => hashToCast[`${fid}-${hash}`])
        .map((cast) =>
          cast
            ? {
                ...cast,
                timestamp: cast.timestamp.getTime(),
              }
            : undefined,
        );

      reply.send({
        casts,
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
