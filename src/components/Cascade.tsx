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
        <div className="my-3 w-full">
          <h3 className="mt-3 font-semibold">Subquestion</h3>
          <div className="mt-2">{question}</div>
          <Result result="<think>Tought process</think> Here subquestion answer" />
          <h3 className="mt-3 font-semibold">Contracted</h3>
          <Result result="<think>Tought process</think> Contracted question" />
        </div>
        <hr />
      </>
    );
  }

  return (
    <div className="my-3">
      <Button onClick={handleClick}>Init cascade of AoT</Button>
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
