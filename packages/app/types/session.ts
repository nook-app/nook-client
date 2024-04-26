import { FarcasterUser, GetSignerResponse } from "./user";

export type Session = {
  fid: string;
  token: string;
  refreshToken: string;
  expiresAt: number;
  theme?: string;
  signer?: GetSignerResponse;
  user?: FarcasterUser;
};

export type SignInDevParams = {
  username: string;
  password: string;
};
