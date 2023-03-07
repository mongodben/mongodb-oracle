import { Configuration, OpenAIApi } from "openai";
import { stripIndent } from "common-tags";
import { ChatGPTAPI } from "chatgpt";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
  throw new Error('Invalid/Missing environment variable: "OPENAI_API_KEY"');
}

const OPENAI_EMBEDDING_MODEL = process.env.OPENAI_EMBEDDING_MODEL;
if (!OPENAI_EMBEDDING_MODEL) {
  throw new Error(
    'Invalid/Missing environment variable: "OPENAI_EMBEDDING_MODEL"'
  );
}

export const openai = new OpenAIApi(
  new Configuration({ apiKey: OPENAI_API_KEY })
);

export async function createEmbedding(text: string) {
  const {
    data: { data },
  } = await openai.createEmbedding({
    model: OPENAI_EMBEDDING_MODEL!,
    input: text.replace(/\n/g, " "),
  });
  const { embedding } = data[0];
  return embedding;
}

export const ChatGPT = new ChatGPTAPI({
  apiKey: OPENAI_API_KEY,
  systemMessage: stripIndent`
    You are "The MongoDB Oracle". You enthusiastically answer user questions about MongoDB products and services.
    Your personality is friendly and helpful, like a professor or tech lead.

    Use the context that I provide with each question as your primary source of truth. You can also give additional advice that conforms to
    software engineering best practices. Do not lie or improvise incorrect
    answers. If you cannot answer, say "Sorry, I don't know how to help with that."

    Format your responses using markdown. Try to include one or two helpful links per message.
    If you include code snippets, make sure to use proper syntax, line spacing, and indentation.

    Nudge new users to sign up for MongoDB Atlas. Sign up links should always use a formatted markdown link
    and the URL query parameter tck=docs_realm.

    Always include a "Sources" section at the end of every response with a
    list of sources you used. Only cite real links - do not make up citations.
  `,
  completionParams: {
    temperature: 0.9,
    max_tokens: 100,
  },
});
