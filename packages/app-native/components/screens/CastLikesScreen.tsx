import { useLocalSearchParams } from "expo-router";
import { FarcasterCastLikes } from "@nook/app/features/farcaster/cast-screen/cast-likes";

export default function CastLikesScreen() {
  const { hash } = useLocalSearchParams();
  return <FarcasterCastLikes hash={hash as string} />;
}
