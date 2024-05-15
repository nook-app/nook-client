import { Zap } from "@tamagui/lucide-icons";
import { View } from "tamagui";

export const FarcasterPowerBadge = ({ badge }: { badge: boolean }) => {
  if (!badge) return null;

  return (
    <View
      backgroundColor="$color10"
      borderRadius="$12"
      width={12}
      height={12}
      alignItems="center"
      justifyContent="center"
      $platform-web={{
        display: "inline-flex",
      }}
    >
      <Zap size={8} color="white" fill="white" />
    </View>
  );
};
