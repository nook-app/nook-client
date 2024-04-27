"use server";

import { makeRequest } from "../api/utils";
import {
  FarcasterFeedFilter,
  FetchCastsResponse,
  FetchChannelsResponse,
  FetchUsersResponse,
} from "../types";

export const fetchCastFeed = async (
  filter: FarcasterFeedFilter,
  cursor?: string,
): Promise<FetchCastsResponse> => {
  return await makeRequest("/farcaster/casts/feed", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ filter, cursor }),
  });
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

export const searchUsers = async (
  query: string,
  cursor?: string,
  limit?: number,
): Promise<FetchUsersResponse> => {
  return await makeRequest(
    `/farcaster/users?query=${query}${cursor ? `&cursor=${cursor}` : ""}${
      limit ? `&limit=${limit}` : ""
    }`,
  );
};

export const fetchCastReplies = async (
  hash: string,
  mode: "best" | "new" | "top",
  cursor?: string,
) => {
  return await makeRequest(
    `/farcaster/casts/${hash}/replies${mode !== "best" ? `/${mode}` : ""}${
      cursor ? `?cursor=${cursor}` : ""
    }`,
  );
};

export const fetchTrendingCasts = async (
  viewerFid?: string,
  cursor?: string,
) => {
  return await makeRequest("/panels", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      type: "default",
      key: "trending",
      context: {
        viewerFid,
      },
      cursor,
    }),
  });
};

export const fetchCastQuotes = async (hash: string, cursor?: string) => {
  return await makeRequest(
    `/farcaster/casts/${hash}/quotes${cursor ? `?cursor=${cursor}` : ""}`,
  );
};

export const fetchCastLikes = async (hash: string, cursor?: string) => {
  return await makeRequest(
    `/farcaster/casts/${hash}/likes${cursor ? `?cursor=${cursor}` : ""}`,
  );
};

export const fetchCastRecasts = async (hash: string, cursor?: string) => {
  return await makeRequest(
    `/farcaster/casts/${hash}/recasts${cursor ? `?cursor=${cursor}` : ""}`,
  );
};

export const fetchUserFollowers = async (username: string, cursor?: string) => {
  return await makeRequest(
    `/farcaster/users/${username}/followers${
      cursor ? `?cursor=${cursor}` : ""
    }`,
  );
};

export const fetchUserFollowing = async (username: string, cursor?: string) => {
  return await makeRequest(
    `/farcaster/users/${username}/following${
      cursor ? `?cursor=${cursor}` : ""
    }`,
  );
};

export const fetchUserMutuals = async (username: string, cursor?: string) => {
  return await makeRequest(
    `/farcaster/users/${username}/mutuals${cursor ? `?cursor=${cursor}` : ""}`,
  );
};
