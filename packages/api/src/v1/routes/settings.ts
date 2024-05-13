import { FastifyInstance } from "fastify";
import { SettingsService } from "../services/settings";
import { CastActionV1Request, CastActionV2Request } from "@nook/common/types";

export const settingsRoutes = async (fastify: FastifyInstance) => {
  fastify.register(async (fastify: FastifyInstance) => {
    const settingsService = new SettingsService(fastify);

    fastify.get("/user/settings", async (request, reply) => {
      const { fid } = (await request.jwtDecode()) as { fid: string };
      try {
        const settings = await settingsService.getSettings(fid);
        if (!settings) {
          return reply.send({});
        }
        return reply.send(settings);
      } catch (e) {
        console.error(e);
        return reply.code(500).send({ message: (e as Error).message });
      }
    });

    fastify.patch<{ Body: { theme: string } }>(
      "/user/settings/theme",
      async (request, reply) => {
        const { fid } = (await request.jwtDecode()) as { fid: string };
        try {
          await settingsService.updateTheme(fid, request.body.theme);
          return reply.send({});
        } catch (e) {
          console.error(e);
          return reply.code(500).send({ message: (e as Error).message });
        }
      },
    );

    fastify.post<{
      Body: {
        mutedFid: string;
      };
    }>("/user/settings/mute/users", async (request, reply) => {
      const { fid } = (await request.jwtDecode()) as { fid: string };
      try {
        await settingsService.muteUser(fid, request.body.mutedFid);
        return reply.send({});
      } catch (e) {
        console.error(e);
        return reply.code(500).send({ message: (e as Error).message });
      }
    });

    fastify.delete<{
      Body: {
        mutedFid: string;
      };
    }>("/user/settings/mute/users", async (request, reply) => {
      const { fid } = (await request.jwtDecode()) as { fid: string };
      try {
        await settingsService.unmuteUser(fid, request.body.mutedFid);
        return reply.send({});
      } catch (e) {
        console.error(e);
        return reply.code(500).send({ message: (e as Error).message });
      }
    });

    fastify.post<{
      Body: {
        mutedParentUrl: string;
      };
    }>("/user/settings/mute/channels", async (request, reply) => {
      const { fid } = (await request.jwtDecode()) as { fid: string };
      try {
        await settingsService.muteChannel(fid, request.body.mutedParentUrl);
        return reply.send({});
      } catch (e) {
        console.error(e);
        return reply.code(500).send({ message: (e as Error).message });
      }
    });

    fastify.delete<{
      Body: {
        mutedParentUrl: string;
      };
    }>("/user/settings/mute/channels", async (request, reply) => {
      const { fid } = (await request.jwtDecode()) as { fid: string };
      try {
        await settingsService.unmuteChannel(fid, request.body.mutedParentUrl);
        return reply.send({});
      } catch (e) {
        console.error(e);
        return reply.code(500).send({ message: (e as Error).message });
      }
    });

    fastify.post<{ Body: { mutedWord: string } }>(
      "/user/settings/mute/words",
      async (request, reply) => {
        const { fid } = (await request.jwtDecode()) as { fid: string };
        try {
          await settingsService.muteWord(fid, request.body.mutedWord);
          return reply.send({});
        } catch (e) {
          console.error(e);
          return reply.code(500).send({ message: (e as Error).message });
        }
      },
    );

    fastify.delete<{ Body: { mutedWord: string } }>(
      "/user/settings/mute/words",
      async (request, reply) => {
        const { fid } = (await request.jwtDecode()) as { fid: string };
        try {
          await settingsService.unmuteWord(fid, request.body.mutedWord);
          return reply.send({});
        } catch (e) {
          console.error(e);
          return reply.code(500).send({ message: (e as Error).message });
        }
      },
    );

    fastify.put<{
      Body: {
        index: number;
        action: CastActionV1Request | CastActionV2Request | null;
      };
    }>("/user/settings/actions", async (request, reply) => {
      const { fid } = (await request.jwtDecode()) as { fid: string };
      if (request.body.action === null) {
        await settingsService.deleteAction(fid, request.body.index);
      } else if ("url" in request.body.action) {
        await settingsService.setV2Action(
          fid,
          request.body.index,
          request.body.action,
        );
      } else {
        await settingsService.setV1Action(
          fid,
          request.body.index,
          request.body.action,
        );
      }
      return reply.send({});
    });
  });
};
