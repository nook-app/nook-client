import { FastifyInstance } from "fastify";
import { FarconService } from "../../services/farcon";

export const farconRoutes = async (fastify: FastifyInstance) => {
  fastify.register(async (fastify: FastifyInstance) => {
    const farcon = new FarconService(fastify);

    fastify.post<{ Body: { following?: boolean; cursor: string } }>(
      "/farcon/attendees",
      async (request, reply) => {
        let viewerFid: string | undefined;
        try {
          const { fid } = (await request.jwtDecode()) as { fid: string };
          viewerFid = fid;
        } catch (e) {}

        try {
          const attendees = await farcon.getAttendees(request.body, viewerFid);
          return reply.send(attendees);
        } catch (e) {
          console.error(e);
          return reply.code(500).send({ message: (e as Error).message });
        }
      },
    );
  });
};
