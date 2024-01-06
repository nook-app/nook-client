export enum SocialPlatform {
  FARCASTER = "farcaster",
}

export enum IdentityRequestType {
  FID = "fid",
}

export type IdentitiesRequest = {
  type: IdentityRequestType;
  ids: string[];
};

export type IdentitySocialAccount = {
  id: string;
  platform: string;
  platformId: string;
  source: string;
  verified: boolean;
};

export type Identity = {
  id: string;
  socialAccounts: IdentitySocialAccount[];
};
