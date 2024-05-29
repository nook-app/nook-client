import { FastifyInstance } from "fastify";
import { FarcasterService } from "../service/farcaster";

export const userRoutes = async (fastify: FastifyInstance) => {
  fastify.register(async (fastify: FastifyInstance) => {
    const service = new FarcasterService(fastify);

    fastify.get<{
      Params: {
        fid: string;
      };
    }>("/users/:fid", async (request, reply) => {
      const users = await service.getUsers(
        [request.params.fid],
        request.headers["x-viewer-fid"] as string,
      );
      const user = users[request.params.fid];

      if (!user) {
        reply.status(404).send({ message: "User not found" });
        return;
      }

      reply.send(user);
    });
  });
};
