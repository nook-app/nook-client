import { Button, Text, View, XStack, YStack } from "tamagui";
import { useAppSelector } from "@/hooks/useAppSelector";
import { setActiveNook } from "@/store/slices/user";
import { EntityAvatar } from "@/components/entity/avatar";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { selectEntityById } from "@/store/slices/entity";
import { RootStackParamList } from "@/types";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { useCallback } from "react";
import { closeModal } from "@/store/slices/navigator";
import { ModalName } from "./types";
import { BottomSheetModal } from "@/components/modals/BottomSheetModal";

export const EntityModal = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const theme = useAppSelector((state) => state.user.theme);
  const dispatch = useAppDispatch();
  const { initialState } = useAppSelector(
    (state) => state.navigator.modals[ModalName.Entity],
  );
  const entity = useAppSelector((state) =>
    initialState?.entityId
      ? selectEntityById(state, initialState?.entityId)
      : undefined,
  );

  const onClose = useCallback(() => {
    dispatch(closeModal({ name: ModalName.Entity }));
  }, [dispatch]);

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
    <BottomSheetModal onClose={onClose} enableDynamicSizing>
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
                onClose();
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
