import { Zap } from "@tamagui/lucide-icons";
import { View } from "tamagui";

export const FarcasterPowerBadge = ({ badge }: { badge: boolean }) => {
  if (!badge) return null;

  return (
    <View
      backgroundColor="$color9"
      borderRadius="$12"
      width={12}
      height={12}
      alignItems="center"
      justifyContent="center"
    >
      <Zap size={8} color="white" fill="white" />
    </View>
  );
};
