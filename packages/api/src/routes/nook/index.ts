import { FastifyInstance } from "fastify";
import { NookService } from "../../services/nookService";
import { GetEntitiesRequest, GetNookRequest } from "../../../types";
import { ContentFeedArgs } from "@nook/common/types";

export const nookRoutes = async (fastify: FastifyInstance) => {
  fastify.register(async (fastify: FastifyInstance) => {
    const nookService = new NookService(fastify);

    fastify.post<{ Body: ContentFeedArgs & { cursor?: string } }>(
      "/content/feed",
      async (request, reply) => {
        return reply.send(
          await nookService.getContentFeed(request.body, request.body.cursor),
        );
      },
    );

    fastify.post<{ Body: { contentId: string } }>(
      "/content",
      async (request, reply) => {
        const content = await nookService.getContent(request.body.contentId);
        if (!content) {
          return reply
            .status(404)
            .send({ status: 404, message: "Content not found" });
        }
        return reply.send(content);
      },
    );

    fastify.post<{ Body: GetEntitiesRequest }>(
      "/entities",
      async (request, reply) => {
        const entities = await nookService.getEntities(request.body.entityIds);
        return reply.send({ data: entities });
      },
    );

    fastify.get<{ Params: GetNookRequest }>(
      "/nooks/:nookId",
      async (request, reply) => {
        const nook = await nookService.getNook(request.params.nookId);
        return reply.send(nook);
      },
    );
  });
};
