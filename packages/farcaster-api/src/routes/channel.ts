import { GetFarcasterChannelRequest } from "@nook/common/types";
import { FastifyInstance } from "fastify";
import { FarcasterService } from "../service/farcaster";

export const channelRoutes = async (fastify: FastifyInstance) => {
  fastify.register(async (fastify: FastifyInstance) => {
    const service = new FarcasterService(fastify);

    fastify.get<{
      Params: GetFarcasterChannelRequest;
    }>("/channels/:id", async (request, reply) => {
      const channel = await service.getChannelById(
        request.params.id,
        request.headers["x-viewer-fid"] as string,
      );

      if (!channel) {
        reply.status(404).send({ message: "Channel not found" });
        return;
      }

      reply.send(channel);
    });
  });
};
