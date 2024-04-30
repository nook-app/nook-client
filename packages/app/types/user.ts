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
  publicKey: `0x${string}`;
  token: string;
  deeplinkUrl: string;
  state: string;
  requestFid?: string;
  deadline?: number;
  signature?: `0x${string}`;
  requestAddress?: `0x${string}`;
};

export type ValidateSignerResponse = {
  state: string;
};

export type PendingSignerResponse = {
  publicKey: `0x${string}`;
  requestFid: string;
  deadline: number;
  signature: `0x${string}`;
  requestAddress: `0x${string}`;
};

export type User = {
  mutedUsers: string[];
  mutedChannels: string[];
  mutedWords: string[];
  metadata?: UserMetadata;
  nooks: Nook[];
  feeds: Feed[];
  actions: CastActionInstall[];
};

export type CastActionInstall = {
  index: number;
  action: CastAction;
};

export type CastAction = {
  actionType: string;
  postUrl: string;
  name: string;
  icon: string;
  description?: string;
  aboutUrl?: string;
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

export type FnameTransfer = {
  id: string;
  timestamp: number;
  username: string;
  owner: string;
  from: number;
  to: number;
  user_signature: string;
  server_signature: string;
};

export type SubmitFnameTransfer = {
  name: string;
  from: number;
  to: number;
  fid: number;
  owner: string;
  timestamp: number;
  signature: string;
};
