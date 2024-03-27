import {
  HubResult,
  HubRpcClient,
  Message,
  MessagesResponse,
  UserNameProof,
  getSSLHubRpcClient,
} from "@farcaster/hub-nodejs";
import {
  findRootParent,
  messageToCast,
  messageToCastEmbedCast,
  messageToCastEmbedUrl,
  messageToCastMentions,
  messageToCastReaction,
  messageToLink,
  messageToUrlReaction,
  messageToUserData,
  messageToUsernameProof,
  messageToVerification,
} from "@nook/common/farcaster";
import {
  FarcasterCast,
  FarcasterCastEmbedCast,
  FarcasterCastEmbedUrl,
  FarcasterCastMention,
  FarcasterCastReaction,
  FarcasterLink,
  FarcasterUrlReaction,
  FarcasterUserData,
  FarcasterUsernameProof,
  FarcasterVerification,
  Prisma,
  PrismaClient,
} from "@nook/common/prisma/farcaster";

export class FarcasterBackfillProcessor {
  private client: PrismaClient;
  private hub: HubRpcClient;

  constructor() {
    this.client = new PrismaClient();
    this.hub = getSSLHubRpcClient(process.env.HUB_RPC_ENDPOINT as string);
  }

  async backfillFid(fid: number) {
    console.log(`[${fid}] backfilling...`);

    await Promise.all([
      this.handleCastAdd(fid),
      this.handleLinkAdd(fid),
      this.handleReactionAdd(fid),
      this.handleUsernameProofAdd(fid),
      this.handleUserDataAdd(fid),
      this.handleVerificationAdd(fid),
    ]);
  }

  async handleCastAdd(fid: number) {
    const castMessages = await this.getMessagesFromHub(fid, (fid, pageToken) =>
      this.hub.getCastsByFid({ fid, pageToken }),
    );
    await this.backfillCastAdd(castMessages);
    console.log(`[${fid}] backfilled ${castMessages.length} casts`);
  }

  async handleLinkAdd(fid: number) {
    const linkMessages = await this.getMessagesFromHub(fid, (fid, pageToken) =>
      this.hub.getLinksByFid({ fid, pageToken }),
    );
    await this.backfillLinkAdd(linkMessages);
    console.log(`[${fid}] backfilled ${linkMessages.length} links`);
  }

  async handleReactionAdd(fid: number) {
    const reactionMessages = await this.getMessagesFromHub(
      fid,
      (fid, pageToken) => this.hub.getReactionsByFid({ fid, pageToken }),
    );
    await this.backfillReactionAdd(reactionMessages);
    console.log(`[${fid}] backfilled ${reactionMessages.length} reactions`);
  }

  async handleUsernameProofAdd(fid: number) {
    const usernameProofs = await this.hub.getUserNameProofsByFid({ fid });
    if (usernameProofs.isErr()) {
      throw new Error(
        `failed to get username proofs for fid: ${fid}`,
        usernameProofs.error,
      );
    }
    await this.backfillUsernameProofAdd(usernameProofs.value.proofs);
    console.log(
      `[${fid}] backfilled ${usernameProofs.value.proofs.length} username proofs`,
    );
  }

  async handleUserDataAdd(fid: number) {
    const userDataMessages = await this.getMessagesFromHub(
      fid,
      (fid, pageToken) => this.hub.getUserDataByFid({ fid, pageToken }),
    );
    await this.backfillUserDataAdd(userDataMessages);
    console.log(
      `[${fid}] backfilled ${userDataMessages.length} user data messages`,
    );
  }

  async handleVerificationAdd(fid: number) {
    const verificationMessages = await this.getMessagesFromHub(
      fid,
      (fid, pageToken) => this.hub.getVerificationsByFid({ fid, pageToken }),
    );
    await this.backfillVerificationAdd(verificationMessages);
    console.log(
      `[${fid}] backfilled ${verificationMessages.length} verifications`,
    );
  }

