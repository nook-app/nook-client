import { NftMintStage, SimpleHashNFT } from "@nook/common/types";
import {
  Adapt,
  Button,
  Dialog,
  Text,
  View,
  XStack,
  YStack,
} from "@nook/app-ui";
import { useEffect, useState } from "react";
import { formatUnits } from "viem";

export const NftMintAction = ({
  nft,
  mint,
}: { nft: SimpleHashNFT; mint: NftMintStage }) => {
  const [endTimeDisplay, setEndTimeDisplay] = useState<string | undefined>();

  useEffect(() => {
    if (mint.endTime) {
      const timer = setInterval(() => {
        const currentTime = new Date().getTime();
        const endTimeDate = new Date(mint.endTime * 1000).getTime();
        const timeLeft = endTimeDate - currentTime;

        if (timeLeft <= 0) {
          clearInterval(timer);
          setEndTimeDisplay("Mint ended");
        } else {
          const hours = Math.floor((timeLeft / (1000 * 60 * 60)) % 24);
          const minutes = Math.floor((timeLeft / (1000 * 60)) % 60);
          const seconds = Math.floor((timeLeft / 1000) % 60);
          setEndTimeDisplay(`${hours}h ${minutes}m ${seconds}s`);
        }
      }, 1000);

      return () => clearInterval(timer);
    }
    setEndTimeDisplay(undefined);
  }, [mint.endTime]);

  return (
    <Dialog modal disableRemoveScroll>
      <YStack gap="$2">
        <Dialog.Trigger asChild>
          <Button
            height="$5"
            width="100%"
            borderRadius="$4"
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
          >
            <Text fontWeight="600" fontSize="$5" color="$color1">
              Mint
            </Text>
          </Button>
        </Dialog.Trigger>
        <XStack justifyContent="center">
          <Text opacity={0.6} fontWeight="500">
            {`${formatUnits(
              BigInt(mint.price.amount.raw),
              mint.price.currency.decimals,
            )} ${mint.price.currency.symbol}`}
          </Text>
          {endTimeDisplay && (
            <Text opacity={0.6} fontWeight="500">
              {` · ${endTimeDisplay}`}
            </Text>
          )}
        </XStack>
      </YStack>

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
          <View>
            <Text>Mint</Text>
          </View>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
};
