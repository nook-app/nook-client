import { XStack, YStack } from "tamagui";
import { UserAvatar } from "@/components/user/UserAvatar";
import { UserDisplay } from "../user/UserDisplay";
import { FarcasterCastResponseWithContext } from "@nook/common/types";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "@/types";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";
import { FarcasterCastText } from "../farcaster/FarcasterCastText";
import { Embed } from "./Embed";

export const EmbedCast = ({
  cast,
}: {
  cast: FarcasterCastResponseWithContext;
}) => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  return (
    <TouchableWithoutFeedback
      onPress={() =>
        navigation.navigate("FarcasterCast", {
          hash: cast.hash,
        })
      }
    >
      <YStack
        borderWidth="$0.5"
        borderColor="$borderColor"
        borderRadius="$2"
        padding="$2.5"
        marginVertical="$2"
        gap="$2"
      >
        <XStack gap="$1" alignItems="center">
          <UserAvatar userId={cast.entity.id} size="$1" />
          <UserDisplay userId={cast.entity.id} />
        </XStack>
        <FarcasterCastText cast={cast} />
        {cast.embeds.map((content) => (
          <Embed key={content.uri} content={content} />
        ))}
      </YStack>
    </TouchableWithoutFeedback>
  );
};
