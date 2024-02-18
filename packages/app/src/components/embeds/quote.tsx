import { Entity, PostData } from "@flink/common/types";
import { Text, XStack, YStack } from "tamagui";
import { ReactNode } from "react";
import { EmbedImage } from "./image";
import { EntityAvatar } from "@/components/entity/avatar";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";
import { PostContent } from "@/components/utils";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "@/types";
import { EntityDisplay } from "../entity/display";

export const EmbedQuotePost = ({
  data,
}: {
  data: PostData;
}) => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  return (
    <TouchableWithoutFeedback
      onPress={() =>
        navigation.navigate("Content", {
          contentId: data.contentId,
        })
      }
    >
      <EmbedQuote entityId={data.entityId.toString()}>
        <PostContent data={data} />
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
  entityId,
  children,
}: {
  entityId: string;
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
        <EntityAvatar entityId={entityId} size="$1" />
        <EntityDisplay entityId={entityId} orientation="horizontal" />
      </XStack>
      {children}
    </YStack>
  );
};
