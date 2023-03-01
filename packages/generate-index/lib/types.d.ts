import { BSON } from 'mongodb';

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
}

export type ContentDbEntry = PageChunk & {
  embedding: number[];
};
