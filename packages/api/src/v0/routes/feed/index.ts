import { FastifyInstance } from "fastify";
import { CreateFeedRequest } from "@nook/common/types/feed";
import { FeedService } from "../../services/feed";

export const feedRoutes = async (fastify: FastifyInstance) => {
  fastify.register(async (fastify: FastifyInstance) => {
    const service = new FeedService(fastify);

    fastify.get("/feeds", async (request, reply) => {
      const { fid } = (await request.jwtDecode()) as { fid: string };
      try {
        const response = await service.getFeeds(fid);
        return reply.send(response);
      } catch (error) {
        console.error(error);
        return reply.status(500).send({ error: "Internal Server Error" });
      }
    });

    fastify.put<{ Body: CreateFeedRequest }>(
      "/feeds",
      async (request, reply) => {
        const { fid } = (await request.jwtDecode()) as { fid: string };

        try {
          const response = await service.createFeed(fid, request.body);
          return reply.send(response);
        } catch (error) {
          console.error(error);
          return reply.status(500).send({ error: "Internal Server Error" });
        }
      },
    );

    fastify.patch<{ Params: { feedId: string }; Body: CreateFeedRequest }>(
      "/feeds/:feedId",
      async (request, reply) => {
        const { fid } = (await request.jwtDecode()) as { fid: string };
        try {
          const feed = await service.getFeed(request.params.feedId);
          if (!feed) {
            return reply.status(404).send({ error: "Feed not found" });
          }
          if (feed.fid !== fid) {
            return reply.status(401).send({ error: "Unauthorized" });
          }
          const response = await service.updateFeed(
            request.params.feedId,
            request.body,
          );
          return reply.send(response);
        } catch (error) {
          console.error(error);
          return reply.status(500).send({ error: "Internal Server Error" });
        }
      },
    );

    fastify.delete<{ Params: { feedId: string } }>(
      "/feeds/:feedId",
      async (request, reply) => {
        const { fid } = (await request.jwtDecode()) as { fid: string };
        try {
          const feed = await service.getFeed(request.params.feedId);
          if (!feed) {
            return reply.status(404).send({ error: "Feed not found" });
          }
          if (feed.fid !== fid) {
            return reply.status(401).send({ error: "Unauthorized" });
          }
          const response = await service.deleteFeed(request.params.feedId);
          return reply.send(response);
        } catch (error) {
          console.error(error);
          return reply.status(500).send({ error: "Internal Server Error" });
        }
      },
    );
  });
};
