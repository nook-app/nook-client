import {
  GetFarcasterUserRequest,
  GetFarcasterUsersRequest,
} from "@nook/common/types";
import { FastifyInstance } from "fastify";
import { FarcasterService } from "../service/farcaster";

export const userRoutes = async (fastify: FastifyInstance) => {
  fastify.register(async (fastify: FastifyInstance) => {
    const service = new FarcasterService(fastify);

    fastify.get<{
      Querystring: { query: string; cursor?: string; limit?: number };
    }>("/users", async (request, reply) => {
      const data = await service.searchUsers(
        request.query.query,
        request.query.limit,
        request.query.cursor,
        request.headers["x-viewer-fid"] as string,
      );

      reply.send(data);
    });

    fastify.post<{ Body: GetFarcasterUsersRequest }>(
      "/users",
      async (request, reply) => {
        if (request.body.fids) {
          const users = await service.getUsers(
            request.body.fids,
            request.headers["x-viewer-fid"] as string,
          );
          reply.send({ data: users });
        } else if (request.body.addresses) {
          const users = await service.getUsersForAddresses(
            request.body.addresses,
            request.headers["x-viewer-fid"] as string,
          );
          reply.send({ data: users });
        } else {
          reply.status(400).send({ message: "Invalid request" });
        }
      },
    );

    fastify.get<{
      Params: GetFarcasterUserRequest;
    }>("/users/:fid", async (request, reply) => {
      let fid = request.params.fid;
      if (Number.isNaN(Number(fid))) {
        fid = (await service.getFidsForUsernames([fid]))[0];
      }

      const users = await service.getUsers(
        [fid],
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
      let fid = request.params.fid;
      if (Number.isNaN(Number(fid))) {
        fid = (await service.getFidsForUsernames([fid]))[0];
      }

      const response = await service.getUserFollowers(
        fid,
        request.query.cursor,
        request.headers["x-viewer-fid"] as string,
      );

      reply.send(response);
    });

    fastify.get<{
      Params: GetFarcasterUserRequest;
      Querystring: { cursor?: string };
    }>("/users/:fid/following", async (request, reply) => {
      let fid = request.params.fid;
      if (Number.isNaN(Number(fid))) {
        fid = (await service.getFidsForUsernames([fid]))[0];
      }

      const response = await service.getUserFollowing(
        fid,
        request.query.cursor,
        request.headers["x-viewer-fid"] as string,
      );

      reply.send(response);
    });

    fastify.get<{
      Params: GetFarcasterUserRequest;
      Querystring: { cursor?: string };
    }>("/users/:fid/following/fids", async (request, reply) => {
      const data = await service.getUserFollowingFids(request.params.fid);

      reply.send({ data });
    });
  });
};
