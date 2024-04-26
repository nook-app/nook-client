"use client";

import {
  NookText,
  Spinner,
  Theme,
  ThemeName,
  View,
  XStack,
  YStack,
} from "@nook/ui";
import { NotificationResponse } from "../../types";
import { InfiniteScrollList } from "../../components/infinite-scroll-list";
import { Loading } from "../../components/loading";
import { NamedExoticComponent, memo } from "react";
import { FarcasterCastDefaultDisplay } from "../../components/farcaster/casts/cast-display";
import { useAuth } from "../../context/auth";
import { Link, TextLink } from "solito/link";
import { CdnAvatar } from "../../components/cdn-avatar";
import { User, Repeat2, Heart } from "@tamagui/lucide-icons";
import { useRouter } from "solito/navigation";
import { FarcasterCastText } from "../../components/farcaster/casts/cast-text";

export const NotificationsInfiniteFeed = ({
  notifications,
  fetchNextPage,
  isFetchingNextPage,
  hasNextPage,
  ListHeaderComponent,
  isLoading,
}: {
  notifications: NotificationResponse[];
  fetchNextPage: () => void;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  ListHeaderComponent?: JSX.Element;
  isLoading?: boolean;
}) => {
  return (
    <InfiniteScrollList
      data={notifications}
      renderItem={({ item }) => (
        <NotificationItem notification={item as NotificationResponse} />
      )}
      onEndReached={fetchNextPage}
      ListFooterComponent={
        isFetchingNextPage ? (
          <View marginVertical="$3">
            <Spinner size="small" color="$color9" />
          </View>
        ) : null
      }
      ListHeaderComponent={ListHeaderComponent}
      ListEmptyComponent={isLoading ? <Loading /> : null}
    />
  );
};

const NotificationItem = memo(
  ({ notification }: { notification: NotificationResponse }) => {
    switch (notification.type) {
      case "MENTION":
        return <MentionNotification notification={notification} />;
      case "REPLY":
        return <ReplyNotification notification={notification} />;
      case "LIKE":
        return <LikeNotification notification={notification} />;
      case "RECAST":
        return <RecastNotification notification={notification} />;
      case "QUOTE":
        return <QuoteNotification notification={notification} />;
      case "FOLLOW":
        return <FollowNotification notification={notification} />;
      case "POST":
        return <PostNotification notification={notification} />;
      default:
        return null;
    }
  },
);

const PostNotification = ({
  notification,
}: { notification: NotificationResponse }) => {
  if (!notification.cast) return null;
  return (
    <Notification href={`/casts/${notification.cast?.hash}`}>
      <View flex={1}>
        <FarcasterCastDefaultDisplay cast={notification.cast} />
      </View>
    </Notification>
  );
};

const MentionNotification = ({
  notification,
}: { notification: NotificationResponse }) => {
  if (!notification.cast) return null;
  return (
    <Notification href={`/casts/${notification.cast?.hash}`}>
      <View flex={1}>
        <FarcasterCastDefaultDisplay cast={notification.cast} />
      </View>
    </Notification>
  );
};

const ReplyNotification = ({
  notification,
}: { notification: NotificationResponse }) => {
  if (!notification.cast || !notification.cast.parent) return null;
  return (
    <Notification href={`/casts/${notification.cast?.hash}`}>
      <View flex={1}>
        <FarcasterCastDefaultDisplay
          cast={notification.cast.parent}
          isConnected
        />
        <FarcasterCastDefaultDisplay cast={notification.cast} />
      </View>
    </Notification>
  );
};

const QuoteNotification = ({
  notification,
}: { notification: NotificationResponse }) => {
  if (!notification.cast) return null;
  return (
    <Notification href={`/casts/${notification.cast?.hash}`}>
      <View flex={1}>
        <FarcasterCastDefaultDisplay cast={notification.cast} />
      </View>
    </Notification>
  );
};

const LikeNotification = ({
  notification,
}: { notification: NotificationResponse }) => {
  const { user } = useAuth();
  if (
    !notification.users ||
    notification.users.length === 0 ||
    !notification.cast
  )
    return null;
  return (
    <Notification
      Icon={Heart}
      href={`/casts/${notification.cast?.hash}`}
      theme="red"
    >
      <YStack gap="$2" flexShrink={1} paddingVertical="$3">
        <XStack
          gap="$2"
          $platform-web={{ overflowX: "scroll", scrollbarWidth: "none" }}
        >
          {notification.users.slice(0, 10).map((user, i) => (
            <Link key={user.fid} href={`/users/${user.username}`}>
              <CdnAvatar src={user.pfp} size="$2.5">
                <View
                  position="absolute"
                  backgroundColor="$color3"
                  justifyContent="center"
                  alignItems="center"
                  width="100%"
                  height="100%"
                >
                  <User size={20} />
                </View>
              </CdnAvatar>
            </Link>
          ))}
        </XStack>
        <NookText>
          <TextLink href={`/users/${notification.users[0].username}`}>
            <NookText fontWeight="700" color="$mauve12">
              {notification.users[0].username}
            </NookText>
          </TextLink>
          {notification.users.length > 1 && (
            <>
              <NookText> and </NookText>
              <TextLink href={`/users/${user?.username}/followers`}>
                <NookText fontWeight="700" color="$mauve12">{`${
                  notification.users.length - 1
                } other${notification.users.length > 2 ? "s" : ""}`}</NookText>
              </TextLink>
            </>
          )}
          <NookText> liked</NookText>
        </NookText>
        <YStack gap="$2">
          <FarcasterCastText cast={notification.cast} color="$mauve11" />
          {notification.cast.embeds.map((embed, i) => {
            return (
              <NookText key={embed.uri} color="$mauve11">
                {embed.uri}
              </NookText>
            );
          })}
        </YStack>
      </YStack>
    </Notification>
  );
};

