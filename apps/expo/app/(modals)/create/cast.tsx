import { PortalProvider, View } from "@nook/app-ui";
import { FarcasterCastResponsePreview } from "@nook/app/components/farcaster/casts/cast-preview";
import { CreateCastActionBar } from "@nook/app/features/farcaster/create-cast/action-bar";
import { CreateCastProvider } from "@nook/app/features/farcaster/create-cast/context";
import { CreateCastItem } from "@nook/app/features/farcaster/create-cast/form";
import { CreateCastHeaderBar } from "@nook/app/features/farcaster/create-cast/header-bar";
import { useCast } from "@nook/app/hooks/useCast";
import { SubmitCastAddRequest } from "@nook/common/types";
import { router, useLocalSearchParams } from "expo-router";
import { KeyboardAvoidingView } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { View as RNView, ScrollView as RNScrollView } from "react-native";
import { useEffect, useRef } from "react";

export default function CreateCastModal() {
  const initialState = useLocalSearchParams() as SubmitCastAddRequest;
  const insets = useSafeAreaInsets();

  const scrollViewRef = useRef<RNScrollView>(null);
  const viewRef = useRef<RNView>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (scrollViewRef.current && viewRef.current) {
        viewRef.current.measureLayout(
          // @ts-ignore
          scrollViewRef.current,
          (x, y, width, height) => {
            scrollViewRef.current?.scrollTo({ x: 0, y: y, animated: true });
          },
        );
      }
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <PortalProvider>
      <View
        flex={1}
        backgroundColor="$color1"
        paddingTop={insets.top}
        paddingBottom={insets.bottom}
      >
        <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
          <CreateCastProvider initialCast={initialState}>
            <CreateCastHeaderBar onClose={router.back} />
            <ScrollView
              keyboardDismissMode="interactive"
              keyboardShouldPersistTaps="always"
              ref={scrollViewRef}
            >
              {initialState.parentHash && (
                <CreateCastParent parentHash={initialState.parentHash} />
              )}
              <View padding="$3" zIndex={1}>
                <CreateCastItem index={0} />
                <View ref={viewRef} />
              </View>
            </ScrollView>
            <CreateCastActionBar />
          </CreateCastProvider>
        </KeyboardAvoidingView>
      </View>
    </PortalProvider>
  );
}

const CreateCastParent = ({ parentHash }: { parentHash: string }) => {
  const { cast } = useCast(parentHash);

  if (!cast) return null;

  return <FarcasterCastResponsePreview cast={cast} isConnected />;
};
