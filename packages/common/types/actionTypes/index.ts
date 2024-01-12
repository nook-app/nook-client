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

  /** Source identity of entity acting */
  sourceEntityId: string;

  /** Source identity of entity who was acted on */
  sourceTargetEntityId: string;
};

export type PostActionData = ContentActionData & {
  /** Post */
  content: PostData;
};
