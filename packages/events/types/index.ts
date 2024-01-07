import { MongoClient } from "@flink/common/mongo";
import { RawEvent } from "@flink/common/types";

export type HandlerArgs = {
  client: MongoClient;
  rawEvent: RawEvent;
};
