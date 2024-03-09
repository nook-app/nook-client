import { FastifyInstance } from "fastify";
import { GetContentRequest } from "@nook/common/types";
import { ContentAPIClient } from "@nook/common/clients";

export const contentRoutes = async (fastify: FastifyInstance) => {
  fastify.register(async (fastify: FastifyInstance) => {
    const client = new ContentAPIClient();

    fastify.post<{ Body: GetContentRequest }>(
      "/content",
      async (request, reply) => {
        await request.jwtVerify();
        const data = await client.getContent(request.body.uri);
        return reply.send(data);
      },
    );
  });
};
