import { ObjectId } from "mongodb";
import { PostData } from "../contentTypes";

export type ContentActionData = {
  /** Identity of entity acting */
  entityId: ObjectId;

  /** Content being acted on */
  contentId: string;
};

export type EntityActionData = {
  /** Identity of entity acting */
  entityId: ObjectId;

  /** Identity of entity who was acted on */
  targetEntityId: ObjectId;
};

export type PostActionData = ContentActionData & {
  /** Post */
  content: PostData;
};
