import { Text } from "tamagui";
import { XStack, YStack } from "tamagui";
import { useEntity } from "@/hooks/useEntity";
import { EntityModalButton } from "./EntityModalButton";

export const EntityDisplay = ({
  entityId,
  orientation = "horizontal",
}: { entityId: string; orientation?: "horizontal" | "vertical" }) => {
  const entity = useEntity(entityId);
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
    <EntityModalButton entityId={entityId}>
      <Stack
        gap="$1"
        alignItems={orientation === "horizontal" ? "center" : "flex-start"}
        justifyContent={orientation === "horizontal" ? "flex-start" : "center"}
      >
        <Text fontWeight="700">{displayName}</Text>
        <Text color="$gray11">{username}</Text>
      </Stack>
    </EntityModalButton>
  );
};
