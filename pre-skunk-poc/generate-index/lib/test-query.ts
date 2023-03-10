import GPT3Tokenizer from "gpt3-tokenizer";
import { Configuration, OpenAIApi } from "openai";
import { stripIndent, oneLine } from "common-tags";
import createPrompt from "prompt-sync";
import { mongodbClient } from "./mongodb";
import { IndexedDocument } from "./types"; // TODO: make this automatic
import * as dotenv from "dotenv";
import { ContentDbEntry } from "./types";
dotenv.config();

const MAX_TOKENS = 1500;
const { OPENAI_API_KEY, OPENAI_EMBEDDING_QUERY_MODEL } = process.env;

async function runQuery(query: string) {
  const input = query.replace(/\n/g, " ");
  const openai = new OpenAIApi(new Configuration({ apiKey: OPENAI_API_KEY }));

  // Generate a one-time embedding for the query itself
  const embeddingResponse = await openai.createEmbedding({
    model: OPENAI_EMBEDDING_QUERY_MODEL as string,
    input,
  });
  const [{ embedding }] = embeddingResponse.data.data;

  // Fetching whole documents for this simple example.
  //
  // Ideally for context injection, documents are chunked into
  // smaller sections at earlier pre-processing/embedding step.
  // TODO: replace w mongodb stuff. right now just janky stubbed out
  const documents = await mongodbClient
    .db("mongodb-oracle")
    .collection("page-data")
    .aggregate<ContentDbEntry>([
      {
        $search: {
          // index: "knn",
          knnBeta: {
            vector: embedding,
            path: "embedding",
            // "filter": {<filter-specification>},
            k: 3,
            // "score": {<options>} NOTE: not sure what this is
          },
        },
      },
    ])
    .toArray();

  const tokenizer = new GPT3Tokenizer({ type: "gpt3" });
  let tokenCount = 0;
  let contextText = "";

  // Concat matched documents
  for (let i = 0; i < documents.length; i++) {
    const document = documents[i];
    const { text, url } = document; // TODO
    const encoded = tokenizer.encode(text);
    tokenCount += encoded.text.length;

    // Limit context to max 1500 tokens (configurable)
    if (tokenCount > MAX_TOKENS) {
      break;
    }

    contextText += `CONTENT: ${text.trim()}\nSOURCE: ${url}\n---\n`;
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

    ${oneLine`Answer as markdown including related code snippets if available and relevant.
    Format the code examples using proper line spacing and indentation.
    ALWAYS return a "SOURCES" part in your answer.`}
  `;
  const completionResponse = await openai.createChatCompletion({
    model: "gpt-3.5-turbo-0301",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 750, // Max allowed tokens in completion
    temperature: 0, // Set to 0 for deterministic results
  });
  const {
    choices: [{ message }],
  } = completionResponse.data;

  const text = message?.content || "The question could not be answered :(";

  console.log(
    stripIndent`The answer to your question is:

  ${text}` + "\n\n"
  );
}

async function run() {
  let continueSession = true;
  while (continueSession === true) {
    const userPrompt = createPrompt();
    const query = userPrompt("What do you want to learn about MongoDB: ");
    // OpenAI recommends replacing newlines with spaces for best results

    await runQuery(query);
    const toContinue = userPrompt(
      "Do you want to ask more questions? (*/n): "
    ).trim();
    if (toContinue === "n") {
      continueSession = false;
    } else {
      console.log("\n");
    }
  }
  process.exit(0);
}
run();
