import { Content, ContentData, Entity, PostData } from "@flink/common/types";
import { Text, XStack, YStack } from "tamagui";
import { ReactNode } from "react";
import { EmbedImage } from "./image";
import { Avatar } from "@/components/avatar";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";
import { PostContent } from "@/components/utils";

export const EmbedQuotePost = ({
  data,
  entityMap,
  contentMap,
}: {
  data: PostData;
  entityMap: Record<string, Entity>;
  contentMap: Record<string, Content<ContentData>>;
}) => {
  const entity = entityMap[data.entityId.toString()];
  return (
    <TouchableWithoutFeedback>
      <EmbedQuote entity={entity}>
        <PostContent data={data} entityMap={entityMap} />
        {data.embeds.map((embed) => {
          if (embed.includes("imgur.com")) {
            return <EmbedImage key={embed} embed={embed} />;
          }
          return <Text key={embed}>{embed}</Text>;
        })}
      </EmbedQuote>
    </TouchableWithoutFeedback>
  );
};

export const EmbedQuote = ({
  entity,
  children,
}: {
  entity: Entity;
  children: ReactNode;
}) => {
  return (
    <YStack
      borderWidth="$0.75"
      borderColor="$borderColor"
      borderRadius="$2"
      padding="$2.5"
      marginVertical="$2"
      gap="$2"
    >
      <XStack gap="$1" alignItems="center">
        <Avatar entity={entity} size="$1" />
        {entity?.farcaster.displayName && (
          <Text fontWeight="700">{entity.farcaster.displayName}</Text>
        )}
        {entity?.farcaster.username && (
          <Text>{`@${entity.farcaster.username}`}</Text>
        )}
        {!entity && <Text fontWeight="700">Unknown</Text>}
      </XStack>
      {children}
    </YStack>
  );
};
