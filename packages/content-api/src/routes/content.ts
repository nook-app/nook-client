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
      try {
        if ("uri" in request.body) {
          const content = (await service.getContents([request.body.uri]))[0];
          if (!content) {
            reply.status(404).send({ message: "Content not found" });
            return;
          }
          reply.send(content);
        } else {
          const contents = await service.getContents(request.body.uris);
          reply.send({ data: contents });
        }
      } catch (e) {
        console.error(e);
        reply.status(500).send({ message: "Internal server error" });
      }
    });

    fastify.post<{
      Body: GetContentRequest | GetContentsRequest;
    }>("/content/refresh", async (request, reply) => {
      try {
        if ("uri" in request.body) {
          const content = (
            await service.refreshContents([request.body.uri])
          )[0];
          if (!content) {
            reply.status(404).send({ message: "Content not found" });
            return;
          }
          reply.send(content);
        } else {
          const contents = await service.refreshContents(request.body.uris);
          reply.send({ data: contents });
        }
      } catch (e) {
        console.error(e);
        reply.status(500).send({ message: "Internal server error" });
      }
    });

    fastify.post<{
      Body: FarcasterCastResponse;
    }>("/content/references", async (request, reply) => {
      try {
        await service.addReferencedContent(request.body);
        reply.send({});
      } catch (e) {
        console.error(e);
        reply.status(500).send({ message: "Internal server error" });
      }
    });

    fastify.delete<{
      Body: FarcasterCastResponse;
    }>("/content/references", async (request, reply) => {
      try {
        await service.removeReferencedContent(request.body);
        reply.send({});
      } catch (e) {
        console.error(e);
        reply.status(500).send({ message: "Internal server error" });
      }
    });
  });
};
