import React, { useState } from "react";
import { Button } from "./ui/button";
import { useLllm } from "~/hooks/llm.hook";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Result from "./Result";
import Cascade from "./Cascade";
import { parseDag } from "@/utils/parseDag";
import type { Chain } from "~/interfaces/chain";

import prompts from "../prompts/examples";

const { solve, contract1 } = prompts;

export default function GenerateResponse({
  question,
  prompt,
}: {
  question: string;
  prompt: string;
}) {
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
    const result = await generate(prompt);
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
      const solved = await generate(
        solve("updatedQuestion", chain[0]?.subquestion ?? ""),
      );
      const constract = await generate(contract1("updatedQuestion"));
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
      {result && (
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger>Is it accessible?</AccordionTrigger>
            <AccordionContent>{String(result)}</AccordionContent>
          </AccordionItem>
        </Accordion>
      )}
      <Result result="<think>Tought process</think> Hello! How can I assist you today? 😊" />
      <Cascade chain={chain} />
    </div>
  );
}
