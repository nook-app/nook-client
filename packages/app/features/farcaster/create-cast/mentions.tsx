import { useSearchChannels, useSearchUsers } from "../../../api/farcaster";
import {
  Popover,
  ScrollView,
  Spinner,
  View,
  YStack,
  useDebounceValue,
} from "@nook/app-ui";
import { useCreateCast } from "./context";
import { FarcasterChannelDisplay } from "../../../components/farcaster/channels/channel-display";
import { ReactNode } from "react";
import { FarcasterUserDisplay } from "../../../components/farcaster/users/user-display";

export const CreateCastMentions = ({ children }: { children: ReactNode }) => {
  const { activeCast, updateText, activeIndex } = useCreateCast();
  const lastWord = activeCast.text.split(/\s+/).pop();
  const isChannelMention = lastWord?.startsWith("/");
  const isUserMention = lastWord?.startsWith("@");

  const search = useDebounceValue(lastWord?.slice(1) || "", 500);

  const { data: searchedChannels, isLoading: isChannelsLoading } =
    useSearchChannels(
      isChannelMention && !!lastWord && lastWord.length > 1 ? search : "",
      10,
    );

  const { data: searchedUsers, isLoading: isUsersLoading } = useSearchUsers(
    isUserMention && !!lastWord && lastWord.length > 1 ? search : "",
    10,
  );

  return (
    <Popover
      size="$5"
      allowFlip
      placement="bottom-start"
      open={(isChannelMention || isUserMention) && !!lastWord && !!search}
    >
      <Popover.Trigger>{children}</Popover.Trigger>
      <Popover.Content
        borderWidth={1}
        borderColor="$borderColorBg"
        enterStyle={{ y: -10, opacity: 0 }}
        exitStyle={{ y: -10, opacity: 0 }}
        elevate
        animation={[
          "quick",
          {
            opacity: {
              overshootClamping: true,
            },
          },
        ]}
        padding="$0"
      >
        <ScrollView maxHeight="50vh">
          <YStack width={350}>
            {(isChannelsLoading || isUsersLoading) && (
              <View padding="$4" justifyContent="center" alignItems="center">
                <Spinner size="small" />
              </View>
            )}
            {!isChannelsLoading &&
              isChannelMention &&
              searchedChannels?.pages.map((page) =>
                page.data.map((channel) => (
                  <View
                    key={channel.channelId}
                    padding="$3"
                    hoverStyle={{
                      backgroundColor: "$color4",
                      // @ts-ignore
                      transition: "all 0.2s ease-in",
                    }}
                    cursor="pointer"
                    onPress={() => {
                      if (lastWord) {
                        updateText(
                          activeIndex,
                          `${activeCast.text.substring(
                            0,
                            activeCast.text.length - lastWord.length,
                          )}/${channel.channelId} `,
                        );
                      }
                    }}
                  >
                    <FarcasterChannelDisplay channel={channel} />
                  </View>
                )),
              )}
            {!isUsersLoading &&
              isUserMention &&
              searchedUsers?.pages.map((page) =>
                page.data.map((user) => (
                  <View
                    key={user.username}
                    padding="$3"
                    hoverStyle={{
                      backgroundColor: "$color4",
                      // @ts-ignore
                      transition: "all 0.2s ease-in",
                    }}
                    cursor="pointer"
                    onPress={() => {
                      if (lastWord) {
                        updateText(
                          activeIndex,
                          `${activeCast.text.substring(
                            0,
                            activeCast.text.length - lastWord.length,
                          )}@${user.username} `,
                        );
                      }
                    }}
                  >
                    <FarcasterUserDisplay user={user} />
                  </View>
                )),
              )}
          </YStack>
        </ScrollView>
      </Popover.Content>
    </Popover>
  );
};
