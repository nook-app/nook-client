import fastify, { FastifyRequest } from "fastify";
import { PrismaClient } from "@nook/common/prisma/farcaster";
import { UserDataType, getSSLHubRpcClient } from "@farcaster/hub-nodejs";
import {
  getAndBackfillCasts,
  transformToCastData,
} from "../consumer/handlers/casts";
import { getAndBackfillUserDatas } from "../consumer/handlers/users";
import {
  BlockchainAccount,
  FarcasterAccount,
  FarcasterCastData,
  Protocol,
} from "@nook/common/types";
import { getAndBackfillVerfications } from "../consumer/handlers/verifications";

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
      }

      const hashToCast = casts.filter(Boolean).reduce((acc, cast) => {
        acc[`${cast.fid}-${cast.hash}`] = cast;
        return acc;
      }, {} as { [key: string]: FarcasterCastData });

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
      const getUserData = async (fid: string) => {
        let userData = await prisma.farcasterUserData.findMany({
          where: {
            fid: Number(fid),
          },
        });

        const username = userData.find(
          (d) => d.type === UserDataType.USERNAME,
        )?.value;
        const pfp = userData.find((d) => d.type === UserDataType.PFP)?.value;
        const displayName = userData.find(
          (d) => d.type === UserDataType.DISPLAY,
        )?.value;
        const bio = userData.find((d) => d.type === UserDataType.BIO)?.value;
        const url = userData.find((d) => d.type === UserDataType.URL)?.value;

        if (!username || !displayName || !pfp || !bio) {
          userData = await getAndBackfillUserDatas(client, [fid]);
        }

        // TODO: get custody address

        const farcaster: FarcasterAccount = {
          fid,
          custodyAddress: "",
          username,
          pfp,
          displayName,
          bio,
          url,
        };

        let verifications = await prisma.farcasterVerification.findMany({
          where: {
            fid: Number(fid),
          },
        });

        if (verifications.length === 0) {
          verifications = await getAndBackfillVerfications(client, [fid]);
        }

        const blockchain: BlockchainAccount[] = verifications.map((v) => ({
          protocol: v.protocol === 0 ? Protocol.ETHEREUM : Protocol.SOLANA,
          address: v.address,
          isContract: v.verificationType === 1,
        }));

        return { farcaster, blockchain };
      };

      const users = await Promise.all(
        request.body.fids.map((fid) => getUserData(fid)),
      );

      reply.send({
        users: users,
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
