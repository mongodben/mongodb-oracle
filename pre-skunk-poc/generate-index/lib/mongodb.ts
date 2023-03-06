import { MongoClient } from "mongodb";
import * as dotenv from "dotenv";
dotenv.config();

const { MONGODB_CONNECTION_URI } = process.env;

const mongodbClient = new MongoClient(MONGODB_CONNECTION_URI as string);
export { mongodbClient };
