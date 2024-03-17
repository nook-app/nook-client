import {
  GetFarcasterChannelRequest,
  GetFarcasterChannelsRequest,
} from "@nook/common/types";
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

    fastify.get<{ Querystring: { query: string; cursor?: string } }>(
      "/channels",
      async (request, reply) => {
        const data = await service.searchChannels(
          request.query.query,
          request.query.cursor,
        );

        reply.send(data);
      },
    );

    fastify.post<{ Body: GetFarcasterChannelsRequest }>(
      "/channels",
      async (request, reply) => {
        if (request.body.channelIds) {
          const channels = await service.getChannelsById(
            request.body.channelIds,
          );
          reply.send({ data: channels });
        } else if (request.body.parentUrls) {
          const channels = await service.getChannels(request.body.parentUrls);
          reply.send({ data: channels });
        } else {
          reply.status(400).send({ message: "Invalid request" });
        }
      },
    );
  });
};
