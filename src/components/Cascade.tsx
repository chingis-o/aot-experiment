import React, { useState } from "react";
import { useLllm } from "~/hooks/llm.hook";

import prompts from "../prompts/examples";
import QuestionBlock from "./QuestionBlock";

const { solve, contract1 } = prompts;

export default function Cascade({
  question,
  subquestions,
}: {
  question: any;
  subquestions: any;
}) {
  const [updatedQuestion, setUpdatedQuestion] = useState(question);

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
    <>
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
    </>
  );
}
