import { FastifyInstance } from "fastify";
import { NookService } from "../../services/nookService";
import { NookPanelData } from "@nook/common/types";

export const nookRoutes = async (fastify: FastifyInstance) => {
  fastify.register(async (fastify: FastifyInstance) => {
    const nookService = new NookService(fastify);

    fastify.post<{ Body: NookPanelData & { cursor?: string } }>(
      "/content/feed",
      async (request, reply) => {
        const { id } = (await request.jwtDecode()) as { id: string };
        return reply.send(await nookService.getContentFeed(id, request.body));
      },
    );

    fastify.post<{ Body: { contentId: string } }>(
      "/content",
      async (request, reply) => {
        const { id } = (await request.jwtDecode()) as { id: string };
        const content = await nookService.getContent(
          id,
          request.body.contentId,
        );
        if (!content) {
          return reply
            .status(404)
            .send({ status: 404, message: "Content not found" });
        }
        return reply.send(content);
      },
    );

    fastify.post<{ Body: { entityIds: string[] } }>(
      "/entities",
      async (request, reply) => {
        const { id } = (await request.jwtDecode()) as { id: string };
        const entities = await nookService.fetchEntities(
          id,
          request.body.entityIds,
        );
        return reply.send({ data: entities });
      },
    );

    fastify.post<{ Body: { nookId: string } }>(
      "/nooks",
      async (request, reply) => {
        const nook = await nookService.getNook(request.body.nookId);
        return reply.send(nook);
      },
    );

    fastify.post<{ Querystring: { search: string } }>(
      "/channels",
      async (request, reply) => {
        const channels = await nookService.searchChannels(request.query.search);
        return reply.send({ data: channels });
      },
    );
  });
};
