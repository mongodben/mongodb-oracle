import axios from "axios";
import {
  getPageData,
  getHtmlPages,
  parseSitemapToUrlList,
  snootyHtmlToText,
} from "./gen-site-data";

test("parses all files in site", async () => {
  const testUrl =
    "https://www.mongodb.com/docs/drivers/node/current/sitemap.xml";
  const { data: xml } = await axios.get(testUrl);
  const urls = await parseSitemapToUrlList(xml);
  const pages = await getHtmlPages(urls);
  const parsedPages = pages.map(({ url, htmlPage }) => ({
    url,
    textPage: snootyHtmlToText(htmlPage),
  }));
  expect(urls.length).toBe(pages.length);
  expect(urls.length).toBe(parsedPages.length);
});

test("fetches a single page", async () => {

  const testUrl = 
    "https://www.mongodb.com/docs/drivers/java/sync/current/fundamentals/auth/";

  const pageData = await getPageData(testUrl);
  expect(pageData.url).toBe(testUrl);
});
