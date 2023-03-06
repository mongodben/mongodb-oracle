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
  askQuestion: (message: string) => void;
  addQuestionToMessages: (message: string) => void;
  getAnswerFromOracle: (message: string) => void;
}

function getAnswer(question: string) {
  return "Hello world I am the oracle!!!";
}

const useMongoDBOracle = create<AppState>((set, get) => ({
  messages: [
    {
      id: createFakeID(),
      type: "user",
      children: "Hello world, message 1",
    },
    {
      id: createFakeID(),
      type: "oracle",
      children: "Hello world, message 2",
    },
  ],
  askQuestion: function (question) {
    get().addQuestionToMessages(question);
    get().getAnswerFromOracle(question);
  },
  addQuestionToMessages: function (question) {
    set((state) => ({
      messages: [
        ...state.messages,
        { id: createFakeID(), type: "user", children: question },
      ],
    }));
  },
  getAnswerFromOracle: function (question) {
    const answer = getAnswer(question);

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
