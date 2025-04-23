import React, { useState } from "react";
import { Textarea } from "./ui/textarea";
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
import { parseDag, type DAG } from "@/utils/parseDag";

import prompts from "../prompts/examples";

const { label, solve, contract1 } = prompts;

export default function GenerateResponse({ question }: { question: string }) {
  const [prompt, setPrompt] = useState(label(question));
  const [subquestions, setSubquestions] = useState<DAG>();
  const { generate, result, loading, error, abort } = useLllm();

  // chain algorithm
  const [chain, setChain] = useState([
    { subquestion: "", result: "", contracted: "" },
  ]);

  async function handleClick() {
    const result = await generate(prompt);
    setSubquestions(parseDag(result as string));
  }

  async function handleChain() {}

  return (
    <div className="container grid justify-items-start">
      <Textarea
        className="mb-6"
        rows={10}
        onChange={(event) => setPrompt(event.target.value)}
        value={prompt}
      />
      <Button
        className="my-2 cursor-pointer px-7 py-1"
        disabled={loading}
        onClick={handleClick}
      >
        Generate
      </Button>
      <Button
        className="my-2 cursor-pointer px-7 py-1"
        onClick={() => abort()}
        type="reset"
      >
        Cancel
      </Button>
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
      <Cascade
        question={question}
        subquestions={subquestions}
        handleClick={handleChain}
      />
    </div>
  );
}
