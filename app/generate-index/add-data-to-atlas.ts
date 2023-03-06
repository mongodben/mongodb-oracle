import { mongodbClient } from "./mongodb";
export async function bulkUploadData(
  db: string,
  collection: string,
  data: object[]
) {
  const collectionClient = mongodbClient.db(db).collection(collection);
  await collectionClient.deleteMany({});
  const res = await collectionClient.insertMany(data);
  mongodbClient.close();
  return res;
}
