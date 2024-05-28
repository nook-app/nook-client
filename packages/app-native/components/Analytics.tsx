import { useGlobalSearchParams, usePathname } from "expo-router";
import { useEffect } from "react";
import * as amplitude from "@amplitude/analytics-react-native";

export const Analytics = () => {
  const pathname = usePathname();
  const params = useGlobalSearchParams();

  useEffect(() => {
    amplitude.track("pageview", { pathname, params });
  }, [pathname, params]);

  return null;
};
