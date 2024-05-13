import { FastifyInstance } from "fastify";
import { AuthService } from "../services/auth";

export const userRoutes = async (fastify: FastifyInstance) => {
  fastify.register(async (fastify: FastifyInstance) => {
    const authService = new AuthService(fastify);

    fastify.post("/user/login", async (request, reply) => {
      const authorization = request.headers.authorization;
      if (!authorization) {
        return reply
          .code(400)
          .send({ message: "Authorization header is required" });
      }

      const token = authorization.split(" ")[1];
      if (!token) {
        return reply.code(400).send({ message: "Token is required" });
      }

      try {
        const response = await authService.loginUser(token);
        if (!response) {
          return reply.code(401).send({ message: "Unauthorized" });
        }
        return reply.send(response);
      } catch (e) {
        console.error(e);
        return reply.code(500).send({ message: (e as Error).message });
      }
    });

    fastify.post<{ Body: { username: string; password: string } }>(
      "/user/login/dev",
      async (request, reply) => {
        const { username, password } = request.body;

        if (
          username.toLowerCase() !== process.env.DEV_USERNAME?.toLowerCase() ||
          password !== process.env.DEV_PASSWORD
        ) {
          return reply.code(401).send({ message: "Unauthorized" });
        }

        try {
          const response = await authService.loginUserWithPassword();
          if (!response) {
            return reply.code(401).send({ message: "Unauthorized" });
          }
          return reply.send(response);
        } catch (e) {
          console.error(e);
          return reply.code(500).send({ message: (e as Error).message });
        }
      },
    );
  });
};
