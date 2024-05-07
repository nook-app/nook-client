"use client";

import {
  Input,
  NookButton,
  NookText,
  Spinner,
  View,
  XStack,
  YStack,
} from "@nook/app-ui";
import {
  CreateAccountProvider,
  CreateAccountStep,
  useCreateAccount,
} from "./context";
import { usePrivy } from "@privy-io/react-auth";
import { useUser } from "../../api/farcaster";
import { Link, TextLink } from "solito/link";
import { useTheme } from "../../context/theme";
import { isAddress } from "viem";
import { WagmiProvider } from "wagmi";
import { wagmiConfig } from "../../utils/wagmi";
import { formatAddress } from "../../utils";
import { useAuth } from "../../context/auth";
import { useEffect } from "react";

export const SignupScreen = () => {
  return (
    <WagmiProvider config={wagmiConfig}>
      <CreateAccountProvider>
        <YStack padding="$4" gap="$4">
          <SignupProgress />
          <SignupStep />
        </YStack>
      </CreateAccountProvider>
    </WagmiProvider>
  );
};

const SignupProgress = () => {
  const { step, setActiveStep } = useCreateAccount();
  const { theme } = useTheme();
  return (
    <XStack justifyContent="space-around">
      {[0, 1, 2, 3].map((i) => {
        const isActive = step === i;
        const isComplete = step > i;

        const activeColor = ["light", "dark"].includes(theme)
          ? "$color12"
          : "$color9";
        const activeTextColor = ["light", "dark"].includes(theme)
          ? !isComplete
            ? "$color12"
            : "$color1"
          : "white";
        return (
          <View
            key={i}
            width="$4"
            height="$4"
            borderRadius="$10"
            backgroundColor={isComplete ? activeColor : "$color3"}
            borderColor={isComplete || isActive ? activeColor : "$color3"}
            borderWidth="$1"
            justifyContent="center"
            alignItems="center"
            cursor="pointer"
            onPress={() => {
              if (i <= step) {
                setActiveStep(i);
              }
            }}
          >
            <NookText variant="label" color={activeTextColor}>
              {i + 1}
            </NookText>
          </View>
        );
      })}
    </XStack>
  );
};

const SignupStep = () => {
  const { activeStep } = useCreateAccount();

  switch (activeStep) {
    case CreateAccountStep.ConnectWallet:
      return <ConnectWalletStep />;
    case CreateAccountStep.RecoveryAddress:
      return <RecoveryAddressStep />;
    case CreateAccountStep.EnableNook:
      return <EnableNookStep />;
    case CreateAccountStep.SubmitTransaction:
      return <SubmitTransactionStep />;
    case CreateAccountStep.Done:
      return <DoneStep />;
    default:
      return null;
  }
};

const ConnectWalletStep = () => {
  const { login } = usePrivy();
  const { custodyFid, wallet } = useCreateAccount();
  const { data } = useUser(custodyFid?.toString() || "");

  return (
    <YStack gap="$4" padding="$4">
      <YStack gap="$2">
        <NookText variant="label">Connect Wallet</NookText>
        <NookText muted>
          Nook currently only supports creating accounts with crypto.
          Wallet-less login will be coming in the near future.
        </NookText>
        <NookText fontWeight="700">
          We suggest creating a brand new hot wallet for your account. You will
          not be able to use Warpcast if you use a hardware wallet.
        </NookText>
      </YStack>
      <YStack gap="$4" alignItems="center">
        <NookButton variant="action" onPress={login} width="100%">
          {custodyFid ? "Switch" : "Connect"}
        </NookButton>
        {custodyFid && data && (
          <YStack gap="$2" width="100%">
            <XStack
              gap="$2"
              alignItems="center"
              borderRadius="$10"
              alignSelf="center"
            >
              <View
                width="$0.75"
                height="$0.75"
                borderRadius="$10"
                backgroundColor="$red10"
              />
              <NookText>
                <NookText>This wallet already custodies </NookText>
                <TextLink href={`/users/${data?.username || data.fid}`}>
                  <NookText fontWeight="700">
                    {data?.username ? `@${data.username}` : `!${data.fid}`}
                  </NookText>
                </TextLink>
              </NookText>
            </XStack>
            <Link href="/settings">
              <NookButton variant="action" width="100%">
                Go to settings
              </NookButton>
            </Link>
          </YStack>
        )}
        {(!custodyFid || !data) && wallet && (
          <XStack gap="$2" alignItems="center" borderRadius="$10">
            <View
              width="$0.75"
              height="$0.75"
              borderRadius="$10"
              backgroundColor="$green10"
            />
            <NookText>
              <NookText>Connected to </NookText>
              <NookText fontWeight="700">
                {formatAddress(wallet.address)}
              </NookText>
            </NookText>
          </XStack>
        )}
      </YStack>
    </YStack>
  );
};

