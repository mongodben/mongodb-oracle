import * as dotenv from "dotenv";
import { genSiteData } from "./gen-site-data";
import * as fs from "fs";
import { chunkPage, createEmbedding } from "./utils";
const { OPENAI_EMBEDDING_MODEL } = process.env;

dotenv.config({ path: ".env.local" });

const MAX_TOKENS = 1000;

interface GenIndexOptions {
  writeToFile?: string;
  maxTokens: number;
  embeddingModel: string;
}
export async function genIndex(
  sitemapUrl: string,
  options: GenIndexOptions = {
    maxTokens: MAX_TOKENS,
    embeddingModel: OPENAI_EMBEDDING_MODEL as string,
  }
) {
  console.log("OPTIONS::", options);
  /* Load in the file we want to do question answering over */
  const pages = await genSiteData(sitemapUrl);

  let chunkedDocs: PageChunk[] = [];

  for (let page of pages) {
    const pageChunks = chunkPage(page, options.maxTokens!);
    chunkedDocs.push(...pageChunks);
  }
  let dbEntries: ContentDbEntry[] = [];
  for await (let chunk of chunkedDocs) {
    const embedding = await createEmbedding(chunk.text, options.embeddingModel);
    const dateUpdated = new Date();

    dbEntries.push({ ...chunk, embedding, dateUpdated, siteId: sitemapUrl });
  }

  if (options.writeToFile) {
    fs.writeFileSync(options.writeToFile, JSON.stringify(dbEntries));
  }
  return dbEntries;
}