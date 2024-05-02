import {
  AlertDialog,
  NookButton,
  NookText,
  Spinner,
  View,
  XStack,
  YStack,
} from "@nook/ui";
import QRCode from "qrcode.react";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../../context/auth";
import { X } from "@tamagui/lucide-icons";
import { Link } from "solito/link";
import {
  WagmiProvider,
  useAccount,
  useChainId,
  useReadContract,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { wagmiConfig } from "../../../utils/wagmi";
import { CONTRACTS } from "@nook/common/utils";
import { encodeAbiParameters, parseAbiItem } from "viem";
import { Loading } from "../../../components/loading";
import {
  getPendingSigner,
  validateSignerByPublicKey,
} from "../../../server/auth";

export const EnableSignerDialog = ({
  children,
}: {
  children?: React.ReactNode;
}) => {
  const { session, signer } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (signer?.state === "completed") {
      setIsOpen(false);
    }
  }, [signer]);

  if (!session || signer?.state === "completed") {
    return children;
  }

  return (
    <AlertDialog
      modal
      disableRemoveScroll
      open={isOpen}
      onOpenChange={setIsOpen}
    >
      <AlertDialog.Trigger asChild>{children}</AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Overlay
          key="overlay"
          animation="slow"
          opacity={0.75}
          enterStyle={{ opacity: 0 }}
          exitStyle={{ opacity: 0 }}
        />
        <AlertDialog.Content
          bordered
          elevate
          key="content"
          animateOnly={["transform", "opacity"]}
          animation={[
            "100ms",
            {
              opacity: {
                overshootClamping: true,
              },
            },
          ]}
          enterStyle={{ x: 0, y: -20, opacity: 0, scale: 0.9 }}
          exitStyle={{ x: 0, y: 10, opacity: 0, scale: 0.95 }}
          width={600}
          backgroundColor="$color2"
          $xs={{ width: "100%", height: "100%" }}
          padding="$2"
        >
          <XStack alignItems="center" justifyContent="space-between">
            <AlertDialog.Cancel asChild>
              <NookButton
                size="$3"
                scaleIcon={1.5}
                circular
                icon={X}
                backgroundColor="transparent"
                borderWidth="$0"
                hoverStyle={{
                  backgroundColor: "$color4",
                  // @ts-ignore
                  transition: "all 0.2s ease-in-out",
                }}
              />
            </AlertDialog.Cancel>
          </XStack>
          <WagmiProvider config={wagmiConfig}>
            <EnableSignerContent isOpen={isOpen} />
          </WagmiProvider>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog>
  );
};

const EnableSignerContent = ({ isOpen }: { isOpen: boolean }) => {
  const { session } = useAuth();
  const { address } = useAccount();
  const { data } = useReadContract({
    chainId: CONTRACTS.NETWORK as 10,
    address: CONTRACTS.ID_REGISTRY_ADDRESS,
    abi: [
      parseAbiItem(
        "function custodyOf(uint256) external view returns (address)",
      ),
    ],
    functionName: "custodyOf",
    args: session?.fid ? [BigInt(session.fid)] : undefined,
  });

  if (!data) {
    return <Loading />;
  }

  if (address && data === address) {
    return <EnableWithCustody address={address} />;
  }

  return <EnableWithWarpcast isOpen={isOpen} />;
};

const EnableWithCustody = ({ address }: { address: `0x${string}` }) => {
  const { signer, refreshSignerByPublicKey } = useAuth();
  const { data: hash, writeContractAsync } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });
  const chainId = useChainId();
  const { switchChainAsync } = useSwitchChain();

  const handleEnable = async () => {
    if (
      !signer?.requestFid ||
      !signer?.signature ||
      !signer?.deadline ||
      !signer?.requestAddress
    ) {
      return;
    }

    if (chainId !== 10) {
      await switchChainAsync({ chainId: 10 });
    }

    const metadata = encodeAbiParameters(
      [
        {
          components: [
            {
              type: "uint256",
              name: "requestFid",
            },
            {
              type: "address",
              name: "requestSigner",
            },
            {
              type: "bytes",
              name: "signature",
            },
            {
              type: "uint256",
              name: "deadline",
            },
          ],
          name: "signedKey",
          type: "tuple",
        },
      ],
      [
        {
          requestFid: BigInt(signer.requestFid),
          requestSigner: signer.requestAddress,
          signature: signer.signature,
          deadline: BigInt(signer.deadline),
        },
      ],
    );

    await writeContractAsync({
      address: CONTRACTS.KEY_GATEWAY_ADDRESS,
      abi: [
        parseAbiItem(
          "function add(uint32 keyType, bytes calldata key, uint8 metadataType, bytes calldata metadata) external",
        ),
      ],
      functionName: "add",
      args: [1, signer.publicKey, 1, metadata],
    });
  };

  useEffect(() => {
    if (isConfirmed) {
      refreshSignerByPublicKey();
    }
  }, [isConfirmed, refreshSignerByPublicKey]);

  return (
    <YStack padding="$3" alignItems="center" gap="$3">
      <YStack alignItems="center">
        <AlertDialog.Title>Enable Nook</AlertDialog.Title>
        <AlertDialog.Description textAlign="center">
          Nook needs permissions from you to be able to perform write actions on
          Farcaster. This will cost a small gas fee.
        </AlertDialog.Description>
      </YStack>
      <NookButton
        variant="action"
        onPress={handleEnable}
        width="100%"
        disabled={isConfirming}
        disabledStyle={{
          opacity: 0.5,
        }}
      >
        {isConfirming ? <Spinner color="$color11" /> : "Enable Nook"}
      </NookButton>
    </YStack>
  );
};

const EnableWithWarpcast = ({ isOpen }: { isOpen: boolean }) => {
  const { signer, refreshSigner } = useAuth();
  const pollingRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const pollRefresh = async () => {
      const state = await refreshSigner();
      if (state === "completed") {
        return;
      }
    };

    if (isOpen) {
      pollingRef.current = setInterval(pollRefresh, 2000);
    } else {
      clearInterval(pollingRef.current);
    }

    return () => clearInterval(pollingRef.current);
  }, [isOpen, refreshSigner]);

  return (
    <YStack padding="$3" alignItems="center" gap="$3">
      <YStack alignItems="center">
        <AlertDialog.Title>Enable Nook</AlertDialog.Title>
        <AlertDialog.Description textAlign="center">
          Nook needs permissions from you to be able to perform write actions on
          Farcaster. Scan the QR code with your mobile device to be taken to
          Warpcast.
        </AlertDialog.Description>
      </YStack>
      {!signer && <Spinner color="$color111" />}
      {signer && <QRCode value={signer.deeplinkUrl} size={256} />}
      {signer && (
        <Link href={signer.deeplinkUrl}>
          <NookText muted fontWeight="600" fontSize="$4">
            Open Link
          </NookText>
        </Link>
      )}
    </YStack>
  );
};
