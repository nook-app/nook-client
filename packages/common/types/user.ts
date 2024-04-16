export type User = {
  metadata?: UserMetadata;
};

export type UserMetadata = {
  enableDegenTip?: boolean;
  order?: [string, string[]][];
};
