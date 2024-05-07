import { FastifyInstance } from "fastify";
import { DegenService } from "../../services/degen";

export const degenRoutes = async (fastify: FastifyInstance) => {
  fastify.register(async (fastify: FastifyInstance) => {
    const client = new DegenService(fastify);

    fastify.get("/tips/degen/allowance", async (request, reply) => {
      const { fid } = (await request.jwtDecode()) as { fid: string };
      const data = await client.getAllowance(fid);
      if (!data) {
        reply.status(404).send({ message: "Allowance not found" });
        return;
      }
      return reply.send(data);
    });
  });
};
