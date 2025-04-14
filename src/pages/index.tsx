import Head from "next/head";
import { useEffect, useState } from "react";
import { ChatOllama } from "@langchain/ollama";
import type { MessageContent } from "@langchain/core/messages";
import bbh from "../data/bbh/test.json";
import gsm8k from "../data/gsm8k/test.json";
import hotpotqa from "../data/hotpotqa/test.json";
import longbench from "../data/longbench/test.json";
import math from "../data/math/test.json";
import mmlu from "../data/mmlu/test.json";
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

interface Test {
  name: string;
  dataset: any[];
}

// TODO handle various dataset schemas
const tests: Test[] = [
  { name: "bbh", dataset: bbh },
  { name: "gsm8k", dataset: gsm8k },
  // { name: "hotpotqa", dataset: [...hotpotqa] },
  // { name: "longbench", dataset: [...longbench] },
  { name: "math", dataset: math },
  { name: "mmlu", dataset: mmlu },
];

export default function Home() {
  // can be improved
  const [dataset, setDataset] = useState(
    tests.find((value) => value.name === "bbh")?.dataset,
  );
  const [page, setPage] = useState(1);
  const [pageRange, setPageRange] = useState([0, 10]);
  const { direct } = prompts;

  // TODO aot algorithm
  // TODO copy text or insert text +
  // TODO fix pagination
  // TODO compact display of questions
  // TODO insert question into method template +

  function GenerateResponse({ question }: { question: string }) {
    const [prompt, setPrompt] = useState("");
    const [result, setResult] = useState<MessageContent>();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);

    useEffect(() => {
      setPrompt(direct(question));
    }, [question]);

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
          onClick={async () => {
            setLoading(true);
            setError(false);
            setResult("");
            try {
              const stream = await llm.stream(prompt);
              for await (const chunk of stream) {
                setResult((prev) => `${prev} ${chunk.content}`); // Print each chunk as it arrives
              }
            } catch (error) {
              setError(true);
              console.log(error);
            }
            setLoading(false);
          }}
        >
          Generate
        </Button>
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
            {tests.map((data, index) => {
              return (
                <li
                  key={index}
                  onClick={() =>
                    setDataset(
                      tests.find((value) => value.name === data.name)?.dataset,
                    )
                  }
                >
                  <Button className="cursor-pointer">
                    {data.name} {data.dataset.length}
                  </Button>
                </li>
              );
            })}
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
