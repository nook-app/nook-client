import { Text, useTheme } from "@nook/app-ui";
import { SimpleHashNFT } from "@nook/common/types";

export const NftDescription = ({ nft }: { nft: SimpleHashNFT }) => {
  const theme = useTheme();
  return (
    <Text
      style={{
        color: theme.color12.val,
        fontSize: 16,
        lineHeight: 24,
        opacity: 0.8,
      }}
    >
      {nft.description}
    </Text>
  );
};
