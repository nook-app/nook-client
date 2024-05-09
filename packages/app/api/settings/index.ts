import { Session, User } from "@nook/common/types";
import { makeRequest } from "../utils";
import { useQuery } from "@tanstack/react-query";
import { CastAction } from "@nook/common/types";

export const fetchSettings = async () => {
  return makeRequest("/user");
};

export const useSettings = (session: Session | undefined) => {
  return useQuery<User>({
    queryKey: ["settings"],
    queryFn: fetchSettings,
    enabled: !!session,
  });
};

export const updateTheme = async (theme: string | undefined) => {
  return await makeRequest("/user", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ theme }),
  });
};

export const muteUser = async (mutedFid: string) => {
  return await makeRequest("/mute/users", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ mutedFid }),
  });
};

export const unmuteUser = async (mutedFid: string) => {
  return await makeRequest("/mute/users", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ mutedFid }),
  });
};

export const muteChannel = async (mutedParentUrl: string) => {
  return await makeRequest("/mute/channels", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ mutedParentUrl }),
  });
};

export const unmuteChannel = async (mutedParentUrl: string) => {
  return await makeRequest("/mute/channels", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ mutedParentUrl }),
  });
};

export const muteWord = async (mutedWord: string) => {
  return await makeRequest("/mute/words", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ mutedWord }),
  });
};

export const unmuteWord = async (mutedWord: string) => {
  return await makeRequest("/mute/words", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ mutedWord }),
  });
};

export const installAction = async (
  index: number,
  action: CastAction | null,
) => {
  await makeRequest("/user/actions", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ index, action }),
  });
};
