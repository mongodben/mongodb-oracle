import * as fs from "fs";
import { sitesToIndex } from "./sites-to-index";

export function rematerializeMdPages(chunkedData: ContentDbEntry[]) {
  const urls = Array.from(new Set(chunkedData.map(({ url }) => url)));
  /// key is page URL, value is page text
  const pageData: Record<string, string> = {};
  for (let url of urls) {
    const pageText = chunkedData
      .filter((chunk) => chunk.url === url)
      .sort((a, b) => a.chunkOrder - b.chunkOrder)
      .map((chunk) => chunk.text)
      .join("\n\n");
    pageData[url] = pageText;
  }
  return pageData;
}

const basePathIn = "generate-index/md-generated/";
const path = "generate-index/md-generated-full-pages/all-data.json";
const fileNames = sitesToIndex.map((site) => site.name + ".json");
let allData: Record<string, string> = {};
fileNames.forEach((fileName) => {
  const chunkedData = rematerializeMdPages(
    JSON.parse(fs.readFileSync(basePathIn + fileName, { encoding: "utf-8" }))
  );
  allData = { ...allData, ...chunkedData };
});
fs.writeFileSync(path, JSON.stringify(allData));
