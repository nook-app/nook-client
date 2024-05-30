import { Channel, FetchChannelsResponse } from "@nook/common/types";
import { makeRequest } from "../utils";

export const fetchChannel = async (channelId: string): Promise<Channel> => {
  return await makeRequest(`/farcaster/channels/${channelId}`);
};

export const fetchRecommendedChannels =
  async (): Promise<FetchChannelsResponse> => {
    return await makeRequest("/farcaster/channels/recommended");
  };

export const searchChannels = async (
  query: string,
  cursor?: string,
  limit?: number,
): Promise<FetchChannelsResponse> => {
  return await makeRequest(
    `/farcaster/channels?query=${query}${cursor ? `&cursor=${cursor}` : ""}${
      limit ? `&limit=${limit}` : ""
    }`,
  );
};

export const fetchChannels = async (
  channelIds: string[],
): Promise<FetchChannelsResponse> => {
  return await makeRequest("/farcaster/channels", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ channelIds }),
  });
};

export const fetchChannelUrls = async (
  parentUrls: string[],
): Promise<FetchChannelsResponse> => {
  return await makeRequest("/farcaster/channels", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ parentUrls }),
  });
};
