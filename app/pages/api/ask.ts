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
      SOURCE_URL: ${source}
      CONTENT: ${content.trim().replace(/\n/g, "  ")}
      ---
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
  return { context, pageChunks };
}

async function getPageResults(question: string): Promise<PageChunk[]> {
  const embedding = await createEmbedding(question);
  const pageChunks = await searchPages(embedding);
  const uniqueChunks = Object.fromEntries(
    pageChunks.map((chunk) => [chunk.url, chunk])
  );
  return Object.values(uniqueChunks);
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
  const shouldUseLlm = req.query.withLlm === "true";
  const shouldStream =
    shouldUseLlm && USE_STREAMING && req.query.stream === "true";
  const { conversation_id, question } = RequestBody.parse(req.body);

  try {
    const moderationResults = await moderate(question);
    if (moderationResults.flagged) {
      res.status(400).json(
        error({
          errors: [
            "Question contains content that failed the moderation check.",
          ],
        })
      );
      return;
    }
    let conversation = conversation_id
      ? await getConversation(conversation_id)
      : await createConversation();

    if (!shouldUseLlm) {
      console.log("skipping llm generation. just getting page results");
      const pageResults = await getPageResults(question);
      const answer =
        pageResults.length === 0
          ? "I could not find a good match for that question."
          : "Pages that match your question:\n\n" +
            pageResults
              .map(
                ({ url, score }) => `- [${url}](${url}) (${score.toFixed(4)})`
              )
              .join("\n");
      res.status(200).json(
        success({
          conversation_id: conversation._id,
          message_id: new BSON.ObjectId().toHexString(),
          answer,
        })
      );
      return;
    }
    console.log("continuing on w llm generation");
    const { context } = await createContext(question);

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
      stripIndent`
      Different pieces of context are separated by "---".
      CONTEXT:
      ${context}

      QUESTION:
      """
      ${question}
      """

      Include a list of "SOURCES" at the bottom of the response.
      Only use links in the SOURCE_URLs from the conversation.
      Only include the SOURCE_URL if the CONTENT next to it is used in the answer.
      Format the links as Markdown links, such as [https://example.com](https://example.com).
      ONLY include links in context information provided in this conversation section.
      NEVER use a link not present in the CONTEXT information.
      NEVER use a link that is not provided in the chat. NEVER make up a link.
    `,
      {
        parentMessageId: parentMessage?.id,
        onProgress: !shouldStream
          ? undefined
          : ({ id: message_id, text }) => {
              streamAnswer({
                conversation_id: conversation._id,
                message_id,
                text: text,
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
        answer: responseMessage.text,
        conversation_id: conversation._id,
        message_id: responseMessage.id,
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
