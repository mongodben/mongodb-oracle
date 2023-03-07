import { BSON } from "mongodb";
import clientPromise from "./connect";

type Conversation = {
  _id: BSON.ObjectId;
  messages: string[];
};

async function getConversationCollection() {
  const DB_NAME = process.env.DB_NAME;
  if (!DB_NAME) {
    throw new Error(`Missing environment variable: "DB_NAME"`);
  }
  const COLLECTION_NAME = "conversations";
  if (!COLLECTION_NAME) {
    throw new Error(`Missing environment variable: "COLLECTION_NAME"`);
  }

  const client = await clientPromise;
  return client.db(DB_NAME).collection<Conversation>(COLLECTION_NAME);
}

export async function createConversation() {
  const conversations = await getConversationCollection();
  const { insertedId } = await conversations.insertOne({
    _id: new BSON.ObjectId(),
    messages: [],
  });
  return insertedId;
}

export async function getConversation(conversation_id: string) {
  const conversations = await getConversationCollection();
  const conversation = await conversations.findOne({
    _id: new BSON.ObjectId(conversation_id),
  });
  if (!conversation) {
    throw new Error(`Conversation(${conversation_id}) not found`);
  }

  return {
    ...conversation,
    _id: conversation._id.toHexString(),
  };
}
