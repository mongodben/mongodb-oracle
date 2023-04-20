import { BSON } from "mongodb";

declare global {
  export type IndexedDocument = {
    _id: BSON.ObjectId;
    text: string;
    embedding: number[];
    pageUrl: string;
  };
  export interface PageChunk {
    url: string;
    chunkOrder: number;
    text: string;
    numTokens?: number;
    score?: number;
  }

  export type ContentDbEntry = PageChunk & {
    embedding: number[];
    siteId: string;
    dateUpdated: Date;
  };

  export interface IndexCommand {
    db: string;
    collection: string;
    documents: ContentDbEntry[];
  }
}
