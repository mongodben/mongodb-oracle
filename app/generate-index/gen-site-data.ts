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

export async function genSiteData(siteUrl: string, baseUrl: string) {
  const { data: xml } = await axios.get(siteUrl);
  const urlList = parseSitemapToUrlList(xml);
  const htmlPages = await getHtmlPages(urlList);
  const textPages = htmlPages.map(({ url, htmlPage }) => ({
    url,
    textPage: process.env.MD_DATA
      ? snootyHtmlToMarkdown(htmlPage, baseUrl)
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
  let $ = require("jquery")(dom.window);

  const content = $("main").html() as string;
  $ = null;
  return content;
}

// cache on higher scope to reuse for multiple runs
export function snootyHtmlToMarkdown(html: string, baseUrl: string) {
  const htmlContent = getPageBody(html);

  let nhm: NodeHtmlMarkdown | null = new NodeHtmlMarkdown(
    {},
    snootyMarkdownTranslator
  );
  const mdContent = nhm.translate(htmlContent);
  nhm = null; // force garbage collection;

  // Remove images added to the headings
  let postProcessedMdContent = mdContent.replaceAll(
    /\[!\[\]\(.*\/assets\/link\.svg\)]\(#.* "Permalink to this heading"\)/g,
    ""
  );

  postProcessedMdContent = postProcessedMdContent.replaceAll(
    /(]\()(\/docs\/.*)(\))/g,
    (_match, start, slug, end) => start + baseUrl + slug + end
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
