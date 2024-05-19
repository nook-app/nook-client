import { FastifyInstance } from "fastify";
import { ContentService } from "../service/content";
import {
  FarcasterContentReferenceRequest,
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
      Body: FarcasterContentReferenceRequest;
    }>("/content/references", async (request, reply) => {
      try {
        const data = await service.getReferences(
          request.body.references,
          request.body.skipFetch,
        );
        reply.send({ data });
      } catch (e) {
        console.error(e);
        reply.status(500).send({ message: "Internal server error" });
      }
    });

    fastify.delete<{
      Body: FarcasterContentReferenceRequest;
    }>("/content/references", async (request, reply) => {
      try {
        await service.deleteReferences(request.body.references);
        reply.send({});
      } catch (e) {
        console.error(e);
        reply.status(500).send({ message: "Internal server error" });
      }
    });
  });
};
