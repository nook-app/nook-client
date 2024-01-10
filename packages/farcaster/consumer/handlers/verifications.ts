import {
  PrismaClient,
  FarcasterEthVerification,
} from "@flink/common/prisma/farcaster";
import { bufferToHex, timestampToDate, MessageHandlerArgs } from "../../utils";
import { Message } from "@farcaster/hub-nodejs";

const prisma = new PrismaClient();

export const handleVerificationAdd = async ({
  message,
}: MessageHandlerArgs) => {
  const verification = messageToVerification(message);
  if (!verification) return;

  await prisma.farcasterEthVerification.upsert({
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
};

export const handleVerificationRemove = async ({
  message,
}: MessageHandlerArgs) => {
  if (!message.data?.verificationRemoveBody?.address) return;

  const fid = BigInt(message.data.fid);
  const address = bufferToHex(message.data.verificationRemoveBody.address);

  await prisma.farcasterEthVerification.updateMany({
    where: {
      fid,
      address,
    },
    data: {
      deletedAt: timestampToDate(message.data.timestamp),
    },
  });

  console.log(`[verification-remove] [${fid}] removed ${address}`);
};

const messageToVerification = (
  message: Message,
): FarcasterEthVerification | undefined => {
  if (!message.data?.verificationAddEthAddressBody) return;

  const fid = BigInt(message.data.fid);
  const address = bufferToHex(
    message.data.verificationAddEthAddressBody.address,
  );

  return {
    fid,
    address,
    type: message.data.verificationAddEthAddressBody.verificationType,
    chainId: message.data.verificationAddEthAddressBody.chainId,
    ethSignature: bufferToHex(
      message.data.verificationAddEthAddressBody.ethSignature,
    ),
    blockHash: bufferToHex(
      message.data.verificationAddEthAddressBody.blockHash,
    ),
    timestamp: timestampToDate(message.data.timestamp),
    deletedAt: null,
    hash: bufferToHex(message.hash),
    hashScheme: message.hashScheme,
    signer: bufferToHex(message.signer),
    signatureScheme: message.signatureScheme,
    signature: bufferToHex(message.signature),
  };
};

export const backfillVerifications = async (messages: Message[]) => {
  const verifications = messages.map(messageToVerification).filter(Boolean);
  await prisma.farcasterEthVerification.createMany({
    data: verifications,
    skipDuplicates: true,
  });
};
