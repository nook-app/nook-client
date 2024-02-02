import { Rules, RulesOptions } from "metascraper";
import { FrameMetascraperData } from "@flink/common/types";

const rules: Rules & {
  [key in keyof FrameMetascraperData]: RulesOptions | RulesOptions[];
} = {
  frameVersion: ({ htmlDom: $, url }) => {
    return $('meta[property="fc:frame"]').attr("content");
  },

  frameImage: ({ htmlDom: $, url }) => {
    return $('meta[property="fc:frame:image"]').attr("content");
  },

  framePostUrl: ({ htmlDom: $, url }) => {
    return $('meta[property="fc:frame:post_url"]').attr("content");
  },

  frameButton1: ({ htmlDom: $, url }) => {
    return $('meta[property="fc:frame:button:1"]').attr("content");
  },

  frameButton1Action: ({ htmlDom: $, url }) => {
    return $('meta[property="fc:frame:button:1:action"]').attr("content");
  },

  frameButton2: ({ htmlDom: $, url }) => {
    return $('meta[property="fc:frame:button:2"]').attr("content");
  },

  frameButton2Action: ({ htmlDom: $, url }) => {
    return $('meta[property="fc:frame:button:2:action"]').attr("content");
  },

  frameButton3: ({ htmlDom: $, url }) => {
    return $('meta[property="fc:frame:button:3"]').attr("content");
  },

  frameButton3Action: ({ htmlDom: $, url }) => {
    return $('meta[property="fc:frame:button:3:action"]').attr("content");
  },

  frameButton4: ({ htmlDom: $, url }) => {
    return $('meta[property="fc:frame:button:4"]').attr("content");
  },

  frameButton4Action: ({ htmlDom: $, url }) => {
    return $('meta[property="fc:frame:button:4:action"]').attr("content");
  },

  frameRefreshPeriod: ({ htmlDom: $, url }) => {
    return $('meta[property="fc:frame:refresh_period"]').attr("content");
  },
  frameIdemKey: ({ htmlDom: $, url }) => {
    return $('meta[property="fc:frame:idem_key"]').attr("content");
  },
};

// TODO: cache with TTL?
rules.test = ({ htmlDom: $, url }) => {
  return $('meta[property="fc:frame"]').length > 0;
};

export const metascraperFrame = () => rules;
