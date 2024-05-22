import { View } from "@nook/app-ui";
import { CHAINS } from "../../utils/chains";
import { Image } from "expo-image";

export const ChainIcon = ({ chainId }: { chainId: string }) => {
  const chain = CHAINS[chainId];

  return (
    <View
      width={16}
      height={16}
      borderRadius="$10"
      backgroundColor="$color3"
      overflow="hidden"
    >
      <Image source={chain.image} style={{ width: "100%", height: "100%" }} />
    </View>
  );
};
