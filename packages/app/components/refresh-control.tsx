import { useTheme } from "@nook/app-ui";
import { RefreshControl as RNRefreshControl } from "react-native";

export function RefreshControl({
  refreshing,
  onRefresh,
  paddingTop,
}: {
  refreshing: boolean;
  onRefresh: () => Promise<void>;
  paddingTop?: number;
}) {
  const theme = useTheme();
  return (
    <RNRefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
      colors={[theme.mauve12.val]}
      tintColor={theme.mauve12.val}
      progressViewOffset={paddingTop}
    />
  );
}
