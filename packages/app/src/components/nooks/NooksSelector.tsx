import { View, YStack } from "tamagui";
import { Image } from "expo-image";
import { Nook } from "@nook/common/types";
import { useNooks } from "@/hooks/useNooks";
import { useCallback } from "react";
import { TouchableOpacity } from "react-native-gesture-handler";
import { useAppSelector } from "@/hooks/useAppSelector";
import { selectNookById } from "@/store/slices/nook";

const NookButton = ({
  nook,
  isUnfollowed,
  isActive,
  onPress,
}: {
  nook: Nook;
  onPress: (nook: Nook) => void;
  isActive?: boolean;
  isUnfollowed?: boolean;
}) => {
  return (
    <TouchableOpacity onPress={() => onPress(nook)}>
      <View
        key={nook.nookId}
        justifyContent="center"
        alignItems="center"
        borderRadius="$4"
        backgroundColor={
          isActive && !isUnfollowed ? "$backgroundFocus" : undefined
        }
        borderWidth={isUnfollowed ? "$1" : undefined}
        borderColor={isUnfollowed ? "$backgroundFocus" : undefined}
        borderStyle={isUnfollowed ? "dashed" : undefined}
        style={{
          width: 48,
          height: 48,
        }}
      >
        <View
          borderRadius="$10"
          justifyContent="center"
          alignItems="center"
          style={{
            width: 40,
            height: 40,
          }}
        >
          <Image
            source={nook.image}
            tintColor="white"
            style={{
              width: 24,
              height: 24,
            }}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
};

export const NooksSelector = () => {
  const homeNook = useAppSelector((state) => selectNookById(state, "home"));
  const { nooks, activeNook, navigateToNook } = useNooks();

  const onPress = useCallback(
    (nook: Nook) => {
      navigateToNook(nook.nookId);
    },
    [navigateToNook],
  );

  return (
    <YStack alignItems="center">
      {homeNook && (
        <NookButton
          nook={homeNook}
          onPress={onPress}
          isActive={activeNook?.nookId === homeNook.nookId}
        />
      )}
      {nooks.map((nook) => (
        <NookButton
          nook={nook}
          key={nook.nookId}
          onPress={onPress}
          isActive={activeNook?.nookId === nook.nookId}
        />
      ))}
    </YStack>
  );
};
