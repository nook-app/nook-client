import { useAuth } from "../../../context/auth";
import {
  BarChart2,
  MenuSquare,
  Trash,
  UserMinus,
  UserPlus,
  Volume,
  VolumeX,
} from "@tamagui/lucide-icons";
import {
  Channel,
  FarcasterCastResponse,
  FarcasterUser,
  ListType,
} from "@nook/common/types";
import { useRouter } from "solito/navigation";
import { useCallback } from "react";
import { useUser } from "../../../api/farcaster";
import { Spinner, View } from "@nook/app-ui";
import { useFollowUser } from "../../../hooks/useFollowUser";
import { CdnAvatar } from "../../cdn-avatar";
import { useMuteUser } from "../../../hooks/useMuteUser";
import { useMuteChannel } from "../../../hooks/useMuteChannel";
import { useDeleteCast } from "../../../hooks/useDeleteCast";
import { Menu } from "../../menu/menu";
import { MenuItem } from "../../menu/menu-item";
import { useMenu } from "../../menu/context";
import { Linking, Platform } from "react-native";
import { Link } from "../../link";

export const FarcasterCastResponseMenu = ({
  cast,
}: { cast: FarcasterCastResponse }) => {
  return (
    <Menu>
      <DeleteCast cast={cast} />
      <FollowUser cast={cast} />
      <AddUserToList user={cast.user} />
      {cast.channel && <AddChannelToList channel={cast.channel} />}
      <MuteUser user={cast.user} />
      {cast.channel && <MuteChannel channel={cast.channel} />}
      <ViewCastEngagements cast={cast} />
      {cast.appFid && <CastSource cast={cast} />}
    </Menu>
  );
};

const DeleteCast = ({ cast }: { cast: FarcasterCastResponse }) => {
  const { session } = useAuth();
  const { isDeleting, deleteCast } = useDeleteCast(cast);
  const { close } = useMenu();

  const handlePress = useCallback(async () => {
    close();
    await deleteCast();
  }, [deleteCast, close]);

  if (!session || cast.user.fid !== session?.fid) {
    return null;
  }

  return (
    <MenuItem
      Icon={isDeleting ? <Spinner /> : Trash}
      title="Delete cast"
      color="$red9"
      onPress={handlePress}
    />
  );
};

const AddUserToList = ({ user }: { user: FarcasterUser }) => {
  const { session } = useAuth();
  const { close } = useMenu();

  if (!session || Platform.OS === "web") {
    return null;
  }

  return (
    <Link
      href={{
        pathname: "/lists/manage",
        params: { user: JSON.stringify(user) },
      }}
      onPress={close}
    >
      <MenuItem Icon={MenuSquare} title="Add/remove from user list" />
    </Link>
  );
};

const AddChannelToList = ({ channel }: { channel: Channel }) => {
  const { session } = useAuth();
  const { close } = useMenu();

  if (!session || Platform.OS === "web") {
    return null;
  }

  return (
    <Link
      href={{
        pathname: "/lists/manage",
        params: { channel: JSON.stringify(channel) },
      }}
      onPress={close}
    >
      <MenuItem Icon={MenuSquare} title="Add/remove from channel list" />
    </Link>
  );
};

const FollowUser = ({ cast }: { cast: FarcasterCastResponse }) => {
  const { session } = useAuth();
  const { isFollowing, followUser, unfollowUser } = useFollowUser(cast.user);
  const { close } = useMenu();

  const Icon = isFollowing ? UserMinus : UserPlus;
  const title = `${isFollowing ? "Unfollow" : "Follow"} ${
    cast.user.username ? `@${cast.user.username}` : `!${cast.user.fid}`
  }`;

  const handlePress = useCallback(() => {
    if (isFollowing) {
      unfollowUser();
    } else {
      followUser();
    }
    close();
  }, [isFollowing, unfollowUser, followUser, close]);

  if (!session || cast.user.fid === session?.fid) {
    return null;
  }

  return <MenuItem Icon={Icon} title={title} onPress={handlePress} />;
};

const MuteUser = ({ user }: { user: FarcasterUser }) => {
  const { session } = useAuth();
  const { isMuted, muteUser, unmuteUser } = useMuteUser(user);
  const { close } = useMenu();

  const Icon = isMuted ? Volume : VolumeX;
  const title = `${isMuted ? "Unmute" : "Mute"} ${
    user.username ? `@${user.username}` : `!${user.fid}`
  }`;

  const handlePress = useCallback(async () => {
    close();
    if (isMuted) {
      await unmuteUser();
    } else {
      await muteUser();
    }
  }, [isMuted, unmuteUser, muteUser, close]);

  if (!session || user.fid === session?.fid) {
    return null;
  }

  return <MenuItem Icon={Icon} title={title} onPress={handlePress} />;
};

const MuteChannel = ({ channel }: { channel: Channel }) => {
  const { isMuted, muteChannel, unmuteChannel } = useMuteChannel(channel);
  const { session } = useAuth();
  const { close } = useMenu();

  const Icon = isMuted ? Volume : VolumeX;
  const title = `${isMuted ? "Unmute" : "Mute"} /${channel.channelId}`;

  const handlePress = useCallback(async () => {
    close();
    if (isMuted) {
      await unmuteChannel();
    } else {
      await muteChannel();
    }
  }, [isMuted, unmuteChannel, muteChannel, close]);

  if (!session || !channel.channelId) {
    return null;
  }

  return <MenuItem Icon={Icon} title={title} onPress={handlePress} />;
};

const ViewCastEngagements = ({ cast }: { cast: FarcasterCastResponse }) => {
  const router = useRouter();
  const { close } = useMenu();

  return (
    <Link href={`/casts/${cast.hash}/likes`} onPress={close}>
      <MenuItem Icon={BarChart2} title="View cast engagements" />
    </Link>
  );
};

const CastSource = ({ cast }: { cast: FarcasterCastResponse }) => {
  const { data } = useUser(cast.appFid || "");
  const { close } = useMenu();

  const handlePress = useCallback(() => {
    const url = `https://warpcast.com/~/conversations/${cast.hash}`;
    if (Platform.OS === "web") {
      window.open(url);
    } else {
      Linking.openURL(url);
    }
    close();
  }, [cast.hash, close]);

  if (!data) return null;

  return (
    <MenuItem
      Icon={
        <View minWidth="$0.9">
          <CdnAvatar size="$0.9" src={data.pfp} />
        </View>
      }
      title={`Casted via ${data.displayName}`}
      onPress={handlePress}
    />
  );
};
