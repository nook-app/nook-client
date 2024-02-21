import { PrismaClient, FarcasterUserData } from "@nook/common/prisma/farcaster";
import {
  bufferToHex,
  bufferToHexAddress,
  timestampToDate,
} from "@nook/common/farcaster";
import { Message } from "@farcaster/hub-nodejs";

const prisma = new PrismaClient();

export const handleUserDataAdd = async (message: Message) => {
  const userData = messageToUserData(message);
  if (!userData) return;

  await prisma.farcasterUserData.upsert({
    where: {
      fid_type: {
        fid: userData.fid,
        type: userData.type,
      },
    },
    create: userData,
    update: userData,
  });

  console.log(
    `[user-data-add] [${userData.fid}] added ${userData.type} with value ${userData.value}`,
  );

  return userData;
};

export const messageToUserData = (
  message: Message,
): FarcasterUserData | undefined => {
  if (!message.data?.userDataBody) return;

  const fid = BigInt(message.data.fid);

  return {
    fid,
    type: message.data.userDataBody.type,
    value: message.data.userDataBody.value,
    timestamp: timestampToDate(message.data.timestamp),
    hash: bufferToHex(message.hash),
    hashScheme: message.hashScheme,
    signer: bufferToHexAddress(message.signer),
    signatureScheme: message.signatureScheme,
    signature: bufferToHex(message.signature),
  };
};

export const backfillUserDataAdd = async (messages: Message[]) => {
  const userDatas = messages
    .map(messageToUserData)
    .filter(Boolean) as FarcasterUserData[];
  if (userDatas.length > 0) {
    await prisma.farcasterUserData.createMany({
      data: userDatas,
      skipDuplicates: true,
    });
  }
  return userDatas;
};
