import { Rules, RulesOptions } from "metascraper";
import { FrameMetascraperData } from "@nook/common/types";

const rules: Rules & {
  [key in keyof FrameMetascraperData]: RulesOptions | RulesOptions[];
} = {
  frameVersion: ({ htmlDom: $ }) => {
    return $('meta[property="fc:frame"], meta[name="fc:frame"]').attr(
      "content",
    );
  },

  frameImage: ({ htmlDom: $ }) => {
    return $(
      'meta[property="fc:frame:image"], meta[name="fc:frame:image"]',
    ).attr("content");
  },

  framePostUrl: ({ htmlDom: $ }) => {
    return $(
      'meta[property="fc:frame:post_url"], meta[name="fc:frame:post_url"]',
    ).attr("content");
  },

  frameButton1: ({ htmlDom: $ }) => {
    return $(
      'meta[property="fc:frame:button:1"], meta[name="fc:frame:button:1"]',
    ).attr("content");
  },

  frameButton1Action: ({ htmlDom: $ }) => {
    return $(
      'meta[property="fc:frame:button:1:action"], meta[name="fc:frame:button:1:action"]',
    ).attr("content");
  },

  frameButton1Target: ({ htmlDom: $ }) => {
    return $(
      'meta[property="fc:frame:button:1:target"], meta[name="fc:frame:button:1:target"]',
    ).attr("content");
  },

  frameButton2: ({ htmlDom: $ }) => {
    return $(
      'meta[property="fc:frame:button:2"], meta[name="fc:frame:button:2"]',
    ).attr("content");
  },

  frameButton2Action: ({ htmlDom: $ }) => {
    return $(
      'meta[property="fc:frame:button:2:action"], meta[name="fc:frame:button:2:action"]',
    ).attr("content");
  },

  frameButton2Target: ({ htmlDom: $ }) => {
    return $(
      'meta[property="fc:frame:button:2:target"], meta[name="fc:frame:button:2:target"]',
    ).attr("content");
  },

  frameButton3: ({ htmlDom: $ }) => {
    return $(
      'meta[property="fc:frame:button:3"], meta[name="fc:frame:button:3"]',
    ).attr("content");
  },

  frameButton3Action: ({ htmlDom: $ }) => {
    return $(
      'meta[property="fc:frame:button:3:action"], meta[name="fc:frame:button:3:action"]',
    ).attr("content");
  },

  frameButton3Target: ({ htmlDom: $ }) => {
    return $(
      'meta[property="fc:frame:button:3:target"], meta[name="fc:frame:button:3:target"]',
    ).attr("content");
  },

  frameButton4: ({ htmlDom: $ }) => {
    return $(
      'meta[property="fc:frame:button:4"], meta[name="fc:frame:button:4"]',
    ).attr("content");
  },

  frameButton4Action: ({ htmlDom: $ }) => {
    return $(
      'meta[property="fc:frame:button:4:action"], meta[name="fc:frame:button:4:action"]',
    ).attr("content");
  },

  frameButton4Target: ({ htmlDom: $ }) => {
    return $(
      'meta[property="fc:frame:button:4:target"], meta[name="fc:frame:button:4:target"]',
    ).attr("content");
  },

  frameRefreshPeriod: ({ htmlDom: $ }) => {
    return $(
      'meta[property="fc:frame:refresh_period"], meta[name="fc:frame:refresh_period"]',
    ).attr("content");
  },
  frameIdemKey: ({ htmlDom: $ }) => {
    return $(
      'meta[property="fc:frame:idem_key"], meta[name="fc:frame:idem_key"]',
    ).attr("content");
  },
  frameTextInput: ({ htmlDom: $ }) => {
    return $(
      'meta[property^="fc:frame:input:text"], meta[name="fc:frame:input:text"]',
    ).attr("content");
  },

  frameImageAspectRatio: ({ htmlDom: $ }) => {
    return $(
      'meta[property="fc:frame:image:aspect_ratio"], meta[name="fc:frame:image:aspect_ratio"]',
    ).attr("content");
  },

  frameState: ({ htmlDom: $ }) => {
    return $(
      'meta[property="fc:frame:state"], meta[name="fc:frame:state"]',
    ).attr("content");
  },
};

// TODO: cache with TTL?
rules.test = ({ htmlDom: $ }) => {
  return $('meta[property="fc:frame"], meta[name="fc:frame"]').length > 0;
};

export const metascraperFrame = () => rules;
