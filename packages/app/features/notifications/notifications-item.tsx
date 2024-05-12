import { NookText, View, XStack, YStack } from "@nook/app-ui";
import { Display, NotificationResponse } from "@nook/common/types";
import { memo } from "react";
import { useAuth } from "../../context/auth";
import { CdnAvatar } from "../../components/cdn-avatar";
import { User, Repeat2, Heart } from "@tamagui/lucide-icons";
import { FarcasterCastResponseText } from "../../components/farcaster/casts/cast-text";
import { FarcasterCastLink } from "../../components/farcaster/casts/cast-link";
import { Notification } from "./notification-link";
import { Link } from "../../components/link";

export const NotificationItem = memo(
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
      <FarcasterCastLink
        cast={notification.cast}
        displayMode={Display.NOTIFICATION}
      />
    </Notification>
  );
};

const MentionNotification = ({
  notification,
}: { notification: NotificationResponse }) => {
  if (!notification.cast) return null;
  return (
    <Notification href={`/casts/${notification.cast?.hash}`}>
      <View flexGrow={1}>
        <FarcasterCastLink
          cast={notification.cast}
          displayMode={Display.NOTIFICATION}
        />
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
      <View flexGrow={1}>
        <FarcasterCastLink
          cast={notification.cast}
          displayMode={Display.NOTIFICATION}
        />
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
      <View flexGrow={1}>
        <FarcasterCastLink
          cast={notification.cast}
          displayMode={Display.NOTIFICATION}
        />
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
          {notification.users.slice(0, 8).map((user, i) => (
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
          <Link asText href={`/users/${notification.users[0].username}`}>
            <NookText fontWeight="700" color="$mauve12">
              {notification.users[0].username}
            </NookText>
          </Link>
          {notification.users.length > 1 && (
            <>
              <NookText> and </NookText>
              <Link asText href={`/users/${user?.username}/followers`}>
                <NookText fontWeight="700" color="$mauve12">{`${
                  notification.users.length - 1
                } other${notification.users.length > 2 ? "s" : ""}`}</NookText>
              </Link>
            </>
          )}
          <NookText> liked</NookText>
        </NookText>
        <YStack gap="$2">
          <FarcasterCastResponseText
            cast={notification.cast}
            color="$mauve11"
          />
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
          {notification.users.slice(0, 8).map((user, i) => (
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
          <Link asText href={`/users/${notification.users[0].username}`}>
            <NookText fontWeight="700" color="$mauve12">
              {notification.users[0].username}
            </NookText>
          </Link>
          {notification.users.length > 1 && (
            <>
              <NookText> and </NookText>
              <Link asText href={`/users/${user?.username}/followers`}>
                <NookText fontWeight="700" color="$mauve12">{`${
                  notification.users.length - 1
                } other${notification.users.length > 2 ? "s" : ""}`}</NookText>
              </Link>
            </>
          )}
          <NookText> recasted</NookText>
        </NookText>
        <YStack gap="$2">
          <FarcasterCastResponseText
            cast={notification.cast}
            color="$mauve11"
          />
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
          {notification.users.slice(0, 8).map((user, i) => (
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
          <Link asText href={`/users/${notification.users[0].username}`}>
            <NookText fontWeight="700" color="$mauve12">
              {notification.users[0].username}
            </NookText>
          </Link>
          {notification.users.length > 1 && (
            <>
              <NookText> and </NookText>
              <Link asText href={`/users/${user?.username}/followers`}>
                <NookText fontWeight="700" color="$mauve12">{`${
                  notification.users.length - 1
                } other${notification.users.length > 2 ? "s" : ""}`}</NookText>
              </Link>
            </>
          )}
          <NookText> followed you</NookText>
        </NookText>
      </YStack>
    </Notification>
  );
};
