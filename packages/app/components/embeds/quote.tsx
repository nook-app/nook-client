import { Entity, PostData } from "@flink/common/types";
import { Image, View, XStack, YStack } from "tamagui";
import { Text } from "../ui/text";
import { ReactNode } from "react";
import { ContentPost } from "../content/post";
import { FeedItemContentWithEngagement } from "@flink/api/types";
import { EmbedImage } from "./image";

export const EmbedQuotePost = ({
  data,
  entityMap,
  contentMap,
}: {
  data: PostData;
  entityMap: Record<string, Entity>;
  contentMap: Record<string, FeedItemContentWithEngagement>;
}) => {
  const entity = entityMap[data.entityId.toString()];
  return (
    <EmbedQuote entity={entity}>
      <ContentPost data={data} entityMap={entityMap} />
      {data.embeds.map((embed) => {
        if (embed.includes("imgur.com")) {
          return <EmbedImage key={embed} embed={embed} />;
        }
        return <Text key={embed}>{embed}</Text>;
      })}
    </EmbedQuote>
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
        {entity?.farcaster.pfp && (
          <View marginRight="$1">
            <Image
              source={{ width: 20, height: 20, uri: entity.farcaster.pfp }}
              borderRadius="$10"
            />
          </View>
        )}
        {entity?.farcaster.displayName && (
          <Text bold>{entity.farcaster.displayName}</Text>
        )}
        {entity?.farcaster.username && (
          <Text>{`@${entity.farcaster.username}`}</Text>
        )}
        {!entity && <Text bold>Unknown</Text>}
      </XStack>
      {children}
    </YStack>
  );
};
