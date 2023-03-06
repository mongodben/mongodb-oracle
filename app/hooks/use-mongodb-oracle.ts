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
  askQuestion: (message: string) => void;
  addQuestionToMessages: (message: string) => void;
  addAnswerToMessages: (message: string) => void;
}

// TODO: Replace entire method with something that actually
// hits an endpoint!
async function getAnswer(question: string) {
  const response = await fetch("http://localhost:3000/api/ask");
  const data = await response.json();

  return data.data.answer;
}

const useMongoDBOracle = create<AppState>((set, get) => ({
  messages: [],
  status: "first-load",
  askQuestion: async function (question) {
    set(() => ({
      status: "loading",
    }));
    get().addQuestionToMessages(question);
    const answer = await getAnswer(question);
    get().addAnswerToMessages(answer);
    set(() => ({
      status: "done",
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
