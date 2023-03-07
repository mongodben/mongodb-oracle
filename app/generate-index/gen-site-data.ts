import * as fs from "fs";
import * as dotenv from "dotenv";
import * as convert from "xml-js";
import { JSDOM } from "jsdom";
import { convert as convertHtmlToText } from "html-to-text";
import axios from "axios";

dotenv.config({ path: ".env.local" });

type SitemapEntry = {
  /// url
  loc: {
    _text: string;
  };
};

export async function genSiteData(siteUrl: string) {
  const { data: xml } = await axios.get(siteUrl);
  const urlList = parseSitemapToUrlList(xml);
  const htmlPages = await getHtmlPages(urlList);
  const textPages = htmlPages.map(({ url, htmlPage }) => ({
    url,
    textPage: snootyHtmlToText(htmlPage),
  }));

  return textPages;
}

// ~~~ HELPER FUNCTIONS ~~~

export function parseSitemapToUrlList(xmlSitemap: string) {
  const {
    urlset: { url: urls },
  } = JSON.parse(convert.xml2json(xmlSitemap, { compact: true, spaces: 2 }));
  const urlList: string[] = urls.map((url: SitemapEntry) => url.loc._text);
  return urlList;
}

export async function getHtmlPages(urlList: string[]) {
  const htmlPages = await Promise.allSettled(
    urlList.map((url) => getPageData(url))
  ).then((settledResults) =>
    settledResults
      .filter((result, i) => {
        if (result.status === "rejected") {
          console.error("problem parsing page:", urlList[i]);
        }
        return result.status === "fulfilled";
      })
      // @ts-ignore
      .map((fulfilled) => fulfilled.value)
  );
  return htmlPages;
}

// TODO: make this script more fault tolerant w retry behavior.
// right now fails when there are momentary internet drops
export async function getPageData(url: string) {
  const { data: htmlPage } = await axios.get(url);
  return { url, htmlPage };
}

export function snootyHtmlToText(html: string) {
  const dom = new JSDOM(html);
  const $ = require("jquery")(dom.window);

  $("html").find("header").remove();
  $("html").find("footer").remove();
  $("html").find("nav").remove();

  const content = $("html").get()[0].innerHTML;

  const text = convertHtmlToText(content, {
    wordwrap: false,
    selectors: [
      { selector: "a", options: { ignoreHref: true } },
      { selector: "img", format: "skip" },
    ],
  });
  return text;
}
