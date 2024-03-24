import { FastifyInstance } from "fastify";
import {
  SignInWithFarcasterRequest,
  SignInWithPasswordRequest,
} from "../../../types";
import { UserService } from "../../services/user";

export const userRoutes = async (fastify: FastifyInstance) => {
  fastify.register(async (fastify: FastifyInstance) => {
    const userService = new UserService(fastify);

    fastify.get("/user", async (request, reply) => {
      const { fid } = (await request.jwtDecode()) as { fid: string };
      try {
        const data = await userService.getUser(fid);
        if (!data) {
          return reply.code(404).send({ message: "User not found" });
        }
        return reply.send(data);
      } catch (e) {
        console.error(e);
        return reply.code(500).send({ message: (e as Error).message });
      }
    });

    fastify.patch<{ Body: { theme: string } }>(
      "/user",
      async (request, reply) => {
        const { fid } = (await request.jwtDecode()) as { fid: string };
        try {
          const data = await userService.updateUser(fid, request.body);
          if (!data) {
            return reply.code(404).send({ message: "User not found" });
          }
          return reply.send(data);
        } catch (e) {
          console.error(e);
          return reply.code(500).send({ message: (e as Error).message });
        }
      },
    );

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
        console.error(e);
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
          console.error(e);
          return reply.code(500).send({ message: (e as Error).message });
        }
      },
    );

    fastify.post<{
      Body: {
        fid: string;
        token: string;
        refreshToken: string;
        expiresAt: number;
        theme?: string;
      };
    }>("/user/refresh", async (request, reply) => {
      try {
        const data = await userService.refreshUser(request.body);
        return reply.send(data);
      } catch (e) {
        console.error(e);
        return reply.code(500).send({ message: (e as Error).message });
      }
    });

    fastify.post<{ Body: SignInWithPasswordRequest }>(
      "/user/login/dev",
      async (request, reply) => {
        if (
          request.body.username.toLowerCase() !==
            process.env.DEV_USERNAME?.toLowerCase() ||
          request.body.password !== process.env.DEV_PASSWORD
        ) {
          return reply.code(401).send({ message: "Unauthorized" });
        }
        try {
          const data = await userService.signInWithDev();
          if (!data) {
            return reply.code(401).send({ message: "Unauthorized" });
          }
          return reply.send(data);
        } catch (e) {
          console.error(e);
          return reply.code(500).send({ message: (e as Error).message });
        }
      },
    );
  });
};
