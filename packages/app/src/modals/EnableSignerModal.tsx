import { Button, Spinner, Text, View, YStack } from "tamagui";
import { useAuth } from "@/context/auth";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useState } from "react";
import { getFarcasterSigner, validateFarcasterSigner } from "@/utils/api";
import { Linking } from "react-native";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "@/types";
import { useAppSelector } from "@/hooks/useAppSelector";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { setSignerEnabled } from "@/store/user";

export const EnableSignerModal = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { session } = useAuth();
  const [isEnablingSigner, setIsEnablingSigner] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const insets = useSafeAreaInsets();
  const signerEnabled = useAppSelector(
    (state) => state.user.user?.signerEnabled || false,
  );
  const dispatch = useAppDispatch();

  const handleEnableSigner = async () => {
    if (!session) return;
    setIsEnablingSigner(true);
    try {
      const signer = await getFarcasterSigner(session);
      if (!signer || signer.state !== "pending") return;
      Linking.openURL(signer.deeplinkUrl);

      let pollCount = 0;
      const maxPollCount = 30;

      const intervalId = setInterval(async () => {
        try {
          pollCount++;
          const { state } = await validateFarcasterSigner(
            session,
            signer.token,
          );
          if (state === "completed") {
            dispatch(setSignerEnabled(true));
            clearInterval(intervalId);
            setIsEnablingSigner(false);
          } else if (pollCount > maxPollCount) {
            clearInterval(intervalId);
            setIsEnablingSigner(false);
            setError(new Error("Signer validation timed out"));
          }
        } catch (pollError) {
          setError(
            new Error(
              `Failed to enable signer: ${(pollError as Error).message}`,
            ),
          );
          clearInterval(intervalId);
          setIsEnablingSigner(false);
        }
      }, 2000);
    } catch (error) {
      setError(
        new Error(`Failed to enable signer: ${(error as Error).message}`),
      );
      setIsEnablingSigner(false);
    }
  };

  if (!session || signerEnabled) {
    return null;
  }

  return (
    <YStack
      flex={1}
      justifyContent="flex-end"
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
      <View flexGrow={1} padding="$5" justifyContent="center" gap="$2">
        <Text fontSize="$8" fontWeight="700">
          Enable Nook
        </Text>
        <Text fontSize="$4">
          In order to perform write actions with your Farcaster account, you
          first need to enable Nook by approving a request in Warpcast.
        </Text>
        <Text fontSize="$4">This will cost a small amount of Warps.</Text>
      </View>
      <YStack padding="$5" width="100%" gap="$2">
        {error && (
          <Text color="$red11" textAlign="center">
            {error.message}
          </Text>
        )}
        <Button
          onPress={handleEnableSigner}
          theme="purple"
          disabled={isEnablingSigner}
          backgroundColor={
            isEnablingSigner ? "$backgroundStrong" : "$background"
          }
        >
          {isEnablingSigner ? <Spinner /> : "Enable Nook"}
        </Button>
        <Button onPress={() => navigation.goBack()}>Go back</Button>
      </YStack>
    </YStack>
  );
};
