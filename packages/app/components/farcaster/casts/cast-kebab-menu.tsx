import { useAuth } from "../../../context/auth";
import { BarChart2, Trash, UserMinus, UserPlus } from "@tamagui/lucide-icons";
import { submitCastRemove } from "../../../server/farcaster";
import { FarcasterCast } from "../../../types";
import { KebabMenu, KebabMenuItem } from "../../kebab-menu";
import { useParams, useRouter } from "solito/navigation";
import { useCallback, useState } from "react";
import { fetchCast } from "../../../api/farcaster";
import { Spinner, useToastController } from "@nook/ui";
import { useFollowUser } from "../../../hooks/useFollowUser";

export const FarcasterCastKebabMenu = ({ cast }: { cast: FarcasterCast }) => {
  return (
    <KebabMenu>
      <DeleteCast cast={cast} />
      <FollowUser cast={cast} />
      <ViewCastEngagements cast={cast} />
    </KebabMenu>
  );
};

const DeleteCast = ({ cast }: { cast: FarcasterCast }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const toast = useToastController();
  const { session } = useAuth();
  const params = useParams();
  const router = useRouter();

  if (cast.user.fid !== session?.fid) {
    return null;
  }

  const handleDelete = useCallback(async () => {
    setIsDeleting(true);
    await submitCastRemove({ hash: cast.hash });

    const maxAttempts = 60;

    let response;
    let currentAttempts = 0;
    while (currentAttempts < maxAttempts && response) {
      currentAttempts++;
      response = await fetchCast(cast.hash);
      if (!response) break;
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    if (response) {
      setIsDeleting(false);
      toast.show("Failed to refresh");
      return;
    }

    setIsDeleting(false);
    toast.show("Cast deleted");
    if (params.hash === cast.hash) {
      router.push("/");
    }
  }, [cast, toast, router, params.hash]);

  return (
    <KebabMenuItem
      Icon={isDeleting ? <Spinner color="$color11" /> : Trash}
      title="Delete cast"
      color="$red9"
      onPress={handleDelete}
    />
  );
};

const FollowUser = ({ cast }: { cast: FarcasterCast }) => {
  const { session } = useAuth();
  const { isFollowing, followUser, unfollowUser } = useFollowUser(cast.user);
  if (cast.user.fid === session?.fid) {
    return null;
  }

  if (isFollowing) {
    return (
      <KebabMenuItem
        Icon={UserMinus}
        title={`Unfollow ${
          cast.user.username ? `@${cast.user.username}` : `!${cast.user.fid}`
        }`}
        color="$mauve12"
        onPress={() => unfollowUser({})}
      />
    );
  }

  return (
    <KebabMenuItem
      Icon={UserPlus}
      title={`Follow ${
        cast.user.username ? `@${cast.user.username}` : `!${cast.user.fid}`
      }`}
      onPress={() => followUser({})}
    />
  );
};

const ViewCastEngagements = ({ cast }: { cast: FarcasterCast }) => {
  const router = useRouter();
  return (
    <KebabMenuItem
      Icon={BarChart2}
      title="View cast engagements"
      onPress={() => router.push(`/casts/${cast.hash}/likes`)}
    />
  );
};
