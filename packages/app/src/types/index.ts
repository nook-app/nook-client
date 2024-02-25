export type RootStackParamList = {
  Nooks: undefined;
  Nook: {
    nookId: string;
    shelfId?: string;
  };
  Content: {
    contentId: string;
  };
  Entity: {
    entityId: string;
  };
  Channel: {
    channelId: string;
  };
};
