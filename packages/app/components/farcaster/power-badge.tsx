import { Zap } from "@tamagui/lucide-icons";
import { View } from "tamagui";

export const FarcasterPowerBadge = ({ badge }: { badge: boolean }) => {
  if (!badge) return null;

  return (
    <View
      backgroundColor="$color8"
      borderRadius="$12"
      width={14}
      height={14}
      alignItems="center"
      justifyContent="center"
    >
      <Zap size={10} color="white" fill="white" />
    </View>
  );
};
