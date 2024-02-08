import {
  PrismaClient,
  FarcasterUserData,
} from "@flink/common/prisma/farcaster";
import {
  MessageHandlerArgs,
  bufferToHex,
  bufferToHexAddress,
} from "../../utils";
import { HubRpcClient, Message } from "@farcaster/hub-nodejs";
import {
  EventService,
  EventType,
  FarcasterUserDataAddData,
  RawEvent,
} from "@flink/common/types";
import { publishRawEvent, toJobId } from "@flink/common/queues";

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

  const event = transformToUserDataEvent(userData);
  await publishRawEvent(event);
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
    timestamp: new Date(message.data.timestamp),
    hash: bufferToHex(message.hash),
    hashScheme: message.hashScheme,
    signer: bufferToHexAddress(message.signer),
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
  ).filter(Boolean) as Message[][];

  return await backfillUserDatas(messages.flat());
};

export const backfillUserDatas = async (messages: Message[]) => {
  const userDatas = messages
    .map(messageToUserData)
    .filter(Boolean) as FarcasterUserData[];
  if (userDatas.length !== 0) {
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
  }
  return userDatas;
};

const transformToUserDataEvent = (
  data: FarcasterUserData,
): RawEvent<FarcasterUserDataAddData> => {
  const source = {
    service: EventService.FARCASTER,
    type: EventType.USER_DATA_ADD,
    id: data.hash,
    entityId: data.fid.toString(),
  };
  return {
    eventId: toJobId(source),
    source,
    timestamp: data.timestamp.toString(),
    data: {
      fid: data.fid.toString(),
      type: data.type,
      value: data.value,
      signature: {
        hash: data.hash,
        hashScheme: data.hashScheme,
        signature: data.signature,
        signatureScheme: data.signatureScheme,
        signer: data.signer,
      },
    },
  };
};
