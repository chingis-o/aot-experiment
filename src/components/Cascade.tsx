import React, { useState } from "react";
import { useLllm } from "~/hooks/llm.hook";
import QuestionBlock from "./QuestionBlock";
import type { DAG, Subquestion } from "~/utils/parseDag";
import { Button } from "./ui/button";
import { handleThinkTag } from "~/utils/handleThinkTag";
import Result from "./Result";

import prompts from "../prompts/examples";

const { solve, contract1 } = prompts;

export default function Cascade({
  question,
  subquestions,
  handleClick,
}: {
  question: string;
  subquestions: DAG | undefined;
  handleClick: any;
}) {
  const [updatedQuestion, setUpdatedQuestion] = useState(question);

  function Subquestion({
    subquestion,
    updatedQuestion,
    setUpdatedQuestion,
  }: {
    subquestion: string;
    updatedQuestion: string;
    setUpdatedQuestion: React.Dispatch<React.SetStateAction<string>>;
  }) {
    const { generate, result, loading, error, abort } = useLllm();

    async function handleClick() {
      const result = await generate(solve(updatedQuestion, subquestion));
      setUpdatedQuestion(handleThinkTag(result as string).result ?? "");
    }

    return (
      <>
        <div className="grid grid-cols-[20px_1fr] text-sm">
          <div className="relative ml-1.5 w-[1px] translate-y-2 bg-slate-200">
            <div className="absolute top-0 right-1/2 h-1.5 w-1.5 translate-x-1/2 rounded-full bg-slate-200" />
          </div>
          <div className="pb-3">
            <h3 className="font-semibold">Subquestion</h3>
            <div className="mt-2">{question}</div>
            <Result result="<think>Tought process</think> Here subquestion answer" />
            <h4 className="mt-3 font-medium">Contracted</h4>
            <Result result="<think>Tought process</think> Contracted question" />
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="my-3">
      {/* <Button onClick={handleClick} >Init cascade of AoT</Button> */}
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
          {subquestions.nodes.map((subquestions: Subquestion) => {
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
