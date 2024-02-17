import { FastifyInstance } from "fastify";
import { SignInWithFarcasterRequest } from "../../../types";
import { UserService } from "../../services/userService";

export const userRoutes = async (fastify: FastifyInstance) => {
  fastify.register(async (fastify: FastifyInstance) => {
    const userService = new UserService(fastify);

    fastify.get("/user", async (request, reply) => {
      const { id } = (await request.jwtDecode()) as { id: string };
      try {
        const data = await userService.getUser(id);
        return reply.send(data);
      } catch (e) {
        console.error("/user", e);
        return reply.code(500).send({ message: (e as Error).message });
      }
    });

    fastify.get("/user/token", async (request, reply) => {
      const authHeader = request.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return reply
          .code(401)
          .send({ message: "Unauthorized: No token provided" });
      }

      try {
        const data = await userService.getToken(
          authHeader.substring(7, authHeader.length),
        );
        return reply.send(data);
      } catch (e) {
        console.error("/token", e);
        return reply.code(500).send({ message: (e as Error).message });
      }
    });

    fastify.post<{ Body: SignInWithFarcasterRequest }>(
      "/user/login",
      async (request, reply) => {
        try {
          const data = await userService.signInWithFarcaster(request.body);
          return reply.send(data);
        } catch (e) {
          console.error("/farcaster/login", e);
          return reply.code(500).send({ message: (e as Error).message });
        }
      },
    );
  });
};
