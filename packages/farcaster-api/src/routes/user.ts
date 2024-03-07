import {
  GetFarcasterUserFollowersRequest,
  GetFarcasterUserRequest,
  GetFarcasterUsersRequest,
} from "@nook/common/types";
import { FastifyInstance } from "fastify";
import { FarcasterService } from "../service/farcaster";

export const userRoutes = async (fastify: FastifyInstance) => {
  fastify.register(async (fastify: FastifyInstance) => {
    const service = new FarcasterService(fastify);

    fastify.post<{ Body: GetFarcasterUsersRequest }>(
      "/users",
      async (request, reply) => {
        const users = await service.getUsers(
          request.body.fids,
          request.headers["x-viewer-fid"] as string,
        );

        reply.send({ data: users });
      },
    );

    fastify.get<{
      Params: GetFarcasterUserRequest;
    }>("/users/:fid", async (request, reply) => {
      const user = await service.getUser(
        request.params.fid,
        request.headers["x-viewer-fid"] as string,
      );

      if (!user) {
        reply.status(404).send({ message: "User not found" });
        return;
      }

      reply.send(user);
    });

    fastify.get<{
      Params: GetFarcasterUserFollowersRequest;
      Querystring: { cursor?: string };
    }>("/users/:fid/followers", async (request, reply) => {
      const response = await service.getUserFollowers(
        request.params.fid,
        request.query.cursor,
        request.headers["x-viewer-fid"] as string,
      );

      reply.send(response);
    });

    fastify.get<{
      Params: GetFarcasterUserFollowersRequest;
      Querystring: { cursor?: string };
    }>("/users/:fid/following", async (request, reply) => {
      const response = await service.getUserFollowing(
        request.params.fid,
        request.query.cursor,
        request.headers["x-viewer-fid"] as string,
      );

      reply.send(response);
    });
  });
};
