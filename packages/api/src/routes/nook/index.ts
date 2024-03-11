import { FastifyInstance } from "fastify";
import { NookService } from "../../services/nook";
import {
  FeedFarcasterContentArgs,
  FeedFarcasterFollowingArgs,
} from "@nook/common/types";
import { FeedService } from "../../services/feed";

export const nookRoutes = async (fastify: FastifyInstance) => {
  fastify.register(async (fastify: FastifyInstance) => {
    const nookService = new NookService(fastify);
    const feedService = new FeedService(fastify);

    fastify.get("/nooks", async (request, reply) => {
      const { fid } = (await request.jwtDecode()) as { fid: string };
      const data = await nookService.getNooks(fid);
      return reply.send({ data });
    });

    fastify.get<{ Params: { nookId: string } }>(
      "/nooks/:nookId",
      async (request, reply) => {
        const nook = await nookService.getNook(request.params.nookId);
        return reply.send(nook);
      },
    );

    fastify.post<{
      Body: FeedFarcasterFollowingArgs;
      Querystring: { cursor?: string };
    }>("/feed/farcaster/following", async (request, reply) => {
      let viewerFid: string | undefined;
      try {
        const { fid } = (await request.jwtDecode()) as { fid: string };
        viewerFid = fid;
      } catch (e) {}

      const response = await feedService.getFarcasterFollowingFeed(
        request.body,
        request.query.cursor,
        viewerFid,
      );

      return reply.send(response);
    });

    fastify.post<{
      Body: FeedFarcasterContentArgs;
      Querystring: { cursor?: string };
    }>("/feed/farcaster/content", async (request, reply) => {
      let viewerFid: string | undefined;
      try {
        const { fid } = (await request.jwtDecode()) as { fid: string };
        viewerFid = fid;
      } catch (e) {}

      const response = await feedService.getFarcasterContentFeed(
        request.body,
        request.query.cursor,
        viewerFid,
      );

      return reply.send(response);
    });
  });
};
