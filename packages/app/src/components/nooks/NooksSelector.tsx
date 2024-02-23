import { Separator, View, YStack } from "tamagui";
import { Image } from "expo-image";
import { useAppSelector } from "@/hooks/useAppSelector";
import { Nook } from "@nook/common/types";
import { useNooks } from "@/hooks/useNooks";
import { useCallback } from "react";
import { TouchableOpacity } from "react-native-gesture-handler";

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
        borderStyle="dashed"
        style={{
          width: 48,
          height: 48,
        }}
      >
        <View borderRadius="$10" overflow="hidden">
          <Image
            source={nook.image}
            style={{
              width: 32,
              height: 32,
            }}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
};

export const NooksSelector = () => {
  const { nooks, activeNook, navigateToNook } = useNooks();
  const entity = useAppSelector((state) => state.user.entity);

  const userNook = nooks.find(
    ({ nookId }) => nookId === `entity:${entity?._id.toString()}`,
  );
  const otherNooks = nooks.filter(
    ({ nookId }) => nookId !== `entity:${entity?._id.toString()}`,
  );

  const viewingUnfollowedNook = !nooks.some(
    ({ nookId }) => nookId === activeNook?.nookId,
  );

  const onPress = useCallback(
    (nook: Nook) => {
      navigateToNook(nook.nookId);
    },
    [navigateToNook],
  );

  return (
    <YStack alignItems="center">
      {userNook && (
        <NookButton
          nook={userNook}
          onPress={onPress}
          isActive={activeNook?.nookId === userNook.nookId}
        />
      )}
      <Separator borderWidth="$0.5" alignSelf="stretch" marginHorizontal="$2" />
      {otherNooks.map((nook) => (
        <NookButton
          nook={nook}
          key={nook.nookId}
          onPress={onPress}
          isActive={activeNook?.nookId === nook.nookId}
        />
      ))}
      {viewingUnfollowedNook && activeNook && (
        <NookButton
          nook={activeNook}
          key={activeNook?.nookId}
          onPress={onPress}
          isActive
          isUnfollowed
        />
      )}
    </YStack>
  );
};
