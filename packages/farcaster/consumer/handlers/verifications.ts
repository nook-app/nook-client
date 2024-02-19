import {
  PrismaClient,
  FarcasterVerification,
} from "@nook/common/prisma/farcaster";
import {
  bufferToHex,
  timestampToDate,
  MessageHandlerArgs,
  bufferToHexAddress,
} from "../../utils";
import { HubRpcClient, Message } from "@farcaster/hub-nodejs";
import {
  EventService,
  EventType,
  FarcasterVerificationData,
  RawEvent,
} from "@nook/common/types";
import { publishRawEvent, toJobId } from "@nook/common/queues";

const prisma = new PrismaClient();

export const handleVerificationAdd = async ({
  message,
}: MessageHandlerArgs) => {
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

  const event = transformToVerificationEvent(
    EventType.VERIFICATION_ADD_ETH_ADDRESS,
    verification,
  );

  return event;
};

export const handleVerificationRemove = async ({
  message,
}: MessageHandlerArgs) => {
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

  const verification = await prisma.farcasterVerification.findFirst({
    where: { address, protocol },
  });
  if (verification) {
    const event = transformToVerificationEvent(
      EventType.VERIFICATION_REMOVE,
      verification,
    );
    await publishRawEvent(event);
  }
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

export const getAndBackfillVerfications = async (
  client: HubRpcClient,
  fids: string[],
) => {
  const messages = (
    await Promise.all(
      fids.map(async (fid) => {
        const message = await client.getAllVerificationMessagesByFid({
          fid: parseInt(fid),
        });

        if (message.isErr()) {
          return undefined;
        }

        return message.value.messages;
      }),
    )
  ).flat() as Message[];

  return await backfillVerifications(messages);
};

export const backfillVerifications = async (messages: Message[]) => {
  const verifications = messages
    .map(messageToVerification)
    .filter(Boolean) as FarcasterVerification[];
  await prisma.farcasterVerification.deleteMany({
    where: {
      OR: verifications.map((verification) => ({
        fid: verification.fid,
        address: verification.address,
      })),
    },
  });
  await prisma.farcasterVerification.createMany({
    data: verifications,
    skipDuplicates: true,
  });
  return verifications;
};

const transformToVerificationEvent = (
  type: EventType,
  data: FarcasterVerification,
): RawEvent<FarcasterVerificationData> => {
  const source = {
    service: EventService.FARCASTER,
    type,
    id: data.hash,
    entityId: data.fid.toString(),
  };

  return {
    eventId: toJobId(source),
    source,
    timestamp: data.timestamp.toString(),
    data: {
      fid: data.fid.toString(),
      address: data.address,
      protocol: data.protocol,
      verificationType: data.verificationType,
      blockHash: data.blockHash,
      chainId: data.chainId,
      claimSignature: data.claimSignature,
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
