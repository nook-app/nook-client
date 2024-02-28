export type RootStackParamList = {
  Nooks: undefined;
  Nook: {
    nookId: string;
    shelfId?: string;
  };
  Entity: {
    entityId: string;
  };
  EntityFollowers: {
    entityId: string;
    defaultTab?: "Followers" | "Following";
  };
  FarcasterCast: {
    hash: string;
  };
  FarcasterCastLikes: {
    hash: string;
  };
  FarcasterCastReposts: {
    hash: string;
  };
  FarcasterCastQuotes: {
    hash: string;
  };
  FarcasterChannel: {
    channelId: string;
  };
};
