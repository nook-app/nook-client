import fastify, { FastifyRequest } from "fastify";
import { PrismaClient } from "@flink/prisma/identity";
import { SocialPlatform } from "./types";
import { IdentitiesRequest, IdentityRequestType } from "@flink/common/types";

const prisma = new PrismaClient();

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore: Unreachable code error
BigInt.prototype.toJSON = function () {
  return this.toString();
};

const run = async () => {
  const server = fastify({
    ajv: {
      customOptions: {
        allowUnionTypes: true,
      },
    },
  });

  server.post(
    "/identities",
    {
      schema: {
        body: {
          type: "object",
          required: ["type", "ids"],
          properties: {
            type: { type: "string", enum: Object.values(IdentityRequestType) },
            ids: {
              type: "array",
              items: { type: ["string", "number"] },
            },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Body: IdentitiesRequest }>, reply) => {
      const type = request.body.type;
      const ids = request.body.ids.map((id) => String(id));
      if (type === IdentityRequestType.FID) {
        const existingIdentities = await prisma.identity.findMany({
          where: {
            socialAccounts: {
              some: {
                platform: SocialPlatform.FARCASTER,
                platformId: {
                  in: ids,
                },
              },
            },
          },
          include: {
            socialAccounts: true,
            blockchainAccounts: true,
            relatedLinks: true,
          },
        });

        const existingIds = existingIdentities.map(
          (identity) => identity.socialAccounts[0].platformId,
        );
        const missingIds = ids.filter((id) => !existingIds.includes(id));

        const newIdentities = await Promise.all(
          missingIds.map(async (fid) => {
            console.log(`[identity-api] [fid] [${fid}] creating new identity`);
            return await prisma.identity.create({
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
          }),
        );

        const fidToIdentity = [...existingIdentities, ...newIdentities].reduce(
          (acc, identity) => {
            acc[identity.socialAccounts[0].platformId] = identity;
            return acc;
          },
          {},
        );

        const identities = ids.map((id) => fidToIdentity[id]);

        reply.send({
          identities,
        });
      }
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
