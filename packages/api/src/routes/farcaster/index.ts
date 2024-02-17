import { FastifyInstance } from "fastify";
import { SignerService } from "../../services/signerService";

export const farcasterRoutes = async (fastify: FastifyInstance) => {
  fastify.register(async (fastify: FastifyInstance) => {
    const signerService = new SignerService(fastify);

    fastify.get("/farcaster/signer", async (request, reply) => {
      const { id } = (await request.jwtDecode()) as { id: string };
      try {
        const data = await signerService.getFarcasterSigner(id);
        return reply.send(data);
      } catch (e) {
        console.error("/farcaster/signer", e);
        return reply.code(500).send({ message: (e as Error).message });
      }
    });

    fastify.get<{ Querystring: { token: string } }>(
      "/farcaster/signer/validate",
      async (request, reply) => {
        await request.jwtVerify();
        try {
          const data = await signerService.validateFarcasterSigner(
            request.query.token,
          );
          return reply.send(data);
        } catch (e) {
          console.error("/farcaster/signer/validate", e);
          return reply.code(500).send({ message: (e as Error).message });
        }
      },
    );
  });
};
