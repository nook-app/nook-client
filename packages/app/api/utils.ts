import { Session } from "../types";

export const makeRequest = async (path: string, requestInit?: RequestInit) => {
  const url = path.startsWith("http")
    ? path
    : `${process.env.NEXT_PUBLIC_API_BASE_URL}${path}`;

  const headers = new Headers(requestInit?.headers);

  if (!headers.has("Authorization") && typeof window !== "undefined") {
    const rawSession = localStorage.getItem("session");
    if (rawSession) {
      const session: Session = JSON.parse(rawSession);
      headers.set("Authorization", `Bearer ${session.token}`);
    }
  }

  const response = await fetch(url, {
    ...requestInit,
    headers,
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return await response.json();
};
