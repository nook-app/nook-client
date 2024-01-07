import { MongoClient } from "@flink/common/mongo";
import { ContentRequest } from "@flink/common/types";

export type HandlerArgs = {
  client: MongoClient;
  request: ContentRequest;
};
