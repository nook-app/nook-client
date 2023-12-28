import { HubRpcClient, Message } from "@farcaster/hub-nodejs";

export type MessageHandlerArgs = {
  client: HubRpcClient;
  message: Message;
};

export type FidHandlerArgs = {
  client: HubRpcClient;
  fid: number;
};
