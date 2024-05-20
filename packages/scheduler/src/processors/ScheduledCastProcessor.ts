import { SignerAPIClient } from "@nook/common/clients";
import { PendingCast, PrismaClient } from "@nook/common/prisma/nook";

export class ScheduledCastEventProcessor {
  private client: PrismaClient;
  private signerService: SignerAPIClient;

  constructor() {
    this.client = new PrismaClient();
    this.signerService = new SignerAPIClient();
  }

  async process(message: PendingCast) {
    const response = await this.signerService.submitScheduledCast({
      data: message,
    });
    if (response.hash === null) {
      throw new Error(`Failed to submit scheduled cast ${message.id}`);
    }
    await this.client.pendingCast.update({
      where: { id: message.id },
      data: {
        publishedAt: new Date(),
      },
    });
    console.log("hello world");
  }
}
