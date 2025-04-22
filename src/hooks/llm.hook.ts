import type { MessageContent } from "@langchain/core/messages";
import { ChatOllama } from "@langchain/ollama";
import { useState } from "react";
import { parseDag, type DAG } from "~/utils/parseDag";

const llm = new ChatOllama({
  model: "deepseek-r1:7b",
  temperature: 0,
});

const abortController = new AbortController();

export function useLllm({
  prompt,
  setSubquestions,
}: {
  prompt: string;
  setSubquestions?: React.Dispatch<React.SetStateAction<DAG | undefined>>;
}) {
  const [result, setResult] = useState<MessageContent>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  async function generate() {
    setLoading(true);
    setError(false);
    setResult("");

    try {
      const stream = await llm.stream(prompt, {
        signal: abortController.signal,
      });

      for await (const chunk of stream) {
        setResult((prev) => `${prev}${chunk.content}`);
      }

      if (setSubquestions) {
        setSubquestions(parseDag(result as string));
      }
    } catch (error) {
      setError(true);
      console.log(error);
    }

    setLoading(false);
  }

  function abort() {
    console.log("abort generation");
    return abortController.abort();
  }

  return { generate, result, loading, error, abort };
}
