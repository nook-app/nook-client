import { PrismaClient } from "@nook/common/prisma/farcaster";
import { timestampToDate, bufferToHexAddress } from "@nook/common/farcaster";
import { Message } from "@farcaster/hub-nodejs";
import { messageToVerification } from "../utils";

export const handleVerificationAdd = async (
  prisma: PrismaClient,
  message: Message,
) => {
  const verification = messageToVerification(message);
  if (!verification) return;

  await prisma.farcasterVerification.upsert({
    where: {
      fid_address: {
        fid: verification.fid,
        address: verification.address,
      },
    },
    create: verification,
    update: verification,
  });

  console.log(
    `[verification-add] [${verification.fid}] added ${verification.address}`,
  );

  return verification;
};

export const handleVerificationRemove = async (
  prisma: PrismaClient,
  message: Message,
) => {
  if (!message.data?.verificationRemoveBody?.address) return;

  const fid = BigInt(message.data.fid);
  const address = bufferToHexAddress(
    message.data.verificationRemoveBody.address,
  );
  const protocol = message.data.verificationRemoveBody.protocol;

  await prisma.farcasterVerification.updateMany({
    where: {
      fid,
      address,
    },
    data: {
      deletedAt: timestampToDate(message.data.timestamp),
    },
  });

  console.log(`[verification-remove] [${fid}] removed ${address}`);

  return await prisma.farcasterVerification.findFirst({
    where: { address, protocol },
  });
};
