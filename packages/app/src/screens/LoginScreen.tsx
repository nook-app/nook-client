import { Button, Text, View, YStack } from "tamagui";
import { useAuth } from "@/context/auth";
import {
  AuthClientError,
  StatusAPIResponse,
  useSignIn,
} from "@farcaster/auth-kit";
import { useCallback, useEffect, useRef, useState } from "react";
import { Linking } from "react-native";
import { CONFIG } from "@/constants/index";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function LoginScreen() {
  const { signIn, signInDev, error } = useAuth();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const insets = useSafeAreaInsets();

  const hasInitiatedConnectRef = useRef(false);
  const hasStartedPollingRef = useRef(false);

  const {
    connect,
    isError: isConnectError,
    reconnect,
    signIn: startPolling,
    url,
  } = useSignIn({
    onSuccess: useCallback(
      async (req: StatusAPIResponse) => {
        if (!req.message || !req.nonce || !req.signature) {
          return;
        }
        await signIn({
          message: req.message,
          nonce: req.nonce,
          signature: req.signature,
        });
        setIsLoggingIn(false);
      },
      [signIn],
    ),
    onError: useCallback((error: AuthClientError | undefined) => {
      console.error(error);
      setIsLoggingIn(false);
    }, []),
  });

  const initiateConnect = useCallback(async () => {
    setIsLoggingIn(true);
    if (CONFIG.dev) {
      await signInDev();
      setIsLoggingIn(false);
    } else if (!hasInitiatedConnectRef.current) {
      hasInitiatedConnectRef.current = true;
      await connect();
    } else if (isConnectError) {
      reconnect();
    } else if (url) {
      Linking.openURL(url);
    }
  }, [connect, isConnectError, reconnect, url, signIn]);

  useEffect(() => {
    if (url && !hasStartedPollingRef.current) {
      hasStartedPollingRef.current = true;
      startPolling();
      Linking.openURL(url);
    }
  }, [startPolling, url]);

  return (
    <YStack
      flex={1}
      justifyContent="space-between"
      alignItems="center"
      backgroundColor="$background"
      theme="gray"
      style={{
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
        paddingLeft: insets.left,
        paddingRight: insets.right,
      }}
    >
      <View
        padding="$5"
        flexGrow={1}
        alignItems="center"
        justifyContent="center"
      >
        <Text fontSize="$10" fontWeight="700">
          nook
        </Text>
      </View>
      <YStack padding="$5" width="100%" gap="$2">
        {error && (
          <Text color="$red11" textAlign="center">
            {error.message}
          </Text>
        )}
        <Button onPress={initiateConnect} theme="purple" disabled={isLoggingIn}>
          Sign In With Farcaster
        </Button>
      </YStack>
    </YStack>
  );
}
