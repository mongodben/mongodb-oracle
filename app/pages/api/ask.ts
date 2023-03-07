// TypeScript/Next.js server routes with endpoint to respond to natural language user queries in natural language response with accurate data from the indexed site. Format answers in Markdown with links to relevant content on the site.
import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { stripIndent, codeBlock } from "common-tags";
import { ChatGPT, createEmbedding } from "@/openai-client";
import { searchPages } from "@/mongodb/pages";
import GPT3Tokenizer from "gpt3-tokenizer";

type Data = Success | Fail | Error;

type Success = {
  status: "success";
  data: ResponseData;
};

type Fail = {
  status: "fail";
  // Query embeddings for site data with Atlas Search $knnBeta operator
  data: object;
};

type Error = {
  status: "error";
  data: {
    errors: (string | object)[];
  };
};

function success(data: Success["data"]): Success {
  return { status: "success", data };
}

function fail(data: Fail["data"]): Fail {
  return { status: "fail", data };
}

function error(data: Error["data"]): Error {
  return { status: "error", data };
}

type RequestBody = z.infer<typeof RequestBody>;
const RequestBody = z.object({
  // conversation_id: z.string().optional(),
  question: z.string(),
});

type ResponseData = z.infer<typeof ResponseData>;
const ResponseData = z.object({
  // conversation_id: z.string(),
  answer: z.string(),
});

const MAX_TOKENS = 1500;
async function createContext(question: string) {
  const embedding = await createEmbedding(question);
  const pageChunks = await searchPages(embedding);

  const tokenizer = new GPT3Tokenizer({ type: "gpt3" });
  let tokenCount = 0;
  let contextLines: string[] = [];
  function formatContextLine(content: string, source: string) {
    return stripIndent`
      - SOURCE: ${source}
        CONTENT: ${content.trim().replace(/\n/g, "  ")}
    `;
  }
  for (let i = 0; i < pageChunks.length; i++) {
    const chunk = pageChunks[i];
    const { text, url } = chunk; // TODO
    const encoded = tokenizer.encode(text);
    tokenCount += encoded.text.length;

    // Limit context to max 1500 tokens (configurable)
    if (tokenCount > MAX_TOKENS) {
      break;
    }

    contextLines.push(formatContextLine(text, url));
  }
  const context = contextLines.join("\n");
  return context;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== "POST") {
    res.status(405).json(error({ errors: ["Method not allowed"] }));
    return;
  }

  try {
    // const { conversation_id, message } = RequestBody.parse(req.body);
    // const conversation = conversation_id
    //   ? await getConversation(conversation_id)
    //   : await createConversation();

    const { question } = RequestBody.parse(req.body);
    const context = await createContext(question);
    const gptRes = await ChatGPT.sendMessage(codeBlock`
      CONTEXT:
      ${context}
      QUESTION:
      ${question}
    `);

    // const gptFollowup = await ChatGPT.sendMessage(
    //   stripIndent`
    //     Context:
    //     Question:
    //       Can you explain that as if I were a 5 year old?
    //   `,
    //   {
    //     parentMessageId: gptRes.id,
    //   }
    // );
    // Use LLM AI to summarize results from query.

    res.status(200).json(
      success({
        // conversation_id: conversation_id ?? "todo",
        answer: gptRes.text,
      })
    );
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      const e = error({ errors: err.issues });
      console.error(e);
      res.status(400).json(e);
    } else {
      res.status(400).json(error({ errors: [err as object] }));
    }
  }
}
