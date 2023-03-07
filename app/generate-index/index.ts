import { bulkUploadData } from "./add-data-to-atlas";
import { genIndex } from "./gen-index";
import * as dotenv from "dotenv";
import { readFileSync } from "fs";
dotenv.config({ path: ".env.local" });
import { sitesToIndex } from "./sites-to-index";

const { DB_NAME, COLLECTION_NAME } = process.env;

async function run() {
  // for await (let site of sitesToIndex) {
  //   console.log("Generating index for", site);
  //   await genIndex(site.url, {
  //     writeToFile: `generate-index/generated/${site.name}.json`,
  //     maxTokens: 1000,
  //     embeddingModel: process.env.OPENAI_EMBEDDING_MODEL as string,
  //   });
  //   console.log("Successfully generated index for", site);
  // }
  const dbDocs: ContentDbEntry[] = [];
  sitesToIndex.forEach((site) => {
    const path = `generate-index/generated/${site.name}.json`;
    const siteData = JSON.parse(readFileSync(path, { encoding: "utf-8" }));
    dbDocs.push(...siteData);
  });
  await bulkUploadData(DB_NAME!, COLLECTION_NAME!, dbDocs);
}
console.log("starting index generation!");
run().then(() => console.log("index successfully generated!"));
