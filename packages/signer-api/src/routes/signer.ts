import { FastifyInstance } from "fastify";
import { SignerService } from "../service/signer";
import {
  PendingCastRequest,
  SubmitCastAddRequest,
  SubmitCastRemoveRequest,
  SubmitFrameActionRequest,
  SubmitLinkAddRequest,
  SubmitLinkRemoveRequest,
  SubmitReactionAddRequest,
  SubmitReactionRemoveRequest,
  SubmitUserDataAddRequest,
} from "@nook/common/types";
import { PendingCast } from "@nook/common/prisma/nook";

export const signerRoutes = async (fastify: FastifyInstance) => {
  fastify.register(async (fastify: FastifyInstance) => {
    const signerService = new SignerService(fastify);

    fastify.get<{ Querystring: { address?: string } }>(
      "/signer",
      async (request, reply) => {
        const { fid } = (await request.jwtDecode()) as { fid: string };
        try {
          const data = await signerService.getSigner(
            fid,
            request.query.address,
          );
          return reply.send(data);
        } catch (e) {
          console.error(e);
          return reply.code(500).send({ message: (e as Error).message });
        }
      },
    );

    fastify.get<{ Params: { address: string } }>(
      "/signer/:address",
      async (request, reply) => {
        try {
          const data = await signerService.getPendingSigner(
            request.params.address,
          );
          return reply.send(data);
        } catch (e) {
          console.error(e);
          return reply.code(500).send({ message: (e as Error).message });
        }
      },
    );

    fastify.get<{ Querystring: { token?: string; publicKey?: string } }>(
      "/signer/validate",
      async (request, reply) => {
        await request.jwtVerify();
        try {
          if (request.query.publicKey) {
            const response = await signerService.validateSignerByPublicKey(
              request.query.publicKey,
            );
            return reply.send(response);
          }
          if (!request.query.token) {
            throw new Error("Missing token or public key");
          }
          const response = await signerService.validateSigner(
            request.query.token,
          );
          return reply.send(response);
        } catch (e) {
          console.error(e);
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
          console.error(e);
          return reply.code(500).send({ message: (e as Error).message });
        }
      },
    );

    fastify.post<{ Body: { data: SubmitCastAddRequest[] } }>(
      "/signer/cast-add/thread",
      async (request, reply) => {
        const { fid } = (await request.jwtDecode()) as { fid: string };
        try {
          const response = await signerService.submitCastAddThread(
            fid,
            request.body.data,
          );
          return reply.send(response);
        } catch (e) {
          console.error(e);
          return reply.code(500).send({ message: (e as Error).message });
        }
      },
    );

    fastify.post<{
      Body: { data: PendingCast };
      Reply: { id: string; hash: string | null } | { message: string };
    }>("/signer/cast-add/scheduled", async (request, reply) => {
      try {
        console.log("submitting pending casts");
        const response = await signerService.submitPendingCast(
          request.body.data,
        );
        return reply.send(response);
      } catch (e) {
        console.error(e);
        return reply.code(500).send({ message: (e as Error).message });
      }
    });

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
          console.error(e);
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
          console.error(e);
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
          console.error(e);
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
          console.error(e);
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
          console.error(e);
          return reply.code(500).send({ message: (e as Error).message });
        }
      },
    );

    fastify.post<{ Body: SubmitUserDataAddRequest }>(
      "/signer/user-data-add",
      async (request, reply) => {
        const { fid } = (await request.jwtDecode()) as { fid: string };
        try {
          const response = await signerService.submitUserDataAdd(
            fid,
            request.body,
          );
          return reply.send(response);
        } catch (e) {
          console.error(e);
          return reply.code(500).send({ message: (e as Error).message });
        }
      },
    );

    fastify.post<{ Body: SubmitFrameActionRequest }>(
      "/signer/frame-action",
      async (request, reply) => {
        const { fid } = (await request.jwtDecode()) as { fid: string };
        try {
          const response = await signerService.signFrameAction(
            fid,
            request.body,
          );
          return reply.send(response);
        } catch (e) {
          console.error(e);
          return reply.code(500).send({ message: (e as Error).message });
        }
      },
    );
  });
};
