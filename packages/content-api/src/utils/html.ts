// @ts-ignore
import getHTML from "html-get";
// @ts-ignore
import createBrowser from "browserless";

export const getHtmlContent = async (url: string) => {
  const browser = createBrowser();
  const browserless = browser.createContext();
  const { html, headers } = await getHTML(url, {
    getBrowserless: () => browserless,
  });

  return { html, headers };
};
