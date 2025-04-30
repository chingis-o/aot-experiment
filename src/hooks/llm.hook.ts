import type { MessageContent } from "@langchain/core/messages";
import { ChatOllama } from "@langchain/ollama";
import { useRef, useState } from "react";

const llm = new ChatOllama({
  model: "deepseek-r1:7b",
  temperature: 0,
});

export function useLllm() {
  const [result, setResult] = useState<MessageContent>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const abortController = useRef(new AbortController());

  async function generate(prompt: string) {
    setLoading(true);
    setError(false);
    setResult("");
    let fullResult = "";

    try {
      const stream = await llm.stream(prompt, {
        signal: abortController.current.signal,
      });

      for await (const chunk of stream) {
        fullResult += chunk.content;
        setResult((prev) => `${prev}${chunk.content}`);
      }

      return fullResult;
    } catch (error) {
      setError(true);
      console.log(error);
    }

    setLoading(false);
  }

  function abort() {
    console.log("abort generation");
    abortController.current.abort();
    abortController.current = new AbortController();
  }

  return { generate, result, loading, error, abort };
}
