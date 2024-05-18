import { fetchList } from "@nook/app/api/list";
import { ImageResponse } from "next/og";
import * as colors from "@tamagui/colors";
import { List } from "@nook/common/types";

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

export async function GET(
  request: Request,
  { params }: { params: { listId: string } },
) {
  const listId = params.listId;
  const list = await fetchList(listId);

  const [interRegularFont, interSemiBoldFont, interBoldFont] =
    await Promise.all([interRegularFontP, interSemiBoldFontP, interBoldFontP]);

  return new ImageResponse(<ListPreview list={list} />, {
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

const ListPreview = ({ list }: { list: List }) => {
  return (
    <div
      tw="w-full h-full flex flex-col items-center justify-center p-8"
      style={{
        backgroundColor: colors.blackA.blackA12,
      }}
    >
      <div tw="flex grow" />
      <div tw="flex justify-end w-full">
        <NookLogo />
      </div>
    </div>
  );
};

const NookLogo = () => {
  return (
    <div tw="flex flex-col gap-y-1">
      <span tw="text-6xl font-bold text-white">nook</span>
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
      tw="flex  w-4 h-4 rounded-full border"
      style={{
        backgroundColor,
      }}
    />
  );
};
