import { Spinner, Text, View } from "tamagui";
import { useEffect, useState } from "react";
import { farcasterApi } from "@/store/apis/farcasterApi";
import { FarcasterCastResponse } from "@nook/api/types";
import { FarcasterFeedItem } from "../farcaster/FarcasterFeedItem";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export const FarcasterCastReplies = ({ hash }: { hash: string }) => {
  const insets = useSafeAreaInsets();
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [accumulatedData, setAccumulatedData] = useState<
    FarcasterCastResponse[]
  >([]);

  const { data, error, isLoading } = farcasterApi.useGetCastRepliesQuery(hash);

  // biome-ignore lint/correctness/useExhaustiveDependencies: don't need to depend on cursor
  useEffect(() => {
    if (data && !isLoading) {
      if (!cursor) {
        setAccumulatedData(data.data);
      } else {
        setAccumulatedData((currentData) => [...currentData, ...data.data]);
      }
    }
  }, [data, isLoading]);

  if (isLoading || error || !data) {
    return (
      <View padding="$5" alignItems="center" backgroundColor="$background">
        {isLoading ? (
          <Spinner size="large" color="$color11" />
        ) : (
          <Text>No data found.</Text>
        )}
      </View>
    );
  }

  return (
    <View paddingBottom={insets.bottom}>
      {accumulatedData.map((cast) => (
        <FarcasterFeedItem key={cast.hash} cast={cast} />
      ))}
    </View>
  );
};
