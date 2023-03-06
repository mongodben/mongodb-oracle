import { LoremIpsum } from "lorem-ipsum";
import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
  status: "success" | "fail" | "error";
  data: {
    answer: string;
  };
};

const lorem = new LoremIpsum({
  sentencesPerParagraph: {
    max: 8,
    min: 4,
  },
  wordsPerSentence: {
    max: 16,
    min: 4,
  },
});

function randomWaitTime() {
  return Math.floor(Math.random() * (4_000 - 500) + 500); // The maximum is exclusive and the minimum is inclusive
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const waitTime = randomWaitTime();
  setTimeout(() => {
    res.status(200).json({
      status: "success",
      data: {
        answer: lorem.generateSentences(),
      },
    });
  }, waitTime);
}
