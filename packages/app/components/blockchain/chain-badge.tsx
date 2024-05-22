import { NookText, View, XStack } from "@nook/app-ui";
import { CHAINS } from "../../utils/chains";
import { ChainIcon } from "./chain-icon";

export const ChainBadge = ({
  chainId,
  fontSize,
}: { chainId: string; fontSize?: string }) => {
  const chain = CHAINS[chainId];

  if (!chain) {
    return null;
  }

  return (
    <XStack
      gap="$1.5"
      alignItems="center"
      flexShrink={1}
      hoverStyle={{
        // @ts-ignore
        transition: "all 0.2s ease-in-out",
        backgroundColor: "$color4",
      }}
    >
      <ChainIcon chainId={chainId} />
      <View flexShrink={1}>
        <NookText
          numberOfLines={1}
          ellipsizeMode="tail"
          fontWeight="500"
          // @ts-ignore
          fontSize={fontSize ?? "$3"}
        >
          {chain.name}
        </NookText>
      </View>
    </XStack>
  );
};
