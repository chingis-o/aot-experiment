import { ChatOllama } from "@langchain/ollama";
import { useRef, useState } from "react";
import type { Chain } from "~/interfaces/chain";
import { parseDag } from "~/utils/parseDag";
import { solve, label } from "@/prompts/examples";

const llm = new ChatOllama({
  model: "deepseek-r1:7b",
  temperature: 0,
});

export function useLllm() {
  const [decomposed, setDecomposed] = useState("");
  const [chain, setChain] = useState<Chain[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const abortController = useRef(new AbortController());

  async function generate(question: string) {
    setLoading(true);
    setError(false);
    setDecomposed("");
    setChain([]);

    try {
      const stream = await llm.stream(label(question), {
        signal: abortController.current.signal,
      });

      let result = "";

      for await (const chunk of stream) {
        result = `${result}${chunk.content}`;
        setDecomposed(result);
      }

      const dag = parseDag(result as string);

      if (!dag?.nodes || dag.nodes.length === 0) {
        console.warn("No nodes found in DAG");
        return setLoading(false);
      }

      const subquestions = dag.nodes.map((node) => node.description);

      for (let i = 0; i < subquestions.length; i++) {
        const solutionStream = await llm.stream(
          solve(question, subquestions[i] ?? ""),
          {
            signal: abortController.current.signal,
          },
        );

        let solved = "";

        setChain((prev) => [
          ...prev,
          {
            subquestion: subquestions[i] ?? "",
            result: solved,
            contracted: "",
          },
        ]);

        for await (const chunk of solutionStream) {
          solved = `${solved}${chunk.content}`;
          setChain((prev) =>
            prev.map((item, index) => {
              return index === i
                ? { ...item, result: solved, loading: true }
                : item;
            }),
          );
        }
      }
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

  return { generate, decomposed, loading, error, abort, chain };
}
