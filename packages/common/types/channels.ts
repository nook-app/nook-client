import { ObjectId } from "mongodb";

export type Channel = {
  contentId: string;
  slug: string;
  name: string;
  description: string;
  imageUrl: string;
  creatorId?: ObjectId;
  createdAt: Date;
  updatedAt: Date;
};
