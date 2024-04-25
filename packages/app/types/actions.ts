import { Frame, TransactionTargetResponse } from "./frames";

export type SubmitCastAddRequest = {
  text: string;
  parentUrl?: string;
  parentFid?: string;
  parentHash?: string;
  embeds?: string[];
  parsedEmbeds?: string[];
  castEmbedFid?: string;
  castEmbedHash?: string;
};

export type SubmitCastRemoveRequest = {
  hash: string;
};

export type SubmitReactionAddRequest = {
  reactionType: number;
  targetFid: string;
  targetHash: string;
};

export type SubmitReactionRemoveRequest = {
  reactionType: number;
  targetFid: string;
  targetHash: string;
};

export type SubmitLinkAddRequest = {
  linkType: string;
  targetFid: string;
  username?: string;
};

export type SubmitLinkRemoveRequest = {
  linkType: string;
  targetFid: string;
  username?: string;
};

export type SubmitMessageResponse = {
  hash: string;
  trustedBytes?: string;
};

export type SubmitMessageError = {
  message: string;
};

export type SubmitFrameActionRequest = {
  url: string;
  castFid: string;
  castHash: string;
  postUrl: string;
  action?: string;
  inputText?: string;
  buttonIndex: number;
  state?: string;
  address?: string;
  transactionId?: string;
};

export type FramePayload = {
  untrustedData: {
    fid: number;
    url: string;
    messageHash: string;
    timestamp: number;
    network: number;
    buttonIndex: number;
    inputText?: string;
    state?: string;
    castId: {
      fid: number;
      hash: string;
    };
  };
  trustedData: {
    messageBytes: string;
  };
};

export type SubmitFrameActionResponse = {
  location?: string;
  frame?: Frame;
  transaction?: TransactionTargetResponse;
};

export type ImgurUploadResponse = {
  data: {
    link: string;
  };
};

export type CastActionRequest = {
  name: string;
  icon: string;
  actionType: string;
  description?: string;
  aboutUrl?: string;
  postUrl: string;
  users?: number;
  creatorFid?: string;
};
