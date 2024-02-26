export type RootStackParamList = {
  Nooks: undefined;
  Nook: {
    nookId: string;
    shelfId?: string;
  };
  Channel: {
    channelId: string;
  };
  Entity: {
    entityId: string;
  };
  EntityFollowers: {
    entityId: string;
    defaultTab?: "Followers" | "Following";
  };
  Content: {
    contentId: string;
  };
  ContentLikes: {
    contentId: string;
  };
  ContentReposts: {
    contentId: string;
  };
  ContentQuotes: {
    contentId: string;
  };
};
