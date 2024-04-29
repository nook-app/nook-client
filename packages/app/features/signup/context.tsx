import { useWallets } from "@privy-io/react-auth";
import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
  useCallback,
} from "react";
import { wagmiConfig } from "../../utils/wagmi";
import { CONTRACTS } from "@nook/common/utils";
import { readContract, reconnect } from "@wagmi/core";
import {
  useAccount,
  useChainId,
  useSignTypedData,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { encodeAbiParameters, hexToBigInt, parseAbiItem } from "viem";
import { getPendingSigner } from "../../server/auth";
import { PendingSignerResponse } from "../../types";

export enum CreateAccountStep {
  ConnectWallet = 0,
  RecoveryAddress = 1,
  EnableNook = 2,
  SubmitTransaction = 3,
  Done = 4,
}

type CreateAccounttContextType = {
  custodyFid?: bigint;
  address?: `0x${string}`;
  wallet?: ReturnType<typeof useWallets>["wallets"][number];
  step: CreateAccountStep;
  setStep: (step: CreateAccountStep) => void;
  activeStep: CreateAccountStep;
  setActiveStep: (step: CreateAccountStep) => void;
  recoveryAddress: string;
  setRecoveryAddress: (address: `0x${string}`) => void;
  saveRecoveryAddress: () => void;
  recoverySignature?: `0x${string}`;
  signerSignature?: `0x${string}`;
  enableNook: () => void;
  submitTransaction: () => void;
  isConfirming: boolean;
};

const CreateAccountContext = createContext<
  CreateAccounttContextType | undefined
>(undefined);

type SheetProviderProps = {
  children: ReactNode;
};

export const CreateAccountProvider = ({ children }: SheetProviderProps) => {
  const [step, setStep] = useState<CreateAccountStep>(
    CreateAccountStep.ConnectWallet,
  );
  const [activeStep, setActiveStep] = useState<CreateAccountStep>(
    CreateAccountStep.ConnectWallet,
  );
  const [custodyFid, setCustodyFid] = useState<bigint>();
  const [recoveryAddress, setRecoveryAddress] = useState<`0x${string}`>("0x");
  const [recoveryDeadline, setRecoveryDeadline] = useState<number>();
  const [recoverySignature, setRecoverySignature] = useState<`0x${string}`>();
  const [signerSignature, setSignerSignature] = useState<`0x${string}`>();
  const [signerMetadata, setSignerMetadata] = useState<`0x${string}`>();
  const [pendingSigner, setPendingSigner] = useState<PendingSignerResponse>();
  const { switchChainAsync } = useSwitchChain();
  const { signTypedDataAsync } = useSignTypedData();
  const { address } = useAccount();
  const { data: hash, writeContractAsync } = useWriteContract();
  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    data,
  } = useWaitForTransactionReceipt({
    hash,
  });
  const chainId = useChainId();
  const { wallets } = useWallets();
  const [wallet, setWallet] =
    useState<ReturnType<typeof useWallets>["wallets"][number]>();

  useEffect(() => {
    let addy: `0x${string}` | undefined = address;
    if (wallets.length > 0) {
      const wallet = wallets.find((wallet) => wallet.address === address);
      if (wallet) {
        addy = wallet.address as `0x${string}`;
        setWallet(wallet);
      } else if (wallets.length === 1) {
        addy = wallets[0].address as `0x${string}`;
        setWallet(wallets[0]);
      }
    }

    if (addy) {
      handleAddressChange(addy);
    }
  }, [wallets, address]);

  const handleAddressChange = useCallback(
    async (address: `0x${string}`) => {
      if (step === CreateAccountStep.Done) return;

      await reconnect(wagmiConfig);
      setRecoveryAddress(address);
      const result = await readContract(wagmiConfig, {
        chainId: CONTRACTS.NETWORK as 10,
        address: CONTRACTS.ID_REGISTRY_ADDRESS,
        abi: [
          parseAbiItem(
            "function idOf(address) external view returns (uint256)",
          ),
        ],
        functionName: "idOf",
        args: [address],
      });
      setCustodyFid(result > 0 ? result : undefined);

      if (result > 0) {
        setStep(CreateAccountStep.ConnectWallet);
      } else {
        setStep(CreateAccountStep.RecoveryAddress);
      }
    },
    [step],
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (address) {
      handleAddressChange(address);
    }
  }, [address]);

  useEffect(() => {
    setActiveStep(step);
  }, [step]);

  useEffect(() => {
    if (hash && custodyFid && custodyFid > 0) {
      setStep(CreateAccountStep.Done);
    }
  }, [custodyFid, hash]);

  useEffect(() => {
    if (isConfirmed && data) {
      const log = data.logs.find(
        (log) => log.address === CONTRACTS.ID_REGISTRY_ADDRESS,
      );
      if (log?.topics[2]) {
        const fid = hexToBigInt(log.topics[2]);
        setCustodyFid(fid);
      }
    }
  }, [data, isConfirmed]);

  const saveRecoveryAddress = useCallback(async () => {
    if (!address || !recoveryAddress) return;

    if (chainId !== CONTRACTS.NETWORK) {
      await switchChainAsync({
        chainId: CONTRACTS.NETWORK as 10,
      });
    }

    const nonce = await readContract(wagmiConfig, {
      chainId: CONTRACTS.NETWORK as 10,
      address: CONTRACTS.ID_REGISTRY_ADDRESS,
      abi: [parseAbiItem("function nonces(address) view returns (uint256)")],
      functionName: "nonces",
      args: [address],
    });

    const deadline = BigInt(Math.floor(Date.now() / 1000) + 86400);
    const signature = await signTypedDataAsync({
      primaryType: "Register",
      domain: {
        name: "Farcaster IdGateway",
        version: "1",
        chainId: CONTRACTS.NETWORK,
        verifyingContract: CONTRACTS.ID_GATEWAY_ADDRESS,
      },
      types: {
        Register: [
          { name: "to", type: "address" },
          { name: "recovery", type: "address" },
          { name: "nonce", type: "uint256" },
          { name: "deadline", type: "uint256" },
        ],
      },
      message: {
        to: address,
        recovery: recoveryAddress,
        nonce,
        deadline,
      },
    });

    setRecoveryDeadline(Number(deadline));
    setRecoverySignature(signature);
    setStep(CreateAccountStep.EnableNook);
    setActiveStep(CreateAccountStep.EnableNook);
  }, [switchChainAsync, signTypedDataAsync, address, recoveryAddress, chainId]);

  const enableNook = useCallback(async () => {
    if (!address) return;

    if (chainId !== CONTRACTS.NETWORK) {
      await switchChainAsync({
        chainId: CONTRACTS.NETWORK as 10,
      });
    }

    const nonce = await readContract(wagmiConfig, {
      chainId: CONTRACTS.NETWORK as 10,
      address: CONTRACTS.KEY_REGISTRY_ADDRESS,
      abi: [parseAbiItem("function nonces(address) view returns (uint256)")],
      functionName: "nonces",
      args: [address],
    });

    const pendingSigner = await getPendingSigner(address);
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
          requestFid: BigInt(pendingSigner.requestFid),
          requestSigner: pendingSigner.requestAddress,
          signature: pendingSigner.signature,
          deadline: BigInt(pendingSigner.deadline),
        },
      ],
    );

    const signature = await signTypedDataAsync({
      primaryType: "Add",
      domain: {
        name: "Farcaster KeyGateway",
        version: "1",
        chainId: CONTRACTS.NETWORK,
        verifyingContract: CONTRACTS.KEY_GATEWAY_ADDRESS,
      },
      types: {
        Add: [
          { name: "owner", type: "address" },
          { name: "keyType", type: "uint32" },
          { name: "key", type: "bytes" },
          { name: "metadataType", type: "uint8" },
          { name: "metadata", type: "bytes" },
          { name: "nonce", type: "uint256" },
          { name: "deadline", type: "uint256" },
        ],
      },
      message: {
        owner: address,
        keyType: 1,
        key: pendingSigner.publicKey,
        metadataType: 1,
        metadata,
        nonce,
        deadline: BigInt(pendingSigner.deadline),
      },
    });

    setSignerMetadata(metadata);
    setPendingSigner(pendingSigner);
    setSignerSignature(signature);
    setStep(CreateAccountStep.SubmitTransaction);
    setActiveStep(CreateAccountStep.SubmitTransaction);
  }, [switchChainAsync, signTypedDataAsync, address, chainId]);

  const submitTransaction = useCallback(async () => {
    if (!address || !pendingSigner) return;

    if (chainId !== CONTRACTS.NETWORK) {
      await switchChainAsync({
        chainId: CONTRACTS.NETWORK as 10,
      });
    }

    const value = await readContract(wagmiConfig, {
      chainId: CONTRACTS.NETWORK as 10,
      address: CONTRACTS.STORAGE_REGISTRY_ADDRESS,
      abi: [
        parseAbiItem("function price(uint256) external view returns (uint256)"),
      ],
      functionName: "price",
      args: [BigInt(1)],
    });

    writeContractAsync({
      address: CONTRACTS.BUNDLER_ADDRESS,
      abi: [
        {
          inputs: [
            {
              components: [
                {
                  internalType: "address",
                  name: "to",
                  type: "address",
                },
                {
                  internalType: "address",
                  name: "recovery",
                  type: "address",
                },
                {
                  internalType: "uint256",
                  name: "deadline",
                  type: "uint256",
                },
                {
                  internalType: "bytes",
                  name: "sig",
                  type: "bytes",
                },
              ],
              internalType: "struct IBundler.RegistrationParams",
              name: "registerParams",
              type: "tuple",
            },
            {
              components: [
                {
                  internalType: "uint32",
                  name: "keyType",
                  type: "uint32",
                },
                {
                  internalType: "bytes",
                  name: "key",
                  type: "bytes",
                },
                {
                  internalType: "uint8",
                  name: "metadataType",
                  type: "uint8",
                },
                {
                  internalType: "bytes",
                  name: "metadata",
                  type: "bytes",
                },
                {
                  internalType: "uint256",
                  name: "deadline",
                  type: "uint256",
                },
                {
                  internalType: "bytes",
                  name: "sig",
                  type: "bytes",
                },
              ],
              internalType: "struct IBundler.SignerParams[]",
              name: "signerParams",
              type: "tuple[]",
            },
            {
              internalType: "uint256",
              name: "extraStorage",
              type: "uint256",
            },
          ],
          name: "register",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "payable",
          type: "function",
        },
      ],
      functionName: "register",
      args: [
        [address, recoveryAddress, recoveryDeadline, recoverySignature],
        [
          [
            1,
            pendingSigner.publicKey,
            1,
            signerMetadata,
            pendingSigner.deadline,
            signerSignature,
          ],
        ],
        0,
      ],
      value,
    });
  }, [
    writeContractAsync,
    switchChainAsync,
    address,
    recoveryAddress,
    recoveryDeadline,
    recoverySignature,
    pendingSigner,
    signerMetadata,
    signerSignature,
    chainId,
  ]);

  return (
    <CreateAccountContext.Provider
      value={{
        custodyFid,
        address,
        wallet,
        step,
        setStep,
        activeStep,
        setActiveStep,
        recoveryAddress,
        setRecoveryAddress,
        saveRecoveryAddress,
        enableNook,
        submitTransaction,
        isConfirming,
      }}
    >
      {children}
    </CreateAccountContext.Provider>
  );
};

export const useCreateAccount = () => {
  const context = useContext(CreateAccountContext);
  if (context === undefined) {
    throw new Error(
      "useCreateAccount must be used within a CreateAccountProvider",
    );
  }
  return context;
};
