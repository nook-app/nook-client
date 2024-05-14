import {
  NookButton,
  NookText,
  Popover,
  Tooltip,
  View,
  XGroup,
  YGroup,
  useToastController,
} from "@nook/app-ui";
import { Dot, LayoutGrid, Search, Settings } from "@tamagui/lucide-icons";
import { useCallback, useState } from "react";
import { CastAction, FarcasterCastResponse } from "@nook/common/types";
import { useAuth } from "../../../context/auth";
import { submitFrameAction } from "../../../api/farcaster/actions";
import { GradientIcon } from "../../gradient-icon";
import { Link } from "../../link";
import { EnableSignerDialog } from "../../../features/farcaster/enable-signer/dialog";

export const FarcasterCustomActionButton = ({
  cast,
}: { cast: FarcasterCastResponse }) => {
  const [open, setOpen] = useState(false);
  const { settings, session, signer } = useAuth();

  const actions: (CastAction | null)[] = [];
  for (let i = 0; i < 8; i++) {
    const existingAction = settings?.actions.find((a) => a.index === i);
    actions.push(existingAction ? existingAction.action : null);
  }

  const topBar = actions?.slice(0, 4);
  const bottomBar = actions?.slice(4);

  const showTopBar = topBar && topBar.length > 0;
  const showBottomBar = bottomBar && bottomBar.length > 0;

  const close = useCallback(() => setOpen(false), []);

  if (!session) return null;

  return (
    <View
      onPress={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <Popover placement="bottom" open={open} onOpenChange={setOpen}>
        {signer?.state === "completed" ? (
          <Popover.Trigger asChild>
            <View
              cursor="pointer"
              width="$2.5"
              height="$2.5"
              justifyContent="center"
              alignItems="center"
              borderRadius="$10"
              group
              hoverStyle={{
                // @ts-ignore
                transition: "all 0.2s ease-in-out",
                backgroundColor: "$color3",
              }}
            >
              <LayoutGrid
                size={20}
                opacity={0.75}
                color="$mauve11"
                $group-hover={{
                  color: "$color9",
                  opacity: 1,
                }}
              />
            </View>
          </Popover.Trigger>
        ) : (
          <EnableSignerDialog>
            <View
              cursor="pointer"
              width="$2.5"
              height="$2.5"
              justifyContent="center"
              alignItems="center"
              borderRadius="$10"
              group
              hoverStyle={{
                // @ts-ignore
                transition: "all 0.2s ease-in-out",
                backgroundColor: "$color3",
              }}
            >
              <LayoutGrid
                size={20}
                opacity={0.75}
                color="$mauve11"
                $group-hover={{
                  color: "$color9",
                  opacity: 1,
                }}
              />
            </View>
          </EnableSignerDialog>
        )}
        <Popover.Content
          bordered
          enterStyle={{ y: -10, opacity: 0 }}
          exitStyle={{ y: -10, opacity: 0 }}
          elevate
          animation={[
            "100ms",
            {
              opacity: {
                overshootClamping: true,
              },
            },
          ]}
          padding="$0"
          cursor="pointer"
        >
          <Popover.Arrow borderWidth={1} borderColor="$borderColorBg" />
          <YGroup>
            {showTopBar && (
              <XGroup disablePassBorderRadius="bottom">
                {topBar?.map((action, i) => (
                  <CustomActionButton
                    key={`${action?.name}-${i}`}
                    action={action}
                    cast={cast}
                    onPress={close}
                  />
                ))}
              </XGroup>
            )}
            {showBottomBar && (
              <XGroup borderRadius="$0">
                {bottomBar?.map((action, i) => (
                  <CustomActionButton
                    key={`${action?.name}-${i}`}
                    action={action}
                    cast={cast}
                    onPress={close}
                  />
                ))}
              </XGroup>
            )}
            <XGroup disablePassBorderRadius={showTopBar ? "top" : undefined}>
              <XGroup.Item>
                <Link href={"/settings/actions"} unpressable>
                  <NookButton
                    flexGrow={1}
                    backgroundColor="$color3"
                    borderColor="$color5"
                    borderWidth="$0.25"
                    borderBottomRightRadius="$0"
                    borderTopLeftRadius="$0"
                    borderTopRightRadius="$0"
                    onPress={close}
                  >
                    <Settings size={20} />
                  </NookButton>
                </Link>
              </XGroup.Item>
              <XGroup.Item>
                <Link href={"/explore/actions"} unpressable>
                  <NookButton
                    flexGrow={1}
                    backgroundColor="$color3"
                    borderColor="$color5"
                    borderWidth="$0.25"
                    borderBottomLeftRadius="$0"
                    borderTopLeftRadius="$0"
                    borderTopRightRadius="$0"
                    onPress={close}
                  >
                    <Search size={20} />
                  </NookButton>
                </Link>
              </XGroup.Item>
            </XGroup>
          </YGroup>
        </Popover.Content>
      </Popover>
    </View>
  );
};

const CustomActionButton = ({
  action,
  cast,
  onPress,
}: {
  action: CastAction | null;
  cast: FarcasterCastResponse;
  onPress: () => void;
}) => {
  const toast = useToastController();

  const handlePress = useCallback(async () => {
    if (!action) return;
    onPress();
    try {
      const response = await submitFrameAction({
        url: action.postUrl,
        postUrl: action.postUrl,
        castFid: cast.user.fid,
        castHash: cast.hash,
        buttonIndex: 1,
      });
      if ("message" in response) {
        toast.show(response.message);
      }
    } catch (e) {
      toast.show("Error executing action");
    }
  }, [action, cast, toast, onPress]);

  return (
    <XGroup.Item>
      <NookButton
        backgroundColor="$color3"
        padding="$0"
        height="auto"
        flexGrow={1}
        onPress={handlePress}
        hoverStyle={{
          opacity: 0.75,
          // @ts-ignore
          transition: "all 0.2s ease-in-out",
        }}
        borderWidth="$0"
        overflow="hidden"
        disabled={!action}
      >
        {!action && (
          <View
            width="$4"
            height="$4"
            justifyContent="center"
            alignItems="center"
          >
            <Dot size={32} />
          </View>
        )}
        {action && (
          <Tooltip delay={100}>
            <Tooltip.Trigger>
              <GradientIcon
                icon={action.icon}
                label={action.name}
                size="$4"
                noBorderRadius
              />
            </Tooltip.Trigger>
            <Tooltip.Content
              enterStyle={{ x: 0, y: -5, opacity: 0, scale: 0.9 }}
              exitStyle={{ x: 0, y: -5, opacity: 0, scale: 0.9 }}
              scale={1}
              x={0}
              y={0}
              opacity={1}
              animation={[
                "100ms",
                {
                  opacity: {
                    overshootClamping: true,
                  },
                },
              ]}
              maxWidth={300}
            >
              <NookText color="$color1" fontSize="$3" fontWeight="600">
                {action.name}
              </NookText>
              {action.description && (
                <NookText color="$color3" fontSize="$3" textAlign="center">
                  {action.description}
                </NookText>
              )}
            </Tooltip.Content>
          </Tooltip>
        )}
      </NookButton>
    </XGroup.Item>
  );
};
