import { bulkUploadData } from "./add-data-to-atlas";
import { genIndex } from "./gen-index";
import * as dotenv from "dotenv";
import { readFileSync, writeFileSync } from "fs";
dotenv.config({ path: ".env.local" });
import { sitesToIndex } from "./sites-to-index";

const onlyToAtlas = process.argv[2]; // for script `generate-index:atlas-only`

function createLocalFileName(siteId: string) {
  return `generate-index/${
    process.env.MD_DATA ? "md-" : ""
  }generated/${siteId}.json`;
}
async function run() {
  // const data = await genIndex(
  //   "generate-index/md-generated-full-pages/all-data.json"
  // );
  // writeFileSync(
  //   "generate-index/md-generated-full-pages/all-data-chunked.json",
  //   JSON.stringify(data)
  // );
  // if (!onlyToAtlas) {
  //   console.log("creating index files!");
  //   for await (let site of sitesToIndex) {
  //     console.log("Generating index for", site);
  //     await genIndex(site.url, {
  //       writeToFile: createLocalFileName(site.name),
  //       maxTokens: 1000,
  //       minTokens: 150,
  //       embeddingModel: process.env.OPENAI_EMBEDDING_MODEL as string,
  //     });
  //     console.log("Successfully generated index for", site);
  //   }
  // }
  // const dbDocs: ContentDbEntry[] = [];
  // sitesToIndex.forEach((site) => {
  //   const path = createLocalFileName(site.name);
  //   const siteData = JSON.parse(readFileSync(path, { encoding: "utf-8" }));
  //   dbDocs.push(...siteData);
  // });
  // const collectionName = process.env.MD_DATA
  //   ? process.env.MD_COLLECTION_NAME
  //   : process.env.COLLECTION_NAME;
  const collectionName = "page-data-2";
  const strData = readFileSync(
    "generate-index/md-generated-full-pages/all-data-chunked.json",
    {
      encoding: "utf-8",
    }
  );
  const dbDocs = JSON.parse(strData);
  console.log(dbDocs[1]);
  await bulkUploadData(process.env.DB_NAME!, collectionName!, dbDocs);
}
console.log("starting index generation!");
run().then(() => console.log("index successfully generated!"));
