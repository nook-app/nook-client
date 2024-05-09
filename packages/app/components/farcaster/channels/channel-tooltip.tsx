import { Tooltip } from "@nook/app-ui";
import { Channel } from "@nook/common/types";
import { ReactNode } from "react";
import { ChannelOverview } from "./channel-overview";

export const FarcasterChannelTooltip = ({
  channel,
  children,
}: {
  channel: Channel;
  children: ReactNode;
}) => {
  return (
    <Tooltip delay={100}>
      <Tooltip.Trigger asChild>{children}</Tooltip.Trigger>
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
        backgroundColor="$color1"
        borderColor="$borderColorBg"
        borderWidth="$0.25"
        padding="$0"
        width={400}
        $sm={{ width: "auto" }}
      >
        <ChannelOverview channel={channel} />
      </Tooltip.Content>
    </Tooltip>
  );
};
