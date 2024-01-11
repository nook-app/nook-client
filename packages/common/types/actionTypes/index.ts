import { ObjectId } from "mongodb";
import { PostData } from "../contentTypes";
import { FarcasterVerificationType, UserDataType } from "../sources";

export type ContentActionData = {
  /** Entity acting */
  entityId: ObjectId;

  /** Content being acted on */
  contentId: string;
};

export type EntityActionData = {
  /** Entity acting */
  entityId: ObjectId;

  /** Entity who was acted on */
  targetEntityId: ObjectId;

  /** Source entity acting */
  sourceEntityId: string;

  /** Source entity who was acted on */
  sourceTargetEntityId: string;
};

export type PostActionData = ContentActionData & {
  /** Post */
  content: PostData;
};

export type UserDataActionData = {
  /** Identity of user acting */
  userId: string;
  /** The type of data added or updated by the user */
  userDataType: UserDataType;
  /** User data */
  userData: string;
};

export type VerificationActionData = {
  /** Identity of user acting */
  userId: string;
  /** Address verified */
  address: string;
  /** The type of verification if an Add action */
  type?: FarcasterVerificationType;
};
