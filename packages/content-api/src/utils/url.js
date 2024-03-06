"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchUrlMetadata = exports.getUrlContent = void 0;
const metascraper_1 = __importDefault(require("metascraper"));
const metascraper_title_1 = __importDefault(require("metascraper-title"));
const metascraper_author_1 = __importDefault(require("metascraper-author"));
const metascraper_date_1 = __importDefault(require("metascraper-date"));
const metascraper_description_1 = __importDefault(require("metascraper-description"));
const metascraper_feed_1 = __importDefault(require("metascraper-feed"));
const metascraper_image_1 = __importDefault(require("metascraper-image"));
const metascraper_iframe_1 = __importDefault(require("metascraper-iframe"));
const metascraper_lang_1 = __importDefault(require("metascraper-lang"));
const metascraper_logo_1 = __importDefault(require("metascraper-logo"));
const metascraper_logo_favicon_1 = __importDefault(require("metascraper-logo-favicon"));
const metascraper_publisher_1 = __importDefault(require("metascraper-publisher"));
const metascraper_readability_1 = __importDefault(require("metascraper-readability"));
const metascraper_url_1 = __importDefault(require("metascraper-url"));
const metascraper_frame_1 = require("./metascraper/metascraper-frame");
// Helper to enumerate over all unstructured Metascraper frame keys and map them to structured FrameData keys
// This wacky type should make it robust to any upstream changes in both the Metascraper frame keys and the FrameData keys
const ENUMERATED_FRAME_KEYS = {
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
    frameState: "state",
};
const USER_AGENT_OVERRIDES = {
    "twitter.com": "bot",
    "x.com": "bot",
    "arxiv.org": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
};
/**
 * Scrape metadata from a URL and insert it into the database
 * @param client
 * @param request
 * @returns
 */
const getUrlContent = async (uri) => {
    const date = new Date();
    let url;
    try {
        url = new URL(uri);
    }
    catch (e) {
        url = new URL(`https://${uri}`);
    }
    const content = {
        uri,
        protocol: url.protocol,
        host: url.host,
        path: url.pathname,
        query: url.search,
        fragment: url.hash,
        type: null,
        length: null,
        metadata: null,
        frame: null,
        createdAt: date,
        updatedAt: date,
    };
    try {
        if (uri.startsWith("http://") || uri.startsWith("https://")) {
            const metadata = await (0, exports.fetchUrlMetadata)(uri);
            content.type = metadata.contentType || null;
            content.length = metadata.contentLength || null;
            content.metadata = metadata.metadata || null;
            content.frame = metadata.frame || null;
        }
    }
    catch (e) { }
    return content;
};
exports.getUrlContent = getUrlContent;
const scrapeMetadata = async (options) => {
    const scraper = (0, metascraper_1.default)([
        (0, metascraper_title_1.default)(),
        (0, metascraper_author_1.default)(),
        (0, metascraper_date_1.default)(),
        (0, metascraper_description_1.default)(),
        (0, metascraper_feed_1.default)(),
        (0, metascraper_image_1.default)(),
        (0, metascraper_iframe_1.default)(),
        (0, metascraper_lang_1.default)(),
        (0, metascraper_logo_1.default)(),
        (0, metascraper_logo_favicon_1.default)(),
        (0, metascraper_publisher_1.default)(),
        (0, metascraper_readability_1.default)(),
        (0, metascraper_url_1.default)(),
        (0, metascraper_frame_1.metascraperFrame)(),
    ]);
    return await scraper(options);
};
const fetchUrlMetadata = async (url) => {
    const res = await fetch(url, {
        headers: {
            "user-agent": USER_AGENT_OVERRIDES[new URL(url).hostname] ||
                "Mozilla/5.0 (compatible; TelegramBot/1.0; +https://core.telegram.org/bots/webhooks)",
        },
    });
    const html = await res.text();
    const headers = res.headers;
    const contentType = headers.get("content-type");
    const contentLength = headers.get("content-length");
    const urlMetadata = {
        contentType: contentType || undefined,
        contentLength: contentLength ? Number(contentLength) : undefined,
    };
    if (contentType === null || contentType === void 0 ? void 0 : contentType.startsWith("text/html")) {
        const scrapedMetadata = await scrapeMetadata({ html, url });
        urlMetadata.metadata = scrapedMetadata;
        urlMetadata.frame = parseFrameMetadata(urlMetadata);
    }
    return urlMetadata;
};
exports.fetchUrlMetadata = fetchUrlMetadata;
/**
 * Metascraper only allows key:value scraping, so this helper takes the unstructured frame metadata and structures it into a FrameData object.
 * Then it removes the unstructured frame keys from the metadata object.
 * @param urlMetadata UrlMetadata object including metadata scraped from the URL
 */
function parseFrameMetadata(urlMetadata) {
    const frameData = {};
    // better way to shut up the type checker? inline ignore only works for first access
    if (!urlMetadata.metadata) {
        urlMetadata.metadata = {};
    }
    // construct structured button data
    // TODO: validate button actions etc?
    const buttons = [
        {
            label: urlMetadata.metadata.frameButton1,
            action: urlMetadata.metadata.frameButton1Action,
            target: urlMetadata.metadata.frameButton1Target,
            index: 1,
        },
        {
            label: urlMetadata.metadata.frameButton2,
            action: urlMetadata.metadata.frameButton2Action,
            target: urlMetadata.metadata.frameButton2Target,
            index: 2,
        },
        {
            label: urlMetadata.metadata.frameButton3,
            action: urlMetadata.metadata.frameButton3Action,
            target: urlMetadata.metadata.frameButton3Target,
            index: 3,
        },
        {
            label: urlMetadata.metadata.frameButton4,
            action: urlMetadata.metadata.frameButton4Action,
            target: urlMetadata.metadata.frameButton4Target,
            index: 4,
        },
    ].filter((button) => button.label != null);
    frameData.buttons = buttons.length > 0 ? buttons : undefined;
    // metascraper returns unstructured metadata; all frame keys are prefixed with "frame", which we will structure into a FrameData object under the "frame" key
    // clean up unstructured frame keys
    for (const [key, value] of Object.entries(ENUMERATED_FRAME_KEYS)) {
        const readValue = urlMetadata.metadata[key];
        delete urlMetadata.metadata[key];
        if (key.startsWith("frameButton")) {
            // already handled above
            continue;
        }
        if (key === "frameRefreshPeriod") {
            // convert to number
            let parsed = parseInt(readValue || "");
            if (Number.isNaN(parsed)) {
                parsed = undefined;
            }
            frameData.refreshPeriod = parsed;
            continue;
        }
        frameData[value] = readValue;
    }
    if (frameData.version) {
        return frameData;
    }
}
//# sourceMappingURL=url.js.map