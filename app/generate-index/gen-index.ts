import * as dotenv from "dotenv";
import { genSiteData } from "./gen-site-data";
import * as fs from "fs";
import * as url from "url";
import {
  chunkPage,
  chunkPageWithEqualWeights,
  createEmbedding,
} from "./gen-embeddings";
const { OPENAI_EMBEDDING_MODEL } = process.env;

dotenv.config({ path: ".env.local" });

export const MAX_TOKENS = 1000;
export const MIN_TOKENS = 150;

interface GenIndexOptions {
  writeToFile?: string;
  maxTokens: number;
  minTokens: number;
  embeddingModel: string;
}
export async function genIndex(
  pathToData: string,
  options: GenIndexOptions = {
    minTokens: MIN_TOKENS,
    maxTokens: MAX_TOKENS,
    embeddingModel: OPENAI_EMBEDDING_MODEL as string,
  }
) {
  // const baseUrl = new URL(sitemapUrl).origin;
  /* Load in the file we want to do question answering over */
  //const pages = await genSiteData(sitemapUrl, baseUrl);
  const pages = JSON.parse(
    fs.readFileSync(pathToData, { encoding: "utf-8" })
  ) as Record<string, string>;

  let chunkedDocs: PageChunk[] = [];
  console.log("chunking pages");
  for (let page of Object.keys(pages)) {
    const pageChunks = chunkPageWithEqualWeights(
      { url: page, textPage: pages[page] },
      options.minTokens!,
      options.maxTokens!
    );
    if (pageChunks !== null) {
      chunkedDocs.push(...pageChunks);
    }
  }
  console.log("finished chunking pages.");
  console.log("converted " + pages.length + " pages");
  console.log("into " + chunkedDocs.length + " chunks");

  let dbEntries: ContentDbEntry[] = [];
  for await (let chunk of chunkedDocs) {
    console.log("creating embedding for::", chunk.url);
    const embedding = await createEmbedding(chunk.text, options.embeddingModel);
    const dateUpdated = new Date();

    dbEntries.push({ ...chunk, embedding, dateUpdated, siteId: pathToData });
  }

  if (options.writeToFile) {
    const dataString = JSON.stringify(dbEntries);
    try {
      fs.writeFileSync(options.writeToFile, dataString);
    } catch (err) {
      console.error(err);
      fs.writeFileSync("~/all-data-backup.json", dataString);
      console.log("~~~~DATA STRING HERE~~~");
      console.log(dataString);
    }
  }
  return dbEntries;
}
