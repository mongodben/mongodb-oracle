import { getHtmlPages, parseSitemapToUrlList } from "./gen-site-data";
console.debug("foo");
test("parses all files in site", async () => {
  const testUrl =
    "https://www.mongodb.com/docs/drivers/node/current/sitemap.xml";
  const urls = await parseSitemapToUrlList(testUrl);
  expect(urls.length).toBe(0);
});
