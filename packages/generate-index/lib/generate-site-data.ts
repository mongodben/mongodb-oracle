import fs from "fs";
import * as dotenv from "dotenv";
import convert from "xml-js";
import { JSDOM } from "jsdom";
import { convert as convertHtmlToText } from "html-to-text";
// import { mongodbClient } from "./mongodb";
import { IndexedDocument } from "./types"; // TODO: make this automatic
import axios from "axios";
import { openai } from "./openai";
import GPT3Tokenizer from "gpt3-tokenizer";

dotenv.config();

const { OPENAI_EMBEDDING_MODEL } = process.env;
const tokenizer = new GPT3Tokenizer({ type: "gpt3" });
const MAX_TOKENS = 1000;

type SitemapEntry = {
  /// url
  loc: {
    _text: string;
  };
};

async function run() {
  const xml = fs.readFileSync("assets/app-services-sitemap.xml", {
    encoding: "utf-8",
  });
  var {
    urlset: { url: urls },
  } = JSON.parse(convert.xml2json(xml, { compact: true, spaces: 2 }));
  const urlList: string[] = urls.map((url: SitemapEntry) => url.loc._text);

  const textPages = await Promise.allSettled(
    urlList.map((url) => getPageData(url))
  ).then((settledResults) =>
    settledResults
      .filter((result) => result.status === "fulfilled")
      // @ts-ignore
      .map((fulfilled) => fulfilled.value)
      .map(({ url, htmlPage }) => ({ url, textPage: html2text(htmlPage) }))
  );

  const pagesWithEmbeddings = [];
  for await (let page of textPages.slice(0, 3)) {
    const embeddingResponse = await openai.createEmbedding({
      model: OPENAI_EMBEDDING_MODEL as string,
      input: page.textPage,
    });
    const [{ embedding }] = embeddingResponse.data.data;
    pagesWithEmbeddings.push({ ...page, embedding });
  }
  console.log(pagesWithEmbeddings[2]);
}

async function getPageData(url: string) {
  const { data: htmlPage } = await axios.get(url);
  return { url, htmlPage };
}

// TODO: resume here w script to break page into chunks
function chunkPage(page: { url: string; textPage: string }) {
  let currTokens = 0;
  let currChunk = "";

  const paragraphs = page.textPage.split("\n\n");
  paragraphs.forEach((paragraph) => {
    const tokenizedParagraph = tokenizer.encode(paragraph);
    if (currTokens < MAX_TOKENS) {
      currTokens += tokenizedParagraph.length;
    }
  });
}

function html2text(html: string) {
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

run();
