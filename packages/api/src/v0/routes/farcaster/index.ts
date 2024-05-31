import { FastifyInstance } from "fastify";
import { FarcasterAPIV1Client, NookCacheClient } from "@nook/common/clients";
import { FarcasterFeedRequest } from "@nook/common/types";

export const farcasterRoutes = async (fastify: FastifyInstance) => {
  fastify.register(async (fastify: FastifyInstance) => {
    const client = new FarcasterAPIV1Client();
    const nook = new NookCacheClient(fastify.redis.client);

    fastify.post<{ Body: FarcasterFeedRequest }>(
      "/farcaster/casts",
      async (request, reply) => {
        let viewerFid: string | undefined;
        try {
          const { fid } = (await request.jwtDecode()) as { fid: string };
          viewerFid = fid;
        } catch (e) {}

        if (request.body.api?.includes("k3l.io")) {
          const response = await fetch(
            `${request.body.api}${
              request.body.cursor ? `?offset=${request.body.cursor}` : ""
            }`,
          );
          if (!response.ok) {
            console.error(await response.text());
            reply.status(500);
            return;
          }
          const {
            result,
          }: {
            result: { cast_hash: string }[];
          } = await response.json();
          const casts = await client.getCastsForHashes(
            result.map((r) => r.cast_hash),
            viewerFid,
          );

          if (viewerFid) {
            const mutes = await nook.getUserMutes(viewerFid);
            const channels = mutes
              .filter((m) => m.startsWith("channel:"))
              .map((m) => m.split(":")[1]);

            const users = mutes
              .filter((m) => m.startsWith("user:"))
              .map((m) => m.split(":")[1]);

            const words = mutes
              .filter((m) => m.startsWith("word:"))
              .map((m) => m.split(":")[1]);

            const filteredCasts = casts.data.filter((cast) => {
              if (cast.parentUrl && channels.includes(cast.parentUrl)) {
                return false;
              }
              if (cast.user && users.includes(cast.user.fid)) {
                return false;
              }
              if (words.some((word) => cast.text.includes(word))) {
                return false;
              }
              return true;
            });

            return reply.send({
              data: filteredCasts,
              nextCursor: (Number(request.body.cursor) || 0) + result.length,
            });
          }

          return reply.send({
            data: casts.data,
            nextCursor: (Number(request.body.cursor) || 0) + result.length,
          });
        }

        const response = await client.getCasts(request.body, viewerFid);

        return reply.send(response);
      },
    );

    fastify.post<{ Body: { hashes: string[] } }>(
      "/farcaster/casts/hashes",
      async (request, reply) => {
        let viewerFid: string | undefined;
        try {
          const { fid } = (await request.jwtDecode()) as { fid: string };
          viewerFid = fid;
        } catch (e) {}
        const response = await client.getCastsForHashes(
          request.body.hashes,
          viewerFid,
        );
        if (!response) {
          reply.status(404);
          return;
        }
        reply.send(response);
      },
    );

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

        return reply.send(response);
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

    fastify.post<{ Body: { fids?: string[]; addresses?: string[] } }>(
      "/farcaster/users",
      async (request, reply) => {
        let viewerFid: string | undefined;
        try {
          const { fid } = (await request.jwtDecode()) as { fid: string };
          viewerFid = fid;
        } catch (e) {}
        const response = await client.getUsers(request.body, viewerFid);
        reply.send(response);
      },
    );

    fastify.get<{
      Params: { username: string };
      Querystring: { fid?: boolean };
    }>("/farcaster/users/:username", async (request, reply) => {
      let viewerFid: string | undefined;
      try {
        const { fid } = (await request.jwtDecode()) as { fid: string };
        viewerFid = fid;
      } catch (e) {}

      const response = await client.getUser(
        request.params.username,
        request.query.fid || !Number.isNaN(Number(request.params.username)),
        viewerFid,
      );

      return reply.send(response);
    });

    fastify.get<{ Params: { fid: string } }>(
      "/farcaster/users/:fid/mutuals-preview",
      async (request, reply) => {
        const { fid } = (await request.jwtDecode()) as { fid: string };
        const response = await client.getUserMutualsPreview(
          request.params.fid,
          fid,
        );
        reply.send(response);
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

    fastify.get<{ Querystring: { query: string } }>(
      "/search/preview",
      async (request, reply) => {
        let viewerFid: string | undefined;
        try {
          const { fid } = (await request.jwtDecode()) as { fid: string };
          viewerFid = fid;
        } catch (e) {}
        const [users, channels] = await Promise.all([
          client.searchUsers(request.query.query, 10, undefined, viewerFid),
          client.searchChannels(request.query.query, 10, undefined, viewerFid),
        ]);

        return reply.send({ users: users.data, channels: channels.data });
      },
    );
  });
};
