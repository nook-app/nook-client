import { PrismaClient } from "@nook/common/prisma/nook";
import { QueueName, getQueue } from "@nook/common/queues";

function toJobId(id: string) {
  return `${QueueName.ScheduledCast}-${id}`;
}

export const queueScheduledCasts = async () => {
  console.log("queuing scheduled casts");
  const queue = getQueue(QueueName.ScheduledCast);
  const prismaClient = new PrismaClient();

  const time = new Date();
  const scheduledCasts = await prismaClient.pendingCast.findMany({
    where: {
      scheduledFor: { not: null, lt: time },
      publishedAt: null,
      attemptedAt: null,
    },
  });
  let numProcessed = 0;
  if (scheduledCasts.length > 0) {
    try {
      queue.addBulk(
        scheduledCasts.map((x) => ({
          name: QueueName.ScheduledCast,
          data: x,
          opts: {
            jobId: toJobId(x.id),
          },
        })),
      );

      numProcessed += scheduledCasts.length;
    } catch (err) {
      console.error(err);
      process.exit(1);
    }
  }
  console.log(`Queued ${numProcessed} scheduled casts `);
};
