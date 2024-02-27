import { EntityEvent, EntityEventData } from "@nook/common/types";
import { EntityClient } from "@nook/common/entity";
import { Job } from "bullmq";

export const getEventsHandler = async () => {
  const entityClient = new EntityClient();
  await entityClient.connect();

  return async (job: Job<EntityEvent<EntityEventData>>) => {
    const event = job.data;

    const entity = await entityClient.getByFid(event.userId);
    console.log(entity);

    console.log(
      `[${event.source.service}] [${event.source.type}] processed ${event.source.id} by ${event.userId}`,
    );
  };
};
