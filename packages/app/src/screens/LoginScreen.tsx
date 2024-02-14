import { Button, Text, View } from "tamagui";
import { useAuth } from "@/context/auth";
import {
  AuthClientError,
  StatusAPIResponse,
  useSignIn,
} from "@farcaster/auth-kit";
import { useCallback, useEffect, useRef } from "react";
import { Linking } from "react-native";
import { DEV } from "@/constants/index";
import { useAppSelector } from "@/hooks/useAppSelector";

export default function LoginScreen() {
  const { signIn, signInDev, session } = useAuth();
  const activeNook = useAppSelector((state) => state.user.activeNook);

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
        try {
          signIn({
            message: req.message,
            nonce: req.nonce,
            signature: req.signature,
          });
        } catch (error) {
          alert((error as Error).message);
        }
      },
      [signIn],
    ),
    onError: useCallback((error: AuthClientError | undefined) => {
      console.error(error);
    }, []),
  });

  const initiateConnect = useCallback(async () => {
    if (DEV) {
      await signInDev();
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
    <View
      flex={1}
      justifyContent="center"
      alignItems="center"
      backgroundColor="$background"
      theme="gray"
    >
      <Button onPress={initiateConnect}>Sign In</Button>
      <View padding="$4">
        {session?.entity && (
          <Text fontWeight="700">{`Welcome @${session.entity.farcaster.username}`}</Text>
        )}
      </View>
    </View>
  );
}