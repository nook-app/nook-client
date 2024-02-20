import { Content, ContentType } from "@nook/common/types";
import { ObjectId } from "mongodb";
import metascraper, { MetascraperOptions } from "metascraper";
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
import { metascraperFrame } from "./utils/metascraper-frame";
import {
  UrlMetadata,
  FrameMetascraperData,
  FrameData,
  FrameButton,
  FrameButtonAction,
  UnstructuredFrameMetascraperButtonKeys,
} from "@nook/common/types";

// Require that a key in T maps to a key of FrameData
type FrameDataTypesafeMapping<T> = {
  [K in keyof T]: keyof FrameData;
};

// Helper to enumerate over all unstructured Metascraper frame keys and map them to structured FrameData keys
// This wacky type should make it robust to any upstream changes in both the Metascraper frame keys and the FrameData keys
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
  frameButton1Target: "frameButton1Target",
  frameButton2: "frameButton2",
  frameButton2Action: "frameButton2Action",
  frameButton2Target: "frameButton2Target",
  frameButton3: "frameButton3",
  frameButton3Action: "frameButton3Action",
  frameButton3Target: "frameButton3Target",
  frameButton4: "frameButton4",
  frameButton4Action: "frameButton4Action",
  frameButton4Target: "frameButton4Target",
  frameRefreshPeriod: "refreshPeriod",
  frameIdemKey: "idempotencyKey",
  frameTextInput: "textInput",
  frameImageAspectRatio: "aspectRatio",
};

const USER_AGENT_OVERRIDES: { [key: string]: string } = {
  "twitter.com": "bot",
  "x.com": "bot",
  "arxiv.org":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
};

/**
 * Scrape metadata from a URL and insert it into the database
 * @param client
 * @param request
 * @returns
 */
export const getUrlContent = async (
  contentId: string,
): Promise<Content<UrlMetadata>> => {
  const timestamp = new Date();
  const content = {
    _id: ObjectId.createFromTime(timestamp.getTime() / 1000),
    contentId: contentId,
    timestamp,
    entityIds: [],
    createdAt: timestamp,
    updatedAt: timestamp,
    type: ContentType.URL,
    data: await fetchUrlMetadata(contentId),
    engagement: {
      likes: 0,
      reposts: 0,
      replies: 0,
      embeds: 0,
    },
    tips: {},
    topics: [],
    referencedEntityIds: [],
    referencedContentIds: [],
  };
  return content;
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
    parseFrameMetadata(urlMetadata);
  }

  return urlMetadata;
};

/**
 * Metascraper only allows key:value scraping, so this helper takes the unstructured frame metadata and structures it into a FrameData object.
 * Then it removes the unstructured frame keys from the metadata object.
 * @param urlMetadata UrlMetadata object including metadata scraped from the URL
 */
function parseFrameMetadata(urlMetadata: UrlMetadata) {
  const frameData: FrameData = {} as FrameData;
  // better way to shut up the type checker? inline ignore only works for first access
  if (!urlMetadata.metadata) {
    urlMetadata.metadata = {};
  }

  // construct structured button data
  // TODO: validate button actions etc?
  const buttons = [
    {
      label: urlMetadata.metadata.frameButton1,
      action: urlMetadata.metadata.frameButton1Action as FrameButtonAction,
      target: urlMetadata.metadata.frameButton1Target,
      index: 1,
    },
    {
      label: urlMetadata.metadata.frameButton2,
      action: urlMetadata.metadata.frameButton2Action as FrameButtonAction,
      target: urlMetadata.metadata.frameButton2Target,
      index: 2,
    },
    {
      label: urlMetadata.metadata.frameButton3,
      action: urlMetadata.metadata.frameButton3Action as FrameButtonAction,
      target: urlMetadata.metadata.frameButton3Target,
      index: 3,
    },
    {
      label: urlMetadata.metadata.frameButton4,
      action: urlMetadata.metadata.frameButton4Action as FrameButtonAction,
      target: urlMetadata.metadata.frameButton4Target,
      index: 4,
    },
  ].filter((button) => button.label != null) as FrameButton[];
  frameData.buttons = buttons.length > 0 ? buttons : undefined;

  // metascraper returns unstructured metadata; all frame keys are prefixed with "frame", which we will structure into a FrameData object under the "frame" key
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
          urlMetadata.metadata[key as keyof FrameMetascraperData] as string,
        ) as number) || undefined;
      continue;
    }
    frameData[value as keyof FrameData] = readValue as string &
      "vNext" &
      FrameButton[] &
      number;
  }
  if (frameData.version) {
    urlMetadata.metadata.frame = frameData;
  }
}
