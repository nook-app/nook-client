import { useAuth } from "../../../context/auth";
import {
  BarChart2,
  Trash,
  UserMinus,
  UserPlus,
  Volume,
  VolumeX,
} from "@tamagui/lucide-icons";
import { Channel, FarcasterCast } from "../../../types";
import { KebabMenu, KebabMenuItem } from "../../kebab-menu";
import { useRouter } from "solito/navigation";
import { useCallback } from "react";
import { useUser } from "../../../api/farcaster";
import { Spinner } from "@nook/ui";
import { useFollowUser } from "../../../hooks/useFollowUser";
import { CdnAvatar } from "../../cdn-avatar";
import { useMuteUser } from "../../../hooks/useMuteUser";
import { useMuteChannel } from "../../../hooks/useMuteChannel";
import { useDeleteCast } from "../../../hooks/useDeleteCast";

export const FarcasterCastKebabMenu = ({ cast }: { cast: FarcasterCast }) => {
  return (
    <KebabMenu>
      <DeleteCast cast={cast} />
      <FollowUser cast={cast} />
      <MuteUser cast={cast} />
      {cast.channel && <MuteChannel channel={cast.channel} />}
      <ViewCastEngagements cast={cast} />
      {cast.appFid && <CastSource cast={cast} />}
    </KebabMenu>
  );
};

const DeleteCast = ({
  cast,
  closeMenu,
}: { cast: FarcasterCast; closeMenu?: () => void }) => {
  const { session } = useAuth();
  const { isDeleting, deleteCast } = useDeleteCast(cast);

  if (!session || cast.user.fid !== session?.fid) {
    return null;
  }

  return (
    <KebabMenuItem
      Icon={isDeleting ? <Spinner color="$color11" /> : Trash}
      title="Delete cast"
      color="$red9"
      onPress={deleteCast}
      closeMenu={closeMenu}
    />
  );
};

const FollowUser = ({
  cast,
  closeMenu,
}: { cast: FarcasterCast; closeMenu?: () => void }) => {
  const { session, login } = useAuth();
  const { isFollowing, followUser, unfollowUser } = useFollowUser(cast.user);

  if (!session || cast.user.fid === session?.fid) {
    return null;
  }

  const handleUnfollowUser = useCallback(async () => {
    if (!session) {
      login();
      return;
    }

    await unfollowUser();
  }, [unfollowUser, session, login]);

  const handleFollowUser = useCallback(async () => {
    if (!session) {
      login();
      return;
    }

    await followUser();
  }, [followUser, session, login]);

  if (isFollowing) {
    return (
      <KebabMenuItem
        Icon={UserMinus}
        title={`Unfollow ${
          cast.user.username ? `@${cast.user.username}` : `!${cast.user.fid}`
        }`}
        color="$mauve12"
        onPress={handleUnfollowUser}
        closeMenu={closeMenu}
      />
    );
  }

  return (
    <KebabMenuItem
      Icon={UserPlus}
      title={`Follow ${
        cast.user.username ? `@${cast.user.username}` : `!${cast.user.fid}`
      }`}
      onPress={handleFollowUser}
      closeMenu={closeMenu}
    />
  );
};

const MuteUser = ({
  cast,
  closeMenu,
}: { cast: FarcasterCast; closeMenu?: () => void }) => {
  const { session } = useAuth();
  const { isMuted, muteUser, unmuteUser } = useMuteUser(cast.user);

  if (!session || cast.user.fid === session?.fid) {
    return null;
  }

  if (isMuted) {
    return (
      <KebabMenuItem
        Icon={Volume}
        title={`Unmute ${
          cast.user.username ? `@${cast.user.username}` : `!${cast.user.fid}`
        }`}
        color="$mauve12"
        onPress={unmuteUser}
        closeMenu={closeMenu}
      />
    );
  }

  return (
    <KebabMenuItem
      Icon={VolumeX}
      title={`Mute ${
        cast.user.username ? `@${cast.user.username}` : `!${cast.user.fid}`
      }`}
      onPress={muteUser}
      closeMenu={closeMenu}
    />
  );
};

const MuteChannel = ({
  channel,
  closeMenu,
}: { channel: Channel; closeMenu?: () => void }) => {
  const { isMuted, muteChannel, unmuteChannel } = useMuteChannel(channel);
  const { session, login } = useAuth();

  if (!session || !channel.channelId) {
    return null;
  }

  if (isMuted) {
    return (
      <KebabMenuItem
        Icon={Volume}
        title={`Unmute /${channel.channelId}`}
        color="$mauve12"
        onPress={unmuteChannel}
        closeMenu={closeMenu}
      />
    );
  }

  return (
    <KebabMenuItem
      Icon={VolumeX}
      title={`Mute /${channel.channelId}`}
      onPress={muteChannel}
      closeMenu={closeMenu}
    />
  );
};

const ViewCastEngagements = ({
  cast,
  closeMenu,
}: { cast: FarcasterCast; closeMenu?: () => void }) => {
  const router = useRouter();
  return (
    <KebabMenuItem
      Icon={BarChart2}
      title="View cast engagements"
      onPress={() => router.push(`/casts/${cast.hash}/likes`)}
      closeMenu={closeMenu}
    />
  );
};

const CastSource = ({
  cast,
  closeMenu,
}: { cast: FarcasterCast; closeMenu?: () => void }) => {
  const { data } = useUser(cast.appFid || "");

  if (!data) return null;

  return (
    <KebabMenuItem
      Icon={<CdnAvatar size="$1" src={data.pfp} />}
      title={`Casted via ${data.displayName}`}
      onPress={() =>
        window.open(`https://warpcast.com/~/conversations/${cast.hash}`)
      }
    />
  );
};
