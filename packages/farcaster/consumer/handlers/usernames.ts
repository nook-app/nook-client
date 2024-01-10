import { UserNameProof } from "@farcaster/hub-nodejs";
import {
  PrismaClient,
  FarcasterUsernameProof,
} from "@flink/common/prisma/farcaster";
import { MessageHandlerArgs, bufferToHex, timestampToDate } from "../../utils";

const prisma = new PrismaClient();

const messageToUsernameProof = (
  message: UserNameProof,
): FarcasterUsernameProof | undefined => {
  return {
    fid: BigInt(message.fid),
    username: Buffer.from(message.name).toString(),
    owner: bufferToHex(message.owner),
    signature: bufferToHex(message.signature),
    type: message.type,
    timestamp: timestampToDate(message.timestamp),
    deletedAt: null,
  };
};

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
};

export const backfillUsernameProofs = async (messages: UserNameProof[]) => {
  const proofs = messages.map(messageToUsernameProof).filter(Boolean);
  await prisma.farcasterUsernameProof.createMany({
    data: proofs,
    skipDuplicates: true,
  });
};
