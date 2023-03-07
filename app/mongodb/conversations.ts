import { BSON } from "mongodb";
import clientPromise from "./connect";

type Message = {
  role: "user" | "assistant" | "system";
  text: string;
  id?: string;
  parentMessageId?: string;
};

type Conversation = {
  _id: BSON.ObjectId;
  messages: Message[];
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
  const conversation = {
    _id: new BSON.ObjectId(),
    messages: [],
  };
  await conversations.insertOne(conversation);
  return {
    ...conversation,
    _id: conversation._id.toHexString()
  };
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

export async function addMessageToConversation(
  conversation_id: string,
  message: Message
) {
  const conversations = await getConversationCollection();
  const { value: conversation } = await conversations.findOneAndUpdate(
    { _id: new BSON.ObjectId(conversation_id) },
    { $push: { messages: message } },
    { returnDocument: "after" }
  );
  if (!conversation) {
    throw new Error(`Conversation(${conversation_id}) not found`);
  }
  return {
    ...conversation,
    _id: conversation._id.toHexString(),
  };
}
