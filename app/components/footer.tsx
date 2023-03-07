import { useRef, FormEvent, useState } from "react";
import TextArea from "@leafygreen-ui/text-area";
// @ts-ignore
import * as Play from "@leafygreen-ui/icon/dist/Play";
import Button from "@leafygreen-ui/button";
import { CONTAINER } from "@/styles/constants";
import useMongoDBOracle from "@/hooks/use-mongodb-oracle";

export default function Footer() {
  const askQuestion = useMongoDBOracle((state) => state.askQuestion);
  const [inputValue, setInputValue] = useState("");

  return (
    <footer className={`${CONTAINER} mb-4 md:mb-8 mt-auto`}>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          const question = inputValue;
          setInputValue("");
          askQuestion(question);
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
    </footer>
  );
}
