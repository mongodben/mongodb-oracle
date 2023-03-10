import { useState } from "react";
import { motion } from "framer-motion";
import { Disclaimer } from "@leafygreen-ui/typography";
import ReactMarkdown from "react-markdown";
import IconButton from "@leafygreen-ui/icon-button";
import Icon from "@leafygreen-ui/icon";
import Tooltip from "@leafygreen-ui/tooltip";
import useMongoDBOracle from "@/hooks/use-mongodb-oracle";

export interface ClientMessage {
  type: "user" | "oracle" | "system";
  children: string;
  level?: "info" | "warn" | "error";
}

function OracleMessage({ children }: { children: ClientMessage["children"] }) {
  const [userResponse, setUserResponse] = useState<"good" | "bad" | null>(null);
  const status = useMongoDBOracle((state) => state.status);

  return (
    <motion.li
      initial={{ y: 15, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="border-lg-gray-dark1 border-2 bg-white"
    >
      <ReactMarkdown className="prose bg-white px-2 py-3 overflow-x-scroll">
        {children}
      </ReactMarkdown>
      {status === "done" && (
        <div className="px-2 pb-3 flex items-center prose">
          {userResponse !== null && (
            <span className="text-sm">Answer recorded! Thank you!</span>
          )}
          {userResponse === null && (
            <>
              <span className="text-sm mr-2">Answer Quality:</span>
              <Tooltip
                trigger={
                  // @ts-ignore
                  <IconButton
                    disabled={userResponse === "bad"}
                    onClick={() => {
                      setUserResponse("good");
                    }}
                  >
                    <Icon glyph="ArrowUp" />
                  </IconButton>
                }
              >
                The provided answer was useful/valuable to me.
              </Tooltip>
              <Tooltip
                trigger={
                  // @ts-ignore
                  <IconButton
                    disabled={userResponse === "good"}
                    onClick={() => {
                      setUserResponse("bad");
                    }}
                  >
                    <Icon glyph="ArrowDown" />
                  </IconButton>
                }
              >
                The provided answer was not useful/valuable to me.
              </Tooltip>
            </>
          )}
        </div>
      )}
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
      <ReactMarkdown className="bg-white border-lg-green-dark1 border-2 px-2 py-3 rounded-2xl rounded-tr-none overflow-x-scroll">
        {children}
      </ReactMarkdown>
    </motion.li>
  );
}

function SystemMessage({
  level,
  children,
}: {
  level: NonNullable<ClientMessage["level"]>;
  children: ClientMessage["children"];
}) {
  const [bgColor, borderColor] = {
    info: ["lg-blue-light2", "lg-blue-base"],
    warn: ["lg-yellow-light2", "lg-yellow-base"],
    error: ["lg-red-light2", "lg-red-base"],
  }[level];

  const className = `bg-${bgColor} border-${borderColor} border-2 px-2 py-3 overflow-x-scroll`;
  return (
    <motion.li initial={{ y: 15, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
      <ReactMarkdown className={className}>{children}</ReactMarkdown>
    </motion.li>
  );
}

export default function Message({
  type,
  children,
  level = "info",
}: ClientMessage) {
  switch (type) {
    case "oracle":
      return <OracleMessage>{children}</OracleMessage>;
    case "user":
      return <UserMessage>{children}</UserMessage>;
    case "system":
      return <SystemMessage level={level}>{children}</SystemMessage>;
  }
}
