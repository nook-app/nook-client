import { Button, Spinner, Text, View, YStack } from "tamagui";
import { useAuth } from "@/context/auth";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useState } from "react";
import { Linking } from "react-native";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "@/types";
import { useAppSelector } from "@/hooks/useAppSelector";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { setSignerEnabled } from "@/store/slices/user";
import { farcasterApi } from "@/store/apis/farcasterApi";

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
  const [getSigner] = farcasterApi.useLazyGetSignerQuery();
  const [validateSigner] = farcasterApi.useValidateSignerMutation();

  const handleEnableSigner = async () => {
    if (!session) return;
    setIsEnablingSigner(true);
    try {
      const { data: signer } = await getSigner(null);
      if (signer?.state === "completed") {
        await validateSigner(signer.token);
        dispatch(setSignerEnabled(true));
      }
      if (signer?.state !== "pending") {
        return;
      }
      Linking.openURL(signer.deeplinkUrl);

      let attempts = 0;

      const executePoll = async () => {
        if (attempts < 30) {
          try {
            const response = await validateSigner(signer.token);
            if ("error" in response) {
            } else if (response.data.state === "completed") {
              dispatch(setSignerEnabled(true));
              setIsEnablingSigner(false);
              return;
            }
          } catch (e) {}
          attempts++;
          setTimeout(executePoll, 2000);
        } else {
          setError(new Error("Signer validation timed out"));
          setIsEnablingSigner(false);
        }
      };

      executePoll();
    } catch (error) {
      setError(
        new Error(`Failed to enable signer: ${(error as Error).message}`),
      );
      setIsEnablingSigner(false);
    }
  };

  if (!session || signerEnabled) {
    return (
      <View>
        <Text>Test</Text>
      </View>
    );
  }

  return (
    <YStack
      flex={1}
      backgroundColor="$background"
      style={{
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
        paddingLeft: insets.left,
        paddingRight: insets.right,
      }}
    >
      <View
        flexDirection="row"
        alignItems="center"
        paddingHorizontal="$3"
        height="$4"
      >
        <Text fontSize="$6" onPress={() => navigation.goBack()}>
          Cancel
        </Text>
      </View>
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
          disabled={isEnablingSigner}
          backgroundColor={
            isEnablingSigner ? "$backgroundStrong" : "$backgroundFocus"
          }
        >
          {isEnablingSigner ? <Spinner /> : "Enable Nook"}
        </Button>
      </YStack>
    </YStack>
  );
};
