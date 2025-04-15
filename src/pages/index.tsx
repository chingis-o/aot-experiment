import Head from "next/head";
import { useEffect, useState } from "react";
import { ChatOllama } from "@langchain/ollama";
import type { MessageContent } from "@langchain/core/messages";
import gsm8k from "../data/gsm8k/test.json";
import prompts from "../prompts/examples";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

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

export default function Home() {
  // can be improved
  const [dataset, setDataset] = useState(gsm8k);
  const [page, setPage] = useState(1);
  const [pageRange, setPageRange] = useState([0, 10]);
  const { direct } = prompts;

  function GenerateResponse({ question }: { question: string }) {
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

  function Question({ index, data }: { index: number; data: any }) {
    const [open, setOpen] = useState(false);

    return (
      <>
        <li key={index} className="flex gap-2.5">
          {index + 1} ) {data && data?.input}
          {data && data?.question}
          {data && data?.Question}
          {data && data?.problem}
          <Button
            variant="outline"
            className="cursor-pointer justify-self-end p-1"
            onClick={() => setOpen((prev) => !prev)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              className="lucide lucide-clipboard"
            >
              <rect width="8" height="4" x="8" y="2" rx="1" ry="1"></rect>
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
            </svg>
          </Button>
        </li>
        <hr />
        <li key={index}>
          Correct answer: {data && data?.target}
          {data && data?.answer}
          {data && data?.problem}
          {data && data?.Answer}
        </li>
        <hr />
        {open && <GenerateResponse question={data?.input} />}
      </>
    );
  }

  return (
    <>
      <Head>
        <title>AoT experiment</title>
        <meta name="description" content="AoT app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="my-10 flex min-h-screen flex-col items-center justify-center">
        <div className="container grid max-w-2/3 justify-start">
          <ul className="my-5 flex justify-start gap-2.5">
            <li>
              <Button className="cursor-pointer">gsm8k</Button>
            </li>
          </ul>
          <ul className="my-5 grid gap-2.5">
            {Array.isArray(dataset)
              ? dataset.slice(0, 10).map((data, index) => {
                  return <Question index={index} data={data} />;
                })
              : null}
          </ul>
          <Pagination className="mb-10">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  className="cursor-pointer"
                  onClick={() =>
                    setPageRange((prev) => {
                      return [
                        prev[0] ? (prev[0] - 10 > 0 ? prev[0] - 10 : 0) : 0,
                        prev[1] ? (prev[1] - 10 > 10 ? prev[1] - 10 : 10) : 10,
                      ];
                    })
                  }
                />
              </PaginationItem>
              {Array.isArray(dataset)
                ? Array.from({ length: Math.ceil(dataset?.length / 10) })
                    .slice(...pageRange)
                    .map((_, index) => (
                      <PaginationItem
                        onClick={() => setPage(index + 1)}
                        key={index}
                        className="cursor-pointer"
                      >
                        <PaginationLink isActive={page === index + 1}>
                          {index + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))
                : null}
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
              <PaginationItem>
                <PaginationNext
                  className="cursor-pointer"
                  onClick={() =>
                    Array.isArray(dataset) &&
                    setPageRange((prev) => {
                      return [
                        prev[0] !== undefined &&
                        prev[0] < Math.ceil(dataset?.length / 10)
                          ? 0
                          : 0,
                        prev[1]
                          ? prev[1] + 10 < Math.ceil(dataset?.length / 10)
                            ? prev[1] + 10
                            : 10
                          : 10,
                      ];
                    })
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </main>
    </>
  );
}
