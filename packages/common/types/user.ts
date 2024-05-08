export type User = {
  mutedUsers: string[];
  mutedChannels: string[];
  mutedWords: string[];
  metadata?: UserMetadata;
  actions: CastActionInstall[];
};

export type UserMetadata = {
  enableDegenTip?: boolean;
  order?: [string, string[]][];
  colorSchemeOverride?: "light" | "dark" | null;
};

export type CastActionInstall = {
  index: number;
  action: CastAction;
};

export type Session = {
  fid: string;
  token: string;
  refreshToken: string;
  expiresAt: number;
  theme?: string;
};

export type CastAction = {
  actionType: string;
  postUrl: string;
  name: string;
  icon: string;
  description?: string;
  aboutUrl?: string;
};
