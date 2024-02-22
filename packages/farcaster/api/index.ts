import fastify, { FastifyRequest } from "fastify";
import { PrismaClient } from "@nook/common/prisma/farcaster";
import {
  UserDataType,
  getSSLHubRpcClient,
  Message,
} from "@farcaster/hub-nodejs";
import { backfillCastAdd } from "../consumer/handlers/casts";
import { backfillUserDataAdd } from "../consumer/handlers/users";
import {
  BlockchainAccount,
  EventType,
  FarcasterAccount,
  Protocol,
} from "@nook/common/types";
import { backfillVerificationAdd } from "../consumer/handlers/verifications";
import {
  fromFarcasterURI,
  toFarcasterURI,
  transformToCastEvent,
} from "@nook/common/farcaster";
import { hexToBuffer } from "@nook/common/farcaster";
import { publishRawEvent, publishRawEvents } from "@nook/common/queues";

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
        reply.send(transformToCastEvent(EventType.CAST_ADD, existingCast).data);
        return;
      }

      const message = await client.getCast({
        fid: parseInt(fid),
        hash: hexToBuffer(hash),
      });

      if (message.isErr()) {
        reply.status(404).send({ message: "Cast not found" });
        return;
      }

      const casts = await backfillCastAdd(client, [message.value]);
      const cast = transformToCastEvent(EventType.CAST_ADD, casts[0]);
      await publishRawEvent(cast);

      reply.send(cast.data);
    },
  );

  server.post<{Body: {ids: string[]}}>(
    "/casts",
    async (
      request,
      reply,
    ) => {
      const { ids } = request.body;
      const fidHashes = ids.map(fromFarcasterURI)
      const existingCasts = await prisma.farcasterCast.findMany({
        where: {
          OR: fidHashes.map(({ fid, hash }) => ({
            fid: Number(fid),
            hash,
          })),
        },
      });

      const existingCastIds = existingCasts.map(({fid, hash}) =>toFarcasterURI({fid: fid.toString(), hash}))
      const missingCastIds = ids.filter((id) => !existingCastIds.includes(id));

      const missingCastMessages = (await Promise.all(
        missingCastIds.map(async (cast) => {
          const { fid, hash } = fromFarcasterURI(cast);
         const result =  await client.getCast({
            fid: parseInt(fid),
            hash: hexToBuffer(hash),
          })
          if (result.isOk()) {
            return result.value
          }
        })
        )).filter(Boolean) as Message[]

      const casts = await backfillCastAdd(client, missingCastMessages);

      reply.send({
        casts: existingCasts.concat(casts).map((cast) => transformToCastEvent(EventType.CAST_ADD, cast).data),
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
          const messages = await client.getAllUserDataMessagesByFid({
            fid: parseInt(fid),
          });

          if (messages.isOk()) {
            userData = await backfillUserDataAdd(messages.value.messages);
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
          const messages = await client.getAllVerificationMessagesByFid({
            fid: parseInt(fid),
          });
          if (messages.isOk()) {
            verifications = await backfillVerificationAdd(
              messages.value.messages,
            );
          }
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
