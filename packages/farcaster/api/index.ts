import fastify, { FastifyRequest } from "fastify";
import {
  FarcasterUserData,
  PrismaClient,
} from "@flink/common/prisma/farcaster";
import { UserDataType, getSSLHubRpcClient } from "@farcaster/hub-nodejs";
import {
  getAndBackfillCasts,
  transformToCastData,
} from "../consumer/handlers/casts";
import { getAndBackfillReactions } from "../consumer/handlers/reactions";
import { SocialAccountMetadata } from "@flink/common/types";
import { getAndBackfillUserDatas } from "../consumer/handlers/users";
import { getAndBackfillLinks } from "../consumer/handlers/links";

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
            OR: ids.map(({ fid, hash }) => ({
              fid: Number(fid),
              hash,
            })),
          },
        })
      ).map(transformToCastData);

      const existingHashes = casts.map((cast) => cast.hash);
      const missingCasts = ids.filter(
        ({ hash }) => !existingHashes.includes(hash),
      );

      if (missingCasts.length > 0) {
        casts.push(...(await getAndBackfillCasts(client, missingCasts)));
        await getAndBackfillReactions(client, missingCasts);
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

  server.post(
    "/users",
    {
      schema: {
        body: {
          type: "object",
          properties: {
            fids: {
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
        Body: { fids: string[] };
      }>,
      reply,
    ) => {
      const userDatas = await prisma.farcasterUserData.findMany({
        where: {
          fid: {
            in: request.body.fids.map((fid) => Number(fid)),
          },
        },
      });

      const existingFids = Array.from(
        new Set(userDatas.map(({ fid }) => fid.toString())),
      );
      const missingFids = request.body.fids.filter(
        (fid) => !existingFids.includes(fid),
      );

      if (missingFids.length > 0) {
        userDatas.push(...(await getAndBackfillUserDatas(client, missingFids)));
        // await getAndBackfillLinks(client, missingFids);
      }

      const groupedUserDatas = userDatas.reduce(
        (acc, userData) => {
          const fid = userData.fid.toString();
          if (!acc[fid]) {
            acc[fid] = [];
          }
          acc[fid].push(userData);
          return acc;
        },
        {} as Record<string, FarcasterUserData[]>,
      );

      reply.send({
        users: request.body.fids.map((fid) => {
          const data = groupedUserDatas[fid];
          if (!data) return;
          return {
            username: data.find((d) => d.type === UserDataType.USERNAME)?.value,
            pfp: data.find((d) => d.type === UserDataType.PFP)?.value,
            displayName: data.find((d) => d.type === UserDataType.DISPLAY)
              ?.value,
            bio: data.find((d) => d.type === UserDataType.BIO)?.value,
            url: data.find((d) => d.type === UserDataType.URL)?.value,
          } as SocialAccountMetadata;
        }),
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
