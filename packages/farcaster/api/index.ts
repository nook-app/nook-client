import fastify from "fastify";
import { PrismaClient } from "@nook/common/prisma/farcaster";
import { UserDataType, getSSLHubRpcClient } from "@farcaster/hub-nodejs";
import { FarcasterEventType, FarcasterUser } from "@nook/common/types";
import { transformToCastEvent } from "@nook/common/farcaster";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore: Unreachable code error
BigInt.prototype.toJSON = function () {
  return this.toString();
};

const run = async () => {
  const prisma = new PrismaClient();

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
        reply.send(transformToCastEvent(FarcasterEventType.CAST_ADD, existingCast).data);
        return;
      }

    },
  );

  server.get<{ Params: { fid: string } }>(
    "/user/:fid",
    async (request, reply) => {
      const userData = await prisma.farcasterUserData.findMany({
        where: {
          fid: Number(request.params.fid),
        },
      });

      if (!userData) {
        reply.status(404).send();
        return;
      }

      const username = userData.find((d) => d.type === UserDataType.USERNAME);
      const pfp = userData.find((d) => d.type === UserDataType.PFP);
      const displayName = userData.find((d) => d.type === UserDataType.DISPLAY);
      const bio = userData.find((d) => d.type === UserDataType.BIO);
      const url = userData.find((d) => d.type === UserDataType.URL);

      const user: FarcasterUser = {
        fid: BigInt(request.params.fid),
        username: username?.value,
        pfp: pfp?.value,
        displayName: displayName?.value,
        bio: bio?.value,
        url: url?.value,
      };

      return { user };
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
