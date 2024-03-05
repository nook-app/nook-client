import { ScrollView, Text, View, XStack, YStack } from "tamagui";
import { EntityAvatar } from "@/components/entity/EntityAvatar";
import { EntityDisplay } from "../entity/EntityDisplay";
import { FarcasterCastText } from "./FarcasterCastText";
import {
  TouchableOpacity,
  TouchableWithoutFeedback,
} from "react-native-gesture-handler";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "@/types";
import { ChannelDisplay } from "../channel/ChannelDisplay";
import { FarcasterCastCompact } from "./FarcasterCastCompact";
import { FarcasterCastReplies } from "./FarcasterCastReplies";
import { FarcasterCastResponseWithContext } from "@nook/common/types";
import { Embed } from "../embeds/Embed";
import { EmbedCast } from "../embeds/EmbedCast";
import { useCast } from "@/hooks/useCast";

export const FarcasterCast = ({
  cast,
}: { cast: FarcasterCastResponseWithContext }) => {
  if (cast.parent) {
    return <FarcasterCastReply cast={cast} />;
  }

  return (
    <ScrollView>
      <View
        padding="$2.5"
        borderBottomWidth="0.5"
        borderBottomColor="$borderColor"
      >
        <FarcasterCastContent cast={cast} />
      </View>
      <FarcasterCastReplies hash={cast.hash} />
    </ScrollView>
  );
};

const FarcasterCastReply = ({
  cast,
}: { cast: FarcasterCastResponseWithContext }) => {
  if (!cast.parentHash) return null;

  return (
    <ScrollView>
      <View
        padding="$2.5"
        borderBottomWidth="0.5"
        borderBottomColor="$borderColor"
      >
        <FarcasterCastAncestors hash={cast.parentHash} />
        <FarcasterCastContent cast={cast} />
      </View>
      <FarcasterCastReplies hash={cast.hash} />
    </ScrollView>
  );
};

const FarcasterCastAncestors = ({ hash }: { hash: string }) => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const cast = useCast(hash);
  if (!cast) return null;
  return (
    <>
      {cast.parentHash && <FarcasterCastAncestors hash={cast.parentHash} />}
      <TouchableWithoutFeedback
        key={cast.hash}
        onPress={() => {
          if (!cast) return;
          navigation.navigate("FarcasterCast", {
            hash: cast.hash,
          });
        }}
      >
        <FarcasterCastCompact cast={cast} isParent />
      </TouchableWithoutFeedback>
    </>
  );
};

const FarcasterCastContent = ({
  cast,
}: { cast: FarcasterCastResponseWithContext }) => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  return (
    <YStack gap="$3">
      <XStack gap="$2">
        <EntityAvatar entityId={cast.entity.id} />
        <EntityDisplay entityId={cast.entity.id} orientation="vertical" />
      </XStack>
      <FarcasterCastText cast={cast} />
      {(cast.embeds.length > 0 || cast.embeds.length > 0) && (
        <YStack gap="$2">
          {cast.embeds.map((content) => (
            <Embed key={content.uri} content={content} />
          ))}
          {cast.embedCasts.map((cast) => (
            <EmbedCast key={cast.hash} cast={cast} />
          ))}
        </YStack>
      )}
      <XStack gap="$1.5" alignItems="center">
        <Text color="$gray11">
          {new Date(cast.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
        <Text color="$gray11">{"·"}</Text>
        <Text color="$gray11">
          {new Date(cast.timestamp).toLocaleDateString()}
        </Text>
        {cast.channel && (
          <>
            <Text color="$gray11">{"·"}</Text>
            <ChannelDisplay channel={cast.channel} />
          </>
        )}
      </XStack>
      <XStack gap="$2">
        <View flexDirection="row" alignItems="center" gap="$1">
          <Text fontWeight="700">{cast.engagement.replies}</Text>
          <Text color="$gray11">Replies</Text>
        </View>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate("FarcasterCastReposts", {
              hash: cast.hash,
            })
          }
        >
          <View flexDirection="row" alignItems="center" gap="$1">
            <Text fontWeight="700">{cast.engagement.recasts}</Text>
            <Text color="$gray11">Recasts</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate("FarcasterCastQuotes", {
              hash: cast.hash,
            })
          }
        >
          <View flexDirection="row" alignItems="center" gap="$1">
            <Text fontWeight="700">{cast.engagement.quotes}</Text>
            <Text color="$gray11">Quotes</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate("FarcasterCastLikes", {
              hash: cast.hash,
            })
          }
        >
          <View flexDirection="row" alignItems="center" gap="$1">
            <Text fontWeight="700">{cast.engagement.likes}</Text>
            <Text color="$gray11">Likes</Text>
          </View>
        </TouchableOpacity>
      </XStack>
    </YStack>
  );
};
