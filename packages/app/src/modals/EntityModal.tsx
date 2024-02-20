import { Button, Text, View, XStack, YStack } from "tamagui";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { setActiveNook } from "@/store/slices/user";
import { EntityAvatar } from "@/components/entity/avatar";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { selectEntityById } from "@/store/slices/entity";
import { store } from "@/store";
import { RootStackParamList } from "@/types";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { BottomSheetModal } from "@/components/utils/BottomSheetModal";
import { setActiveEntityModal } from "@/store/slices/navigator";

export const EntityModal = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const theme = useAppSelector((state) => state.user.theme);
  const dispatch = useAppDispatch();
  const activeEntityModal = useAppSelector(
    (state) => state.navigator.activeEntityModal,
  );
  const entity = activeEntityModal
    ? selectEntityById(store.getState(), activeEntityModal)
    : undefined;

  let displayName = entity?.farcaster?.displayName;
  if (!displayName) {
    displayName = entity?.farcaster?.fid
      ? `fid:${entity.farcaster.fid}`
      : "Unknown";
  }

  let username = entity?.farcaster?.username;
  if (username) {
    username = `@${username}`;
  } else {
    username = entity?.farcaster?.fid
      ? `fid:${entity.farcaster.fid}`
      : "@unknown";
  }

  return (
    <BottomSheetModal
      open={!!entity}
      onClose={() => dispatch(setActiveEntityModal())}
      enableDynamicSizing
    >
      <View theme={theme}>
        {entity && (
          <YStack
            flexGrow={1}
            justifyContent="space-between"
            gap="$3"
            paddingHorizontal="$3"
          >
            <YStack
              gap="$4"
              backgroundColor="$backgroundStrong"
              borderRadius="$4"
              padding="$3"
            >
              <XStack gap="$2" alignItems="center">
                <EntityAvatar entityId={entity._id.toString()} size="$5" />
                <YStack>
                  <Text fontWeight="700" fontSize="$5">
                    {displayName}
                  </Text>
                  <Text color="$gray11" fontSize="$4">
                    {username}
                  </Text>
                </YStack>
              </XStack>
              {entity?.farcaster?.bio && <Text>{entity.farcaster.bio}</Text>}
              <XStack gap="$2">
                <View flexDirection="row" alignItems="center" gap="$1">
                  <Text fontWeight="700">
                    {entity.farcaster.following || 0}
                  </Text>
                  <Text color="$gray11">following</Text>
                </View>
                <View flexDirection="row" alignItems="center" gap="$1">
                  <Text fontWeight="700">
                    {entity.farcaster.followers || 0}
                  </Text>
                  <Text color="$gray11">followers</Text>
                </View>
              </XStack>
            </YStack>
            <Button
              onPress={() => {
                const params = {
                  nookId: `entity:${entity._id.toString()}`,
                };
                navigation.navigate("Shelf", params);
                dispatch(setActiveEntityModal());
                dispatch(setActiveNook(`entity:${entity._id.toString()}`));
              }}
            >
              Visit Nook
            </Button>
          </YStack>
        )}
      </View>
    </BottomSheetModal>
  );
};
