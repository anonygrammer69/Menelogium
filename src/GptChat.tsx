import React, { useState } from "react";
import { askGpt4 } from "./openai";

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
    <div className="my-4 bg-white">
      <input
        className="border p-2 rounded w-full"
        value={input}
        onChange={e => setInput(e.target.value)}
        placeholder="Ask GPT-4 anything..."
      />
      <button
        className="mt-2 px-3 py-1 bg-blue-500 text-black rounded"
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