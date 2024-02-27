export type FidHash = {
  fid: bigint;
  hash: string;
};

export type FarcasterUser = {
  fid: bigint;
  username?: string;
  pfp?: string;
  displayName?: string;
  bio?: string;
  url?: string;
};
