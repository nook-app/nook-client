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

  server.get<{Params: {fid: string, hash: string}}>(
    "/casts/:fid/:hash",
    async (
      request,
      reply,
    ) => {
      const { fid, hash } = request.params;
      const existingCast = await prisma.farcasterCast.findFirst({
        where: {
          fid: Number(fid),
          hash,
        },
      });

      if (existingCast) {
        reply.send(transformToCastData(existingCast));
        return;
      }

      const cast = await getAndBackfillCasts(client, [{ fid, hash }]);

      if (cast.length === 0) {
        reply.status(404).send({ message: "Cast not found" });
        return;
      }
      
      reply.send(cast[0]);
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

        let username = userData.find(
          (d) => d.type === UserDataType.USERNAME,
        )?.value;
        let pfp = userData.find((d) => d.type === UserDataType.PFP)?.value;
        let displayName = userData.find(
          (d) => d.type === UserDataType.DISPLAY,
        )?.value;
        let bio = userData.find((d) => d.type === UserDataType.BIO)?.value;
        const url = userData.find((d) => d.type === UserDataType.URL)?.value;

        if (!username || !displayName || !pfp || !bio) {
          userData = await getAndBackfillUserDatas(client, [fid]);
          if (!username) {
            username = userData.find(
              (d) => d.type === UserDataType.USERNAME,
            )?.value;
          }
          if (!pfp) {
            pfp = userData.find((d) => d.type === UserDataType.PFP)?.value;
          }
          if (!displayName) {
            displayName = userData.find(
              (d) => d.type === UserDataType.DISPLAY,
            )?.value;
          }
          if (!bio) {
            bio = userData.find((d) => d.type === UserDataType.BIO)?.value;
          }
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
