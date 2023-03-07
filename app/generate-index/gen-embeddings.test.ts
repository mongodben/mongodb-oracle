import axios from "axios";
import { chunkPage, createEmbedding } from "./gen-embeddings";
import { snootyHtmlToText } from "./gen-site-data";
import { MAX_TOKENS } from "./gen-index";
import GPT3Tokenizer from "gpt3-tokenizer";

const tokenizer = new GPT3Tokenizer({ type: "gpt3" });

test("chunk page with less than MAX_TOKENS tokens", async () => {
  const TEST_PAGE =
    "https://www.mongodb.com/docs/drivers/node/current/fundamentals/aggregation/";
  const { data } = await axios.get(TEST_PAGE);
  const pageText = snootyHtmlToText(data);
  const { bpe } = tokenizer.encode(pageText);
  const chunks = chunkPage({ textPage: pageText, url: "foo" }, MAX_TOKENS);
  console.log("PAGE TEXT::\n\n", pageText);
  console.log("CHUNK TEXT::\n\n", chunks[0].text);

  expect(chunks.length).toBe(1);
  // note: i think it's >= vs === b/c it's removing some line breaks which count as tokens?
  expect(bpe.length).toBeGreaterThanOrEqual(chunks[0].numTokens!);
});

test("chunk page with greater than MAX_TOKENS tokens", async () => {
  const TEST_PAGE =
    "https://www.mongodb.com/docs/atlas/app-services/introduction/";
  const { data } = await axios.get(TEST_PAGE);
  const pageText = snootyHtmlToText(data);
  const { bpe } = tokenizer.encode(pageText);
  const chunks = chunkPage({ textPage: pageText, url: "foo" }, MAX_TOKENS);
  console.log("PAGE TEXT::\n\n", pageText);
  console.log("CHUNK TEXT::\n\n", chunks[0].text);

  expect(chunks.length).toBe(3);
  // note: i think it's >= vs === b/c it's removing some line breaks which count as tokens?
  expect(bpe.length).toBeGreaterThanOrEqual(chunks[0].numTokens!);
});
