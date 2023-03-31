import { useState, useRef } from "react";
import TextArea from "@leafygreen-ui/text-area";
// @ts-ignore
import * as Play from "@leafygreen-ui/icon/dist/Play";
import Link from "next/link";
import Button from "@leafygreen-ui/button";
import { CONTAINER } from "@/styles/constants";
import useMongoDBOracle from "@/hooks/use-mongodb-oracle";

const ENTER_KEY = "Enter";

const USE_STREAMING =
  process.env.NEXT_PUBLIC_USE_STREAMING === "true" ? true : false;

console.log(USE_STREAMING);

export default function Footer() {
  const askQuestion = useMongoDBOracle((state) => state.askQuestion);
  const [inputValue, setInputValue] = useState("");

  const handleFormSubmit = () => {
    if (!inputValue.trim().length) return;
    const question = inputValue;
    setInputValue("");
    askQuestion(question, { stream: USE_STREAMING });
  };

  return (
    <footer className={`${CONTAINER} mb-4 md:mb-8 mt-4`}>
      <form
        id="question-form"
        onSubmit={(event) => {
          event.preventDefault();
          handleFormSubmit();
        }}
      >
        <div className="relative">
          <TextArea
            onChange={(event) => setInputValue(event.target.value)}
            value={inputValue}
            className="[&>textarea]:pr-16"
            label="Ask me anything!"
            placeholder="Why should I use MongoDB Atlas?"
            baseFontSize={16}
            rows={4}
            name="question"
            onKeyDown={(event) => {
              if (event.key === ENTER_KEY) {
                event.preventDefault();
                handleFormSubmit();
              }
            }}
          />
          <Button
            className="bg-lg-green-dark2 rounded-full absolute top-9 right-3 overflow-hidden w-12 h-12"
            rightGlyph={<Play />}
            size="large"
            type="submit"
            variant="primary"
          />
        </div>
      </form>
      <p>
        <span className="underline text-blue-500 border-blue-500">
          <Link href="https://github.com/mongodben/mongodb-oracle">
            Github Repo
          </Link>
        </span>
      </p>
    </footer>
  );
}
