import { ObjectId } from "mongodb";
import { PostData } from "../contentTypes";

export type ContentActionData = {
  /** Identity of user acting */
  userId: ObjectId;

  /** Content being acted on */
  contentId: string;
};

export type UserActionData = {
  /** Identity of user acting */
  userId: ObjectId;

  /** Identity of user who was acted on */
  targetUserId: ObjectId;
};

export type PostActionData = ContentActionData & {
  /** Post */
  content: PostData;
};
