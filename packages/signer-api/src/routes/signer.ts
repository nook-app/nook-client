import { FastifyInstance } from "fastify";
import { SignerService } from "../service/signer";
import {
  SubmitCastAddRequest,
  SubmitCastRemoveRequest,
  SubmitLinkAddRequest,
  SubmitLinkRemoveRequest,
  SubmitReactionAddRequest,
  SubmitReactionRemoveRequest,
} from "@nook/common/types";

export const signerRoutes = async (fastify: FastifyInstance) => {
  fastify.register(async (fastify: FastifyInstance) => {
    const signerService = new SignerService(fastify);

    fastify.get("/signer", async (request, reply) => {
      const { fid } = (await request.jwtDecode()) as { fid: string };
      try {
        const data = await signerService.getSigner(fid);
        return reply.send(data);
      } catch (e) {
        return reply.code(500).send({ message: (e as Error).message });
      }
    });

    fastify.get<{ Querystring: { token: string } }>(
      "/signer/validate",
      async (request, reply) => {
        await request.jwtVerify();
        try {
          const response = await signerService.validateSigner(
            request.query.token,
          );
          return reply.send(response);
        } catch (e) {
          return reply.code(500).send({ message: (e as Error).message });
        }
      },
    );

    fastify.post<{ Body: SubmitCastAddRequest }>(
      "/signer/cast-add",
      async (request, reply) => {
        const { fid } = (await request.jwtDecode()) as { fid: string };
        try {
          const response = await signerService.submitCastAdd(fid, request.body);
          return reply.send(response);
        } catch (e) {
          return reply.code(500).send({ message: (e as Error).message });
        }
      },
    );

    fastify.post<{ Body: SubmitCastRemoveRequest }>(
      "/signer/cast-remove",
      async (request, reply) => {
        const { fid } = (await request.jwtDecode()) as { fid: string };
        try {
          const response = await signerService.submitCastRemove(
            fid,
            request.body,
          );
          return reply.send(response);
        } catch (e) {
          return reply.code(500).send({ message: (e as Error).message });
        }
      },
    );

    fastify.post<{ Body: SubmitReactionAddRequest }>(
      "/signer/reaction-add",
      async (request, reply) => {
        const { fid } = (await request.jwtDecode()) as { fid: string };
        try {
          const response = await signerService.submitReactionAdd(
            fid,
            request.body,
          );
          return reply.send(response);
        } catch (e) {
          return reply.code(500).send({ message: (e as Error).message });
        }
      },
    );

    fastify.post<{ Body: SubmitReactionRemoveRequest }>(
      "/signer/reaction-remove",
      async (request, reply) => {
        const { fid } = (await request.jwtDecode()) as { fid: string };
        try {
          const response = await signerService.submitReactionRemove(
            fid,
            request.body,
          );
          return reply.send(response);
        } catch (e) {
          return reply.code(500).send({ message: (e as Error).message });
        }
      },
    );

    fastify.post<{ Body: SubmitLinkAddRequest }>(
      "/signer/link-add",
      async (request, reply) => {
        const { fid } = (await request.jwtDecode()) as { fid: string };
        try {
          const response = await signerService.submitLinkAdd(fid, request.body);
          return reply.send(response);
        } catch (e) {
          return reply.code(500).send({ message: (e as Error).message });
        }
      },
    );

    fastify.post<{ Body: SubmitLinkRemoveRequest }>(
      "/signer/link-remove",
      async (request, reply) => {
        const { fid } = (await request.jwtDecode()) as { fid: string };
        try {
          const response = await signerService.submitLinkRemove(
            fid,
            request.body,
          );
          return reply.send(response);
        } catch (e) {
          return reply.code(500).send({ message: (e as Error).message });
        }
      },
    );
  });
};
