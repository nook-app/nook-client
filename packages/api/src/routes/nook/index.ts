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

    fastify.get<{ Params: { nookId: string } }>(
      "/nooks/:nookId",
      async (request, reply) => {
        const nook = await nookService.getNook(request.params.nookId);
        return reply.send(nook);
      },
    );
  });
};
