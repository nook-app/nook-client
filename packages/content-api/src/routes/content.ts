import { FastifyInstance } from "fastify";
import { ContentService } from "../service/content";
import {
  FarcasterCastResponse,
  GetContentRequest,
  GetContentsRequest,
} from "@nook/common/types";

export const contentRoutes = async (fastify: FastifyInstance) => {
  fastify.register(async (fastify: FastifyInstance) => {
    const service = new ContentService(fastify);

    fastify.post<{
      Body: GetContentRequest | GetContentsRequest;
    }>("/content", async (request, reply) => {
      if ("uri" in request.body) {
        const content = await service.getContent(request.body.uri);
        reply.send(content);
      } else {
        const contents = await service.getContents(request.body.uris);
        reply.send({data: contents});
      }
    });

    fastify.post<{
      Body: GetContentRequest | GetContentsRequest;
    }>("/content/refresh", async (request, reply) => {
      if ("uri" in request.body) {
        const content = await service.refreshContent(request.body.uri);
        reply.send(content);
      } else {
        const contents = await service.refreshContents(request.body.uris);
        reply.send({data: contents});
      }
    });

    fastify.post<{
      Body: FarcasterCastResponse;
    }>("/content/references", async (request, reply) => {
      await service.addReferencedContent(request.body);
      reply.send({});
    });

    fastify.delete<{
      Body: FarcasterCastResponse;
    }>("/content/references", async (request, reply) => {
      await service.removeReferencedContent(request.body);
      reply.send({});
    });
  });
};
