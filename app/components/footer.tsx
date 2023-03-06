import { useRef } from "react";
import TextArea from "@leafygreen-ui/text-area";
import Play from "@leafygreen-ui/icon/dist/Play";
import Button from "@leafygreen-ui/button";
import { CONTAINER } from "@/styles/constants";

function useForm() {
  const ref = useRef<null | HTMLFormElement>(null);

  function resetForm() {
    if (ref.current === null) return;

    ref.current.elements.question.value = "";
  }

  async function submitQuestion() {
    if (ref.current === null) return;

    const res = await fetch(`${process.env.API_URL}/ask`);
    const posts = await res.json();
    console.log(posts);
  }

  return { ref, resetForm };
}

export default function Footer() {
  const { ref, resetForm } = useForm();

  return (
    <footer className={`${CONTAINER}`}>
      <form
        ref={ref}
        onSubmit={(event) => {
          event.preventDefault();
          resetForm();
        }}
      >
        <div className="relative">
          <TextArea
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
