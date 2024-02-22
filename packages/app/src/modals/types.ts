export enum ModalName {
  Entity = "entity",
  Channel = "channel",
}

export interface EntityModalState {
  entityId: string;
}

export interface ChannelModalState {
  channelId: string;
}

export interface ModalState<T> {
  isOpen: boolean;
  initialState?: T;
}

export interface ModalsState {
  [ModalName.Entity]: ModalState<EntityModalState>;
  [ModalName.Channel]: ModalState<ChannelModalState>;
}
