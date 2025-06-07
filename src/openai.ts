import axios from "axios";

export async function askGpt4(prompt: string) {
  const response = await axios.post("https://vercel.com/lohit-ts-projects/menelogium/D5cxGrd1LMMxXSuVxqpt9uGwzrkH/api/gpt4", { prompt });
  return response.data.result;
}