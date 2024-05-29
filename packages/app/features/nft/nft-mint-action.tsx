import { SimpleHashNFT } from "@nook/common/types";
import { Adapt, Button, Dialog, Text, View } from "@nook/app-ui";

export const NftMintAction = ({ nft }: { nft: SimpleHashNFT }) => {
  const href =
    nft.contract.deployed_via_contract ===
    "0x777777C338d93e2C7adf08D102d45CA7CC4Ed021"
      ? `https://zora.co/collect/base:${nft.nft_id.split(".")[0]}/${
          nft.token_id
        }`
      : `https://mint.fun/${nft.nft_id.split(".")[0]}/${nft.contract_address}`;

  //   return (
  //     <LinkButton href={href}>
  //       <Text fontWeight="600" fontSize="$5" color="$color1">
  //         {"Mint "}
  //         <ExternalLink color="$color1" size={16} strokeWidth={2.5} />
  //       </Text>
  //     </LinkButton>
  //   );

  return (
    <Dialog modal disableRemoveScroll>
      <Dialog.Trigger asChild>
        <Button
          height="$5"
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
        >
          <Text fontWeight="600" fontSize="$5" color="$color1">
            Mint
          </Text>
        </Button>
      </Dialog.Trigger>

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
