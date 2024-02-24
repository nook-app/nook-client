import { PrismaClient } from "@nook/common/prisma/farcaster";
import { Message } from "@farcaster/hub-nodejs";
import { messageToUserData } from "../utils";

export const handleUserDataAdd = async (
  prisma: PrismaClient,
  message: Message,
) => {
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
