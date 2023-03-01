import fs from 'fs';
import * as dotenv from 'dotenv';
import convert from 'xml-js';
import { JSDOM } from 'jsdom';
import { convert as convertHtmlToText } from 'html-to-text';
// import { mongodbClient } from "./mongodb";
import { IndexedDocument } from './types'; // TODO: make this automatic
import axios from 'axios';
import { openai } from './openai';
import GPT3Tokenizer from 'gpt3-tokenizer';

dotenv.config();

const { OPENAI_EMBEDDING_MODEL } = process.env;
const tokenizer = new GPT3Tokenizer({ type: 'gpt3' });
const MAX_TOKENS = 1000;

type SitemapEntry = {
  /// url
  loc: {
    _text: string;
  };
};

async function run() {
  const xml = fs.readFileSync('assets/app-services-sitemap.xml', {
    encoding: 'utf-8',
  });
  var {
    urlset: { url: urls },
  } = JSON.parse(convert.xml2json(xml, { compact: true, spaces: 2 }));
  const urlList: string[] = urls.map((url: SitemapEntry) => url.loc._text);

  const textPages = await Promise.allSettled(
    urlList.map((url) => getPageData(url))
  ).then((settledResults) =>
    settledResults
      .filter((result) => result.status === 'fulfilled')
      // @ts-ignore
      .map((fulfilled) => fulfilled.value)
      .map(({ url, htmlPage }) => ({ url, textPage: html2text(htmlPage) }))
  );

  // TODO: add here logic to turn the pages into chunks to embed
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

interface PageChunk {
  url: string;
  chunkOrder: number;
  text: string;
  numTokens: number;
}

// TODO: resume here to see if chunking script works.
// totally untested right now
function chunkPage(page: { url: string; textPage: string }) {
  const pageChunks: PageChunk[] = [];

  let currentPageChunk: PageChunk = {
    url: page.url,
    chunkOrder: 1,
    text: '',
    numTokens: 0,
  };

  const paragraphs = page.textPage.split('\n\n');
  paragraphs.forEach((paragraph, i) => {
    const { bpe, text } = tokenizer.encode(paragraph);
    if (currentPageChunk.numTokens < MAX_TOKENS) {
      // note that this replaces paragraphs with line breaks.
      // this makes data work better with the embedding model i've heard 🤷
      currentPageChunk.text += ' ' + text;
      currentPageChunk.numTokens += bpe.length;
    }
    // special case for last element
    else if (i === paragraph.length - 1) {
      pageChunks.push(currentPageChunk);
    } else {
      pageChunks.push(currentPageChunk);
      currentPageChunk = {
        url: page.url,
        chunkOrder: currentPageChunk.chunkOrder + 1,
        text: '',
        numTokens: 0,
      };
    }
  });
}

function html2text(html: string) {
  const dom = new JSDOM(html);
  const $ = require('jquery')(dom.window);

  $('html').find('header').remove();
  $('html').find('footer').remove();
  $('html').find('nav').remove();

  const content = $('html').get()[0].innerHTML;

  const text = convertHtmlToText(content, {
    wordwrap: false,
    selectors: [
      { selector: 'a', options: { ignoreHref: true } },
      { selector: 'img', format: 'skip' },
    ],
  });
  return text;
}

run();
