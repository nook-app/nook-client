export type RootStackParamList = {
  Nooks: undefined;
  Nook: {
    nookId: string;
    shelfId?: string;
  };
  User: {
    userId: string;
  };
  UserFollowers: {
    userId: string;
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
  ContentScreen: {
    uri: string;
  };
};
