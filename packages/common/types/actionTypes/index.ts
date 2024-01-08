export type ReactionData = {
  /** Identity of user who reacted */
  userId: string;

  /** Identity of user who was reacted to */
  targetUserId?: string;

  /** Content user reacted to */
  contentId: string;
};
