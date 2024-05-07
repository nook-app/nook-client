import { NookCacheClient } from "@nook/common/clients";
import { FastifyInstance } from "fastify";

export const muteRoutes = async (fastify: FastifyInstance) => {
  fastify.register(async (fastify: FastifyInstance) => {
    const client = fastify.nook.client;
    const cache = new NookCacheClient(fastify.redis.client);

    fastify.post<{
      Body: {
        mutedFid: string;
      };
    }>("/mute/users", async (request, reply) => {
      const { fid } = (await request.jwtDecode()) as { fid: string };
      const mutedFid = request.body.mutedFid;

      await client.userMutedUser.upsert({
        where: {
          fid_mutedFid: {
            mutedFid,
            fid,
          },
        },
        create: {
          mutedFid,
          fid,
        },
        update: {},
      });

      await cache.addUserMute(fid, `user:${mutedFid}`);

      return reply.send({});
    });

    fastify.delete<{
      Body: {
        mutedFid: string;
      };
    }>("/mute/users", async (request, reply) => {
      const { fid } = (await request.jwtDecode()) as { fid: string };
      const mutedFid = request.body.mutedFid;

      await client.userMutedUser.delete({
        where: {
          fid_mutedFid: {
            mutedFid,
            fid,
          },
        },
      });
      await cache.removeUserMute(fid, `user:${mutedFid}`);
      return reply.send({});
    });

    fastify.post<{
      Body: {
        mutedParentUrl: string;
      };
    }>("/mute/channels", async (request, reply) => {
      const { fid } = (await request.jwtDecode()) as { fid: string };
      const mutedParentUrl = request.body.mutedParentUrl;

      await client.userMutedParentUrl.upsert({
        where: {
          fid_mutedParentUrl: {
            mutedParentUrl,
            fid,
          },
        },
        create: {
          mutedParentUrl,
          fid,
        },
        update: {},
      });
      await cache.addUserMute(fid, `channel:${mutedParentUrl}`);
      return reply.send({});
    });

    fastify.delete<{
      Body: {
        mutedParentUrl: string;
      };
    }>("/mute/channels", async (request, reply) => {
      const { fid } = (await request.jwtDecode()) as { fid: string };
      const mutedParentUrl = request.body.mutedParentUrl;

      await client.userMutedParentUrl.delete({
        where: {
          fid_mutedParentUrl: {
            mutedParentUrl,
            fid,
          },
        },
      });
      await cache.removeUserMute(fid, `channel:${mutedParentUrl}`);
      return reply.send({});
    });

    fastify.post<{ Body: { mutedWord: string } }>(
      "/mute/words",
      async (request, reply) => {
        const { fid } = (await request.jwtDecode()) as { fid: string };
        const mutedWord = request.body.mutedWord;

        await client.userMutedWord.upsert({
          where: {
            fid_mutedWord: {
              mutedWord,
              fid,
            },
          },
          create: {
            mutedWord,
            fid,
          },
          update: {},
        });
        await cache.addUserMute(fid, `word:${mutedWord}`);
        return reply.send({});
      },
    );

    fastify.delete<{ Body: { mutedWord: string } }>(
      "/mute/words",
      async (request, reply) => {
        const { fid } = (await request.jwtDecode()) as { fid: string };
        const mutedWord = request.body.mutedWord;

        await client.userMutedWord.delete({
          where: {
            fid_mutedWord: {
              mutedWord,
              fid,
            },
          },
        });
        await cache.removeUserMute(fid, `word:${mutedWord}`);
        return reply.send({});
      },
    );
  });
};
