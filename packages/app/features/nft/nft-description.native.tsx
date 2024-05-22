import { useTheme } from "@nook/app-ui";
import { SimpleHashNFT } from "@nook/common/types";
import Markdown from "react-native-markdown-display";

export const NftDescription = ({ nft }: { nft: SimpleHashNFT }) => {
  const theme = useTheme();
  return (
    <Markdown
      style={{
        body: {
          color: theme.color12.val,
          fontSize: 16,
          lineHeight: 24,
          opacity: 0.8,
        },
      }}
    >
      {nft.description}
    </Markdown>
  );
};
