import { Button, Text, View, XStack, YStack } from "tamagui";
import { useAppSelector } from "@/hooks/useAppSelector";
import { EntityAvatar } from "@/components/entity/EntityAvatar";
import { ModalName } from "./types";
import { BottomSheetModal } from "@/components/modals/BottomSheetModal";
import { useModal } from "@/hooks/useModal";
import { useEntity } from "@/hooks/useEntity";
import { useNooks } from "@/hooks/useNooks";
import { useCallback } from "react";

export const EntityModal = () => {
  const { navigateToNook } = useNooks();
  const theme = useAppSelector((state) => state.user.theme);
  const { initialState } = useAppSelector(
    (state) => state.navigator.modals[ModalName.Entity],
  );
  const entity = useEntity(initialState?.entityId);
  const { close } = useModal(ModalName.Entity);

  const onPress = useCallback(() => {
    if (entity) {
      navigateToNook(`entity:${entity._id.toString()}`);
      close();
    }
  }, [entity, close, navigateToNook]);

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
    <BottomSheetModal onClose={close} enableDynamicSizing>
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
            <Button onPress={onPress}>Visit Nook</Button>
          </YStack>
        )}
      </View>
    </BottomSheetModal>
  );
};
