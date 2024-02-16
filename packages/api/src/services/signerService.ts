import { PrismaClient } from "@flink/common/prisma/nook";
import { FastifyInstance } from "fastify";

export class SignerService {
  private client: PrismaClient;
  constructor(fastify: FastifyInstance) {
    this.client = fastify.nook.client;
  }

  async authFarcaster() {}
}
