import { FarcasterCast } from "./cast";
import { NotificationResponse } from "./notifications";
import { FarcasterUser } from "./user";

export * from "./user";
export * from "./content";
export * from "./form";
export * from "./actions";
export * from "./notifications";
export * from "./cast";
export * from "./feed";
export * from "./session";

export type FarcasterCastsResponse = {
  data: FarcasterCast[];
  nextCursor?: string;
};

export type FarcasterUsersResponse = {
  data: FarcasterUser[];
  nextCursor?: string;
};

export type FetchNotificationsResponse = {
  data: NotificationResponse[];
  nextCursor?: string;
};
