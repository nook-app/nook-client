export enum ModalName {
  CreatePost = "createPost",
  EnableSigner = "enableSigner",
}

export interface EntityModalState {
  entityId: string;
}

export interface ChannelModalState {
  channelId: string;
}

export interface ContentModalState {
  contentId: string;
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
}
