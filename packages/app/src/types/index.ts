export type RootStackParamList = {
  Nooks: {
    nookId: string;
  };
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
