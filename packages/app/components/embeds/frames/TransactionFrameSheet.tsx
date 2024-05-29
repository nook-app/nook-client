import {
  Dialog,
  View,
  Text,
  Adapt,
  Spinner,
  YStack,
  XStack,
  Button,
  useToastController,
  ScrollView,
} from "@nook/app-ui";
import { useEffect, useState } from "react";
import { useFrame } from "./context";
import { FrameButton, TransactionTargetResponse } from "@nook/common/types";
import { TouchableOpacity } from "react-native";
import { formatAddress } from "../../../utils";
import { useEns } from "../../../hooks/useAddress";
import { ChainBadge } from "../../blockchain/chain-badge";
import { useAccount, useSwitchChain, useSendTransaction } from "wagmi2";
import { usePrivy } from "@privy-io/react-auth";

export const TransactionFrameSheet = ({
  button,
  index,
  children,
}: {
  button: FrameButton;
  index: number;
  children?: React.ReactNode;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { fetchTransactionAction, handleTransactionAction, host } = useFrame();
  const [transaction, setTransaction] = useState<
    TransactionTargetResponse | undefined
  >(undefined);
  const { connectWallet } = usePrivy();
  const { address } = useAccount();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const { switchChainAsync } = useSwitchChain();
  const { sendTransactionAsync } = useSendTransaction();
  const toast = useToastController();

  const handleSubmitTransaction = async () => {
    if (!transaction) return;

    setIsLoading(true);
    try {
      const chainId = Number(transaction.chainId.replace("eip155:", ""));
      if (switchChainAsync) await switchChainAsync({ chainId });

      const hash = await sendTransactionAsync({
        chainId,
        to: transaction.params.to,
        data: transaction.params.data,
        value: BigInt(transaction.params.value || 0),
      });

      if (hash) {
        toast.show("Submitted transaction");
      } else {
        toast.show("Error submitting transaction");
      }

      handleTransactionAction(button, index, hash);
      setIsOpen(false);
    } catch (e) {
      setError((e as Error).message);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      fetchTransactionAction(button, index).then((tx) => {
        if (tx) {
          setTransaction(tx);
        } else {
          setIsOpen(false);
        }
      });
    }
  }, [isOpen, fetchTransactionAction, button, index]);

  return (
    <Dialog modal disableRemoveScroll open={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Trigger asChild>{children}</Dialog.Trigger>

      <Adapt when="sm" platform="touch">
        <Dialog.Sheet modal dismissOnSnapToBottom snapPointsMode="fit">
          <Dialog.Sheet.Overlay
            animation="100ms"
            enterStyle={{ opacity: 0 }}
            exitStyle={{ opacity: 0 }}
            backgroundColor="rgba(0,0,0,0.5)"
          />
          <Dialog.Sheet.Frame
            paddingBottom="$8"
            paddingTop="$2"
            backgroundColor="$color2"
          >
            <Adapt.Contents />
          </Dialog.Sheet.Frame>
        </Dialog.Sheet>
      </Adapt>

      <Dialog.Portal
        justifyContent="flex-start"
        paddingTop="$10"
        $xs={{ paddingTop: "$0" }}
      >
        <Dialog.Overlay
          key="overlay"
          animation="slow"
          opacity={0.75}
          enterStyle={{ opacity: 0 }}
          exitStyle={{ opacity: 0 }}
        />
        <Dialog.Content
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
          padding="$0"
          $xs={{ width: "100%", height: "100%" }}
          $platform-web={{
            maxHeight: "75vh",
          }}
        >
          <YStack padding="$3" gap="$3">
            <XStack alignItems="center" justifyContent="space-between">
              <Text fontWeight="700" fontSize="$8" color="$mauve12">
                Transaction
              </Text>
              <TouchableOpacity
                onPress={() => {
                  connectWallet();
                }}
              >
                <AddressDisplay address={address} />
              </TouchableOpacity>
            </XStack>
            {!transaction && <Spinner />}
            {transaction && (
              <>
                <XStack gap="$4">
                  <YStack gap="$1">
                    <Text>{host}</Text>
                    <Text
                      opacity={0.5}
                      fontWeight="600"
                      fontSize="$2"
                      textTransform="uppercase"
                    >
                      Domain
                    </Text>
                  </YStack>
                  <YStack gap="$1">
                    <ChainBadge chainId={transaction.chainId} />
                    <Text
                      opacity={0.5}
                      fontWeight="600"
                      fontSize="$2"
                      textTransform="uppercase"
                    >
                      Chain
                    </Text>
                  </YStack>
                </XStack>
                <Text opacity={0.5} fontWeight="600" fontSize="$3">
                  Please make sure you trust this transaction source before
                  proceeding. Nook is not responsible for any lost assets.
                </Text>
                {error && (
                  <YStack
                    backgroundColor="$red3"
                    borderRadius="$4"
                    padding="$2"
                    gap="$1"
                  >
                    <ScrollView maxHeight={300}>
                      <Text
                        textTransform="uppercase"
                        color="$red11"
                        fontSize="$1"
                        fontWeight="600"
                        letterSpacing={0.5}
                      >
                        Error
                      </Text>
                      <Text color="$red11">{error}</Text>
                    </ScrollView>
                  </YStack>
                )}
                <Button
                  height="$4"
                  width="100%"
                  borderRadius="$10"
                  backgroundColor="$mauve12"
                  borderWidth="$0"
                  hoverStyle={{
                    backgroundColor: "$mauve11",
                    // @ts-ignore
                    transition: "all 0.2s ease-in-out",
                  }}
                  pressStyle={{
                    backgroundColor: "$mauve11",
                  }}
                  disabledStyle={{
                    backgroundColor: "$mauve10",
                  }}
                  disabled={isLoading}
                  onPress={handleSubmitTransaction}
                >
                  {isLoading ? (
                    <Spinner />
                  ) : (
                    <Text color="$mauve1" fontWeight="600" fontSize="$4">
                      Continue in wallet
                    </Text>
                  )}
                </Button>
              </>
            )}
          </YStack>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
};

const AddressDisplay = ({ address }: { address?: string }) => {
  const { data } = useEns(address || "", !!address);

  return (
    <XStack
      gap="$2"
      alignItems="center"
      borderWidth="$0.5"
      borderColor="$color4"
      borderRadius="$10"
      padding="$2"
      paddingHorizontal="$3"
    >
      <View
        width="$0.75"
        height="$0.75"
        borderRadius="$10"
        backgroundColor={address ? "$green11" : "$red11"}
      />
      <Text color="$mauve11" fontWeight="600" fontSize="$3">
        {address ? data?.ens || formatAddress(address) : "No wallet connected"}
      </Text>
    </XStack>
  );
};
