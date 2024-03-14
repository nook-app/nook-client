import {
  GetFarcasterUserRequest,
  GetFarcasterUsersRequest,
} from "@nook/common/types";
import { FastifyInstance } from "fastify";
import { FarcasterService } from "../service/farcaster";

export const userRoutes = async (fastify: FastifyInstance) => {
  fastify.register(async (fastify: FastifyInstance) => {
    const service = new FarcasterService(fastify);

    fastify.get<{ Querystring: { query: string; cursor?: string } }>(
      "/users",
      async (request, reply) => {
        const data = await service.searchUsers(
          request.query.query,
          request.query.cursor,
          request.headers["x-viewer-fid"] as string,
        );

        reply.send(data);
      },
    );

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
      const users = await service.getUsers(
        [request.params.fid],
        request.headers["x-viewer-fid"] as string,
      );

      if (users.length === 0) {
        reply.status(404).send({ message: "User not found" });
        return;
      }

      reply.send(users[0]);
    });

    fastify.get<{
      Params: GetFarcasterUserRequest;
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
      Params: GetFarcasterUserRequest;
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
