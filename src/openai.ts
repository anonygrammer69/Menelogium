import axios from "axios";

export async function askGpt4(prompt: string) {
  const response = await axios.post("https://pumped-sincerely-coyote.ngrok-free.app/webhook/cc789ba7-ca2e-4876-90ee-7b8a9afeea9c/gpt4", { prompt });
  return response.data.result;
}