export type EntityResponse = {
  id: string;
  farcaster: {
    fid: string;
    username?: string;
    displayName?: string;
    bio?: string;
    url?: string;
    pfp?: string;
  };
  blockchain: {
    protocol: string;
    address: string;
    isContract: boolean;
  }[];
  usernames: {
    service: string;
    username: string;
  }[];
};
