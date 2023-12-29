export enum EventSource {
  FARCASTER = "farcaster",
}

export type FarcasterEventData = {
  timestamp: number;
  fid: string;
  hash: string;
  text: string;
  parentFid?: string;
  parentHash?: string;
  parentUrl?: string;
  rootParentFid: string;
  rootParentHash: string;
  rootParentUrl?: string;
  mentions: {
    mention: string;
    mentionPosition: string;
  }[];
  urlEmbeds: string[];
  castEmbeds: {
    fid: string;
    hash: string;
  }[];
};

export type PreprocessedEvent = {
  timestamp: number;
  source: EventSource;
  sourceId: string;
  data: FarcasterEventData;
};

export type Event = PreprocessedEvent & {
  userId: string;
  identityMapping: { [key: string]: string };
};
