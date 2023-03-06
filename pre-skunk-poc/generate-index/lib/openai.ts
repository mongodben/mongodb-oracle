import { Configuration, OpenAIApi } from "openai";
import * as dotenv from "dotenv";
dotenv.config();
const { OPENAI_API_KEY } = process.env;

const openai = new OpenAIApi(new Configuration({ apiKey: OPENAI_API_KEY }));

export { openai };
