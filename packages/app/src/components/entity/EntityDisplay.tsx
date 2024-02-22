import { store } from "@/store";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { selectEntityById } from "@/store/slices/entity";
import { TouchableOpacity } from "react-native-gesture-handler";
import { Text } from "tamagui";
import { XStack, YStack } from "tamagui";
import { useCallback } from "react";
import { openModal } from "@/store/slices/navigator";
import { ModalName } from "@/modals/types";

export const EntityDisplay = ({
  entityId,
  orientation = "horizontal",
}: { entityId: string; orientation?: "horizontal" | "vertical" }) => {
  const dispatch = useAppDispatch();
  const entity = selectEntityById(store.getState(), entityId.toString());

  const Stack = orientation === "horizontal" ? XStack : YStack;

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

  const onPress = useCallback(async () => {
    dispatch(
      openModal({
        name: ModalName.Entity,
        initialState: {
          entityId: entityId,
        },
      }),
    );
  }, [dispatch, entityId]);

  return (
    <TouchableOpacity onPress={onPress}>
      <Stack
        gap="$1"
        alignItems={orientation === "horizontal" ? "center" : "flex-start"}
        justifyContent={orientation === "horizontal" ? "flex-start" : "center"}
      >
        <Text fontWeight="700">{displayName}</Text>
        <Text color="$gray11">{username}</Text>
      </Stack>
    </TouchableOpacity>
  );
};
