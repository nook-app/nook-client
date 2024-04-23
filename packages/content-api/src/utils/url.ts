import metascraper, { Metadata, MetascraperOptions } from "metascraper";
import metascraperTitle from "metascraper-title";
import metascraperAuthor from "metascraper-author";
import metascraperDate from "metascraper-date";
import metascraperDescription from "metascraper-description";
import metascraperFeed from "metascraper-feed";
import metascraperImage from "metascraper-image";
import metascraperIframe from "metascraper-iframe";
import metascraperLang from "metascraper-lang";
import metascraperLogo from "metascraper-logo";
import metascraperLogoFavicon from "metascraper-logo-favicon";
import metascraperPublisher from "metascraper-publisher";
import metascraperReadability from "metascraper-readability";
import metascraperUrl from "metascraper-url";
import { UrlContent } from "@nook/common/prisma/content";
import { Frame, getFrame } from "frames.js";

export type UrlMetadata = {
  metadata?: Metadata;
  frame?: Frame | Partial<Frame>;
  contentType?: string;
  contentLength?: number;
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
  uri: string,
): Promise<UrlContent | undefined> => {
  const date = new Date();

  let url: URL;
  try {
    url = new URL(uri);
  } catch (e) {
    try {
      url = new URL(`https://${uri}`);
    } catch (e2) {
      return;
    }
  }

  const content: UrlContent = {
    uri,
    protocol: url.protocol,
    host: url.host,
    path: url.pathname,
    query: url.search,
    fragment: url.hash,
    type: null,
    length: null,
    metadata: null,
    hasFrame: false,
    frame: null,
    createdAt: date,
    updatedAt: date,
  };

  try {
    if (uri.startsWith("http://") || uri.startsWith("https://")) {
      const metadata = await fetchUrlMetadata(uri.split("?")[0]);

      // If CloudFlare error, don't save the metadata
      if (metadata?.metadata?.title === "Just a moment...") {
        console.log(`[metadata] [${uri}] failed due to cloudflare`);
        return;
      }

      content.type = metadata.contentType || null;
      content.length = metadata.contentLength || null;
      content.metadata = metadata.metadata || null;

      if (metadata.frame?.buttons && metadata.frame?.buttons.length > 0) {
        content.hasFrame = true;
        content.frame = JSON.parse(JSON.stringify(metadata.frame));
      }
    }
  } catch (e) {
    console.log(`[metadata] [${uri}] failed due to ${e}`);
    return;
  }

  if (!content.type) {
    console.log(`[metadata] [${uri}] failed due to missing type`);
    return;
  }

  return content;
};

const scrapeMetadata = async (options: MetascraperOptions) => {
  const scraper = metascraper([
    metascraperTitle(),
    metascraperAuthor(),
    metascraperDate(),
    metascraperDescription(),
    metascraperFeed(),
    metascraperImage(),
    metascraperIframe(),
    metascraperLang(),
    metascraperLogo(),
    metascraperLogoFavicon(),
    metascraperPublisher(),
    metascraperReadability(),
    metascraperUrl(),
  ]);
  return await scraper(options);
};

const fetchUrlMetadata = async (url: string) => {
  const res = await Promise.race([
    fetch(url, {
      headers: {
        "user-agent":
          USER_AGENT_OVERRIDES[new URL(url).hostname] ||
          "Mozilla/5.0 (compatible; TelegramBot/1.0; +https://core.telegram.org/bots/webhooks)",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "same-origin",
        "Sec-Fetch-User": "?1",
      },
    }) as Promise<Response>,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Timed out getting frame")), 20000),
    ) as Promise<Error>,
  ]);

  if (res instanceof Error) {
    throw res;
  }

  const html = await res.text();
  const headers = res.headers;

  const contentType = headers.get("content-type");
  const contentLength = headers.get("content-length");

  const urlMetadata: UrlMetadata = {
    contentType: contentType || undefined,
    contentLength: contentLength ? Number(contentLength) : undefined,
  };

  if (contentType?.startsWith("text/html")) {
    const scrapedMetadata = await Promise.race([
      scrapeMetadata({ html, url }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Timed out getting frame")), 20000),
      ) as Promise<Error>,
    ]);
    if (scrapedMetadata instanceof Error) {
      throw scrapedMetadata;
    }
    urlMetadata.metadata = scrapedMetadata;
    if (
      urlMetadata.metadata?.image &&
      new Blob([urlMetadata.metadata?.image]).size >= 256000
    ) {
      urlMetadata.metadata.image = undefined;
    }
    const { frame } = getFrame({
      url,
      htmlString: html,
    });

    if (frame?.image && new Blob([frame?.image]).size < 256000) {
      urlMetadata.frame = frame;
    }
  }

  return urlMetadata;
};
