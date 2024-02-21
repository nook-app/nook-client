export type Channel = {
  contentId: string;
  slug: string;
  name: string;
  description: string;
  imageUrl: string;
  creatorId?: string;
  createdAt: Date;
  updatedAt: Date;
};
