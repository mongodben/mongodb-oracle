import { create } from "zustand";
import type { Message } from "@/components/message";

interface MessageWithID extends Message {
  id: string;
}

function createFakeID() {
  return (Math.random() + 1).toString(36).substring(7);
}

interface AppState {
  messages: MessageWithID[];
  status: "first-load" | "error" | "loading" | "done";
  conversation_id: string | undefined;
  askQuestion: (message: string) => void;
  addQuestionToMessages: (message: string) => void;
  addAnswerToMessages: (message: string) => void;
}

type AskParams = {
  conversation_id?: string;
  question: string;
};
async function ask({ question, conversation_id }: AskParams) {
  const response = await fetch("/api/ask", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ question, conversation_id }),
  });
  const { status, data } = await response.json();
  return data;
}

const useMongoDBOracle = create<AppState>((set, get) => ({
  messages: [],
  status: "first-load",
  conversation_id: undefined,
  askQuestion: async function (question) {
    set(() => ({
      status: "loading",
    }));
    get().addQuestionToMessages(question);
    const { conversation_id, answer } = await ask({
      question,
      conversation_id: get().conversation_id,
    });
    get().addAnswerToMessages(answer);
    set(() => ({
      status: "done",
      conversation_id,
    }));
  },
  addQuestionToMessages: function (question) {
    set((state) => ({
      messages: [
        ...state.messages,
        { id: createFakeID(), type: "user", children: question },
      ],
    }));
  },
  addAnswerToMessages: async function (answer) {
    set((state) => ({
      messages: [
        ...state.messages,
        {
          id: createFakeID(),
          type: "oracle",
          children: answer,
        },
      ],
    }));
  },
}));

export default useMongoDBOracle;
