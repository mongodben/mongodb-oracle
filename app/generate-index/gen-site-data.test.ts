import axios from "axios";
import {
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
