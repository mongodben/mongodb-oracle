import GPT3Tokenizer from "gpt3-tokenizer";
import { openai } from "./openai";

// declare outside fxn scope so not reinstantiated on every fxn call
const tokenizer = new GPT3Tokenizer({ type: "gpt3" });

interface Page {
  url: string;
  textPage: string;
}

export function chunkPage(page: Page, maxTokens: number) {
  const pageChunks: PageChunk[] = [];

  let currentPageChunk: PageChunk = {
    url: page.url,
    chunkOrder: 1,
    text: "",
    numTokens: 0,
  };

  const paragraphs = page.textPage.split("\n\n");
  paragraphs.forEach((paragraph, i) => {
    // Note: this might not be perfectly correct. should be better validated
    const { bpe } = tokenizer.encode(paragraph);
    if (currentPageChunk.numTokens! + bpe.length < maxTokens) {
      // note that this replaces paragraphs with spaces.
      // this makes data work better with the embedding model i've heard 🤷
      currentPageChunk.text += " " + paragraph;
      currentPageChunk.numTokens! += bpe.length;
    } else {
      pageChunks.push(currentPageChunk);
      currentPageChunk = {
        url: page.url,
        chunkOrder: currentPageChunk.chunkOrder + 1,
        text: "",
        numTokens: 0,
      };
    }
    // special case for last element
    if (i === paragraphs.length - 1) {
      pageChunks.push(currentPageChunk);
    }
  });
  return pageChunks;
}

export function chunkPageWithEqualWeights(
  page: Page,
  minTokens: number,
  maxTokens: number
) {
  const { bpe } = tokenizer.encode(page.textPage);
  const numTokens = bpe.length;
  if (numTokens < minTokens) return null;

  const numChunks = Math.ceil(numTokens / maxTokens);
  return splitStringIntoChunks(page, numChunks);
}

function splitStringIntoChunks(page: Page, numChunks: number) {
  const textChunks = [];
  const chunkSize = Math.ceil(page.textPage.length / numChunks);

  for (let i = 0; i < page.textPage.length; i += chunkSize) {
    textChunks.push(page.textPage.slice(i, i + chunkSize));
  }
  return textChunks.map((text, i) => ({
    url: page.url,
    text,
    chunkOrder: i + 1,
    numTokens: tokenizer.encode(text).bpe.length,
  })) as PageChunk[];
}

export async function createEmbedding(text: string, openAiModel: string) {
  const embeddingResponse = await openai.createEmbedding({
    model: openAiModel,
    input: text,
  });
  const [{ embedding }] = embeddingResponse.data.data;
  return embedding;
}
