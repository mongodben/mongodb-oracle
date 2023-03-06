import { bulkUploadData } from "./add-data-to-atlas";
import { genIndex } from "./gen-index";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const { DB_NAME, COLLECTION_NAME } = process.env;

const sitesToIndex = [
  {
    name: "app-services",
    url: "https://www.mongodb.com/docs/atlas/app-services/sitemap.xml",
    siteType: "snooty",
  },
  {
    name: "realm",
    url: "https://www.mongodb.com/docs/realm/sitemap.xml",
    siteType: "snooty",
  },
  {
    name: "manual",
    url: "https://www.mongodb.com/docs/manual/sitemap.xml",
    siteType: "snooty",
  },
  {
    name: "atlas",
    url: "https://www.mongodb.com/docs/atlas/sitemap.xml",
    siteType: "snooty",
  },
  {
    name: "node-driver",
    url: "https://www.mongodb.com/docs/drivers/node/current/sitemap.xml",
    siteType: "snooty",
  },
  {
    name: "go-driver",
    url: "https://www.mongodb.com/docs/drivers/go/current/sitemap.xml",
    siteType: "snooty",
  },
];

async function run() {
  const dbDocs: ContentDbEntry[] = [];
  for await (let site of sitesToIndex) {
    const siteData = await genIndex(site.url, {
      writeToFile: `${site.name}.json`,
      maxTokens: 1000,
      embeddingModel: process.env.OPENAI_EMBEDDING_MODEL as string,
    });
    dbDocs.push(...siteData);
  }
  await bulkUploadData(DB_NAME!, COLLECTION_NAME!, dbDocs);
}
console.log("starting index generation!");
run().then(() => console.log("index successfully generated!"));
