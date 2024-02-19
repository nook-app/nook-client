import { Button, Sheet, Text, View, XStack, YStack } from "tamagui";
import { useState } from "react";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import { setActiveEntityModal, setActiveNook } from "@/store/slices/user";
import { EntityAvatar } from "@/components/entity/avatar";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { selectEntityById } from "@/store/slices/entity";
import { store } from "@/store";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { RootStackParamList } from "@/types";
import { NavigationProp, useNavigation } from "@react-navigation/native";

export const EntityModal = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();
  const activeEntityModal = useAppSelector(
    (state) => state.user.activeEntityModal,
  );
  const entity = activeEntityModal
    ? selectEntityById(store.getState(), activeEntityModal)
    : undefined;

  const [position, setPosition] = useState(0);

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
    <Sheet
      open={!!activeEntityModal}
      onOpenChange={() => {
        dispatch(setActiveEntityModal());
      }}
      snapPoints={[50]}
      snapPointsMode="percent"
      dismissOnSnapToBottom
      zIndex={100_000}
      animation="quick"
      position={position}
      onPositionChange={setPosition}
    >
      <Sheet.Overlay
        animation="quick"
        enterStyle={{ opacity: 0 }}
        exitStyle={{ opacity: 0 }}
      />
      <Sheet.Handle />
      <Sheet.Frame style={{ paddingBottom: insets.bottom }}>
        {entity && activeEntityModal && (
          <View flexGrow={1} justifyContent="space-between" padding="$4">
            <YStack gap="$4">
              <XStack gap="$2" alignItems="center">
                <EntityAvatar entityId={activeEntityModal} size="$6" />
                <YStack>
                  <Text fontWeight="700" fontSize="$6">
                    {displayName}
                  </Text>
                  <Text color="$gray11" fontSize="$5">
                    {username}
                  </Text>
                </YStack>
              </XStack>
              {entity?.farcaster?.bio && <Text>{entity.farcaster.bio}</Text>}
            </YStack>
            <Button
              onPress={() => {
                const params = {
                  nookId: `entity:${activeEntityModal}`,
                };
                navigation.navigate("Shelf", params);
                dispatch(setActiveEntityModal());
                dispatch(setActiveNook(`entity:${activeEntityModal}`));
              }}
            >
              Visit Nook
            </Button>
          </View>
        )}
      </Sheet.Frame>
    </Sheet>
  );
};
