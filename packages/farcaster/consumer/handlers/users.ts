import { PrismaClient, FarcasterUser } from "@flink/common/prisma/farcaster";
import { MessageHandlerArgs } from "../../utils";
import { Message } from "@farcaster/hub-nodejs";

const prisma = new PrismaClient();

export const handleUserDataAdd = async ({
  message,
  client,
}: MessageHandlerArgs) => {
  const fid = message.data?.fid;
  if (!fid) return;
  console.log(`[user-update] [${fid}] updating user`);

  const userDatas = await client.getUserDataByFid({ fid });
  if (userDatas.isErr()) {
    throw new Error(userDatas.error.message);
  }

  await backfillUser(userDatas.value.messages);
};

export const backfillUser = async (messages: Message[]) => {
  const fid = messages[0].data?.fid;
  const user: FarcasterUser = {
    fid: BigInt(fid),
    pfp: null,
    display: null,
    bio: null,
    url: null,
    username: null,
  };

  for (const message of messages) {
    if (!message.data?.userDataBody) continue;
    const data = message.data.userDataBody;
    if (data.type === 1) {
      user.pfp = data.value;
    } else if (data.type === 2) {
      user.display = data.value;
    } else if (data.type === 3) {
      user.bio = data.value;
    } else if (data.type === 5) {
      user.url = data.value;
    } else if (data.type === 6) {
      user.username = data.value;
    }
  }

  await prisma.farcasterUser.upsert({
    where: {
      fid: user.fid,
    },
    create: user,
    update: user,
  });
};
