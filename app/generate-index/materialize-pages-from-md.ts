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

export function wrappedRematerializeMdPages(pathIn: string, pathOut: string) {
  const chunkedData: ContentDbEntry[] = JSON.parse(
    fs.readFileSync(pathIn, { encoding: "utf-8" })
  );
  const materializedData = rematerializeMdPages(chunkedData);
  fs.writeFileSync(pathOut, JSON.stringify(materializedData, null, 2));
}

const basePathIn = "generate-index/md-generated/";
const basePathOut = "generate-index/md-generated-full-pages/";
const fileNames = sitesToIndex.map((site) => site.name + ".json");
fileNames.forEach((fileName) =>
  wrappedRematerializeMdPages(basePathIn + fileName, basePathOut + fileName)
);
