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
import { type DAG } from "@/utils/parseDag";

import prompts from "../prompts/examples";
import Result from "./Result";
import QuestionBlock from "./QuestionBlock";

const { label, solve, contract1 } = prompts;

export default function GenerateResponse({ question }: { question: string }) {
  const [prompt, setPrompt] = useState(label(question));
  const [updatedQuestion, setUpdatedQuestion] = useState(question);
  const [subquestions, setSubquestions] = useState<DAG>();
  const { generate, result, loading, error, abort } = useLllm({
    prompt,
    setSubquestions,
  });

  function Subquestion({
    subquestion,
    updatedQuestion,
    setUpdatedQuestion,
  }: {
    subquestion: string;
    updatedQuestion: string;
    setUpdatedQuestion: any;
  }) {
    const { generate, result, loading, error, abort } = useLllm({
      prompt: solve(updatedQuestion, subquestion),
    });

    return (
      <div className="my-3 w-full">
        <QuestionBlock
          question={subquestion}
          loading={loading}
          generate={generate}
          abort={abort}
          error={error}
          result={result}
        />
        <Contract />
      </div>
    );
  }

  function Contract({
    subquestion,
    updatedQuestion,
    setUpdatedQuestion,
  }: {
    subquestion?: string;
    updatedQuestion?: string;
    setUpdatedQuestion?: any;
  }) {
    const { generate, result, loading, error, abort } = useLllm({
      prompt: contract1(updatedQuestion, subquestion),
    });

    return (
      <div>
        <QuestionBlock
          question={subquestion ?? ""}
          loading={loading}
          generate={generate}
          abort={abort}
          error={error}
          result={result}
        />
      </div>
    );
  }

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
        onClick={generate}
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
      {[{ description: "A" }, { description: "B" }, { description: "C" }].map(
        (subquestions: any) => {
          return (
            <Subquestion
              key={subquestions.description}
              updatedQuestion={updatedQuestion}
              setUpdatedQuestion={setUpdatedQuestion}
              subquestion={subquestions.description}
            />
          );
        },
      )}
      {Array.isArray(subquestions?.nodes) ? (
        <ul>
          {subquestions.nodes.map((subquestions: any) => {
            return (
              <Subquestion
                key={subquestions.description}
                updatedQuestion={updatedQuestion}
                setUpdatedQuestion={setUpdatedQuestion}
                subquestion={subquestions.description}
              />
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
