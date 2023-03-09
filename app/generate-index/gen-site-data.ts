import * as fs from "fs";
import * as dotenv from "dotenv";
import * as convert from "xml-js";
import { JSDOM } from "jsdom";
import { convert as convertHtmlToText } from "html-to-text";
import { snootyMarkdownTranslator } from "./snootyMarkdownTranslator";
import { NodeHtmlMarkdown, NodeHtmlMarkdownOptions } from "node-html-markdown";
import axios from "axios";
import axiosRetry from "axios-retry";

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
    textPage: process.env.MD_DATA
      ? snootyHtmlToMarkdown(htmlPage)
      : snootyHtmlToText(htmlPage),
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

export async function getPageData(url: string) {
  axiosRetry(axios, { retryDelay: axiosRetry.exponentialDelay });
  const { data: htmlPage } = await axios.get(url);
  return { url, htmlPage };
}

function getPageBody(html: string) {
  const dom = new JSDOM(html);
  const $ = require("jquery")(dom.window);

  const content = $("main").html();
  return content;
}

// cache on higher scope to reuse for multiple runs
const nhm = new NodeHtmlMarkdown({}, snootyMarkdownTranslator);
export function snootyHtmlToMarkdown(html: string) {
  const htmlContent = getPageBody(html);

  const mdContent = nhm.translate(htmlContent);

  // Remove images added to the headings
  const postProcessedMdContent = mdContent.replaceAll(
    /\[!\[\]\(.*\/assets\/link\.svg\)]\(#.* "Permalink to this heading"\)/g,
    ""
  );

  return postProcessedMdContent;
}

export function snootyHtmlToText(html: string) {
  const content = getPageBody(html);

  const text = convertHtmlToText(content, {
    wordwrap: false,
    selectors: [
      { selector: "a", options: { ignoreHref: true } },
      { selector: "img", format: "skip" },
    ],
  });
  return text;
}
