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

    fastify.get<{ Params: GetFarcasterUserRequest }>(
      "/users/:fid",
      async (request, reply) => {
        const user = await userService.getUser(request.params.fid);

        if (!user) {
          reply.status(404).send({ message: "User not found" });
          return;
        }

        reply.send(user);
      },
    );

    fastify.get<{
      Params: GetFarcasterUserRequest;
      Querystring: { onlyFids: boolean };
    }>("/users/:fid/followers/fids", async (request, reply) => {
      const followers = await userService.getFollowers(request.params.fid);
      reply.send({
        data: followers.map((f) => f.fid.toString()),
      });
    });
  });
};
