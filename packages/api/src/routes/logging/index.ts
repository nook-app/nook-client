import { FastifyInstance } from "fastify";
import { LoggingRequest } from "@nook/common/types";
import { hash } from "@nook/common/utils";

export const loggingRoutes = async (fastify: FastifyInstance) => {
  fastify.register(async (fastify: FastifyInstance) => {
    fastify.post<{
      Body: LoggingRequest;
    }>("/logging", async (request, reply) => {
      if (!request.body.dump) {
        return reply.status(400).send({ message: "Invalid request" });
      }

      // should we rate-limit this?
      // pull fid from token; don't trust the client
      const { fid } = (await request.jwtVerify()) as { fid: string };

      // hash to prevent duplicate logs
      const logHash = hash(request.body.dump);
      try {
        fastify.nook.client.logDump.create({
          data: {
            fid: parseInt(fid, 10),
            dump: request.body.dump,
            hash: logHash,
          },
        });

        return reply.send({ logHash });
      } catch (error) {
        console.error(error);
        return reply.status(500).send({ message: (error as Error).message });
      }
    });
  });
};
