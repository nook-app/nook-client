import { FastifyInstance } from "fastify";
import { AuthFarcasterRequest } from "../../../types";
import { UserService } from "../../services/userService";

export const userRoutes = async (fastify: FastifyInstance) => {
  fastify.register(async (fastify: FastifyInstance) => {
    const authService = new UserService(fastify);

    fastify.post<{ Body: AuthFarcasterRequest }>(
      "/auth/farcaster",
      async (request, reply) => {
        const data = await authService.authFarcaster(request.body);
        if ("status" in data) return reply.code(data.status).send(data);
        return reply.send(data);
      },
    );

    fastify.get("/token", async (request, reply) => {
      const authHeader = request.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return reply
          .code(401)
          .send({ message: "Unauthorized: No token provided" });
      }
      const data = await authService.getToken(
        authHeader.substring(7, authHeader.length),
      );
      if ("status" in data) return reply.code(data.status).send(data);
      return reply.send(data);
    });

    fastify.get("/nooks", async (request, reply) => {
      const { id } = (await request.jwtDecode()) as { id: string };
      const nooks = await authService.getNooks(id);
      return reply.send({ nooks });
    });
  });
};
