import { Message, UserNameProof } from "@farcaster/hub-nodejs";
import {
  PrismaClient,
  FarcasterUsernameProof,
} from "@nook/common/prisma/farcaster";
import { bufferToHex, bufferToHexAddress } from "@nook/common/farcaster";

const prisma = new PrismaClient();

export const handleUsernameProofAdd = async (message: Message) => {
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

  return proof;
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

export const backfillUsernameProofAdd = async (messages: UserNameProof[]) => {
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
