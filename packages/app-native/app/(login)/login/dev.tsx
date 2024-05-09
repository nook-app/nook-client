import { useAuth } from "@nook/app/context/auth";
import {
  Button,
  Input,
  Label,
  Spinner,
  Text,
  View,
  YStack,
} from "@nook/app-ui";
import { Redirect } from "expo-router";
import { useMutation } from "@tanstack/react-query";
import { makeRequest } from "@nook/app/api/utils";
import { Session } from "@nook/common/types";
import { useState } from "react";

export default function LoginScreen() {
  const { session, setSession } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const { mutateAsync, data, isPending, error } = useMutation<Session>({
    mutationFn: () =>
      makeRequest("/v1/user/login/dev", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      }),
  });

  const handleLogin = async () => {
    const session = await mutateAsync();
    setSession(session);
  };

  if (session) {
    return <Redirect href="/" />;
  }

  return (
    <View flex={1} backgroundColor="$background" padding="$4">
      <YStack gap="$2">
        <YStack theme="surface2">
          <Label>Username</Label>
          <Input value={username} onChangeText={setUsername} />
        </YStack>
        <YStack theme="surface2">
          <Label>Password</Label>
          <Input value={password} onChangeText={setPassword} />
        </YStack>
        <Button
          height="$5"
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
          disabled={isPending || !username || !password}
          onPress={handleLogin}
          marginTop="$4"
        >
          {isPending && <Spinner />}
          {!isPending && "Sign in"}
        </Button>
        {error && (
          <Text color="$red9" textAlign="center">
            {error.message}
          </Text>
        )}
      </YStack>
    </View>
  );
}
