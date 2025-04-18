import type { MessageContent } from "@langchain/core/messages";
import React, { useEffect, useState } from "react";
import { ChatOllama } from "@langchain/ollama";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";

import prompts from "../prompts/examples";
import { useLllm } from "~/hooks/llm.hook";

const llm = new ChatOllama({
  model: "deepseek-r1:7b",
  temperature: 0,
});

type Subquestion = {
  description: string;
  answer?: string;
  depend: number[]; // Indices of dependent subquestions
};

type DAG = {
  nodes: Subquestion[];
  edges: [number, number][]; // Dependency edges between subquestions
};

// Categorize subquestions into independent and dependent
function categorizeSubquestions(dag: DAG | undefined): {
  independent: Subquestion[];
  dependent: Subquestion[];
} {
  if (dag) {
    return {
      independent: dag.nodes.filter((node) => node.depend.length === 0),
      dependent: dag.nodes.filter((node) => node.depend.length > 0),
    };
  }

  return {
    independent: [],
    dependent: [],
  };
}

// Contract the DAG into a new independent question
const contract = (
  independent: Subquestion[],
  dependent: Subquestion[],
): string => {
  const knownConditions = independent
    .map((q) => `${q.description}: ${q.answer}`)
    .join(", ");
  const newQuestion = `Given ${knownConditions}, solve: ${dependent.map((q) => q.description).join(", ")}`;
  return newQuestion;
};

// Evaluate whether the algorithm should terminate
const shouldTerminate = (currentQuestion: string): boolean =>
  currentQuestion.includes("final answer");

// Solve the final contracted question
const solveFinalQuestion = (finalQuestion: string): string =>
  `<answer>${finalQuestion.split(":").pop()}</answer>`;

export default function GenerateResponse({ question }: { question: string }) {
  const [prompt, setPrompt] = useState("");
  const [subquestions, setSubquestions] = useState<DAG>();
  const { generate, current, result, loading, error, abort } = useLllm({
    prompt,
  });
  const { label } = prompts;

  console.log(subquestions);

  useEffect(() => {
    setPrompt(label(question));
  }, [question]);

  useEffect(() => {
    if (result) {
      setSubquestions(parse(result as string));
    }
  }, [result]);

  console.log(result);

  function parse(plainText: string): DAG | undefined {
    // const plainText = localStorage.getItem("text") ?? "";

    const jsonBlockRegex = /``` json\s*({[\s\S]*?})\s* ```/;
    const jsonMatch = plainText.match(jsonBlockRegex);

    if (!jsonMatch) {
      console.log("JSON block not found in the input.");
      return undefined;
    }

    const jsonContent = jsonMatch[1];

    function formatSubquestions(input: any): Subquestion[] {
      return input[" sub Questions "].map((value: any) => {
        return {
          description: value[" description "].trim(),
          depend: value[" depend "],
        };
      });
    }

    const subquestions = formatSubquestions(JSON.parse(jsonContent ?? ""));

    const edges: [number, number][] = subquestions.flatMap((node, index) =>
      node.depend.map((depIndex) => [depIndex, index] as [number, number]),
    );

    console.log({ nodes: subquestions, edges });

    return { nodes: subquestions, edges };
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
      {current && (
        <div className="my-4 w-full rounded-md border-2 border-blue-500 px-3 py-2">
          {String(current)}
        </div>
      )}

      {/* {Array.isArray(subquestions?.nodes) ? (
        <ul>
          {subquestions.nodes((subquestions: any) => {
            return (
              <li key={subquestions.description}>{subquestions.description}</li>
            );
          })}
        </ul>
      ) : null} */}
    </div>
  );
}
