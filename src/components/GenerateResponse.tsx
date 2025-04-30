import React, { useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import { useLllm } from "~/hooks/llm.hook";
import Result from "./Result";
import Cascade from "./Cascade";
import { parseDag } from "@/utils/parseDag";
import type { Chain } from "~/interfaces/chain";
import autoAnimate from "@formkit/auto-animate";

import prompts from "../prompts/examples";

const { solve } = prompts;

export default function GenerateResponse({
  prompt,
  question,
}: {
  prompt: string;
  question: string;
}) {
  const { generate, result, loading, error, abort } = useLllm();
  const [decomposition, setDecomposition] = useState<string | null>(null);
  const [decompositionComplete, setDecompositionComplete] =
    useState<boolean>(false);
  const [finalResult, setFinalResult] = useState<string | null>(null);
  const parent = useRef(null);

  useEffect(() => {
    parent.current && autoAnimate(parent.current);
  }, [parent]);

  useEffect(() => {
    if (result && !decompositionComplete) {
      setDecomposition(String(result));
    }
  }, [result]);

  const [chain, setChain] = useState<Chain[]>([]);

  async function handleClick() {
    setDecomposition(null);
    setFinalResult(null);
    setChain([]);
    setDecompositionComplete(false);

    try {
      const decomposed = await generate(prompt);

      setDecompositionComplete(true);

      const dag = parseDag(decomposed as string);

      if (!dag?.nodes || dag.nodes.length === 0) {
        console.warn("No nodes found in DAG");
        return;
      }

      const newChain: Chain[] = dag.nodes
        .map((node) => ({
          subquestion: node.description,
          result: "",
          contracted: "",
        }))
        .filter((item): item is Chain => Boolean(item.subquestion));

      if (newChain.length === 0) {
        console.warn("No valid subquestions were generated.");
        return;
      }

      setChain(newChain);

      for (let i = 0; i < newChain.length; i++) {
        const currentSubquestion = newChain[i]?.subquestion;

        if (!currentSubquestion) {
          console.warn(`Missing subquestion at index ${i}`);
          continue;
        }

        const solved = await generate(solve(question, currentSubquestion));

        setChain((prev) =>
          prev.map((item, idx) =>
            idx === i ? { ...item, result: String(solved) } : item,
          ),
        );
      }
    } catch (err) {
      console.error("Error during chain processing:", err);
    }
  }

  return (
    <div className="container grid justify-items-start" ref={parent}>
      <div className="my-2 flex w-full justify-end py-1">
        {loading ? (
          <Button onClick={() => abort()} type="reset">
            Cancel
          </Button>
        ) : (
          <Button onClick={handleClick}>Generate</Button>
        )}
      </div>
      {error ? "Error occurred" : ""}
      {decomposition && (
        <Result result={String(decomposition)} loading={loading} />
      )}
      <Cascade chain={chain} />
      {finalResult && <Result result={finalResult} loading={false} />}
    </div>
  );
}
