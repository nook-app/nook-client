import { store } from "@/store";
import { selectEntityById } from "@/store/entity";
import { Text } from "tamagui";
import { XStack, YStack } from "tamagui";

export const EntityDisplay = ({
  entityId,
  orientation = "horizontal",
}: { entityId: string; orientation?: "horizontal" | "vertical" }) => {
  const entity = entityId
    ? selectEntityById(store.getState(), entityId.toString())
    : undefined;

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

  return (
    <Stack
      gap="$1"
      alignItems={orientation === "horizontal" ? "center" : "flex-start"}
      justifyContent={orientation === "horizontal" ? "flex-start" : "center"}
    >
      <Text fontWeight="700">{displayName}</Text>
      <Text color="$gray11">{username}</Text>
    </Stack>
  );
};
