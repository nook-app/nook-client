import { ImageResponse } from "next/og";
import * as colors from "@tamagui/colors";
import { FarcasterUserV1, SimpleHashNFT } from "@nook/common/types";
import { fetchNft } from "@nook/app/api/nft";
import { fetchUsersByAddress } from "@nook/app/api/farcaster";

export const runtime = "edge";

const fetchAsset = (url: URL) => fetch(url).then((res) => res.arrayBuffer());

const interRegularFontP = fetchAsset(
  new URL("../../../../../public/fonts/Inter-Regular.ttf", import.meta.url),
);
const interSemiBoldFontP = fetchAsset(
  new URL("../../../../../public/fonts/Inter-SemiBold.ttf", import.meta.url),
);
const interBoldFontP = fetchAsset(
  new URL("../../../../../public/fonts/Inter-Bold.ttf", import.meta.url),
);

async function fetchCreator(nft: SimpleHashNFT) {
  if (!nft.contract.deployed_by) return;
  const users = await fetchUsersByAddress([nft.contract.deployed_by]);
  return users.data[0];
}

export async function GET(
  request: Request,
  { params }: { params: { nftId: string } },
) {
  const nftId = params.nftId;
  const nft = await fetchNft(nftId);
  const creator = await fetchCreator(nft);

  const [interRegularFont, interSemiBoldFont, interBoldFont] =
    await Promise.all([interRegularFontP, interSemiBoldFontP, interBoldFontP]);

  return new ImageResponse(<NftPreview nft={nft} creator={creator} />, {
    width: 1200,
    height: 630,
    fonts: [
      {
        name: "Inter",
        data: interRegularFont,
        style: "normal",
        weight: 400,
      },
      {
        name: "Inter",
        data: interSemiBoldFont,
        style: "normal",
        weight: 600,
      },
      {
        name: "Inter",
        data: interBoldFont,
        style: "normal",
        weight: 700,
      },
    ],
  });
}

const NftPreview = ({
  nft,
  creator,
}: { nft: SimpleHashNFT; creator?: FarcasterUserV1 }) => {
  return (
    <div
      tw="flex flex-row w-full h-full items-center p-8"
      style={{
        background:
          "linear-gradient(to right top, rgb(17, 24, 39), rgb(75, 85, 99))",
      }}
    >
      <div tw="flex w-1/2 h-full p-4 pr-8 flex-col">
        <div tw="flex">
          <span tw="text-5xl font-bold text-white">{nft.name}</span>
        </div>
        {creator && (
          <div tw="flex mt-2 items-center">
            <span tw="font-semibold text-xl text-white mr-1">
              {"Created by"}
            </span>
            {creator.pfp && (
              <img
                src={creator.pfp}
                alt={creator.username}
                tw="w-6 h-6 rounded-full mr-1"
              />
            )}
            <span tw="font-semibold text-xl text-white">
              {creator.displayName || creator.username}
            </span>
          </div>
        )}
      </div>
      <div tw="flex flex-col w-1/2 p-4 h-full justify-between items-end">
        <div tw="flex">
          <NftImage nft={nft} />
        </div>
        <div tw="flex justify-end">
          <NookLogo />
        </div>
      </div>
    </div>
  );
};

const NftImage = ({ nft }: { nft: SimpleHashNFT }) => {
  if (!nft.previews.image_medium_url) {
    return null;
  }

  return (
    <div
      tw="flex"
      style={{
        height: "100%", // Take maximum height available
        width: "auto", // Width automatically adjusts based on content
        maxWidth: "100%", // Ensures it doesn't exceed the container width
        display: "flex", // Ensures flex properties apply to children
        justifyContent: "center", // Centers the image horizontally
      }}
    >
      <img
        src={nft.previews.image_medium_url}
        alt={nft.name || ""}
        style={{
          maxHeight: "100%", // Image takes maximum height of the container
          maxWidth: "100%", // Ensures image does not exceed the width of the container
          objectFit: "contain", // Ensures the image is scaled to be fully visible
        }}
        tw="shadow-md rounded-lg" // Apply shadow directly to the image
      />
    </div>
  );
};

const NookLogo = () => {
  return (
    <div tw="flex flex-col gap-y-1">
      <span tw="text-5xl font-bold text-white">nook</span>
      <div tw="flex justify-between">
        {[
          "pink",
          "red",
          "orange",
          "yellow",
          "green",
          "blue",
          "purple",
          "mauve",
        ].map((color) => (
          <ColoredCircle key={color} color={color} />
        ))}
      </div>
    </div>
  );
};

const ColoredCircle = ({ color }: { color: string }) => {
  // @ts-ignore
  const backgroundColor = colors[color][`${color}9`];
  return (
    <div
      tw="flex w-3 h-3 rounded-full border"
      style={{
        backgroundColor,
      }}
    />
  );
};
