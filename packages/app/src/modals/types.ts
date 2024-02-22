export enum ModalName {
  Entity = "entity",
  Channel = "channel",
  CreatePost = "createPost",
  EnableSigner = "enableSigner",
}

export interface EntityModalState {
  entityId: string;
}

export interface ChannelModalState {
  channelId: string;
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
  [ModalName.Entity]: ModalState<EntityModalState>;
  [ModalName.Channel]: ModalState<ChannelModalState>;
  [ModalName.CreatePost]: ModalState<undefined>;
  [ModalName.EnableSigner]: ModalState<undefined>;
}
