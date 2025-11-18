import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();

if (!process.env.OPENAI_API_KEY) {
  console.warn("⚠️ No OpenAI API key found. Set OPENAI_API_KEY in .env");
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function llm(prompt: string) {
  const res = await openai.chat.completions.create({
    model: "gpt-4o-mini", // best balance of cost + accuracy
    messages: [{ role: "user", content: prompt }],
    temperature: 0.1,
  });

  return res.choices[0].message.content;
}
