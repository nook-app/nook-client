import { useLocalSearchParams } from "expo-router";
import { FarcasterCastRecasts } from "@nook/app/features/farcaster/cast-screen/cast-recasts";

export default function CastRecastsScreen() {
  const { hash } = useLocalSearchParams();
  return <FarcasterCastRecasts hash={hash as string} />;
}
