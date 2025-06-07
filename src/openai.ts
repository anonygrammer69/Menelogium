import axios from "axios";

export async function askGpt4(prompt: string) {
  const response = await axios.post("https://menelogium.vercel.app/api/gpt4", { prompt });
  return response.data.result;
}