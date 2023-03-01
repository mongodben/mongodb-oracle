import { mongodbClient } from './mongodb';
import fs from 'fs';
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
const data = JSON.parse(
  fs.readFileSync('app_services_site_data.json', {
    encoding: 'utf-8',
  })
);
bulkUploadData('sites', 'atlas-app-services', data);
