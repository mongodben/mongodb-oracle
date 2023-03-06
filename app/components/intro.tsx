import { H2, Body } from "@leafygreen-ui/typography";

export default function Intro() {
  return (
    <div class="flex items-center gap-4">
      <div className="text-[60px] md:text-[150px] text-center">🧙</div>
      <div>
        <H2 className="text-[20px] md:text-[32px]" as="h1">
          Hey there! I'm the Oracle!
        </H2>
        <Body className="text-[16px] mt-2">
          I'm a MongoDB Atlas Wizard. I've spent eons pouring over the
          documentation. Ask me how to do anything in Atlas - I'll do my best to
          help you on your quest.
        </Body>
      </div>
    </div>
  );
}
