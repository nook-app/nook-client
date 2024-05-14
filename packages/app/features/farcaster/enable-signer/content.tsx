import {
  AlertDialog,
  NookButton,
  NookText,
  Spinner,
  YStack,
} from "@nook/app-ui";
import QRCode from "qrcode.react";
import { useEffect, useRef } from "react";
import { useAuth } from "../../../context/auth";
import {
  WagmiProvider,
  useAccount,
  useChainId,
  useReadContract,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { CONTRACTS } from "@nook/common/utils";
import { encodeAbiParameters, parseAbiItem } from "viem";
import { Loading } from "../../../components/loading";
import { wagmiConfig } from "../../../utils/wagmi";
import { Link } from "../../../components/link";

export const EnableSignerContent = ({ isOpen }: { isOpen?: boolean }) => {
  return (
    <WagmiProvider config={wagmiConfig}>
      <EnableSignerContentInner isOpen={isOpen} />
    </WagmiProvider>
  );
};

const EnableSignerContentInner = ({ isOpen }: { isOpen?: boolean }) => {
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
        {isConfirming ? <Spinner /> : "Enable Nook"}
      </NookButton>
    </YStack>
  );
};

const EnableWithWarpcast = ({ isOpen }: { isOpen?: boolean }) => {
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
      {signer?.deeplinkUrl && <QRCode value={signer.deeplinkUrl} size={256} />}
      {signer?.deeplinkUrl && (
        <Link href={signer.deeplinkUrl}>
          <NookText muted fontWeight="600" fontSize="$4">
            Open Link
          </NookText>
        </Link>
      )}
    </YStack>
  );
};
