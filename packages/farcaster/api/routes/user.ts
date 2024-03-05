import {
  GetFarcasterUserRequest,
  GetFarcasterUsersRequest,
} from "@nook/common/types";
import { FastifyInstance } from "fastify";
import { UserService } from "../../service/user";

export const userRoutes = async (fastify: FastifyInstance) => {
  fastify.register(async (fastify: FastifyInstance) => {
    const userService = new UserService(
      fastify.farcaster.client,
      fastify.redis.client,
    );

    fastify.post<{ Body: GetFarcasterUsersRequest }>(
      "/users",
      async (request, reply) => {
        const users = await userService.getUsers(request.body.fids);

        reply.send({ data: users });
      },
    );

    fastify.get<{
      Params: GetFarcasterUserRequest;
    }>("/users/:fid", async (request, reply) => {
      const user = await userService.getUser(
        request.params.fid,
        request.headers["x-viewer-fid"] as string,
      );

      if (!user) {
        reply.status(404).send({ message: "User not found" });
        return;
      }

      reply.send(user);
    });
  });
};
