import {
  FarcasterUserV1,
  FarcasterUserMutualsPreview,
  FetchUsersResponse,
} from "@nook/common/types";
import { makeRequest } from "../utils";
export const fetchUser = async (
  username: string,
  fid?: boolean,
): Promise<FarcasterUserV1> => {
  return await makeRequest(
    `/farcaster/users/${username}${fid ? `?fid=${fid}` : ""}`,
  );
};

export const fetchUserMutualsPreview = async (
  fid: string,
): Promise<FarcasterUserMutualsPreview> => {
  return await makeRequest(`/farcaster/users/${fid}/mutuals-preview`);
};

export const fetchUsers = async (
  fids: string[],
): Promise<FetchUsersResponse> => {
  return await makeRequest("/farcaster/users", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ fids }),
  });
};

export const fetchUsersByAddress = async (
  addresses: string[],
): Promise<FetchUsersResponse> => {
  return await makeRequest("/farcaster/users", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ addresses }),
  });
};

export const fetchUserFollowers = async (
  username: string,
  cursor?: string,
): Promise<FetchUsersResponse> => {
  return await makeRequest(
    `/farcaster/users/${username}/followers${
      cursor ? `?cursor=${cursor}` : ""
    }`,
  );
};

export const fetchUserFollowing = async (
  fid: string,
  cursor?: string,
): Promise<FetchUsersResponse> => {
  return await makeRequest(
    `/farcaster/users/${fid}/following${cursor ? `?cursor=${cursor}` : ""}`,
  );
};

export const fetchUserMutuals = async (
  fid: string,
  cursor?: string,
): Promise<FetchUsersResponse> => {
  return await makeRequest(
    `/farcaster/users/${fid}/mutuals${cursor ? `?cursor=${cursor}` : ""}`,
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
