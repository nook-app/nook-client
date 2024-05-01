import { FastifyInstance } from "fastify";
import { GetContentRequest } from "@nook/common/types";
import { ContentAPIClient } from "@nook/common/clients";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { fromEnv } from "@aws-sdk/credential-providers";
import { randomUUID } from "crypto";

export const contentRoutes = async (fastify: FastifyInstance) => {
  fastify.register(async (fastify: FastifyInstance) => {
    const client = new ContentAPIClient();
    const s3 = new S3Client({
      credentials: fromEnv(),
      region: "us-west-1",
    });

    fastify.post<{ Body: GetContentRequest }>(
      "/content",
      async (request, reply) => {
        await request.jwtVerify();
        const data = await client.getContent(request.body.uri);
        if (!data) {
          reply.status(404).send({ message: "Content not found" });
          return;
        }
        return reply.send(data);
      },
    );

    fastify.post<{ Body: { type: string } }>(
      "/content/upload-url",
      async (request, reply) => {
        await request.jwtVerify();
        const key = randomUUID();

        console.log(request.body.type, key);

        const command = new PutObjectCommand({
          Bucket: "nook-social",
          Key: key,
          ContentType: request.body.type,
        });

        const url = await getSignedUrl(s3, command, { expiresIn: 60 * 15 });
        return reply.send({ url, name: key });
      },
    );
  });
};
