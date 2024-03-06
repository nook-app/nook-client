export enum ModalName {
  CreatePost = "createPost",
  EnableSigner = "enableSigner",
  Content = "content",
}

export interface ContentModalState {
  uri: string;
}

export interface SelectChannelModalState {
  channel?: string;
  onSelect: (channelId: string) => void;
}

export interface ModalState<T> {
  isOpen: boolean;
  initialState?: T;
}

export interface ModalsState {
  [ModalName.CreatePost]: ModalState<undefined>;
  [ModalName.EnableSigner]: ModalState<undefined>;
  [ModalName.Content]: ModalState<ContentModalState>;
}
