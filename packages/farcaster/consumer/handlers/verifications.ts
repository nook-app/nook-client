import {
  PrismaClient,
  FarcasterVerification,
} from "@nook/common/prisma/farcaster";
import {
  bufferToHex,
  timestampToDate,
  bufferToHexAddress,
} from "@nook/common/farcaster";
import { Message } from "@farcaster/hub-nodejs";

const prisma = new PrismaClient();

export const handleVerificationAdd = async (message: Message) => {
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

export const handleVerificationRemove = async (message: Message) => {
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

const messageToVerification = (
  message: Message,
): FarcasterVerification | undefined => {
  if (!message.data?.verificationAddAddressBody) return;

  const fid = BigInt(message.data.fid);
  const address = bufferToHexAddress(
    message.data.verificationAddAddressBody.address,
  );

  return {
    fid,
    address,
    protocol: message.data.verificationAddAddressBody.protocol,
    verificationType: message.data.verificationAddAddressBody.verificationType,
    chainId: message.data.verificationAddAddressBody.chainId,
    claimSignature: bufferToHex(
      message.data.verificationAddAddressBody.claimSignature,
    ),
    blockHash: bufferToHex(message.data.verificationAddAddressBody.blockHash),
    timestamp: timestampToDate(message.data.timestamp),
    deletedAt: null,
    hash: bufferToHex(message.hash),
    hashScheme: message.hashScheme,
    signer: bufferToHexAddress(message.signer),
    signatureScheme: message.signatureScheme,
    signature: bufferToHex(message.signature),
  };
};

export const backfillVerificationAdd = async (messages: Message[]) => {
  const verifications = messages
    .map(messageToVerification)
    .filter(Boolean) as FarcasterVerification[];
  if (verifications.length) {
    await prisma.farcasterVerification.createMany({
      data: verifications,
      skipDuplicates: true,
    });
  }
  return verifications;
};
