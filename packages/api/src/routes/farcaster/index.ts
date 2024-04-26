import { FastifyInstance } from "fastify";
import { ContentAPIClient, FarcasterAPIClient } from "@nook/common/clients";
import {
  ChannelFilterType,
  FarcasterPostArgs,
  ShelfDataRequest,
  UserFilterType,
} from "@nook/common/types";
import { FarcasterFeedRequest } from "@nook/common/types/feed";

export const farcasterRoutes = async (fastify: FastifyInstance) => {
  fastify.register(async (fastify: FastifyInstance) => {
    const client = new FarcasterAPIClient();
    const content = new ContentAPIClient();

    fastify.get<{ Params: { hash: string } }>(
      "/farcaster/casts/:hash",
      async (request, reply) => {
        let viewerFid: string | undefined;
        try {
          const { fid } = (await request.jwtDecode()) as { fid: string };
          viewerFid = fid;
        } catch (e) {}
        const response = await client.getCast(request.params.hash, viewerFid);
        if (!response) {
          reply.status(404);
          return;
        }
        reply.send(response);
      },
    );

    fastify.get<{ Params: { hash: string } }>(
      "/farcaster/casts/:hash/hub",
      async (request, reply) => {
        let viewerFid: string | undefined;
        try {
          const { fid } = (await request.jwtDecode()) as { fid: string };
          viewerFid = fid;
        } catch (e) {}
        const response = await client.getCast(request.params.hash, viewerFid);
        if (!response) {
          reply.status(404);
          return;
        }
        reply.send(response);
      },
    );

    fastify.get<{ Params: { hash: string }; Querystring: { cursor?: string } }>(
      "/farcaster/casts/:hash/replies",
      async (request, reply) => {
        let viewerFid: string | undefined;
        try {
          const { fid } = (await request.jwtDecode()) as { fid: string };
          viewerFid = fid;
        } catch (e) {}
        const response = await client.getCastReplies(
          request.params.hash,
          request.query.cursor,
          viewerFid,
        );
        reply.send(response);
      },
    );

    fastify.get<{ Params: { hash: string }; Querystring: { cursor?: string } }>(
      "/farcaster/casts/:hash/replies/new",
      async (request, reply) => {
        let viewerFid: string | undefined;
        try {
          const { fid } = (await request.jwtDecode()) as { fid: string };
          viewerFid = fid;
        } catch (e) {}
        const response = await client.getNewCastReplies(
          request.params.hash,
          request.query.cursor,
          viewerFid,
        );
        reply.send(response);
      },
    );

    fastify.get<{ Params: { hash: string }; Querystring: { cursor?: string } }>(
      "/farcaster/casts/:hash/replies/top",
      async (request, reply) => {
        let viewerFid: string | undefined;
        try {
          const { fid } = (await request.jwtDecode()) as { fid: string };
          viewerFid = fid;
        } catch (e) {}
        const response = await client.getTopCastReplies(
          request.params.hash,
          request.query.cursor,
          viewerFid,
        );
        reply.send(response);
      },
    );

    fastify.get<{ Params: { hash: string }; Querystring: { cursor?: string } }>(
      "/farcaster/casts/:hash/quotes",
      async (request, reply) => {
        let viewerFid: string | undefined;
        try {
          const { fid } = (await request.jwtDecode()) as { fid: string };
          viewerFid = fid;
        } catch (e) {}
        const response = await client.getCastQuotes(
          request.params.hash,
          request.query.cursor,
          viewerFid,
        );
        reply.send(response);
      },
    );

    fastify.get<{ Params: { hash: string }; Querystring: { cursor?: string } }>(
      "/farcaster/casts/:hash/likes",
      async (request, reply) => {
        let viewerFid: string | undefined;
        try {
          const { fid } = (await request.jwtDecode()) as { fid: string };
          viewerFid = fid;
        } catch (e) {}
        const response = await client.getCastLikes(
          request.params.hash,
          request.query.cursor,
          viewerFid,
        );
        reply.send(response);
      },
    );

    fastify.get<{ Params: { hash: string }; Querystring: { cursor?: string } }>(
      "/farcaster/casts/:hash/recasts",
      async (request, reply) => {
        let viewerFid: string | undefined;
        try {
          const { fid } = (await request.jwtDecode()) as { fid: string };
          viewerFid = fid;
        } catch (e) {}
        const response = await client.getCastRecasts(
          request.params.hash,
          request.query.cursor,
          viewerFid,
        );
        reply.send(response);
      },
    );

    fastify.get<{
      Querystring: { query: string; cursor?: string; limit?: number };
    }>("/farcaster/users", async (request, reply) => {
      let viewerFid: string | undefined;
      try {
        const { fid } = (await request.jwtDecode()) as { fid: string };
        viewerFid = fid;
      } catch (e) {}
      const response = await client.searchUsers(
        request.query.query,
        request.query.limit,
        request.query.cursor,
        viewerFid,
      );
      reply.send(response);
    });

    fastify.post<{ Body: { fids: string[] } }>(
      "/farcaster/users",
      async (request, reply) => {
        let viewerFid: string | undefined;
        try {
          const { fid } = (await request.jwtDecode()) as { fid: string };
          viewerFid = fid;
        } catch (e) {}
        const response = await client.getUsers(
          { fids: request.body.fids },
          viewerFid,
        );
        reply.send(response);
      },
    );

    fastify.get<{ Params: { fid: string } }>(
      "/farcaster/users/:fid",
      async (request, reply) => {
        let viewerFid: string | undefined;
        try {
          const { fid } = (await request.jwtDecode()) as { fid: string };
          viewerFid = fid;
        } catch (e) {}
        const response = await client.getUser(request.params.fid, viewerFid);
        reply.send(response);
      },
    );

    fastify.get<{ Params: { fid: string }; Querystring: { cursor?: string } }>(
      "/farcaster/users/:fid/posts",
      async (request, reply) => {
        let viewerFid: string | undefined;
        try {
          const { fid } = (await request.jwtDecode()) as { fid: string };
          viewerFid = fid;
        } catch (e) {}
        const response = await client.getNewPosts({
          data: {
            users: {
              type: UserFilterType.FIDS,
              data: {
                fids: [request.params.fid],
              },
            },
          },
          cursor: request.query.cursor,
          context: { viewerFid },
        });
        reply.send(response);
      },
    );

    fastify.get<{ Params: { fid: string }; Querystring: { cursor?: string } }>(
      "/farcaster/users/:fid/replies",
      async (request, reply) => {
        let viewerFid: string | undefined;
        try {
          const { fid } = (await request.jwtDecode()) as { fid: string };
          viewerFid = fid;
        } catch (e) {}
        const response = await client.getNewPosts({
          data: {
            users: {
              type: UserFilterType.FIDS,
              data: {
                fids: [request.params.fid],
              },
            },
            onlyReplies: true,
          },
          cursor: request.query.cursor,
          context: { viewerFid },
        });
        reply.send(response);
      },
    );

    fastify.get<{ Params: { fid: string }; Querystring: { cursor?: string } }>(
      "/farcaster/users/:fid/media",
      async (request, reply) => {
        let viewerFid: string | undefined;
        try {
          const { fid } = (await request.jwtDecode()) as { fid: string };
          viewerFid = fid;
        } catch (e) {}
        const response = await content.getNewMedia({
          data: {
            users: {
              type: UserFilterType.FIDS,
              data: {
                fids: [request.params.fid],
              },
            },
          },
          cursor: request.query.cursor,
          context: { viewerFid },
        });
        const casts = await client.getCasts(response.data, viewerFid);
        reply.send({
          data: casts.data,
          nextCursor: response.nextCursor,
        });
      },
    );

    fastify.get<{ Params: { fid: string }; Querystring: { cursor?: string } }>(
      "/farcaster/users/:fid/frames",
      async (request, reply) => {
        let viewerFid: string | undefined;
        try {
          const { fid } = (await request.jwtDecode()) as { fid: string };
          viewerFid = fid;
        } catch (e) {}
        const response = await content.getNewFrames({
          data: {
            users: {
              type: UserFilterType.FIDS,
              data: {
                fids: [request.params.fid],
              },
            },
          },
          cursor: request.query.cursor,
          context: { viewerFid },
        });
        const casts = await client.getCasts(response.data, viewerFid);
        reply.send({
          data: casts.data,
          nextCursor: response.nextCursor,
        });
      },
    );

    fastify.get<{ Params: { fid: string }; Querystring: { cursor?: string } }>(
      "/farcaster/users/:fid/mutuals",
      async (request, reply) => {
        let viewerFid: string | undefined;
        try {
          const { fid } = (await request.jwtDecode()) as { fid: string };
          viewerFid = fid;
        } catch (e) {}
        if (!viewerFid) {
          reply.status(401);
          return;
        }
        const response = await client.getUserMutuals(
          viewerFid,
          request.params.fid,
          request.query.cursor,
        );
        reply.send(response);
      },
    );

    fastify.get<{ Params: { fid: string }; Querystring: { cursor?: string } }>(
      "/farcaster/users/:fid/followers",
      async (request, reply) => {
        let viewerFid: string | undefined;
        try {
          const { fid } = (await request.jwtDecode()) as { fid: string };
          viewerFid = fid;
        } catch (e) {}
        const response = await client.getUserFollowers(
          request.params.fid,
          request.query.cursor,
          viewerFid,
        );
        reply.send(response);
      },
    );

    fastify.get<{ Params: { fid: string }; Querystring: { cursor?: string } }>(
      "/farcaster/users/:fid/following",
      async (request, reply) => {
        let viewerFid: string | undefined;
        try {
          const { fid } = (await request.jwtDecode()) as { fid: string };
          viewerFid = fid;
        } catch (e) {}
        const response = await client.getUserFollowing(
          request.params.fid,
          request.query.cursor,
          viewerFid,
        );
        reply.send(response);
      },
    );

    fastify.get<{
      Querystring: { query: string; cursor?: string; limit?: number };
    }>("/farcaster/channels", async (request, reply) => {
      let viewerFid: string | undefined;
      try {
        const { fid } = (await request.jwtDecode()) as { fid: string };
        viewerFid = fid;
      } catch (e) {}
      const response = await client.searchChannels(
        request.query.query,
        request.query.limit,
        request.query.cursor,
        viewerFid,
      );
      reply.send(response);
    });

    fastify.post<{ Body: { channelIds?: string[]; parentUrls?: string[] } }>(
      "/farcaster/channels",
      async (request, reply) => {
        let viewerFid: string | undefined;
        try {
          const { fid } = (await request.jwtDecode()) as { fid: string };
          viewerFid = fid;
        } catch (e) {}
        const response = await client.getChannels(request.body, viewerFid);
        reply.send(response);
      },
    );

    fastify.get<{
      Params: { channelId: string };
    }>("/farcaster/channels/:channelId", async (request, reply) => {
      let viewerFid: string | undefined;
      try {
        const { fid } = (await request.jwtDecode()) as { fid: string };
        viewerFid = fid;
      } catch (e) {}
      const response = await client.getChannel(
        request.params.channelId,
        viewerFid,
      );
      reply.send(response);
    });

    fastify.get<{
      Params: { url: string };
    }>("/farcaster/channels/by-url/:url", async (request, reply) => {
      let viewerFid: string | undefined;
      try {
        const { fid } = (await request.jwtDecode()) as { fid: string };
        viewerFid = fid;
      } catch (e) {}
      const response = await client.getChannelByUrl(
        request.params.url,
        viewerFid,
      );
      reply.send(response);
    });

    fastify.get<{
      Params: { channelId: string };
      Querystring: { cursor?: string };
    }>("/farcaster/channels/:channelId/posts", async (request, reply) => {
      let viewerFid: string | undefined;
      try {
        const { fid } = (await request.jwtDecode()) as { fid: string };
        viewerFid = fid;
      } catch (e) {}
      const response = await client.getNewPosts({
        data: {
          channels: {
            type: ChannelFilterType.CHANNEL_IDS,
            data: {
              channelIds: [request.params.channelId],
            },
          },
          includeReplies: true,
        },
        cursor: request.query.cursor,
        context: { viewerFid },
      });
      reply.send(response);
    });

    fastify.get<{
      Params: { channelId: string };
      Querystring: { cursor?: string };
    }>("/farcaster/channels/:channelId/media", async (request, reply) => {
      let viewerFid: string | undefined;
      try {
        const { fid } = (await request.jwtDecode()) as { fid: string };
        viewerFid = fid;
      } catch (e) {}
      const response = await content.getNewMedia({
        data: {
          channels: {
            type: ChannelFilterType.CHANNEL_IDS,
            data: {
              channelIds: [request.params.channelId],
            },
          },
        },
        cursor: request.query.cursor,
        context: { viewerFid },
      });
      const casts = await client.getCasts(response.data, viewerFid);
      reply.send({
        data: casts.data,
        nextCursor: response.nextCursor,
      });
    });

    fastify.get<{ Querystring: { query?: string; cursor?: string } }>(
      "/farcaster/casts",
      async (request, reply) => {
        let viewerFid: string | undefined;
        try {
          const { fid } = (await request.jwtDecode()) as { fid: string };
          viewerFid = fid;
        } catch (e) {}
        const response = await client.getNewPosts({
          data: {
            query: request.query.query || "",
          },
          cursor: request.query.cursor,
          context: { viewerFid },
        });
        reply.send(response);
      },
    );

    fastify.get<{ Params: { fid: string } }>(
      "/farcaster/users/:fid/recommended-channels",
      async (request, reply) => {
        const { fid } = (await request.jwtDecode()) as { fid: string };
        const response = await fetch(
          `https://api.neynar.com/v2/farcaster/channel/user?fid=${fid}`,
          {
            headers: {
              accept: "application/json",
              api_key: process.env.NEYNAR_API_KEY as string,
            },
          },
        );
        if (!response.ok) {
          reply.status(500);
          return;
        }
        const { channels } = await response.json();
        const urls = channels.map((channel: { url: string }) => channel.url);
        const data = await client.getChannels({ parentUrls: urls });
        reply.send(data);
      },
    );

    fastify.get("/farcaster/channels/recommended", async (request, reply) => {
      const { fid } = (await request.jwtDecode()) as { fid: string };
      const response = await fetch(
        `https://api.neynar.com/v2/farcaster/channel/user?fid=${fid}`,
        {
          headers: {
            accept: "application/json",
            api_key: process.env.NEYNAR_API_KEY as string,
          },
        },
      );
      if (!response.ok) {
        reply.status(500);
        return;
      }
      const { channels } = await response.json();
      const urls = channels.map((channel: { url: string }) => channel.url);
      const data = await client.getChannels({ parentUrls: urls });
      reply.send(data);
    });

    fastify.post<{ Body: ShelfDataRequest<FarcasterPostArgs> }>(
      "/farcaster/casts/new",
      async (request, reply) => {
        let viewerFid: string | undefined;
        try {
          const { fid } = (await request.jwtDecode()) as { fid: string };
          viewerFid = fid;
        } catch (e) {}
        const response = await client.getNewPosts({
          ...request.body,
          context: { viewerFid },
        });
        reply.send(response);
      },
    );
  });
};
