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
}

const useMongoDBOracle = create<AppState>((set) => ({
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
  askQuestion: function (message) {
    set((state) => ({
      messages: [
        ...state.messages,
        { id: createFakeID(), type: "user", children: message },
      ],
    }));
  },
}));

export default useMongoDBOracle;
