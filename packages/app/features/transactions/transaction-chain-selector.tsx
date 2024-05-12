import { XStack } from "@nook/app-ui";
import { ChainBadge } from "../../components/blockchain/chain-badge";

export const TransactionChainSelector = ({
  chains,
  onPress,
}: { chains: number[]; onPress: (chain: number) => void }) => {
  return (
    <XStack justifyContent="space-around" padding="$2">
      {[8453, 7777777, 10, 1].map((chainId) => (
        <XStack
          key={chainId}
          gap="$1.5"
          borderRadius="$6"
          paddingHorizontal="$2"
          paddingVertical="$1.5"
          borderColor={chains.includes(chainId) ? "$color11" : "$borderColorBg"}
          borderWidth="$0.5"
          cursor="pointer"
          hoverStyle={{
            // @ts-ignore
            transition: "all 0.2s ease-in-out",
            backgroundColor: "$color4",
          }}
          backgroundColor={chains.includes(chainId) ? "$color5" : undefined}
          onPress={() => onPress(chainId)}
        >
          <ChainBadge chainId={chainId} />
        </XStack>
      ))}
    </XStack>
  );
};
