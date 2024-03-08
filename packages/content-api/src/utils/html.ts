import puppeteer from "puppeteer";

export const getHtmlContent = async (url: string) => {
  // Connect to the browserless server
  const browser = await puppeteer.connect({
    browserWSEndpoint:
      "wss://browserless-production-f5a9.up.railway.app:443?token=90izic0brfqxivgczvs5r8op9xqb91ufoe4ut76xomc248se",
  });
  const page = await browser.newPage();
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3",
  );

  // Navigate to the URL
  const response = await page.goto(url, { waitUntil: "networkidle2" });

  if (!response) {
    return;
  }

  // Get headers
  const headers = response.headers();

  // Get HTML content
  const html = await page.content();

  // Close the browser connection
  await browser.disconnect();

  // Return both HTML content and headers
  return { html, headers };
};
