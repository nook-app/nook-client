import { FastifyInstance } from "fastify";
import { FarcasterService } from "../service/farcaster";
import { GetFarcasterUsersRequest, UserFilter } from "@nook/common/types";

export const userRoutes = async (fastify: FastifyInstance) => {
  fastify.register(async (fastify: FastifyInstance) => {
    const service = new FarcasterService(fastify);

    fastify.get<{
      Params: { fidOrUsername: string };
      Querystring: { fid?: boolean };
    }>("/users/:fidOrUsername", async (request, reply) => {
      if (request.query.fid) {
        const user = await service.getUserByFid(
          request.params.fidOrUsername,
          request.headers["x-viewer-fid"] as string,
        );

        if (!user) {
          reply.status(404).send({ message: "User not found" });
          return;
        }

        reply.send(user);
        return;
      }

      const user = await service.getUserByUsername(
        request.params.fidOrUsername,
        request.headers["x-viewer-fid"] as string,
      );

      if (!user) {
        reply.status(404).send({ message: "User not found" });
        return;
      }

      reply.send(user);
    });

    fastify.get<{
      Params: { fid: string };
    }>("/users/:fid/mutuals-preview", async (request, reply) => {
      const response = await service.getUserMutualsPreview(
        request.headers["x-viewer-fid"] as string,
        request.params.fid,
      );

      reply.send(response);
    });

    fastify.get<{
      Params: { fid: string };
      Querystring: { cursor?: string };
    }>("/users/:fid/mutuals", async (request, reply) => {
      const response = await service.getUserMutuals(
        request.headers["x-viewer-fid"] as string,
        request.params.fid,
        request.query.cursor,
      );

      reply.send(response);
    });

    fastify.get<{
      Params: { fid: string };
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
      Params: { fid: string };
      Querystring: { cursor?: string };
    }>("/users/:fid/following", async (request, reply) => {
      const response = await service.getUserFollowing(
        request.params.fid,
        request.query.cursor,
        request.headers["x-viewer-fid"] as string,
      );

      reply.send(response);
    });

    fastify.get<{
      Params: { fid: string };
      Querystring: { cursor?: string };
    }>("/users/:fid/following/fids", async (request, reply) => {
      const data = await service.getUserFollowingFids(request.params.fid);

      reply.send({ data });
    });

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
          reply.send({ data: request.body.fids.map((fid) => users[fid]) });
        } else if (request.body.addresses) {
          const users = await service.getUsersForAddresses(
            request.body.addresses,
            request.headers["x-viewer-fid"] as string,
          );
          reply.send({ data: users });
        } else if (request.body.filter) {
          const users = await service.getUsersForFilter(
            request.body.filter,
            request.headers["x-viewer-fid"] as string,
          );
          reply.send({ data: users });
        } else {
          reply.status(400).send({ message: "Invalid request" });
        }
      },
    );

    fastify.post<{ Body: UserFilter }>(
      "/users/addresses",
      async (request, reply) => {
        const data = await service.getAddressesForFilter(request.body);
        reply.send({ data });
      },
    );

    fastify.post<{ Body: GetFarcasterUsersRequest }>(
      "/users/fids",
      async (request, reply) => {
        if (request.body.addresses) {
          const fids = await service.getFidsForAddresses(
            request.body.addresses,
          );
          reply.send({ data: fids });
        } else {
          reply.status(400).send({ message: "Invalid request" });
        }
      },
    );
  });
};
