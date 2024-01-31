import { MongoClient } from "@flink/common/mongo";
import { ContentRequest, ContentType } from "@flink/common/types";
import { ObjectId } from "mongodb";
import metascraper, { Metadata, MetascraperOptions } from "metascraper";
import metascraperTitle from "metascraper-title";
import metascraperAudio from "metascraper-audio";
import metascraperAuthor from "metascraper-author";
import metascraperDate from "metascraper-date";
import metascraperDescription from "metascraper-description";
import metascraperFeed from "metascraper-feed";
import metascraperImage from "metascraper-image";
import metascraperIframe from "metascraper-iframe";
import metascraperLang from "metascraper-lang";
import metascraperLogo from "metascraper-logo";
import metascraperLogoFavicon from "metascraper-logo-favicon";
import metascraperMediaProvider from "metascraper-media-provider";
import metascraperPublisher from "metascraper-publisher";
import metascraperReadability from "metascraper-readability";
import metascraperUrl from "metascraper-url";
import metascraperVideo from "metascraper-video";
import { metascraperFrame } from "../utils/metascraper-frame";
import {
  UrlMetadata,
  FrameMetascraperData,
  FrameData,
  FrameButton,
  FrameButtonAction,
  UnstructuredFrameMetascraperButtonKeys,
} from "@flink/common/types";
import { parse } from "path";

type FrameDataTypesafeMapping<T> = {
  [K in keyof T]: keyof FrameData;
};

const ENUMERATED_FRAME_KEYS: FrameDataTypesafeMapping<
  Required<
    Omit<FrameMetascraperData, keyof UnstructuredFrameMetascraperButtonKeys>
  >
> &
  UnstructuredFrameMetascraperButtonKeys = {
  frameVersion: "version",
  frameImage: "image",
  framePostUrl: "postUrl",
  frameButton1: "frameButton1",
  frameButton1Action: "frameButton1Action",
  frameButton2: "frameButton2",
  frameButton2Action: "frameButton2Action",
  frameButton3: "frameButton3",
  frameButton3Action: "frameButton3Action",
  frameButton4: "frameButton4",
  frameButton4Action: "frameButton4Action",
  frameRefreshPeriod: "refreshPeriod",
};

const USER_AGENT_OVERRIDES: { [key: string]: string } = {
  "twitter.com": "bot",
  "x.com": "bot",
  "arxiv.org":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
};

export const handleUrlContent = async (
  client: MongoClient,
  request: ContentRequest,
) => {
  const existingContent = await client.findContent(request.contentId);
  if (existingContent) {
    return existingContent;
  }

  await client.insertUrlContent({
    contentId: request.contentId,
    submitterId: new ObjectId(request.submitterId),
    timestamp: new Date(request.timestamp),
    entityIds: [new ObjectId(request.submitterId)],
    createdAt: new Date(),
    type: ContentType.URL,
    data: await fetchUrlMetadata(request.contentId),
  });
};

const scrapeMetadata = async (options: MetascraperOptions) => {
  const scraper = metascraper([
    metascraperTitle(),
    metascraperAudio(),
    metascraperAuthor(),
    metascraperDate(),
    metascraperDescription(),
    metascraperFeed(),
    metascraperImage(),
    metascraperIframe(),
    metascraperLang(),
    metascraperLogo(),
    metascraperLogoFavicon(),
    metascraperMediaProvider(),
    metascraperPublisher(),
    metascraperReadability(),
    metascraperUrl(),
    metascraperVideo(),
    metascraperFrame(),
  ]);
  return await scraper(options);
};

export const fetchUrlMetadata = async (url: string) => {
  const res = await fetch(url, {
    headers: {
      "user-agent":
        USER_AGENT_OVERRIDES[new URL(url).hostname] ||
        "Mozilla/5.0 (compatible; TelegramBot/1.0; +https://core.telegram.org/bots/webhooks)",
    },
  });
  const html = await res.text();
  const headers = res.headers;

  const contentType = headers.get("content-type");
  const contentLength = headers.get("content-length");

  const urlMetadata: UrlMetadata = {
    contentType: contentType || undefined,
    contentLength: contentLength ? Number(contentLength) : undefined,
  };

  if (contentType?.startsWith("text/html")) {
    const scrapedMetadata = await scrapeMetadata({ html, url });
    urlMetadata.metadata = scrapedMetadata;
    parseFrameMetadata(urlMetadata, scrapedMetadata);
  }

  return urlMetadata;
};

function parseFrameMetadata(urlMetadata: UrlMetadata, metadata: Metadata) {
  const frameData: FrameData = {} as FrameData;
  urlMetadata.metadata.frame = frameData;

  // construct structured button data
  const buttons = [
    {
      label: urlMetadata.metadata.frameButton1,
      action: urlMetadata.metadata.frameButton1Action as FrameButtonAction,
      index: 1,
    },
    {
      label: urlMetadata.metadata.frameButton2,
      action: urlMetadata.metadata.frameButton2Action as FrameButtonAction,
      index: 2,
    },
    {
      label: urlMetadata.metadata.frameButton3,
      action: urlMetadata.metadata.frameButton3Action as FrameButtonAction,
      index: 3,
    },
    {
      label: urlMetadata.metadata.frameButton4,
      action: urlMetadata.metadata.frameButton4Action as FrameButtonAction,
      index: 4,
    },
  ].filter((button) => button.label != null);
  frameData.buttons = buttons.length > 0 ? buttons : undefined;

  // clean up unstructured frame keys

  for (const [key, value] of Object.entries(ENUMERATED_FRAME_KEYS)) {
    const readValue = urlMetadata.metadata[key as keyof FrameMetascraperData];
    delete urlMetadata.metadata[key as keyof FrameMetascraperData];

    if (key.startsWith("frameButton")) {
      // already handled above
      continue;
    }
    if (key === "frameRefreshPeriod") {
      // convert to number
      frameData.refreshPeriod =
        (parseInt(
          urlMetadata.metadata[key as keyof FrameMetascraperData],
        ) as number) || undefined;
      continue;
    }
    frameData[value as keyof FrameData] = readValue as string &
      "vNext" &
      FrameButton[] &
      number;
  }
}
