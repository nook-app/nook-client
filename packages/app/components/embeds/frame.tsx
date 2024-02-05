import { FrameButton, PostData, UrlMetadata } from "@flink/common/types";
import { ExternalLink } from "@tamagui/lucide-icons";
import { Linking } from "react-native";
import { Button, Image, View, XStack, YStack } from "tamagui";

const EmbedFrameButton = ({
  url,
  button,
  payload,
}: { url: string; button: FrameButton; payload: FrameButtonPayload }) => {
  const handlePress = async () => {
    // TODO: Once we have login working
    // const response = await fetch(url, {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify(payload),
    // });
    // if (button.action === "post_redirect") {
    //   const responseUrl = response.headers.get("location");
    //   console.log(response.status, url);
    //   if (responseUrl) {
    //     Linking.openURL(url).catch((err) =>
    //       console.error("An error occurred", err),
    //     );
    //   }
    // } else if (response.status === 200) {
    //   console.log(await response.json());
    // }
  };

  return (
    <View padding="$1" flexGrow={1} flexBasis="0%" minWidth="50%">
      <Button
        onPress={handlePress}
        iconAfter={
          button.action === "post_redirect" ? (
            <ExternalLink size={16} />
          ) : undefined
        }
      >
        {button.label}
      </Button>
    </View>
  );
};

export const EmbedFrame = ({
  data,
  metadata: { metadata },
}: {
  data: PostData;
  metadata: UrlMetadata;
}) => {
  const frame = metadata?.frame;
  if (!frame) {
    return null;
  }

  const { buttons, postUrl } = frame;
  if (!postUrl) {
    return null;
  }

  return (
    <View borderRadius="$2">
      {metadata.image && (
        <View flex={1} height="$14" borderRadius="$2" overflow="hidden">
          <Image source={{ uri: metadata.image }} width="100%" height="100%" />
        </View>
      )}
      {buttons && (
        <XStack paddingVertical="$1" flexWrap="wrap">
          {buttons.map((button) => (
            <EmbedFrameButton
              key={`${postUrl}-${button.index}`}
              url={postUrl}
              button={button}
              payload={generatePayload(postUrl, data, button)}
            />
          ))}
        </XStack>
      )}
    </View>
  );
};

const generatePayload = (url: string, data: PostData, button: FrameButton) => {
  const castId = data.contentId.replace("farcaster://cast/", "");
  const [fid, hash] = castId.split("/");

  return {
    untrustedData: {
      fid: 2,
      url,
      messageHash: "0xd2b1ddc6c88e865a33cb1a565e0058d757042974",
      timestamp: new Date().getTime(),
      network: 1,
      buttonIndex: button.index,
      castId: {
        fid: Number(fid),
        hash,
      },
    },
    trustedData: {
      messageBytes: "d2b1ddc6c88e865a33cb1a565e0058d757042974...",
    },
  };
};

type FrameButtonPayload = ReturnType<typeof generatePayload>;
