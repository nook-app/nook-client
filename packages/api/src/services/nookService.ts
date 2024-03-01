import { FastifyInstance } from "fastify";
import { NookClient } from "@nook/common/clients";

export class NookService {
  private nookClient: NookClient;

  constructor(fastify: FastifyInstance) {
    this.nookClient = fastify.nook.client;
  }

  async getNook(nookId: string) {
    return await this.nookClient.getNook(nookId);
  }

  async getChannels() {
    return await this.nookClient.getAllChannels();
  }

  async getChannel(id: string) {
    return await this.nookClient.getChannel(id);
  }

  async searchChannels(search: string) {
    return await this.nookClient.searchChannels(search);
  }
}
