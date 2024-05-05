import { Channel, FarcasterCast } from "./cast";
import { NotificationResponse } from "./notifications";
import { Transaction } from "./transactions";
import { CastAction, FarcasterUser } from "./user";

export * from "./user";
export * from "./content";
export * from "./form";
export * from "./actions";
export * from "./notifications";
export * from "./cast";
export * from "./feed";
export * from "./session";
export * from "./transactions";
export * from "./simplehash";

export type FetchCastsResponse = {
  data: FarcasterCast[];
  nextCursor?: string;
};

export type FetchUsersResponse = {
  data: FarcasterUser[];
  nextCursor?: string;
};

export type FetchNotificationsResponse = {
  data: NotificationResponse[];
  nextCursor?: string;
};

export type FetchChannelsResponse = {
  data: Channel[];
  nextCursor?: string;
};

export type FetchCatActionsResponse = {
  data: CastAction[];
  nextCursor?: string;
};

export type FetchTransactionsResponse = {
  data: Transaction[];
  nextCursor?: string;
};
