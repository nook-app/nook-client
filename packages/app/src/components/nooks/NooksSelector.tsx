import { useNavigation, NavigationProp } from "@react-navigation/native";
import { Separator, View, YStack } from "tamagui";
import { Image } from "expo-image";
import { useAppSelector } from "@/hooks/useAppSelector";
import { Nook } from "@nook/common/types";
import { selectNookById } from "@/store/slices/nook";
import { RootStackParamList } from "@/types";
import { useAppDispatch } from "@/hooks/useAppDispatch";

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
      onPress={() => onPress(nook)}
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
  );
};

export const NooksSelector = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const activeNookId = useAppSelector((state) => state.user.activeNook);
  const nooks = useAppSelector((state) => state.user.nooks);
  const nookId = activeNookId || nooks[0]?.nookId.toString();
  const activeNook = useAppSelector((state) => selectNookById(state, nookId));
  const entity = useAppSelector((state) => state.user.entity);
  const activeShelves = useAppSelector((state) => state.user.activeShelves);
  const dispatch = useAppDispatch();

  const userNook = nooks.find(
    ({ nookId }) => nookId === `entity:${entity?._id.toString()}`,
  );
  const otherNooks = nooks.filter(
    ({ nookId }) => nookId !== `entity:${entity?._id.toString()}`,
  );

  const viewingUnfollowedNook = !nooks.some(
    ({ nookId }) => nookId === activeNook?.nookId,
  );

  const handleNookPress = (nook: Nook) => {
    const params = {
      nookId: nook.nookId,
      shelfId: activeShelves[nook.nookId] || nook.shelves[0]?.slug,
    };
    navigation.setParams(params);
    navigation.navigate("Nook", params);
    navigation.navigate("Shelf", params);
  };

  return (
    <YStack gap="$1.5" alignItems="center">
      {userNook && (
        <NookButton
          nook={userNook}
          onPress={handleNookPress}
          isActive={activeNook?.nookId === userNook.nookId}
        />
      )}
      <Separator borderWidth="$0.5" alignSelf="stretch" marginHorizontal="$2" />
      {otherNooks.map((nook) => (
        <NookButton
          nook={nook}
          key={nook.nookId}
          onPress={handleNookPress}
          isActive={activeNook?.nookId === nook.nookId}
        />
      ))}
      {viewingUnfollowedNook && activeNook && (
        <NookButton
          nook={activeNook}
          key={activeNook?.nookId}
          onPress={handleNookPress}
          isActive
          isUnfollowed
        />
      )}
    </YStack>
  );
};
