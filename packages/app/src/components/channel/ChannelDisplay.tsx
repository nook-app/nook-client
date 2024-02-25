import { Channel } from "@nook/common/types";
import { Text } from "tamagui";
import { Image } from "tamagui";
import { View, XStack } from "tamagui";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "@/types";
import { TouchableOpacity } from "react-native-gesture-handler";

export const ChannelDisplay = ({ channel }: { channel: Channel }) => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  return (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate("Channel", { channelId: channel.contentId })
      }
    >
      <XStack gap="$1" alignItems="center">
        <View borderRadius="$10" overflow="hidden">
          <Image
            source={{ uri: channel.imageUrl }}
            style={{ width: 16, height: 16 }}
          />
        </View>
        <Text numberOfLines={1} ellipsizeMode="tail">
          {channel.name}
        </Text>
      </XStack>
    </TouchableOpacity>
  );
};
