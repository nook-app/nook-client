import { fetchUrlMetadata } from "../../handlers/url";

jest.mock("@flink/common/mongo");
jest.mock("metascraper-media-provider", () => () => {
  return {};
});

describe("@flink/content/handlers/url", () => {
  test("resolves full frame metadata", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      text: () => `
      <head>
      <meta name="fc:frame" content="vNext" />
      <meta name="fc:frame:image" content="image" />
      <meta name="fc:frame:post_url" content="post_url" />
      <meta name="fc:frame:button:1" content="button1" />
      <meta name="fc:frame:button:1:action" content="button1_action" />
      <meta name="fc:frame:button:1:target" content="button1_target" />
      <meta name="fc:frame:button:2" content="button2" />
      <meta name="fc:frame:button:2:action" content="button2_action" />
      <meta name="fc:frame:button:2:target" content="button2_target" />
      <meta name="fc:frame:button:3" content="button3" />
      <meta name="fc:frame:button:3:action" content="button3_action" />
      <meta name="fc:frame:button:3:target" content="button3_target" />
      <meta name="fc:frame:button:4" content="button4" />
      <meta name="fc:frame:button:4:action" content="button4_action" />
      <meta name="fc:frame:button:4:target" content="button4_target" />
      <meta name="fc:frame:refresh_period" content="refresh_period" />
      <meta name="fc:frame:idem_key" content="idem_key" />
      <meta name="fc:frame:fake_idk" content="fake" />
      <meta name="fc:frame:input:text" content="text_input"/>
      <meta name="fc:frame:image:aspect_ratio" content="1:1"/>
      </head>
        `,
      headers: {
        get: (key: string) => {
          switch (key) {
            case "content-type":
              return "text/html";
            case "content-length":
              return "100";
            default:
              return "";
          }
        },
      },
    });
    const result = await fetchUrlMetadata("https://flink.help");
    expect(result.contentLength).toBe(100);
    expect(result.contentType).toBe("text/html");
    // @ts-ignore
    expect(result.metadata.frame).toEqual({
      version: "vNext",
      image: "image",
      postUrl: "post_url",
      buttons: [
        {
          label: "button1",
          action: "button1_action",
          target: "button1_target",
          index: 1,
        },
        {
          label: "button2",
          action: "button2_action",
          target: "button2_target",
          index: 2,
        },
        {
          label: "button3",
          action: "button3_action",
          target: "button3_target",
          index: 3,
        },
        {
          label: "button4",
          action: "button4_action",
          target: "button4_target",
          index: 4,
        },
      ],
      refreshPeriod: undefined,
      idempotencyKey: "idem_key",
      textInput: "text_input",
      aspectRatio: "1:1",
    });
  });

  test("resolves frame metadata with fewer than 4 buttons", async () => {
    // same as above but with fewer buttons
    global.fetch = jest.fn().mockResolvedValue({
      text: () => `
      <head>
      <meta name="fc:frame" content="vNext" />
      <meta name="fc:frame:image" content="image" />
      <meta name="fc:frame:post_url" content="post_url" />
      <meta name="fc:frame:button:1" content="button1" />
      <meta name="fc:frame:button:1:action" content="button1_action" />
      <meta name="fc:frame:button:1:target" content="button1_target" />
      <meta name="fc:frame:button:2" content="button2" />
      <meta name="fc:frame:button:2:action" content="button2_action" />
      <meta name="fc:frame:button:2:target" content="button2_target" />
      <meta name="fc:frame:refresh_period" content="refresh_period" />
      <meta name="fc:frame:idem_key" content="idem_key" />
      <meta name="fc:frame:fake_idk" content="fake" />
      <meta name="fc:frame:input:text" content="text_input"/>
      <meta name="fc:frame:image:aspect_ratio" content="1:1"/>
      </head>
        `,
      headers: {
        get: (key: string) => {
          switch (key) {
            case "content-type":
              return "text/html";
            case "content-length":
              return "100";
            default:
              return "";
          }
        },
      },
    });
    const result = await fetchUrlMetadata("https://flink.help");
    expect(result.contentLength).toBe(100);
    expect(result.contentType).toBe("text/html");
    // @ts-ignore
    expect(result.metadata.frame).toEqual({
      version: "vNext",
      image: "image",
      postUrl: "post_url",
      buttons: [
        {
          label: "button1",
          action: "button1_action",
          target: "button1_target",
          index: 1,
        },
        {
          label: "button2",
          action: "button2_action",
          target: "button2_target",
          index: 2,
        },
      ],
      idempotencyKey: "idem_key",
      textInput: "text_input",
      aspectRatio: "1:1",
    });
  });
});
