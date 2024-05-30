import { FastifyInstance } from "fastify";
import { FarcasterService } from "../service/farcaster";
import { FarcasterFeedRequest } from "@nook/common/types";

export const castRoutes = async (fastify: FastifyInstance) => {
  fastify.register(async (fastify: FastifyInstance) => {
    const service = new FarcasterService(fastify);

    fastify.get<{
      Params: {
        hash: string;
      };
    }>("/casts/:hash", async (request, reply) => {
      const cast = await service.getCast(
        request.params.hash,
        request.headers["x-viewer-fid"] as string,
      );

      if (!cast) {
        reply.status(404).send({ message: "Cast not found" });
        return;
      }

      reply.send(cast);
    });

    fastify.post<{
      Body: FarcasterFeedRequest;
    }>("/casts", async (request, reply) => {
      const casts = await service.getCasts(
        request.body,
        request.headers["x-viewer-fid"] as string,
      );
      reply.send(casts);
    });
  });
};
