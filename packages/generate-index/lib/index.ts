import GPT3Tokenizer from "gpt3-tokenizer";
import { Configuration, OpenAIApi } from "openai";
import { stripIndent, oneLine } from "common-tags";
import createPrompt from "prompt-sync";
import { mongodbClient } from "./mongodb";
import { IndexedDocument } from "./types"; // TODO: make this automatic
import * as dotenv from "dotenv";
dotenv.config();

const MAX_TOKENS = 1500;
const { OPENAI_API_KEY, OPENAI_EMBEDDING_MODEL } = process.env;

async function runQuery() {
  const userPrompt = createPrompt();
  const query = userPrompt(
    "What do you want to learn about Atlas App Services?"
  );
  // OpenAI recommends replacing newlines with spaces for best results
  const input = query.replace(/\n/g, " ");

  const openai = new OpenAIApi(new Configuration({ apiKey: OPENAI_API_KEY }));

  // Generate a one-time embedding for the query itself
  const embeddingResponse = await openai.createEmbedding({
    model: OPENAI_EMBEDDING_MODEL as string,
    input,
  });
  const [{ embedding }] = embeddingResponse.data.data;

  // Fetching whole documents for this simple example.
  //
  // Ideally for context injection, documents are chunked into
  // smaller sections at earlier pre-processing/embedding step.
  // TODO: replace w mongodb stuff. right now just janky stubbed out
  const documents = await mongodbClient
    .db("docs")
    .collection("app-services")
    .aggregate<IndexedDocument>([
      {
        $search: {
          // index: "<index name>", // optional, defaults to "default"
          knnBeta: {
            vector: embedding,
            path: "embedding",
            // "filter": {<filter-specification>},
            k: 10,
            // "score": {<options>} NOTE: not sure what this is
          },
        },
      },
    ])
    .toArray();

  const tokenizer = new GPT3Tokenizer({ type: "gpt3" });
  let tokenCount = 0;
  let contextText = "";

  // TODO: see if can do something cute to include links in here
  // Concat matched documents
  for (let i = 0; i < documents.length; i++) {
    const document = documents[i];
    const content = document.text;
    const encoded = tokenizer.encode(content);
    tokenCount += encoded.text.length;

    // Limit context to max 1500 tokens (configurable)
    if (tokenCount > MAX_TOKENS) {
      break;
    }

    contextText += `${content.trim()}\n---\n`;
  }

  const prompt = stripIndent`${oneLine`
    You are a very enthusiastic MongoDB representative who loves
    to help people! Given the following sections from the MongoDB
    documentation, answer the question using only that information,
    outputted in markdown format. If you are unsure and the answer
    is not explicitly written in the documentation, say
    "Sorry, I don't know how to help with that."`}

    Context sections:
    ${contextText}

    Question: """
    ${query}
    """

    Answer as markdown (including related code snippets if available):
  `;

  const completionResponse = await openai.createCompletion({
    model: "text-davinci-003",
    prompt,
    max_tokens: 512, // Max allowed tokens in completion
    temperature: 0, // Set to 0 for deterministic results
  });
  const {
    choices: [{ text }],
  } = completionResponse.data;

  console.log(stripIndent`The answer to your question is:

  ${text}`);
}

runQuery();
