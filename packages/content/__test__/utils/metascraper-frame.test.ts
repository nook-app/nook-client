import { metascraperFrame } from "@flink/content/utils/metascraper-frame";
import * as cheerio from "cheerio";
import { RulesOptions, Rules, RulesTestOptions } from "metascraper";

type Testable = {
  test: (args: RulesTestOptions) => boolean;
};

describe("metascraperFrame", () => {
  test("test function works", () => {
    const frameHtml = `
    <head>
    <meta property="fc:frame" content="vNext" />
    </head>`;

    const nonFrameHtml = `
    <head>
    <meta property="og:title" content="test" />
    </head>`;
    const frame: Testable = metascraperFrame() as Testable;
    const isFrame = frame.test({
      htmlDom: cheerio.load(frameHtml),
      url: "http://example.com",
    });
    expect(isFrame).toBe(true);
    const isNotFrame = frame.test({
      htmlDom: cheerio.load(nonFrameHtml),
      url: "http://example.com",
    });
    expect(isNotFrame).toBe(false);
  });

  test("test all properties", () => {
    const fullFrameHtml = `
    <head>
    <meta property="fc:frame" content="vNext" />
    <meta property="fc:frame:image" content="image" />
    <meta property="fc:frame:post_url" content="post_url" />
    <meta property="fc:frame:button:1" content="button1" />
    <meta property="fc:frame:button:1:action" content="button1_action" />
    <meta property="fc:frame:button:2" content="button2" />
    <meta property="fc:frame:button:2:action" content="button2_action" />
    <meta property="fc:frame:button:3" content="button3" />
    <meta property="fc:frame:button:3:action" content="button3_action" />
    <meta property="fc:frame:button:4" content="button4" />
    <meta property="fc:frame:button:4:action" content="button4_action" />
    <meta property="fc:frame:refresh_period" content="refresh_period" />
    <meta property="fc:frame:fake_idk" content="fake" />
    </head>
    `;
    const dom = cheerio.load(fullFrameHtml);
    const frame = metascraperFrame();

    checkRule(frame, dom, "frameVersion", "vNext");
    checkRule(frame, dom, "frameImage", "image");
    checkRule(frame, dom, "framePostUrl", "post_url");
    checkRule(frame, dom, "frameButton1", "button1");
    checkRule(frame, dom, "frameButton1Action", "button1_action");
    checkRule(frame, dom, "frameButton2", "button2");
    checkRule(frame, dom, "frameButton2Action", "button2_action");
    checkRule(frame, dom, "frameButton3", "button3");
    checkRule(frame, dom, "frameButton3Action", "button3_action");
    checkRule(frame, dom, "frameButton4", "button4");
    checkRule(frame, dom, "frameButton4Action", "button4_action");
    checkRule(frame, dom, "frameRefreshPeriod", "refresh_period");
  });
});

function checkRule(
  rules: Rules,
  htmlDom: cheerio.CheerioAPI,
  ruleName: string,
  expectedResult: string,
) {
  const result = (rules[ruleName] as RulesOptions)({
    htmlDom,
    url: "http://example.com",
  });
  expect(result).toBe(expectedResult);
}
