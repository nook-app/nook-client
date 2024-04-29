export type Session = {
  fid: string;
  token: string;
  refreshToken: string;
  expiresAt: number;
  theme?: string;
};

export type SignInDevParams = {
  username: string;
  password: string;
};
