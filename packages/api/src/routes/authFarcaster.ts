import { FastifyInstance } from "fastify";
import { AuthFarcasterRequest } from "../../types";
import { AuthService } from "../services/authService";

export const authFarcaster = async (fastify: FastifyInstance) => {
  const authService = new AuthService(fastify);

  fastify.post<{ Body: AuthFarcasterRequest }>(
    "/auth/farcaster",
    async (request, reply) => {
      const data = await authService.authFarcaster(request.body);
      return reply.send(data);
    },
  );
};
