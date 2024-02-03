import { fetchUrlMetadata } from "../../handlers/url";

jest.mock("@flink/common/mongo");
jest.mock("metascraper-media-provider", () => () => {
  return {};
});

describe("@flink/content/handlers/url", () => {
  test("idk", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      text: () => `
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
        <meta property="fc:frame:idem_key" content="idem_key" />
        <meta property="fc:frame:fake_idk" content="fake" />
        <meta property="fc:frame:input:text:text_input"/>
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
    const result = await fetchUrlMetadata("https://flink.fyi");
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
          index: 1,
        },
        {
          label: "button2",
          action: "button2_action",
          index: 2,
        },
        {
          label: "button3",
          action: "button3_action",
          index: 3,
        },
        {
          label: "button4",
          action: "button4_action",
          index: 4,
        },
      ],
      refreshPeriod: undefined,
      idempotencyKey: "idem_key",
      textInput: "text_input",
    });
  });
});
