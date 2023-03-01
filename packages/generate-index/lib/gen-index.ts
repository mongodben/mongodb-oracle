import * as dotenv from 'dotenv';
import genSiteData from './gen-site-data';
import fs from 'fs';
import { PageChunk, ContentDbEntry } from './types';
import { chunkPage, createEmbedding } from './utils';
const { OPENAI_EMBEDDING_MODEL } = process.env;

dotenv.config();

const TEST_SITEMAP =
  'https://www.mongodb.com/docs/atlas/app-services/sitemap.xml';

const MAX_TOKENS = 1000;

interface GenIndexOptions {
  writeToFile?: string;
  maxTokens: number;
  embeddingModel: string;
}
async function genIndex(sitemapUrl: string, options: GenIndexOptions) {
  console.log('OPTIONS::', options);
  /* Load in the file we want to do question answering over */
  const pages = await genSiteData(sitemapUrl);

  let chunkedDocs: PageChunk[] = [];

  for (let page of pages) {
    const pageChunks = chunkPage(page, options.maxTokens!);
    chunkedDocs.push(...pageChunks);
  }
  console.log('Chunked docs:', chunkedDocs);
  let dbEntries: ContentDbEntry[] = [];
  for await (let chunk of chunkedDocs) {
    // TODO: This call is getting 400 errors from openai.
    // see what can do to figure out
    const embedding = await createEmbedding(chunk.text, options.embeddingModel);

    dbEntries.push({ ...chunk, embedding });
  }

  if (options.writeToFile) {
    fs.writeFileSync(options.writeToFile, JSON.stringify(dbEntries));
  }
  return chunkedDocs;
}

genIndex(TEST_SITEMAP, {
  writeToFile: 'app_services_site_data.json',
  maxTokens: MAX_TOKENS,
  embeddingModel: OPENAI_EMBEDDING_MODEL as string,
});
