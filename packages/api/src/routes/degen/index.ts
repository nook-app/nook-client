import { FastifyInstance } from "fastify";
import { DegenService } from "../../services/degen";

export const degenRoutes = async (fastify: FastifyInstance) => {
  fastify.register(async (fastify: FastifyInstance) => {
    const client = new DegenService(fastify);

    fastify.get<{ Params: { fid: string } }>(
      "/tips/degen/allowance/:fid",
      async (request, reply) => {
        await request.jwtVerify();
        const data = await client.getAllowance(request.params.fid);
        if (!data) {
          reply.status(404).send({ message: "Allowance not found" });
          return;
        }
        return reply.send(data);
      },
    );
  });
};
