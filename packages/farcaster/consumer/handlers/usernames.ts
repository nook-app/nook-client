import { HubRpcClient, UserNameProof } from "@farcaster/hub-nodejs";
import {
  PrismaClient,
  FarcasterUsernameProof,
} from "@nook/common/prisma/farcaster";
import {
  MessageHandlerArgs,
  bufferToHex,
  bufferToHexAddress,
} from "@nook/common/farcaster";
import {
  EventService,
  EventType,
  FarcasterUsernameProofData,
  RawEvent,
} from "@nook/common/types";
import {
  publishRawEvent,
  publishRawEvents,
  toJobId,
} from "@nook/common/queues";

const prisma = new PrismaClient();

export const handleUsernameProofAdd = async ({
  message,
}: MessageHandlerArgs) => {
  if (!message?.data?.usernameProofBody) return;
  const proof = messageToUsernameProof(message.data.usernameProofBody);

  await prisma.farcasterUsernameProof.upsert({
    where: {
      username: proof.username,
    },
    create: proof,
    update: proof,
  });

  console.log(`[username-proof-add] [${proof.fid}] added ${proof.username}`);

  const event = transformToUsernameProofEvent(proof);
  await publishRawEvent(event);
};

const messageToUsernameProof = (
  message: UserNameProof,
): FarcasterUsernameProof => {
  return {
    fid: BigInt(message.fid),
    username: Buffer.from(message.name).toString(),
    owner: bufferToHexAddress(message.owner),
    signature: bufferToHex(message.signature),
    type: message.type,
    timestamp: new Date(message.timestamp * 1000),
    deletedAt: null,
  };
};

export const getAndBackfillUsernameProofs = async (
  client: HubRpcClient,
  fids: string[],
) => {
  const messages = (
    await Promise.all(
      fids.map(async (fid) => {
        const message = await client.getUserNameProofsByFid({
          fid: parseInt(fid),
        });

        if (message.isErr()) {
          return undefined;
        }

        return message.value.proofs;
      }),
    )
  ).filter(Boolean) as UserNameProof[][];

  const usernameProofs = await backfillUsernameProofs(messages.flat());
  const events = usernameProofs.map(transformToUsernameProofEvent);
  await publishRawEvents(events);
  return events;
};

export const backfillUsernameProofs = async (messages: UserNameProof[]) => {
  const proofs = messages
    .map(messageToUsernameProof)
    .filter(Boolean) as FarcasterUsernameProof[];
  if (proofs.length > 0) {
    await prisma.farcasterUsernameProof.createMany({
      data: proofs,
      skipDuplicates: true,
    });
  }
  return proofs;
};

const transformToUsernameProofEvent = (
  data: FarcasterUsernameProof,
): RawEvent<FarcasterUsernameProofData> => {
  const source = {
    service: EventService.FARCASTER,
    type: EventType.USERNAME_PROOF,
    id: data.signature,
    entityId: data.fid.toString(),
  };
  return {
    eventId: toJobId(source),
    source,
    timestamp: data.timestamp.toString(),
    data: {
      fid: data.fid.toString(),
      username: data.username,
      owner: data.owner,
      claimSignature: data.signature,
      type: data.type,
    },
  };
};
