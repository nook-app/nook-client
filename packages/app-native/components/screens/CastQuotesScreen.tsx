import { useLocalSearchParams } from "expo-router";
import { FarcasterCastQuotes } from "@nook/app/features/farcaster/cast-screen/cast-quotes";

export default function CastQuotesScreen() {
  const { hash } = useLocalSearchParams();
  return <FarcasterCastQuotes hash={hash as string} />;
}
