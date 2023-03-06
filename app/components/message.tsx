import { Disclaimer } from "@leafygreen-ui/typography";

export interface Message {
  type: "user" | "oracle";
  children: string;
}

function OracleMessage({ children }: { children: Message["children"] }) {
  return (
    <li className="pr-20">
      <div className="bg-white border-lg-gray-dark1 border-2 px-2 py-3">
        {children}
      </div>
      <div className="bg-lg-gray-dark1 px-2 py-1 rounded-b">
        <Disclaimer className="text-lg-gray-light3">
          Warning: Not all answers are correct!
        </Disclaimer>
      </div>
    </li>
  );
}

function UserMessage({ children }: { children: Message["children"] }) {
  return (
    <li className="pl-20">
      <div className="bg-white border-lg-green-dark1 border-2 px-2 py-3 rounded-2xl rounded-tr-none">
        {children}
      </div>
    </li>
  );
}

export default function Message({ type, children }: Message) {
  switch (type) {
    case "oracle":
      return <OracleMessage>{children}</OracleMessage>;
    case "user":
      return <UserMessage>{children}</UserMessage>;
  }
}
