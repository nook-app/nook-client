import {
  FarcasterCastV1,
  FetchCastsResponse,
  FetchUsersResponse,
} from "@nook/common/types";
import { makeRequest } from "../utils";

export const fetchCast = async (hash: string): Promise<FarcasterCastV1> => {
  return await makeRequest(`/farcaster/casts/${hash}`);
};

export const fetchCastLikes = async (
  hash: string,
  cursor?: string,
): Promise<FetchUsersResponse> => {
  return await makeRequest(
    `/farcaster/casts/${hash}/likes${cursor ? `?cursor=${cursor}` : ""}`,
  );
};

export const fetchCastRecasts = async (
  hash: string,
  cursor?: string,
): Promise<FetchUsersResponse> => {
  return await makeRequest(
    `/farcaster/casts/${hash}/recasts${cursor ? `?cursor=${cursor}` : ""}`,
  );
};

export const fetchCastQuotes = async (
  hash: string,
  cursor?: string,
): Promise<FetchCastsResponse> => {
  return await makeRequest(
    `/farcaster/casts/${hash}/quotes${cursor ? `?cursor=${cursor}` : ""}`,
  );
};
