// TypeScript/Next.js server routes with endpoint to respond to natural language user queries in natural language response with accurate data from the indexed site. Format answers in Markdown with links to relevant content on the site.
import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { stripIndent, codeBlock } from "common-tags";
import { ChatGPT, createEmbedding, moderate } from "@/openai-client";
import { searchPages } from "@/mongodb/pages";
import { BSON } from "mongodb";
import {
  ServerMessage,
  getConversation,
  createConversation,
  addMessageToConversation,
} from "@/mongodb/conversations";
import GPT3Tokenizer from "gpt3-tokenizer";
import util from "util";
import findLast from "lodash.findlast";
import { streamAnswer } from "@/pusher/server";

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
  conversation_id: z.string().optional(),
  question: z.string(),
});

type ResponseData = z.infer<typeof ResponseData>;
const ResponseData = z.object({
  conversation_id: z.string(),
  message_id: z.string(),
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

const USE_STREAMING =
  process.env.NEXT_PUBLIC_USE_STREAMING === "true" ? true : false;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== "POST") {
    res.status(405).json(error({ errors: ["Method not allowed"] }));
    return;
  }

  const shouldStream = USE_STREAMING && Boolean(req.query.stream);

  try {
    const { conversation_id, question } = RequestBody.parse(req.body);
    const moderationResults = await moderate(question);
    if (moderationResults.flagged) {
      res.status(400).json(
        error({
          errors: ["Question contains content that failed the moderation check."],
        })
      );
      return;
    }
    const context = await createContext(question);

    let conversation = conversation_id
      ? await getConversation(conversation_id)
      : await createConversation();

    const questionMessage = {
      id: new BSON.ObjectId().toHexString(),
      role: "user",
      text: question,
    } as ServerMessage;

    conversation = await addMessageToConversation(
      conversation._id,
      questionMessage
    );

    const parentMessage = findLast(conversation.messages, (message) => {
      return message.role === "assistant";
    });

    const gptResponse = await ChatGPT.sendMessage(
      codeBlock`
      CONTEXT:
      ${context}
      QUESTION:
      ${question}
    `,
      {
        parentMessageId: parentMessage?.id,
        onProgress: !shouldStream ? undefined : ({ id: message_id, text }) => {
          streamAnswer({
            conversation_id: conversation._id,
            message_id,
            text,
          });
        },
      }
    );
    const { detail, ...responseMessage } = gptResponse;

    conversation = await addMessageToConversation(
      conversation._id,
      gptResponse
    );

    res.status(200).json(
      success({
        conversation_id: conversation._id,
        message_id: responseMessage.id,
        answer: responseMessage.text,
      })
    );
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      const e = error({ errors: err.issues });
      console.error(util.inspect(e, false, 4));
      res.status(400).json(e);
    } else {
      res.status(400).json(error({ errors: [err as object] }));
    }
  }
}
