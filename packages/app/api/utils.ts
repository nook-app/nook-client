import { getServerSession } from "../server/auth";
import {
  Channel,
  FarcasterCastResponse,
  FarcasterUser,
  Session,
} from "@nook/common/types";
import { getSession } from "../utils/local-storage";

export const makeRequest = async (path: string, requestInit?: RequestInit) => {
  return await makeUrlRequest(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}${path}`,
    requestInit,
  );
};

export const makeUrlRequest = async (
  url: string,
  requestInit?: RequestInit,
) => {
  const headers = new Headers(requestInit?.headers);

  if (!headers.has("Authorization")) {
    if (typeof window !== "undefined") {
      const session = getSession();
      if (session) {
        headers.set("Authorization", `Bearer ${session.token}`);
      }
    } else {
      const session = await getServerSession();
      if (session) {
        headers.set("Authorization", `Bearer ${session.token}`);
      }
    }
  }

  const response = await fetch(url, {
    ...requestInit,
    headers,
  });

  if (response.status === 404) {
    return;
  }

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return await response.json();
};

export const hasUserDiff = (user1: FarcasterUser, user2: FarcasterUser) => {
  return (
    user1.engagement.followers !== user2.engagement.followers ||
    user1.engagement.following !== user2.engagement.following
  );
};

export const hasChannelDiff = (channel1: Channel, channel2: Channel) => {
  return false;
};

export const hasCastDiff = (
  cast1: FarcasterCastResponse,
  cast2: FarcasterCastResponse,
) => {
  return (
    cast1.engagement.likes !== cast2.engagement.likes ||
    cast1.engagement.recasts !== cast2.engagement.recasts ||
    cast1.engagement.replies !== cast2.engagement.replies ||
    cast1.engagement.quotes !== cast2.engagement.quotes
  );
};
