import { getServerSession } from "../server/auth";
import { Channel, FarcasterCast, FarcasterUser, Session } from "../types";

export const makeRequest = async (path: string, requestInit?: RequestInit) => {
  const url = path.startsWith("http")
    ? path
    : `${process.env.NEXT_PUBLIC_API_BASE_URL}${path}`;

  const headers = new Headers(requestInit?.headers);

  if (!headers.has("Authorization")) {
    if (typeof window !== "undefined") {
      const rawSession = localStorage.getItem("session");
      if (rawSession) {
        const session: Session = JSON.parse(rawSession);
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

export const hasCastDiff = (cast1: FarcasterCast, cast2: FarcasterCast) => {
  return (
    cast1.engagement.likes !== cast2.engagement.likes ||
    cast1.engagement.recasts !== cast2.engagement.recasts ||
    cast1.engagement.replies !== cast2.engagement.replies ||
    cast1.engagement.quotes !== cast2.engagement.quotes
  );
};
