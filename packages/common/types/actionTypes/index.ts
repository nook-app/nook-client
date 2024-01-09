import { PostData } from "../contentTypes";

export type ContentActionData = {
  /** Identity of user acting */
  userId: string;

  /** Content being acted on */
  contentId: string;
};

export type UserActionData = {
  /** Identity of user acting */
  userId: string;

  /** Identity of user who was acted on */
  targetUserId: string;
};

export type PostActionData = ContentActionData & {
  /** Post */
  content: PostData;
};
