import { bulkUploadData } from "./add-data-to-atlas";
import { genIndex } from "./gen-index";
import * as dotenv from "dotenv";
import { readFileSync } from "fs";
dotenv.config({ path: ".env.local" });
import { sitesToIndex } from "./sites-to-index";

const onlyToAtlas = process.argv[2]; // for script `generate-index:atlas-only`

function createLocalFileName(siteId: string) {
  return `generate-index/${
    process.env.MD_DATA ? "md-" : ""
  }generated/${siteId}.json`;
}
async function run() {
  if (!onlyToAtlas) {
    console.log("creating index files!");
    for await (let site of sitesToIndex) {
      console.log("Generating index for", site);
      await genIndex(site.url, {
        writeToFile: createLocalFileName(site.name),
        maxTokens: 1000,
        embeddingModel: process.env.OPENAI_EMBEDDING_MODEL as string,
      });
      console.log("Successfully generated index for", site);
    }
  }
  const dbDocs: ContentDbEntry[] = [];
  sitesToIndex.forEach((site) => {
    const path = createLocalFileName(site.name);
    const siteData = JSON.parse(readFileSync(path, { encoding: "utf-8" }));
    dbDocs.push(...siteData);
  });

  const collectionName = process.env.MD_DATA
    ? process.env.MD_COLLECTION_NAME
    : process.env.COLLECTION_NAME;
  // await bulkUploadData(process.env.DB_NAME!, collectionName!, dbDocs);
}
console.log("starting index generation!");
run().then(() => console.log("index successfully generated!"));
