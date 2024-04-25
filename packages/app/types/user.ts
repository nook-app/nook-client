import { Feed, Display } from "./feed";

export type FarcasterUserBadges = {
  powerBadge: boolean;
};

export type FarcasterUserEngagement = {
  followers: number;
  following: number;
};

export type FarcasterUserMutualsPreview = {
  preview: BaseFarcasterUser[];
  total: number;
};

export type FarcasterUserContext = {
  following: boolean;
  followers: boolean;
  mutuals?: FarcasterUserMutualsPreview;
};

export type BaseFarcasterUser = {
  fid: string;
  username?: string;
  pfp?: string;
  displayName?: string;
  bio?: string;
  url?: string;
  verifiedAddresses?: { protocol: number; address: string }[];
};

export type FarcasterUser = BaseFarcasterUser & {
  engagement: FarcasterUserEngagement;
  context?: FarcasterUserContext;
  badges?: FarcasterUserBadges;
};

export type GetSignerResponse = {
  publicKey: string;
  token: string;
  deeplinkUrl: string;
  state: string;
};

export type ValidateSignerResponse = {
  state: string;
};

export type User = {
  mutedUsers: string[];
  mutedChannels: string[];
  mutedWords: string[];
  metadata?: UserMetadata;
  nooks: Nook[];
  feeds: Feed[];
};

export type UserMetadata = {
  enableDegenTip?: boolean;
  order?: [string, string[]][];
  colorSchemeOverride?: "light" | "dark" | null;
};

export type Nook = {
  id: string;
  name: string;
  icon?: string;
  panels: Panel[];
  type: "default" | "custom";
};

export type Panel = {
  id: string;
  type: string;
  key: string;
  name: string;
  display?: Display;
};
