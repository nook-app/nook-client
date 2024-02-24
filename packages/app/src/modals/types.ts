export enum ModalName {
  Entity = "entity",
  Channel = "channel",
  CreatePost = "createPost",
  EnableSigner = "enableSigner",
  ContentQuotes = "contentQuotes",
  ContentLikes = "contentLikes",
  ContentReposts = "contentReposts",
  EntityFollowers = "entityFollowers",
  EntityFollowing = "entityFollowing",
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
  [ModalName.Entity]: ModalState<EntityModalState>;
  [ModalName.Channel]: ModalState<ChannelModalState>;
  [ModalName.CreatePost]: ModalState<undefined>;
  [ModalName.EnableSigner]: ModalState<undefined>;
  [ModalName.ContentQuotes]: ModalState<ContentModalState>;
  [ModalName.ContentLikes]: ModalState<ContentModalState>;
  [ModalName.ContentReposts]: ModalState<ContentModalState>;
  [ModalName.EntityFollowers]: ModalState<EntityModalState>;
  [ModalName.EntityFollowing]: ModalState<EntityModalState>;
}
