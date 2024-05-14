import {
  Button,
  Image,
  Spinner,
  Text,
  View,
  XStack,
  YStack,
} from "@nook/app-ui";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "../../../context/auth";
import * as Device from "expo-device";
import { Linking } from "react-native";
import { router } from "expo-router";

export const EnableSignerContent = ({ isOpen }: { isOpen?: boolean }) => {
  const [isPolling, setIsPolling] = useState(false);
  const { session, signer, refreshSigner, setSigner } = useAuth();
  const pollingRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, []);

  const handlePress = useCallback(async () => {
    if (!signer?.deeplinkUrl || !session) return;

    const pollRefresh = async () => {
      const state = await refreshSigner();
      if (state === "completed") {
        clearInterval(pollingRef.current);
        setSigner({ ...signer, state: "completed" });
        router.back();
        return;
      }
    };

    setIsPolling(true);

    const validation = await refreshSigner();
    if (validation === "completed") {
      setSigner({ ...signer, state: "completed" });
      router.back();
      return;
    }

    // Deep link into Warpcast, can't on dev
    if (Device.isDevice) {
      Linking.openURL(signer.deeplinkUrl);
    }

    pollingRef.current = setInterval(pollRefresh, 2000);
  }, [signer, session, refreshSigner, setSigner]);

  return (
    <View flexGrow={1} gap="$4" paddingVertical="$4" paddingHorizontal="$2.5">
      <YStack gap="$3.5">
        <XStack gap="$3" alignItems="center">
          <View borderRadius="$4" overflow="hidden" width="$5" height="$5">
            <Image
              source={require("../../../../app-native/assets/icon.png")}
              style={{ aspectRatio: 1, width: "100%", height: "100%" }}
            />
          </View>
          <Text fontWeight="700" fontSize="$9" color="$mauve12">
            Enable Nook
          </Text>
        </XStack>
        <Text color="$mauve12" fontSize="$5">
          Nook needs permissions from you through Warpcast to be able to perform
          write actions.
        </Text>
      </YStack>
      <Button
        height="$4"
        width="100%"
        borderRadius="$10"
        fontWeight="600"
        fontSize="$5"
        backgroundColor="$mauve12"
        borderWidth="$0"
        color="$mauve1"
        pressStyle={{
          backgroundColor: "$mauve11",
        }}
        disabledStyle={{
          backgroundColor: "$mauve10",
        }}
        disabled={isPolling}
        onPress={handlePress}
        marginTop="$4"
      >
        {isPolling && <Spinner />}
        {!isPolling && "Enable Nook"}
      </Button>
    </View>
  );
};
