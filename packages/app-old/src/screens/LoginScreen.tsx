import { Button, Spinner, Text, View, YStack } from "tamagui";
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
  const { signIn, signInDev, error: authError, isInitializing } = useAuth();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState<AuthClientError>();
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
        hasInitiatedConnectRef.current = false;
        hasStartedPollingRef.current = false;
      },
      [signIn],
    ),
    onError: useCallback((error: AuthClientError | undefined) => {
      setError(error);
      setIsLoggingIn(false);
      hasInitiatedConnectRef.current = false;
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
        {(error || authError) && (
          <Text color="$red11" textAlign="center">
            {error?.message || `${JSON.stringify(authError)}`}
          </Text>
        )}
        <Button
          onPress={initiateConnect}
          theme="purple"
          disabled={isLoggingIn || isInitializing}
          backgroundColor={
            isLoggingIn || isInitializing ? "$backgroundStrong" : "$background"
          }
        >
          {isLoggingIn || isInitializing ? (
            <Spinner />
          ) : (
            "Sign In With Farcaster"
          )}
        </Button>
      </YStack>
    </YStack>
  );
}
