import {
  Input,
  NookButton,
  NookText,
  Spinner,
  XStack,
  YStack,
  useDebounceValue,
  useToastController,
} from "@nook/ui";
import { useEffect, useState } from "react";
import { useAuth } from "../../context/auth";
import {
  fetchCurrentFnameTransfer,
  fetchCurrentFnameTransferByFid,
  submitFnameTransfer,
} from "../../api/warpcast";
import {
  useSwitchChain,
  useSignTypedData,
  useAccount,
  useChainId,
  useReadContract,
} from "wagmi";
import { FnameTransfer } from "../../types";
import { CONTRACTS } from "@nook/common/utils";
import { submitUserDataAdd } from "../../server/farcaster";
import { parseAbiItem } from "viem";

export const UsernameSettings = () => {
  const { user, setUser, session } = useAuth();
  const [username, setUsername] = useState(user?.username || "");
  const [error, setError] = useState<string>();
  const { switchChainAsync } = useSwitchChain();
  const [currentTransfer, setCurrentTransfer] = useState<
    FnameTransfer | undefined
  >();
  const [nextTransfer, setNextTransfer] = useState<FnameTransfer | undefined>();
  const { signTypedDataAsync } = useSignTypedData();
  const { address } = useAccount();
  const chainId = useChainId();
  const [isLoading, setIsLoading] = useState(false);

  const { data: custodyFid } = useReadContract({
    chainId: CONTRACTS.NETWORK as 10,
    address: CONTRACTS.ID_REGISTRY_ADDRESS,
    abi: [
      parseAbiItem("function idOf(address) external view returns (uint256)"),
    ],
    functionName: "idOf",
    args: address ? [address] : undefined,
  });

  const debouncedUsername = useDebounceValue(username, 500);
  const toast = useToastController();

  useEffect(() => {
    if (!debouncedUsername) return;

    if (!/^[a-z0-9_]+$/.test(debouncedUsername)) {
      setError(
        "Invalid username. Can only contain lowercase letters, numbers, and underscores.",
      );

      return;
    }

    if (debouncedUsername.length > 16) {
      setError("Username must be 16 characters or less.");
      return;
    }

    fetchCurrentFnameTransfer(debouncedUsername).then((next) => {
      setError(undefined);
      setNextTransfer(next);
    });
  }, [debouncedUsername]);

  useEffect(() => {
    if (user) {
      if (user.username) {
        fetchCurrentFnameTransfer(user.username).then(setCurrentTransfer);
      } else {
        fetchCurrentFnameTransferByFid(user.fid).then(setCurrentTransfer);
      }
    }
  }, [user]);

  useEffect(() => {
    let error: string | undefined;
    if (currentTransfer) {
      if (!username) {
        setUsername(currentTransfer.username);
      }
      const timestamp = Date.now() - currentTransfer.timestamp * 1000;
      const twentyEightDays = 28 * 24 * 60 * 60 * 1000;
      if (timestamp < twentyEightDays) {
        error = "You can only change your username once every 28 days.";
      }
    }

    if (nextTransfer && nextTransfer?.to.toString() !== user?.fid.toString()) {
      error = "Username already taken.";
    }

    setError(error);
  }, [currentTransfer, nextTransfer, user]);

  const isDisabled = !username || !!error;

  const handleExistingUsernameChange = async () => {
    if (!currentTransfer || !address || !user) return;

    const message = {
      name: currentTransfer.username,
      owner: address,
      timestamp: BigInt(Math.floor(Date.now() / 1000)),
    };

    const signature = await signTypedDataAsync({
      primaryType: "UserNameProof",
      domain: {
        name: "Farcaster name verification",
        version: "1",
        chainId: 1,
        verifyingContract: CONTRACTS.FNAME_REGISTRY_ADDRESS,
      } as const,
      types: {
        UserNameProof: [
          { name: "name", type: "string" },
          { name: "timestamp", type: "uint256" },
          { name: "owner", type: "address" },
        ],
      } as const,
      message,
    });

    await submitFnameTransfer({
      name: message.name,
      owner: message.owner,
      timestamp: Number(message.timestamp),
      signature,
      from: Number(user.fid),
      to: 0,
      fid: Number(user.fid),
    });
  };

  const handleNewUsernameChange = async () => {
    if (!address || !user) return;

    const message = {
      name: username,
      owner: address,
      timestamp: BigInt(Math.floor(Date.now() / 1000)),
    };

    const signature = await signTypedDataAsync({
      primaryType: "UserNameProof",
      domain: {
        name: "Farcaster name verification",
        version: "1",
        chainId: 1,
        verifyingContract: CONTRACTS.FNAME_REGISTRY_ADDRESS,
      } as const,
      types: {
        UserNameProof: [
          { name: "name", type: "string" },
          { name: "timestamp", type: "uint256" },
          { name: "owner", type: "address" },
        ],
      } as const,
      message,
    });

    await submitFnameTransfer({
      name: message.name,
      owner: message.owner,
      timestamp: Number(message.timestamp),
      signature,
      from: 0,
      to: Number(user.fid),
      fid: Number(user.fid),
    });
  };

  const handleSave = async () => {
    if (isDisabled || !user || !session) return;

    if (nextTransfer && nextTransfer.to.toString() !== user.fid) {
      return;
    }

    if (chainId !== 1) {
      await switchChainAsync({
        chainId: 1,
      });
    }

    if (currentTransfer && currentTransfer.username !== username) {
      await handleExistingUsernameChange();
    }

    if (!nextTransfer || (nextTransfer && nextTransfer.username !== username)) {
      await handleNewUsernameChange();
    }

    setIsLoading(true);
    setTimeout(() => {
      updateUsername(username);
    }, 5000);
  };

  const updateUsername = async (username?: string) => {
    if (!user || !username) return;
    setIsLoading(true);
    await submitUserDataAdd({
      type: 6,
      value: username,
    });

    toast.show("Username updated");
    setUser({ ...user, username });
    setIsLoading(false);
  };

  if (!address || !custodyFid || custodyFid.toString() !== user?.fid)
    return null;

  return (
    <YStack gap="$4" padding="$4">
      <YStack gap="$2">
        <NookText variant="label">Username</NookText>
        <NookText muted>
          Select your username. Usernames are issued by the Farcaster Name
          Registry and subject to usage policies.
        </NookText>
      </YStack>
      {user.username === currentTransfer?.username && (
        <>
          <XStack gap="$4" alignItems="center">
            <Input flexGrow={1} value={username} onChangeText={setUsername} />
            <NookButton
              variant="action"
              disabled={isLoading || isDisabled}
              disabledStyle={{ opacity: 0.5 }}
              onPress={handleSave}
            >
              {isLoading ? <Spinner color="$color11" /> : "Save"}
            </NookButton>
          </XStack>
          <NookText color="$red9">{error}</NookText>
        </>
      )}
      {user.username !== currentTransfer?.username && (
        <>
          <XStack gap="$4" alignItems="center">
            <Input flexGrow={1} value={username} onChangeText={setUsername} />
            <NookButton
              variant="action"
              disabledStyle={{ opacity: 0.5 }}
              disabled={isLoading}
              onPress={() => updateUsername(currentTransfer?.username)}
            >
              {isLoading ? <Spinner color="$color11" /> : "Save"}
            </NookButton>
          </XStack>
          <NookText color="$red9">Press save to sync your username</NookText>
        </>
      )}
    </YStack>
  );
};
