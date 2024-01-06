import {
  HubEvent,
  HubEventType,
  getSSLHubRpcClient,
} from "@farcaster/hub-nodejs";
import { QueueName, getQueue } from "@flink/common/queues";
import { PrismaClient } from "@flink/common/prisma/farcaster";

const prisma = new PrismaClient();

const EVENT_UPDATE_INTERVAL = 100;
const SUBSCRIPTION_ID = "main";

const run = async () => {
  const hubRpcEndpoint = process.env.HUB_RPC_ENDPOINT;
  if (!hubRpcEndpoint) {
    throw new Error("Missing HUB_RPC_ENDPOINT");
  }

  const client = getSSLHubRpcClient(hubRpcEndpoint);

  const lastSubscription = await prisma.subscription.findFirst({
    where: { id: SUBSCRIPTION_ID },
  });

  const subscription = await client.subscribe({
    eventTypes: [HubEventType.MERGE_MESSAGE],
    ...(lastSubscription && { fromId: Number(lastSubscription.eventId) }),
  });

  if (!subscription.isOk()) {
    throw new Error("Failed to subscribe");
  }

  const queue = getQueue(QueueName.FarcasterIngress);

  let processedEvents = 0;
  for await (const event of subscription.value) {
    const typedEvent = event as HubEvent;
    const message = typedEvent.mergeMessageBody?.message;
    if (!message?.data) {
      continue;
    }

    console.log(`[farcaster-publisher] published event ${typedEvent.id}`);

    await queue.add(typedEvent.id.toString(), message);

    processedEvents++;
    if (processedEvents % EVENT_UPDATE_INTERVAL === 0) {
      await updateLastEventId(BigInt(typedEvent.id));
    }
  }
};

const updateLastEventId = async (eventId: bigint) => {
  await prisma.subscription.upsert({
    where: { id: SUBSCRIPTION_ID },
    create: { id: SUBSCRIPTION_ID, eventId },
    update: { eventId },
  });
};

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