  async getMessagesFromHub(
    fid: number,
    fn: (
      fid: number,
      pageToken?: Uint8Array,
    ) => Promise<HubResult<MessagesResponse>>,
  ) {
    const messages: Message[] = [];

    let pageToken: Uint8Array | undefined = undefined;
    do {
      const response = await fn(fid, pageToken);

      if (response.isErr()) {
        throw new Error(
          `failed to get messages for fid: ${fid}`,
          response.error,
        );
      }

      messages.push(...response.value.messages);
      pageToken = response.value.nextPageToken;
    } while (pageToken?.length);

    return messages;
  }

  async backfillCastAdd(messages: Message[]) {
    const casts = messages
      .map(messageToCast)
      .filter(Boolean) as FarcasterCast[];
    if (casts.length === 0) return [];

    const rootParents = await Promise.all(
      casts.map((cast) => findRootParent(this.hub, cast)),
    );

    for (let i = 0; i < casts.length; i++) {
      casts[i].rootParentFid = rootParents[i].rootParentFid;
      casts[i].rootParentHash = rootParents[i].rootParentHash;
      casts[i].rootParentUrl = rootParents[i].rootParentUrl;
    }

    await this.client.farcasterCast.createMany({
      data: casts as Prisma.FarcasterCastCreateInput[],
      skipDuplicates: true,
    });

    const embedCasts = messages
      .map(messageToCastEmbedCast)
      .filter(Boolean) as FarcasterCastEmbedCast[][];

    const embedUrls = messages
      .map(messageToCastEmbedUrl)
      .filter(Boolean) as FarcasterCastEmbedUrl[][];

    const mentions = messages
      .map(messageToCastMentions)
      .filter(Boolean) as FarcasterCastMention[][];

    await this.client.farcasterCastEmbedCast.createMany({
      data: embedCasts.flat(),
      skipDuplicates: true,
    });

    await this.client.farcasterCastEmbedUrl.createMany({
      data: embedUrls.flat(),
      skipDuplicates: true,
    });

    await this.client.farcasterCastMention.createMany({
      data: mentions.flat(),
      skipDuplicates: true,
    });

    return casts;
  }

  async backfillLinkAdd(messages: Message[]) {
    const links = messages
      .map(messageToLink)
      .filter(Boolean) as FarcasterLink[];
    if (links.length > 0) {
      await this.client.farcasterLink.createMany({
        data: links,
        skipDuplicates: true,
      });
    }
    return links;
  }

  async backfillReactionAdd(messages: Message[]) {
    const castReactions = messages
      .map(messageToCastReaction)
      .filter(Boolean) as FarcasterCastReaction[];
    if (castReactions.length > 0) {
      await this.client.farcasterCastReaction.createMany({
        data: castReactions,
        skipDuplicates: true,
      });
    }

    const urlReactions = messages
      .map(messageToUrlReaction)
      .filter(Boolean) as FarcasterUrlReaction[];
    if (urlReactions.length > 0) {
      await this.client.farcasterUrlReaction.createMany({
        data: urlReactions,
        skipDuplicates: true,
      });
    }

    return { castReactions, urlReactions };
  }

  async backfillUsernameProofAdd(messages: UserNameProof[]) {
    const proofs = messages
      .map(messageToUsernameProof)
      .filter(Boolean) as FarcasterUsernameProof[];
    if (proofs.length > 0) {
      await this.client.farcasterUsernameProof.createMany({
        data: proofs,
        skipDuplicates: true,
      });
    }
    return proofs;
  }

  async backfillUserDataAdd(messages: Message[]) {
    const userDatas = messages
      .map(messageToUserData)
      .filter(Boolean) as FarcasterUserData[];
    if (userDatas.length > 0) {
      await this.client.farcasterUserData.createMany({
        data: userDatas,
        skipDuplicates: true,
      });
    }
    return userDatas;
  }

  async backfillVerificationAdd(messages: Message[]) {
    const verifications = messages
      .map(messageToVerification)
      .filter(Boolean) as FarcasterVerification[];
    if (verifications.length) {
      await this.client.farcasterVerification.createMany({
        data: verifications,
        skipDuplicates: true,
      });
    }
    return verifications;
  }
}
