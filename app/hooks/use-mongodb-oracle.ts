import { create } from "zustand";
import type { ClientMessage } from "@/components/message";
import { ObjectId } from "bson";

export interface MessageWithID extends ClientMessage {
  id: string;
}

interface AppState {
  messages: MessageWithID[];
  status: "first-load" | "error" | "loading" | "streaming" | "done";
  conversation_id: string | undefined;
  askQuestion: (message: string, config?: { stream?: boolean }) => void;
  addQuestionToMessages: (question: string) => number;
  addAnswerToMessages: (id: string, answer: string) => number;
  addWarningToMessages: (id: string, message: string) => number;
  updateMessageAtIndex: (
    index: number,
    update: (message: MessageWithID) => MessageWithID
  ) => void;
  getMessageIndex: (message_id: string) => number;
}

type AskParams = {
  conversation_id?: string;
  question: string;
  stream?: boolean;
};

async function ask({ question, conversation_id, stream=false }: AskParams) {
  const response = await fetch(`/api/ask?stream=${stream}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ question, conversation_id }),
  });
  return await response.json();
}

const useMongoDBOracle = create<AppState>((set, get) => ({
  messages: [],
  status: "first-load",
  conversation_id: new ObjectId().toHexString(),
  askQuestion: async function (question, { stream = false } = {}) {
    set(() => ({
      status: "loading",
    }));
    get().addQuestionToMessages(question);
    const { status, data } = await ask({
      question,
      conversation_id: get().conversation_id,
      stream,
    });
    if (status === "error") {
      const { errors } = data;
      if (
        errors[0] ===
        "Question contains content that failed the moderation check."
      ) {
        get().addWarningToMessages(
          new ObjectId().toHexString(),
          "Question contains content that failed the moderation check."
        );
      }
    } else {
      const { message_id, answer } = data;
      if (stream) {
        get().updateMessageAtIndex(
          get().getMessageIndex(message_id),
          (message) => {
            return {
              ...message,
              children: answer,
            };
          }
        );
      } else {
        get().addAnswerToMessages(message_id, answer);
      }
    }
    set(() => ({
      status: "done",
      conversation_id: get().conversation_id,
    }));
  },
  addQuestionToMessages: function (question) {
    let messageIndex = get().messages.length;
    set((state) => {
      return {
        messages: [
          ...state.messages,
          {
            id: new ObjectId().toHexString(),
            type: "user",
            children: question,
          },
        ],
      };
    });
    return messageIndex;
  },
  addAnswerToMessages: function (id, answer) {
    let messageIndex = get().messages.length;
    set((state) => {
      return {
        messages: [
          ...state.messages,
          {
            id,
            type: "oracle",
            children: answer,
          },
        ],
      };
    });
    return messageIndex;
  },
  addWarningToMessages: function (id, message) {
    let messageIndex = get().messages.length;
    set((state) => {
      return {
        messages: [
          ...state.messages,
          {
            id,
            type: "system",
            children: message,
            status: "error",
          },
        ],
      };
    });
    return messageIndex;
  },
  updateMessageAtIndex: function (
    index: number,
    update: (message: MessageWithID) => MessageWithID
  ) {
    set((state) => {
      const messages = [...state.messages];
      messages[index] = update(messages[index]);
      return {
        status: "streaming",
        messages,
      };
    });
  },
  getMessageIndex: function (message_id: string) {
    const messages = get().messages;
    return messages.findIndex((message) => {
      return message.id === message_id;
    });
  },
}));

export default useMongoDBOracle;
