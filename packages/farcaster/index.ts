import fastify, { FastifyRequest } from "fastify";
import { PrismaClient } from "@flink/prisma/farcaster";

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

  server.get(
    "/cast/:hash",
    {
      schema: {
        params: {
          hash: { type: "string" },
        },
      },
    },
    async (request: FastifyRequest<{ Params: { hash: string } }>, reply) => {
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

      if (!cast) {
        return reply.status(404).send();
      }

      reply.send({
        cast: { ...cast, timestamp: cast.timestamp.getTime() },
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
