import { FastifyInstance } from "fastify";
import { UserService } from "../service/user";

export const notificationsRoutes = async (fastify: FastifyInstance) => {
  fastify.register(async (fastify: FastifyInstance) => {
    const service = new UserService(fastify);

    fastify.get("/user", async (request, reply) => {
      const { fid } = (await request.jwtDecode()) as { fid: string };
      try {
        const user = await service.getNotificationUser(fid);
        if (!user) {
          return reply.code(404).send({ message: "User not found" });
        }
        return reply.send({ fid: user.fid, disabled: user.disabled });
      } catch (e) {
        reply.code(500).send({ message: (e as Error).message });
      }
    });

    fastify.delete("/user", async (request, reply) => {
      const { fid } = (await request.jwtDecode()) as { fid: string };
      try {
        await service.deleteNotificationUser(fid);
        reply.code(204).send({ fid });
      } catch (e) {
        reply.code(500).send({ message: (e as Error).message });
      }
    });

    fastify.post<{ Body: { token: string } }>(
      "/user",
      async (request, reply) => {
        const { fid } = (await request.jwtDecode()) as { fid: string };
        try {
          await service.createNotificationUser(fid, request.body.token);
          reply.code(201).send({ fid });
        } catch (e) {
          reply.code(500).send({ message: (e as Error).message });
        }
      },
    );
  });
};
