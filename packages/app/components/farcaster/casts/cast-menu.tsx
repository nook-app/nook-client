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
import { Channel, FarcasterCastV1, FarcasterUserV1 } from "@nook/common/types";
import { useCallback, useState } from "react";
import { useUser } from "../../../hooks/api/users";
import { Spinner, View } from "@nook/app-ui";
import { useFollowUser } from "../../../hooks/useFollowUser";
import { CdnAvatar } from "../../cdn-avatar";
import { useMuteUser } from "../../../hooks/useMuteUser";
import { useMuteChannel } from "../../../hooks/useMuteChannel";
import { useDeleteCast } from "../../../hooks/useDeleteCast";
import { Menu } from "../../menu/menu";
import { MenuItem } from "../../menu/menu-item";
import { useMenu } from "../../menu/context";
import { Platform } from "react-native";
import { Link } from "../../link";
import { OpenLink } from "../../menu/menu-actions";
import { ManageListDialog } from "../../../features/list/manage-list-dialog";

export const FarcasterCastResponseMenu = ({
  cast,
}: { cast: FarcasterCastV1 }) => {
  const [manageUserListDialogOpen, setManageUserListDialogOpen] =
    useState(false);
  const [manageChannelListDialogOpen, setManageChannelListDialogOpen] =
    useState(false);

  return (
    <>
      <Menu>
        <DeleteCast cast={cast} />
        <FollowUser cast={cast} />
        <AddUserToList
          user={cast.user}
          onPress={() => setManageUserListDialogOpen(true)}
        />
        {cast.channel && (
          <AddChannelToList
            channel={cast.channel}
            onPress={() => setManageChannelListDialogOpen(true)}
          />
        )}
        <MuteUser user={cast.user} />
        {cast.channel && <MuteChannel channel={cast.channel} />}
        <ViewCastEngagements cast={cast} />
        {cast.appFid && <CastSource cast={cast} />}
      </Menu>
      {Platform.OS === "web" && (
        <ManageListDialog
          user={cast.user}
          open={manageUserListDialogOpen}
          setOpen={setManageUserListDialogOpen}
        />
      )}
      {Platform.OS === "web" && cast.channel && (
        <ManageListDialog
          channel={cast.channel}
          open={manageChannelListDialogOpen}
          setOpen={setManageChannelListDialogOpen}
        />
      )}
    </>
  );
};

const DeleteCast = ({ cast }: { cast: FarcasterCastV1 }) => {
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

const AddUserToList = ({
  user,
  onPress,
}: { user: FarcasterUserV1; onPress: () => void }) => {
  const { session } = useAuth();
  const { close } = useMenu();

  if (!session) {
    return null;
  }

  if (Platform.OS === "web") {
    return (
      <MenuItem
        Icon={MenuSquare}
        title="Add/remove from user list"
        onPress={() => {
          onPress();
          close();
        }}
      />
    );
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

const AddChannelToList = ({
  channel,
  onPress,
}: { channel: Channel; onPress: () => void }) => {
  const { session } = useAuth();
  const { close } = useMenu();

  if (!session) {
    return null;
  }

  if (Platform.OS === "web") {
    return (
      <MenuItem
        Icon={MenuSquare}
        title="Add/remove from channel list"
        onPress={() => {
          onPress();
          close();
        }}
      />
    );
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

const FollowUser = ({ cast }: { cast: FarcasterCastV1 }) => {
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

const MuteUser = ({ user }: { user: FarcasterUserV1 }) => {
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

const ViewCastEngagements = ({ cast }: { cast: FarcasterCastV1 }) => {
  const { close } = useMenu();

  return (
    <Link href={`/casts/${cast.hash}/likes`} onPress={close}>
      <MenuItem Icon={BarChart2} title="View cast engagements" />
    </Link>
  );
};

const CastSource = ({ cast }: { cast: FarcasterCastV1 }) => {
  const { data } = useUser(cast.appFid, true);

  return (
    <OpenLink
      image={
        <View minWidth="$0.9">
          <CdnAvatar size="$0.9" src={data?.pfp} />
        </View>
      }
      title={data ? `Casted via ${data.displayName || data.username}` : ""}
      link={`https://warpcast.com/~/conversations/${cast.hash}`}
    />
  );
};
