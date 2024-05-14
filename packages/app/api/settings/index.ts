import { Session, UserSettings } from "@nook/common/types";
import { makeRequest } from "../utils";
import { useQuery } from "@tanstack/react-query";
import { CastAction } from "@nook/common/types";
import { useMuteStore } from "../../store/useMuteStore";

export const fetchSettings = async (): Promise<UserSettings> => {
  return makeRequest("/v1/user/settings");
};

export const useSettings = (session: Session | undefined) => {
  const updateFromSettings = useMuteStore((state) => state.updateFromSettings);
  return useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const response = await fetchSettings();
      if (response) updateFromSettings(response);
      return response || null;
    },
    enabled: !!session,
  });
};

export const updateTheme = async (theme: string | undefined) => {
  return await makeRequest("/v1/user/settings/theme", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ theme }),
  });
};

export const muteUser = async (mutedFid: string) => {
  return await makeRequest("/v1/user/settings/mute/users", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ mutedFid }),
  });
};

export const unmuteUser = async (mutedFid: string) => {
  return await makeRequest("/v1/user/settings/mute/users", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ mutedFid }),
  });
};

export const muteChannel = async (mutedParentUrl: string) => {
  return await makeRequest("/v1/user/settings/mute/channels", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ mutedParentUrl }),
  });
};

export const unmuteChannel = async (mutedParentUrl: string) => {
  return await makeRequest("/v1/user/settings/mute/channels", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ mutedParentUrl }),
  });
};

export const muteWord = async (mutedWord: string) => {
  return await makeRequest("/v1/user/settings/mute/words", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ mutedWord }),
  });
};

export const unmuteWord = async (mutedWord: string) => {
  return await makeRequest("/v1/user/settings/mute/words", {
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
  await makeRequest("/v1/user/settings/actions", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ index, action }),
  });
};
