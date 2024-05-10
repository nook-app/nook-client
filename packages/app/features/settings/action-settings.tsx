import {
  NookButton,
  NookText,
  Spinner,
  View,
  XStack,
  YStack,
} from "@nook/app-ui";
import { useAuth } from "../../context/auth";
import { CastAction } from "@nook/common/types";
import { GradientIcon } from "../../components/gradient-icon";
import { Dot, Trash } from "@tamagui/lucide-icons";
import { useCallback, useState } from "react";
import { installAction } from "../../api/settings";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "solito/link";

export const ActionSettings = () => {
  const { settings } = useAuth();

  const actions: (CastAction | null)[] = [];
  for (let i = 0; i < 8; i++) {
    const existingAction = settings?.actions.find((a) => a.index === i);
    actions.push(existingAction ? existingAction.action : null);
  }

  const topBar = actions?.slice(0, 4);
  const bottomBar = actions?.slice(4);

  return (
    <YStack gap="$4" padding="$4">
      <YStack gap="$2">
        <NookText variant="label">Actions</NookText>
        <NookText muted>
          Add custom actions to use on casts. Select on an action to remove it.
        </NookText>
      </YStack>
      <XStack gap="$5" justifyContent="space-around">
        {topBar?.map((a, i) => (
          <ActionItem key={`top-${i}`} action={a} index={i} />
        ))}
      </XStack>
      <XStack gap="$5" justifyContent="space-around">
        {bottomBar?.map((a, i) => (
          <ActionItem key={`bottom-${i}`} action={a} index={i + 4} />
        ))}
      </XStack>
      <Link href="/explore/actions">
        <NookButton variant="action">Browse Actions</NookButton>
      </Link>
    </YStack>
  );
};

const ActionItem = ({
  action,
  index,
}: { action: CastAction | null; index: number }) => {
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const handlePress = useCallback(
    async (index: number) => {
      setLoading(true);
      await installAction(index, null);
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      setLoading(false);
    },
    [queryClient],
  );

  return (
    <NookButton
      backgroundColor="$color3"
      padding="$0"
      height="auto"
      hoverStyle={{
        opacity: 0.5,
        // @ts-ignore
        transition: "all 0.2s ease-in-out",
      }}
      borderWidth="$0"
      overflow="hidden"
      disabled={!action}
      onPress={() => handlePress(index)}
    >
      <View>
        {loading && (
          <View
            width="$6"
            height="$6"
            justifyContent="center"
            alignItems="center"
          >
            <Spinner />
          </View>
        )}
        {action && !loading && (
          <GradientIcon label={action?.name} size="$6" icon={action?.icon} />
        )}
        {!action && !loading && (
          <View
            width="$6"
            height="$6"
            justifyContent="center"
            alignItems="center"
          >
            <Dot size={32} />
          </View>
        )}
        {action && !loading && (
          <View
            position="absolute"
            top="$1"
            right="$1"
            backgroundColor="$red6"
            padding="$1.5"
            borderRadius="$10"
          >
            <Trash color="$red9" size={12} />
          </View>
        )}
      </View>
    </NookButton>
  );
};
