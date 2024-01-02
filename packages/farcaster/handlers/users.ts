import {
  PrismaClient,
  FarcasterUsernameProof,
  FarcasterUser,
} from "@flink/prisma/farcaster";
import { bufferToHex, timestampToDate } from "../utils";
import { FidHandlerArgs, MessageHandlerArgs } from "../types";

const prisma = new PrismaClient();

export const handleUserDataAdd = async ({
  message,
  client,
}: MessageHandlerArgs) => {
  const fid = message.data?.fid;
  if (!fid) return;
  await handlerUserUpdate({ client, fid });
};

export const handleUsernameProofAdd = async ({
  message,
}: MessageHandlerArgs) => {
  if (!message.data?.usernameProofBody) return;

  const proof: FarcasterUsernameProof = {
    fid: BigInt(message.data.fid),
    username: Buffer.from(message.data.usernameProofBody.name).toString(),
    address: bufferToHex(message.data.usernameProofBody.owner),
    type: message.data.usernameProofBody.type,
    timestamp: timestampToDate(message.data.timestamp),
    deletedAt: null,
  };

  await prisma.farcasterUsernameProof.upsert({
    where: {
      username: proof.username,
    },
    create: proof,
    update: proof,
  });

  console.log(`[username-proof-add] [${proof.fid}] added ${proof.username}`);
};

export const handlerUserUpdate = async ({ client, fid }: FidHandlerArgs) => {
  console.log(`[user-update] [${fid}] updating user`);

  const userDataMessages = await client.getUserDataByFid({ fid });
  if (userDataMessages.isErr()) {
    throw new Error(userDataMessages.error.message);
  }

  const messages = userDataMessages.value.messages;

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
