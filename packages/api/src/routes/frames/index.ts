import { FastifyInstance } from "fastify";
import { FramePayload, SubmitFrameActionRequest } from "@nook/common/types";
import { SignerAPIClient } from "@nook/common/clients";
import { getFrame } from "frames.js";

export const frameRoutes = async (fastify: FastifyInstance) => {
  fastify.register(async (fastify: FastifyInstance) => {
    const signerClient = new SignerAPIClient();

    fastify.post<{ Body: SubmitFrameActionRequest }>(
      "/frames/action",
      async (request, reply) => {
        if (!request.headers.authorization) {
          return reply.code(401).send({ message: "Unauthorized" });
        }

        const { fid } = (await request.jwtDecode()) as { fid: string };

        const response = await signerClient.submitFrameAction(
          request.headers.authorization,
          request.body,
        );

        if ("message" in response) {
          return reply.code(400).send(response);
        }

        const payload: FramePayload = {
          untrustedData: {
            fid: parseInt(fid, 10),
            url: request.body.postUrl,
            messageHash: response.hash,
            timestamp: Date.now(),
            network: 1,
            buttonIndex: request.body.buttonIndex,
            inputText: request.body.inputText,
            state: request.body.state,
            castId: {
              fid: parseInt(request.body.castFid, 10),
              hash: request.body.castHash,
            },
          },
          trustedData: {
            messageBytes: response.trustedBytes?.slice(2) || "",
          },
        };

        const result = await Promise.race([
          fetch(request.body.postUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          }) as Promise<Response>,
          new Promise((resolve) =>
            setTimeout(() => resolve({ timeout: true }), 5000),
          ) as Promise<{ timeout: boolean }>,
        ]);

        if ("timeout" in result) {
          return reply.code(200).send({ message: "Request timed out" });
        }

        if (!result.ok) {
          try {
            const { message } = await result.json();
            return reply.code(200).send({ message });
          } catch (e) {
            return reply.code(200).send({ message: "Failed to get frame" });
          }
        }

        if (result.status === 302) {
          return reply
            .code(302)
            .send({ location: result.headers.get("Location") });
        }

        if (request.body.action === "tx") {
          const response = await result.json();
          return reply.send({ transaction: response });
        }

        const htmlString = await result.text();
        const { frame } = getFrame({
          htmlString,
          url: request.body.postUrl,
        });

        return reply.send({ frame });
      },
    );
  });
};
