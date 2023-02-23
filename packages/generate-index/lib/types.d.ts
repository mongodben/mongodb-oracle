import { BSON } from "mongodb";

export type IndexedDocument = {
  _id: BSON.ObjectId;
  text: string;
  embedding: number[];
  pageUrl: string;
};
