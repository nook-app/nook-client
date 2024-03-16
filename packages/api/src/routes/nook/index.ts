import { FastifyInstance } from "fastify";
import { NookService } from "../../services/nook";

export const nookRoutes = async (fastify: FastifyInstance) => {
  fastify.register(async (fastify: FastifyInstance) => {
    const nookService = new NookService(fastify);

    fastify.get("/nooks", async (request, reply) => {
      const { fid } = (await request.jwtDecode()) as { fid: string };
      const data = await nookService.getNooks(fid);
      return reply.send({ data });
    });

    fastify.post<{
      Body: { feedId: string };
      Querystring: { cursor?: string };
    }>("/feeds/farcaster", async (request, reply) => {
      const { fid } = (await request.jwtDecode()) as { fid: string };
      const feed = await nookService.getFarcasterFeed(
        request.body.feedId,
        request.query.cursor,
        fid,
      );
      if (!feed) {
        reply.status(404);
        return;
      }
      return reply.send(feed);
    });
  });
};