const RecastNotification = ({
  notification,
}: { notification: NotificationResponse }) => {
  const { user } = useAuth();
  if (
    !notification.users ||
    notification.users.length === 0 ||
    !notification.cast
  )
    return null;

  return (
    <Notification
      Icon={Repeat2}
      href={`/casts/${notification.cast?.hash}`}
      theme="green"
    >
      <YStack gap="$2" flexShrink={1} paddingVertical="$3">
        <XStack
          gap="$2"
          $platform-web={{ overflowX: "scroll", scrollbarWidth: "none" }}
        >
          {notification.users.slice(0, 10).map((user, i) => (
            <Link key={user.fid} href={`/users/${user.username}`}>
              <CdnAvatar src={user.pfp} size="$2.5">
                <View
                  position="absolute"
                  backgroundColor="$color3"
                  justifyContent="center"
                  alignItems="center"
                  width="100%"
                  height="100%"
                >
                  <User size={20} />
                </View>
              </CdnAvatar>
            </Link>
          ))}
        </XStack>
        <NookText>
          <TextLink href={`/users/${notification.users[0].username}`}>
            <NookText fontWeight="700" color="$mauve12">
              {notification.users[0].username}
            </NookText>
          </TextLink>
          {notification.users.length > 1 && (
            <>
              <NookText> and </NookText>
              <TextLink href={`/users/${user?.username}/followers`}>
                <NookText fontWeight="700" color="$mauve12">{`${
                  notification.users.length - 1
                } other${notification.users.length > 2 ? "s" : ""}`}</NookText>
              </TextLink>
            </>
          )}
          <NookText> recasted</NookText>
        </NookText>
        <YStack gap="$2">
          <FarcasterCastText cast={notification.cast} color="$mauve11" />
          {notification.cast.embeds.map((embed, i) => {
            return (
              <NookText key={embed.uri} color="$mauve11">
                {embed.uri}
              </NookText>
            );
          })}
        </YStack>
      </YStack>
    </Notification>
  );
};

const FollowNotification = ({
  notification,
}: { notification: NotificationResponse }) => {
  const { user } = useAuth();
  if (!notification.users || notification.users.length === 0) return null;

  return (
    <Notification
      Icon={User}
      href={`/users/${user?.username}/followers`}
      theme="blue"
    >
      <YStack gap="$2" flexShrink={1} paddingVertical="$3">
        <XStack
          gap="$2"
          $platform-web={{ overflowX: "scroll", scrollbarWidth: "none" }}
        >
          {notification.users.slice(0, 10).map((user, i) => (
            <Link key={user.fid} href={`/users/${user.username}`}>
              <CdnAvatar src={user.pfp} size="$2.5">
                <View
                  position="absolute"
                  backgroundColor="$color3"
                  justifyContent="center"
                  alignItems="center"
                  width="100%"
                  height="100%"
                >
                  <User size={20} />
                </View>
              </CdnAvatar>
            </Link>
          ))}
        </XStack>
        <NookText>
          <TextLink href={`/users/${notification.users[0].username}`}>
            <NookText fontWeight="700" color="$mauve12">
              {notification.users[0].username}
            </NookText>
          </TextLink>
          {notification.users.length > 1 && (
            <>
              <NookText> and </NookText>
              <TextLink href={`/users/${user?.username}/followers`}>
                <NookText fontWeight="700" color="$mauve12">{`${
                  notification.users.length - 1
                } other${notification.users.length > 2 ? "s" : ""}`}</NookText>
              </TextLink>
            </>
          )}
          <NookText> followed you</NookText>
        </NookText>
      </YStack>
    </Notification>
  );
};

const Notification = ({
  Icon,
  children,
  href,
  theme,
}: {
  Icon?: NamedExoticComponent;
  children: JSX.Element;
  href: string;
  theme?: string;
}) => {
  const router = useRouter();
  return (
    <XStack
      borderBottomWidth="$0.5"
      borderColor="$borderColorBg"
      hoverStyle={{
        // @ts-ignore
        transition: "all 0.2s ease-in-out",
        backgroundColor: "$color2",
      }}
      onPress={() => {
        router.push(href);
      }}
      paddingHorizontal="$2"
    >
      {Icon && (
        <Theme name={theme as ThemeName | undefined}>
          <View width="$6" alignItems="flex-end" padding="$3">
            <View
              cursor="pointer"
              width="$2.5"
              height="$2.5"
              justifyContent="center"
              alignItems="center"
              borderRadius="$10"
              backgroundColor="$color3"
            >
              {/* @ts-ignore */}
              <Icon color="$color9" size={18} />
            </View>
          </View>
        </Theme>
      )}
      {children}
    </XStack>
  );
};
