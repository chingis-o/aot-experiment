import React, { useState } from "react";
import { useLllm } from "~/hooks/llm.hook";
import QuestionBlock from "./QuestionBlock";
import type { DAG, Subquestion } from "~/utils/parseDag";
import { Button } from "./ui/button";
import { handleThinkTag } from "~/utils/handleThinkTag";

import prompts from "../prompts/examples";

const { solve, contract1 } = prompts;

export default function Cascade({
  question,
  subquestions,
}: {
  question: string;
  subquestions: DAG | undefined;
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
      <div className="my-3 w-full">
        <QuestionBlock
          question={subquestion}
          loading={loading}
          generate={handleClick}
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
    const { generate, result, loading, error, abort } = useLllm();

    return (
      <div>
        <QuestionBlock
          question={subquestion ?? ""}
          loading={loading}
          generate={async () =>
            await generate(contract1(updatedQuestion, subquestion))
          }
          abort={abort}
          error={error}
          result={result}
        />
      </div>
    );
  }

  const { generate, result, loading, error, abort } = useLllm();

  function a() {
    return;
  }

  function handleClick() {
    if (!subquestions) return [];

    return subquestions.nodes.map((subquestions: Subquestion) => {});
  }

  return (
    <>
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
    </>
  );
}
