import { FastifyInstance } from "fastify";
import { SignInWithFarcasterRequest } from "../../../types";
import { UserService } from "../../services/userService";

export const userRoutes = async (fastify: FastifyInstance) => {
  fastify.register(async (fastify: FastifyInstance) => {
    const userService = new UserService(fastify);

    fastify.get("/token", async (request, reply) => {
      const authHeader = request.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return reply
          .code(401)
          .send({ message: "Unauthorized: No token provided" });
      }
      const data = await userService.getToken(
        authHeader.substring(7, authHeader.length),
      );
      if ("message" in data) return reply.code(data.status).send(data);
      return reply.send(data);
    });

    fastify.get("/user", async (request, reply) => {
      const { id } = (await request.jwtDecode()) as { id: string };
      const data = await userService.getUser(id);
      if ("message" in data) return reply.code(data.status).send(data);
      return reply.send(data);
    });

    fastify.post<{ Body: SignInWithFarcasterRequest }>(
      "/farcaster/login",
      async (request, reply) => {
        const data = await userService.signInWithFarcaster(request.body);
        if ("message" in data) return reply.code(data.status).send(data);
        return reply.send(data);
      },
    );

    fastify.get("/farcaster/signer", async (request, reply) => {
      const { id } = (await request.jwtDecode()) as { id: string };
      try {
        const data = await userService.getFarcasterSigner(id);
        return reply.send(data);
      } catch (e) {
        return reply.code(500).send({ message: (e as Error).message });
      }
    });

    fastify.get<{ Querystring: { token: string } }>(
      "/farcaster/signer/validate",
      async (request, reply) => {
        await request.jwtVerify();
        try {
          const data = await userService.validateFarcasterSigner(
            request.query.token,
          );
          return reply.send(data);
        } catch (e) {
          return reply.code(500).send({ message: (e as Error).message });
        }
      },
    );
  });
};
