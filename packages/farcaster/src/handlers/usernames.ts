import { Message } from "@farcaster/hub-nodejs";
import { PrismaClient } from "@nook/common/prisma/farcaster";
import { messageToUsernameProof } from "../utils";

export const handleUsernameProofAdd = async (
  prisma: PrismaClient,
  message: Message,
) => {
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
