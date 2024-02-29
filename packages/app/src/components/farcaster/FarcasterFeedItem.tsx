import { View } from "tamagui";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "@/types";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";
import { memo } from "react";
import { FarcasterCastCompact } from "./FarcasterCastCompact";
import { FarcasterCastResponseWithContext } from "@nook/common/types";

export const FarcasterFeedItem = memo(
  ({
    cast,
    isReply,
  }: { cast: FarcasterCastResponseWithContext; isReply?: boolean }) => {
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();

    if (cast.parent && !isReply) {
      return (
        <View
          borderBottomWidth="$0.25"
          borderBottomColor="$borderColor"
          padding="$2"
        >
          <TouchableWithoutFeedback
            onPress={() => {
              if (!cast.parent) return;
              navigation.navigate("FarcasterCast", {
                hash: cast.parent.hash,
              });
            }}
          >
            <FarcasterCastCompact cast={cast.parent} isParent />
          </TouchableWithoutFeedback>
          <TouchableWithoutFeedback
            onPress={() =>
              navigation.navigate("FarcasterCast", {
                hash: cast.hash,
              })
            }
          >
            <FarcasterCastCompact cast={cast} />
          </TouchableWithoutFeedback>
        </View>
      );
    }

    return (
      <View
        borderBottomWidth="$0.25"
        borderBottomColor="$borderColor"
        padding="$2"
      >
        <TouchableWithoutFeedback
          onPress={() =>
            navigation.navigate("FarcasterCast", {
              hash: cast.hash,
            })
          }
        >
          <FarcasterCastCompact cast={cast} />
        </TouchableWithoutFeedback>
      </View>
    );
  },
);
