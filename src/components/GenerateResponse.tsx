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
        <div>{subquestion}</div>
        <Button
          className="my-2 cursor-pointer px-7 py-1"
          disabled={loading}
          onClick={generate}
        >
          Solve
        </Button>
        {error ? "Error occurred" : ""}
        <Result result={String(result)} />
        <Contract />
        {result && (
          <div className="my-4 w-full rounded-md border-2 border-blue-500 px-3 py-2">
            {String(result)}
          </div>
        )}
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
        <div>{subquestion}</div>
        <Button
          className="my-2 cursor-pointer px-7 py-1"
          disabled={loading}
          onClick={generate}
        >
          Contract
        </Button>
        {error ? "Error occurred" : ""}
        <div>Contract!!!</div>
        <Result result={String(result)} />
        {result && (
          <div className="my-4 w-full rounded-md border-2 border-blue-500 px-3 py-2">
            {String(result)}
          </div>
        )}
      </div>
    );
  }

  function handleThinkTag(text: string) {
    const matchBetweenTags = text.match(/<think>(.*?)<\/think>/i);
    const matchAfterTags = text.match(/<\/think>(.*)/i);

    return {
      thinking: matchBetweenTags ? matchBetweenTags[1] : "",
      result: matchAfterTags ? matchAfterTags[1] : "",
    };
  }

  function Result({ result }: { result: string }) {
    return (
      <>
        <Accordion
          type="single"
          className="my-2 w-full"
          collapsible
          defaultValue="item-1"
        >
          <AccordionItem value="item-1">
            <AccordionTrigger className="mb-1.5 bg-[#f7f8fc] px-2.5 py-2 font-medium">
              Thinking completed
            </AccordionTrigger>
            <AccordionContent className="p-1.5 text-[#8f91a8]">
              {handleThinkTag(result).thinking}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        <div>{handleThinkTag(result).result}</div>
      </>
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
      {/* <Button
        className="my-2 cursor-pointer px-7 py-1"
        disabled={loading}
        onClick={() => {
          parse("");
        }}
      >
        check
      </Button> */}
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
