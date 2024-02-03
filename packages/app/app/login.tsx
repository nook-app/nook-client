import { Button, View } from "tamagui";
import { useAuth } from "../context/auth";
import {
  AuthClientError,
  StatusAPIResponse,
  useSignIn,
} from "@farcaster/auth-kit";
import { useCallback, useEffect, useRef } from "react";
import { Linking } from "react-native";
import { DEV } from "../constants";
import { Text } from "../components/ui/text";

export default function SignIn() {
  const { signIn, session } = useAuth();

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
      await signIn({
        message:
          "localhost:3000 wants you to sign in with your Ethereum account:\n0x94Bac74eC80C25fd5F19A76F2cd74a46d6618c3A\n\nFarcaster Connect\n\nURI: http://localhost:3000\nVersion: 1\nChain ID: 10\nNonce: yRnR3Cv5FjrRQwAfl\nIssued At: 2024-02-02T23:29:10.600Z\nResources:\n- farcaster://fid/262426",
        nonce: "yRnR3Cv5FjrRQwAfl",
        signature:
          "0x7f539bb1a70bcace1bd652529068b441e38298aa57bb2aca0714a7e7f6c48600613a9c86562890cb948de4a56912a54752c496c69eadc5fb80612d4e615458f41b",
      });
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
      theme="orange"
    >
      <Button onPress={initiateConnect}>Sign In</Button>
      <View padding="$4">
        {session?.entity && (
          <Text bold>{`Welcome @${session.entity.farcaster.username}`}</Text>
        )}
      </View>
    </View>
  );
}
