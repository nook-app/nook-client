import { getServerSession } from "../server/session";
import { getSession } from "../utils/local-storage";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || process.env.EXPO_PUBLIC_API_BASE_URL;

export const makeRequest = async (path: string, requestInit?: RequestInit) => {
  if (path.startsWith("/v1")) {
    return await makeUrlRequest(
      `${BASE_URL?.replace("/v0", "")}${path}`,
      requestInit,
    );
  }

  return await makeUrlRequest(`${BASE_URL}${path}`, requestInit);
};

export const makeUrlRequest = async (
  url: string,
  requestInit?: RequestInit,
) => {
  const headers = new Headers(requestInit?.headers);

  if (!headers.has("Authorization")) {
    if (typeof window !== "undefined") {
      const session = await getSession();
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
