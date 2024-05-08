import { useAuth } from "@nook/app/context/auth";
import { Button, Input, Label, Spinner, Text, YStack } from "@nook/app-ui";
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
    <YStack gap="$2" width="100%" padding="$4" flex={1}>
      <Text fontSize="$5">Enter your username and password to login.</Text>
      <YStack>
        <Label>Username</Label>
        <Input value={username} onChangeText={setUsername} />
      </YStack>
      <YStack>
        <Label>Password</Label>
        <Input value={password} onChangeText={setPassword} />
      </YStack>
      <Button
        height="$5"
        marginTop="$4"
        borderRadius="$10"
        fontWeight="500"
        fontSize="$5"
        disabled={isPending || !username || !password}
        onPress={handleLogin}
        color="$color12"
        disabledStyle={{
          backgroundColor: "$color1",
          // @ts-ignore
          color: "$mauve10",
        }}
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
  );
}
