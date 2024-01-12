import {
  PrismaClient,
  FarcasterUserData,
} from "@flink/common/prisma/farcaster";
import { MessageHandlerArgs, bufferToHex } from "../../utils";
import { HubRpcClient, Message } from "@farcaster/hub-nodejs";

const prisma = new PrismaClient();

export const handleUserDataAdd = async ({ message }: MessageHandlerArgs) => {
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
    hash: bufferToHex(message.hash),
    hashScheme: message.hashScheme,
    signer: bufferToHex(message.signer),
    signatureScheme: message.signatureScheme,
    signature: bufferToHex(message.signature),
  };
};

export const getAndBackfillUserDatas = async (
  client: HubRpcClient,
  fids: string[],
) => {
  const messages = (
    await Promise.all(
      fids.map(async (fid) => {
        const message = await client.getAllUserDataMessagesByFid({
          fid: parseInt(fid),
        });

        if (message.isErr()) {
          return undefined;
        }

        return message.value.messages;
      }),
    )
  ).filter(Boolean);

  return await backfillUserDatas(messages.flat());
};

export const backfillUserDatas = async (messages: Message[]) => {
  const userDatas = messages.map(messageToUserData).filter(Boolean);
  await prisma.farcasterUserData.deleteMany({
    where: {
      OR: userDatas.map((userData) => ({
        fid: userData.fid,
        type: userData.type,
      })),
    },
  });
  await prisma.farcasterUserData.createMany({
    data: userDatas,
    skipDuplicates: true,
  });
  return userDatas;
};
