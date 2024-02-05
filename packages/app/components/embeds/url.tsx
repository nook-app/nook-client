import { UrlMetadata } from "@flink/common/types";
import { Text } from "tamagui";

export const EmbedUrl = ({ metadata }: { metadata: UrlMetadata }) => {
  return <Text>{JSON.stringify(metadata)}</Text>;
};
