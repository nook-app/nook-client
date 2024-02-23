export type RootStackParamList = {
  Nooks: undefined;
  Nook: {
    nookId: string;
  };
  Shelf: {
    nookId: string;
    shelfId?: string;
  };
  Content: {
    contentId: string;
  };
  Notifications: undefined;
  Profile: undefined;
  EnableSigner: undefined;
  CreatePost: undefined;
};
