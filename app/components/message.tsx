import { motion } from "framer-motion";
import { Disclaimer } from "@leafygreen-ui/typography";

export interface ClientMessage {
  type: "user" | "oracle";
  children: string;
}

function OracleMessage({ children }: { children: ClientMessage["children"] }) {
  return (
    <motion.li
      initial={{ y: 15, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="pr-20"
    >
      <div className="bg-white border-lg-gray-dark1 border-2 px-2 py-3">
        {children}
      </div>
      <div className="bg-lg-gray-dark1 px-2 py-1">
        <Disclaimer className="text-lg-gray-light3">
          Warning: Not all answers are correct!
        </Disclaimer>
      </div>
    </motion.li>
  );
}

function UserMessage({ children }: { children: ClientMessage["children"] }) {
  return (
    <motion.li
      initial={{ y: 15, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="pl-20"
    >
      <div className="bg-white border-lg-green-dark1 border-2 px-2 py-3 rounded-2xl rounded-tr-none">
        {children}
      </div>
    </motion.li>
  );
}

export default function Message({ type, children }: ClientMessage) {
  switch (type) {
    case "oracle":
      return <OracleMessage>{children}</OracleMessage>;
    case "user":
      return <UserMessage>{children}</UserMessage>;
  }
}
