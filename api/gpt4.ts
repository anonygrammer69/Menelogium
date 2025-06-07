import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from "axios";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { prompt } = req.body;
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 256,
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    res.status(200).json({ result: response.data.choices[0].message.content.trim() });
  } catch (err: any) {
    res.status(500).json({ error: err?.response?.data?.error?.message || err.message || "OpenAI request failed" });
  }
}