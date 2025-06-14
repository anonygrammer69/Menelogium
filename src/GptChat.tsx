import React, { useState } from "react";
import { askGpt4 } from "./openai.ts";

const GptChat: React.FC = () => {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAsk = async () => {
    setLoading(true);
    setResponse("");
    try {
      const result = await askGpt4(input);
      setResponse(result);
    } catch (e) {
      setResponse("Error contacting GPT-4.");
    }
    setLoading(false);
  };

  return (
    <div className="my-4 bg-gray-300 rounded-xl border-2 border-black">
      <input
        className="border-2 border-black p-2 rounded w-full"
        value={input}
        onChange={e => setInput(e.target.value)}
        placeholder="Chat with Llama"
      />
      <button
        className="my-4 px-3 py-1 bg-blue-500 text-black rounded"
        onClick={handleAsk}
        disabled={loading}
      >
        {loading ? "Thinking..." : "Ask GPT-4"}
      </button>
      {response && <div className="mt-2 p-2 bg-gray-100 rounded">{response}</div>}
    </div>
  );
};

export default GptChat;