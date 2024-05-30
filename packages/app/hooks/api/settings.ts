import { Session } from "@nook/common/types";
import { useQuery } from "@tanstack/react-query";
import { useMuteStore } from "../../store/useMuteStore";
import { fetchSettings } from "../../api/settings";

export const useSettings = (session: Session | undefined) => {
  const updateFromSettings = useMuteStore((state) => state.updateFromSettings);
  return useQuery({
    queryKey: ["settings", session?.fid],
    queryFn: async () => {
      const response = await fetchSettings();
      if (response) updateFromSettings(response);
      return response || null;
    },
    enabled: !!session,
  });
};
