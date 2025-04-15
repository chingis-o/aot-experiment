import type { MessageContent } from "@langchain/core/messages";
import React, { useEffect, useState } from "react";

import prompts from "../prompts/examples";
import { ChatOllama } from "@langchain/ollama";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";

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

// Decompose the current question into a dependency-based DAG
const decompose = (question: string): DAG => {
  // Simulate LLM invocation to generate subquestions and dependencies
  const { label } = prompts;
  label(question);

  const subquestions: Subquestion[] = [
    { description: "What are the known values?", depend: [] },
    { description: "Find cos B using sin B.", depend: [0] },
    { description: "Use the Law of Cosines to find BC.", depend: [1] },
  ];

  const edges: [number, number][] = subquestions.flatMap((node, index) =>
    node.depend.map((depIndex) => [depIndex, index] as [number, number]),
  );

  return { nodes: subquestions, edges };
};

// Categorize subquestions into independent and dependent
const categorizeSubquestions = (
  dag: DAG,
): { independent: Subquestion[]; dependent: Subquestion[] } => ({
  independent: dag.nodes.filter((node) => node.depend.length === 0),
  dependent: dag.nodes.filter((node) => node.depend.length > 0),
});

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

// Main AOT function implemented in a functional style
const atomOfThoughts = (initialQuestion: string): string => {
  const iterate = (
    question: string,
    iteration: number,
    maxDepth: number | null,
  ): string => {
    if (maxDepth !== null && iteration >= maxDepth) {
      return solveFinalQuestion(question);
    }

    // Step 1: Decompose the current question into a DAG
    const dag = decompose(question);

    // Determine the maximum depth if not already set
    const updatedMaxDepth = maxDepth ?? dag.nodes.length;

    // Step 2: Categorize subquestions
    const { independent, dependent } = categorizeSubquestions(dag);

    // Step 3: Contract the DAG into a new independent question
    const nextQuestion = contract(independent, dependent);

    // Termination check
    if (shouldTerminate(nextQuestion)) {
      return solveFinalQuestion(nextQuestion);
    }

    // Recursive call for the next iteration
    return iterate(nextQuestion, iteration + 1, updatedMaxDepth);
  };

  return iterate(initialQuestion, 0, null);
};

export default function GenerateResponse({ question }: { question: string }) {
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState<MessageContent>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const { label } = prompts;

  useEffect(() => {
    // setPrompt(direct(question));
    setPrompt(label(question));
  }, [question]);

  async function generate() {
    setLoading(true);
    setError(false);
    setResult("");
    try {
      const stream = await llm.stream(prompt);
      for await (const chunk of stream) {
        setResult((prev) => `${prev} ${chunk.content}`);
      }
    } catch (error) {
      setError(true);
      console.log(error);
    }
    setLoading(false);
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
        className="cursor-pointer px-7 py-1"
        disabled={loading}
        onClick={generate}
      >
        Generate
      </Button>
      <Button
        onClick={() => {
          const finalAnswer = atomOfThoughts(question);
          setResult(finalAnswer);
        }}
      ></Button>
      {error ? "Error occurred" : ""}
      <div className="my-4 w-full rounded-md border-2 border-blue-500 px-3 py-2">
        {String(result ?? "")}
      </div>
    </div>
  );
}
