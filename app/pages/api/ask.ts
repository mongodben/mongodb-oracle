import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
  answer: string;
};

function randomWaitTime() {
  return Math.floor(Math.random() * (4_000 - 500) + 500); // The maximum is exclusive and the minimum is inclusive
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  setTimeout(() => {
    res.status(200).json({
      answer: "I am the oracle! This is coming from the NextJS API route",
    });
  }, randomWaitTime());
}
