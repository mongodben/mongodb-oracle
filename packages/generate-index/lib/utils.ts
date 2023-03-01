import { PageChunk } from './types';
import GPT3Tokenizer from 'gpt3-tokenizer';
import { openai } from './openai';

// declare outside fxn scope so not reinstantiated on every fxn call
const tokenizer = new GPT3Tokenizer({ type: 'gpt3' });

export function chunkPage(
  page: { url: string; textPage: string },
  maxTokens: number
) {
  const pageChunks: PageChunk[] = [];

  let currentPageChunk: PageChunk = {
    url: page.url,
    chunkOrder: 1,
    text: '',
    numTokens: 0,
  };

  const paragraphs = page.textPage.split('\n\n');
  paragraphs.forEach((paragraph, i) => {
    // Note: this might not be perfectly correct. should be better validated
    const { bpe } = tokenizer.encode(paragraph);
    if (currentPageChunk.numTokens! + bpe.length < maxTokens) {
      // note that this replaces paragraphs with spaces.
      // this makes data work better with the embedding model i've heard 🤷
      currentPageChunk.text += ' ' + paragraph;
      currentPageChunk.numTokens! += bpe.length;
    }
    // special case for last element
    else if (i === paragraphs.length - 1) {
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
  return pageChunks;
}

export async function createEmbedding(text: string, openAiModel: string) {
  const embeddingResponse = await openai.createEmbedding({
    model: openAiModel,
    input: text,
  });
  const [{ embedding }] = embeddingResponse.data.data;
  return embedding;
}