const RecoveryAddressStep = () => {
  const { recoveryAddress, setRecoveryAddress, saveRecoveryAddress } =
    useCreateAccount();

  const isError = !!recoveryAddress && !isAddress(recoveryAddress);
  const isDisabled = !recoveryAddress || isError;

  return (
    <YStack gap="$4" padding="$4">
      <YStack gap="$2">
        <NookText variant="label">Set Recovery Address</NookText>
        <NookText muted>
          Set a recovery address in case you lose access to your account with
          this wallet. This will require a signature from your wallet.
        </NookText>
      </YStack>
      <YStack gap="$2">
        <XStack gap="$4" alignItems="center">
          <Input
            flexGrow={1}
            value={recoveryAddress}
            onChangeText={(text) => setRecoveryAddress(text as `0x${string}`)}
            placeholder="0x..."
          />
          <NookButton
            variant="action"
            onPress={saveRecoveryAddress}
            disabled={isDisabled}
            disabledStyle={{
              opacity: 0.5,
            }}
          >
            Save
          </NookButton>
        </XStack>
        {isError && <NookText color="$red9">Invalid recovery address</NookText>}
      </YStack>
    </YStack>
  );
};

const EnableNookStep = () => {
  const { enableNook } = useCreateAccount();

  return (
    <YStack gap="$4" padding="$4">
      <YStack gap="$2">
        <NookText variant="label">Enable Nook</NookText>
        <NookText muted>
          Enable nook to be able to perform write actions. This will require a
          signature from your wallet.
        </NookText>
      </YStack>
      <YStack gap="$2" alignItems="center">
        <NookButton variant="action" onPress={enableNook} width="100%">
          Enable
        </NookButton>
      </YStack>
    </YStack>
  );
};

const SubmitTransactionStep = () => {
  const { submitTransaction, isConfirming } = useCreateAccount();
  return (
    <YStack gap="$4" padding="$4">
      <YStack gap="$2">
        <NookText variant="label">Create Account</NookText>
        <NookText muted>
          Create your account on Optimism. This will require a transaction to be
          sent from your wallet.
        </NookText>
      </YStack>
      <YStack gap="$2" alignItems="center">
        <NookButton
          variant="action"
          onPress={submitTransaction}
          width="100%"
          disabled={isConfirming}
          disabledStyle={{
            opacity: 0.5,
          }}
        >
          {isConfirming ? <Spinner color="$color11" /> : "Create"}
        </NookButton>
      </YStack>
    </YStack>
  );
};

const DoneStep = () => {
  const { user, loginViaPrivyToken, privyUser } = useAuth();
  const { custodyFid, wallet } = useCreateAccount();

  const handleReauth = async () => {
    await wallet?.loginOrLink();
  };

  useEffect(() => {
    const handleAuth = async () => {
      if (!privyUser) {
        return;
      }

      await loginViaPrivyToken();
    };
    handleAuth();
  }, [privyUser, loginViaPrivyToken]);

  return (
    <YStack gap="$4" padding="$4">
      <YStack gap="$2">
        <NookText variant="label">Account Created</NookText>
        <NookText muted>
          Your account has been created. You can now start using nook. Edit your
          profile from your settings.
        </NookText>
      </YStack>
      {user?.fid !== custodyFid?.toString() && (
        <NookButton variant="action" width="100%" onPress={handleReauth}>
          Re-authenticate
        </NookButton>
      )}
      {user?.fid === custodyFid?.toString() && (
        <Link href="/settings">
          <NookButton variant="action" width="100%">
            Go to settings
          </NookButton>
        </Link>
      )}
    </YStack>
  );
};
