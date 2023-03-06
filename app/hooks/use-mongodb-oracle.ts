import { create } from "zustand";
import type { Message } from "@/components/message";

interface AppState {
  messages: Message[];
  addNewMessage: (message: string) => void;
}

const useMongoDBOracle = create<AppState>((set) => ({
  messages: [
    { type: "user", children: "Hello world, message 1" },
    { type: "oracle", children: "Hello world, message 2" },
  ],
  addNewMessage: () =>
    set((state) => ({
      messages: [
        ...state.messages,
        { type: "user", children: "Hello world!!!" },
      ],
    })),
}));

export default useMongoDBOracle;
