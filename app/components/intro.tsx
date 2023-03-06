import { H2, Body } from "@leafygreen-ui/typography";

export default function Intro() {
  return (
    <div class="grid grid-cols-[200px,1fr] items-center">
      <div className="text-[150px] text-center">🧙</div>
      <div>
        <H2 as="h1">Hey there! I'm the Oracle!</H2>
        <Body className="text-[16px] mt-2">
          I'm a MongoDB Atlas Wizard. I've spent eons pouring over the
          documentation. Ask me how to do anything in Atlas - I'll do my best to
          help you on your quest.
        </Body>
      </div>
    </div>
  );
}
