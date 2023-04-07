import { BSON } from "mongodb";
import clientPromise from "./connect";

// interface PageChunk {
//   url: string;
//   chunkOrder: number;
//   text: string;
//   numTokens?: number;
// }

// type ContentDbEntry = PageChunk & {
//   embedding: number[];
// };

type PageChunk = {
  _id: BSON.ObjectId;
  url: string;
  chunkOrder: number;
  text: string;
  numTokens: number;
  embedding: number[];
  dateUpdated: Date;
  siteId: string;
  score: number;
};

async function getPageCollection() {
  const DB_NAME = process.env.DB_NAME;
  if (!DB_NAME) {
    throw new Error(`Missing environment variable: "DB_NAME"`);
  }
  // const COLLECTION_NAME = process.env.MD_DATA
  //   ? process.env.MD_COLLECTION_NAME
  //   : process.env.COLLECTION_NAME;
  const COLLECTION_NAME = "page-data-2";
  if (!COLLECTION_NAME) {
    throw new Error(`Missing environment variable: "COLLECTION_NAME"`);
  }

  const client = await clientPromise;
  return client.db(DB_NAME).collection<PageChunk>(COLLECTION_NAME);
}

export type SearchPagesOptions = {
  k: number;
  minScore: number;
  filter?: Record<string, unknown>;
};

const defaultSearchPagesOptions: SearchPagesOptions = {
  k: 3,
  minScore: 0.75,
};

export async function searchPages(
  embedding: number[],
  optionsIn?: Partial<SearchPagesOptions>
): Promise<PageChunk[]> {
  const options = { ...defaultSearchPagesOptions, ...optionsIn };
  const { k, minScore, filter } = options;
  const pages = await getPageCollection();
  const cursor = pages.aggregate<PageChunk>([
    {
      $search: {
        index: "default-2",
        knnBeta: {
          vector: embedding,
          path: "embedding",
          filter,
          k,
        },
      },
    },
    {
      $addFields: {
        score: {
          $meta: "searchScore",
        },
      },
    },
    { $match: { score: { $gte: minScore } } },
  ]);
  const results = await cursor.toArray();
  return results;
}
