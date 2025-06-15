import axios from "axios";

export async function askGpt4(prompt: string) {
  const response = await axios.post("https://pumped-sincerely-coyote.ngrok-free.app/webhook/groq-prompt", { prompt });
  return response.data.result;
}