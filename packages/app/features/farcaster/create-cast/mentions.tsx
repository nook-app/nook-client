import {
  Adapt,
  Popover,
  ScrollView,
  Spinner,
  View,
  YStack,
  useDebounceValue,
} from "@nook/app-ui";
import { useCreateCast } from "./context";
import { FarcasterChannelDisplay } from "../../../components/farcaster/channels/channel-display";
import { ReactNode, useMemo } from "react";
import { FarcasterUserDisplay } from "../../../components/farcaster/users/user-display";
import { KeyboardAvoidingView, Platform } from "react-native";
import { SubmitCastAddRequest } from "@nook/common/types";
import { FullWindowOverlay } from "react-native-screens";
import { useSearchUsers } from "../../../hooks/api/users";
import { useSearchChannels } from "../../../hooks/api/channels";

export const CreateCastMentions = ({ children }: { children: ReactNode }) => {
  const { activeCast, updateText, activeIndex } = useCreateCast();
  const lastWord = activeCast.text.split(/\s+/).pop();
  const isChannelMention = lastWord?.startsWith("/");
  const isUserMention = lastWord?.startsWith("@");

  const search = useDebounceValue(lastWord?.slice(1) || "", 500);

  const containerComponent = useMemo(
    () => (props: { children: ReactNode }) =>
      Platform.OS === "ios" ? (
        <FullWindowOverlay>
          <View f={1} pe="box-none">
            {props.children}
          </View>
        </FullWindowOverlay>
      ) : (
        props.children
      ),
    [],
  );

  return (
    <Popover
      size="$5"
      allowFlip
      placement="bottom-start"
      open={(isChannelMention || isUserMention) && !!lastWord && !!search}
    >
      <Popover.Trigger>{children}</Popover.Trigger>

      <Adapt when="sm" platform="touch">
        <Popover.Sheet
          modal
          dismissOnSnapToBottom
          snapPoints={[70]}
          animation="100ms"
          containerComponent={containerComponent}
        >
          <Popover.Sheet.Frame
            paddingBottom="$8"
            paddingTop="$2"
            backgroundColor="$color2"
          >
            <KeyboardAvoidingView
              behavior="padding"
              style={{ flex: 1 }}
              keyboardVerticalOffset={260}
            >
              <Popover.Sheet.ScrollView keyboardShouldPersistTaps="handled">
                <MentionResults
                  search={search}
                  isChannelMention={isChannelMention}
                  isUserMention={isUserMention}
                  lastWord={lastWord}
                  updateText={updateText}
                  activeIndex={activeIndex}
                  activeCast={activeCast}
                />
              </Popover.Sheet.ScrollView>
            </KeyboardAvoidingView>
          </Popover.Sheet.Frame>
        </Popover.Sheet>
      </Adapt>
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
        <ScrollView $platform-web={{ maxHeight: "50vh" }}>
          <MentionResults
            search={search}
            isChannelMention={isChannelMention}
            isUserMention={isUserMention}
            lastWord={lastWord}
            updateText={updateText}
            activeIndex={activeIndex}
            activeCast={activeCast}
          />
        </ScrollView>
      </Popover.Content>
    </Popover>
  );
};

const MentionResults = ({
  search,
  isChannelMention,
  isUserMention,
  lastWord,
  updateText,
  activeIndex,
  activeCast,
}: {
  search: string;
  isChannelMention?: boolean;
  isUserMention?: boolean;
  lastWord?: string;
  updateText: (index: number, text: string) => void;
  activeIndex: number;
  activeCast: SubmitCastAddRequest;
}) => {
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
  );
};
