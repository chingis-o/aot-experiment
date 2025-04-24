import React, { useState } from "react";
import { Button } from "./ui/button";
import { useLllm } from "~/hooks/llm.hook";
import Result from "./Result";
import Cascade from "./Cascade";
import { parseDag } from "@/utils/parseDag";
import type { Chain } from "~/interfaces/chain";

import prompts from "../prompts/examples";

const { solve, contract1 } = prompts;

export default function GenerateResponse({ prompt }: { prompt: string }) {
  const { generate, result, loading, error, abort } = useLllm();

  const [chain, setChain] = useState<Chain[]>([
    {
      subquestion: "Janet’s ducks lay 16 eggs per day. ",
      result:
        "<think>Tought process</think> Hello! How can I assist you today? 😊",
      contracted: "contracted question",
    },
  ]);

  async function handleClick() {
    await generate(prompt);
    console.log(result);
    const dag = parseDag(result as string);

    if (dag?.nodes) {
      const subquestions = dag.nodes.map((value) => {
        return {
          subquestion: value.description,
          result: "",
          contracted: "",
        };
      });
      setChain(subquestions);
      console.log(chain);

      await generate(solve(prompt, chain[0]?.subquestion ?? ""));
      setChain((prev) => [
        {
          ...(prev[0] ?? {
            subquestion: "",
            result: "",
            contracted: "",
          }),
          result: String(result),
        },
        ...prev.slice(1, prev.length),
      ]);

      console.log(chain);

      await generate(contract1("updatedQuestion"));
      setChain((prev) => [
        {
          ...(prev[0] ?? {
            subquestion: "",
            result: "",
            contracted: "",
          }),
          contracted: String(result),
        },
        ...prev.slice(1, prev.length),
      ]);

      console.log(chain);
    }
  }

  return (
    <div className="container grid justify-items-start">
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
      {result && <Result result={String(result)} loading={loading} />}
      <Cascade chain={chain} />
    </div>
  );
}
