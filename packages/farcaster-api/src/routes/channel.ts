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
      const channel = (await service.getChannels([], [request.params.id]))[0];

      if (!channel) {
        reply.status(404).send({ message: "Channel not found" });
        return;
      }

      reply.send(channel);
    });

    fastify.get<{
      Params: { url: string };
    }>("/channels/by-url/:url", async (request, reply) => {
      const channel = (await service.getChannels([request.params.url]))[0];

      if (!channel) {
        reply.status(404).send({ message: "Channel not found" });
        return;
      }

      reply.send(channel);
    });

    fastify.get<{
      Querystring: { query: string; limit?: number; cursor?: string };
    }>("/channels", async (request, reply) => {
      const data = await service.searchChannels(
        request.query.query,
        request.query.limit,
        request.query.cursor,
      );

      reply.send(data);
    });

    fastify.post<{ Body: GetFarcasterChannelsRequest }>(
      "/channels",
      async (request, reply) => {
        const channels = await service.getChannels(
          request.body.parentUrls,
          request.body.channelIds,
        );
        reply.send({ data: channels });
      },
    );
  });
};
